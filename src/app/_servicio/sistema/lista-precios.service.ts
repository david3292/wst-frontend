import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ArticuloListaPrecioDTO } from 'src/app/_dto/logistica/articuloListaPrecioDTO';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class ListaPreciosService {

    private url: string = `${environment.HOST}/lista-precios`;

    public articulosSubject = new Subject<ArticuloListaPrecioDTO[]>();

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService,
        ) { }

    obtenerArticulosListaPrecio(consultaArticulos: any){
        const urlFinal = `${this.url}/articulosPrecioConsulta`;
        this.notificarService.activarLoading();
        return this.http.post<ArticuloListaPrecioDTO[]>(urlFinal,consultaArticulos);
    }

    obtenerClases(){
        const urlFinal = `${this.url}/clasesArticulo`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urlFinal);
    }

    procesarListaPrecios(articulos: ArticuloListaPrecioDTO[]){
        const urlFinal = `${this.url}/procesarListaPrecios`;
        this.notificarService.activarLoading();
        return this.http.post<any[]>(urlFinal, articulos);
    }

    obtenerOrdenesCompraRecibidasPorItem(codigoArticulo: string){
        const urFinal = `${this.url}/obtenerOrdenesCompraRecibidasPorItem/${codigoArticulo}`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urFinal);
    }

    obtenerOrdenesCompraEnTransitoPorItem(codigoArticulo: string){
        const urFinal = `${this.url}/obtenerOrdenesCompraEnTransitoPorItem/${codigoArticulo}`;
        this.notificarService.activarLoading();
        return this.http.get<any[]>(urFinal);
    }

}
