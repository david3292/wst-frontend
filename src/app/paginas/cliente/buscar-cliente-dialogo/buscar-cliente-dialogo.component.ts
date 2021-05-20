import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStateChangeEvent, GridDataResult, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Cliente } from 'src/app/_dominio/ventas/cliente';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';

@Component({
    selector: 'app-buscar-cliente-dialogo',
    templateUrl: './buscar-cliente-dialogo.component.html',
    styleUrls: ['./buscar-cliente-dialogo.component.scss']
})
export class BuscarClienteDialogoComponent implements OnInit {

    public codigoBuscar: string = '';

    public clientes: Cliente[] = [];
    public clienteSeleccionado: any[] = [];
    public selectableSettings: SelectableSettings;
    public gridClientesView: GridDataResult;
    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
    }

    public clienteEncontrado: Cliente;

    constructor(private notificarService: NotificarService,
        private clienteService: ClienteService,
        private _router: Router,
        ) { }

    ngOnInit(): void {
        this.selectableSettings = {
            mode: 'single',
        }
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridClientesView = process(this.clientes, this.state);
    }

    public eventoSeleccion(context: RowArgs): any {
        return context.dataItem;
    }

    buscarClientePorCriterio() {
        if(this.codigoBuscar !== undefined && this.codigoBuscar!== null && this.codigoBuscar.length > 0){
            this.clienteService.listarActivosPorCriterio(this.codigoBuscar).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.clientes = data;
                this.gridClientesView = process(data, this.state);
            });
        }
    }

    activarBuscar() {
        return this.codigoBuscar == null || this.codigoBuscar == "";
    }

    activarEditar() {
        return this.clienteSeleccionado.length == 0;
    }

    onChangeBusqueda(value: any) {
        if (value.length > 3)
            this.buscarClientePorCriterio();
    }

    public nuevo(){
        this._router.navigate(['clientes/nuevo']);
    }

    public editar(){
        this._router.navigate(['clientes/edicion',this.clienteSeleccionado[0]['CUSTNMBR']]);
    }

}
