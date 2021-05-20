import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionCompra } from 'src/app/_dominio/ventas/recepcionCompra';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-recepciones-detalle-dialogo',
    templateUrl: './recepciones-detalle-dialogo.component.html',
    styleUrls: ['./recepciones-detalle-dialogo.component.scss']
})
export class RecepcionesDetalleDialogoComponent implements OnInit {

    @Input()
    public recepcionesCompra: RecepcionCompra[];

    private recepcionCompraSeleccionada: RecepcionCompra;

    constructor(
        private _router: Router,
        private _comprasService: ComprasService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
    }

    crearNuevaRecepcion(){
        let existeNuevo = _.filter(this.recepcionesCompra, (r) => {
            return r.estado === 'NUEVO' || r.estado === 'ERROR_RECEPCION';
        }).length;
        if(existeNuevo > 0){
            this._notificarService.mostrarMensajeError('Tiene recepciones pendientes de revisión');
        }else{
            let ordenCompraId = _.first(this.recepcionesCompra).ordenCompra.id;
            this._comprasService.crearNuevaRecepcionCompra(ordenCompraId).subscribe(data => {
                this._router.navigate([`/compras/recepcion/${data.id}`]);
            });
        }
    }

    cargarRecepcionCompra(dataItem: RecepcionCompra){
        this._router.navigate([`/compras/recepcion/${dataItem.id}`]);
    }

    generarRecepcionCompraPdf(recepcionCompra: RecepcionCompra){
        this.recepcionCompraSeleccionada = recepcionCompra;
        this._comprasService.generarReporteRecepcionCompra(recepcionCompra.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `RecepcionCompra_${this.recepcionCompraSeleccionada.numeroRecepcion}`;
            a.click();
        });
    }
}
