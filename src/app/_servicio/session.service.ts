import {environment} from './../../environments/environment';
import {Injectable} from '@angular/core';
import {PuntoVenta} from '../_dominio/sistema/puntoVenta';
import {JwtHelperService} from '@auth0/angular-jwt';
import * as _ from "lodash";

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    constructor() {
    }

    usuarioId(): number {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["usuarioPerfil"].usuario.id
    }

    perfilNombre(): string {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["usuarioPerfil"].perfil.nombre;
    }

    perfil(): any {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["usuarioPerfil"].perfil;
    }

    puntoVentaNombre(): string {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["puntoVenta"].nombre;
    }

    puntoVentaId(): number {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config !== null ? config['puntoVenta'].id : null;
    }

    puntoVenta(): PuntoVenta {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["puntoVenta"];
    }

    puedeEditarDescuendoAdicional(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarDescuentoAdicional"];
    }

    puedeEditarPorcentajeAnticipo(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarPorcentajeAnticipo"];
    }

    puedeEditarCondicionPago(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarCondicionPago"];
    }

    puedeEditarDescripcionArticulo(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarDescripcionArticulo"];
    }

    puedeEditarPrecioArticulo(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarPrecioArticulo"];
    }

    puedeEditarDescuentoFijo(): boolean {
        let config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["editarDescuentoFijo"];
    }

    nombreUsuario(): string {
        let tk = sessionStorage.getItem(environment.TOKEN_NAME);
        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(tk);
        return decodedToken.user_name;
    }

    perfilId(): number {
        const config = JSON.parse(sessionStorage.getItem(environment.ACCESS_CONFIG));
        return config["usuarioPerfil"].perfil.id;
    }

    esSuperadmin(): boolean {
        return this.nombreUsuario().toUpperCase() === 'SUPERADMIN';
    }

    tieneRolJefeCobranzas() : boolean{
        let tk = sessionStorage.getItem(environment.TOKEN_NAME);
        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(tk);
        return _.includes(decodedToken.authorities, 'JEFE_COBRANZAS');;
    }
}
