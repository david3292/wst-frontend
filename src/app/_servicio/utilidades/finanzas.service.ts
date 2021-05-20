import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FinanzasService {

    constructor() { }

    /*Funcion para formatear cantidades a 2 decimales.
    */
    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }
}
