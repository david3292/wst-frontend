import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificarService } from '../notificar.service';
import { Cliente } from 'src/app/_dominio/ventas/cliente';
import { CriterioClienteDTO } from 'src/app/_dominio/ventas/criterioClienteDTO';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    url: string = `${environment.HOST}/clientes`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    listarPorCustomerNumber(customerNumber: string) {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<Cliente>(`${this.url}/${customerNumber}`);
    }

    listarPorCriterio(criterio: string) {
        this.notificarService.loadingCambio.next(true);
        let dto = new CriterioClienteDTO();
        dto.criterio = criterio;
        return this.http.post<Cliente[]>(`${this.url}/clientePorCriterio`, dto);
    }

    listarActivosPorCriterio(criterio: string) {
        this.notificarService.loadingCambio.next(true);
        let dto = new CriterioClienteDTO();
        dto.criterio = criterio;
        return this.http.post<Cliente[]>(`${this.url}/clientesActivosPorCriterio`, dto);
    }


    calcularCreditoDisponible(customerNumber: string, crtmlmt: number) {
        return this.http.get<any>(`${this.url}/creditoDisponible/${customerNumber}/${crtmlmt}`);
    }

    calcularCreditoDisponibleGP(customerNumber: string) {
        return this.http.get<any>(`${this.url}/creditoDisponibleGP/${customerNumber}`);
    }

    registrar(cliente: Cliente) {
        this.notificarService.loadingCambio.next(true);
        return this.http.post<any>(this.url, cliente);
    }

    modificar(cliente: Cliente) {
        this.notificarService.loadingCambio.next(true);
        return this.http.put<any>(this.url, cliente);
    }

    listarPaisesGP() {
        this.notificarService.loadingCambio.next(true);
        return this.http.get<any[]>(`${this.url}/listarPaisesGP`);
    }

}
