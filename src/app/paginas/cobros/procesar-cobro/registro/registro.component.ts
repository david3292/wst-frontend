import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChequeraGP } from 'src/app/_dominio/sistema/chequeraGP';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { SessionService } from 'src/app/_servicio/session.service';
import { FormaPagoPuntoVentaService } from 'src/app/_servicio/sistema/forma-pago-punto-venta.service';

let tipoCredito = '';

@Component({
    selector: 'app-registro',
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

    public formaPagoCatalogo: string[];
    public bancosCatalogo: any[];
    public tarjetasCreditoCatalogo: any[];
    public chequerasCatalogo: ChequeraGP[];
    public formasPagoPvta: any[] = [];
    public notasCreditoCatalogo: any[] = [];
    public anticiposCatalogo: any[] = [];
    public mensajeErrorCheque: string;
    public minFecha = new Date();

    public mostrarTarjeta: boolean = false;
    public mostrarBanco: boolean = false;
    public mostrarNumeroAutorizacion: boolean = false;
    public mostrarChequera: boolean = false;
    public mostrarNumeroDocumento: boolean = false;
    public mostrarNotasCredito: boolean = false;
    public mostrarFechaEfectivizacion: boolean = false;
    public mostrarAnticipos: boolean = false;

    //parametro enviado
    public valorPendiente: number = 0;
    public idPuntoVenta: number;
    public numeroFactura: string;
    public tipoPago: string;
    public codigoCliente: string;
    public cobroID: number = 0;

    public editForm: FormGroup = new FormGroup({
        formaPago: new FormControl('', Validators.required),
        valor: new FormControl(this.valorPendiente, [Validators.required, Validators.min(0.01)]),
        banco: new FormControl(''),
        numeroDocumento: new FormControl(),
        numeroAutorizacion: new FormControl(''),
        chequera: new FormControl(''),
        nombreTarjeta: new FormControl(''),
        fechaEfectivizacion: new FormControl(new Date()),
    });

    constructor(private _notificarService: NotificarService,
        private _cobroService: CobroService,
        private _formaPagoPuntoVentaService: FormaPagoPuntoVentaService,
        private _sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.obtenerCatalogoBancos();
        this.obtenerCatalogoTarjetasCredito();
        this.obtenerCatalagoChequeras();
        this.obtenerFormasPagoPuntoVenta();
        this.obtenerCatalagoNotasCredito();
        this.obtenerCatalagoAnticipos();
        tipoCredito = this.tipoPago;
    }

    private obtenerCatalogoBancos() {
        this._cobroService.listarBancos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.bancosCatalogo = data;
        })
    }

    private obtenerCatalogoTarjetasCredito() {
        this._cobroService.listarTarjetasCredito().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.tarjetasCreditoCatalogo = data;
        })
    }

    private obtenerCatalagoChequeras() {
        this._formaPagoPuntoVentaService.listarChequerasGP().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.chequerasCatalogo = data;
        })
    }

    private obtenerCatalagoNotasCredito() {
        this._cobroService.listarNotasCredito(this.codigoCliente).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.notasCreditoCatalogo = data;
        })
    }

    private obtenerCatalagoAnticipos() {
        this._cobroService.listarAnticipos(this.codigoCliente).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.anticiposCatalogo = data;
        })
    }

    private obtenerFormasPagoPuntoVenta() {
        this._formaPagoPuntoVentaService.listarTodosActivos(this._sessionService.puntoVentaId()).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.formasPagoPvta = data;
            this.crearCatalogoFormasPago(data);
        })
    }

    private crearCatalogoFormasPago(data: any[]) {
        this.formaPagoCatalogo = [];
        data.map(x => {
            this.formaPagoCatalogo.push(x.formaPago);
        })
    }

    public changeValueFormaPago(valor: string) {
        this.limpiarValidadoresControles();
        this.cargarChequeraConfigurada();
        switch (valor) {
            case 'CHEQUE_A_FECHA':
                this.mostrarNumeroAutorizacion = false;
                this.mostrarNumeroDocumento = true;
                this.mostrarBanco = true;
                this.mostrarTarjeta = false;
                this.mostrarChequera = true;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = true;
                this.mostrarAnticipos = false;
                this.editForm.controls["fechaEfectivizacion"].setValidators([Validators.required]);
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                this.editForm.controls["banco"].setValidators([Validators.required]);
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);

                break;
            case 'CHEQUE':
                this.mostrarNumeroAutorizacion = false;
                this.mostrarNumeroDocumento = true;
                this.mostrarBanco = true;
                this.mostrarTarjeta = false;
                this.mostrarChequera = true;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                this.editForm.controls["banco"].setValidators([Validators.required]);
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30), Validators.pattern('^[0-9]+$')])]);
                break;
            case 'EFECTIVO':
                this.mostrarNumeroAutorizacion = false;
                this.mostrarNumeroDocumento = false;
                this.mostrarBanco = false;
                this.mostrarChequera = true;
                this.mostrarTarjeta = false;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                break;
            case 'TARJETA_CREDITO':
                this.mostrarTarjeta = true;
                this.mostrarChequera = false;
                this.mostrarNumeroDocumento = true;
                this.mostrarNumeroAutorizacion = true;
                this.mostrarNotasCredito = false;
                this.mostrarBanco = true;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);
                this.editForm.controls["banco"].setValidators([Validators.required]);
                this.editForm.controls["numeroAutorizacion"].setValidators([Validators.maxLength(30)]);
                this.editForm.controls["nombreTarjeta"].setValidators([Validators.required]);
                break;
            case 'TARJETA_DEBITO':
                this.mostrarNumeroDocumento = true;
                this.mostrarNumeroAutorizacion = false;
                this.mostrarTarjeta = false;
                this.mostrarBanco = true;
                this.mostrarChequera = true;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);
                this.editForm.controls["banco"].setValidators([Validators.required]);
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                break;
            case 'NOTA_CREDITO':
                this.mostrarBanco = false;
                this.mostrarNumeroDocumento = false;
                this.mostrarNumeroAutorizacion = false;
                this.mostrarTarjeta = false;
                this.mostrarChequera = false;
                this.mostrarNotasCredito = true;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["numeroDocumento"].setValidators([Validators.required]);
                break;
            case 'RETENCION':
                this.mostrarBanco = false;
                this.mostrarChequera = true;
                this.mostrarTarjeta = false;
                this.mostrarNumeroAutorizacion = false;
                this.mostrarNotasCredito = false;
                this.mostrarNumeroDocumento = true;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                break;
            case 'TRANSFERENCIA':
                this.mostrarNumeroAutorizacion = false;
                this.mostrarNumeroDocumento = true;
                this.mostrarBanco = false;
                this.mostrarChequera = true;
                this.mostrarTarjeta = false;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = false;
                this.editForm.controls["chequera"].setValidators([Validators.required]);
                this.editForm.controls["numeroDocumento"].setValidators([Validators.compose([Validators.required, Validators.maxLength(30)])]);
                break;
            case 'ANTICIPO':
                this.mostrarBanco = false;
                this.mostrarNumeroDocumento = false;
                this.mostrarNumeroAutorizacion = false;
                this.mostrarTarjeta = false;
                this.mostrarChequera = false;
                this.mostrarNotasCredito = false;
                this.mostrarFechaEfectivizacion = false;
                this.mostrarAnticipos = true;
                this.editForm.controls["numeroDocumento"].setValidators([Validators.required]);
                break;
            default: break;
        }
    }

    public changeValueNotaCredito(valor: any) {
        this.editForm.controls["valor"].setValue(valor.CURTRXAM);
    }

    public changeValueAnticipo(valor: any) {
        this.editForm.controls["valor"].setValue(valor.CURTRXAM);
    }

    public itemDisabled(itemArgs: { dataItem: any, index: number }) {
        switch (tipoCredito) {
            case 'CONTADO':
                return itemArgs.dataItem.nombre === 'CHEQUE_A_FECHA';
            case 'CRÉDITO':
                return itemArgs.dataItem.nombre === 'CHEQUE_A_FECHA';
            /*  case 'CRÉDITO SOPORTE':
                 return itemArgs.dataItem.nombre !== 'CHEQUE_A_FECHA'; */
            default: return;
        }
    }

    private limpiarValidadoresControles() {
        this.editForm.get('banco').clearValidators();
        this.editForm.get('banco').updateValueAndValidity();
        this.editForm.get('numeroDocumento').clearValidators();
        this.editForm.get('numeroDocumento').updateValueAndValidity();
        this.editForm.get('numeroAutorizacion').clearValidators();
        this.editForm.get('numeroAutorizacion').updateValueAndValidity();
        this.editForm.get('chequera').clearValidators();
        this.editForm.get('chequera').updateValueAndValidity();
        this.editForm.get('nombreTarjeta').updateValueAndValidity();
        this.editForm.get('fechaEfectivizacion').updateValueAndValidity();
        this.editForm.get('fechaEfectivizacion').updateValueAndValidity();
    }

    private cargarChequeraConfigurada() {
        let obj = this.formasPagoPvta.find(x => x['formaPago'] === this.editForm.value['formaPago']);
        if (obj !== null && obj !== undefined) {
            this.editForm.get('chequera').setValue(obj['chequera']);
        }
    }

    public changeValueBanco() {
        this.valdiarNumeroChequeEnOtrosCobros();
    }

    public inputBlurNumeroDocumento() {
        this.valdiarNumeroChequeEnOtrosCobros();
    }

    private valdiarNumeroChequeEnOtrosCobros() {
        const numeroDocumento = this.editForm.get('numeroDocumento').value;
        const banco = this.editForm.get('banco').value;
        const formaPago = this.editForm.get('formaPago').value;

        if (formaPago === 'CHEQUE') {
            if (banco && numeroDocumento) {
                this._cobroService.validarExisteChequeEnOtrosCobros(this.codigoCliente, numeroDocumento).subscribe(data => {
                    this._notificarService.desactivarLoading();
                    if (data) {
                        this.mensajeErrorCheque = 'El número de cheque ya fue ingresado, por favor registrar otra numeración.';
                        this.editForm.controls['numeroDocumento'].setErrors({ 'invalid': true });
                        this.editForm.controls['numeroDocumento'].markAsTouched();
                    }
                })
            }
        }
    }

}
