import { FormaPagoPuntoVenta } from './../../_dominio/sistema/formaPagoPuntoVenta';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { ChequeraGP } from './../../_dominio/sistema/chequeraGP';

@Injectable({
    providedIn: 'root'
})
export class FormaPagoPuntoVentaService {

    url: string = `${environment.HOST}/formasPagoPuntoVenta`;
    formasPagoPuntoVentaCambio = new Subject<FormaPagoPuntoVenta[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    registrar(formaPagoPvta: FormaPagoPuntoVenta) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<FormaPagoPuntoVenta>(this.url, formaPagoPvta);
    }

    modificar(formaPagoPvta: FormaPagoPuntoVenta) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<FormaPagoPuntoVenta>(this.url, formaPagoPvta);
    }

    listarTodos(puntoVentaId: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FormaPagoPuntoVenta[]>(`${this.url}/puntoVenta/${puntoVentaId}`);
    }

    listarTodosActivos(puntoVentaId: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/puntoVentaActivos/${puntoVentaId}`);
    }

    listarChequerasGP() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<ChequeraGP[]>(`${this.url}/chequerasGP`);
    }

}
