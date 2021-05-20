import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AltConductor } from 'src/app/_dominio/alt/altConductor';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class AltConductorService {

    private url: string = `${environment.HOST}/conductores`

    constructor(
        private _httpClient: HttpClient,
        private _notificacionesService: NotificarService
    ) { }

    listarConductores(){
        this._notificacionesService.activarLoading();
        return this._httpClient.get<AltConductor[]>(this.url);
    }
}
