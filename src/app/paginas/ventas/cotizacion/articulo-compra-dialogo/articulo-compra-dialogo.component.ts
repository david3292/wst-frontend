import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { forkJoin, Observable } from 'rxjs';
import { BusquedaProveedorComponent } from 'src/app/paginas/proveedor/busqueda-proveedor/busqueda-proveedor.component';
import { Proveedor } from 'src/app/_dominio/compras/proveedor';
import { Bodega } from 'src/app/_dominio/sistema/bodega';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { ArticuloCompraDTO } from 'src/app/_dto/compras/articuloCompraDTO';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaBodegaService } from 'src/app/_servicio/sistema/punto-venta-bodega.service';
import { PuntoVentaService } from 'src/app/_servicio/sistema/punto-venta.service';
import * as _ from 'lodash';
import { ProveedorService } from 'src/app/_servicio/proveedor/proveedor.service';

const createArticuloCompraFormulario = dataItem => new FormGroup({
    'proveedor': new FormControl(dataItem.proveedor, Validators.required),
    'condicionPago': new FormControl(dataItem.condicionPago, Validators.required),
    'bodegaEntrega': new FormControl(dataItem.bodegaEntrega, Validators.required),
    'cantidad': new FormControl(dataItem.cantidad, [Validators.required, Validators.min(0.01), Validators.max(dataItem.cantidadMaxima)]),
    'margenUtilidad': new FormControl(dataItem.margenUtilidad, [Validators.required, Validators.min(0), Validators.max(100)]),
    'costoCompra': new FormControl(dataItem.costoCompra, [Validators.required, Validators.min(0.01)]),
    'precioVentaSinIva': new FormControl(dataItem.precioVentaSinIva, [Validators.required, Validators.min(0.01)])
});

@Component({
    selector: 'app-articulo-compra-dialogo',
    templateUrl: './articulo-compra-dialogo.component.html',
    styleUrls: ['./articulo-compra-dialogo.component.scss']
})
export class ArticuloCompraDialogoComponent implements OnInit {

    public listaProveedores: Proveedor[];
    public listaCondicionesPago: string[] = [];
    public formularioArticuloCompra: FormGroup;
    public cotizacionId: number;
    public cotizacionDetalle: CotizacionDetalle;
    public bodegaEntrega: string;
    public precioVentaSinIva: number = 0;
    public articuloCompra: ArticuloCompraDTO;

