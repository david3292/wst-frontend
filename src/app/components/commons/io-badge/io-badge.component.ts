import { Component, Input, OnInit } from '@angular/core';
import { faArrowDown, faShare } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-io-badge',
    templateUrl: './io-badge.component.html',
    styleUrls: ['./io-badge.component.scss']
})
export class IoBadgeComponent implements OnInit {

    @Input()
    ioType: string;

    public iconPivot;
    constructor() { }

    ngOnInit(): void {
        if(this.ioType === 'TRANSFERENCIA_SALIDA')
            this.iconPivot = faArrowDown;
        if(this.ioType === 'TRANSFERENCIA')
            this.iconPivot = faShare;
    }

    getIoType(){
        if(this.ioType === 'TRANSFERENCIA_SALIDA')
            return 't-entrada';
        if(this.ioType === 'TRANSFERENCIA')
            return 't-salida';
    }
}
