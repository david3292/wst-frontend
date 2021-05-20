import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificarService } from '../notificar.service';
import { Bodega } from 'src/app/_dominio/sistema/bodega';
import { ReposicionDTO } from 'src/app/_dto/logistica/reposicionDTO';
import { ReposicionDetalleDTO } from 'src/app/_dto/logistica/reposicionDetalleDTO';
import { ArticuloReposicionDTO } from 'src/app/_dto/logistica/articuloReposicionDTO';

@Injectable({
    providedIn: 'root'
})
export class ReposicionService {

    private url: string = `${environment.HOST}/reposiciones`

    constructor(
        private _http: HttpClient,
        private _notificarService: NotificarService,
    ) { }

    listarBodegaCentroDistribucion() {
        return this._http.get<Bodega[]>(`${this.url}/centroDistribucion`);
    }

    listarBodegaReposicionInventario() {
        return this._http.get<Bodega[]>(`${this.url}/reposicionInventario`);
    }

    sugerirReposicion(origen: string, destino: string) {
        this._notificarService.activarLoading();
        const obj = {
            "bodegaOrigen": origen,
            "bodegaDestino": destino
        }
        return this._http.post<ReposicionDTO>(`${this.url}/sugerencia`, obj);
    }

    actualizarLineaDetalle(detalle: ReposicionDetalleDTO) {
        this._notificarService.activarLoading();
        return this._http.post<any>(`${this.url}/actualizarLinea`, detalle);
    }

    anular(idReposicion: number) {
        this._notificarService.activarLoading();
        return this._http.get(`${this.url}/anular/${idReposicion}`);
    }

    emitir(idReposicion: number) {
        this._notificarService.activarLoading();
        return this._http.get(`${this.url}/emitir/${idReposicion}`);
    }

    eliminarDetalle(idReposicionDetalle: number) {
        this._notificarService.activarLoading();
        return this._http.get<Boolean>(`${this.url}/eliminarDetalle/${idReposicionDetalle}`);
    }

    reposicionArticulo(codigoArticulo: string, codigoBodega: string, bodegaOrigen: boolean, cantidadReponer: number) {
        this._notificarService.activarLoading();
        const obj = {
            "codigoArticulo": codigoArticulo,
            "codigoBodega": codigoBodega,
            "bodegaOrigen": bodegaOrigen,
            "cantidadReponer": cantidadReponer
        }
        return this._http.post<ArticuloReposicionDTO>(`${this.url}/reposicionArticulo`, obj);
    }
}
