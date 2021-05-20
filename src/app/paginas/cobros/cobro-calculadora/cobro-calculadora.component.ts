import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-cobro-calculadora',
    templateUrl: './cobro-calculadora.component.html',
    styleUrls: ['./cobro-calculadora.component.scss']
})
export class CobroCalculadoraComponent implements OnInit {

    public cantidadRecibida: number = 0;
    public totalCobroEfectivo: number = 0;
    public resultado: number = 0;

    constructor() { }

    ngOnInit(): void {
    }

    public calcular() {
        this.resultado = this.cantidadRecibida - this.totalCobroEfectivo;
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    public onBlur() {
        this.calcular()
    }

}
