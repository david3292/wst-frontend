import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { AltConductor } from 'src/app/_dominio/alt/altConductor';
import { DocumentoGuiaDespacho } from 'src/app/_dominio/logistica/documentoGuiaDespacho';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { AltConductorService } from 'src/app/_servicio/alt/alt-conductor.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaRemisionService } from 'src/app/_servicio/ventas/guia-remision.service';
import { GuiaDespachoService } from './../../../../_servicio/ventas/guia-despacho.service';
import * as _ from "lodash";
import { process, State } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { EditService } from 'src/app/paginas/ventas/cotizacion/edit.service';
import { map } from 'rxjs/operators';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';
import { ResumenDespachoComponent } from '../resumen-despacho/resumen-despacho.component';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { StockItemBinDialogoComponent } from '../../stock-item-bin-dialogo/stock-item-bin-dialogo.component';
import { ArticuloCompartimiento } from 'src/app/_dominio/logistica/articuloCompartimiento';
import * as moment from 'moment';
import { Direccion } from 'src/app/_dominio/ventas/direccion';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { ThemeService } from '@progress/kendo-angular-charts';

const createGuiaRemisionForm = dataItem => new FormGroup({
    'conductor': new FormControl(dataItem.conductor, Validators.required),
    'fechaInicioTraslado': new FormControl(dataItem.fechaInicioTraslado, Validators.required),
    'fechaFinTraslado': new FormControl(dataItem.fechaFinTraslado, Validators.required),
    'motivo': new FormControl(dataItem.motivo, Validators.required),
    'placa': new FormControl(dataItem.placa, [Validators.required]),
    'ruta': new FormControl(dataItem.ruta, [Validators.required, Validators.maxLength(100)]),
    'correo': new FormControl(dataItem.correo, [Validators.email])
});

const createGuiaRemisionFormCliente = dataItem => new FormGroup({
    'conductor': new FormControl(dataItem.conductor),
    'fechaInicioTraslado': new FormControl(dataItem.fechaInicioTraslado, Validators.required),
    'fechaFinTraslado': new FormControl(dataItem.fechaFinTraslado, Validators.required),
    'motivo': new FormControl(dataItem.motivo, Validators.required),
    'placa': new FormControl(dataItem.placa, [Validators.required]),
    'ruta': new FormControl(dataItem.ruta, [Validators.required, Validators.maxLength(100)]),
    'correo': new FormControl(dataItem.correo, [Validators.email])
});

const createDireccionForm = dataItem => new FormGroup({
    'direccionDestino': new FormControl(dataItem.direccionDestino, Validators.required)
});

const formatoFecha = 'YYYY-MM-DD HH:mm';
const formatoFechaDatePipe = 'yyyy-MM-dd HH:mm';

@Component({
    selector: 'app-despachos',
    templateUrl: './despachos.component.html',
    styleUrls: ['./despachos.component.scss'],
    providers: [DatePipe]
})
export class DespachosComponent implements OnInit {

    public formularioGuiaRemision: FormGroup;
    public formularioDireccion: FormGroup;
    public guiaRemision: DocumentoGuiaRemision;
    public guiaDespacho: DocumentoGuiaDespacho;
    public factura: DocumentoFactura;
    public conductoresLista: Array<AltConductor> = [];
    public habilitarConductor: boolean = true;
    public soloLectura: boolean = false;
    public documentoDetalle: DocumentoDetalle[] = [];
    public catalogoEntregas: any[];
    public detalleArticulos: any[];
    public catalogoDireccionCliente: Direccion[] = [];

