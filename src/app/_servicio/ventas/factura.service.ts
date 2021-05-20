import {DocumentoFactura} from './../../_dominio/ventas/documentoFactura';
import {environment} from 'src/environments/environment';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {NotificarService} from '../notificar.service';
import {FacturaDTO} from 'src/app/_dominio/ventas/facturaDTO';
import {SessionService} from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class FacturaService {

    url: string = `${environment.HOST}/facturaciones`;
    reservaCambio = new Subject<DocumentoFactura>();

    facturasDevolver = new Subject<DocumentoFactura[]>();

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService
    ) {
    }

   /*  registrarDetalle(reserva: DocumentoFactura) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoFactura>(`${this.url}/registrarDetalle`, reserva);
    }

    registrarCabecera(reserva: DocumentoFactura) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoFactura>(`${this.url}/registrarCabecera`, reserva);
    } */

    listarPorCotizacionID(cotizacionID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoFactura>(`${this.url}/listarPorCotizacion/${cotizacionID}`);
    }

    listarTodasPorCotizacionID(cotizacionID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FacturaDTO[]>(`${this.url}/listarTodasPorCotizacion/${cotizacionID}`);
    }

/*     resumenFactura(facturaID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any>(`${this.url}/facturaResumen/${facturaID}`);
    } */

   /*  listarEntregas() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any>(`${this.url}/entregas`);
    } */


    /* validarFactura(facturaID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<string[]>(`${this.url}/validarFactura/${facturaID}`);
    } */

    /* procesarFactura(facturaID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FacturaDTO>(`${this.url}/procesar/${facturaID}`);
    } */

    /* cerrar(cotizacionID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/cerrar/${cotizacionID}`);
    } */

 /*    eliminarFacturaDetalle(facturaID: number, cotizacionDetalleID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.delete(`${this.url}/${facturaID}/${cotizacionDetalleID}`);
    } */


    listarEstados() {
        this.notificarService.activarLoading();
        const urlFinal = `${this.url}/estados`;
        return this.http.get<any>(urlFinal);
    }

    consultarFacturas(page: number, size: number, consulta: any) {
        this.notificarService.activarLoading();
        const urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this.http.post<any>(urlFinal, consulta);
    }

    listarTodasEmitidasPorUsuarioYPuntoVenta() {
        this.notificarService.loadingCambio.next(true);
        const puntoVenta = this.sessionService.puntoVenta();
        return this.http.get<DocumentoFactura[]>(`${this.url}/emitidas/usuario/${puntoVenta.id}`);
    }

    obtenerFacturaPorId(facturaID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoFactura>(`${this.url}/factura/${facturaID}`);
    }

    generarReporte(numeroFactura: string){
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/reporte/${numeroFactura}`, {
            responseType: 'blob'
        });
    }
}
