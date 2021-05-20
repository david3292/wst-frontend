import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NotificarService } from '../../../../_servicio/notificar.service';
import { FacturaService } from '../../../../_servicio/ventas/factura.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
import { DocumentoFactura } from '../../../../_dominio/ventas/documentoFactura';
import { DocumentoNotaCredito } from '../../../../_dominio/ventas/documentoNotaCredito';
import { DocumentoDetalle } from '../../../../_dominio/ventas/documentoDetalle';
import { NotaCreditoService } from '../../../../_servicio/ventas/nota-credito.service';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { MotivoNotaCredito } from '../../../../_dominio/ventas/motivoNotaCredito';
import { MotivoNotaCreditoService } from '../../../../_servicio/ventas/motivo-nota-credito.service';
import { forkJoin, Observable } from 'rxjs';
import { ConfirmarDevolucionComponent } from '../confirmar-devolucion/confirmar-devolucion.component';
import { BuscarClienteDialogoComponent } from 'src/app/paginas/cliente/buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { Cliente } from 'src/app/_dominio/ventas/cliente';
import * as _ from "lodash";
import { FechaService } from 'src/app/_servicio/fecha-service';

@Component({
    selector: 'app-agregar-devolucion',
    templateUrl: './agregar-devolucion.component.html',
    styleUrls: ['./agregar-devolucion.component.scss']
})
export class AgregarDevolucionComponent implements OnInit {

    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("containerCliente", { read: ViewContainerRef })
    public containerClienteRef: ViewContainerRef;

    public factura: DocumentoFactura;
    public totalValorNC: number;
    public totalCantidadNC: number;
    public detalles: any[];
    public idFactura: number;
    public gridDetallesView: GridDataResult;
    public selectableSettings: SelectableSettings;
    public motivos: MotivoNotaCredito[];
    public motivosFiltrados: MotivoNotaCredito[];
    public tiposDevolucion = ['ARTICULO', 'REFACTURACION'];
    public motivoSeleccionado: MotivoNotaCredito;
    public tipoSeleccionado: string;
    public revisionTecnica: boolean;
    public requiereAprobacion: boolean;

    public deshabilitarCantidad: boolean = false;
    public deshabilitiarFinalizar: boolean = false;
    public mostrarDatosNuevos: boolean = false;
    public mensajeErrorRefactura: string;
    public mensajeErrorDatosNuevos: string;
    public nuevoClienteNombre: string;
    public nuevoClienteCodigo: string;
    public nuevoClienteCodigoDireccion: string;
    public nuevoClienteDescripcionDireccion: string;

    constructor(
        private currencyPipe: CurrencyPipe,
        private notificarService: NotificarService,
        private facturaService: FacturaService,
        private activateRoute: ActivatedRoute,
        private notaCreditoService: NotaCreditoService,
        private dialogService: DialogService,
        private router: Router,
        private motivoNotaCreditoService: MotivoNotaCreditoService,
        private _fechaService: FechaService) {
    }

    ngOnInit(): void {
        this.selectableSettings = {
            mode: 'single'
        };
        this.obtenerParametros();
        this.cargarFactura();
        this.motivosFiltrados = [];
    }

    public obtenerParametros() {
        this.activateRoute.params.subscribe(data => {
            this.idFactura = data['id'];
        });
    }

