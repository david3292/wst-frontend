import { switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';

@Component({
    selector: 'app-picking-dialogo',
    templateUrl: './picking-dialogo.component.html',
    styleUrls: ['./picking-dialogo.component.scss']
})
export class PickingDialogoComponent implements OnInit {

    public cotizacion: Cotizacion;
    public item: CotizacionDetalle;

    public cantidadTotal: number = 0;
    public stock: any[] = [];

    public mensajeError: string;
    public cantidades: DocumentoDetalle[] = [];

    constructor(
        public dialog: DialogRef,
        private notificarService: NotificarService,
        private reservaService: ReservaService,
        private articuloService: ArticuloService,
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
                    if (value === 0) {
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
            this.cantidadTotal = this.cantidadTotal + x.cantidad;
        });
        this.cantidadReservadaValida();
    }

    public guardarReserva() {
        let reserva = new DocumentoReserva();
        reserva.cotizacion = this.cotizacion;
        delete reserva.cotizacion['formaPagoCadena'];
        reserva.detalle = this.crearDetalle();
        this.reservaService.registrar(reserva).subscribe(data =>{
            this.notificarService.desactivarLoading();
            this.reservaService.reservaCambio.next(data);
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
            detalle.push(itemDetalle);
        });
        return detalle;
    }

    public cantidadReservadaValida(): boolean {
        if (this.cantidadTotal > this.item.cantidad) {
            this.mensajeError = 'Cantidad a reservar no puede ser mayor a la cotizada.';
            return false;
        }
        this.mensajeError = undefined;
        return true;
    }

    public cerrarDialogo() {
        this.dialog.close();
    }

}
