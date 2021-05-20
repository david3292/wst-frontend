import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { ChequePosfechadoDTO } from 'src/app/_dominio/cobros/chequePosfechadoDTO';
import * as _ from "lodash";

@Component({
    selector: 'app-cheque-posfechado-confirmacion',
    templateUrl: './cheque-posfechado-confirmacion.component.html',
    styleUrls: ['./cheque-posfechado-confirmacion.component.scss']
})
export class ChequePosfechadoConfirmacionComponent implements OnInit {

    /*Datos Recibidos */
    public chequesAprocesar: ChequePosfechadoDTO[] = [];
    public mostrarMensajeRevision: Boolean = false;

    constructor(
        public _dialog: DialogRef,
    ) { }

    ngOnInit(): void {
        this.validarMonstrarMensajeRevision()
    }

    private validarMonstrarMensajeRevision() {
        this.mostrarMensajeRevision = _.some(this.chequesAprocesar, ['revision', true]);
    }

}
