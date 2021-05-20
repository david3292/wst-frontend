import { NotificarService } from 'src/app/_servicio/notificar.service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Perfil } from 'src/app/_dominio/sistema/perfil';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PerfilService {
    url: string = `${environment.HOST}/perfiles`;

    areasCambio = new Subject<Perfil[]>();

    mensajeCambio = new Subject<string>();
    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Perfil[]>(this.url)
    }

    listarPorId(idPerfil: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Perfil>(`${this.url}/${idPerfil}`);
    }

    registrar(perfil: Perfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Perfil>(this.url, perfil);
    }

    modificar(perfil: Perfil) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<Perfil>(this.url, perfil);
    }
}
