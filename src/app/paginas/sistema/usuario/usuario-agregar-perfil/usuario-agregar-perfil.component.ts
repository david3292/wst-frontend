import { UsuarioPerfil } from 'src/app/_dominio/sistema/usuarioPerfil';
import { Perfil } from 'src/app/_dominio/sistema/perfil';
import { Component, Input, OnInit } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { UsuarioPerfilService } from 'src/app/_servicio/sistema/usuario-perfil.service';
import { PerfilService } from 'src/app/_servicio/sistema/perfil.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-usuario-agregar-perfil',
    templateUrl: './usuario-agregar-perfil.component.html',
    styleUrls: ['./usuario-agregar-perfil.component.scss']
})
export class UsuarioAgregarPerfilComponent implements OnInit {

    private ASIGNAR_PERFIL: string = "ASIGNAR_PERFIL";
    private QUITAR_PERFIL: string = "QUITAR_PERFIL";

    @Input()
    idUsuario: number;

    public perfilSeleccionado: Perfil;
    public selectedValuePerfil: Perfil;
    private usuarioPerfilSeleccionado: UsuarioPerfil;
    public perfilesAsignados: any[];
    perfiles: any[];
    public codigosVendedorCatalogo: any[] = [];
    public codigoVendedorSeleccionado: any;
    public mostrarSeleccionCodigoVendedor: boolean = false;

    constructor(private usuarioPerfilService: UsuarioPerfilService,
        private perfilService: PerfilService,
        private notificarService: NotificarService,
        private dialogService: DialogService) { }

    ngOnInit(): void {

        this.perfilService.listarTodos().subscribe(data => {
            this.perfiles = data;
            this.notificarService.loadingCambio.next(false);
        })

        this.usuarioPerfilService.listarCodigoVendedoresGP().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.codigosVendedorCatalogo = data;
        })

        this.usuarioPerfilService.listarPorUsuario(this.idUsuario).subscribe(data => {
            this.perfilesAsignados = data;
            this.notificarService.loadingCambio.next(false);
        })

    }

    preAsignarPerfil() {
        this.mostrarConfirmation('Confirmación', `¿ Está seguro de agregar el Perfil  ${this.selectedValuePerfil.nombre} ?`, this.ASIGNAR_PERFIL);
    }
    preQuitarPerfil(valor: UsuarioPerfil) {
        this.usuarioPerfilSeleccionado = valor;
        this.mostrarConfirmation('Confirmación', `¿ Está seguro de quitar el Perfil  ${valor.perfil.nombre} y eliminar toda su configuración ?`, this.QUITAR_PERFIL);
    }

    asignarPerfil() {
        let usuarioPerfil = new UsuarioPerfil();
        let usuario = new Usuario();
        usuario.id = this.idUsuario;
        usuarioPerfil.usuario = usuario;
        usuarioPerfil.perfil = this.selectedValuePerfil;
        usuarioPerfil.codigoVendedor = this.codigoVendedorSeleccionado;
        this.usuarioPerfilService.registrar(usuarioPerfil).pipe(switchMap(() => {
            return this.usuarioPerfilService.listarPorUsuario(this.idUsuario);
        })).subscribe(data => {
            this.perfilesAsignados = data;
            this.selectedValuePerfil = null;
            this.notificarMensaje(false, 'Perfil Asignado');
        })
    }

    quitarPerfil() {

        this.usuarioPerfilService.eliminar(this.usuarioPerfilSeleccionado.id).pipe(switchMap(() => {
            return this.usuarioPerfilService.listarPorUsuario(this.idUsuario);
        })).subscribe(data => {
            this.notificarMensaje(false, 'Perfil y configuración  Eliminado');
            this.usuarioPerfilSeleccionado = null;
            this.perfilesAsignados = data;
        })
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(loading);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    mostrarConfirmation(titulo: string, mensaje: string, opcionEjecutar: string) {
        const dialog1: DialogRef = this.dialogService.open({
            title: titulo,
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            minWidth: 250
        });

        dialog1.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.selectedValuePerfil = null;
            } else {
            }
            if (result['text'] == 'Sí') {
                switch (opcionEjecutar) {
                    case this.ASIGNAR_PERFIL:
                        this.asignarPerfil();
                        break;
                    case this.QUITAR_PERFIL:
                        this.quitarPerfil();
                        break;
                }
            }

            if (result['text'] == 'No') {
                this.selectedValuePerfil = null;
                this.usuarioPerfilSeleccionado = null;
            }
        });
    }

    public changeValuePerfil(valor: Perfil) {
        switch (valor.nombre) {
            case 'VENDEDOR':
                this.mostrarSeleccionCodigoVendedor = true;
                break;
            default:
                this.mostrarSeleccionCodigoVendedor = false;
                this.codigoVendedorSeleccionado = null;
                break;
        }
    }

    public habilitarAsignar() {
        if (this.mostrarSeleccionCodigoVendedor) {
            if (this.selectedValuePerfil == null || this.codigoVendedorSeleccionado == null) {
                return true;
            }
            return false;

        } else {
            if (this.selectedValuePerfil == null) {
                return true;
            }
            return false;
        }
    }

}
