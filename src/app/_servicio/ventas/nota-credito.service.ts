import {NotaCreditoSolicitudRespuestaDTO} from './../../_dto/ventas/notaCreditoSolicitudRespuestaDTO';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {NotificarService} from '../notificar.service';
import {SessionService} from '../session.service';
import {DocumentoFactura} from '../../_dominio/ventas/documentoFactura';
import {DocumentoNotaCredito} from '../../_dominio/ventas/documentoNotaCredito';
import {NotaCreditoDTO} from 'src/app/_dto/ventas/notaCreditoDTO';
import {Subject} from 'rxjs';
import {NotaCreditoConsultaDTO} from 'src/app/_dto/ventas/notaCreditoConsultaDTO';
import {DocumentoDetalle} from 'src/app/_dominio/ventas/documentoDetalle';

@Injectable({
    providedIn: 'root'
})
export class NotaCreditoService {

    url: string = `${environment.HOST}/devoluciones`;
    solicitudesDevolucionesCambio = new Subject<NotaCreditoDTO[]>();

    constructor(
        private http: HttpClient,
        private _notificarService: NotificarService,
        private _sessionService: SessionService
    ) {
    }

    registrar(notaCredito: DocumentoNotaCredito) {
        this._notificarService.loadingCambio.next(true);
        return this.http.post<DocumentoFactura>(`${this.url}/registrar`, notaCredito);
    }

    validarDevolucionesEnRevision(facturaId: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<boolean>(`${this.url}/validarRevision/${facturaId}`);
    }

    listarDevoluciones(tipo: string) {
        let puntoVentaId = this._sessionService.puntoVentaId();
        this._notificarService.activarLoading();
        return this.http.post<NotaCreditoDTO[]>(`${this.url}/solicitudesAprobacion`, {
            'puntoVentaId': puntoVentaId,
            'tipoConsulta': tipo
        });
    }

    responderSolicitudDevolucion(respuesta: NotaCreditoSolicitudRespuestaDTO) {
        this._notificarService.activarLoading();
        return this.http.post(`${this.url}/solicitudRespuesta`, respuesta)
    }

    listarTodasPorCotizacionID(cotizacionID: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<NotaCreditoConsultaDTO[]>(`${this.url}/listarTodasPorCotizacion/${cotizacionID}`);
    }

    actualizarLineaDetalle(notaCreditoId: number, linea: DocumentoDetalle) {
        this._notificarService.activarLoading();
        return this.http.post<DocumentoNotaCredito>(`${this.url}/actualizarLineaDetalle/${notaCreditoId}`, linea);
    }

    buscarPorId(id: number) {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoNotaCredito>(`${this.url}/${id}`);
    }

    requiereAprobacion(detalles: DocumentoDetalle[], facturaId: number, tipoDevolucion: string) {
        this._notificarService.activarLoading();
        const obj = {
            'detalles': detalles,
            'facturaId': facturaId,
            'tipoDevolucion': tipoDevolucion
        }
        return this.http.post<boolean>(`${this.url}/requiereAprobacion`, obj);
    }

    listarNotasCreditoEstadoError() {
        this._notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoNotaCredito[]>(`${this.url}/listarNotasCreditoError`);
    }

    reintegrarNotaCredito(notaCreditoID: number){
        this._notificarService.loadingCambio.next(true);
        return this.http.get<NotaCreditoConsultaDTO>(`${this.url}/reintegrar/${notaCreditoID}`);
    }
}
