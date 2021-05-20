import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-tipo-transferencia-badge',
    templateUrl: './tipo-transferencia-badge.component.html',
    styleUrls: ['./tipo-transferencia-badge.component.scss']
})
export class TipoTransferenciaBadgeComponent implements OnInit {

    @Input()
    tipo: string;

    constructor() { }

    ngOnInit(): void {
    }

    public colorBadge() {
        switch (this.tipo) {
            case "VENTA":
                return ['badge-secondary'];
            case "REPOSICION":
                return ['badge-primary'];
            default:
                return [''];
        }
    }

}
