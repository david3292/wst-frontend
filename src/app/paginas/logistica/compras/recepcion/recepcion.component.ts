import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { EditService } from 'src/app/paginas/ventas/cotizacion/edit.service';
import { OrdenCompra } from 'src/app/_dominio/ventas/ordenCompra';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';
import { RecepcionCompra } from 'src/app/_dominio/ventas/recepcionCompra';

@Component({
    selector: 'app-recepcion',
    templateUrl: './recepcion.component.html',
    styleUrls: ['./recepcion.component.scss']
})
export class RecepcionComponent implements OnInit {

    private recepcionCompraId: number = 0;
    public recepcionCompra: RecepcionCompra = new RecepcionCompra();
    public ordenCompra: OrdenCompra = new OrdenCompra();
    public detalleArticulos: any[] = [];
    public mensajeError: string = undefined;
    public numeroRecepcion: string = undefined;

    public habilitarIntegracion: boolean = false;

    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0
    };

    private estadosProcesarRecepcion: string[] = ['NUEVO', 'ERROR_RECEPCION'];

    @ViewChild("containerDialogRef", { read: ViewContainerRef})
    public containerDialogRef: ViewContainerRef;

    @ViewChild("resumenRecepcion", { read: TemplateRef})
    public resumenTemplate: TemplateRef<any>;

    constructor(
        private _notificarService: NotificarService,
        private _comprasService: ComprasService,
        private _activeRoute: ActivatedRoute,
        private _editService: EditService,
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.view = this._editService.pipe(map(data => process(data, this.gridState)));
        this._editService.read();

        this._activeRoute.params.pipe(
            switchMap((params: Params) => {
                this.recepcionCompraId = params['id'];
                return this._comprasService.obtenerRecepcionCompraPorId(this.recepcionCompraId);
            })
        ).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.recepcionCompra = data;
            this.ordenCompra = data.ordenCompra;
            this.cargarDetalleArticulos();
        });
    }

    verificarError(){
        debugger;
        if(_.isEmpty(this.recepcionCompra.mensajeError))
            this.mensajeError = undefined;
        else
            this.mensajeError = this.recepcionCompra.mensajeError;
    }

    recargarOrdenCompra(){
        this._comprasService.obtenerOrdenCompraPorId(this.recepcionCompraId).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.ordenCompra = data;
            this.cargarDetalleArticulos();
        });
    }

    cargarDetalleArticulos(){
        this.habilitarIntegracion = _.includes(this.estadosProcesarRecepcion, this.recepcionCompra.estado);

        this.detalleArticulos = _.map(this.recepcionCompra.detalle, d => {
            let detalleOrdenCompra = _.find(this.ordenCompra.detalle, doc => {
                return  doc.codigoArticulo === d.codigoArticulo
            });

            return {
                'id': d.id,
                'codigoArticulo': d.cotizacionDetalle.codigoArticulo,
                'codigoArticuloAlterno': d.cotizacionDetalle.codigoArticuloAlterno,
                'descripcionArticulo': d.cotizacionDetalle.descripcionArticulo,
                'cantidadCompra': d.cantidadCompra,
                'saldo': detalleOrdenCompra.saldo,
                'cantidadRecepcion': d.cantidadRecepcion
            }
        });
        this._editService.next(this.detalleArticulos);
        this.verificarError();
    }

    createFormGroup(dataItem: any): FormGroup {
        return this._formBuilder.group({
            'id': dataItem.id,
            'codigoArticulo': dataItem.codigoArticulo,
            'codigoArticuloAlterno': dataItem.codigoArticuloAlterno,
            'descripcionArticulo': dataItem.descripcionArticulo,
            'cantidadCompra': dataItem.cantidadCompra,
            'cantidadRecepcion': [dataItem.cantidadRecepcion, Validators.compose([Validators.required, Validators.min(0)])]
        });
    }

    public onStateChange(state: State){
        this.gridState = state;
        this._editService.read();
    }

    private isReadOnly(field: string): boolean {
        const readOnlyColumns = ['id', 'codigoArticulo', 'codigoArticuloAlterno', 'descripcionArticulo', 'cantidadCompra'];
        return readOnlyColumns.indexOf(field) > -1;
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            debugger;
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem, column } = args;
        let cantidadRecepcion = formGroup.get('cantidadRecepcion').value;
        let cantidadCompra = formGroup.get('cantidadCompra').value;
        debugger;
        if(cantidadRecepcion > cantidadCompra){
            this._notificarService.mostrarMensajeError('La cantidad de recepción no puede ser mayor a la de compra');
            formGroup.markAllAsTouched();
            args.preventDefault();
        }else if (!formGroup.valid) {
             // prevent closing the edited cell if there are invalid values.
            args.preventDefault();
        } else if (formGroup.dirty) {
            this._editService.assignValues(dataItem, formGroup.value);
            this._editService.update(dataItem);
            this.actualizarDetalleRecepcion(dataItem);
        }
    }

    private actualizarDetalleRecepcion(dataItem: any){
        let detalle = _.find(this.recepcionCompra.detalle, d => d.id === dataItem.id);
        detalle.cantidadRecepcion = dataItem.cantidadRecepcion;
        this._comprasService.actualizarRecepcion(detalle).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.recepcionCompra = data;
            this.cargarDetalleArticulos();
        });
    }

    abrirDialogoConfimacion(){
        const dialogoConfirmacion = this._dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Confirmar Recepción',
            content: '¿Está seguro de finalizar el proceso de recepción?',
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true }
            ]
        });

        dialogoConfirmacion.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
            }
            else if(result['text'] === 'Aceptar'){
                this.procesarRecepcion();
            }else if(result['text'] === 'Cancelar'){
            }
        });
    }

    private procesarRecepcion(){
        this._comprasService.procesarRecepcion(this.recepcionCompraId).subscribe(data => {
            this.mensajeError = undefined;
            this._notificarService.desactivarLoading();
            this.abrirDialogoResumen(data);

            // if(this.ordenCompra.estado === 'ERROR_RECEPCION')
            //     this._notificarService.mostrarMensajeError('Error al procesar la Recepción')
            // else{
            //     this._notificarService.mostrarMensajeExito('Recepción procesada correctamente')
            //     this._router.navigate(['/compras/recepcion/overview']);
            // }
            // //this.recargarOrdenCompra();
        });
    }

    abrirDialogoResumen(resumen: any){
        this.recepcionCompra = resumen.recepcionCompra;
        this.cargarDetalleArticulos();

        if(this.mensajeError === undefined)
            this.numeroRecepcion = this.recepcionCompra.numeroRecepcion;
        else
            this.numeroRecepcion = 'ERROR';

        const dialogoResumen = this._dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Resumen Recepción Compra',
            content: this.resumenTemplate,
            minWidth: 300,
                maxWidth: '60%',
                actions:[
                    { text: 'Aceptar', primary: true}
                ]
        });

        dialogoResumen.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
            } else if (result['text'] === 'Aceptar') {
                this._router.navigate(['/compras/recepcion/overview']);
            }
        });
    }

    abrirDialogoConfimacionCerrarProceso(){
        const dialogoConfirmacion = this._dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Confirmar cierre del proceso',
            content: '¿Está seguro de que quiere cerrar la recepción?',
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true }
            ]
        });

        dialogoConfirmacion.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
            }
            else if(result['text'] === 'Aceptar'){
                this.cerrarProceso();
            }else if(result['text'] === 'Cancelar'){
            }
        });
    }

    cerrarProceso(){
        this._comprasService.cerrarProcesoCompra(this.recepcionCompra).subscribe(data => {
            if(data.estado === 'CERRADO'){
                this._notificarService.mostrarMensajeExito('Proceso cerrado correctamente');
                this._router.navigate(['/compras/recepcion/overview']);
            }else
                this._notificarService.mostrarMensajeExito('Ocurrio un problema al cerrar el proceso');
        });
    }

    descargarDocumento(){
        this._comprasService.generarReporteRecepcionCompra(this.recepcionCompra.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `RecepcionCompra_${this.recepcionCompra.numeroRecepcion}`;
            a.click();
        });
    }
}
