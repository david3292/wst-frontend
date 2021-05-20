import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import { CobroDocumentoDTO } from 'src/app/_dominio/cobros/cobroDocumentoDTO';
import { CobroDocumentoValorDTO } from 'src/app/_dominio/cobros/cobroDocumentoValorDTO';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';
import { Subject } from 'rxjs';
import { CobroDTO } from 'src/app/_dominio/cobros/cobroDTO';

@Injectable({
    providedIn: 'root'
})
export class CobroService {

    url: string = `${environment.HOST}/cobros`;

    cobroCambio = new Subject<Cobro>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService) {
    }

    listarBancos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/bancos`);
    }

    listarTarjetasCredito() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/tarjetasCredito`);
    }

    listarNotasCredito(codigoCliente: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/notasCredito/${codigoCliente}`);
    }

    listarAnticipos(codigoCliente: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/anticipos/${codigoCliente}`);
    }

    listarCobrosPorCodigoCliente(codigoCliente: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CobroDocumentoValorDTO[]>(`${this.url}/condicionesCobroFactura/${codigoCliente}`);
    }

    obtenerDetalleCobroPorFacturaId(facturaId: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CobroDocumentoDTO>(`${this.url}/detalleCobroFactura/${facturaId}`);
    }

    registrar(cobro: Cobro) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Cobro>(`${this.url}/registrar`, cobro);
    }

    procesar(idCobro: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any>(`${this.url}/procesarCobro/${idCobro}`,);
    }

    buscarPorCodigoClienteYEstadoNuevo(codigoCliente: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cobro>(`${this.url}/codigoCliente/${codigoCliente}`);
    }

    generarReporte(numero: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/generarReporte/${numero}`, {
            responseType: 'blob'
        });
    }

    eliminarCobroFormaPago(cobroFormaPagoID: number, corboID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.delete<boolean>(`${this.url}/cobroFormaPago/${cobroFormaPagoID}/${corboID}`);
    }

    listarEstados() {
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/estados`;
        return this.http.get<any>(urlFinal);
    }

    consultarCobros(page: number, size: number, consulta: any) {
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this.http.post<any>(urlFinal, consulta);
    }

    validarExisteChequeEnOtrosCobros(codigoCliente: string, numeroCheque: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<boolean>(`${this.url}/validarChequeEnOtrosCobros/${codigoCliente}/${numeroCheque}`);
    }

    registrarCobroGeneral(cobro: Cobro) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Cobro>(`${this.url}/registrarCobroGeneral`, cobro);
    }

    listarCobroPorId(cobroId: number) {
        this.notificarService.activarLoading();
        return this.http.get<Cobro>(`${this.url}/${cobroId}`);
    }

    registrarCobroCuotaFactura(cobroId: number, cuotas: CobroCuotaFactura[]) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<Cobro>(`${this.url}/registrarCobroCuotas/${cobroId}`, cuotas);
    }

    deudaPorCliente(codigoCliente: string) {
        this.notificarService.activarLoading();
        return this.http.get<number>(`${this.url}/deudaCliente/${codigoCliente}`);
    }

    validarAnticipoAplicacionesEstadoError(numeroAnticipo: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<boolean>(`${this.url}/validarAnticipoTieneAplicacionesEstadoError/${numeroAnticipo}`);
    }

    listarCobrosPendientes() {
        this.notificarService.activarLoading();
        return this.http.get<Cobro[]>(`${this.url}/pendiente`);
    }

    reintegrar(idCobro: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CobroDTO>(`${this.url}/reintegrarCobro/${idCobro}`);
    }
}
