import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';
import { Direccion } from 'src/app/_dominio/ventas/direccion';

const itemIndex = (item: Direccion, data: Direccion[]): number => {
    for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].ADRSCODE === item.ADRSCODE) {
            return idx;
        }
    }

    return -1;
};

@Injectable()
export class EditarDireccionService extends BehaviorSubject<any[]> {

    constructor() {
        super([]);
    }

    private data: Direccion[] = [];

    public save(data: any, isNew?: boolean) {
        this.reset();

        if (isNew) {
            this.data.push(data);
        } else {
            this.update(data);
        }
        this.read();
    }

    public update(item: any): void {
        const index = itemIndex(item, this.data);
        if (index !== -1)
            this.data[index] = item;
        //this.read();
    }

    public reset() {
        this.data = [];
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
