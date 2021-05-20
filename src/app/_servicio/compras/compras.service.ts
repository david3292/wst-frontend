import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrdenCompra } from 'src/app/_dominio/ventas/ordenCompra';
import { OrdenCompraDetalle } from 'src/app/_dominio/ventas/ordenCompraDetalle';
import { RecepcionCompra } from 'src/app/_dominio/ventas/recepcionCompra';
import { RecepcionCompraDetalle } from 'src/app/_dominio/ventas/recepcionCompraDetalle';
import { ArticuloCompraDTO } from 'src/app/_dto/compras/articuloCompraDTO';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import { RecepcionCompraDTO } from 'src/app/_dto/compras/recepcionCompraDTO';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class ComprasService extends BehaviorSubject<any>{

    private url: string = `${environment.HOST}/compras`;

    constructor(
        private _http: HttpClient,
        private _notificarService: NotificarService,
        private _sessionService: SessionService
    ) {
        super(null);
    }

    validarCompra(articuloCompra: ArticuloCompraDTO){
        let urlFinal = `${this.url}/validarCompra`;
        articuloCompra.puntoVenta = this._sessionService.puntoVenta();
        this._notificarService.activarLoading();
        return this._http.post<ArticuloCompraDTO>(urlFinal, articuloCompra);
    }

    crearActualizarArticuloCompra(articuloCompra: ArticuloCompraDTO){
        let urlFinal = `${this.url}/crearActualizarArticuloCompra`;
        this._notificarService.activarLoading();
        return this._http.post<any>(urlFinal, articuloCompra);
    }

    aprobarComprasPorCotizacionId(cotizacionId: number){
        let urlFinal = `${this.url}/aprobarCompras/${cotizacionId}`;
        return this._http.get<any>(urlFinal);
    }

    integrarOrdenesCompraPorCotizacionId(cotizacionId: number){
        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/integrarPorCotizacion/${cotizacionId}`;
        return this._http.post<any>(urlFinal, null);
    }

    listarOrdenesCompraPorCotizacionId(cotizacionId: number){
        this._notificarService.activarLoading();
        let urlFinal = `${this.url}/listarPorCotizacion/${cotizacionId}`;
        return this._http.get<OrdenCompraDTO[]>(urlFinal);
    }

    listarRecepcionesCompraPorCotizacionId(cotizacionId: number){
        let urlFinal = `${this.url}/listarPorCotizacion/recepciones/${cotizacionId}`;
        return this._http.get<RecepcionCompraDTO[]>(urlFinal);
    }

    generarReporteOrdenCompra(ordenCompraid: number){
        let urlFinal = `${this.url}/reporte/${ordenCompraid}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    generarReporteRecepcionCompra(recepcionCompra: number){
        let urlFinal = `${this.url}/reporteRecepcion/${recepcionCompra}`;
        this._notificarService.activarLoading();
        return this._http.get(urlFinal,{
            responseType: 'blob'
        });
    }

    listarComprasConError(){
        let puntoVenta = {'nombre': 'SUPERADMIN'};

        if(!this._sessionService.esSuperadmin())
            puntoVenta = this._sessionService.puntoVenta();

        let urlFinal = `${this.url}/comprasError`;
        this._notificarService.activarLoading();
        return this._http.post<OrdenCompraDTO[]>(urlFinal, puntoVenta);
    }

    listarRecepcionesConError(){
        let puntoVenta = {'nombre': 'SUPERADMIN'};

        if(!this._sessionService.esSuperadmin())
            puntoVenta = this._sessionService.puntoVenta();

        let urlFinal = `${this.url}/recepcionesError`;
        this._notificarService.activarLoading();
        return this._http.post<RecepcionCompraDTO[]>(urlFinal, puntoVenta);
    }

    procesarCompraPorId(compraId: number){
        let urlFinal = `${this.url}/integrar/${compraId}`;
        this._notificarService.activarLoading();
        return this._http.post<any>(urlFinal, null);
    }

    procesarRecepcionCompraPorId(compraId: number){
        let urlFinal = `${this.url}/integrar/recepcion/${compraId}`;
        this._notificarService.activarLoading();
        return this._http.post<any>(urlFinal, null);
    }

    listarComprasEmitidas(){
        let urlFinal = `${this.url}/recepciones/overview`;
        let usuarioId = this._sessionService.usuarioId();
        let puntoVentaId = this._sessionService.puntoVentaId();
        this._notificarService.activarLoading();
        return this._http.post<OrdenCompraDTO[]>(urlFinal, {
            'usuarioId': usuarioId,
            'puntoVentaId': puntoVentaId
        });
    }

    obtenerOrdenCompraPorId(ordenCompraId: number){
        let urlFinal = `${this.url}/ordenCompra/${ordenCompraId}`;
        this._notificarService.activarLoading();
        return this._http.get<OrdenCompra>(urlFinal);
    }

    actualizarRecepcion(detalle: RecepcionCompraDetalle){
        let urlFinal = `${this.url}/actualizar/recepcionDetalle`;
        this._notificarService.activarLoading();
        return this._http.post<RecepcionCompra>(urlFinal, detalle);
    }

    procesarRecepcion(recepcionCompraId: number){
        let urlFinal = `${this.url}/integrar/recepcion/${recepcionCompraId}`;
        this._notificarService.activarLoading();
        return this._http.post<any>(urlFinal, null);
    }

    listarRecepcionesPorOrdenCompraId(ordenCompraId: number){
        let urlFinal = `${this.url}/listarRecepciones/${ordenCompraId}`;
        this._notificarService.activarLoading();
        return this._http.get<RecepcionCompra[]>(urlFinal);
    }

    obtenerRecepcionCompraPorId(recepcionCompraId: number){
        let urlFinal = `${this.url}/recepcionCompra/${recepcionCompraId}`;
        this._notificarService.activarLoading();
        return this._http.get<RecepcionCompra>(urlFinal);
    }

    crearNuevaRecepcionCompra(ordenCompraId: number){
        let urlFinal = `${this.url}/nuevaRecepcionCompra/${ordenCompraId}`;
        this._notificarService.activarLoading();
        return this._http.get<RecepcionCompra>(urlFinal);
    }

    cerrarProcesoCompra(recepcionCompra: RecepcionCompra){
        let urlFinal = `${this.url}/cerrarProcesoCompra/${recepcionCompra.id}`;
        this._notificarService.activarLoading();
        return this._http.get<RecepcionCompra>(urlFinal);
    }

    obtenerDetallesComprasAprobacionPorCotizacionId(cotizacionId: number){
        let urlFinal = `${this.url}/detallesAprobacion/${cotizacionId}`;
        this._notificarService.activarLoading();
        return this._http.get<any>(urlFinal);
    }

    validarCantidadesCompra(cotizacionId: number){
        const urlFinal = `${this.url}/validarCantidadesOrdenCompra/${cotizacionId}`;
        this._notificarService.activarLoading();
            return this._http.get<any>(urlFinal);
    }
}
