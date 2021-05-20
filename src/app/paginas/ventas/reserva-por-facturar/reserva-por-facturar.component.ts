import { FacturaResultadoDialogoComponent } from './../facturacion/factura-resultado-dialogo/factura-resultado-dialogo.component';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';

@Component({
    selector: 'app-reserva-por-facturar',
    templateUrl: './reserva-por-facturar.component.html',
    styleUrls: ['./reserva-por-facturar.component.scss']
})
export class ReservaPorFacturarComponent implements OnInit {

    private reservasPorFacturar: DocumentoReserva[] = [];
    public gridReservasView: GridDataResult;
    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
        filter: {
            logic: 'and',
            filters: [{ field: 'nombreCliente', operator: 'contains', value: '' }]
        }
    }

    public abrirSolicitud: Boolean = false;
    public reservaSeleccionada: DocumentoReserva;
    public resumen: any;

    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("containerFacturaProcesada", { read: ViewContainerRef })
    public containerFacturaProcesadaRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _reservaService: ReservaService,
        private _dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this._reservaService.reservasPorFacturarCambio.subscribe(data => {
            this.reservasPorFacturar = data;
            this.gridReservasView = process(this.reservasPorFacturar, this.state);
        })
        this.listarReservasPorFactuar();
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridReservasView = process(this.reservasPorFacturar, this.state);
    }

    private listarReservasPorFactuar() {
        this._reservaService.listarReservasPorFacturar().subscribe(data => {
            this._notificarService.desactivarLoading();
            this._reservaService.reservasPorFacturarCambio.next(data);
        })
    }

    public cerrarSolicitud() {
        this.abrirSolicitud = false;
        this.resumen = undefined;
    }

    public abrirReservaDetalle(value: DocumentoReserva) {
        this._reservaService.resumenFactura(value.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.reservaSeleccionada = value;
            this.abrirSolicitud = true;
            this.resumen = data;
        })
    }

    public confirmarAccion(accion: string) {
        /* acction: facturar, anular
         */
        let accionSeleccionada = accion === 'facturar' ? 'FACTURAR' : 'ANULAR'
        let mensaje: string = `¿Está seguro que desea ${accionSeleccionada} la reserva ${this.reservaSeleccionada.numero}?`;

        const dialog: DialogRef = this._dialogService.open({
            appendTo: this.containerConfirmacionRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 150,
            minWidth: 200
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    if (accion === 'facturar')
                        this.facturar();
                    if (accion === 'anular')
                        this.anular();
                }
            }
        });
    }

    private facturar() {
        if (this.reservaSeleccionada !== undefined) {
            this._reservaService.procesarFactura(this.reservaSeleccionada.id).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.verInformacionFacturaProcesada(data);
            })
        }
    }

    private anular() {
        if (this.reservaSeleccionada !== undefined) {
            this._reservaService.anularReservaPorId(this.reservaSeleccionada.id).subscribe(data => {
                this.cerrarSolicitud();
                this.listarReservasPorFactuar();
                this._notificarService.desactivarLoading();
                this._notificarService.mostrarMensajeExito(`La reserva ${this.reservaSeleccionada.numero} ha sido anulada satisfactoriamente`);
            })
        }
    }

    private verInformacionFacturaProcesada(data) {
        const dialogIFP: DialogRef = this._dialogService.open({
            appendTo: this.containerFacturaProcesadaRef,
            title: 'Información',
            content: FacturaResultadoDialogoComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 450,
            minHeight: 300,
            minWidth: 250
        });
        const facturaResultadoRegistro = dialogIFP.content.instance;
        facturaResultadoRegistro.resultado = data;

        dialogIFP.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.listarReservasPorFactuar()
            } else {
                if (result['text'] === 'Aceptar') {
                    this.listarReservasPorFactuar();
                    this.cerrarSolicitud();
                }
            }
        });
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    public calcularTotalItem(dataItem: DocumentoDetalle) {
        if (dataItem.cantidad === dataItem.cotizacionDetalle.cantidad) {
            return dataItem.cotizacionDetalle.total;
        } else {
            const total = dataItem.cantidad * dataItem.cotizacionDetalle.subTotal;
            return Number(total.toFixed(2));
        }
    }


}
