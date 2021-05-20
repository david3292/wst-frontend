import { ReservaFacturaDTO } from './../../_dominio/ventas/reservaFacturaDTO';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { SessionService } from '../session.service';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { ReservaFacturaDisponibleDTO } from 'src/app/_dto/ventas/reservas/reservaFacturaDisponibleDTO';

@Injectable({
    providedIn: 'root'
})
export class ReservaService {

    url: string = `${environment.HOST}/reservaciones/factura`;
    reservaCambio = new Subject<DocumentoReserva>();
    reservasPorFacturarCambio = new Subject<DocumentoReserva[]>();

    constructor(private http: HttpClient,
        private _notificarService: NotificarService,
        private _sessionService: SessionService
        ) { }

    obtenerPorcentajeAbono() {
        this._notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/abono`, {
            responseType: 'text'
        });
    }

    obtenerFechaMaximaReserva() {
        this._notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/fechaMaximaReserva`, {
            responseType: 'text'
        });
    }

    registrar(reserva: DocumentoReserva) {
        this._notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoReserva>(`${this.url}/registrar`, reserva);
    }

    listarPorCotizacionID(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoReserva>(`${this.url}/listarPorCotizacion/${cotizacionID}`);
    }

    enviarAprobarReserva(reserva: DocumentoReserva) {
        this._notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/enviarAprobar`, reserva);
    }

    resumenFactura(reservaID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<any>(`${this.url}/resumen/${reservaID}`);
    }

    listarEntregas() {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<any>(`${this.url}/entregas`);
    }

    registrarDetalle(reserva: DocumentoReserva) {
        this._notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoReserva>(`${this.url}/registrarDetalle`, reserva);
    }

    registrarCabecera(reserva: DocumentoReserva) {
        this._notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoReserva>(`${this.url}/registrarCabecera`, reserva);
    }

    eliminarReservaDetalle(reservaID: number, cotizacionDetalleID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.delete(`${this.url}/${reservaID}/${cotizacionDetalleID}`);
    }

    validarFactura(reservaID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<string[]>(`${this.url}/validarReserva/${reservaID}`);
    }

    procesarFactura(reservaID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<FacturaDTO>(`${this.url}/procesar/${reservaID}`);
    }

    listarTodasPorCotizacionID(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<ReservaFacturaDTO[]>(`${this.url}/listarTodasPorCotizacionId/${cotizacionID}`);
    }

    listarNumeroReservasEmitidasPorCotizacionID(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<string[]>(`${this.url}/listarEmitidasPorCotizacionId/${cotizacionID}`);
    }

    cerrar(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/cerrar/${cotizacionID}`);
    }

    listarReservasPorFacturar(){
        const puntoVentaId = this._sessionService.puntoVentaId();
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoReserva[]>(`${this.url}/reservasPorFacturar/${puntoVentaId}`);
    }

    anularReservaPorId(reservaId: number){
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoReserva[]>(`${this.url}/anular/${reservaId}`);
    }

    consultarReservas(page: number, size: number, consulta: any) {
        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this.http.post<any>(urlFinal, consulta);
    }

    obtenerDetallePorReservaId(reservaId: number){
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoDetalle[]>(`${this.url}/detalle/${reservaId}`);
    }

    validarDisponibilidadReserva(reservaId: number){
        this._notificarService.loadingCambio.next(true);
        return this.http.get<ReservaFacturaDisponibleDTO>(`${this.url}/validarDisponibleReserva/${reservaId}`);
    }
}
