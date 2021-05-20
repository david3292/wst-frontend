import {Usuario} from './../../_dominio/sistema/usuario';
import {environment} from './../../../environments/environment';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {NotificarService} from '../notificar.service';
import {PuntoVenta} from 'src/app/_dominio/sistema/puntoVenta';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    url: string = `${environment.HOST}/usuarios`;

    usuariosCambio = new Subject<Usuario[]>();

    constructor(private http: HttpClient,
                private notificarService: NotificarService) {
    }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Usuario[]>(this.url)
    }

    listarPorId(idUsuario: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Usuario>(`${this.url}/${idUsuario}`);
    }

    registrar(usuario: Usuario) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Usuario>(this.url, usuario);
    }

    modificar(usuario: Usuario) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<Usuario>(this.url, usuario);
    }

    obtenerUsuarioEnSesion() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Usuario>(`${this.url}/usuarioSesion`);
    }

    seleccionarPuntoVenta(puntoVenta: PuntoVenta) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any>(`${this.url}/seleccionarPV`, puntoVenta);
    }

    listarUsuariosPerfilVendedor() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Usuario>(`${this.url}/perfilVendedor`);
    }

    listarUsuariosPorPerfil(perfil: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Usuario[]>(`${this.url}/porPerfiil/${perfil}`);
    }
}
