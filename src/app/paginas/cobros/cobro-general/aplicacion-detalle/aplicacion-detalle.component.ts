import { Component, OnInit, Input } from '@angular/core';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';

@Component({
    selector: 'app-aplicacion-detalle',
    templateUrl: './aplicacion-detalle.component.html',
    styleUrls: ['./aplicacion-detalle.component.scss']
})
export class AplicacionDetalleComponent implements OnInit {

    @Input() public aplicaciones: CobroCuotaFactura[] = [];

    constructor() { }

    ngOnInit(): void {
    }

}