    @ViewChild('conatinerProveedoresRef', { read: ViewContainerRef })
    public conatinerProveedoresRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _puntoVentaBodegaService: PuntoVentaBodegaService,
        private _comprasService: ComprasService,
        private _dialogService: DialogService,
        private _proveedorService: ProveedorService
    ) { }

    ngOnInit(): void {
        this.crearFormularioEnBlanco();
        this.cargarDatos();
    }

    private cargarDatos() {
        let bodegaObs: Observable<Bodega> = this._puntoVentaBodegaService.buscarBodegaPrincipal();
        let articuloCompra: ArticuloCompraDTO = new ArticuloCompraDTO();
        articuloCompra.cotizacionDetalle = this.cotizacionDetalle;
        articuloCompra.cotizacionId = this.cotizacionId;
        let comprasObs = this._comprasService.validarCompra(articuloCompra);
        let condicionesPagoObs = this._proveedorService.obtenerCondicionesPago();
        forkJoin([bodegaObs, comprasObs, condicionesPagoObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.listaCondicionesPago = data[2];
            this.articuloCompra = data[1];
            debugger;
            this.cargarProveedorSeleccionado(data[1].proveedor);
            this.formularioArticuloCompra = createArticuloCompraFormulario({
                'proveedor': data[1].proveedor,
                'condicionPago': data[1].condicionPago,
                'bodegaEntrega': data[0].codigo,
                'cantidad': data[1].cantidad,
                'margenUtilidad': data[1].margenUtilidad * 100,
                'costoCompra': data[1].costoUnitarioCompra,
                'precioVentaSinIva': data[1].precioVenta,
                'cantidadMaxima': this.cotizacionDetalle.cantidad
            });
        });
    }

    private crearFormularioEnBlanco() {
        this.formularioArticuloCompra = createArticuloCompraFormulario({
            'proveedor': null,
            'condicionPago': null,
            'bodegaEntrega': '',
            'cantidad': 0,
            'margenUtilidad': 0,
            'costoCompra': 0,
            'precioVentaSinIva': 0
        });
    }

    abrirDialogoBusquedaProveedor() {
        const dialogProveedoresRef = this._dialogService.open({
            appendTo: this.conatinerProveedoresRef,
            content: BusquedaProveedorComponent,
            minWidth: 300,
            maxWidth: 600,
            title: 'Buscar Proveedor',
            actions: [{ text: 'Cancelar' }, { text: 'Seleccionar', primary: true }],
            preventAction: (ev, dialog) => {
                if (ev['text'] === 'Seleccionar')
                    return dialog.content.instance.proveedorSeleccionado.length > 0 ? false : true;
                else
                    return false;
            }
        });

        const proveedor = dialogProveedoresRef.content.instance;

        dialogProveedoresRef.result.subscribe(r => {
            if (r['text'] == 'Seleccionar') {
                this.cargarProveedorSeleccionado(proveedor.proveedorSeleccionado[0]);
            }
            if (r['text'] == 'Cancelar') {
                dialogProveedoresRef.close();
                dialogProveedoresRef.dialog = null;
            }
        });
    }

    cargarProveedorSeleccionado(proveedor: Proveedor) {
        if (proveedor != null) {
            let coincidencias = _.filter(this.listaProveedores, p => p.VENDORID === proveedor.VENDORID).length;
            if (!(coincidencias > 0)) {
                this.listaProveedores.push(proveedor);
            }

            let condicionPago = _.first(this.listaCondicionesPago);
            if(!_.isEmpty(proveedor.PYMTRMID))
                condicionPago = proveedor.PYMTRMID;

            this.articuloCompra.condicionPagoGp = condicionPago;
            this.formularioArticuloCompra.get('condicionPago').setValue(condicionPago);
        }

        this.formularioArticuloCompra.get('proveedor').setValue(proveedor);
        console.log(this.formularioArticuloCompra);
    }

    validarFormulario(): boolean {
        if (this.formularioArticuloCompra.invalid) {
            this.formularioArticuloCompra.markAllAsTouched();
            return true;
        } else {
            return false;
        }
    }

    public onChange(value: any): void {
        this.precioVentaSinIva = this.calcularPrecioVentaSinIva();
        this.formularioArticuloCompra.get('precioVentaSinIva').setValue(this.precioVentaSinIva);
    }

    public crearArticuloCompraDTO(): ArticuloCompraDTO {
        debugger;
        let proveedorCambio = this.formularioArticuloCompra.get('proveedor').value;

        if (this.articuloCompra.proveedor != null) {
            if (this.articuloCompra.proveedor.VENDORID !== proveedorCambio.VENDORID)
                this.articuloCompra.proveedorCambio = proveedorCambio;
        } else {
            this.articuloCompra.proveedor = proveedorCambio;
        }

        this.articuloCompra.condicionPago = this.formularioArticuloCompra.get('condicionPago').value;
        this.articuloCompra.cantidad = this.formularioArticuloCompra.get('cantidad').value;
        this.articuloCompra.margenUtilidad = this.formularioArticuloCompra.get('margenUtilidad').value / 100;
        this.articuloCompra.costoUnitarioCompra = this.formularioArticuloCompra.get('costoCompra').value;
        this.articuloCompra.precioVenta = this.formularioArticuloCompra.get('precioVentaSinIva').value;
        this.articuloCompra.bodegaEntrega = this.formularioArticuloCompra.get('bodegaEntrega').value;
        this.articuloCompra.cotizacionId = this.cotizacionId;
        return this.articuloCompra;
        // this._comprasService.crearActualizarArticuloCompra(this.articuloCompra).subscribe(data => {
        //     this._notificarService.desactivarLoading();
        //     if(data.mensajeCodigo === 'OK')
        //         this._notificarService.mostrarMensajeExito(data.mensaje);
        //     else
        //         this._notificarService.mostrarMensajeError(data.mensaje);
        // });

    }

    private calcularPrecioVentaSinIva(): number{
        let costoUnitario = Number(this.formularioArticuloCompra.get('costoCompra').value);
        let margen = Number(this.formularioArticuloCompra.get('margenUtilidad').value) / 100;
        let precioVenta: number = 0;
        let divisor1 = 1 - margen;
        let divisor2 = 1 - (this.articuloCompra.cotizacionDetalle.descuentoFijo / 100);
        precioVenta = costoUnitario / divisor1 / divisor2;
        return precioVenta;
    }

    selectionProveedorChange(value: any){
        console.log(value);
        this.formularioArticuloCompra.get('condicionPago').setValue(value.PYMTRMID);
    }
}
