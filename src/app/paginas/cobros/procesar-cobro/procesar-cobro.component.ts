import { FechaService } from './../../../_servicio/fecha-service';
import { Observable } from 'rxjs';
import { Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CobroDocumentoDTO } from 'src/app/_dominio/cobros/cobroDocumentoDTO';
import { CobroDocumentoValorDTO } from 'src/app/_dominio/cobros/cobroDocumentoValorDTO';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { EditarCobroService } from './editarCobro.service'
import { map, switchMap } from 'rxjs/operators';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { RegistroComponent } from './registro/registro.component';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';
import { CondicionCobroFactura } from 'src/app/_dominio/cobros/condicionCobroFactura';
import { CuotaDTO } from 'src/app/_dominio/cobros/cuotaDTO';
import { CobroResultadoDialogoComponent } from '../../../components/commons/cobro-resultado-dialogo/cobro-resultado-dialogo.component';
import { BuscarClienteDialogoComponent } from '../../cliente/buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { SessionService } from 'src/app/_servicio/session.service';
import { CobroCalculadoraComponent } from '../cobro-calculadora/cobro-calculadora.component';
import * as _ from "lodash";

@Component({
    selector: 'app-procesar-cobro',
    templateUrl: './procesar-cobro.component.html',
    styleUrls: ['./procesar-cobro.component.scss']
})
export class ProcesarCobroComponent implements OnInit {

