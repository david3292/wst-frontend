import { NotificarService } from 'src/app/_servicio/notificar.service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioPerfil } from 'src/app/_dominio/sistema/usuarioPerfil';
import { Perfil } from 'src/app/_dominio/sistema/perfil';

@Injectable({
    providedIn: 'root'
})
export class UsuarioPerfilService {
    url: string = `${environment.HOST}/usuario-perfiles`;

    areasCambio = new Subject<UsuarioPerfil[]>();

    mensajeCambio = new Subject<string>();
    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarPorUsuario(idUsuario: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<UsuarioPerfil[]>(`${this.url}/usuario/${idUsuario}`);
    }

    listarTodosActivos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<UsuarioPerfil[]>(`${this.url}/activos`);
    }

    listarPorId(idUsuarioPerfil: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<UsuarioPerfil>(`${this.url}/${idUsuarioPerfil}`);
    }

    registrar(usuarioPerfil: UsuarioPerfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<UsuarioPerfil>(this.url, usuarioPerfil);
    }

    modificar(usuarioPerfil: UsuarioPerfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<UsuarioPerfil>(this.url, usuarioPerfil);
    }

    eliminar(idUsuarioPerfil: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.delete<boolean>(`${this.url}/${idUsuarioPerfil}`);
    }

    listarCodigoVendedoresGP() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/codigoVendedores`);
    }
}
