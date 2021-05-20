import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { switchMap } from 'rxjs/operators';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { Direccion } from 'src/app/_dominio/ventas/direccion';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { ReservaDetalleDTO } from 'src/app/_dto/ventas/reservaDetalleDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { CotizacionService } from 'src/app/_servicio/ventas/cotizacion.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { FacturaResumenDialogoComponent } from './factura-resumen-dialogo/factura-resumen-dialogo.component';
import { PickingFacturaDialogoComponent } from './picking-factura-dialogo/picking-factura-dialogo.component';
import { PickingFacturaServicioDialogoComponent } from './picking-factura-servicio-dialogo/picking-factura-servicio-dialogo.component';
import * as _ from "lodash";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReservaFacturaDisponibleDTO } from 'src/app/_dto/ventas/reservas/reservaFacturaDisponibleDTO';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
    selector: 'app-facturacion',
    templateUrl: './facturacion.component.html',
    styleUrls: ['./facturacion.component.scss']
})
export class FacturacionComponent implements OnInit {
    //Totales
    public subTotal0: number = 0;
    public subTotal12: number = 0;
    public iva12: number = 0;
    public total: number = 0;
    private idCotizacion: number;
    public puntoVenta: String;
    public cotizacion: Cotizacion;
    public detalle: ReservaDetalleDTO[] = [];
    public catalogoEntregas: any[];
    public catalogoDireccionCliente: Direccion[] = [];

    public editForm: FormGroup = new FormGroup({
        entregaSeleccionado: new FormControl('', Validators.required),
        direccionSeleccionadaDespacho: new FormControl(),
        clienteRetira: new FormControl(''),
    });

    private periodoGraciaSeleccionado: number = 0;
    public direccionClienteVisible: boolean = false;

    public reservaRecuperada: DocumentoReserva;
    public mensajeAdvertencia: string;
    public reservasEmitidasNumeros: string;
    public mensajeError: string;

    public detalleCotizacionError: number[] = [];