    public cobro: Cobro;
    private cantidadRecibida: number = 0;
    /* Formas Pago*/
    public editDataItem: CobroFormaPago;
    public isNew: boolean;
    public formasPago: CobroFormaPago[] = [];
    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0,
    };

    public codigoCliente: string;
    public nombreCliente: string;
    public deudaTotal: number = 0;
    public deudaTotalGeneral: number = 0;
    public totalAPagar: number = 0;
    public documentosCatalogo: CobroDocumentoValorDTO[] = [];
    public documentoSeleccionado: CobroDocumentoValorDTO;
    public realizandoPago: boolean = false;
    public desactivarSeleccionDocumento: boolean = false;
    public detalleCobro: CobroDocumentoDTO;

    @ViewChild("containerRegistro", { read: ViewContainerRef })
    public containerRegsitroRef: ViewContainerRef;
    @ViewChild("cobroResultado", { read: ViewContainerRef })
    public cobroResultadoRef: ViewContainerRef;
    @ViewChild("containerBuscarCliente", { read: ViewContainerRef })
    public containerBuscarClienteRef: ViewContainerRef;
    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("containerCalculadora", { read: ViewContainerRef })
    public containerCalculadoraRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _cobroService: CobroService,
        public editarCobroService: EditarCobroService,
        private dialogService: DialogService,
        private _fechaService: FechaService,
        private _sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.view = this.editarCobroService.pipe(map(data => process(data, this.gridState)));
        this.editarCobroService.next([]);
        this.editarCobroService.read();
    }

    public buscarCliente() {
        if (this.codigoCliente !== undefined) {
            this.abrirBuscarClienteDialogo();
        }
    }

    public buscarCobros() {
        if (this.codigoCliente !== undefined) {
            this._cobroService.listarCobrosPorCodigoCliente(this.codigoCliente).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.documentosCatalogo = data;
                if (data.length <= 0) {
                    this._notificarService.mostrarMensajeInformacion("No existen cobros pendientes")
                } else {
                    this.deudaTotalGeneral = 0;
                    data.map(x => { this.deudaTotalGeneral = this.deudaTotalGeneral + x.valor });
                }
            })
        }
    }

    public seleccionarDocumentoAPagar() {
        if (this.documentoSeleccionado !== undefined) {
            this._cobroService.obtenerDetalleCobroPorFacturaId(this.documentoSeleccionado.idDocumento).subscribe(data => {
                this._notificarService.desactivarLoading();
                //this.deudaTotal = this.documentoSeleccionado.valor;
                this.totalAPagar = 0;
                this.realizandoPago = true;
                this.desactivarSeleccionDocumento = true;
                this.detalleCobro = data;
                /*  if (this.cobro === undefined || this.cobro === null)
                     this.recuperarCobroPagoDocumento() */
                this.calcularValoraPagar();
                this.calcularDeudaTotal();
                this.sincronizarValoresAbonados();
            })
        }
    }

    private recuperarCobroPagoDocumento() {
        this._cobroService.buscarPorCodigoClienteYEstadoNuevo(this.codigoCliente).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data !== null) {
                this.cobro = data;
                this.formasPago = data.cobroFormaPagos;
                this.editarCobroService.next(this.formasPago);
                this.calcularValoraPagar();
                this.realizandoPago = true;
            }
        })
    }

    public addHandler() {
        this.editDataItem = new CobroFormaPago();
        this.abrirDialogoRegistrar();
        this.isNew = true;
    }

    public removeHandler({ sender, dataItem }) {
        //this.editService.remove(dataItem);
        this._cobroService.eliminarCobroFormaPago(dataItem.id, this.cobro.id).pipe(switchMap(() => {
            return this._cobroService.buscarPorCodigoClienteYEstadoNuevo(this.codigoCliente);
        })).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.cobro = data;
            if (data !== null) {
                this.formasPago = data.cobroFormaPagos;
                this.editarCobroService.next(this.formasPago);
            } else {
                this.formasPago = [];
                this.editarCobroService.next(this.formasPago);
            }
            this.calcularValoraPagar();

        })
        sender.cancelCell();
    }

    public cancelHandler() {
        this.editDataItem = undefined;
    }

    public saveHandler(cobroFormaPago: CobroFormaPago) {
        debugger
        let cobroGuardar = this.crearCobro();
        cobroFormaPago.numeroFactura = this.documentoSeleccionado.numeroDocumento;
        cobroFormaPago.estado = 'NUEVO';
        if (cobroFormaPago.formaPago === 'CHEQUE_A_FECHA')
            cobroFormaPago.fechaEfectivizacion = this._fechaService.formatearFechaYHora(cobroFormaPago.fechaEfectivizacion);
        else
            cobroFormaPago.fechaEfectivizacion = null;
        if (cobroFormaPago.formaPago === 'NOTA_CREDITO' || cobroFormaPago.formaPago === 'ANTICIPO')
            cobroFormaPago.numeroDocumento = cobroFormaPago.numeroDocumento['DOCNUMBR'];

        cobroGuardar.cobroFormaPagos = [cobroFormaPago];
        this._cobroService.registrar(cobroGuardar).subscribe(data => {
            this.notificarMensaje('Forma de pago registrada');
            this.cobro = data;
            this.formasPago = data.cobroFormaPagos;
            this.editarCobroService.next(this.formasPago);
            this.editDataItem = undefined;
            this.calcularValoraPagar();
            this.validarTotalAPagar();
        })
    }

    private calcularValoraPagar() {
        this.totalAPagar = 0;
        this.formasPago.map(x => {
            if (this.documentoSeleccionado && this.documentoSeleccionado.numeroDocumento === x.numeroFactura)
                this.totalAPagar = this.totalAPagar + x.valor;
        })
    }

    public eventCheck(value, itemCuota) {
        if (this.detalleCobro) {
            this.detalleCobro.cuotas.map(x => {
                if (x.idCondicionCobroFactura === itemCuota['idCondicionCobroFactura']) {
                    x.seleccionado = value.checked;
                    if (!value.checked) {
                        this.deseleccionarItem(itemCuota);
                    }
                }
            })
            this.calcularDeudaTotal();
        }
    }

    private calcularDeudaTotal() {
        this.deudaTotal = 0;
        if (this.detalleCobro) {
            this.detalleCobro.cuotas.map(x => {
                if (x.seleccionado)
                    this.deudaTotal = this.deudaTotal + x.valor
            })
        }
    }

    private deseleccionarItem(itemCuota: CuotaDTO) {
        let index = this.obtenerIndiceCuota(itemCuota);
        if (index > 0) {
            for (let i = index; i < this.detalleCobro.cuotas.length; i++) {
                this.detalleCobro.cuotas[i].seleccionado = false;
            }
        }

    }

    public desactivarSeleccionCuota(itemCuota: CuotaDTO) {
        if (this.detalleCobro.tipoCredito === 'CRÉDITO SOPORTE') {
            return true
        }
        if (this.totalAPagar > 0) {
            return true;
        } else {
            if (this.detalleCobro.cuotas.length === 1) {
                return true;
            } else {
                /*  if (itemCuota.estado === 'VENCIDO') {
                     return false;
                 } else { */
                let indice = this.obtenerIndiceCuota(itemCuota);
                if (indice == 0) {
                    return true;
                } else {
                    if (this.verificarCuotaSeleccionada(indice - 1)) {
                        return false;
                    } else {
                        return true;
                    }
                }
                return false;
                //}
            }
        }
    }

    private obtenerIndiceCuota(itemCuota: CuotaDTO): number {
        return this.detalleCobro.cuotas.findIndex(x => x.numero == itemCuota.numero);
    }

    private verificarCuotaSeleccionada(index: number) {
        return this.detalleCobro.cuotas[index].seleccionado;
    }

    public validarTotalAPagar() {
        if (this.totalAPagar === this.deudaTotal) {
            this.desactivarSeleccionDocumento = false;
            return true;
        } else {
            this.desactivarSeleccionDocumento = true;
            return false;
        }
    }

    public finalizarCobro() {
        if (this.cobro !== undefined && this.cobro !== null) {
            this._cobroService.procesar(this.cobro.id).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.abrirCobroResultadoDialogo(data);
            })
        }
    }

    public blanquearDatos() {
        this.codigoCliente = null;
        this.nombreCliente = null;
        this.realizandoPago = false;
        this.deudaTotal = 0;
        this.deudaTotalGeneral = 0;
        this.totalAPagar = 0;
        this.detalleCobro = null;
        this.documentoSeleccionado = null;
        this.documentosCatalogo = [];
        this.formasPago = [];
        this.cobro = undefined;
        this.desactivarSeleccionDocumento = false;
        this.editarCobroService.next([]);
        this.cantidadRecibida = 0;
    }

    private crearCobro(): Cobro {
        let cobro = new Cobro();
        if (this.cobro === undefined || this.cobro === null) {
            cobro.estado = 'NUEVO';
        }
        cobro.deuda = this.deudaTotal;
        cobro.puntoVenta = this._sessionService.puntoVenta();
        let cuotasFactura: CobroCuotaFactura[] = this.crearObjetoCuotaFacturas();
        cobro.cuotaFacturas = cuotasFactura;
        cobro.codigoCliente = this.codigoCliente;
        return cobro;
    }

    private crearObjetoCuotaFacturas(): CobroCuotaFactura[] {
        let cuotas: CobroCuotaFactura[] = [];
        this.detalleCobro.cuotas.map(x => {
            if (x.seleccionado && !this.existeCuotaFacturaEnCobro(x.idCondicionCobroFactura)) {
                let cobroCuotaFactura = new CobroCuotaFactura();
                let condicionCobroFactura = new CondicionCobroFactura();
                condicionCobroFactura.id = x.idCondicionCobroFactura;
                cobroCuotaFactura.valor = x.valor;
                cobroCuotaFactura.cuotaFactura = condicionCobroFactura;
                cuotas.push(cobroCuotaFactura);
            }
        })
        return cuotas;
    }

    private existeCuotaFacturaEnCobro(idCondicionCobroFactura: number) {
        if (this.cobro !== undefined && this.cobro !== null) {
            let a = this.cobro.cuotaFacturas.find(x => x.cuotaFactura.id === idCondicionCobroFactura);
            return a === undefined ? false : true;
        } else {
            return false;
        }
    }

    private abrirDialogoRegistrar() {
        if (this.puedeAgregarFormaPago()) {
            const dialogRefRegistro = this.dialogService.open({
                appendTo: this.containerRegsitroRef,
                content: RegistroComponent,
                minWidth: 320,
                maxWidth: 320,
                title: 'REGISTRO',
                actions: [{ text: 'Cancelar' }, { text: 'Aceptar', primary: true }],
                preventAction: (ev, dialog) => {
                    if (ev['text'] === 'Aceptar')
                        return !dialog.content.instance.editForm.valid;
                    else
                        return false;
                }
            });

            const formaPagoRegistro = dialogRefRegistro.content.instance;
            formaPagoRegistro.valorPendiente = this.deudaTotal - this.totalAPagar;
            formaPagoRegistro.idPuntoVenta = this.detalleCobro.idPuntoVenta;
            formaPagoRegistro.numeroFactura = this.documentoSeleccionado.numeroDocumento;
            formaPagoRegistro.tipoPago = this.detalleCobro.tipoCredito;
            formaPagoRegistro.codigoCliente = this.codigoCliente;
            formaPagoRegistro.cobroID = this.cobro ? this.cobro.id : 0;
            dialogRefRegistro.result.subscribe(r => {
                if (r['text'] == 'Aceptar') {
                    this.saveHandler(formaPagoRegistro.editForm.value);
                    dialogRefRegistro.close();

                }
                if (r['text'] == 'Cancelar') {
                    dialogRefRegistro.close();

                }
            });
        } else {
            this._notificarService.mostrarMensajeError("Falta Ingresar valor para la cuota seleccionada.");
        }
    }

    private abrirBuscarClienteDialogo() {
        const dialogRef = this.dialogService.open({
            appendTo: this.containerBuscarClienteRef,
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
        cliente.codigoBuscar = this.codigoCliente;
        cliente.buscarClientePorCriterio();
        dialogRef.result.subscribe(r => {
            if (r['text'] == 'Seleccionar') {
                this.codigoCliente = cliente.clienteSeleccionado[0].CUSTNMBR;
                this.nombreCliente = cliente.clienteSeleccionado[0].CUSTNAME;
                this.buscarCobros();
                this.recuperarCobroPagoDocumento();
            }
            if (r['text'] == 'Cancelar') {
                dialogRef.close();
                dialogRef.dialog = null;
            }
        });
    }

    private abrirCobroResultadoDialogo(data) {
        const dialogCobroResultado: DialogRef = this.dialogService.open({
            appendTo: this.cobroResultadoRef,
            title: 'Información',
            content: CobroResultadoDialogoComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 500,
            minHeight: 300,
            minWidth: 250
        });
        const facturaResultadoRegistro = dialogCobroResultado.content.instance;
        facturaResultadoRegistro.resultado = data;

        dialogCobroResultado.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.blanquearDatos();
            } else {
                if (result['text'] === 'Aceptar') {
                    this.blanquearDatos();
                }
            }
        });
    }

    public mostrarConfirmacion() {
        let mensaje: string = "¿ Está seguro de registrar el cobro de los documentos seleccionados ?";
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionRef,
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
                    this.finalizarCobro();
                }
            }
        });
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    notificarMensaje(mensaje: string) {
        this._notificarService.loadingCambio.next(false);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public mostrarCalculadora() {
        const dialogCalculadora: DialogRef = this.dialogService.open({
            appendTo: this.containerCalculadoraRef,
            title: 'Calculadora',
            content: CobroCalculadoraComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 550,
            height: 250,
            minWidth: 250
        });
        const calculadoraRef = dialogCalculadora.content.instance;
        calculadoraRef.totalCobroEfectivo = this.calcularTotalEfectivo();
        calculadoraRef.cantidadRecibida = this.cantidadRecibida;

        dialogCalculadora.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.cantidadRecibida = calculadoraRef.cantidadRecibida;
            } else {
                if (result['text'] === 'Aceptar') {
                    this.cantidadRecibida = calculadoraRef.cantidadRecibida;
                }
            }
        });
    }

    private calcularTotalEfectivo() {
        let totalEfectivo = 0;
        if (this.cobro) {
            _.forEach(this.cobro.cobroFormaPagos, (o) => {
                if (o.formaPago === 'EFECTIVO')
                    totalEfectivo = _.add(totalEfectivo, o.valor);
            })
        }
        return totalEfectivo;
    }

    public existeFormaPagoEfectivo() {
        if (this.cobro) {
            return _.some(this.cobro.cobroFormaPagos, ['formaPago', 'EFECTIVO']);
        } else {
            return false;
        }
    }

    public itemDisabled(itemArgs: { dataItem: CobroDocumentoValorDTO, index: number }) {
        return itemArgs.dataItem.activo === false; // disable the 3rd item
    }

    public onChangeSaldo(valor) {
        this.calcularDeudaTotal();
    }

    private sincronizarValoresAbonados() {
        if (this.cobro && this.detalleCobro) {
            _.forEach(this.detalleCobro.cuotas, (x) => {
                const cuotaFactura = _.find(this.cobro.cuotaFacturas, (cta) => {
                    if (cta.cuotaFactura.id === x.idCondicionCobroFactura)
                        return cta;
                })
                if (cuotaFactura) {
                    x.valor = cuotaFactura['valor'];
                }
            })
            this.calcularDeudaTotal();
        }
    }

    public desactivarEdicionValor(dataItem: CuotaDTO) {
        if (this.totalAPagar > 0) {
            return true;
        }

        if (!dataItem.seleccionado) {
            return true;
        }

        return false;
    }

    private puedeAgregarFormaPago() {
        let resultado = true;
        if (this.detalleCobro) {
            _.forEach(this.detalleCobro.cuotas, (o) => {
                if (_.isNull(o.valor)) {
                    resultado = false;
                }
            })
        }
        return resultado;
    }

}
