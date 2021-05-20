import { FormaPagoPuntoVenta } from './../../../../_dominio/sistema/formaPagoPuntoVenta';
import { FormaPagoService } from './../../../../_servicio/sistema/forma-pago.service';
import { FormaPagoPuntoVentaService } from './../../../../_servicio/sistema/forma-pago-punto-venta.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ChequeraGP } from 'src/app/_dominio/sistema/chequeraGP';
import { FormaPago } from 'src/app/_dominio/sistema/formaPago';
import { switchMap } from 'rxjs/operators';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'formaPago': new FormControl(dataItem.formaPago, Validators.required),
    'chequera': new FormControl(dataItem.chequera),
    'activo': new FormControl(dataItem.activo)
});

@Component({
    selector: 'app-asignacion-forma-pago',
    templateUrl: './asignacion-forma-pago.component.html',
    styleUrls: ['./asignacion-forma-pago.component.scss']
})
export class AsignacionFormaPagoComponent implements OnInit {

    public puntoVenta: PuntoVenta
    public catalogoChequera: ChequeraGP[] = [];
    public catalogoFormasPago: FormaPago[] = [];
    public formasPagoAsignados: FormaPagoPuntoVenta[] = [];

    public formaPagoSeleccionado: FormaPago;
    public chequeraSeleccionada: ChequeraGP;

    public formGroup: FormGroup;
    private editedRowIndex: number;;

    constructor(
        private _notificarService: NotificarService,
        private _formaPagoPuntoVentaService: FormaPagoPuntoVentaService,
        private _formaPagoService: FormaPagoService
    ) { }

    ngOnInit(): void {
        this.listarFormasPago();
        this.listarChequerasGP();
        this.listarFormasPagoAsignadas();
        this._formaPagoPuntoVentaService.formasPagoPuntoVentaCambio.subscribe(data => {
            this.formasPagoAsignados = data;
        })
    }

    private listarChequerasGP() {
        this._formaPagoPuntoVentaService.listarChequerasGP().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.catalogoChequera = data;
        })
    }

    private listarFormasPagoAsignadas() {
        this._formaPagoPuntoVentaService.listarTodos(this.puntoVenta.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this._formaPagoPuntoVentaService.formasPagoPuntoVentaCambio.next(data);
        })
    }
    private listarFormasPago() {
        this._formaPagoService.listarActivos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.catalogoFormasPago = data;
        })
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }) {
        const formaPago: FormaPagoPuntoVenta = formGroup.value;
        formaPago.puntoVenta = this.puntoVenta;
        this._formaPagoPuntoVentaService.modificar(formaPago).pipe(switchMap(() => {
            return this._formaPagoPuntoVentaService.listarTodos(this.puntoVenta.id);
        })).subscribe(data => {
            this.onComplete('Forma Pago modificado', data);
        });

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

    public agregarFormaPago() {
        let formaPagoAsigar = new FormaPagoPuntoVenta();
        formaPagoAsigar.formaPago = this.formaPagoSeleccionado;
        formaPagoAsigar.puntoVenta = this.puntoVenta;
        formaPagoAsigar.chequera = this.chequeraSeleccionada === undefined ? '' : this.chequeraSeleccionada.CHEKBKID;
        this._formaPagoPuntoVentaService.registrar(formaPagoAsigar).pipe(switchMap(() => {
            return this._formaPagoPuntoVentaService.listarTodos(this.puntoVenta.id);
        })).subscribe(data => {
            this.onComplete("Forma Pago Agregada", data);
        })
    }

    private onComplete(mensaje: string, data: any) {
        this._notificarService.desactivarLoading();
        this._formaPagoPuntoVentaService.formasPagoPuntoVentaCambio.next(data);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

}
