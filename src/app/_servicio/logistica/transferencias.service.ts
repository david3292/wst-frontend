import { Subject } from 'rxjs';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';
import { TransferenciaDTO } from 'src/app/_dto/logistica/transferenciaDTO';
import { DocumentoTransferenciaSalida } from 'src/app/_dominio/logistica/documentoTransferenciaSalida';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { ArticuloCompartimiento } from 'src/app/_dominio/logistica/articuloCompartimiento';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { DocumentoBase } from 'src/app/_dominio/ventas/documentoBase';
import { DocumentoTransferenciaEntrada } from 'src/app/_dominio/logistica/documentoTransferenciaEntrada';

@Injectable({
    providedIn: 'root'
})
export class TransferenciasService {

    private url: string = `${environment.HOST}/transferencias`

    transferenciaCambio = new Subject<DocumentoBase>();
    transferenciasCambio = new Subject<TransferenciaDTO[]>();

    constructor(
        private _http: HttpClient,
        private _notificarService: NotificarService,
        private _sessionService: SessionService
    ) { }

    listarTransferencias(tipo: string){
        let perfil = this._sessionService.perfilNombre();
        let usuarioId = this._sessionService.usuarioId();
        let puntoVentaId = this._sessionService.puntoVentaId();
        this._notificarService.activarLoading();
        return this._http.post<TransferenciaDTO[]>(`${this.url}/overview`, {
            'usuarioId': usuarioId,
            'puntoVentaId': puntoVentaId,
            'tipoConsulta': tipo,
            'perfil': perfil
        });
    }

    listarTransferenciasSalida(transferenciaId: number){
        return this._http.get<DocumentoTransferenciaSalida[]>(`${this.url}/${transferenciaId}/salidas`);
    }

    listarTransferenciasEntrada(transferenciaSalidaId: number){
        return this._http.get<DocumentoTransferenciaEntrada[]>(`${this.url}/${transferenciaSalidaId}/entradas`);
    }

    obtenerTransferenciaSalidaPorId(transferenciaSalidaId: number){
        let urlCompleta: string = `${this.url}/${transferenciaSalidaId}/salida`;
        this._notificarService.activarLoading();
        return this._http.get<DocumentoTransferenciaSalida>(urlCompleta);
    }

    obtenerTransferenciaEntradaPorId(transferenciaEntradaId: number){
        let urlCompleta: string = `${this.url}/${transferenciaEntradaId}/entrada`;
        this._notificarService.activarLoading();
        return this._http.get<DocumentoTransferenciaEntrada>(urlCompleta);
    }

    obtenerDocumentoDetallePorIdConCompartimientos(documentoDetalle: DocumentoDetalle){
        let urlFinal: string = `${this.url}/detalles/${documentoDetalle.id}`;
        return this._http.get<DocumentoDetalle>(urlFinal);
    }

    obtenerItemStockBin(documentoDetalle: DocumentoDetalle){
        let urlFinal: string = `${this.url}/articulo/compartimientos`;
        this._notificarService.activarLoading();
        return this._http.post<ArticuloCompartimiento[]>(urlFinal, {
            "itemnmbr": documentoDetalle.codigoArticulo,
            "bodega": documentoDetalle.codigoBodega
        });
    }

    obtenerBins(documentoDetalle: DocumentoDetalle){
        let urlFinal: string = `${this.url}/compartimientos/${documentoDetalle.codigoBodega}`;
        this._notificarService.activarLoading();
        return this._http.post<ArticuloCompartimiento[]>(urlFinal, {
            "itemnmbr": documentoDetalle.codigoArticulo,
            "bodega": documentoDetalle.codigoBodega
        });
    }

    actualizarDocumentoDetalleSalida(transferenciaId: number, documentoDetalle: DocumentoDetalle){
        let urlFinal: string = `${this.url}/${transferenciaId}/detalleDocumento/salida/actualizar`;
        this._notificarService.activarLoading();
        return this._http.post<DocumentoTransferenciaSalida>(urlFinal, documentoDetalle);
    }

    actualizarDocumentoDetalleEntrada(transferenciaId: number, documentoDetalle: DocumentoDetalle){
        let urlFinal: string = `${this.url}/${transferenciaId}/detalleDocumento/entrada/actualizar`;
        this._notificarService.activarLoading();
        return this._http.post<DocumentoTransferenciaSalida>(urlFinal, documentoDetalle);
    }

    crearNuevaTransferenciaSalida(transferenciaId: number){
        let urlFinal = `${this.url}/salida/nueva/${transferenciaId}`;
        this._notificarService.activarLoading();
        return this._http.get<DocumentoTransferenciaSalida>(urlFinal);
    }

    obtenerGuiaRemisionPorTransferenciaSalidaId(transferenciaSalidaId: number){
        let urlFinal = `${this.url}/guiaRemision/${transferenciaSalidaId}`;
        this._notificarService.activarLoading();
        return this._http.get<DocumentoGuiaRemision>(urlFinal);
    }

    guardarGuiaRemision(guiaRemision: DocumentoGuiaRemision){
        let urlFinal = `${this.url}/crearActualizarGuiaRemision/${guiaRemision.documentoPadreId}`;
        this._notificarService.activarLoading();
        return this._http.post<DocumentoGuiaRemision>(urlFinal, guiaRemision);
    }

    procesarTransferencia(transferencia: DocumentoBase){
        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/procesar/${transferencia.id}/${transferencia.tipo}`;
        return this._http.post<any>(urlFinal, '');
    }

    integrarGuiaRemisionGp(transferenciaSalida: DocumentoTransferenciaSalida){
        let urlFinal = `${this.url}/guiaRemision/integrar/${transferenciaSalida.id}`;
        this._notificarService.activarLoading();
        return this._http.post<DocumentoGuiaRemision>(urlFinal, null);
    }

    generarReporteGuiaTransferenciaSalida(transferenciaSalidaId: number){
        let urlFinal = `${this.url}/transferenciaSalida/reporte/${transferenciaSalidaId}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    generarReporteGuiaTransferencia(transferenciaId: number){
        let urlFinal = `${this.url}/transferencia/reporte/${transferenciaId}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    generarReporteGuiaTransferenciaEntrada(transferenciaEntradaId: number){
        let urlFinal = `${this.url}/transferenciaEntrada/reporte/${transferenciaEntradaId}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    generarReporteGuiaRemision(transferenciaSalidaId: number){
        let urlFinal = `${this.url}/generarReporteGR/${transferenciaSalidaId}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    anularTransferenciaSalida(transferenciaSalidaId: number){
        let urlFinal = `${this.url}/salida/anular/${transferenciaSalidaId}`;
        this._notificarService.activarLoading();
        return this._http.post(urlFinal, null, {
            responseType: 'text'
        });
    }

    listarTodasPorCotizacionID(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this._http.get<any[]>(`${this.url}/listarTodasPorCotizacion/${cotizacionID}`);
    }

    consultarTransferencias(page: number, size: number, consulta: any){
        let usuarioId = this._sessionService.usuarioId();
        let puntoVentaId = this._sessionService.puntoVentaId();
        consulta.usuarioId = usuarioId;
        consulta.puntoVentaId = puntoVentaId;
        consulta.perfil = this._sessionService.perfil();

        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this._http.post<any>(urlFinal,consulta);
    }

    listarEstados(){
        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/estados`;
        return this._http.get<any>(urlFinal);
    }
}