    public cargarFactura() {
        const facturaObs: Observable<DocumentoFactura> = this.facturaService.obtenerFacturaPorId(this.idFactura);
        const motivosObs: Observable<MotivoNotaCredito[]> = this.motivoNotaCreditoService.obtenerTodos();
        forkJoin([facturaObs, motivosObs]).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.factura = data[0];
            this.motivos = data[1];
            this.detalles = this.factura.detalle.map(det => {
                det['cantidadDevolver'] = 0;
                det['valorNC'] = 0;
                return det;
            });
            this.gridDetallesView = {
                data: this.detalles,
                total: this.detalles.length
            };
            this.totalValorNC = 0;
            this.totalCantidadNC = 0;
        });
    }

    public changeValueTipoDevolucion(tipoDevolucion: string) {
        this.motivosFiltrados = [];
        if (tipoDevolucion !== '') {
            switch (tipoDevolucion) {
                case 'REFACTURACION':
                    this.deshabilitarCantidad = true;
                    this.validarPuedeRefacturar();
                    break;
                default:
                    this.limpiar();
                    break;
            }
            this.motivoSeleccionado = undefined;
            this.motivosFiltrados = this.motivos.filter(m => m.tipoDevolucion === tipoDevolucion);
        }
    }

    public formatearValor(value: any) {
        return this.currencyPipe.transform(value, '$');
    }

    public actualizarCantidad(item: any) {
        if (item.cantidadDevolver > item.saldo) {
            this.notificarService.mostrarMensajeError('La cantidad a devolver no puede ser mayor al saldo.');
            item.cantidadDevolver = item.saldo;
            return false;
        }

        const valor = item.cantidadDevolver * item.cotizacionDetalle.subTotal;
        item.valorNC = valor;
        this.calcularTotalesNotaCredito();
    }

    public calcularTotalesNotaCredito() {
        let nuevoTotal = 0;
        let nuevaCantidad = 0;
        this.detalles.map(item => {
            if (item.cantidadDevolver !== 0) {
                nuevoTotal += item.cotizacionDetalle.subTotal;
            }
            nuevaCantidad += item.cantidadDevolver;
        });
        this.totalValorNC = nuevoTotal;
        this.totalCantidadNC = nuevaCantidad;
    }

    public limpiar() {
        this.totalCantidadNC = 0;
        this.totalValorNC = 0;
        this.motivosFiltrados = [];
        this.deshabilitiarFinalizar = false;
        this.mostrarDatosNuevos = false;
        this.mensajeErrorRefactura = undefined;
        this.deshabilitarCantidad = false;
        this.nuevoClienteCodigo = undefined;
        this.nuevoClienteNombre = undefined;
        this.nuevoClienteCodigoDireccion = undefined;
        this.nuevoClienteDescripcionDireccion = undefined;
        this.mensajeErrorDatosNuevos = undefined;
        this.detalles.forEach(item => {
            item.cantidadDevolver = 0;
            item.valorNC = 0;
        });
    }

    public mostrarConfirmacion() {
        let notaCredito: DocumentoNotaCredito;
        notaCredito = new DocumentoNotaCredito();
        notaCredito.documentoFacturaId = this.factura.id;
        notaCredito.bodegaPrincipal = this.factura.bodegaPrincipal;
        notaCredito.total = this.totalValorNC;
        notaCredito.motivoNotaCredito = this.motivoSeleccionado;
        notaCredito.referencia = this.factura.numero;
        notaCredito.nombreCliente = this.nuevoClienteNombre;
        notaCredito.codigoCliente = this.nuevoClienteCodigo;
        notaCredito.codigoDireccion = this.nuevoClienteCodigoDireccion;
        notaCredito.descripcionDireccion = this.nuevoClienteDescripcionDireccion;

        // notaCredito.revisionTecnica = this.revisionTecnica ? true : false;
        notaCredito.detalle = this.generarDetales();

        let mensaje: string = this.crearMensaje(notaCredito.motivoNotaCredito.tipoDevolucion);
        this.notaCreditoService.requiereAprobacion(notaCredito.detalle, this.factura.id, notaCredito.motivoNotaCredito.tipoDevolucion).subscribe(data => {
            this.notificarService.desactivarLoading();
            if (data) {
                mensaje += ' Su devolución pasará a revisión del aprobador comercial.';
            }
            const dialog: DialogRef = this.dialogService.open({
                appendTo: this.containerConfirmacionRef,
                title: 'Confirmación',
                content: ConfirmarDevolucionComponent,
                actions: [
                    { text: 'No' },
                    { text: 'Sí', primary: true }
                ],
                width: 450,
                maxHeight: 250,
                minHeight: 200
            });

            const confirmacion = dialog.content.instance;
            confirmacion.mensaje = mensaje;
            confirmacion.revisionTecnica = data;
            confirmacion.tipoDevolucion = notaCredito.motivoNotaCredito.tipoDevolucion;

            dialog.result.subscribe((result) => {
                if (result instanceof DialogCloseResult) {

                } else {
                    debugger;
                    if (result['text'] === 'Sí') {
                        notaCredito.revisionTecnica = confirmacion.respuesta ? true : false;
                        this.finalizarRegistro(notaCredito);
                    }
                }
            });
        });
    }

    public validarDatos() {
        if (!this.tipoSeleccionado) {
            this.notificarService.mostrarMensajeError('Seleccione el tipo de devolución.');
            return false;
        }

        if (!this.motivoSeleccionado) {
            this.notificarService.mostrarMensajeError('Seleccione el motivo de la devolución.');
            return false;
        }

        if (this.totalCantidadNC === 0) {
            this.notificarService.mostrarMensajeError('Seleccione al menos un artículo para devolver.');
            return false;
        }

        if (this.tipoSeleccionado === 'REFACTURACION' && this.motivoSeleccionado.cambioRazonSocial) {
            if (!this.nuevoClienteCodigo) {
                this.mensajeErrorDatosNuevos = '*Seleccione un cliente para la nueva factura.'
                this.notificarService.mostrarMensajeError('Ingrese los datos obigatorios para refacturar.');
                return false;
            }
        }

        this.mostrarConfirmacion();
    }

    public finalizarRegistro(notaCredito: DocumentoNotaCredito) {
        this.notaCreditoService.registrar(notaCredito).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.notificarService.mostrarMensajeExito('Devolución registrada correctamente.');
            const url = '/ventas/devolucion';
            this.router.navigate([url]);
        });
    }

    public generarDetales() {
        const detallesNC: DocumentoDetalle[] = [];

        const listaAux = this.detalles.filter(detalle => detalle.cantidadDevolver !== 0);
        listaAux.forEach(detalle => {
            const aux: DocumentoDetalle = new DocumentoDetalle();
            aux.cotizacionDetalle = detalle.cotizacionDetalle;
            aux.codigoBodega = detalle.codigoBodega;
            aux.cantidad = detalle.cantidadDevolver;
            aux.saldo = detalle.cantidadDevolver;
            detallesNC.push(aux);
        });

        return detallesNC;
    }

    public abrirBuscarClienteDialogo() {
        const dialogRef = this.dialogService.open({
            appendTo: this.containerClienteRef,
            content: BuscarClienteDialogoComponent,
            minWidth: 300,
            maxWidth: 600,
            title: 'Buscar Cliente',
            actions: [{ text: 'Cancelar' }, { text: 'Seleccionar', primary: true }],
            preventAction: (ev, dialog) => {
                if (ev['text'] === 'Seleccionar')
                    return dialog.content.instance.clienteSeleccionado.length > 0 ? false : true;
                else
                    return false;
            }
        });

        const cliente = dialogRef.content.instance;

        dialogRef.result.subscribe(r => {
            if (r['text'] == 'Seleccionar') {
                this.cargarClienteSeleccionado(cliente.clienteSeleccionado[0]);
            }
            if (r['text'] == 'Cancelar') {
                dialogRef.close();
                dialogRef.dialog = null;
            }
        });
    }

    private cargarClienteSeleccionado(cliente: Cliente) {
        this.nuevoClienteCodigo = cliente.CUSTNMBR;
        this.nuevoClienteNombre = cliente.CUSTNAME;
        this.nuevoClienteCodigoDireccion = cliente.ADRSCODE;
        this.nuevoClienteDescripcionDireccion = cliente.ADDRESS1;
        this.mensajeErrorDatosNuevos = undefined;
    }

    public changeValueMotivo(valor: MotivoNotaCredito) {
        if (valor.tipoDevolucion === 'REFACTURACION'){
            if (valor.cambioRazonSocial) {
                this.mostrarDatosNuevos = true;
            } else {
                this.mostrarDatosNuevos = false;
                this.validarPuedeRefacturarPorFechaFactura();
            }
        }
    }


    private validarPuedeRefacturar() {
        const detalleIncompleto = _.some(this.factura.detalle, (o) => o.cantidad !== o.saldo);
        if (detalleIncompleto) {
            this.deshabilitiarFinalizar = true;
            this.mensajeErrorRefactura = 'Ya se devolvieron anteriormente ciertas cantidades del detalle de la factura. No es posible realizar la refacturación.';
        } else {
            this.seleccionarTodoDetalle();
        }
    }

    private seleccionarTodoDetalle() {
        _.forEach(this.detalles, (o) => {
            o.cantidadDevolver = o.cantidad;
        });
        this.calcularTotalesNotaCredito()
    }

    private validarPuedeRefacturarPorFechaFactura() {
        if (this._fechaService.esFechaActual(this.factura.fechaEmision)) {
            this.deshabilitiarFinalizar = true;
            this.mensajeErrorRefactura = `Fecha de Emisión (${this.factura.fechaEmision}) es actual, no es posible realizar REFACTURACIÓN.`;
        }
    }

    private crearMensaje(tipoDevolucion: string) {
        switch (tipoDevolucion) {
            case 'ARTICULO':
                return '¿Está seguro que desea devolver los artículos ingresados?';
            case 'REFACTURACION':
                return '¿Está seguro que desea realizar la refacturación de la factura seleccionada?';
            default:
                return '';
        }
    }

}
