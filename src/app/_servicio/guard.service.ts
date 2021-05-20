import { Perfil } from './../_dominio/sistema/perfil';

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginService } from './login.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { MenuService } from './sistema/menu.service';
import { UsuarioMenuDTO } from '../_dto/usuarioMenuDTO';
import { SessionService } from './session.service';


@Injectable({
    providedIn: 'root'
})
/*
    CLASE que nos permitirá asegurar el acceso a las paginas por la url del navegador
    protege las rutas.
*/
export class GuardService implements CanActivate {

    constructor(
        private menuService: MenuService,
        private loginService: LoginService,
        private sessionService: SessionService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // como es false nunca se podrá navegar a la página destino ahora en el routing
        // se debe proteger las rutas.

        const helper = new JwtHelperService();
        //1) VERIFICA SI ESTA LOGEADO
        let rpta = this.loginService.estaLogueado();
        if (!rpta) {
            this.loginService.cerrarSesion();
            return false;
        } else {
            //2) VERIFICA SI EL TOKEN HA EXPIRADO
            let token = sessionStorage.getItem(environment.TOKEN_NAME);
            if (!helper.isTokenExpired(token)) {
                //3) VERIFICA SI TIENE EL ROL ADECUADO PARA ACCEDER A LA PÁGINA

                //para conocer a la url que se intenta acceder
                let url = state.url;
                const decodedToken = helper.decodeToken(token);

                //traemos el perfil y punto venta seleccionado
                let perfil = '';
                if (decodedToken.user_name == 'superadmin')
                    perfil = sessionStorage.getItem(environment.ACCESS_PERFIL);
                else
                    perfil = this.sessionService.perfilNombre();


                //usamos la función pipe debido a que el SUBSCRIBE es asicncrono y necesitamos que se ejecute el método para continuar.
                return this.menuService.listarPorUsuarioYPerfil(decodedToken.user_name, perfil).pipe(map((data: UsuarioMenuDTO) => {
                    this.menuService.menuCambio.next(data.menus);
                    this.menuService.usuarioNombreCompleto.next(data.nombreCompleto);

                    let cont = 0;
                    for (let m of data.menus) {
                        if (url.startsWith(m.url)) {
                            cont++;
                            break;
                        }
                    }

                    if (cont > 0) {
                        return true;
                    } else {
                        this.router.navigate(['not-403']);
                        return false;
                    }
                }))

                return true;
            } else {
                this.loginService.cerrarSesion();
                return false;
            }
        }
    }
}
