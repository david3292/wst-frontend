import { FormaPago } from './../../../_dominio/sistema/formaPago';
import { Component, OnInit } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FormaPagoService } from 'src/app/_servicio/sistema/forma-pago.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'nombre': new FormControl(dataItem.nombre, Validators.required),
    'integracionCobro': new FormControl(dataItem.integracionCobro, Validators.required),
    'chequePosFechado': new FormControl(dataItem.chequePosFechado),
    'activo': new FormControl(dataItem.activo, Validators.required)
});

@Component({
    selector: 'app-forma-pago',
    templateUrl: './forma-pago.component.html',
    styleUrls: ['./forma-pago.component.scss']
})
export class FormaPagoComponent implements OnInit {

    public formasPago: FormaPago[] = [];
    public catalogoFPago: any[] = [];

    public formGroup: FormGroup;
    private editedRowIndex: number;

    constructor(
        private _notificarService: NotificarService,
        private _formaPagoService: FormaPagoService
    ) { }

    ngOnInit(): void {
        this.setearListas().subscribe(data =>{
            this._notificarService.desactivarLoading();
            this.catalogoFPago = data[0];
            this.formasPago = data[1];
        })
        this._formaPagoService.formasPagoCambio.subscribe(data => {
            this.formasPago = data;
        })
    }

    private setearListas(): Observable<any[]> {
        let catalogo = this._formaPagoService.crearCatalgo();
        let formasPago = this._formaPagoService.listarTodos();
        return forkJoin([catalogo, formasPago]);
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': 0,
            'nombre': '',
            'integracionCobro': 0,
            'chequePosFechado': 0,
            'activo': true
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }): void {
        const configuracion = formGroup.value;
        if (isNew) {
            this._formaPagoService.registrar(configuracion).pipe(switchMap(() => {
                return this._formaPagoService.listarTodos();
            })).subscribe(data => {
                this._notificarService.loadingCambio.next(false);
                this._formaPagoService.formasPagoCambio.next(data);
                this._notificarService.mensajeRequest.next({ detalle: 'Forma Pago Registrado', tipo: 'success' });
            })
        } else {
            this._formaPagoService.modificar(configuracion).pipe(switchMap(() => {
                return this._formaPagoService.listarTodos();
            })).subscribe(data => {
                this._notificarService.loadingCambio.next(false);
                this._formaPagoService.formasPagoCambio.next(data);
                this._notificarService.mensajeRequest.next({ detalle: 'Forma Pago Modificado', tipo: 'success' });
            })
        }
        sender.closeRow(rowIndex);
    }

    public editHandler({ sender, rowIndex, dataItem }) {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;
        sender.editRow(rowIndex, this.formGroup);
    }

    public cancelHandler({ sender, rowIndex }) {
        this.closeEditor(sender, rowIndex);
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    public obtenerNombre(nombre: string) {
        return this.catalogoFPago.find(x => x.valor === nombre).texto;
    }


}
