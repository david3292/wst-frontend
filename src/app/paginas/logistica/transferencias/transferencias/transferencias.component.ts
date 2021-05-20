import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { forkJoin, Observable } from 'rxjs';
import { AltConductor } from 'src/app/_dominio/alt/altConductor';
import { ArticuloCompartimiento } from 'src/app/_dominio/logistica/articuloCompartimiento';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { DocumentoTransferenciaSalida } from 'src/app/_dominio/logistica/documentoTransferenciaSalida';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { AltConductorService } from 'src/app/_servicio/alt/alt-conductor.service';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { StockItemBinDialogoComponent } from '../../stock-item-bin-dialogo/stock-item-bin-dialogo.component';
import { DatePipe } from '@angular/common';
import * as _ from "lodash";
import { DocumentoTransferenciaEntrada } from 'src/app/_dominio/logistica/documentoTransferenciaEntrada';
import { TransferenciaResumenDialogoComponent } from '../../transferencia-resumen-dialogo/transferencia-resumen-dialogo.component';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { EditService } from 'src/app/paginas/ventas/cotizacion/edit.service';
import { map } from 'rxjs/operators';

const createGuiaRemisionForm = dataItem => new FormGroup({
    'conductor': new FormControl(dataItem.conductor, Validators.required),
    'fechaInicioTraslado': new FormControl(dataItem.fechaInicioTraslado, Validators.required),
    'fechaFinTraslado': new FormControl(dataItem.fechaFinTraslado, Validators.required),
    'motivo': new FormControl(dataItem.motivo, Validators.required),
    'placa': new FormControl(dataItem.placa, [Validators.required, Validators.maxLength(7)]),
    'ruta': new FormControl(dataItem.ruta, [Validators.required, Validators.maxLength(100)]),
    'correo': new FormControl(dataItem.correo, [Validators.email])
});

@Component({
    selector: 'app-transferencias',
    templateUrl: './transferencias.component.html',
    styleUrls: ['./transferencias.component.scss'],
    providers: [DatePipe]
})
export class TransferenciasComponent implements OnInit {

    private transferenciaId: number;
    public tipo: string = 'SN';
    public tituloTransferencia: string = '';
    public controlRender: boolean = true;

    public conductoresLista: Array<AltConductor> = [];
    public conductorSeleccionado: AltConductor;

    public transferenciaNumero: string;
    public cotizacionNumero: string;
    public entregaMercaderia: string;

    public transferenciaPivot: any;
    public formularioGuiaRemision: FormGroup;

    private existeDatosGuia: boolean = false;
    private transferenciaCompleta: boolean = false;
    public documentoGuiaRemision: DocumentoGuiaRemision;
    public habilitarTransferencia: boolean = false;
    public habilitarBotonSearch: boolean = true;
    public verDetalles: boolean = false;
    public verColumnas: boolean = true;

    private documentoDetalleSeleccionado: DocumentoDetalle;

    public transferenciaIncompleta: boolean = false;

    public view: Observable<GridDataResult>;

    public gridState: State = {
        sort: [],
        skip: 0
    };

    @ViewChild("containerStockBin", { read: ViewContainerRef})
    public containerStockBinRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _dialogService: DialogService,
        private _transferenciasService: TransferenciasService,
        private _altConductorService: AltConductorService,
        private _notificarService: NotificarService,
        private _editService: EditService,
        private datePipe: DatePipe,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
        this.view = this._editService.pipe(map(data => process(data, this.gridState)));
        this.cargarFormularioGuiaEnBlanco();
        let tTemp = new DocumentoTransferenciaSalida();
        this.transferenciaPivot = tTemp;
        this.transferenciaPivot.cotizacion = new Cotizacion();
        this.route.params.subscribe((params: Params) => {
            this.transferenciaId = params['id'];
            this.tipo = params['tipo_transferencia'];
            this.cargarInformacionInicial();
        });

