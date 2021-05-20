import { map, switchMap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { SessionService } from 'src/app/_servicio/session.service';
import { FinanzasService } from 'src/app/_servicio/utilidades/finanzas.service';
import { BuscarClienteDialogoComponent } from '../../cliente/buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { EditarCobroService } from '../procesar-cobro/editarCobro.service';
import * as _ from "lodash";
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { RegistroFormaPagoComponent } from './registro-forma-pago/registro-forma-pago.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';
import { CobroResultadoDialogoComponent } from '../../../components/commons/cobro-resultado-dialogo/cobro-resultado-dialogo.component';
import { CobroCalculadoraComponent } from '../cobro-calculadora/cobro-calculadora.component';

@Component({
    selector: 'app-cobro-general',
    templateUrl: './cobro-general.component.html',
    styleUrls: ['./cobro-general.component.scss']
})
export class CobroGeneralComponent implements OnInit {

    public cobro: Cobro;
    public codigoCliente: string;
    public nombreCliente: string;
    public deudaTotalGeneral: number = 0;
    public registrandoCobro: boolean = false;

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

    @ViewChild("containerBuscarCliente", { read: ViewContainerRef })
    public containerBuscarClienteRef: ViewContainerRef;
    @ViewChild("containerRegistro", { read: ViewContainerRef })
    public containerRegsitroRef: ViewContainerRef;
    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("cobroResultado", { read: ViewContainerRef })
    public cobroResultadoRef: ViewContainerRef;
    @ViewChild("containerCalculadora", { read: ViewContainerRef })
    public containerCalculadoraRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _cobroService: CobroService,
        public editarCobroService: EditarCobroService,
        private dialogService: DialogService,
        private _fechaService: FechaService,
        private _sessionService: SessionService,
        public _finanzasService: FinanzasService,
        private _router: Router,
        public _route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this._cobroService.cobroCambio.subscribe(data => {
            this.cobro = data;
            this.formasPago = data.cobroFormaPagos;
            this.codigoCliente = data.codigoCliente;
            this.editarCobroService.next(this.formasPago);
        });
        this.view = this.editarCobroService.pipe(map(data => process(data, this.gridState)));
        this.editarCobroService.next([]);
        this.editarCobroService.read();
    }

    public buscarCliente() {
        if (this.codigoCliente !== undefined) {
            this.abrirBuscarClienteDialogo();
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
                this.registrandoCobro = true;
                this.recuperarCobro();
                this.consultarDeudaCliente();
            }
            if (r['text'] == 'Cancelar') {
                dialogRef.close();
                dialogRef.dialog = null;
            }
        });
    }

    public existeFormaPagoEfectivo() {
        if (this.cobro) {
            return _.some(this.cobro.cobroFormaPagos, ['formaPago', 'EFECTIVO']);
        } else {
            return false;
        }
    }

    private recuperarCobro() {
        this._cobroService.buscarPorCodigoClienteYEstadoNuevo(this.codigoCliente).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data !== null) {
                this.cobro = data;
                this.formasPago = data.cobroFormaPagos;
                this.editarCobroService.next(this.formasPago);
            }
        })
    }

    private consultarDeudaCliente(){
        this._cobroService.deudaPorCliente(this.codigoCliente).subscribe(data =>{
            this._notificarService.desactivarLoading();
            this.deudaTotalGeneral = data;
        })
    }

    public addHandler() {
        this.editDataItem = new CobroFormaPago();
        this.abrirDialogoRegistrar();
        this.isNew = true;
    }

    private abrirDialogoRegistrar() {
        const dialogRefRegistro = this.dialogService.open({
            appendTo: this.containerRegsitroRef,
            content: RegistroFormaPagoComponent,
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
    }

    public cancelHandler() {
        this.editDataItem = undefined;
    }

    public saveHandler(cobroFormaPago: CobroFormaPago) {
        cobroFormaPago.saldo = cobroFormaPago.valor;
        let cobroGuardar = this.crearCobro();
        cobroFormaPago.estado = 'NUEVO';
        if (cobroFormaPago.formaPago === 'CHEQUE_A_FECHA')
            cobroFormaPago.fechaEfectivizacion = this._fechaService.formatearFechaYHora(cobroFormaPago.fechaEfectivizacion);
        else
            cobroFormaPago.fechaEfectivizacion = null;
        if (cobroFormaPago.formaPago === 'NOTA_CREDITO' || cobroFormaPago.formaPago === 'ANTICIPO')
            cobroFormaPago.numeroDocumento = cobroFormaPago.numeroDocumento['DOCNUMBR'];

        cobroGuardar.cobroFormaPagos = [cobroFormaPago];
        this._cobroService.registrarCobroGeneral(cobroGuardar).subscribe(data => {
            this.notificarMensaje('Forma de pago registrada');
            this.cobro = data;
            this.formasPago = data.cobroFormaPagos;
            this.editarCobroService.next(this.formasPago);
            this.editDataItem = undefined;
        })
    }

    public removeHandler({ sender, dataItem }) {
        this.mostrarConfirmacion('eliminarFormaPago', dataItem);
        sender.cancelCell();
    }

    private eliminarFormaPago(dataItem: CobroFormaPago) {
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
        })
    }

    private crearCobro(): Cobro {
        let cobro = new Cobro();
        if (this.cobro === undefined || this.cobro === null) {
            cobro.estado = 'NUEVO';
        }
        cobro.deuda = 0;
        cobro.puntoVenta = this._sessionService.puntoVenta();
        cobro.codigoCliente = this.codigoCliente;
        cobro.nombreCliente = this.nombreCliente;
        return cobro;
    }

    public redirigirAplicaciones(dataItem) {
        this._router.navigate(['cobros/general/aplicacion'], { queryParams: { param1: this.cobro.id, param2: dataItem.id, param3: this.nombreCliente } })
    }

    public obtenerAplicaciones(dataItem: CobroFormaPago): CobroCuotaFactura[] {
        return _.filter(this.cobro.cuotaFacturas, (o) => o.cobroFormaPagoId == dataItem.id);
    }

    private notificarMensaje(mensaje: string) {
        this._notificarService.loadingCambio.next(false);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public mostrarConfirmacion(opcion: string, formaPago: CobroFormaPago) {
        let mensaje: string = opcion == 'finalizarCobro' ? "¿ Está seguro de registrar el cobro de los documentos seleccionados ?"
            : `¿ Está seguro de eliminar la forma de pago ${formaPago.formaPago} y todas sus aplicaciones ?`;
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
                    if (opcion === 'finalizarCobro')
                        this.finalizarCobro();
                    if (opcion === 'eliminarFormaPago')
                        this.eliminarFormaPago(formaPago);
                }
            }
        });
    }

    public finalizarCobro() {
        if (this.cobro !== undefined && this.cobro !== null) {
            this._cobroService.procesar(this.cobro.id).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.abrirCobroResultadoDialogo(data);
            })
        }
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
            totalEfectivo = _.sumBy(_.filter(this.cobro.cobroFormaPagos, (o) => { return o.formaPago === 'EFECTIVO' }), (o) => { return o.valor });
        }
        return totalEfectivo;
    }

    public blanquearDatos() {
        this.codigoCliente = null;
        this.nombreCliente = null;
        this.deudaTotalGeneral = 0;
        this.formasPago = [];
        this.cobro = undefined;
        this.editarCobroService.next([]);
        this.registrandoCobro = false;
    }
}
