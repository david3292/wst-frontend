import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NotificarService } from './notificar.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    nombreUsuario = new Subject<string>();
    perfilPuntVentaSeleccionado = new Subject<boolean>();

    url: string = `${environment.HOST}/oauth/token`;

    constructor(
        private http: HttpClient,
        private router: Router,
        private notificarService: NotificarService
    ) { }

    login(usuario: string, clave: string) {
        this.notificarService.loadingCambio.next(true);
        this.perfilPuntVentaSeleccionado.next(false);
        const body = `grant_type=password&username=${encodeURIComponent(usuario)}&password=${encodeURIComponent(clave)}`;

        return this.http.post<any>(this.url, body, {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8').set('Authorization', 'Basic ' + btoa(environment.TOKEN_AUTH_USERNAME + ':' + environment.TOKEN_AUTH_PASSWORD))
        });
    }

    cerrarSesion() {
        let token = sessionStorage.getItem(environment.TOKEN_NAME);
        this.http.get(`${environment.HOST}/tokens/anular/${token}`).subscribe(() => {
            this.perfilPuntVentaSeleccionado.next(false);
            sessionStorage.clear();
            this.router.navigate(['login']);
        })
    }

    estaLogueado() {
        const helper = new JwtHelperService();
        let token = sessionStorage.getItem(environment.TOKEN_NAME);
        const decodedToken = helper.decodeToken(token);
        if(decodedToken == null){
            return false;
        }
        if (decodedToken.user_name == 'superadmin' || decodedToken.user_name == 'administrador') {
            return token != null;
        } else {
            let perfil = sessionStorage.getItem(environment.ACCESS_CONFIG);
            return token != null && perfil != null;
        }
    }

    estaLogueadoMas1Perfil() {
        let token = sessionStorage.getItem(environment.TOKEN_NAME);
        return token != null;
    }
}
