import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { ChequePosfechadoDTO } from 'src/app/_dominio/cobros/chequePosfechadoDTO';
import { CobroDTO } from 'src/app/_dominio/cobros/cobroDTO';
import { Subject } from 'rxjs';
import { SessionService } from '../session.service';
import { CobroChequePosfechadoDTO } from 'src/app/_dominio/cobros/cobroChequePosfechadoDTO';

@Injectable({
    providedIn: 'root'
})
export class ChequePosfechadoService {

    url: string = `${environment.HOST}/chequesPosfechados`;
    chequePosfechadoCambio = new Subject<ChequePosfechadoDTO[]>();
    chequePosfechadoCambioRevision = new Subject<ChequePosfechadoDTO[]>();

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService,
        private _sessionService: SessionService
    ) { }

    listarChequesEstadoRecibido() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ChequePosfechadoDTO[]>(`${this.url}/estadoRecibido`);
    }

    listarChequesEstadoRevision() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ChequePosfechadoDTO[]>(`${this.url}/estadoRevision`);
    }

    procesar(cheques: ChequePosfechadoDTO[]) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<CobroChequePosfechadoDTO[]>(`${this.url}/procesar`, cheques);
    }

    procesarAprobacion(cheques: ChequePosfechadoDTO[], accion: string, observacion: string) {
        const respuesta = {
            'chequesAProcesar': cheques,
            'estado': accion,
            'observacion': observacion
        }
        this.notificarService.loadingCambio.next(true);
        return this.http.post<CobroChequePosfechadoDTO[]>(`${this.url}/procesarAprobacion`, respuesta);
    }

    generarReporte(ids: number[]) {
        debugger
        this.notificarService.loadingCambio.next(true);
        let data = {
            'chequesPosfechadoIds': ids,
            'perfil': this._sessionService.perfilNombre()
        }
        return this.http.post(`${this.url}/reporte`, data, {
            responseType: 'blob'
        });
    }
}
