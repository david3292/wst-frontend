import { switchMap, switchMapTo } from 'rxjs/operators';
import { ConfiguracionUsuarioPerfil } from './../../../../_dominio/sistema/configuracionUsuarioPerfil';
import { PuntoVenta } from './../../../../_dominio/sistema/puntoVenta';
import { Component, Input, OnInit } from '@angular/core';
import { UsuarioPerfilService } from 'src/app/_servicio/sistema/usuario-perfil.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaService } from 'src/app/_servicio/sistema/punto-venta.service';
import { forkJoin, Observable } from 'rxjs';
import { Perfil } from 'src/app/_dominio/sistema/perfil';
import { ConfiguracionUsuarioPerfilService } from 'src/app/_servicio/sistema/configuracion-usuario-perfil.service';
import { UsuarioPerfil } from 'src/app/_dominio/sistema/usuarioPerfil';
import { numberSymbols } from '@progress/kendo-angular-intl';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { PermisosDialogoComponent } from '../permisos-dialogo/permisos-dialogo.component';
import { BodegasDialogoComponent } from '../bodegas-dialogo/bodegas-dialogo.component';

@Component({
    selector: 'app-usuario-config-perfil',
    templateUrl: './usuario-config-perfil.component.html',
    styleUrls: ['./usuario-config-perfil.component.scss']
})
export class UsuarioConfigPerfilComponent implements OnInit {

    private ASIGNAR_PUNTO_VENTA: string = "ASIGNAR_PUNTO_VENTA";
    private QUITAR_PUNTO_VENTA: string = "QUITAR_PUNTO_VENTA";

    @Input()
    idUsuario: number;

    perfilesAsignados: any[];
    puntosVenta: any[];
    perfilSeleccionado: any;
    puntoVentaSeleccionado: PuntoVenta;
    configuracionesUsuarioPerfil: ConfiguracionUsuarioPerfil[];
    configUsuarioPerfilSeleccionado: ConfiguracionUsuarioPerfil;

