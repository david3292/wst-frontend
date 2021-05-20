import { NotificarService } from './../notificar.service';
import { HttpClient } from '@angular/common/http';
import { Bodega } from './../../_dominio/sistema/bodega';
import { Subject } from 'rxjs';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { BodegaGP } from 'src/app/_dominio/sistema/bodegaGP';

@Injectable({
    providedIn: 'root'
})
export class BodegaService {

    private url: string = `${environment.HOST}/bodegas`;
    private urlActivos: string = `${this.url}/activos`;

    bodegasCambio = new Subject<Bodega[]>();
    mensajeCambio = new Subject<string>();

    constructor(
        private _http: HttpClient,
        private _notificarService: NotificarService
    ) { }

    listarTodos(){
        this._notificarService.activarLoading();
        return this._http.get<Bodega[]>(this.url);
    }

    listarTodosActivos(){
        this._notificarService.activarLoading();
        return this._http.get<Bodega[]>(`${this.urlActivos}`);
    }

    registrar(Bodega: Bodega){
        this._notificarService.activarLoading();
        return this._http.post<Bodega>(this.url, Bodega);
    }

    modificar(Bodega: Bodega){
        this._notificarService.activarLoading();
        return this._http.put<Bodega>(this.url, Bodega);
    }

    listarBodegasGP(){
        this._notificarService.activarLoading();
        return this._http.get<BodegaGP[]>(`${this.url}/listargp`);
    }
}
