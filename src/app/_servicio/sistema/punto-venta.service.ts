import {PuntoVenta} from './../../_dominio/sistema/puntoVenta';
import {NotificarService} from 'src/app/_servicio/notificar.service';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {environment} from './../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PuntoVentaService {

    private url: string = `${environment.HOST}/puntos-venta`;
    private urlActivos: string = `${this.url}/activos`;

    puntosVentaCambio = new Subject<PuntoVenta[]>();
    mensajeCambio = new Subject<string>();

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService) {
    }

    listarTodos() {
        this.notificarService.activarLoading();
        return this.http.get<PuntoVenta[]>(this.url);
    }

    listarTodosActivos() {
        this.notificarService.activarLoading();
        return this.http.get<PuntoVenta[]>(`${this.urlActivos}`);
    }

    registrar(puntoVenta: PuntoVenta) {
        this.notificarService.activarLoading();
        return this.http.post<PuntoVenta>(this.url, puntoVenta);
    }

    modificar(puntoVenta: PuntoVenta) {
        this.notificarService.activarLoading();
        return this.http.put<PuntoVenta>(this.url, puntoVenta);
    }

    listarPorIdPerfil(idPerfil: number) {
        this.notificarService.activarLoading();
        return this.http.get<PuntoVenta[]>(`${this.url}/perfil/${idPerfil}`);
    }
}