    constructor(private usuarioPerfilService: UsuarioPerfilService,
        private notificarService: NotificarService,
        private puntoVentaService: PuntoVentaService,
        private configuracionUsuarioPerfilService: ConfiguracionUsuarioPerfilService,
        private dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this.setearListas().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.perfilesAsignados = this.cargarListaPerfilesCombo(data[0]);
            this.puntosVenta = data[1];
        })

        this.configuracionUsuarioPerfilService.configuracionUsuarioPerfilCambio.subscribe(data => {
            this.configuracionesUsuarioPerfil = data;
        })
    }

    setearListas(): Observable<any[]> {
        let perfilesAsignados = this.usuarioPerfilService.listarPorUsuario(this.idUsuario);
        let puntoVentas = this.puntoVentaService.listarTodosActivos();
        return forkJoin([perfilesAsignados, puntoVentas]);
    }

    changeValuePerfil(value) {
        this.cargarConfiguracionesPorPerfil(value.idUsuarioPerfil);
    }

    preAsignarPuntoVenta() {
        this.mostrarConfirmation("Confirmación", `¿ Está seguro de asignar el Punto de Venta: ${this.puntoVentaSeleccionado.nombre} al Perfil: ${this.perfilSeleccionado.nombrePerfil} ?`, this.ASIGNAR_PUNTO_VENTA);
    }

    asignarPuntoVenta() {
        let configuracionUsuarioPerfil = new ConfiguracionUsuarioPerfil();
        configuracionUsuarioPerfil.puntoVenta = this.puntoVentaSeleccionado;
        let usuarioPerfil = new UsuarioPerfil();
        usuarioPerfil.id = this.perfilSeleccionado.idUsuarioPerfil;
        let perfil = new Perfil();
        perfil.id = this.perfilSeleccionado.idPerfil;
        perfil.nombre = this.perfilSeleccionado.nombrePerfil;
        configuracionUsuarioPerfil.usuarioPerfil = usuarioPerfil;
        configuracionUsuarioPerfil.usuarioPerfil.perfil = perfil;
        this.configuracionUsuarioPerfilService.registrar(configuracionUsuarioPerfil).pipe(switchMap(() => {
            return this.configuracionUsuarioPerfilService.listarPorUsuarioPerfil(this.perfilSeleccionado.idUsuarioPerfil);
        })).subscribe(data => {
            this.configuracionesUsuarioPerfil = data;
            this.notificarMensaje(false, 'Punto Venta asignado al perfil');
        })
    }

    preQuitarPuntoVenta(valor: ConfiguracionUsuarioPerfil) {
        this.configUsuarioPerfilSeleccionado = valor;
        this.mostrarConfirmation("Confirmación", `¿ Está seguro de quitar el Punto de Venta: ${valor.puntoVenta.nombre} del Perfil: ${valor.usuarioPerfil.perfil.nombre}
        y eliminar su configuración ?`, this.QUITAR_PUNTO_VENTA);
    }

    quitarPuntoVenta() {
        this.configuracionUsuarioPerfilService.eliminar(this.configUsuarioPerfilSeleccionado.id).pipe(switchMap(() => {
            return this.configuracionUsuarioPerfilService.listarPorUsuarioPerfil(this.perfilSeleccionado.idUsuarioPerfil);
        })).subscribe(data => {
            this.configuracionesUsuarioPerfil = data;
            this.notificarMensaje(false, 'Punto Venta y configuración eliminada');
        })
    }

    cargarListaPerfilesCombo(usuarioPerfiles: UsuarioPerfil[]) {
        let lista: any[] = [];
        usuarioPerfiles.map((x) => {
            let perfil = { idPerfil: 0, idUsuarioPerfil: 0, nombrePerfil: '' };
            perfil.idPerfil = x.perfil.id;
            perfil.idUsuarioPerfil = x.id;
            perfil.nombrePerfil = x.perfil.nombre;
            lista.push(perfil);
        });
        return lista;
    }

    cargarConfiguracionesPorPerfil(idUsuarioPerfil: number) {
        this.configuracionUsuarioPerfilService.listarPorUsuarioPerfil(idUsuarioPerfil).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.configuracionesUsuarioPerfil = data;
        })
    }

    abrirPermisosDialogo(configuracion: ConfiguracionUsuarioPerfil) {
        const dialogRef = this.dialogService.open({
            title: 'Permisos',
            minWidth: 300,
            maxWidth: 500,
            content: PermisosDialogoComponent,
        });
        const contentPermisos = dialogRef.content.instance;
        contentPermisos.configInfo = configuracion;
    }

    abrirBodegasDialogo(configuracion?: ConfiguracionUsuarioPerfil) {
        const dialogRef = this.dialogService.open({
            title: 'Acceso Bodega',
            minWidth: 300,
            maxWidth: 500,
            content: BodegasDialogoComponent,
        });
        const contentPermisos = dialogRef.content.instance;
        contentPermisos.configInfo = configuracion;
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    determinarBotonesVisualizar() {
        let nombre: string = this.perfilSeleccionado.nombrePerfil;
        switch (nombre) {
            case 'VENDEDOR':
                return true;
            case 'SUPERADMIN':
                return true;
            case 'JEFE BODEGA':
                return true;
            default:
                return false;;
        }
    }

    mostrarConfirmation(titulo: string, mensaje: string, opcionEjecutar: string) {
        const dialog: DialogRef = this.dialogService.open({
            title: titulo,
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.puntoVentaSeleccionado = null;
            } else {

            }
            if (result['text'] == 'Sí') {
                switch (opcionEjecutar) {
                    case this.ASIGNAR_PUNTO_VENTA:
                        this.asignarPuntoVenta();
                        break;
                    case this.QUITAR_PUNTO_VENTA:
                        this.quitarPuntoVenta();
                        break;
                }
            }

            if (result['text'] == 'No') {
                this.puntoVentaSeleccionado = null;
                this.configUsuarioPerfilSeleccionado = null;
            }
        });
    }

}
