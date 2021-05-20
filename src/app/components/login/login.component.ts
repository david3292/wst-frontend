import { MenuService } from '../../_servicio/sistema/menu.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginService } from './../../_servicio/login.service';
import { environment } from './../../../environments/environment';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { UsuarioService } from 'src/app/_servicio/sistema/usuario.service';
import { ConfiguracionUsuarioPerfilService } from 'src/app/_servicio/sistema/configuracion-usuario-perfil.service';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { Perfil } from 'src/app/_dominio/sistema/perfil';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { ConfiguracionUsuarioPerfil } from 'src/app/_dominio/sistema/configuracionUsuarioPerfil';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    usuario: string;
    contrasena: string;
    mensaje: string;
    error: string;

    public logo = "assets/img/logo.png";

    public perfiles: Perfil[] = [];
    public puntosVenta: PuntoVenta[] = [];
    private configuracionesLista: ConfiguracionUsuarioPerfil[] = [];
    public solicitarPerfil: boolean = false;
    public solicitarPvta: boolean = false;

    public perfilSeleccionado: Perfil;
    public pvtaSeleccionado: PuntoVenta;

    @ViewChild("aceptar") aceptarButton: ElementRef;

    constructor(
        public loginService: LoginService,
        private menuService: MenuService,
        private notificarService: NotificarService,
        private usuarioService: UsuarioService,
        private configUsuarioPerfil: ConfiguracionUsuarioPerfilService,
        private router: Router) { }

    ngOnInit(): void {
        this.perfiles = [];
        this.puntosVenta = [];
        this.configuracionesLista = [];
        if (this.loginService.estaLogueadoMas1Perfil()) {
            let tk = sessionStorage.getItem(environment.TOKEN_NAME);
            const helper = new JwtHelperService();
            const decodedToken = helper.decodeToken(tk);
            let usuario = decodedToken.user_name;
            this.cargarConfiguraciones(usuario, decodedToken['authorities']);
        }
    }

    iniciarSesion() {

        this.loginService.login(this.usuario, this.contrasena).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            sessionStorage.setItem(environment.TOKEN_NAME, data.access_token);
            const helper = new JwtHelperService();
            const decodedToken = helper.decodeToken(data.access_token);
            this.cargarConfiguraciones(decodedToken.user_name, decodedToken['authorities']);
        });
    }

    private cargarConfiguraciones(usuario: string, roles: string[]) {
        let obj = new Usuario();
        obj.nombreUsuario = usuario;
        this.configUsuarioPerfil.listarPorUsuario(obj).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.configuracionesLista = data;
            this.obtenerPerfilListado(data);
            this.aceptarButton.nativeElement.focus();

            if (usuario === 'superadmin') {
                sessionStorage.setItem(environment.ACCESS_PERFIL, 'SUPERADMIN');
                this.listarMenu('SUPERADMIN');
            } else {
                if (roles.length > 0 && roles.length <= 1) {
                    //sessionStorage.setItem(environment.ACCESS_PERFIL, roles[0]);
                    if (roles[0] !== 'VENDEDOR') {
                        if (data.length > 1) {
                            if(roles[0] === 'APROBADOR_CREDITO_Y_COBRANZAS' || roles[0] === 'APROBADOR_COMERCIAL' ){
                                sessionStorage.setItem(environment.ACCESS_CONFIG, JSON.stringify(data[0]));
                                this.listarMenu(roles[0]);
                            }
                        } else {
                            sessionStorage.setItem(environment.ACCESS_CONFIG, JSON.stringify(this.recuperarConfiguracion()));
                            this.listarMenu(roles[0]);
                        }

                    }
                    if (roles[0] === 'VENDEDOR') {
                        if (data.length == 1) {
                            sessionStorage.setItem(environment.ACCESS_CONFIG, JSON.stringify(data[0]));
                            this.listarMenu(roles[0]);
                        }
                    }
                }

            }
        })
    }

    private obtenerPerfilListado(configuraciones: ConfiguracionUsuarioPerfil[]) {
        if (configuraciones.length) {
            let hash = {};
            let array = configuraciones.filter(o => hash[o.usuarioPerfil.id] ? false : hash[o.usuarioPerfil.id] = true);
            array.map(x => {
                this.perfiles.push(x.usuarioPerfil.perfil);
            })
        }
        if (configuraciones.length == 1) {
            this.perfilSeleccionado = this.perfiles[0];
            this.obtenerPuntosVentas(this.perfilSeleccionado.id);
            this.pvtaSeleccionado = configuraciones[0].puntoVenta;
        }
    }

    public changeValuePerfil(value: Perfil) {
        this.obtenerPuntosVentas(value.id);
    }

    private obtenerPuntosVentas(id: number) {
        this.puntosVenta = [];
        this.configuracionesLista.map(x => {
            if (x.usuarioPerfil.perfil.id === id) {
                this.puntosVenta.push(x.puntoVenta);
            }
        })
    }

    public seleccionarPerfilyPuntoVenta() {
        sessionStorage.setItem(environment.ACCESS_PERFIL, this.perfilSeleccionado.nombre);
        sessionStorage.setItem(environment.ACCESS_PVT, this.pvtaSeleccionado.nombre);
        sessionStorage.setItem(environment.ACCESS_CONFIG, JSON.stringify(this.recuperarConfiguracion()));
        this.listarMenu(this.perfilSeleccionado.nombre);
    }

    private listarMenu(perfilNmbre: string) {
        let tk = sessionStorage.getItem(environment.TOKEN_NAME);
        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(tk);
        this.menuService.listarPorUsuarioYPerfil(decodedToken.user_name, perfilNmbre).subscribe(data => {
            this.menuService.menuCambio.next(data.menus);
            this.menuService.usuarioNombreCompleto.next(data.nombreCompleto);
            this.router.navigate(['inicio']);
        });
    }

    private recuperarConfiguracion() {
        return this.configuracionesLista.find(x => (x.puntoVenta.id == this.pvtaSeleccionado.id && x.usuarioPerfil.perfil.id == this.perfilSeleccionado.id));
    }

}
