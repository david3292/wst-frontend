import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-confirmar-devolucion',
    templateUrl: './confirmar-devolucion.component.html',
    styleUrls: ['./confirmar-devolucion.component.scss']
})
export class ConfirmarDevolucionComponent implements OnInit {

    public mensaje: string;
    public revisionTecnica: boolean;
    public respuesta: boolean;
    public tipoDevolucion: string;

    constructor() {
    }

    ngOnInit(): void {
    }

    mostrarRevicionTecnica() {
        switch (this.tipoDevolucion) {
            case 'ARTICULO':
                return this.revisionTecnica;
            case 'REFACTURACION':
                return false;
            default:
                return false;
        }
    }

}
