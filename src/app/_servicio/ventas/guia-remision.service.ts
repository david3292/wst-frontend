import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DocumentoGuiaRemision} from 'src/app/_dominio/logistica/documentoGuiaRemision';
import {environment} from 'src/environments/environment';
import {NotificarService} from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class GuiaRemisionService {

    url: string = `${environment.HOST}/guiasRemision`;

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService
    ) {
    }

    listarTodasPorCotizacionID(cotizacionID: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/listarTodasPorCotizacion/${cotizacionID}`);
    }

    obtenerPorId(guiaRemisionId: number) {
        this.notificarService.activarLoading();
        return this.http.get<DocumentoGuiaRemision>(`${this.url}/${guiaRemisionId}`);
    }

    existeGuiaRemisionPorFacturaId(facturaId: number) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<boolean>(`${this.url}/existeGuiremision/${facturaId}`);
    }

    obtenerInfoGuiaRemision(guiaRemisionId: number) {
        const urlFinal = `${this.url}/obtenerInfoGuia/${guiaRemisionId}`;
        this.notificarService.activarLoading();
        return this.http.get<any>(urlFinal);
    }
}
