import { Cliente } from 'src/app/_dominio/ventas/cliente';
import { Component, OnInit } from '@angular/core';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

    public codigoBuscar: string = '';
    public gridClientesView: GridDataResult;
    public clientes: Cliente[] = [];
    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
    }

    constructor(
        private _notificarService: NotificarService,
        private _clienteService: ClienteService,
        public route : ActivatedRoute,
        public router : Router
    ) { }

    ngOnInit(): void {
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridClientesView = process(this.clientes, this.state);
    }


    public buscarClientePorCriterio() {
        if(this.codigoBuscar !== undefined && this.codigoBuscar!== null && this.codigoBuscar.length > 0){
            this._clienteService.listarPorCriterio(this.codigoBuscar).subscribe(data => {
                this._notificarService.loadingCambio.next(false);
                this.clientes = data;
                this.gridClientesView = process(data, this.state);
            });
        }
    }

    public editar(dataItem: Cliente){
        let navigationExtras: NavigationExtras = {
            queryParams: {
                "cliente" : JSON.stringify(dataItem),
            }
        };
        this.router.navigate(["clientes/edicion"], navigationExtras);
    }

}
