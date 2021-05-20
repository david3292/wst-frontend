import { Cargo } from './../../_dominio/sistema/cargo';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class CargoService {

    url: string = `${environment.HOST}/cargos`;

    cargosCambio = new Subject<Cargo[]>();

    mensajeCambio = new Subject<string>();
    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cargo[]>(this.url)
    }

    listarPorId(idCargo: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cargo>(`${this.url}/${idCargo}`);
    }

    listarPorAreaId(idArea: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cargo[]>(`${this.url}/area/${idArea}`);
    }

    registrar(cargo: Cargo) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Cargo>(this.url, cargo);
    }

    modificar(cargo: Cargo) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<Cargo>(this.url, cargo);
    }
}
