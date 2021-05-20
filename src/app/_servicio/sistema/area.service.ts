import { Area } from './../../_dominio/sistema/area';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class AreaService {

    url: string = `${environment.HOST}/areas`;

    areasCambio = new Subject<Area[]>();

    mensajeCambio = new Subject<string>();
    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Area[]>(this.url)
    }

    listarTodosActivos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Area[]>(`${this.url}/activos`)
    }

    listarPorId(idArea: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Area>(`${this.url}/${idArea}`);
    }

    registrar(area: Area) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Area>(this.url, area);
    }

    modificar(area: Area) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<Area>(this.url, area);
    }
}
