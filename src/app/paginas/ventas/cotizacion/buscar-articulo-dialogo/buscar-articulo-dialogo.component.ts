import { Component, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult, PageChangeEvent, RowArgs } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, process, State } from '@progress/kendo-data-query';
import { Observable, forkJoin } from 'rxjs';
import { Bodega } from 'src/app/_dominio/sistema/bodega';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaBodegaService } from 'src/app/_servicio/sistema/punto-venta-bodega.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import { StockDialogoComponent } from './stock-dialogo/stock-dialogo.component';

@Component({
    selector: 'app-buscar-articulo-dialogo',
    templateUrl: './buscar-articulo-dialogo.component.html',
    styleUrls: ['./buscar-articulo-dialogo.component.scss']
})
export class BuscarArticuloDialogoComponent implements OnInit {

    public bodegaPrincipal: string = "";
    public criterioBusqueda: string;
    public gridArticulosView: GridDataResult;
    public articulosSeleccionados: any[];
    public articulosEncontrados: any[] = [];

    public pageSize = 10;
    public skip = 0;
    public state: State = {
        skip: 0,
        sort: [/* { field: 'ITEMDESC', dir: 'asc' } */],
        filter: {
            logic: 'and',
            filters: [{ field: 'ITEMNMBR', operator: 'startswith', value: '' }]
        }
    };
    public view = new Array(this.pageSize).fill({}).map(x => ({}));

    private data: Object[];
    public mySelection: any[] = [];

    constructor(private notificarService: NotificarService,
        private articuloService: ArticuloService,
        private dialogService: DialogService,
        private _puntoVentaBodegaService: PuntoVentaBodegaService) { }

    ngOnInit(): void {
        this.setearListas().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.articulosEncontrados = data[1];
            this.gridArticulosView = process(data[1], this.state);
            //this.buscarArticuloPorCriterio(data[1]);
            this.obtenerBodegaPrincipal(data[0]);
        })
    }

    setearListas(): Observable<any[]> {
        let bprincipal = this._puntoVentaBodegaService.buscarBodegaPrincipal();
        let articulos = this.articuloService.listarPorCriterio(this.criterioBusqueda);
        return forkJoin([bprincipal, articulos]);
    }

    buscarArticuloPorCriterio() {
        this.articuloService.listarPorCriterio(this.criterioBusqueda).subscribe(data => {
            this.notificarService.desactivarLoading();
            debugger
            this.articulosEncontrados = data;
            //this.loadItems();
            this.gridArticulosView = process(data, this.state);
        })

    }

    obtenerBodegaPrincipal(data: Bodega) {
        if(data == null){
            this.bodegaPrincipal = "No Bodega"
        }else{
            this.bodegaPrincipal = data.codigo
        }

    }

    public onChangeBusqueda(value: string) {
        if (value.length > 3) {
            this.articuloService.listarPorCriterio(value).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.articulosEncontrados = data;
                //this.loadItems();
                this.gridArticulosView = process(data, this.state);
            })
        }
    }

    pageChange(event: PageChangeEvent): void {
        this.skip = event.skip;
        this.loadItems();
    }

    private loadItems(): void {
        this.gridArticulosView = process(this.articulosEncontrados, this.state);
        /* const currentView = this.articulosEncontrados.slice(this.skip, this.skip + this.pageSize);

        const removeCount = this.view.length - currentView.length;

        if (removeCount > 0) {
            this.view.splice(currentView.length - 1, removeCount);
        }

        currentView.forEach((item, index) => {
            if (!this.view[index]) {
            this.view[index] = {};
            }
            Object.assign(this.view[index], item);
        });

        this.gridArticulosView = {
            data: this.view,
            total: this.articulosEncontrados.length
        }; */
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridArticulosView = process(this.articulosEncontrados, this.state);
    }

    public mySelectionKey(context: RowArgs): any {
        return context.dataItem;
    }

    consultarStock(value) {
        this.articuloService.obtenerStockArticuloPorItemnmbr(value.ITEMNMBR).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.abrirStockDialogo(data);
        })
    }

    abrirStockDialogo(data) {
        const dialogRefStock = this.dialogService.open({
            content: StockDialogoComponent,
            minWidth: 400,
            maxWidth: 500,
            title: `Stock: ${data.codigoArticulo}`,
            actions: [{ text: 'Aceptar', primary: true }],
        });

        const stockArticulos = dialogRefStock.content.instance;
        stockArticulos.stock = data;
        dialogRefStock.result.subscribe(r => {

            if (r['text'] == 'Aceptar') {
                dialogRefStock.close();
            }
        });
    }

}
