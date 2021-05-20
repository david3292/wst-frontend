import {Component, OnInit} from '@angular/core';
import {GridDataResult} from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-cobro-formas-pago',
    templateUrl: './cobro-formas-pago.component.html'
})
export class CobroFormasPagoComponent implements OnInit {

    public formasPago: any[];
    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private currentPage = 0;

    constructor() {
    }

    ngOnInit(): void {
        this.inicio();
    }

    inicio() {
        this.gridView = {
            data: this.formasPago,
            total: this.formasPago.length
        };
    }
}
