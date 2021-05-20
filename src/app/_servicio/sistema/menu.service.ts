import { UsuarioPerfil } from './../../_dominio/sistema/usuarioPerfil';
import { Usuario } from './../../_dominio/sistema/usuario';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Menu } from '../../_dominio/sistema/menu';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioMenuDTO } from '../../_dto/usuarioMenuDTO';
import { Perfil } from 'src/app/_dominio/sistema/perfil';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    menuCambio = new Subject<Menu[]>();
    usuarioNombreCompleto = new Subject<string>();

    url: string = `${environment.HOST}/menus`;

    constructor(private http: HttpClient) { }

    /* Estos 2 metodos usa la forma manual de agregar el token a la petición. */
    listar() {
        let token = sessionStorage.getItem(environment.TOKEN_NAME);
        return this.http.get<Menu[]>(`${this.url}`, {
            headers: new HttpHeaders().set('Authorization', `bearer ${token}`).set('Content-Type', 'application/json')
        })
    }

    listarPorUsuarioYPerfil(usuario: string, perfil: string) {
        let usuarioRe = new Usuario();
        usuarioRe.nombreUsuario = usuario;
        let perfilRe = new Perfil();
        perfilRe.nombre = perfil;
        let up = new UsuarioPerfil();
        up.usuario = usuarioRe;
        up.perfil = perfilRe;

        let token = sessionStorage.getItem(environment.TOKEN_NAME);
        return this.http.post<UsuarioMenuDTO>(`${this.url}/usuario_menu`,up,{
            headers: new HttpHeaders().set('Authorization', `bearer ${token}`).set('Content-Type', 'application/json')
        })
    }

}
