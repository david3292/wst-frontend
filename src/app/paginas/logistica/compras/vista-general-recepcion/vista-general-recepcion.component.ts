import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { RecepcionCompra } from 'src/app/_dominio/ventas/recepcionCompra';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-vista-general-recepcion',
    templateUrl: './vista-general-recepcion.component.html',
    styleUrls: ['./vista-general-recepcion.component.scss']
})
export class VistaGeneralRecepcionComponent implements OnInit {

    public ordenesCompra: OrdenCompraDTO[] = [];
    public ordenCompraSeleccionada: OrdenCompraDTO;

    public recepcionesCompra: RecepcionCompra[];

    public abrirDetalle: boolean = false;

    public state: State = {
        skip: 0,
        take: 20,
        filter: {
            logic: 'and',
            filters: [{ field: 'numero', operator: 'contains', value: ''}]
        }
    }

    public gridDataOrdenesCompra: GridDataResult;

    constructor(
        private _notificarService: NotificarService,
        private _comprasService: ComprasService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(){
        this._comprasService.listarComprasEmitidas().subscribe(data => {
            this._notificarService.desactivarLoading();
            debugger;
            this.ordenesCompra = data;
            this.gridDataOrdenesCompra = process(this.ordenesCompra, this.state);
        });
    }

    public dataStateChange(state: DataStateChangeEvent){
        this.state = state;
        this.gridDataOrdenesCompra = process(this.ordenesCompra, state);
    }

    cargarOrdenCompraParaRecepcion(ordenCompra: OrdenCompraDTO){
        this._comprasService.listarRecepcionesPorOrdenCompraId(ordenCompra.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            if(data.length > 1){
                this.abrirDialogoRecepcionesCompra(data);
            }else{
                let recepcionCompra = _.first(data);
                if(recepcionCompra.estado === 'NUEVO')
                    this._router.navigate([`/compras/recepcion/${recepcionCompra.id}`]);
                else
                    this.abrirDialogoRecepcionesCompra(data);
            }
        });
    }

    abrirDialogoRecepcionesCompra(recepciones: RecepcionCompra[]){
        this.abrirDetalle = true;
        this.recepcionesCompra = recepciones;
    }

    public cerrarDetalle(){
        this.abrirDetalle = false;
    }
}
