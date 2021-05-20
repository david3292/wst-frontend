import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class TransaccionService {

    url: string = `${environment.HOST}/facturaciones`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }


    listarFacturasEstadoError() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<DocumentoFactura[]>(`${this.url}/listarFacturasError`);
    }

    reintegrarFactura(facturaID: number){
        this.notificarService.loadingCambio.next(true);
        return this.http.get<FacturaDTO>(`${this.url}/reintegrar/${facturaID}`);
    }
}
