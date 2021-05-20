import { Component, OnInit, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, forkJoin } from 'rxjs';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { process, State } from '@progress/kendo-data-query';
import { EditService } from '../../ventas/cotizacion/edit.service';
import { ArticuloListaPrecioDTO } from 'src/app/_dto/logistica/articuloListaPrecioDTO';
import { map } from 'rxjs/operators';
import { ListaPreciosService } from 'src/app/_servicio/sistema/lista-precios.service';
import * as _ from 'lodash';
import { DialogService, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { IntlService } from '@progress/kendo-angular-intl';

const crearFormularioBusqueda = dataItem => new FormGroup({
    'articuloDesde': new FormControl(dataItem.articuloDesde, Validators.required),
    'articuloHasta': new FormControl(dataItem.articuloHasta),
    'claseDesde': new FormControl(dataItem.claseDesde, Validators.required),
    'claseHasta': new FormControl(dataItem.claseHasta)
});

@Component({
    selector: 'app-lista-precios',
    templateUrl: './lista-precios.component.html',
    styleUrls: ['./lista-precios.component.scss']
})
export class ListaPreciosComponent implements OnInit {

    public formularioConsulta: FormGroup;

    public codigoArticulo: string = '';
    public codigoAlterno: string = '';
    public claseArticulo: string = '';

    public articuloHasta: string;
    public claseHasta: any;

    public margenVentaMinimo: number = 0;
    public descuento: number = 0;

    public articuloSeleccionado: ArticuloListaPrecioDTO;

    public articulosCalcular: ArticuloListaPrecioDTO[] = [];
    public clasesArticulo: string[] = [];
    public comprasTransito: any[] = [];
    public comprasRecibidas: any[] = [];

    public ordenesRecibidas: any[] = [];
    public ordenesTransito: any[] = [];

    public novedadesProceso: any[] = [];

    public pruebas: any[]=[];

    public gridState: State = {
        skip: 0,
        take: 20,
        filter: {
            logic: 'and',
            filters: [{ field: 'numero', operator: 'contains', value: ''}]
        }
    }

    public view: Observable<GridDataResult>;

    @ViewChild("containerDialog", { read: ViewContainerRef})
    public containerDialog: ViewContainerRef;

    @ViewChild("templateDetalle", {read: TemplateRef})
    public templateDetalle: TemplateRef<any>;

    @ViewChild("templateNovedades", {read: TemplateRef})
    public templateNovedades: TemplateRef<any>;

    constructor(
        private _notificarService: NotificarService,
        private _editService: EditService,
        private _listaPreciosService: ListaPreciosService,
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        public _intl: IntlService
    ) { }

    ngOnInit(): void {
        this.cargarClasesArticulos();
        this.view = this._editService.pipe(map(data => process(data, this.gridState)));
        this._listaPreciosService.articulosSubject.subscribe(data => {
            this.realizarCalculos();
        });
        this.formularioEnBlanco();
    }

    cargarClasesArticulos(){
        this._listaPreciosService.obtenerClases().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.clasesArticulo = _.map(data, d => {
                return d.ITMCLSCD
            });
        });
    }

    formularioEnBlanco(){
        this.formularioConsulta = crearFormularioBusqueda({
            'articuloDesde': null,
            'articuloHasta': null,
            'claseDesde': null,
            'claseHasta': null
        });
    }

    public consultarArticulos(){
        this.novedadesProceso = [];

        if(!(_.isEmpty(this.codigoArticulo) && _.isEmpty(this.codigoAlterno) && _.isEmpty(this.claseArticulo))) {
            debugger;
            this._listaPreciosService.obtenerArticulosListaPrecio({
                'ITEMNMBR': this.codigoArticulo,
                'ITMSHNAM': this.codigoAlterno,
                'ITMCLSCD': this.claseArticulo,
            }).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.cargarArticulos(data);
                console.log(this.clasesArticulo);
            });
        }else{
            this._notificarService.mostrarMensajeError('Ingrese al menos un criterio de búsqueda');
        }

    }

    private cargarArticulos(articulos: ArticuloListaPrecioDTO[]){
        this.articulosCalcular = articulos;
        this._editService.next(this.articulosCalcular);
    }

    public onStateChange(state: State){
        this.gridState = state;
        this.view = this._editService.pipe(map(data => process(data, this.gridState)));
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public aplicarMargenTodo(){
        if(!_.isEmpty(this.articulosCalcular)){
            this._notificarService.activarLoading();
            _.forEach(this.articulosCalcular, (a) => {
                a.margenPrecioVtaMin = this.margenVentaMinimo;
            });
            this.realizarCalculos();
            this._notificarService.desactivarLoading();
            this._notificarService.mostrarMensajeExito('Margen aplicado');
        }else{
            this._notificarService.mostrarMensajeError('No existen registros para aplicar');
        }
    }

    public aplicarDescuentoTodo(){
        if(!_.isEmpty(this.articulosCalcular)){
            this._notificarService.activarLoading();
            _.forEach(this.articulosCalcular, (a) => {
                a.descuento = this.descuento;
            });
            this.realizarCalculos();
            this._notificarService.desactivarLoading();
            this._notificarService.mostrarMensajeExito('Descuento aplicado');
        }else{
            this._notificarService.mostrarMensajeError('No existen registros para aplicar');
        }
    }

    public cellCloseHandler(args: any) {
        let { formGroup, dataItem, column } = args;
        debugger;
        if(formGroup.valid){
            this.calcularFila(dataItem);
            this._editService.assignValues(dataItem, formGroup.value);
            this._editService.update(dataItem);
            this._listaPreciosService.articulosSubject.next(this.articulosCalcular);
        }else{
            args.preventDefault();
        }

    }

    private isReadOnly(field: string): boolean {
        let readOnly = ['codigo','codigoAlterno','descripcion','unidadMedida','pesoKg','stock','costoPromedio','costoUnitario',
        'precioVentaActual','precioVtaDescuento','precioVentaRealKilIva','margenPrecioVtaReal',
        'factorCosto','precioVentaFactor','margenFactor'];
        const readOnlyColumns = readOnly;
        return readOnlyColumns.indexOf(field) > -1;
    }

    createFormGroup(dataItem: any): FormGroup {
        return this._formBuilder.group({
            'codigo': dataItem.codigo,
            'codigoAlterno': dataItem.codigoAlterno,
            'descripcion': dataItem.descripcion,
            'unidadMedida': dataItem.unidadMedida,
            'pesoKg': dataItem.pesoKg,
            'stock': dataItem.stock,
            'costoPromedio': dataItem.costoPromedio,
            'costoUnitario': dataItem.costoUnitario,
            'precioVentaActual': dataItem.precioVentaActual,
            'margenPrecioVtaMin': [dataItem.margenPrecioVtaMin, Validators.compose([Validators.required,Validators.min(0),Validators.max(100)])],
            'deshabilitarPrecioVenta': dataItem.deshabilitarPrecioVenta,
            'precioVenta': dataItem.precioVenta,
            'descuento': [dataItem.descuento, Validators.compose([Validators.required,Validators.min(0),Validators.max(100)])],
            'precioVtaDescuento': dataItem.precioVtaDescuento,
            'precioVentaRealKilIva': dataItem.precioVentaRealKilIva,
            'margenPrecioVtaReal': dataItem.margenPrecioVtaReal,
            'factorCosto': dataItem.factorCosto,
            'precioVentaFactor': dataItem.precioVentaFactor,
            'margenFactor': dataItem.margenFactor
        });
    }

    public realizarCalculos(){
        if(!_.isEmpty(this.articulosCalcular)){
            _.forEach(this.articulosCalcular, (a) => {
                if(a.margenPrecioVtaMin > 0){
                    this.calcularFila(a);
                }
            });
            this._editService.next(this.articulosCalcular);
        }
    }

    private calcularFila(a: ArticuloListaPrecioDTO){
        if(!a.deshabilitarPrecioVenta)
            a.precioVenta = this.calculoPrecioVenta(a);

        a.precioVtaDescuento = this.calcularPrecioVentaConDescuento(a);
        a.precioVentaRealKilIva = this.calcularPrecioVentaRealKilIva(a);
        a.margenPrecioVtaReal = this.calcularMargenPrecioVentaReal(a);
        a.factorCosto = this.calcularFactorCosto(a);
        a.precioVentaFactor = this.calcularPrecioVentaFactor(a);
        a.margenFactor = this.calcularMargenFactor(a);
    }

    private calculoPrecioVenta(a: ArticuloListaPrecioDTO): number{
        debugger;
        let numerador = a.costoUnitario / (1 - (a.margenPrecioVtaMin/100));
        let denominador = (1 - (a.descuento/100));
        return Number.parseFloat((numerador/denominador).toFixed(2));
    }

    private calcularPrecioVentaConDescuento(a: ArticuloListaPrecioDTO): number {
        return a.precioVenta - (a.precioVenta * a.descuento / 100);
    }

    private calcularPrecioVentaRealKilIva(a: ArticuloListaPrecioDTO): number {
        let calculo = 0;
        let iva = a.iva > 0 ? (a.iva / 100) : 0.12
        if(a.pesoKg !== 0)
            calculo = (a.precioVtaDescuento / a.pesoKg) * (1 + iva)

        return calculo;
    }

    private calcularMargenPrecioVentaReal(a: ArticuloListaPrecioDTO): number {
        let calculo = 0;
        if(a.precioVtaDescuento != 0)
            calculo = (a.precioVtaDescuento - a.costoPromedio)/a.precioVtaDescuento;

        return calculo;
    }

    private calcularFactorCosto(a: ArticuloListaPrecioDTO): number {
        let calculo = 0;
        if(a.costoUnitario)
            calculo = a.precioVenta / a.costoUnitario;
        return calculo;
    }

    private calcularPrecioVentaFactor(a: ArticuloListaPrecioDTO): number {
        return a.factorCosto * a.costoPromedio;
    }

    private calcularMargenFactor(a: ArticuloListaPrecioDTO): number {
        let calculoComun = a.precioVentaFactor - (a.precioVentaFactor * (a.descuento / 100));
        let numerador = calculoComun - a.costoPromedio;
        let denominador = calculoComun;
        return numerador / denominador;
    }

    public guardarListaPrecios(){
        this._listaPreciosService.procesarListaPrecios(this.articulosCalcular).subscribe((data) => {
            this._notificarService.desactivarLoading();
            if(_.isEmpty(data)){
                this.novedadesProceso = [];
                this._notificarService.mostrarMensajeExito('Proceso ejecutado correctamente');
            } else {
                this.novedadesProceso = data;
                this._notificarService.mostrarMensajeError('Existen novedades en el proceso');
                const dialogo = this._dialogService.open({
                    appendTo: this.containerDialog,
                    title: 'Novedades',
                    content: this.templateNovedades,
                    minWidth: 700,
                    maxWidth: '50%',
                    maxHeight: '50%',
                    actions: [
                        { text: 'Aceptar', primary: true }
                    ]
                });

                dialogo.result.subscribe((result) => {
                    if(result instanceof DialogCloseResult){
                    }
                    else if(result['text'] === 'Aceptar'){
                    }
                });
            }
        });
    }

    public eliminar(dataItem: any) {
        _.remove(this.articulosCalcular, (a) => {
            return a.uuid === dataItem.uuid;
        });
        this._editService.next(this.articulosCalcular);
    }

    limpiarConsulta(){
        this.codigoArticulo = '';
        this.codigoAlterno = '';
        this.claseArticulo = '';
        this.articulosCalcular = [];
        this._editService.next(this.articulosCalcular);
    }

    abrirDialogoDetallearticulo(articulo: ArticuloListaPrecioDTO){
        this.articuloSeleccionado = articulo;
        let ordenesRecebidas = this._listaPreciosService.obtenerOrdenesCompraRecibidasPorItem(articulo.codigo);
        let ordenesTransito = this._listaPreciosService.obtenerOrdenesCompraEnTransitoPorItem(articulo.codigo);
        forkJoin([ordenesRecebidas, ordenesTransito]).subscribe((data) => {
            this._notificarService.desactivarLoading();
            this.ordenesRecibidas = data[0];
            this.ordenesTransito = data[1];
            this.calularMargenOrdenesTransito();

            const dialogo = this._dialogService.open({
                appendTo: this.containerDialog,
                title: 'Detalle Artículo',
                content: this.templateDetalle,
                minWidth: 700,
                maxWidth: '50%',
                actions: [
                    { text: 'Aceptar', primary: true }
                ]
            });

            dialogo.result.subscribe((result) => {
                if(result instanceof DialogCloseResult){
                    this.ordenesRecibidas = [];
                    this.ordenesTransito = [];
                    this.articuloSeleccionado = undefined;
                }
                else if(result['text'] === 'Aceptar'){
                    this.ordenesRecibidas = [];
                    this.ordenesTransito = [];
                    this.articuloSeleccionado = undefined;
                }
            });
        });

    }

    private calularMargenOrdenesTransito(){
        if(!_.isEmpty(this.ordenesTransito)){
            _.forEach(this.ordenesTransito, (a) => {
                a.margen = this.calcularMargenOC_Transito(a);
            });
        }
    }

    private calcularMargenOC_Transito(a: any): number {
        if(a.UNITCOST != 0 && this.articuloSeleccionado.precioVtaDescuento != 0){
            return (this.articuloSeleccionado.precioVtaDescuento - a.UNITCOST) / this.articuloSeleccionado.precioVtaDescuento;
        }else{
            return 0;
        }

    }

    abrirDialogoConfimacionMargen(){

        const dialogo = this._dialogService.open({
            appendTo: this.containerDialog,
            title: 'AplicarMargen',
            content: '¿Confirma la aplicación de la modificación a todos los artículos que se muestran en la búsqueda?',
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true }
            ]
        });

        dialogo.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
            }
            else if(result['text'] === 'Aceptar'){
                this.aplicarMargenTodo();
            }else if(result['text'] === 'Cancelar'){
            }
        });

    }

    abrirDialogoConfimacionDescuento(){

        const dialogo = this._dialogService.open({
            appendTo: this.containerDialog,
            title: 'Aplicar Descuento',
            content: '¿Confirma la aplicación de la modificación a todos los artículos que se muestran en la búsqueda?',
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true }
            ]
        });

        dialogo.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
            }
            else if(result['text'] === 'Aceptar'){
                this.aplicarDescuentoTodo();
            }else if(result['text'] === 'Cancelar'){
            }
        });

    }

    abrirDialogoConfimacionGuardarLista(){

        const dialogo = this._dialogService.open({
            appendTo: this.containerDialog,
            title: 'Guardar Lista',
            content: '¿Está seguro de aplicar los cambios realizados a los artículos que se muestran en el resultado de búsqueda?',
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true }
            ]
        });

        dialogo.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
            }
            else if(result['text'] === 'Aceptar'){
                this.guardarListaPrecios();
            }else if(result['text'] === 'Cancelar'){
            }
        });

    }
}