    private guiaRemisionId: number = -1;
    private guiaDespachoId: number = -1;
    private documentoDetallePivot: DocumentoDetalle;

    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0
    };
    public changes: any = {};

    @ViewChild("containerDialogRef", { read: ViewContainerRef})
    public containerDialogRef: ViewContainerRef;

    constructor(
        private _activateRoute: ActivatedRoute,
        private _router: Router,
        private _notificarService: NotificarService,
        private _guiaDespachoService: GuiaDespachoService,
        private _guiaRemisionService: GuiaRemisionService,
        private _altConductorService: AltConductorService,
        private _reservaFacturaService: ReservaService,
        private _datePipe: DatePipe,
        private _formBuilder: FormBuilder,
        public _editService: EditService,
        private _clienteService: ClienteService,
        private _dialogService: DialogService,
        private _transferenciasService: TransferenciasService
    ) { }

    ngOnInit(): void {
        this.guiaDespacho = new DocumentoGuiaDespacho();
        this.guiaDespacho.cotizacion = new Cotizacion();
        this.factura = new DocumentoFactura();

        this.view = this._editService.pipe(map(data => process(data, this.gridState)));
        this._editService.read();

        this.listarEntregas();
        this.cargarFormularioGuiaEnBlanco();
        this.cargarFormDireccionEnBlanco();
        this.validarParametros();
    }

    private validarParametros(){
        this._activateRoute.params.subscribe(data => {
            this.guiaDespachoId = data['id'];
        });

        this._activateRoute.queryParams.subscribe(data => {
            this.guiaRemisionId = data['gr'];
        })

        this.cargarGuiaDespacho();

        // let paramsObservable = this._activateRoute.params;
        // let queryParamsObservable = this._activateRoute.queryParams;
        // forkJoin([paramsObservable, queryParamsObservable]).subscribe(data => {
        //     this.guiaDespachoId = data[0]['id'];
        //     this.guiaRemisionId = data[1]['gr'];
        //     debugger;
        //     this.cargarGuiaDespacho();
        //     this.cargarGuiaRemision();
        // });
    }

    private cargarFormularioGuiaEnBlanco(){
        this.formularioGuiaRemision = createGuiaRemisionForm({
            'conductor': null,
            'fechaInicioTraslado': new Date(),
            'fechaFinTraslado': new Date(),
            'motivo': '',
            'placa': '',
            'ruta': '',
            'correo': ''
        });
    }

    private cargarFormularioGuiaClienteEnBlanco(){
        this.formularioGuiaRemision = createGuiaRemisionFormCliente({
            'conductor': null,
            'fechaInicioTraslado': new Date(),
            'fechaFinTraslado': new Date(),
            'motivo': '',
            'placa': '',
            'ruta': '',
            'correo': ''
        });
    }

    private cargarFormularioGuiaDatos(guiaRemision: DocumentoGuiaRemision){
        this.detalleArticulos = _.map(this.guiaRemision.detalle, (d) => {
            return {
                'id': d.id,
                'cotizacionDetalle': d.cotizacionDetalle,
                'codigoArticulo': d.cotizacionDetalle.codigoArticulo,
                'codigoArticuloAlterno': d.cotizacionDetalle.codigoArticuloAlterno,
                'descripcionArticulo': d.cotizacionDetalle.descripcionArticulo,
                'codigoBodega': d.codigoBodega,
                'cantidad': d.cantidad,
                'saldo': d.saldo,
                'seleccionado': 0
            }
        });

        if(guiaRemision.estado === 'COMPLETADO'){
            this.soloLectura = true;
            this.habilitarConductor = false;
        }
        let conductor: AltConductor;
        if(guiaRemision.cedulaConductor !== '')
            conductor = _.first(_.filter(this.conductoresLista, c => c.ConCedula === guiaRemision.cedulaConductor));
        let fechaInicio = moment(guiaRemision.fechaInicioTraslado, formatoFecha).toDate();
        let fechaFin = moment(guiaRemision.fechaFinTraslado, formatoFecha).toDate();
        if(this.guiaDespacho.entrega === 'CLIENTE'){
            this.formularioGuiaRemision = createGuiaRemisionFormCliente({
                'conductor': null,
                'fechaInicioTraslado': fechaInicio,
                'fechaFinTraslado': fechaFin,
                'motivo': guiaRemision.motivo,
                'placa': guiaRemision.placa,
                'ruta': guiaRemision.ruta,
                'correo': guiaRemision.correo
            });
        }else{
            this.formularioGuiaRemision = createGuiaRemisionForm({
                'conductor': conductor,
                'fechaInicioTraslado': fechaInicio,
                'fechaFinTraslado': fechaFin,
                'motivo': guiaRemision.motivo,
                'placa': guiaRemision.placa,
                'ruta': guiaRemision.ruta,
                'correo': guiaRemision.correo
            });
        }

    }

    private cargarFormDireccionEnBlanco(){
        this.formularioDireccion = createDireccionForm({
            'direccionDestino': null
        });
    }

    private cargarFormDireccionDatos(factura: DocumentoFactura){
        let direccionEntrega;
        if(this.guiaRemisionId !== -1)
            direccionEntrega = this.guiaDespacho.direccionEntrega;
        else
            direccionEntrega = factura.direccionEntrega;

        let direccion = _.first(_.filter(this.catalogoDireccionCliente, (d) => {
            return d.ADRSCODE === direccionEntrega;
        }));
        this.formularioDireccion = createDireccionForm({
            'direccionDestino': direccion
        });
    }

    private cargarGuiaDespacho(){
        this._guiaDespachoService.obtenerGuiaDespachoId(this.guiaDespachoId).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.guiaDespacho = data.guiaDespacho;
            // this.detalleArticulos = this.guiaDespacho.detalle;
            // _.forEach(this.detalleArticulos, (d) => {
            //     d.seleccion = 0;
            // });
            let detalleConSaldos = _.filter(this.guiaDespacho.detalle, d => {return d.saldo > 0})

            this.detalleArticulos = _.map(detalleConSaldos, (d) => {
                return {
                    'id': d.id,
                    'cotizacionDetalle': d.cotizacionDetalle,
                    'codigoArticulo': d.cotizacionDetalle.codigoArticulo,
                    'codigoArticuloAlterno': d.cotizacionDetalle.codigoArticuloAlterno,
                    'descripcionArticulo': d.cotizacionDetalle.descripcionArticulo,
                    'codigoBodega': d.codigoBodega,
                    'cantidad': d.cantidad,
                    'saldo': d.saldo,
                    'seleccionado': 0
                }
            });
            this.calcularPesos();
            this._editService.next(this.detalleArticulos);
            this.factura = data.factura;
            this.cargarFormDireccionDatos(this.factura);
            this.listarDireccionesCliente();
            if(this.guiaDespacho.entrega === 'DESPACHO'){
                this.cargarConductores();
                this.habilitarConductor = true;
            }else if (this.guiaDespacho.entrega === 'CLIENTE'){
                this.habilitarConductor = false;

            }
            this.cargarGuiaRemision();
        });
    }

    private calcularPesos(){
        _.forEach(this.detalleArticulos, (d) => {
            let pesoTotalCalculado: number = d.cotizacionDetalle.pesoArticulo * d.cantidad;
            let pesoSeleccionCalculado: number = d.cotizacionDetalle.pesoArticulo * d.seleccionado;
            d.pesoTotal = pesoTotalCalculado.toFixed(2);
            d.pesoSeleccion = pesoSeleccionCalculado.toFixed(2);
        });
    }

    private cargarGuiaRemision(){
        if(this.guiaRemisionId != undefined && this.guiaRemisionId !== -1){
            this.habilitarConductor = true;
            this.soloLectura = true;
            let guiaRemisionO = this._guiaRemisionService.obtenerPorId(this.guiaRemisionId);
            let conductoresO = this._altConductorService.listarConductores();
            forkJoin([guiaRemisionO, conductoresO]).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.listarDireccionesCliente();
                this.guiaRemision = data[0];
                this.conductoresLista = data[1];
                this.cargarFormularioGuiaDatos(this.guiaRemision);
            });
        }else if(this.guiaDespacho.entrega === 'CLIENTE'){
            this.cargarFormularioGuiaClienteEnBlanco();
            this.habilitarConductor = false;
        }else if(this.guiaDespacho.entrega === 'DESPACHO'){
            this.cargarFormularioGuiaEnBlanco();
        }
    }

    private cargarConductores(){
        this._altConductorService.listarConductores().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.conductoresLista = data;
        });
    }

    private listarEntregas() {
        this._reservaFacturaService.listarEntregas().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.catalogoEntregas = data;
        })
    }

    public entregaChange(valor: string) {
        debugger;
        this.guiaDespacho.entrega = valor;
        switch (valor) {
            case 'CLIENTE':
                this.habilitarConductor = false;
                this.formularioDireccion.reset();
                this.formularioGuiaRemision.reset();
                this.cargarFormularioGuiaClienteEnBlanco();
                break;
            case 'DESPACHO':
                if(_.isEmpty(this.catalogoDireccionCliente))
                    this.listarDireccionesCliente();

                if(_.isEmpty(this.conductoresLista))
                    this.cargarConductores();
                this.habilitarConductor = true;
                this.formularioDireccion.reset();
                this.formularioGuiaRemision.reset();
                this.cargarFormDireccionDatos(this.factura);
                this.cargarFormularioGuiaEnBlanco();
                break;
            default: break;
        }
    }

    public deshabilitarFechasInicioTraslado = (fechaInicio: Date) : boolean => {
        let fechaActual = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
        return fechaInicio <= fechaActual;
    }

    public deshabilitarFechasFinTraslado = (fechaFin: Date) : boolean => {
        let fechaInicio = <Date>this.formularioGuiaRemision.get('fechaInicioTraslado').value;
        fechaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate() -1);
        return fechaFin <= fechaInicio;
    }

    public procesarDespacho(){
        let continuar = true;
        if(this.formularioGuiaRemision.invalid || this.formularioDireccion.invalid){
            this._notificarService.mostrarMensajeError('Completar los datos para la Guia de Remisión');
            this.formularioGuiaRemision.markAllAsTouched();
            this.formularioDireccion.markAllAsTouched();
            continuar = false;
        }

        if(continuar && this.validarCantidades()){
            this.generarGuiaRemision();
            console.log(this.guiaRemision);
            this._guiaDespachoService.procesarDespacho(this.guiaDespacho, this.guiaRemision).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.guiaRemision.id = data.guiaRemision.id;
                this.guiaRemisionId = this.guiaRemision.id;
                this.abrirDialogoResumen(data);
            });
        }
    }

    abrirDialogoResumen(resumenDespacho: any){
        const dialogoResumen = this._dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Resumen Despacho',
            content: ResumenDespachoComponent,
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Aceptar', primary: true }
            ]
        });
        const resumen = dialogoResumen.content.instance;
        resumen.dataResumen = resumenDespacho;
        resumen.guiaDespacho = this.guiaDespacho;
        resumen.guiaRemision = this.guiaRemision;
        resumen.validarRespuesta();

        dialogoResumen.result.subscribe((result) => {
            if(result instanceof DialogCloseResult){
                this._router.navigate(['/despachos/overview']);
            }
            else if(result['text'] === 'Aceptar'){
                this._router.navigate(['/despachos/overview']);
            }
        });
    }

    abrirDialogoConfimacion(){
        let continuar = true;

        if(this.formularioGuiaRemision.invalid || this.formularioDireccion.invalid){
            this._notificarService.mostrarMensajeError('Completar los datos para la Guia de Remisión');
            this.formularioGuiaRemision.markAllAsTouched();
            this.formularioDireccion.markAllAsTouched();
            continuar = false;
        }

        if(continuar && this.validarCantidades()){
            this.generarGuiaRemision();
            const dialogoConfirmacion = this._dialogService.open({
                appendTo: this.containerDialogRef,
                title: 'Confirmar Despacho',
                content: '¿Está seguro de finalizar el proceso de despacho?',
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
                    this.procesarDespacho();
                }else if(result['text'] === 'Cancelar'){
                }
            });
        }
    }

    private validarCantidades(): boolean{
        let continuar = true;
        let cantidadTotal = _.sumBy(this.detalleArticulos, (d) => { return  d.seleccionado});
        if(cantidadTotal <= 0){
            continuar = false;
            this._notificarService.mostrarMensajeError('Complete el detalle de los articulos');
        }
        return continuar;
    }

    private generarGuiaRemision(): DocumentoGuiaRemision{

        if(this.guiaDespacho.entrega === 'DESPACHO' || this.guiaDespacho.entrega === 'CLIENTE'){
            if(this.formularioGuiaRemision.invalid){
                this._notificarService.mostrarMensajeError('Completar los datos para la Guia de Remisión');
                this.formularioGuiaRemision.markAllAsTouched();
            }else{
                let guiaRemision = new DocumentoGuiaRemision();
                if(this.guiaDespacho.entrega === 'DESPACHO'){
                    guiaRemision.cedulaConductor = this.formularioGuiaRemision.get('conductor').value.ConCedula;
                    guiaRemision.nombreConductor = this.formularioGuiaRemision.get('conductor').value.ConNombre;
                }

                let fecha = this.formularioGuiaRemision.get('fechaInicioTraslado').value;
                guiaRemision.fechaInicioTraslado = this._datePipe.transform(fecha, formatoFechaDatePipe);
                fecha = this.formularioGuiaRemision.get('fechaFinTraslado').value;
                guiaRemision.fechaFinTraslado = this._datePipe.transform(fecha, formatoFechaDatePipe);

                guiaRemision.motivo = this.formularioGuiaRemision.get('motivo').value;
                guiaRemision.ruta = this.formularioGuiaRemision.get('ruta').value;
                guiaRemision.placa = this.formularioGuiaRemision.get('placa').value;
                guiaRemision.correo = this.formularioGuiaRemision.get('correo').value;
                guiaRemision.bodegaPartida = this.guiaDespacho.bodega;
                guiaRemision.documentoPadreId = this.guiaDespacho.id;
                guiaRemision.estado = 'NUEVO';
                guiaRemision.tipo = 'GUIA_REMISION';
                guiaRemision.documentoPadreId = this.guiaDespacho.id;
                guiaRemision.direccionEntregaCodigo = this.formularioDireccion.get('direccionDestino').value.ADRSCODE;
                guiaRemision.direccionEntega = this.formularioDireccion.get('direccionDestino').value.ADDRESS1;
                this.guiaRemision = guiaRemision;
                this.generarDetalleGuiaRemision();
                return guiaRemision;
            }
        }else{
            this.guiaRemision = new DocumentoGuiaRemision();
            this.generarDetalleGuiaRemision();
            return this.guiaRemision;
        }

    }

    private generarDetalleGuiaRemision(){
        let detalleGuia: DocumentoDetalle[];
        detalleGuia = _.map(this.detalleArticulos, a => {
            let detalle = new DocumentoDetalle();
            detalle.id = 0;
            detalle.cotizacionDetalle = a.cotizacionDetalle;
            detalle.codigoBodega = a.codigoBodega;
            detalle.cantidad = a.seleccionado;
            detalle.saldo = 0;
            detalle.total = 0;
            return detalle;
        });
        this.guiaRemision.detalle = detalleGuia;
    }

    public onStateChange(state: State) {
        this.gridState = state;

        this._editService.read();
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public cancelHandler({ sender, rowIndex }) {
        sender.closeRow(rowIndex);
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem, column } = args;
        let cantidad = formGroup.get('saldo').value;
        let seleccionado = formGroup.get('seleccionado').value;
        if(seleccionado > cantidad){
            this._notificarService.mostrarMensajeError('La cantidad seleccionada es mayor a la pendiente');
            formGroup.markAllAsTouched();
            args.preventDefault();
        }else if (!formGroup.valid) {
             // prevent closing the edited cell if there are invalid values.
            args.preventDefault();
        } else if (formGroup.dirty) {
            let pesoSeleccionCalculado: number = dataItem.cotizacionDetalle.pesoArticulo * seleccionado;
            dataItem.pesoSeleccion = pesoSeleccionCalculado.toFixed(2);
            this._editService.assignValues(dataItem, formGroup.value);
            this._editService.update(dataItem);
        }
    }

    public saveHandler({ sender, formGroup, rowIndex }) {
        if (formGroup.valid) {
            this._editService.create(formGroup.value);
            sender.closeRow(rowIndex);
        }
    }

    public removeHandler({ sender, dataItem }) {
        this._editService.remove(dataItem);

        sender.cancelCell();
    }

    public createFormGroup(dataItem: any): FormGroup {
        return this._formBuilder.group({
            'id': dataItem.id,
            'codigoArticulo': dataItem.codigoArticulo,
            'codigoArticuloAlterno': dataItem.codigoArticuloAlterno,
            'descripcionArticulo': dataItem.descripcionArticulo,
            'codigoBodega': dataItem.codigoBodega,
            'cantidad': dataItem.cantidad,
            'saldo': dataItem.saldo,
            'seleccionado': [dataItem.seleccionado, Validators.compose([Validators.required, Validators.min(0), Validators.pattern('^[0-9]+(.[0-9]{0,2})?$')])]
        });
    }

    private isReadOnly(field: string): boolean {
        const readOnlyColumns = ['id', 'codigoArticulo', 'codigoArticuloAlterno', 'descripcionArticulo', 'codigoBodega', 'cantidad', 'saldo'];
        return readOnlyColumns.indexOf(field) > -1;
    }

    private listarDireccionesCliente() {
        this._clienteService.listarPorCustomerNumber(this.guiaDespacho.cotizacion.codigoCliente).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.catalogoDireccionCliente = data.Address;
            this.cargarFormDireccionDatos(this.factura);
        })
    }

    cargarInformacionBins(detalle: any){
        let documentoDetalle = <DocumentoDetalle>detalle;
        this.documentoDetallePivot = _.first(_.filter(this.guiaDespacho.detalle, (df) => {
            return df.cotizacionDetalle.codigoArticulo === detalle.cotizacionDetalle.codigoArticulo;
        }));

        let docDetalleObs = this._transferenciasService.obtenerDocumentoDetallePorIdConCompartimientos(documentoDetalle);
        let articuloCompartimientosObs = new Observable<ArticuloCompartimiento[]>();
        articuloCompartimientosObs = this._transferenciasService.obtenerItemStockBin(documentoDetalle);

        forkJoin([docDetalleObs, articuloCompartimientosObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.abrirDialogoBins(this.documentoDetallePivot, data[1]);
        });
    }

    abrirDialogoBins(documentoDetalle: DocumentoDetalle, articuloCompartimientos: ArticuloCompartimiento[]){
        const dialogoRefStockBin = this._dialogService.open({
            appendTo: this.containerDialogRef,
            content: StockItemBinDialogoComponent,
            minWidth: 700,
            maxWidth: '98%'
        });
        const stockBin = dialogoRefStockBin.content.instance;
        stockBin.transferenciaId = this.guiaDespacho.id;
        stockBin.documentoDetalleSeleccionado = this.documentoDetallePivot;
        stockBin.documentoDetalle = documentoDetalle;
        stockBin.articuloCompartimientos = articuloCompartimientos;
        stockBin.tipoTransferencia = 'despacho';
        stockBin.construir();
    }


}
