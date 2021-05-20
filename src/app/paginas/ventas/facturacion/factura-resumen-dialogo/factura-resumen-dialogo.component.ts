import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { AprobacionService } from 'src/app/_servicio/ventas/aprobacion.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { FacturaResultadoDialogoComponent } from '../factura-resultado-dialogo/factura-resultado-dialogo.component';
import { ReservaFacturaDisponibleDTO } from 'src/app/_dto/ventas/reservas/reservaFacturaDisponibleDTO';

@Component({
    selector: 'app-factura-resumen-dialogo',
    templateUrl: './factura-resumen-dialogo.component.html',
    styleUrls: ['./factura-resumen-dialogo.component.scss']
})
export class FacturaResumenDialogoComponent implements OnInit {

    public reserva: DocumentoReserva;
    public resumen: any;
    public itemsFactura: any[] = [];
    public itemsTransferencias: any[] = [];
    public puntoVenta: string = '';
    public respuestaValidacion: ReservaFacturaDisponibleDTO;

    @ViewChild("containerConfirmacionFactura", { read: ViewContainerRef })
    public containerConfirmacionFacturaRef: ViewContainerRef;

    constructor(
        private notificarService: NotificarService,
        private reservaFacturaService: ReservaService,
        private dialogService: DialogService,
        private aprobacionService: AprobacionService,
        private dialogRef: DialogRef,
        private router: Router,
        private comprasService: ComprasService,
    ) { }

    ngOnInit(): void {
        this.puntoVenta = this.reserva.cotizacion.puntoVenta.nombre;
        this.obtenerFacturaResumen();
    }

    private obtenerFacturaResumen() {
        this.reservaFacturaService.resumenFactura(this.reserva.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.resumen = data;
            this.itemsFactura = data['detalle'];
            this.itemsTransferencias = data['detalleTransferencias'];
        })
    }

    public confirmar() {
        this.reservaFacturaService.validarDisponibilidadReserva(this.reserva.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.respuestaValidacion = data;
            if (this.respuestaValidacion.existeDisponible) {
                this.iniciarProcesoFactura();
            } else {
                this.dialogRef.close();
            }
        })

    }

    private iniciarProcesoFactura() {
        this.reservaFacturaService.validarFactura(this.reserva.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            if (data.length > 0) {
                this.abrirConfirmacionAprobacioDialogo(data);
            } else {
                this.procesarFactura();
                this.generasCompras();
            }
        })
    }

    private generasCompras() {
        this.comprasService.integrarOrdenesCompraPorCotizacionId(this.reserva.cotizacion.id).subscribe();
    }

    private procesarFactura() {
        this.reservaFacturaService.procesarFactura(this.reserva.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.verInformacionFacturaProcesada(data);
        })
    }

    private enviarAprobacion() {
        this.aprobacionService.lanzarSolicitudReservaFactura(this.reserva.id).subscribe();
        this.notificarService.desactivarLoading();
        this.dialogRef.close();
        this.router.navigate(['ventas/overview']);
    }

    private abrirConfirmacionAprobacioDialogo(data: any[]) {
        let mensaje: string = "Para continuar con el proceso se debe enviar el documento a aprobación, debido a las siguientes novedades: ";
        let mensajeConfirmacion = "¿ Desea enviar ?";
        let mensajeNovedades: string = "";
        mensajeNovedades = data.join(', ');
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionFacturaRef,
            title: 'Confirmación',
            content: `${mensaje} ${mensajeNovedades} ${mensajeConfirmacion}`,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 200,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this.enviarAprobacion();
                }
            }
        });
    }

    private verInformacionFacturaProcesada(data) {
        const dialogIFP: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionFacturaRef,
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
                this.router.navigate(['ventas/overview']);
            } else {
                if (result['text'] === 'Aceptar') {
                    this.dialogRef.close();
                    this.router.navigate(['ventas/overview']);
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