    @ViewChild("containerPickingFactura", { read: ViewContainerRef })
    public containerPickingFacturaRef: ViewContainerRef;
    @ViewChild("containerFacturaResumen", { read: ViewContainerRef })
    public containerFacturaResumenRef: ViewContainerRef;
    @ViewChild("containerConfirmacionCerrar", { read: ViewContainerRef })
    public containerConfirmacionCerrarRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cotizacionService: CotizacionService,
        private reservaFacturaService: ReservaService,
        private clienteService: ClienteService,
        private notificarService: NotificarService,
        private fechaService: FechaService,
        private dialogService: DialogService,
        private _sanitizer: DomSanitizer,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.idCotizacion = params['id'];
            this.recuperarCotizacion(params['id']);
            this.listarEntregas();

        });
        this.reservaFacturaService.reservaCambio.subscribe(data => {
            this.cotizacion = data.cotizacion;
            this.reservaRecuperada = data;
            this.matchReservaCotizacionDetalle(data);
        });
    }

    private recuperarCotizacion(id: number) {
        this.cotizacionService.listarPorId(id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.cotizacion = data;
            this.puntoVenta = data.puntoVenta.nombre;
            this.listarDireccionesCliente();
            this.recuperarReservasEminitdasNumero();
            this.convertirDetalle(this.cotizacion.detalle);
            this.calcularTotales();
            this.recuperarFactura();
        })
    }

    private recuperarFactura() {
        this.reservaFacturaService.listarPorCotizacionID(this.idCotizacion).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.reservaRecuperada = data;
            if (data !== null) {
                this.editForm.controls['entregaSeleccionado'].setValue(data.entrega);
                if (this.editForm.controls['entregaSeleccionado'].value !== null) {
                    if (this.editForm.controls['entregaSeleccionado'].value == 'DESPACHO') {
                        const direccionDespacho = this.catalogoDireccionCliente.find(x => x.ADRSCODE === data.direccionEntrega);
                        this.editForm.controls['direccionSeleccionadaDespacho'].setValue(direccionDespacho);
                        this.direccionClienteVisible = true;
                    }
                }
                this.editForm.controls['entregaSeleccionado'].setValue(data.direccionEntrega);
                this.editForm.controls['clienteRetira'].setValue(data.retirarCliente);
                this.reservaFacturaService.reservaCambio.next(data);
            }
        });
    }

    private convertirDetalle(data: CotizacionDetalle[]) {
        this.detalle = [];
        data.map(x => {
            let item = new ReservaDetalleDTO();
            item.cotizacionDetalle = x;
            this.detalle.push(item);
        });
    }

    public abrirPickingDialogo(value: ReservaDetalleDTO) {
        const dialogRefArticulo = this.dialogService.open({
            appendTo: this.containerPickingFacturaRef,
            content: value.cotizacionDetalle.servicio ? PickingFacturaServicioDialogoComponent : PickingFacturaDialogoComponent,
            minWidth: 700,
            maxWidth: '98%',
        });
        const picking = dialogRefArticulo.content.instance;
        picking.cotizacion = this.cotizacion;
        picking.item = value.cotizacionDetalle;
        picking.cantidadSeleccionadaCompraL = value.cantidadReservada;
    }

    public abrirFacturaResumengDialogo(reservaFactura: DocumentoReserva) {
        const dialogRefResumen = this.dialogService.open({
            appendTo: this.containerFacturaResumenRef,
            title: 'Resumen',
            content: FacturaResumenDialogoComponent,
            minWidth: 500,
            maxWidth: '70%',
            minHeight: 450,
            maxHeight: '68%'
        });
        const resumenFactura = dialogRefResumen.content.instance;
        resumenFactura.reserva = reservaFactura;

        dialogRefResumen.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.mostrarResultadoValidacionReserva(resumenFactura.respuestaValidacion);
            }
        });

    }

    private mostrarResultadoValidacionReserva(data: ReservaFacturaDisponibleDTO) {
        if (!data.existeDisponible) {
            this.detalleCotizacionError = data.cotizacionDetalleIds;
            this.mensajeError = 'Stock no disponible para uno o más artículos, revise el detalle.';
        } else {
            this.detalleCotizacionError = [];
            this.mensajeError = null;
        }
    }

    private matchReservaCotizacionDetalle(data: DocumentoReserva) {
        if (data !== null) {
            this.detalle.map(x => {
                let totalCantidad: number = 0;
                data.detalle.map(y => {
                    if (x.cotizacionDetalle.id == y.cotizacionDetalle.id) {
                        totalCantidad = totalCantidad + y.cantidad;
                        x.cotizacionDetalle.saldo = y.cotizacionDetalle.saldo;
                    }
                    x.cantidadReservada = totalCantidad;
                });
            });
        }
    }

    private listarEntregas() {
        this.reservaFacturaService.listarEntregas().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.catalogoEntregas = data;
        })
    }

    private listarDireccionesCliente() {
        this.clienteService.listarPorCustomerNumber(this.cotizacion.codigoCliente).subscribe(data => {
            this.notificarService.desactivarLoading();
            switch (this.cotizacion.formaPago) {
                case 'CONTADO':
                    this.periodoGraciaSeleccionado = 0;
                    break;
                case 'CREDITO':
                    const periodo1 = data["COMMENT2"] !== '' ? parseInt(data["COMMENT2"]) : 0;
                    this.periodoGraciaSeleccionado = periodo1;
                    break;
                case 'CREDITO_SOPORTE':
                    const periodo = data["COMMENT1"] !== '' ? parseInt(data["COMMENT1"]) : 0;
                    this.periodoGraciaSeleccionado = periodo;
                    break;
            }
            this.catalogoDireccionCliente = data.Address;
            if (this.reservaRecuperada !== undefined && this.reservaRecuperada !== null) {
                const direccionDespacho = this.catalogoDireccionCliente.find(x => x.ADRSCODE === this.reservaRecuperada.direccionEntrega);
                this.editForm.controls['direccionSeleccionadaDespacho'].setValue(direccionDespacho);
            }
        })
    }

    public entregaChange(valor: string) {
        this.editForm.get('direccionSeleccionadaDespacho').clearValidators();
        this.editForm.get('direccionSeleccionadaDespacho').updateValueAndValidity();
        this.editForm.get('clienteRetira').clearValidators();
        switch (valor) {
            case 'CLIENTE':
                this.direccionClienteVisible = false;
                this.editForm.controls["clienteRetira"].setValidators([Validators.required]);
                break;
            case 'DESPACHO':
                this.editForm.controls['direccionSeleccionadaDespacho'].setValue(null);
                this.direccionClienteVisible = true;
                this.editForm.controls["direccionSeleccionadaDespacho"].setValidators([Validators.required]);
                this.editForm.get('direccionSeleccionadaDespacho').updateValueAndValidity();
                break;
            default: break;
        }
        this.editForm.get('clienteRetira').updateValueAndValidity();
    }

    public facturar() {
        if (!this.editForm.invalid) {
            debugger
            let reserva = new DocumentoReserva();
            reserva.cotizacion = this.cotizacion;
            delete reserva.cotizacion['formaPagoCadena'];
            reserva.entrega = this.editForm.controls['entregaSeleccionado'].value;
            reserva.retirarCliente = this.editForm.controls['clienteRetira'].value;
            if (this.editForm.controls['entregaSeleccionado'].value === 'CLIENTE') {

            } else {
                const direccion = this.editForm.controls['direccionSeleccionadaDespacho'].value;
                reserva.direccionEntrega = direccion['ADRSCODE'];
                reserva.direccionEntregaDescripcion = direccion['ADDRESS1'];
            }

            reserva.periodoGracia = this.periodoGraciaSeleccionado;
            this.reservaFacturaService.registrarCabecera(reserva).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.abrirFacturaResumengDialogo(data);
            });
        } else {
            this.editForm.markAllAsTouched();
            this.notificarService.mostrarMensajeAdvertencia("Favor ingrese todos los campos solicitados (Entega, Dirección y Cliente retira).");
        }

    }

    public puedeFacturarOAnular() {
        if (this.existeAlgunaRestricion()) {
            return false;
        } else {
            if (this.existeSaldosPendientes())
                return true;
            else
                return false;
        }
    }

    public cerrar() {
        this.reservaFacturaService.cerrar(this.cotizacion.id).pipe(switchMap(() => {
            return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
        })).subscribe(data => {
            this.notificarMensaje(`Cotización ${this.cotizacion.numero} cerrada.`);
            this.cotizacionService.cotizacionCambio.next(data);
            this.router.navigate(['ventas/overview']);
        })
    }

    public mostrarConfirmacionCerrar() {
        let mensaje: string = "¿ Está seguro que desea cerrar el documento y finalizar con el proceso de la cotización ?";
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionCerrarRef,
            title: 'Confirmación',
            content: mensaje,
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
                    this.cerrar();
                }
            }
        });
    }

    public mostrarMensaje() {
        return this.mensajeAdvertencia !== undefined
    }

    private calcularTotales() {
        this.total = this.cotizacion.total;
        this.subTotal0 = this.cotizacion.subtotaNoIVA;
        this.subTotal12 = this.cotizacion.subtotalIVA;
        this.iva12 = this.cotizacion.totalIva;
    }

    public restablecerValores(value: ReservaDetalleDTO) {
        this.reservaFacturaService.eliminarReservaDetalle(this.reservaRecuperada.id, value.cotizacionDetalle.id).pipe(switchMap(() => {
            return this.reservaFacturaService.listarPorCotizacionID(this.idCotizacion);
        })).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.reservaRecuperada = data;
            this.convertirDetalle(data.cotizacion.detalle);
            this.reservaFacturaService.reservaCambio.next(data);
            this.mensajeError = null;
            this.detalleCotizacionError = [];
        })
    }

    notificarMensaje(mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    private recuperarReservasEminitdasNumero() {
        this.reservaFacturaService.listarNumeroReservasEmitidasPorCotizacionID(this.idCotizacion).subscribe(data => {
            this.notificarService.desactivarLoading();
            if (data.length > 0) {
                this.reservasEmitidasNumeros = data.join(', ');
            }
        })
    }

    public puedeHacerDeshacerPicking(dataItem: ReservaDetalleDTO) {
        if (this.existeAlgunaRestricion()) {
            return false
        } else {
            if (dataItem.cotizacionDetalle.saldo > 0) {
                return true;
            } else {
                if (!_.isEmpty(this.reservaRecuperada)) {
                    const itemEncontrado = _.find(this.reservaRecuperada.detalle, (o) => {
                        if (o.cotizacionDetalle.id == dataItem.cotizacionDetalle.id)
                            return o;
                    })
                    if (itemEncontrado) {
                        return true;
                    }
                    return false;
                }
                return false;
            }
        }
    }

    private existeAlgunaRestricion(): boolean {
        if (_.isEmpty(this.reservaRecuperada)) {
            return false;
        } else {
            this.mensajeAdvertencia = undefined;
            switch (this.reservaRecuperada.estado) {
                case 'REVISION':
                    this.mensajeAdvertencia = "El Documento está en estado de Revisión, no podrá realizar ningún proceso hasta su aprobación."
                    return true;
                case 'ERROR':
                    this.mensajeAdvertencia = `Existe una Factura ${this.reservaRecuperada.numero} con estado ${this.reservaRecuperada.estado}, no podrá realizar ningún proceso hasta su corrección.`;
                    return true;
                case 'NUEVO':
                    return false;
                default: return false;
            }
        }
    }

    public existeSaldosPendientes() {
        if (this.reservaRecuperada && this.reservaRecuperada.estado === 'NUEVO')
            return true;
        const respuesta = _.find(this.detalle, (o) => {
            let resp: boolean = false;
            if (o.cotizacionDetalle.saldo > 0) {
                resp = true;
            }
            return resp;
        })
        return respuesta;
    }

    public redireccionarVentas() {
        this.router.navigate(['ventas/overview'])
    }

    public puedeCerrar() {
        if (this.existeAlgunaRestricion())
            return false;
        if (this.reservasEmitidasNumeros)
            return false;
        else return true;
    }

    public colorCode(cotizacionDetalleId: number): SafeStyle {
        let result = '';
        const error = _.includes(this.detalleCotizacionError, cotizacionDetalleId);
        if (error)
            result = '#f8d7da';
        return this._sanitizer.bypassSecurityTrustStyle(result);
    }
}
