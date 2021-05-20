import { Injectable } from '@angular/core';
import { Secuencial } from './../../_dominio/sistema/secuencial';
import { TipoDocumento } from './../../_dominio/sistema/tipo-documento';
import { environment } from './../../../environments/environment';
import { NotificarService } from '../notificar.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { SessionService } from '../session.service';


@Injectable({
    providedIn: 'root'
})
export class SecuencialService {
    private url: string = `${environment.HOST}/secuenciales`;

    secuencialCambio = new Subject<Secuencial[]>();

    constructor(private http: HttpClient, private notificarService: NotificarService,
        private sessionService: SessionService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Secuencial[]>(this.url);
    }

    listarPorId(idSecuencial: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Secuencial>(`${this.url}/${idSecuencial}`);
    }

    listarTiposDocumentos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<TipoDocumento[]>(`${this.url}/tipoDocumentos`);
    }

    registrar(secuencial: Secuencial) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Secuencial>(this.url, secuencial);
    }

    obtenerNumeroSecuencialPorPuntoVenta(tipoDocumento: string) {
        let puntoVentaId = this.sessionService.puntoVentaId();
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/numeroSecuencial/${puntoVentaId}/${tipoDocumento}`,{
            responseType: 'text'
        });
    }
}
