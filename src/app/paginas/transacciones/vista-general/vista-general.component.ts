import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { TransaccionService } from 'src/app/_servicio/transacciones/transaccion.service';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import * as _ from 'lodash';
import { RecepcionCompraDTO } from 'src/app/_dto/compras/recepcionCompraDTO';
import { DocumentoNotaCredito } from 'src/app/_dominio/ventas/documentoNotaCredito';
import { NotaCreditoService } from 'src/app/_servicio/ventas/nota-credito.service';
import { NotaCreditoConsultaDTO } from 'src/app/_dto/ventas/notaCreditoConsultaDTO';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { TransaccionesCobroDetalleComponent } from '../transacciones-cobro-detalle/transacciones-cobro-detalle.component';
import { CobroResultadoDialogoComponent } from '../../../components/commons/cobro-resultado-dialogo/cobro-resultado-dialogo.component';

@Component({
    selector: 'app-vista-general',
    templateUrl: './vista-general.component.html',
    styleUrls: ['./vista-general.component.scss']
})
export class VistaGeneralComponent implements OnInit {

    public facturasError: DocumentoFactura[] = [];
    public notasCreditoError: DocumentoNotaCredito[] = [];

    public compras: OrdenCompraDTO[] = [];
    public recepciones: RecepcionCompraDTO[] = [];

    public mensajeError: string = '';

    public compraSeleccionada: OrdenCompraDTO;

    public cobrosPendientes: Cobro[] = [];

    @ViewChild("containerCausa", { read: ViewContainerRef })
    public containerCausaRef: ViewContainerRef;

    @ViewChild("containerDialog", { read: ViewContainerRef })
    public containerDialogRef: ViewContainerRef;

    @ViewChild("containerCausaCobro", { read: ViewContainerRef })
    public containerCausaCobroRef: ViewContainerRef;

    @ViewChild("containerCobroResultado", { read: ViewContainerRef })
    public cobroResultadoRef: ViewContainerRef;

    constructor(private _notificarService: NotificarService,
        private _transaccionService: TransaccionService,
        private _notaCreditoService: NotaCreditoService,
        private dialogService: DialogService,
        private _comprasService: ComprasService,
        private _cobroService: CobroService
    ) { }

    ngOnInit(): void {
        this.listarFacturasEstadoError()
        this.listarNotasCreditoEstadoError();
        this.cargarDatos();
        this.listarFacturasEstadoError();
        this.listarNotasCreditoEstadoError();
        this.listarCobros();
    }

    private listarFacturasEstadoError() {
        this._transaccionService.listarFacturasEstadoError().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.facturasError = data;
        })
    }

    public reintentarFacturaIntegrar(dataItem: DocumentoFactura) {
        this._transaccionService.reintegrarFactura(dataItem.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.resultado(data);
            this.listarFacturasEstadoError();
        })
    }

    public verCausaDialogo(error: string) {
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerCausaRef,
            title: 'Causa Error',
            content: error,
            width: 450,
            height: 200,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
        });
    }

    private resultado(respuesta: FacturaDTO) {
        switch (respuesta.estado) {
            case 'ERROR':
                this._notificarService.mostrarMensajeError(`Error al procesar la factura  ${respuesta.numeroFactura} `)
                break;
            case 'EMITIDO':
                this.notificarMensaje(`Se ha procesado la factura ${respuesta.numeroFactura} correctamente.`)
                break;
            default:
                break;
        }
    }

    private notificarMensaje(mensaje: string) {
        this._notificarService.loadingCambio.next(false);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }
    //-----------------------------------------------------------------------------------
    //----------------transacciones de ordenes de compra---------------------------------
    cargarDatos() {
        this._comprasService.listarComprasConError().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.compras = data;
        });

        this._comprasService.listarRecepcionesConError().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.recepciones = data;
        });
    }

    procesarCompra(compra: OrdenCompraDTO) {
        this._comprasService.procesarCompraPorId(compra.id).subscribe(data => {
            this.cargarDatos();
            if (data.estado === 'ERROR_ORDEN_COMPRA') {
                this._notificarService.mostrarMensajeError('Error al procesar la compra');
            } else {
                this._notificarService.mostrarMensajeExito('Compra procesada correctamente');
            }
        });
    }
    /**
     * REINTEGRAR NOTAS DE CREDITO
     */
    private listarNotasCreditoEstadoError() {
        this._notaCreditoService.listarNotasCreditoEstadoError().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.notasCreditoError = data;
        })
    }

    public reintentarNotaCreditoIntegrar(dataItem: DocumentoNotaCredito) {
        this._notaCreditoService.reintegrarNotaCredito(dataItem.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.resultadoNC(data);
            this.listarNotasCreditoEstadoError();
        })
    }

    private resultadoNC(respuesta: NotaCreditoConsultaDTO) {
        switch (respuesta.estado) {
            case 'ERROR':
                this._notificarService.mostrarMensajeError(`Error al procesar la nota de credito  ${respuesta.numero} `)
                break;
            case 'EMITIDO':
                this.notificarMensaje(`Se ha procesado la nota de crédito ${respuesta.numero} correctamente.`)
                break;
            default:
                break;
        }
    }

    procesarRecepcion(recepcion: RecepcionCompraDTO) {
        this._comprasService.procesarRecepcionCompraPorId(recepcion.id).subscribe(data => {
            this.cargarDatos();
            if (data.recepcionCompra.estado === 'ERROR_RECEPCION') {
                this._notificarService.mostrarMensajeError('Error al procesar la recepción de compra');
            } else {
                this._notificarService.mostrarMensajeExito('Recepción procesada correctamente');
            }
        });
    }

    verMensajeError(objeto: any, mensajeErrorTemplate: TemplateRef<any>) {
        this.mensajeError = objeto.mensajeError;;
        const dialogoError = this.dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Error Compra',
            content: mensajeErrorTemplate,
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Aceptar', primary: true }
            ]
        });
    }

    /*
     **************** COBROS PENDIENTES ****************
    */
    listarCobros() {
        this._cobroService.listarCobrosPendientes().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.cobrosPendientes = data;
        })
    }

    public verCausaDialogoCobro(dataItem: Cobro) {
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerCausaCobroRef,
            title: `Causa Error ${dataItem.numero}`,
            content: TransaccionesCobroDetalleComponent,
            width: 700,
            minHeight: 350,
            maxHeight:500,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
        });

        const dialogCobroDetalle = dialog.content.instance;
        dialogCobroDetalle.cobro = dataItem;
    }

    public reintegrarCobro(dataItem: Cobro){
        this._cobroService.reintegrar(dataItem.id).subscribe(data =>{
            this._notificarService.desactivarLoading();
            this.abrirCobroResultadoDialogo(data);
        })
    }

    private abrirCobroResultadoDialogo(data) {
        const dialogCobroResultado: DialogRef = this.dialogService.open({
            appendTo: this.cobroResultadoRef,
            title: 'Información',
            content: CobroResultadoDialogoComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 500,
            minHeight: 300,
            minWidth: 250
        });
        const facturaResultadoRegistro = dialogCobroResultado.content.instance;
        facturaResultadoRegistro.resultado = data;

        dialogCobroResultado.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.listarCobros();
            } else {
                if (result['text'] === 'Aceptar') {
                    this.listarCobros();
                }
            }
        });
    }
}
