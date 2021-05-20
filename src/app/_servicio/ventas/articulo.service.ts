import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { Articulo } from 'src/app/_dominio/ventas/articulo';
import { SessionService } from '../session.service';
import { CriterioArticuloDTO } from 'src/app/_dominio/ventas/criterioArticuloDTO';
import { ArticuloListaPrecioDTO } from 'src/app/_dto/logistica/articuloListaPrecioDTO';

@Injectable({
    providedIn: 'root'
})
export class ArticuloService {

    url: string = `${environment.HOST}/articulos`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService) { }

    listarPorCriterio(criterio: string) {
        this.notificarService.loadingCambio.next(true);
        let dto = new CriterioArticuloDTO();
        dto.criterio = criterio;
        dto.puntoVenta = this.sessionService.puntoVenta();
        return this.http.post<Articulo[]>(`${this.url}/listarPorCriterio`,dto );
    }

    listarPorCriterioPerfil(criterio: string) {
        this.notificarService.loadingCambio.next(true);
        let dto = new CriterioArticuloDTO();
        dto.criterio = criterio;
        dto.puntoVenta = this.sessionService.puntoVenta();
        dto.perfil = this.sessionService.perfil();
        return this.http.post<Articulo[]>(`${this.url}/listarPorCriterioPerfil`,dto );
    }

    obtenerStockArticuloPorItemnmbr(itemnmbr: string) {
        let solicitud = { itemnmbr: itemnmbr, puntoVenta: this.sessionService.puntoVentaNombre() };
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any[]>(`${this.url}/stockPorCodigo/`, solicitud);
    }

    obtenerStockArticuloPorItemnmbrYPuntoVenta(itemnmbr: string, puntoVentaNombre: string) {
        let solicitud = { itemnmbr: itemnmbr, puntoVenta: puntoVentaNombre };
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any[]>(`${this.url}/stockPorCodigo/`, solicitud);
    }

    obtenerStockArticuloPorItemnmbrYPuntoVentaNoVendedor(itemnmbr: string, puntoVentaNombre: string) {
        let solicitud = { itemnmbr: itemnmbr, puntoVenta: puntoVentaNombre };
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any[]>(`${this.url}/stockPorCodigoNoVendedor/`, solicitud);
    }

    obtenerStock(itemnmbr: string, puntoVentaCotizacion: string) {
        let solicitud = { itemnmbr: itemnmbr, puntoVenta:  puntoVentaCotizacion};
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any[]>(`${this.url}/stockBodegas/`, solicitud);
    }

    obtenerArticuloPorCodigo(codigoArticulo: string){
        let urlFinal = `${this.url}/byCodigoArticulo/${codigoArticulo}`;
        this.notificarService.activarLoading();
        return this.http.get<any>(urlFinal);
    }

    obtenerClasesPorPerfil(){
        let urlFinal = `${this.url}/clasesPorPerfil`;
        this.notificarService.activarLoading();
        let perfil = this.sessionService.perfil();
        return this.http.post<any[]>(urlFinal, perfil);
    }

    obtenerUnidadesMedida(){
        let urlFinal = `${this.url}/unidadesMedida`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urlFinal);
    }

    obtenerMarcasArticulo(){
        let urlFinal = `${this.url}/marcasArticulo`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urlFinal);
    }

    obtenerListaPrecios(){
        let urlFinal = `${this.url}/listaPrecios`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urlFinal);
    }

    crearActualizarArticulo(articulo: any){
        let urlFinal = `${this.url}/crearActualizar`;
        this.notificarService.activarLoading();
        return this.http.post<any>(urlFinal, articulo);
    }

}
