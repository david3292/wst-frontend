import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import { environment } from 'src/environments/environment';
import { StockDialogoComponent } from '../../cotizacion/buscar-articulo-dialogo/stock-dialogo/stock-dialogo.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-detalle',
    templateUrl: './detalle.component.html',
    styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {

    @Input()
    documento: Cotizacion = new Cotizacion();
    @Input()
    reservaFactura: DocumentoReserva;

    public detalle: CotizacionDetalle[] = [];
    public subTotal0: number = 0;
    public subTotal12: number = 0;
    public iva: number = 0;
    public total: number = 0;

    constructor(
        private articuloService: ArticuloService,
        private notificarService: NotificarService,
        private dialogService: DialogService
        ) { }

    ngOnInit(): void {
        this.detalle=[];
        this.crearDetalle()
    }

    private calculo() {
        this.detalle.map(x => {
            if (x.impuestoValor == 0) {
                this.subTotal0 = Number((this.subTotal0 + x.total).toFixed(2));
            } else {
                this.subTotal12 = Number((this.subTotal12 + x.total).toFixed(2));
            }
        })
        this.iva = Number((this.subTotal12 * environment.IVA / 100).toFixed(2));
        this.total = Number((this.iva + this.subTotal12 + this.subTotal0).toFixed(2));
    }

    private crearDetalle() {
        if (this.reservaFactura) {
            let detalleTemp: CotizacionDetalle[] = []
            this.reservaFactura.detalle.map(x => {
                let itemDetalle = x.cotizacionDetalle;
                itemDetalle.cantidad = x.cantidad;
                itemDetalle.subTotal = x.cotizacionDetalle.subTotal;
                itemDetalle.total = Number(( itemDetalle.subTotal * x.cantidad).toFixed(2));
                if (this.reservaFactura.bodegaPrincipal !== x.codigoBodega)
                    itemDetalle['transferencia'] = true;
                detalleTemp.push(itemDetalle);

                let detalleCompras = _.filter(this.documento.detalle, (d) => {
                    return d.generaCompra;
                });

                if(!_.isEmpty(detalleCompras)){
                    detalleTemp.push(...detalleCompras);
                    detalleTemp = _.uniqBy(detalleTemp, 'codigoArticulo');
                }
            })
            this.detalle = detalleTemp;

        } else {
            this.detalle = this.documento.detalle;
            this.iva = this.documento.totalIva;
            this.total = this.documento.total;
        }
        this.mostrarDiferencias();
        this.calculo();
    }

    consultarStock(value: CotizacionDetalle) {
        this.articuloService.obtenerStockArticuloPorItemnmbrYPuntoVentaNoVendedor(value.codigoArticulo, this.documento.puntoVenta.nombre).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.abrirStockDialogo(data);
        })
    }

    private abrirStockDialogo(data) {
        const dialogRefStock = this.dialogService.open({
            content: StockDialogoComponent,
            minWidth: 400,
            maxWidth: 500,
            title: `Stock: ${data.codigoArticulo}`,
            actions: [{ text: 'Aceptar', primary: true }],
        });

        const stockArticulos = dialogRefStock.content.instance;
        stockArticulos.stock = data;
        dialogRefStock.result.subscribe(r => {

            if (r['text'] == 'Aceptar') {
                dialogRefStock.close();
            }
        });
    }

    private mostrarDiferencias(){
        this.detalle.map(x =>{
            if(this.documento.controles && this.documento.controles.descripcionArticulo && (x.descripcionArticulo !== x.descripcionArticuloGP)){
                x['mostrarDescripcion']= true;
            }
            if(this.documento.controles && this.documento.controles.descuentoFijo && (x.descuentoFijo !== x.descuentoFijoGP)){
                x['mostrarDescuentoFijo']= true;
            }
            if(this.documento.controles && this.documento.controles.precioProducto && (x.precio !== x.precioGP)){
                x['mostrarPrecio']= true;
            }
        })
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

}
