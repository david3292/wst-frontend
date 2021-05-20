import { CargoService } from './../../../../_servicio/sistema/cargo.service';
import { AreaService } from './../../../../_servicio/sistema/area.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { UsuarioLdapService } from './../../../../_servicio/usuario-ldap.service';
import { Component, Input, OnInit, ɵConsole } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UsuarioService } from 'src/app/_servicio/sistema/usuario.service';
import { switchMap, switchMapTo } from 'rxjs/operators';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { forkJoin, Observable } from 'rxjs';

@Component({
    selector: 'app-usuario-edicion',
    templateUrl: './usuario-edicion.component.html',
    styleUrls: ['./usuario-edicion.component.scss']
})
export class UsuarioEdicionComponent implements OnInit {
    @Input()
    nombreComponentePadre: String;

    id: number;
    public edicion: boolean;

    usuariosLDAP: any[];
    areasLista: any[];
    cargosPorArea: any[];
    formUsuario = new FormGroup({
        'id': new FormControl(0),
        'nombreUsuario': new FormControl(),
        'nombreCompleto': new FormControl(),
        'correo': new FormControl('',Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")),
        'area': new FormControl(),
        'cargo': new FormControl(),
        'activo': new FormControl(true)
    });


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private usuarioLdapService: UsuarioLdapService,
        private usuarioService: UsuarioService,
        private notificarService: NotificarService,
        private areaService: AreaService,
        private cargoService: CargoService,
    ) { }

    ngOnInit(): void {
        /* Params es una propiedad de Route y devuelve los parametros enviados en la URL  */
        this.route.params.subscribe((params: Params) => {
            this.id = params['id'];
            this.edicion = params['id'] != null;
            this.setearListas().subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.usuariosLDAP = data[0];
                this.areasLista = data[1];
                this.initFormulario();
            })
        })
    }

    setearListas(): Observable<any[]> {
        let usuariosLdap = this.usuarioLdapService.listarTodos();
        let areas = this.areaService.listarTodosActivos();
        return forkJoin([usuariosLdap, areas]);
    }

    areaComboChange(value) {
        this.buscarCargosPorArea(value.id);
    }

    initFormulario() {
        if (this.edicion) {
            this.usuarioService.listarPorId(this.id).subscribe(data => {
                this.buscarCargosPorArea(data.cargo.area.id);
                this.formUsuario = new FormGroup({
                    'id': new FormControl(data.id),
                    'nombreUsuario': new FormControl(this.obtenerUsuarioActiveDirectory(data.nombreUsuario)),
                    'nombreCompleto': new FormControl(data.nombreCompleto),
                    'correo': new FormControl(data.correo, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")),
                    'area': new FormControl(data.cargo ? data.cargo.area ? data.cargo.area : null : null),
                    'cargo': new FormControl(data.cargo),
                    'activo': new FormControl(data.activo)
                });
            });
        }
    }

    operarUsuario() {
        let usuario = new Usuario();
        usuario.id = this.formUsuario.value['id'];
        usuario.nombreUsuario = this.formUsuario.value['nombreUsuario'].userId;
        usuario.nombreCompleto = this.formUsuario.value['nombreCompleto'];
        usuario.correo = this.formUsuario.value['correo'];
        usuario.cargo = this.formUsuario.value['cargo'];
        usuario.activo = this.formUsuario.value['activo'];

        if (this.edicion) {
            this.usuarioService.modificar(usuario).pipe(switchMap(() => {
                return this.usuarioService.listarTodos();
            })).subscribe(data => {
                this.usuarioService.usuariosCambio.next(data);
                this.notificarMensaje(false, 'Usuario Modificado');
                this.router.navigate(['usuario']);
            });
        } else {
            this.usuarioService.registrar(usuario).pipe(switchMap(() => {
                return this.usuarioService.listarTodos();
            })).subscribe(data => {
                this.usuarioService.usuariosCambio.next(data);
                this.notificarMensaje(false, 'Usuario Registrado');
                this.router.navigate(['usuario']);
            });
        }
    }

    buscarCargosPorArea(areaId: number) {
        this.cargoService.listarPorAreaId(areaId).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.cargosPorArea = data;
        })
    }

    obtenerUsuarioActiveDirectory(nombreUsuario) {
        return this.usuariosLDAP.find(x => x.userId == nombreUsuario);
    }

    cancelar() {
        this.router.navigate(['usuario']);
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }
}
