import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Direccion } from 'src/app/_dominio/ventas/direccion';
import * as _ from "lodash";

@Component({
    selector: 'app-registro-direccion',
    templateUrl: './registro-direccion.component.html',
    styleUrls: ['./registro-direccion.component.scss']
})
export class RegistroDireccionComponent implements OnInit {

    public direccionEnEdicion: Direccion;
    public direccionesLista: Direccion[] = [];

    constructor() { }

    public editForm: FormGroup = new FormGroup({
        ADRSCODE: new FormControl('', Validators.required),
        ADDRESS1: new FormControl('', [Validators.required, Validators.maxLength(61)]),
        ADDRESS2: new FormControl('', Validators.maxLength(61)),
        ADDRESS3: new FormControl('', Validators.maxLength(61)),
        PHONE1: new FormControl(''),
        UpdateIfExists: new FormControl(0),
    });

    ngOnInit(): void {
        if (this.direccionEnEdicion) {
            this.inicializarForm();
        } else {
            this.obtenerSecuencialSiguiente()
        }
    }

    private inicializarForm() {
        this.editForm = new FormGroup({
            ADRSCODE: new FormControl(this.direccionEnEdicion.ADRSCODE, Validators.required),
            ADDRESS1: new FormControl(this.direccionEnEdicion.ADDRESS1, [Validators.required, Validators.maxLength(61)]),
            ADDRESS2: new FormControl(this.direccionEnEdicion.ADDRESS2, Validators.maxLength(61)),
            ADDRESS3: new FormControl(this.direccionEnEdicion.ADDRESS3, Validators.maxLength(61)),
            PHONE1: new FormControl(this.direccionEnEdicion.PHONE1),
            UpdateIfExists: new FormControl(1),
        });
    }

    private obtenerSecuencialSiguiente() {
        if (this.direccionesLista.length > 0) {
            let obj: Direccion[]=[];

            _.find(this.direccionesLista, (o) => {
                if(_.startsWith(_.toUpper(o.ADRSCODE),'ENVIO_')){
                    obj.push(o);
                }
            })
            if(obj.length === 0){
                this.editForm.controls['ADRSCODE'].setValue('ENVIO_1');
            }else{
                debugger
                const siguiente = obj.length + 1;
                this.editForm.controls['ADRSCODE'].setValue(`ENVIO_${siguiente}`);
            }
        } else {
            this.editForm.controls['ADRSCODE'].setValue('ENVIO_1');
        }
    }

}
