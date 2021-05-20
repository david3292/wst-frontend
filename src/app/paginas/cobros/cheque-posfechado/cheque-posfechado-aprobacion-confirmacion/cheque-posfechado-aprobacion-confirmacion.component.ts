import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChequePosfechadoDTO } from 'src/app/_dominio/cobros/chequePosfechadoDTO';

@Component({
    selector: 'app-cheque-posfechado-aprobacion-confirmacion',
    templateUrl: './cheque-posfechado-aprobacion-confirmacion.component.html',
    styleUrls: ['./cheque-posfechado-aprobacion-confirmacion.component.scss']
})
export class ChequePosfechadoAprobacionConfirmacionComponent implements OnInit {

    /*Datos Recibidos */
    public chequesAprocesar: ChequePosfechadoDTO[] = [];
    public accion: string;

    public editForm: FormGroup = new FormGroup({
        observaciones: new FormControl(''),
    });

    constructor( ) { }

    @ViewChild("containerResultadoA", { read: ViewContainerRef })
    public containerResultadoRef: ViewContainerRef;

    ngOnInit(): void {
        this.actualizarFormulario();
    }

    private actualizarFormulario() {
        switch (this.accion) {
            case 'AUTORIZAR':
                this.editForm.get('observaciones').clearValidators();
                break;
            case 'RECHAZAR':
                this.editForm.controls["observaciones"].setValidators([Validators.required]);
                break;
            default: break;
        }
        this.editForm.get('observaciones').updateValueAndValidity();
    }

}
