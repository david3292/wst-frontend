import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CondicionPago } from 'src/app/_dominio/sistema/condicionPago';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class CondicionPagoService {

    url: string = `${environment.HOST}/condiciones-pago`;
    condicionesCambio = new Subject<CondicionPago[]>();

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarTodos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CondicionPago[]>(this.url)
    }

    listarTodosActivos() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CondicionPago[]>(`${this.url}/activos`)
    }

    listarPorId(idCondicionPago: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<CondicionPago>(`${this.url}/${idCondicionPago}`);
    }

    registrar(condicion: CondicionPago) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<CondicionPago>(this.url, condicion);
    }

    modificar(condicion: CondicionPago) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<CondicionPago>(this.url, condicion);
    }

    crearCatalogoTipoPago() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/catalogoTipoPago`);
    }

}
