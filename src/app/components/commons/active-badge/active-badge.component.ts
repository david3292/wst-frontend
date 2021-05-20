import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-active-badge',
    templateUrl: './active-badge.component.html',
    styleUrls: ['./active-badge.component.scss']
})
export class ActiveBadgeComponent implements OnInit {

    @Input()
    active: boolean = false;

    descripcion: string;

    constructor() { }

    ngOnInit(): void {
    }

    public colorBadge(){
        if(this.active){
            this.descripcion = 'SI';
            return ['badge-success'];
        }
        else {
            this.descripcion = 'NO';
            return ['badge-danger'];
        }
    }

}
