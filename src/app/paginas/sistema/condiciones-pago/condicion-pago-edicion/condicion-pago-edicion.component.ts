import { CondicionPagoDetalle } from './../../../../_dominio/sistema/condicionPagoDetalle';
import { CondicionPago } from 'src/app/_dominio/sistema/condicionPago';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { CondicionPagoService } from 'src/app/_servicio/sistema/condicion-pago.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'numeroCuota': new FormControl(dataItem.numeroCuota, Validators.required),
    'porcentaje': new FormControl(dataItem.porcentaje),
    'numeroDias': new FormControl(dataItem.numeroDias)
});

@Component({
    selector: 'app-condicion-pago-edicion',
    templateUrl: './condicion-pago-edicion.component.html',
    styleUrls: ['./condicion-pago-edicion.component.scss']
})
export class CondicionPagoEdicionComponent implements OnInit {

    id: number;
    public edicion: boolean;

    public formGroup: FormGroup;
    private editedRowIndex: number;

    public catalogoTipoPago: any[] = [];
    public condicionPagoEdicion: CondicionPago;
    public condicionPagoDetalle: CondicionPagoDetalle[] = [];

    public formCondicion = new FormGroup({
        'id': new FormControl(0),
        'tipoPago': new FormControl(),
        'termino': new FormControl(),
        'cuotas': new FormControl(1),
        'totalDias': new FormControl(0),
        'documentoSoporte': new FormControl(),
        'activo': new FormControl(true)
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private notificarService: NotificarService,
        private _condicionPagoService: CondicionPagoService,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.id = params['id'];
            this.edicion = params['id'] != null;
            this.obtenerCatalogoTipoPago();
        })
    }

    private obtenerCatalogoTipoPago() {
        this._condicionPagoService.crearCatalogoTipoPago().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.catalogoTipoPago = data;
            this.initFormulario();
        })
    }

    private initFormulario() {
        if (this.edicion) {
            this._condicionPagoService.listarPorId(this.id).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.condicionPagoEdicion = data;
                this.condicionPagoDetalle = data.detalle;
                this.formCondicion = new FormGroup({
                    'id': new FormControl(data.id),
                    'tipoPago': new FormControl(this.obtenerTipoPago(data.tipoPago)),
                    'termino': new FormControl(data.termino),
                    'cuotas': new FormControl(data.cuotas),
                    'totalDias': new FormControl(data.totalDias),
                    'documentoSoporte': new FormControl(data.documentoSoporte),
                    'activo': new FormControl(data.activo)
                });
            });
        }
    }

    private obtenerTipoPago(tipoPago: string) {
        return this.catalogoTipoPago.find(x => x["valor"] === tipoPago);
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);
        this.formGroup = createFormGroup({
            'id': 0,
            'numeroCuota': '',
            'porcentaje': 0,
            'numeroDias': 0
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }) {
        const condicionPagoDetalle: CondicionPagoDetalle = formGroup.value;
        if (isNew) {
            this.condicionPagoDetalle.push(condicionPagoDetalle);
        } else {
            let condicionItem = this.recuperarDetalleItem(condicionPagoDetalle);
            condicionItem.porcentaje = condicionPagoDetalle.porcentaje;
            condicionItem.numeroDias = condicionPagoDetalle.numeroDias;
        }

        this.calcularTotalDias();
        sender.closeRow(rowIndex);
    }

    private recuperarDetalleItem(valor: CondicionPagoDetalle) {
        return this.condicionPagoDetalle.find(x => x.numeroCuota === valor.numeroCuota);
    }

    public editHandler({ sender, rowIndex, dataItem }) {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;

        sender.editRow(rowIndex, this.formGroup);
    }

    public removeHandler({dataItem}) {
        var i = this.condicionPagoDetalle.indexOf( dataItem );
        this.condicionPagoDetalle.splice( i, 1 );
    }

    public cancelHandler({ sender, rowIndex }) {
        this.closeEditor(sender, rowIndex);
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    private calcularTotalDias() {
        let aux: CondicionPagoDetalle[] = [];
        aux.push(...this.condicionPagoDetalle);
        aux = aux.sort(((a, b) => b.numeroDias - a.numeroDias));
        this.formCondicion.controls['totalDias'].setValue(aux[0].numeroDias);
    }

    public onBlurCuota(cuota: number) {
        const cuotas = this.formCondicion.get('cuotas').value;
        if (this.condicionPagoDetalle.length === 0) {
            for (var i = 1; i <= cuotas; i++) {
                let detalle = new CondicionPagoDetalle();
                detalle.numeroCuota = i;
                detalle.porcentaje = 0;
                detalle.numeroDias = 0;
                this.condicionPagoDetalle.push(detalle);
            }
        }
    }

    public operarCondicion() {
        let condicion: CondicionPago = this.formCondicion.value;
        condicion.detalle = this.condicionPagoDetalle;
        condicion.tipoPago = this.formCondicion.get('tipoPago').value["valor"];
        if(this.detalleValido()){
            if (this.edicion) {
                this._condicionPagoService.modificar(condicion).pipe(switchMap(() => {
                    return this._condicionPagoService.listarTodos();
                })).subscribe(data => {
                    this._condicionPagoService.condicionesCambio.next(data);
                    this.notificarMensaje("Condición de pago modificada");
                })
            } else {
                this._condicionPagoService.registrar(condicion).pipe(switchMap(() => {
                    return this._condicionPagoService.listarTodos();
                })).subscribe(data => {
                    this._condicionPagoService.condicionesCambio.next(data);
                    this.notificarMensaje("Condición de pago registrado");
                })
            }
        }else{
            this.notificarService.mostrarMensajeError("Revise el detalle de las cuotas, los porcentajes debe tener 100%");
        }

    }
    private detalleValido() {
        if (this.condicionPagoDetalle.length > 0) {
            let porcentaje: number = 0;
            this.condicionPagoDetalle.map(x => {
                porcentaje = porcentaje + x.porcentaje;
            });
            return porcentaje == 100 ? true : false;
        } else {
            return false;
        }
    }

    cancelar() {
        this.router.navigate(['condicionespago']);
    }

    notificarMensaje(mensaje: string) {
        this.notificarService.desactivarLoading();
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
        this.router.navigate(['condicionespago']);
    }

}
