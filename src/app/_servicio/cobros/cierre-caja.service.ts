import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Caja } from 'src/app/_dominio/cobros/caja';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class CierreCajaService {

    url: string = `${environment.HOST}/cierreCajas`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService,
        private sessionService: SessionService) { }

    consultarPreCierreCaja() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Caja>(`${this.url}/${this.sessionService.puntoVentaId()}`);
    }

    cerrarCaja(caja: Caja) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post(`${this.url}/cerrar`, caja, {
            responseType: 'blob'
        });
    }

    consultarCajaCierre(page: number, size: number, consulta: any) {
        this.notificarService.activarLoading();
        let urlFinal = `${this.url}/consulta/?page=${page}&size=${size}`;
        return this.http.post<any>(urlFinal, consulta);
    }

    consultarCierreCajaDetalle(cajaId: number, formaPago: string, usuario: string, perfil: string) {
        this.notificarService.loadingCambio.next(true);
        const conuslta = {
            'idCaja': cajaId,
            'formaPago': formaPago,
            'nombreUsuario': usuario,
            'perfil': perfil
        }
        return this.http.post<any>(`${this.url}/cierreCajaDetalle`, conuslta);
    }

    generarReporte(cajaId: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get(`${this.url}/reporte/${cajaId}`, {
            responseType: 'blob'
        });
    }

}
