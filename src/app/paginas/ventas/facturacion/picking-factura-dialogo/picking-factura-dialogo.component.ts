import { DocumentoFactura } from './../../../../_dominio/ventas/documentoFactura';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FacturaService } from 'src/app/_servicio/ventas/factura.service';
import { switchMap } from 'rxjs/operators';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';

@Component({
    selector: 'app-picking-factura-dialogo',
    templateUrl: './picking-factura-dialogo.component.html',
    styleUrls: ['./picking-factura-dialogo.component.scss']
})
export class PickingFacturaDialogoComponent implements OnInit {

    public cotizacion: Cotizacion;
    public item: CotizacionDetalle;
    public cantidadSeleccionadaCompraL: number = 0;

    public cantidadTotal: number = 0;
    public stock: any[] = [];

    public activarAceptar: boolean = false;
    public mensajeError: string;
    public cantidades: DocumentoDetalle[] = [];

    constructor(
        public dialog: DialogRef,
        private notificarService: NotificarService,
        private reservaFacturaService: ReservaService,
        private articuloService: ArticuloService
    ) { }

    ngOnInit(): void {
        this.calcularStock();
    }

    private calcularStock() {
        this.articuloService.obtenerStock(this.item.codigoArticulo, this.cotizacion.puntoVenta.nombre).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.stock = data["stockDetalle"];
        });
    }

    public onChange(value: any, dataItem: any) {
        let item = new DocumentoDetalle();
        item.cantidad = value;
        item.codigoBodega = dataItem['bodega']['codigo'];
        let cantidadBodega = this.existeCantidadParaBodega(item.codigoBodega);
        if (cantidadBodega !== undefined) {
            this.cantidades.map((x, i) => {
                if (x.codigoBodega === cantidadBodega.codigoBodega) {
                    if (value === 0 || value === null) {
                        this.cantidades.splice(i, 1);
                    } else {
                        x.cantidad = value;
                    }
                }
            })
        } else {
            this.cantidades.push(item);
        }
    }

    private existeCantidadParaBodega(codigo: string) {
        return this.cantidades.find(x => x.codigoBodega === codigo);
    }

    public onBlur(): void {
        this.cantidadTotal = 0;
        this.cantidades.map(x => {
            this.cantidadTotal = Number((this.cantidadTotal + x.cantidad).toFixed(2));
        });
        this.cantidadReservadaValida();
    }

    public guardarReserva() {
        let reserva = new DocumentoReserva();
        reserva.cotizacion = this.cotizacion;
        delete reserva.cotizacion['formaPagoCadena'];
        reserva.detalle = this.crearDetalle();
        this.reservaFacturaService.registrarDetalle(reserva).pipe(switchMap(() => {
            return this.reservaFacturaService.listarPorCotizacionID(this.cotizacion.id);
        })).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.reservaFacturaService.reservaCambio.next(data);
            this.cerrarDialogo();
        });
    }

    private crearDetalle() {
        let detalle = [];
        this.cantidades.map(x => {
            let itemDetalle = new DocumentoDetalle();
            itemDetalle.codigoBodega = x.codigoBodega;
            itemDetalle.cotizacionDetalle = this.item;
            itemDetalle.cantidad = x.cantidad;
            itemDetalle.saldo = x.cantidad;
            itemDetalle.codigoArticulo = this.item.codigoArticulo;
            itemDetalle.descripcionArticulo = this.item.descripcionArticulo;
            itemDetalle.codigoArticuloAlterno = this.item.codigoArticuloAlterno;
            itemDetalle.claseArticulo = this.item.claseArticulo;
            itemDetalle.pesoArticulo = this.item.pesoArticulo;
            itemDetalle.unidadMedida = this.item.unidadMedida;
            itemDetalle.costoUnitario = this.item.costoUnitario;
            itemDetalle.cantidadReserva = this.asignarCantidadDeCompra(x);
            detalle.push(itemDetalle);
        });
        return detalle;
    }

    private asignarCantidadDeCompra(item: DocumentoDetalle): number {
        if (item.codigoBodega === this.obtenerBodegaPrincipalCodigo()) {
            if (this.item.cantidadReserva && this.item.cantidadReserva > 0) {
                if(item.cantidad > this.item.cantidadReserva)
                    return this.item.cantidadReserva;
                else
                    return item.cantidad;
            }
            return 0;
        }
        return 0;
    }

    private obtenerBodegaPrincipalCodigo() {
        if (this.stock.length) {
            let stockAux = this.stock.find(x => x["bodegaPrincipal"] == true);
            return stockAux == undefined ? '' : stockAux['bodega']['codigo'];
        }
    }

    private cantidadReservadaValida() {
        this.mensajeError = undefined;

        if (this.cantidadTotal > this.item.saldo) {
            this.mensajeError = 'Cantidad a reservar no puede ser mayor a la cotizada.';
            this.activarAceptar = false;
        } else {
            this.activarAceptar = true;
        }
        /* else if (this.validarConsumoBodegaPrincipal()) {
           this.activarAceptar = true;
       } else {
           this.mensajeError = 'Se debe consumir primero la bodega principal.';
           this.activarAceptar = false;
       } */

    }

    public cerrarDialogo() {
        this.dialog.close();
    }

    /*   private validarConsumoBodegaPrincipal() {
          let codigoBodegaPrincipal = this.obtenerBodegaPrincipalCodigo();
          let bpCantidad = this.cantidades.find(x => x.codigoBodega == codigoBodegaPrincipal);
          if ((bpCantidad !== undefined) && (this.cantidades.length === 1)) {
              return true;
          }
          else {
              let stockBP = this.stock.find(x => x["bodegaPrincipal"] === true);
              if (stockBP !== undefined) {
                  if ((bpCantidad !== undefined) && (stockBP["cantidadTotal"] < this.item.saldo)) {
                      return true;
                  } else {
                      if (bpCantidad == undefined && stockBP["cantidadTotal"] == 0 && this.cantidadTotal > 0) {
                          return true;
                      }
                      else {
                          return false;
                      }
                  }
              } else {
                  return true;
              }

          }
      } */

    public bloquearSeleccionCantidad(value) {
        const cantidadConCantidadReserva = value.cantidadTotal + this.item.cantidadReserva - this.cantidadSeleccionadaCompraL;
        if (cantidadConCantidadReserva <= 0)
            return true;
    }

    public maximaCantidad(value) {
        return value + this.item.cantidadReserva - this.cantidadSeleccionadaCompraL;
    }

    public cantidadCompraDisponible(){
        if(this.cantidadSeleccionadaCompraL > this.item.cantidadReserva)
            return 0;

        return this.item.cantidadReserva - this.cantidadSeleccionadaCompraL;
    }

}
