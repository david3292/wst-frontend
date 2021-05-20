import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DocumentoGuiaDespacho } from 'src/app/_dominio/logistica/documentoGuiaDespacho';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { GuiaDespachoDTO } from 'src/app/_dto/logistica/guiaDespachoDTO';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class GuiaDespachoService {

    url: string = `${environment.HOST}/despachos`;

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService,
        private _sessionService: SessionService
    ) { }

    generarReportePorFacturaID(idFactura: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/reportePorFactura/${idFactura}`, {
            responseType: 'blob'
        });
    }


    generarReporte(id: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/reporte/${id}`, {
            responseType: 'blob'
        });
    }

    generarReporteCliente(id: number, guiaRemision: DocumentoGuiaRemision){
        this.notificarService.activarLoading();
        return this.http.post(`${this.url}/reporte/cliente/${id}`, guiaRemision, {
            responseType: 'blob'
        });
    }

    generarReporteGuiaRemision(guiaRemisionId: number){
        this.notificarService.activarLoading();
        return this.http.get(`${this.url}/generarReporteGR/${guiaRemisionId}`, {
            responseType: 'blob'
        });
    }

    listarPorCotizacion(cotizacionID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<number[]>(`${this.url}/listarPorCotizacion/${cotizacionID}`);
    }

    listarDespachos(){
        this.notificarService.activarLoading();
        let usuarioId = this._sessionService.usuarioId();
        let puntoVentaId = this._sessionService.puntoVentaId();
        let perfil = this._sessionService.perfilNombre();
        return this.http.post<GuiaDespachoDTO[]>(`${this.url}/overview`, {
            'usuarioId': usuarioId,
            'puntoVentaId': puntoVentaId,
            'perfil': perfil
        });
    }

    listarGuiasRemisionPorDespachoId(guiaDespachoId: number){
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/guiasRemision/${guiaDespachoId}`;
        return this.http.get<DocumentoGuiaRemision[]>(urlFinal);
    }

    obtenerGuiaDespachoId(guiaDespachoId: number){
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/${guiaDespachoId}`;
        return this.http.get<any>(urlFinal);
    }

    procesarDespacho(guiaDespacho: DocumentoGuiaDespacho, guiaRemision: DocumentoGuiaRemision){
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/procesarDespacho/${guiaDespacho.id}`;
        return this.http.post<any>(urlFinal, guiaRemision);
    }

    listarEstados(){
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/estados`;
        return this.http.get<any>(urlFinal);
    }

    consultarGuiasDespacho(page: number, size: number, consulta: any){
        let usuarioId = this._sessionService.usuarioId();
        let puntoVentaId = this._sessionService.puntoVentaId();
        consulta.usuarioId = usuarioId;
        consulta.puntoVentaId = puntoVentaId;
        consulta.perfil = this._sessionService.perfil();

        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this.http.post<any>(urlFinal, consulta);
    }

    listarTodasPorCotizacionID(cotizacionID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<GuiaDespachoDTO[]>(`${this.url}/listarTodasPorCotizacionId/${cotizacionID}`);
    }

    obtenerFacturasEmitidasSinGuiaDespacho(){
        this.notificarService.activarLoading();
        return this.http.get<DocumentoFactura[]>(`${this.url}/facturasEmitidasSinGuiaDespacho`);
    }

    generarGuiaDespachoAPartirFactura(facturaId: number){
        this.notificarService.activarLoading();
        return this.http.get<DocumentoGuiaDespacho>(`${this.url}/generarGuiaDespacho/${facturaId}`);
    }
}
