import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-stock-dialogo',
    templateUrl: './stock-dialogo.component.html',
    styleUrls: ['./stock-dialogo.component.scss']
})
export class StockDialogoComponent implements OnInit {

    public stock: any;

    constructor() { }

    ngOnInit(): void {
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

}
