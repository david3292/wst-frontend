import { map } from 'rxjs/operators';
import { AsignacionBodega } from './../../../../_dominio/sistema/asignacionBodega';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { AsignacionBodegaService } from 'src/app/_servicio/sistema/asignacion-bodega.service';

@Component({
    selector: 'app-bodegas-dialogo',
    templateUrl: './bodegas-dialogo.component.html',
    styleUrls: ['./bodegas-dialogo.component.scss']
})
export class BodegasDialogoComponent implements OnInit {

    @Input()
    public configInfo: any;
    public asignacionesBodega: AsignacionBodega[];

    public accesosBodega = new FormArray([]);

    constructor(public dialog: DialogRef,
        private fb: FormBuilder,
        private notificarService: NotificarService,
        private asignacionBodegaService: AsignacionBodegaService) { }

    ngOnInit(): void {

        this.asignacionBodegaService.listarPorConfiguracionUsuarioPerfil(this.configInfo).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.asignacionesBodega = data;
            this.inicializarFormulario();
        })
    }

    inicializarFormulario() {
        this.asignacionesBodega.map(x => {
            const group = new FormGroup({
                id: new FormControl(x.id),
                bodega: new FormControl(x.bodega.id),
                configuracionPerfil: new FormControl(x.configuracionUsuarioPerfil.id),
                acceso: new FormControl(x.acceso),
                nombreBodega: new FormControl(x.bodega.descripcion),
            });

            this.accesosBodega.push(group);
        })
    }

    guardar() {
        const accesos: AsignacionBodega[] = [];
        this.asignacionesBodega.map(x => {
            let valor = this.obtenerValorFormArray(x.bodega.id);
            x.acceso = valor == null ? x.acceso : valor;
            accesos.push(x);
        })
        this.asignacionBodegaService.modificarAccesoBodegas(accesos).subscribe(data => {
            this.asignacionesBodega = data;
            this.inicializarFormulario();
            this.cerrarDialogo()
            this.notificarMensaje(false, 'Acceso a Bodegas Modificados')
        })
    }

    imprimirLabel(valor: FormGroup) {
        return valor.value['nombreBodega']
    }

    obtenerValorFormArray(idBodega: number) {
        let valor: boolean = null;
        this.accesosBodega.value.map(x => {
            if (x['bodega'] == idBodega) {
                valor = x['acceso'];
            }
        })
        return valor;
    }

    cerrarDialogo() {
        this.dialog.close();
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

}
