import { ConfiguracionUsuarioPerfil } from './../../_dominio/sistema/configuracionUsuarioPerfil';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { UsuarioPerfil } from 'src/app/_dominio/sistema/usuarioPerfil';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionUsuarioPerfilService {

    url: string = `${environment.HOST}/configuraciones-usuario-perfil`;

    configuracionUsuarioPerfilCambio = new Subject<ConfiguracionUsuarioPerfil[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private _sessionService: SessionService
        ) { }


    listarPorUsuarioPerfil(idUsuarioPerfil: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ConfiguracionUsuarioPerfil[]>(`${this.url}/usuarioperfil/${idUsuarioPerfil}`);
    }

    registrar(configuracion: ConfiguracionUsuarioPerfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<ConfiguracionUsuarioPerfil>(this.url, configuracion);
    }

    modificar(configuracion: ConfiguracionUsuarioPerfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<ConfiguracionUsuarioPerfil>(this.url, configuracion);
    }

    eliminar(idconfiguracionUsuarioPerfil: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.delete<ConfiguracionUsuarioPerfil>(`${this.url}/${idconfiguracionUsuarioPerfil}`);
    }
    listarPorUsuario(usuario: Usuario) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<ConfiguracionUsuarioPerfil[]>(`${this.url}/usuario`, usuario);
    }

    listarPuntosDeVentaPorUsuarioEnSesionYPerfil() {
        this.notificarService.loadingCambio.next(true);
        const perfil = this._sessionService.perfilNombre();
        return this.http.get<PuntoVenta[]>(`${this.url}/puntosVentas/${perfil}`);
    }

    listarPuntosDeVentaPorUsuarioYPerfil(usuario: string, perfil: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<PuntoVenta[]>(`${this.url}/puntosVentasPorUsuario/${usuario}/${perfil}`);
    }

}
