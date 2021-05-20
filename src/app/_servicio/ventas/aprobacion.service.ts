import { AprobacionDocumento } from './../../_dominio/ventas/aprobacionDocumento';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class AprobacionService {

    url: string = `${environment.HOST}/aprobacionesDocumento`;
    solicitudesAprobacionCambio = new Subject<AprobacionDocumento[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService) { }

    listarSolicitudesPendientesPorPerfil() {
        this.notificarService.loadingCambio.next(true);
        let perfilNombre = this.sessionService.perfilNombre();
        return this.http.get<AprobacionDocumento[]>(`${this.url}/${perfilNombre}`);
    }

    obtenerCatalogoEstado() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/catalogoEstados`);
    }

    procesarSolicitudCotizacion(aprobacion: AprobacionDocumento) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/procesarSolicitudCotizacion`, aprobacion);
    }

    lanzarSolicitudFactura(facturaID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/lanzarSolicitudFactura/${facturaID}`);
    }

    lanzarSolicitudReservaFactura(reservaID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/lanzarSolicitudReservaFactura/${reservaID}`);
    }

    procesarSolicitudFactura(aprobacion: AprobacionDocumento) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/procesarSolicitudFactura`, aprobacion);
    }

    procesarSolicitudReserva(aprobacion: AprobacionDocumento) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/procesarSolicitudReserva`, aprobacion);
    }

}
