import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { Empresa } from 'src/app/_dominio/ventas/empresa';

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {
    url: string = `${environment.HOST}/empresa`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    informacionEmpresa() {
        return this.http.get<Empresa>(`${this.url}/informacion`);
    }
}
