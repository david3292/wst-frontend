import { ConfiguracionSistema } from './../../_dominio/sistema/configuracionSistema';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionSistemaService {

    url: string = `${environment.HOST}/configuraciones`;

    configuracionSistemaCambio = new Subject<ConfiguracionSistema[]>();

    mensajeCambio = new Subject<string>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ConfiguracionSistema[]>(this.url)
    }

    listarPorId(idConfiguracion: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ConfiguracionSistema>(`${this.url}/${idConfiguracion}`);
    }

    registrar(configuracion: ConfiguracionSistema) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<ConfiguracionSistema>(this.url, configuracion);
    }

    modificar(configuracion: ConfiguracionSistema) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<ConfiguracionSistema>(this.url, configuracion);
    }


    obtenerPorcentajeVariacionPrecio() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ConfiguracionSistema>(`${this.url}/variacionPrecio`);
    }

    obtenerPorcentajeMaximoDescuentoFijo() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ConfiguracionSistema>(`${this.url}/porcentajeDescuentoFijo`);
    }

    listarCatalogoConfiguraciones(){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/configuracionesCatalogo`);
    }

    listarCatalogoConfiguracionesUnidades(){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/configuracionesUnidadesCatalogo`);
    }
}
