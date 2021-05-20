import { FormaPago } from './../../_dominio/sistema/formaPago';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class FormaPagoService {

    url: string = `${environment.HOST}/formasPago`;
    formasPagoCambio = new Subject<FormaPago[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    registrar(formaPago: FormaPago) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<FormaPago>(this.url, formaPago);
    }

    modificar(formaPago: FormaPago) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<FormaPago>(this.url, formaPago);
    }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FormaPago[]>(`${this.url}`);
    }

    listarActivos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FormaPago[]>(`${this.url}/activos`);
    }

    crearCatalgo(){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/catalogo`);
    }
}
