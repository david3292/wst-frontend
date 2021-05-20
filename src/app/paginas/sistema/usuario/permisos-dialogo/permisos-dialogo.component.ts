import { switchMap } from 'rxjs/operators';
import { ConfiguracionUsuarioPerfil } from './../../../../_dominio/sistema/configuracionUsuarioPerfil';
import { Component, Input, OnInit, ɵConsole } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { ConfiguracionUsuarioPerfilService } from 'src/app/_servicio/sistema/configuracion-usuario-perfil.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-permisos-dialogo',
    templateUrl: './permisos-dialogo.component.html',
    styleUrls: ['./permisos-dialogo.component.scss']
})
export class PermisosDialogoComponent implements OnInit {

    @Input()
    public configInfo: any;

    public form = new FormGroup({
        'id': new FormControl(0),
        'editarCondicionPago': new FormControl(false),
        'editarDescuentoAdicional': new FormControl(false),
        'editarPorcentajeAnticipo': new FormControl(false)
    });

    constructor(public dialog: DialogRef,
        private configuracionUsuarioPerfilService: ConfiguracionUsuarioPerfilService,
        private notificarService: NotificarService) {
    }

    ngOnInit(): void {
        this.inicializarFormulario(this.configInfo);
    }

    inicializarFormulario(configuracion: any) {
        this.form = new FormGroup({
            'id': new FormControl(0),
            'editarCondicionPago': new FormControl(configuracion.editarCondicionPago),
            'editarDescuentoAdicional': new FormControl(configuracion.editarDescuentoAdicional),
            'editarPorcentajeAnticipo': new FormControl(configuracion.editarPorcentajeAnticipo),
            'editarDescripcionArticulo': new FormControl(configuracion.editarDescripcionArticulo),
            'editarPrecioArticulo': new FormControl(configuracion.editarPrecioArticulo),
            'editarDescuentoFijo': new FormControl(configuracion.editarDescuentoFijo),
        });
    }

    guardarPermisos() {
        const config = new ConfiguracionUsuarioPerfil();
        config.id = this.configInfo.id;
        config.editarCondicionPago = this.form.value['editarCondicionPago'];
        config.editarDescuentoAdicional = this.form.value['editarDescuentoAdicional'];
        config.editarPorcentajeAnticipo = this.form.value['editarPorcentajeAnticipo'];
        config.editarDescripcionArticulo = this.form.value['editarDescripcionArticulo'];
        config.editarPrecioArticulo = this.form.value['editarPrecioArticulo'];
        config.editarDescuentoFijo = this.form.value['editarDescuentoFijo'];
        config.puntoVenta = this.configInfo.puntoVenta;
        config.usuarioPerfil = this.configInfo.usuarioPerfil;
        this.configuracionUsuarioPerfilService.modificar(config).pipe(switchMap(() => {
            return this.configuracionUsuarioPerfilService.listarPorUsuarioPerfil(this.configInfo.usuarioPerfil.id);
        })).subscribe(data => {
            this.configuracionUsuarioPerfilService.configuracionUsuarioPerfilCambio.next(data);
            this.cerrarDialogo();
            this.notificarMensaje(false,'Permisos Actualizados');
        })
    }

    cerrarDialogo() {
        this.dialog.close();
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

}
