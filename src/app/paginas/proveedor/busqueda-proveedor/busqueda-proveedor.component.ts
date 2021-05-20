import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DataStateChangeEvent, GridDataResult, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { process, State } from '@progress/kendo-data-query';
import { from, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Proveedor } from 'src/app/_dominio/compras/proveedor';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ProveedorService } from 'src/app/_servicio/proveedor/proveedor.service';

@Component({
    selector: 'app-busqueda-proveedor',
    templateUrl: './busqueda-proveedor.component.html',
    styleUrls: ['./busqueda-proveedor.component.scss']
})
export class BusquedaProveedorComponent implements AfterViewInit {

    @ViewChild('searchText') searchText: TextBoxComponent;

    public criterioBuscar: string = '';
    public proveedores: Proveedor[] = [];
    public proveedorSeleccionado: any[] = [];
    public selectableSettings: SelectableSettings = {
        mode: 'single'
    };
    public gridProveedoresView: GridDataResult;
    public state: State = {
        skip: 0,
        take: 10,
        sort: []
    }

    constructor(
        private _notificarService: NotificarService,
        private _proveedorService: ProveedorService
    ) { }
    ngAfterViewInit(): void {
        this.iniciarObservable();
    }

    ngOnInit(): void {
        this.selectableSettings = {
            mode: 'single'
        }
    }

    iniciarObservable(){
        this.searchText.valueChange.asObservable().pipe(
            debounceTime(500),
            switchMap(() => this._proveedorService.listarPorCriterio(this.criterioBuscar)),
            tap(data => console.log(data))
        )
        .subscribe(data => this.actualizarProveedoresEncontrados(data));
    }

    dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridProveedoresView = process(this.proveedores, this.state);
    }

    buscarProveedor() {
        this._proveedorService.listarPorCriterio(this.criterioBuscar)
        .subscribe(data => this.actualizarProveedoresEncontrados(data));
    }

    actualizarProveedoresEncontrados(proveedores: Proveedor[]){
        this._notificarService.desactivarLoading();
        this.state = {
            skip: 0,
            take: 10,
            sort: []
        }

        this.proveedores = proveedores;
        this.gridProveedoresView = process(this.proveedores, this.state);
    }

    public eventoSeleccion(context: RowArgs): any {
        return context.dataItem;
    }
}