        this._transferenciasService.transferenciaCambio.subscribe(data => {
            this._notificarService.desactivarLoading();
            this.cargarInformacionInicial();
        });
    }

    cargarInformacionInicial(){
        if(this.tipo === 'entrada')
            this.cargarInformacionInicialTransferenciaEntrada();
        else
            this.cargarInformacionInicialTransferenciaSalida();
    }

    private cargarInformacionInicialTransferenciaEntrada(){
        this.tituloTransferencia = 'TRANSFERENCIA ENTRADA';
        this.verDetalles = true;
        let transferenciaObs = this._transferenciasService.obtenerTransferenciaEntradaPorId(this.transferenciaId);
        let conductoresObs = this._altConductorService.listarConductores();
        forkJoin([transferenciaObs, conductoresObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            // _.forEach(data[0].detalle, (d) => {
            //     d.saldo = d.total - d.cantidad;
            // });
            this.transferenciaPivot = <DocumentoTransferenciaEntrada> data[0];
            this.calcularSaldoPesos();
            this._editService.next(this.transferenciaPivot.detalle);
            this.controlRender = false;
            this.conductoresLista = data[1];
            this._transferenciasService.obtenerGuiaRemisionPorTransferenciaSalidaId(data[0].documentoTransferenciaSalidaId).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.cargarDatosFormularioGuia(data);
            });
        });


    }

    private cargarInformacionInicialTransferenciaSalida(){
        this.tituloTransferencia = 'TRANSFERENCIA SALIDA';
        let transferenciaObs = this._transferenciasService.obtenerTransferenciaSalidaPorId(this.transferenciaId);
        let conductoresObs = this._altConductorService.listarConductores();
        let guiaRemisionObs = this._transferenciasService.obtenerGuiaRemisionPorTransferenciaSalidaId(this.transferenciaId);
        forkJoin([transferenciaObs, conductoresObs, guiaRemisionObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            // _.forEach(data[0].detalle, (d) => {
            //     d.saldo = d.total - d.cantidad;
            // });
            this.transferenciaPivot = data[0];
            this.calcularSaldoPesos();
            this._editService.next(this.transferenciaPivot.detalle);
            if(this.transferenciaPivot.estado === 'EMITIDO' || this.transferenciaPivot.estado === 'COMPLETADO'){
                this.transferenciaCompleta = true;
                this.verColumnas = false;
            }

            this.conductoresLista = data[1];
            if(_.isEmpty(data[2]))
                this.cargarFormularioGuiaEnBlanco();
            else
                this.cargarDatosFormularioGuia(data[2]);

            this.controlRender = (!this.existeDatosGuia || !this.transferenciaCompleta)
            if(this.transferenciaPivot.estado === 'ANULADO'){
                this.habilitarTransferencia = false;
                this.habilitarBotonSearch = false;
                this.controlRender = false;
            }
            if(this.transferenciaPivot.estado === 'EMITIDO' || this.transferenciaPivot.estado === 'ERROR'){
                this.habilitarBotonSearch = false;
            }

        });
    }

    calcularSaldoPesos(){
        _.forEach(this.transferenciaPivot.detalle, (d) => {
            d.saldo = d.total > d.cantidad ? d.total - d.cantidad : d.total;
            let pesoTotalCalculado: number = d.pesoArticulo * d.total;
            let pesoSeleccionCalculado: number = d.pesoArticulo * d.cantidad;
            d.pesoTotal = pesoTotalCalculado.toFixed(2);
            d.pesoSeleccion = pesoSeleccionCalculado.toFixed(2);
        });
    }

    cargarDatosFormularioGuia(guiaRemision: DocumentoGuiaRemision){
        this.documentoGuiaRemision = guiaRemision;
        this.existeDatosGuia = true;
        let conductor: AltConductor;
        if(guiaRemision.cedulaConductor !== '')
            conductor = _.first(_.filter(this.conductoresLista, c => c.ConCedula === guiaRemision.cedulaConductor));
        else conductor = new AltConductor();
        this.formularioGuiaRemision = createGuiaRemisionForm({
            'conductor': conductor,
            'fechaInicioTraslado': new Date(),
            'fechaFinTraslado': new Date(),
            'motivo': guiaRemision.motivo,
            'placa': guiaRemision.placa,
            'ruta': guiaRemision.ruta,
            'correo': guiaRemision.correo
        });
        this.habilitarTransferencia = this.formularioGuiaRemision.valid && this.transferenciaPivot.estado !== 'EMITIDO';
        this.verDetalles = this.formularioGuiaRemision.valid;
        if(this.documentoGuiaRemision.estado === 'ERROR'){
            this.transferenciaPivot.estado = this.documentoGuiaRemision.estado;
            this.habilitarTransferencia = true;
            this.habilitarBotonSearch = false;
        }
    }

    cargarFormularioGuiaEnBlanco(){
        this.existeDatosGuia = false;
        this.formularioGuiaRemision = createGuiaRemisionForm({
            'conductor': null,
            'fechaInicioTraslado': new Date(),
            'fechaFinTraslado': new Date(),
            'motivo': '',
            'placa': '',
            'ruta': '',
            'correo': ''
        });
        this.verDetalles = this.formularioGuiaRemision.valid;
    }

    cargarInformacionBins(documentoDetalle: DocumentoDetalle){
        debugger
        let docDetalleObs = this._transferenciasService.obtenerDocumentoDetallePorIdConCompartimientos(documentoDetalle);
        let articuloCompartimientosObs = new Observable<ArticuloCompartimiento[]>();
        if(this.tipo === 'entrada')
            articuloCompartimientosObs = this._transferenciasService.obtenerBins(documentoDetalle);
        else
            articuloCompartimientosObs = this._transferenciasService.obtenerItemStockBin(documentoDetalle);

        this.documentoDetalleSeleccionado = documentoDetalle;
        forkJoin([docDetalleObs, articuloCompartimientosObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.abrirDialogoBins(data[0], data[1]);
        });
    }

    abrirDialogoBins(documentoDetalle: DocumentoDetalle, articuloCompartimientos: ArticuloCompartimiento[]){
        const dialogoRefStockBin = this._dialogService.open({
            appendTo: this.containerStockBinRef,
            content: StockItemBinDialogoComponent,
            minWidth: 700,
            maxWidth: '98%',
            minHeight: 500,
            maxHeight: '80%',
        });
        const stockBin = dialogoRefStockBin.content.instance;
        stockBin.transferenciaId = this.transferenciaId;
        stockBin.documentoDetalle = documentoDetalle;
        stockBin.documentoDetalleSeleccionado = this.documentoDetalleSeleccionado;
        stockBin.articuloCompartimientos = articuloCompartimientos;
        stockBin.tipoTransferencia = this.tipo;
        stockBin.construir();
    }

    abrirDialogoResumen(resumenTransferencia: any){
        const dialogoResumen = this._dialogService.open({
            appendTo: this.containerStockBinRef,
            title: 'Resumen Transferencia',
            content: TransferenciaResumenDialogoComponent,
            minWidth: 300,
            maxWidth: '60%',
            actions:[
                { text: 'Aceptar', primary: true}
            ]
        });
        const resumen = dialogoResumen.content.instance;
        resumen.datosResumen = resumenTransferencia;
        resumen.tipo = this.tipo;
        resumen.transferenciaSalidaId = this.transferenciaPivot.id;

        dialogoResumen.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Aceptar') {
                    this.router.navigate([`/transferencias/overview/${this.tipo}`]);
                }
            }
        });
    }

    abrirDialogoConfirmacion(templateResumen: TemplateRef<any>){
        this.transferenciaIncompleta = false;
        let suma = _.sumBy(this.transferenciaPivot.detalle, 'cantidad');
        if(suma <= 0){
            this._notificarService.mostrarMensajeError('Se requiere completar el detalle');
        }else{
            if(this.tipo === 'entrada'){
                let sumaTotal = _.sumBy(this.transferenciaPivot.detalle, 'total');
                if(suma > 0 && suma < sumaTotal)
                    this.transferenciaIncompleta = true;
            }

            const dialogoConfirmacion = this._dialogService.open({
                appendTo: this.containerStockBinRef,
                title: 'Confirmar Transferencia',
                content: templateResumen,
                minWidth: 300,
                maxWidth: '60%',
                actions:[
                    { text: 'Cancelar'},
                    { text: 'Aceptar', primary: true}
                ]
            });

            dialogoConfirmacion.result.subscribe((result) => {
                if (result instanceof DialogCloseResult) {
                } else if (result['text'] === 'Aceptar') {
                    this.procesarTransferencia();
                } else if (result['text'] === 'Cancelar'){}
            });
        }
    }

    abrirDialogoAnulacion(){
        const dialogoConfirmacion = this._dialogService.open({
            appendTo: this.containerStockBinRef,
            title: 'Confirmar Anulación',
            content: '¿Está seguro de anular el proceso de transferencia?',
            minWidth: 300,
            maxWidth: '60%',
            actions:[
                { text: 'Cancelar'},
                { text: 'Aceptar', primary: true}
            ]
        });

        dialogoConfirmacion.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
            } else if (result['text'] === 'Aceptar') {
                this.anularTransferenciaSalida();
            } else if (result['text'] === 'Cancelar'){}
        });
    }

    guardarDatosGuiaRemision(){
        let formularioValido = this.formularioGuiaRemision.valid;
        if(formularioValido){
            let guiaRemision = new DocumentoGuiaRemision();
            let tSalida: DocumentoTransferenciaSalida = <DocumentoTransferenciaSalida>(this.transferenciaPivot);
            guiaRemision.cedulaConductor = this.formularioGuiaRemision.get('conductor').value.ConCedula;
            guiaRemision.nombreConductor = this.formularioGuiaRemision.get('conductor').value.ConNombre;

            let fecha = this.formularioGuiaRemision.get('fechaInicioTraslado').value;
            guiaRemision.fechaInicioTraslado = this.datePipe.transform(fecha, 'yyyy-MM-dd HH:mm');
            fecha = this.formularioGuiaRemision.get('fechaFinTraslado').value;
            guiaRemision.fechaFinTraslado = this.datePipe.transform(fecha, 'yyyy-MM-dd HH:mm');

            guiaRemision.motivo = this.formularioGuiaRemision.get('motivo').value;
            guiaRemision.ruta = this.formularioGuiaRemision.get('ruta').value;
            guiaRemision.placa = this.formularioGuiaRemision.get('placa').value;
            guiaRemision.correo = this.formularioGuiaRemision.get('correo').value;
            guiaRemision.direccionPartida = tSalida.direccionBodegaOrigen;
            guiaRemision.direccionEntega = tSalida.direccionBodegaDestino;
            guiaRemision.bodegaPartida = tSalida.bodegaOrigen;
            guiaRemision.documentoPadreId = this.transferenciaId;
            guiaRemision.estado = 'NUEVO';
            guiaRemision.tipo = 'GUIA_REMISION';
            this._transferenciasService.guardarGuiaRemision(guiaRemision).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.verDetalles = this.formularioGuiaRemision.valid;
                this._notificarService.mostrarMensajeExito('Datos guardados');
                this.habilitarTransferencia = true;
            });
        }else{
            this.formularioGuiaRemision.markAllAsTouched();
            this._notificarService.mostrarMensajeError('Complete los datos para la guía de remisión');
        }
    }

    procesarTransferencia(){
        this._transferenciasService.procesarTransferencia(this.transferenciaPivot).subscribe(data => {
            this._notificarService.desactivarLoading();
            this._transferenciasService.transferenciaCambio.next(<DocumentoTransferenciaSalida>this.transferenciaPivot);
            this.abrirDialogoResumen(data);
        });
    }

    procesarGuiaRemision(){
        if(this.formularioGuiaRemision.valid){
            if(this.documentoGuiaRemision.estado === 'COMPLETADO'){
                this.generarGuiaRemisionPdf(this.documentoGuiaRemision);
            }else{
                this._transferenciasService.integrarGuiaRemisionGp(<DocumentoTransferenciaSalida>this.transferenciaPivot).subscribe(data => {
                    this._notificarService.desactivarLoading();
                    this.documentoGuiaRemision = data;
                    let mensaje = `Guía de remisión creada ${data.numero}`;
                    this._notificarService.mostrarMensajeExito(mensaje);
                    this.generarGuiaRemisionPdf(data);
                });
            }
        }else{
            this._notificarService.mostrarMensajeError('Complete los datos para la guía de remisión');
        }
    }

    generarGuiaRemisionPdf(guiaRemision: DocumentoGuiaRemision){
        this._transferenciasService.generarReporteGuiaTransferenciaSalida(guiaRemision.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Remision_${this.documentoGuiaRemision.numero}`;
            a.click();
        });
    }

    anularTransferenciaSalida(){
        let transferenciaSalida = <DocumentoTransferenciaSalida> this.transferenciaPivot;
        this._transferenciasService.anularTransferenciaSalida(transferenciaSalida.id).subscribe(data => {
            this._notificarService.desactivarLoading()
            this._notificarService.mostrarMensajeExito('Transferencia anulada');
            this.router.navigate([`/transferencias/overview/${this.tipo}`]);
        });
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

    public onStateChange(state: State){
        this.gridState = state;
        this._editService.read();
    }

    private isReadOnly(field: string): boolean {
        let readOnly = ['codigoArticulo', 'codigoArticuloAlterno', 'descripcionArticulo', 'total', 'cantidad', 'pesoTotal', 'saldo', 'pesoSeleccion'];
        if(this.transferenciaPivot.estado === 'NUEVO')
            readOnly = ['codigoArticulo', 'codigoArticuloAlterno', 'descripcionArticulo', 'total', 'pesoTotal', 'saldo', 'pesoSeleccion'];

        const readOnlyColumns = readOnly;
        return readOnlyColumns.indexOf(field) > -1;
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    createFormGroup(dataItem: any): FormGroup {
        return this._formBuilder.group({
            'id': dataItem.id,
            //'cotizacionDetalle': dataItem.cotizacionDetalle,
            'codigoArticulo': dataItem.codigoArticulo,
            'codigoArticuloAlterno': dataItem.codigoArticuloAlterno,
            'descripcionArticulo': dataItem.descripcionArticulo,
            'codigoBodega': dataItem.codigoBodega,
            'saldo': dataItem.saldo,
            'total': dataItem.total,
            'compartimientos': dataItem.compartimientos,
            'cantidad': [dataItem.cantidad, Validators.compose([Validators.required, Validators.min(0), Validators.max(dataItem.total)])]
        });
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem, column } = args;
        let cantidadTransferencia = formGroup.get('cantidad').value;
        let saldo = formGroup.get('total').value;
        if(cantidadTransferencia > saldo){
            this._notificarService.mostrarMensajeError('La cantidad de transferencia no puede ser mayor al saldo');
            formGroup.markAllAsTouched();
            args.preventDefault();
        }else if (!formGroup.valid) {
            args.preventDefault();
        } else if (formGroup.dirty) {
            this._editService.assignValues(dataItem, formGroup.value);
            this._editService.update(dataItem);
            this.actualizarDetalle(dataItem);
        }
    }

    actualizarDetalle(documentoDetalle: any){
        delete documentoDetalle.pesoTotal;
        delete documentoDetalle.pesoSeleccion;
        if(this.tipo === 'entrada'){
            this._transferenciasService.actualizarDocumentoDetalleEntrada(this.transferenciaId,documentoDetalle).subscribe(data => {
                this.cargarInformacionInicial();
            });
        }else{
            this._transferenciasService.actualizarDocumentoDetalleSalida(this.transferenciaId,documentoDetalle).subscribe(data => {
                this.cargarInformacionInicial();
            });
        }
    }
}
