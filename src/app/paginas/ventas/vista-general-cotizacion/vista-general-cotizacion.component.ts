import { ConsultaGuiaRemisionResultadoDialogoComponent } from './../guiaRemision/consulta-guia-remision-resultado-dialogo/consulta-guia-remision-resultado-dialogo.component';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult, RowArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { CotizacionService } from 'src/app/_servicio/ventas/cotizacion.service';
import { FacturaService } from 'src/app/_servicio/ventas/factura.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';
import { GuiaRemisionService } from 'src/app/_servicio/ventas/guia-remision.service';
import { ConsultaFacturasResultadoDialogoComponent } from '../facturacion/consulta-facturas-resultado-dialogo/consulta-facturas-resultado-dialogo.component';
import { ConsultaTransferenciaResultadoDialogoComponent } from '../transferencia/consulta-transferencia-resultado-dialogo/consulta-transferencia-resultado-dialogo.component';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { forkJoin } from 'rxjs';
import { ConsultaOrdenesCompraComponent } from '../facturacion/consulta-ordenes-compra/consulta-ordenes-compra.component';
import { ConsultaDevolucionResultadoDialogoComponent } from '../devolucion/consulta-devolucion-resultado-dialogo/consulta-devolucion-resultado-dialogo.component';
import { NotaCreditoService } from 'src/app/_servicio/ventas/nota-credito.service';
import { ConsultaReservaResultadoDialogoComponent } from '../reserva/consulta-reserva-resultado-dialogo/consulta-reserva-resultado-dialogo.component';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { ConsultaGuiaDespachoResultadoDialogoComponent } from '../guia-despacho/consulta-guia-despacho-resultado-dialogo/consulta-guia-despacho-resultado-dialogo.component';
import { ConsultaRecepcionesCompraComponent } from '../facturacion/consulta-recepciones-compra/consulta-recepciones-compra.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-vista-general-cotizacion',
    templateUrl: './vista-general-cotizacion.component.html',
    styleUrls: ['./vista-general-cotizacion.component.scss']
})
export class VistaGeneralCotizacionComponent implements OnInit {

    public documentosLista: Cotizacion[] = [];
    public itemSeleccionado: any[] = [];
    public selectableSettings: SelectableSettings;

