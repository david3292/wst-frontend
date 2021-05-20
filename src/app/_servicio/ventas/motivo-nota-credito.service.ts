import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {NotificarService} from '../notificar.service';
import {MotivoNotaCredito} from '../../_dominio/ventas/motivoNotaCredito';

@Injectable({
    providedIn: 'root'
})
export class MotivoNotaCreditoService {

    url: string = `${environment.HOST}/motivoNotaCredito`;

    constructor(
        private http: HttpClient,
        private notificarService: NotificarService
    ) {
    }

    obtenerTodos() {
        this.notificarService.activarLoading();
        return this.http.get<MotivoNotaCredito[]>(`${this.url}/listarTodos`);
    }
}
