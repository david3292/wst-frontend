import { ConfiguracionUsuarioPerfil } from './../../_dominio/sistema/configuracionUsuarioPerfil';
import { AsignacionBodega } from './../../_dominio/sistema/asignacionBodega';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class AsignacionBodegaService {

    private url: string = `${environment.HOST}/asignacion-bodega`;
    constructor(
        private http: HttpClient,
        private notificarService: NotificarService) { }

    listarPorConfiguracionUsuarioPerfil(configuracionUsuarioPerfil: ConfiguracionUsuarioPerfil) {
        this.notificarService.activarLoading();
        return this.http.post<AsignacionBodega[]>(`${this.url}/listar-config-perfil`, configuracionUsuarioPerfil);
    }

    modificarAccesoBodegas(accesos: AsignacionBodega[]) {
        this.notificarService.activarLoading();
        return this.http.put<AsignacionBodega[]>(this.url, accesos);
    }


}
