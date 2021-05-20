import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class CotizacionService {

    url: string = `${environment.HOST}/cotizaciones`;

    cotizacionCambio = new Subject<Cotizacion[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService) { }

    listarPorId(idCotizacion: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cotizacion>(`${this.url}/${idCotizacion}`);
    }

    registrar(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Cotizacion>(this.url, cotizacion);
    }

    modificar(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<Cotizacion>(this.url, cotizacion);
    }

    agregarLineaDetalle(cotizacion: Cotizacion, articulo: any) {
        this.notificarService.loadingCambio.next(true);
        let objRequest = { 'cotizacion': cotizacion, 'articulos': articulo };
        return this.http.post<Cotizacion>(`${this.url}/agregarLineaDetalle`, objRequest);
    }

    modificarLineaDetalle(cotizacion: Cotizacion, detalle: any) {
        this.notificarService.loadingCambio.next(true);
        let objRequest = { 'cotizacion': cotizacion, 'linea': detalle };
        return this.http.post<CotizacionDetalle>(`${this.url}/modificarLineaDetalle`, objRequest);
    }

    eliminarLineaDetalle(cotizacionID: number, detalleID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.delete<any>(`${this.url}/eliminarLineaDetalle/${cotizacionID}/${detalleID}`);
    }

    listarTodosPorUsuarioYPuntoVenta() {
        this.notificarService.loadingCambio.next(true);
        const puntoVenta = this.sessionService.puntoVenta();
        return this.http.get<Cotizacion[]>(`${this.url}/usuario/${puntoVenta.id}`);
    }

    cotizarDocumento(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/cotizarDocumento`, cotizacion, {
            responseType: 'blob'
        });
    }

    enviarDocumentoAprobar(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/solicitudAprobar`, cotizacion);
    }

    imprimirDocumento(id: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/imprimir/${id}`, {
            responseType: 'blob'
        });
    }

    recotizarDocumento(id: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cotizacion>(`${this.url}/recotizarDocumento/${id}`);
    }

    anularDocumento(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/anularDocumento`, cotizacion);
    }

    validarCotizacion(cotizacionID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<string[]>(`${this.url}/validarCotizacion/${cotizacionID}`);
    }

    editarOrdenCliente(cotizacion: Cotizacion) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put(`${this.url}/editar/oc`, cotizacion);
    }
}
