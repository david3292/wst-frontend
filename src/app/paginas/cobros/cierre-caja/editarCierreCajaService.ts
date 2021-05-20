import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CajaDetalle } from 'src/app/_dominio/cobros/cajaDetalle';

const itemIndex = (item: CajaDetalle, data: CajaDetalle[]): number => {
    for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].formaPago === item.formaPago) {
            return idx;
        }
    }

    return -1;
};

@Injectable()
export class EditarCierreCajaService extends BehaviorSubject<any[]> {

    constructor() {
        super([]);
    }

    private data: CajaDetalle[] = [];

    public update(item: any): void {
        const index = itemIndex(item, this.data);
        if (index !== -1)
            this.data[index] = item;
        //this.read();
    }

    public read() {
        if (this.data.length) {
            return super.next(this.data);
        }
    }

    public assignValues(target: any, source: any): void {
        Object.assign(target, source);
    }



}
