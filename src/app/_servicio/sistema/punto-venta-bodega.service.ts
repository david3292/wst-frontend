import { Bodega } from './../../_dominio/sistema/bodega';
import { PuntoVentaBodega } from './../../_dominio/sistema/puntoVentaBodega';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { Subject } from 'rxjs';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class PuntoVentaBodegaService {

    private url: string = `${environment.HOST}/pvta-bodegas`;
    puntoVentaBodegaCambio = new Subject<PuntoVentaBodega[]>();

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService,
        private _sessionService: SessionService) { }

    listarBodegasPorPuntoVenta(idPuntoVenta: number) {
        this.notificarService.activarLoading();
        return this.http.get<PuntoVentaBodega[]>(`${this.url}/listarPorPvta/${idPuntoVenta}`);
    }

    registrar(puntoVenta: PuntoVentaBodega) {
        this.notificarService.activarLoading();
        return this.http.post<PuntoVentaBodega>(this.url, puntoVenta);
    }

    modificar(puntoVenta: PuntoVentaBodega) {
        this.notificarService.activarLoading();
        return this.http.put<PuntoVentaBodega>(this.url, puntoVenta);
    }

    buscarBodegaPrincipal() {
        this.notificarService.activarLoading();
        return this.http.post<Bodega>(`${this.url}/buscarBodegaPrincipal`, this._sessionService.puntoVenta());
    }

}
