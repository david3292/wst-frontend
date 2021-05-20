import { CondicionPago } from 'src/app/_dominio/sistema/condicionPago';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-condicion-pago-detalle',
    templateUrl: './condicion-pago-detalle.component.html',
    styleUrls: ['./condicion-pago-detalle.component.scss']
})
export class CondicionPagoDetalleComponent implements OnInit {

    @Input() public condicion: CondicionPago;

    constructor() { }

    ngOnInit(): void {
    }

}
