import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { switchMap } from 'rxjs/operators';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaBodegaService } from 'src/app/_servicio/sistema/punto-venta-bodega.service';
import { FacturaService } from 'src/app/_servicio/ventas/factura.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';

@Component({
    selector: 'app-picking-factura-servicio-dialogo',
    templateUrl: './picking-factura-servicio-dialogo.component.html',
    styleUrls: ['./picking-factura-servicio-dialogo.component.scss']
})
export class PickingFacturaServicioDialogoComponent implements OnInit {

    public cotizacion: Cotizacion;
    public item: CotizacionDetalle;

    public cantidadTotal: number = 0;
    public bodegaPrincipal: string;
    public cantidad: number;

    public activarAceptar: boolean = false;
    public mensajeError: string;

    constructor(
        public dialog: DialogRef,
        private _notificarService: NotificarService,
        private _reservaFacturaService: ReservaService,
        private _puntoVentaBodegaService: PuntoVentaBodegaService
    ) { }

    ngOnInit(): void {
        this.obtenerBodegaPrincipal();
    }

    private obtenerBodegaPrincipal() {
        this._puntoVentaBodegaService.buscarBodegaPrincipal().subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data !== null) {
                this.bodegaPrincipal = data.codigo;
            }
        })
    }

    public onChange(value: number) {
        this.cantidad = value;
        this.cantidadTotal = value;
    }

    public onBlur(): void {
        this.cantidadReservadaValida();
    }

    private cantidadReservadaValida() {
        this.mensajeError = undefined;
        if (this.cantidadTotal > this.item.saldo) {
            this.mensajeError = 'Cantidad a reservar no puede ser mayor a la cotizada.';
            this.activarAceptar = false;
        } else if (this.cantidad = 0) {
            this.activarAceptar = false;
        } else {
            this.activarAceptar = true;
        }
    }

    public guardarReserva() {
        let reserva = new DocumentoReserva();
        reserva.cotizacion = this.cotizacion;
        reserva.detalle = this.crearDetalle();
        this._reservaFacturaService.registrarDetalle(reserva).pipe(switchMap(() => {
            return this._reservaFacturaService.listarPorCotizacionID(this.cotizacion.id);
        })).subscribe(data => {
            this._notificarService.desactivarLoading();
            this._reservaFacturaService.reservaCambio.next(data);
            this.cerrarDialogo();
        });
    }

    private crearDetalle() {
        let detalle = [];
        let itemDetalle = new DocumentoDetalle();
        itemDetalle.codigoBodega = this.bodegaPrincipal;
        itemDetalle.cotizacionDetalle = this.item;
        itemDetalle.cantidad = this.cantidadTotal;
        itemDetalle.saldo = this.cantidadTotal;
        itemDetalle.cantidadReserva = 0;
        itemDetalle.codigoArticulo = this.item.codigoArticulo;
        itemDetalle.descripcionArticulo = this.item.descripcionArticulo;
        itemDetalle.codigoArticuloAlterno = this.item.codigoArticuloAlterno;
        itemDetalle.claseArticulo = this.item.claseArticulo;
        itemDetalle.pesoArticulo = this.item.pesoArticulo;
        itemDetalle.unidadMedida = this.item.unidadMedida;
        itemDetalle.costoUnitario = this.item.costoUnitario;
        itemDetalle.servicio = true;
        detalle.push(itemDetalle);
        return detalle;
    }

    public cerrarDialogo() {
        this.dialog.close();
    }
}
