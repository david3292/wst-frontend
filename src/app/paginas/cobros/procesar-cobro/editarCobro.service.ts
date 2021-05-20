import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';

@Injectable()
export class EditarCobroService extends BehaviorSubject<any[]> {

    constructor() {
        super([]);
    }

    private data: CobroFormaPago[] = [];

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
