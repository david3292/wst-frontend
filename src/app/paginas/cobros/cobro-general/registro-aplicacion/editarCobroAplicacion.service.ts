import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';

@Injectable()
export class EditarCobroAplicacionService extends BehaviorSubject<any[]> {

    constructor() {
        super([]);
    }

    private data: CobroCuotaFactura[] = [];

    public save(data: any, isNew?: boolean) {
        this.reset();

        if (isNew) {
            this.data.push(data);
        }
        this.read();
    }

    private reset() {
        this.data = [];
    }

    public read() {
        if (this.data.length) {
            return super.next(this.data);
        }
    }



}