    public visualizarCotizacion: Cotizacion;
    public permitirReporteCotizacion: Boolean = false;
    public permitirReporteGuiaDespacho: Boolean = false;
    public abrirDetalle: boolean = false;
    public mostrarBotonCompras: boolean = false;
    public gridDocumentosView: GridDataResult;

    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
        filter: {
            logic: 'and',
            filters: [{ field: 'nombreCliente', operator: 'contains', value: '' }]
        }
    }

    @ViewChild("containerConsultaFactura", { read: ViewContainerRef })
    public containerConsultaFacturaRef: ViewContainerRef;
    @ViewChild("containerConsultaGuiaRemision", { read: ViewContainerRef })
    public containerConsultaGuiaRemisionRef: ViewContainerRef;
    @ViewChild("containerConsultaTransferencia", { read: ViewContainerRef })
    public containerConsultaTransferenciaRef: ViewContainerRef;
    @ViewChild("containerConsultaReserva", { read: ViewContainerRef })
    public containerConsultaReservaRef: ViewContainerRef;
    @ViewChild("containerConsultaGuiaDespacho", { read: ViewContainerRef })
    public containerConsultaGuiaDespachoRef: ViewContainerRef;

    constructor(public route: ActivatedRoute,
        private router: Router,
        private cotizacionService: CotizacionService,
        private notificarService: NotificarService,
        private fechaService: FechaService,
        private _guiaDespachoService: GuiaDespachoService,
        private _facturaService: FacturaService,
        private _guiaRemisionService: GuiaRemisionService,
        private _transferenciaService: TransferenciasService,
        private _reservaFacturaService: ReservaService,
        private dialogService: DialogService,
        private _comprasService: ComprasService,
        private _notaCreditoService: NotaCreditoService,
    ) { }

    ngOnInit(): void {
        this.selectableSettings = {
            mode: 'single',
        }
        this.cotizacionService.cotizacionCambio.subscribe(data => {
            this.documentosLista = data;
            this.gridDocumentosView = process(data, this.state);
        })
        this.listarCotizaciones();
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridDocumentosView = process(this.documentosLista, this.state);
    }

    private listarCotizaciones() {
        this.cotizacionService.listarTodosPorUsuarioYPuntoVenta().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.documentosLista = data;
            this.gridDocumentosView = process(data, this.state);
        })
    }

    public formatearFecha(fecha: any) {
        return this.fechaService.formatearFecha(fecha);
    }

    public eventoSeleccion(context: RowArgs): any {
        return context.dataItem;
    }

    public cotizar() {
        if (this.itemSeleccionado.length) {
            if (this.itemSeleccionado[0].estado === 'NUEVO') {
                this.router.navigate(['ventas/overview/edicion', this.itemSeleccionado[0].id]);
            } else {
                this.notificarService.mostrarMensajeAdvertencia("El documento seleccionado tiene un estado diferente de Nuevo");
            }
        }
    }

    public recotizar() {
        if (this.itemSeleccionado.length) {
            this.cotizacionService.recotizarDocumento(this.itemSeleccionado[0].id).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.router.navigate(['ventas/overview/edicion', data.id]);
            })
        }
    }

    public hablitarBotonPorOpcion(opcion: string): boolean {
        if (this.itemSeleccionado.length) {
            let estado = this.itemSeleccionado[0].estado;
            switch (opcion) {
                case 'cotizar':
                    if (estado === 'NUEVO')
                        return false;
                    else return true;
                case 'recotizar':
                    if (estado === 'VENCIDO' || estado === 'ANULADO' || estado === 'RECHAZADO' || estado === 'CERRADO' || estado === 'EMITIDO')
                        return false;
                    else return true;
                case 'facturar':
                    if (estado === 'APROBADO' || estado === 'EMITIDO' || estado === 'POR_FACTURAR')
                        return false;
                    else return true;
                /*  case 'reservar':
                     if (estado === 'APROBADO' || estado === 'EMITIDO')
                         return false;
                     else return true; */
                default:
                    return true;
            }
        } else {
            return true;
        }
    }

    public mostrarBotonDescargarDocuemto(estado: string): boolean {
        switch (estado) {
            case 'EMITIDO':
            case 'APROBADO':
                return true;
            default: return false;
        }
    }

    public descargarDocuemnto(value: Cotizacion) {
        this.cotizacionService.imprimirDocumento(value.id).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `${value.numero}_${this.fechaService.fechaActual()}`;
            a.click();
        })
    }

    public reservar() {
        if (this.itemSeleccionado.length) {
            this.router.navigate(['ventas/reserva', this.itemSeleccionado[0].id]);
        }
    }

    public facturar() {
        if (this.itemSeleccionado.length) {
            this.router.navigate(['ventas/factura', this.itemSeleccionado[0].id]);
        }
    }

    public verDetalle(value: Cotizacion) {
        let ordenesCompraObs = this._comprasService.listarOrdenesCompraPorCotizacionId(value.id);
        let cotizacionObs = this.cotizacionService.listarPorId(value.id);

        forkJoin([cotizacionObs, ordenesCompraObs]).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.visualizarCotizacion = data[0];
            this.permitirReporteCotizacion = this.permitirBotonReporteCotizacion(data[0].estado);
            this.permitirReporteGuiaDespacho = this.permitirBotonReporteGuiaDespacho(data[0].estado);
            this.abrirDetalle = true;
            this.mostrarBotonCompras = data[1].length > 0;
        });
    }

    public permitirBotonReporteCotizacion(estado: string): boolean {
        switch (estado) {
            //case 'NUEVO':
            case 'EMITIDO':
            case 'APROBADO':
            case 'POR_FACTURAR':
            case 'FACTURADO':
            case 'CERRADO':
                return true;
            default: return false;
        }
    }
    public permitirBotonReporteGuiaDespacho(estado: string): boolean {
        switch (estado) {
            case 'POR_FACTURAR':
            case 'FACTURADO':
            case 'CERRADO':
                return true;
            default: return false;
        }
    }

    public descargarCotizacion() {
        this.descargarDocuemnto(this.visualizarCotizacion);
    }

    public abrirDetalleGuiaDespacho() {
        this._guiaDespachoService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaGuiaDespachoRef,
                title: 'Guías Despacho',
                content: ConsultaGuiaDespachoResultadoDialogoComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaFactura = dialogIFP.content.instance;
            consultaFactura.guias = data;
        })
    }

    public abrirDetalleFacturas() {
        this._facturaService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.abrirConsultaFacturasDialogo(data);
        })
    }

    private abrirConsultaFacturasDialogo(data: FacturaDTO[]) {
        const dialogIFP: DialogRef = this.dialogService.open({
            appendTo: this.containerConsultaFacturaRef,
            title: 'Facturas',
            content: ConsultaFacturasResultadoDialogoComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 450,
            minHeight: 300,
            minWidth: 250
        });
        const consultaFactura = dialogIFP.content.instance;
        consultaFactura.facturas = data;
    }

    public abrirDetalleGuiaReision() {
        this._guiaRemisionService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaGuiaRemisionRef,
                title: 'Guías Remisión',
                content: ConsultaGuiaRemisionResultadoDialogoComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaFactura = dialogIFP.content.instance;
            consultaFactura.facturas = data;
        })
    }

    public abrirDetalleTransferencia() {
        this._transferenciaService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaTransferenciaRef,
                title: 'Transferencias',
                content: ConsultaTransferenciaResultadoDialogoComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaFactura = dialogIFP.content.instance;
            consultaFactura.facturas = data;
        })
    }

    public abrirDetalleNotaCredito() {
        this._notaCreditoService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaTransferenciaRef,
                title: 'Notas de Crédito',
                content: ConsultaDevolucionResultadoDialogoComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaFactura = dialogIFP.content.instance;
            consultaFactura.notasCredito = data;
        })
    }

    public abrirDetalleCompras() {
        this._comprasService.listarOrdenesCompraPorCotizacionId(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaTransferenciaRef,
                title: 'Compras',
                content: ConsultaOrdenesCompraComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaCompras = dialogIFP.content.instance;
            consultaCompras.cotizacionId = this.visualizarCotizacion.id;
            consultaCompras.ordenesCompra = data;
        })
    }

    public abrirDetalleRecepciones() {
        this._comprasService.listarRecepcionesCompraPorCotizacionId(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaTransferenciaRef,
                title: 'Recepciones Compra',
                content: ConsultaRecepcionesCompraComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const recepcionesCompra = dialogIFP.content.instance;
            let recepciones = _.filter(data, (d) => { return d.numeroRecepcion !== null });
            recepcionesCompra.recepcionesCompra = recepciones;
        })
    }

    public cerrarDetalle() {
        this.abrirDetalle = false;
    }

    public abrirDetalleReservas() {
        this._reservaFacturaService.listarTodasPorCotizacionID(this.visualizarCotizacion.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            const dialogIFP: DialogRef = this.dialogService.open({
                appendTo: this.containerConsultaReservaRef,
                title: 'Reservas',
                content: ConsultaReservaResultadoDialogoComponent,
                actions: [
                    { text: 'Aceptar', primary: true }
                ],
                width: 450,
                minHeight: 300,
                minWidth: 250
            });
            const consultaFactura = dialogIFP.content.instance;
            consultaFactura.reservas = data;
        })
    }
}
