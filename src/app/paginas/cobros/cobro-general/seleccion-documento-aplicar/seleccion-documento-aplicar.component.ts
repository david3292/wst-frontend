import { Component, OnInit } from '@angular/core';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';
import { CobroDocumentoDTO } from 'src/app/_dominio/cobros/cobroDocumentoDTO';
import { CobroDocumentoValorDTO } from 'src/app/_dominio/cobros/cobroDocumentoValorDTO';
import { CuotaDTO } from 'src/app/_dominio/cobros/cuotaDTO';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FinanzasService } from 'src/app/_servicio/utilidades/finanzas.service';
import * as _ from "lodash";
import { CondicionCobroFactura } from 'src/app/_dominio/cobros/condicionCobroFactura';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';

@Component({
    selector: 'app-seleccion-documento-aplicar',
    templateUrl: './seleccion-documento-aplicar.component.html',
    styleUrls: ['./seleccion-documento-aplicar.component.scss']
})
export class SeleccionDocumentoAplicarComponent implements OnInit {
    //Parametros enviados
    public codigoCliente: string;
    public formaPago: CobroFormaPago;
    //Fin Parametros enviados

    public documentosCatalogo: CobroDocumentoValorDTO[] = [];
    public desactivarSeleccionDocumento: boolean = false;
    public documentoSeleccionado: CobroDocumentoValorDTO;
    public detalleCobro: CobroDocumentoDTO;
    public cuotas: CobroCuotaFactura[] = [];

    public mensajeError: string;

    constructor(
        private _cobroService: CobroService,
        private _notificarService: NotificarService,
        public _finanzasService: FinanzasService,
    ) { }

    ngOnInit(): void {
        this.recuperarDocumentosPorPagar();
    }

    private recuperarDocumentosPorPagar() {
        if (this.codigoCliente !== undefined) {
            this._cobroService.listarCobrosPorCodigoCliente(this.codigoCliente).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.documentosCatalogo = data;
                if (data.length <= 0) {
                    this._notificarService.mostrarMensajeInformacion("No existen cobros pendientes")
                }
            })
        }
    }

    public seleccionarDocumentoAPagar() {
        if (this.documentoSeleccionado !== undefined) {
            this._cobroService.obtenerDetalleCobroPorFacturaId(this.documentoSeleccionado.idDocumento).subscribe(data => {
                this._notificarService.desactivarLoading();
                if (data.facturaContabilizada) {
                    this.desactivarSeleccionDocumento = true;
                    this.detalleCobro = data;
                    this.crearObjetoCuotaFacturas();
                    this.validarSaldoConAplicacion();
                }else{
                    this.mensajeError=`La factura ${this.documentoSeleccionado.numeroDocumento} no está contabilizada.`;
                }
            })
        }
    }

    public desactivarEdicionValor(dataItem: CuotaDTO) {
        if (!dataItem.seleccionado) {
            return true;
        }

        if (dataItem.valor === 0) {
            return true;
        }

        return false;
    }

    public desactivarSeleccionCuota(itemCuota: CuotaDTO) {
        /*  if (this.detalleCobro.tipoCredito === 'CRÉDITO SOPORTE') {
             return false
         } */
        /* if (this.totalAPagar > 0) {
            return true;
        } */
        if (this.detalleCobro.cuotas.length === 1) {
            return true;
        } else {
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
    private obtenerIndiceCuota(itemCuota: CuotaDTO): number {
        return this.detalleCobro.cuotas.findIndex(x => x.numero == itemCuota.numero);
    }

    private verificarCuotaSeleccionada(index: number) {
        return this.detalleCobro.cuotas[index].seleccionado;
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
                this.crearObjetoCuotaFacturas();
                this.validarSaldoConAplicacion();
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

    public onChangeSaldo(valor) {
        this.crearObjetoCuotaFacturas();
        this.validarSaldoConAplicacion();
    }

    private crearObjetoCuotaFacturas() {
        let cuotas: CobroCuotaFactura[] = [];
        _.forEach(this.detalleCobro.cuotas, (x) => {
            if (x.seleccionado && x.valor > 0) {
                let cobroCuotaFactura = new CobroCuotaFactura();
                let condicionCobroFactura = new CondicionCobroFactura();
                condicionCobroFactura.id = x.idCondicionCobroFactura;
                cobroCuotaFactura.valor = x.valor;
                cobroCuotaFactura.cuotaFactura = condicionCobroFactura;
                cobroCuotaFactura.numeroFactura = this.documentoSeleccionado.numeroDocumento;
                cobroCuotaFactura.cobroFormaPagoId = this.formaPago.id;
                cuotas.push(cobroCuotaFactura);
            }
        })
        this.cuotas = cuotas;
    }

    public itemDisabled(itemArgs: { dataItem: CobroDocumentoValorDTO, index: number }) {
        return (itemArgs.dataItem.activo === false || itemArgs.dataItem.valor === 0); // disable the 3rd item
    }

    private validarSaldoConAplicacion() {
        let valorAplicar: number = 0;
        valorAplicar = _.round(_.sumBy(this.cuotas, (o) => { return o.valor }), 2);
        if (this.formaPago.saldo < valorAplicar) {
            this.mensajeError = `El valor $${valorAplicar} del documento a aplicar, excede al saldo disponible $${this.formaPago.saldo}
            de la forma de pago seleccionada.`
        } else {
            this.mensajeError = undefined;
        }
    }
}
