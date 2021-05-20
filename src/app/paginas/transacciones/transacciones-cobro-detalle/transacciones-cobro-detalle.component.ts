import { CobroCuotaFactura } from './../../../_dominio/cobros/cobroCuotaFactura';
import { Component, OnInit } from '@angular/core';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import * as _ from 'lodash';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';

@Component({
    selector: 'app-transacciones-cobro-detalle',
    templateUrl: './transacciones-cobro-detalle.component.html',
    styleUrls: ['./transacciones-cobro-detalle.component.scss']
})
export class TransaccionesCobroDetalleComponent implements OnInit {

    public cobro: Cobro;

    public aplicacionesError: CobroCuotaFactura[] = [];
    public cobrosError: CobroFormaPago[] = [];

    constructor() { }

    ngOnInit(): void {
        this.obtenerErrores();
    }

    private obtenerErrores() {
        if (this.cobro) {
            this.aplicacionesError = _.filter(this.cobro.cuotaFacturas, ['estado', 'ERROR_APLICACION']);
            this.cobrosError = _.filter(this.cobro.cobroFormaPagos, ['estado', 'ERROR_COBRO']);
        }
    }

}
