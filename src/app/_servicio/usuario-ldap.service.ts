import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from './notificar.service';
import { UsuarioLdap } from '../_dominio/sistema/usuarioLdap';

@Injectable({
    providedIn: 'root'
})
export class UsuarioLdapService {

    url: string = `${environment.HOST}/ldap`;
    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<UsuarioLdap[]>(this.url)
    }

}
