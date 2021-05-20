import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-state-badge',
    templateUrl: './state-badge.component.html',
    styleUrls: ['./state-badge.component.scss']
})
export class StateBadgeComponent implements OnInit {

    @Input()
    estado: string;

    constructor() { }

    ngOnInit(): void {
    }

    public colorBadge() {
        switch (this.estado) {
            case "NUEVO":
                return ['badge-primary'];
            case "REVISION":
                return ['badge-warning'];
            case "APROBADO":
                return ['badge-success'];
            case "EMITIDO":
                return ['badge-info'];
            case "VENCIDO":
                return ['badge-light'];
            case "FACTURADO":
                return ['badge-light'];
            case "POR_FACTURAR":
                return ['badge-light'];
            case "RESERVADO":
                return ['badge-tertiary'];
            case "CERRADO":
                return ['badge-light'];
            case "RECHAZADO":
                return ['badge-danger'];
            case "ANULADO":
                return ['badge-secondary'];
            case "EN_PROCESO":
                return ['badge-warning'];
            default:
                return [''];
        }
    }

}
