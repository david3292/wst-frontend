import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proveedor } from 'src/app/_dominio/compras/proveedor';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {

    private url: string = `${environment.HOST}/proveedores`

    constructor(
        private _http: HttpClient,
        private _notificarService: NotificarService
    ) { }

    listarPorCriterio(criterio: string){
        let urlFinal = `${this.url}/buscarPorCriterio`;
        this._notificarService.activarLoading();
        return this._http.post<Proveedor[]>(urlFinal, {
            'criterio': criterio
        });
    }

    obtenerCondicionesPago(){
        let urlFinal = `${this.url}/condicionesPago`;
        this._notificarService.activarLoading();
        return this._http.get<string[]>(urlFinal);
    }
}
