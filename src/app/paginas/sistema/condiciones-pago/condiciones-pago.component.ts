import { CondicionPago } from 'src/app/_dominio/sistema/condicionPago';
import { CondicionPagoService } from './../../../_servicio/sistema/condicion-pago.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-condiciones-pago',
    templateUrl: './condiciones-pago.component.html',
    styleUrls: ['./condiciones-pago.component.scss']
})
export class CondicionesPagoComponent implements OnInit {

    public condiciones: CondicionPago[] = [];

    constructor(
        private _notificarService: NotificarService,
        private _condicionPagoService: CondicionPagoService,
        public route : ActivatedRoute) { }

    ngOnInit(): void {
        this.listarCondicionesPago();
        this._condicionPagoService.condicionesCambio.subscribe(data =>{
            this.condiciones= data;
        })
    }

    private listarCondicionesPago() {
        this._condicionPagoService.listarTodos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.condiciones = data;
        })
    }

}
