import { Component, OnInit } from '@angular/core';
import { ReservaFacturaDTO } from 'src/app/_dominio/ventas/reservaFacturaDTO';

@Component({
    selector: 'app-consulta-reserva-resultado-dialogo',
    templateUrl: './consulta-reserva-resultado-dialogo.component.html',
    styleUrls: ['./consulta-reserva-resultado-dialogo.component.scss']
})
export class ConsultaReservaResultadoDialogoComponent implements OnInit {

    public reservas: ReservaFacturaDTO[] = [];

    constructor() { }

    ngOnInit(): void {
    }

}
