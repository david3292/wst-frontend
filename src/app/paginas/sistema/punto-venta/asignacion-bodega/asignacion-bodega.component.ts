import { PuntoVentaBodega } from './../../../../_dominio/sistema/puntoVentaBodega';
import { switchMap } from 'rxjs/operators';
import { PuntoVentaBodegaService } from './../../../../_servicio/sistema/punto-venta-bodega.service';
import { Component, OnInit } from '@angular/core';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { BodegaService } from 'src/app/_servicio/sistema/bodega.service';
import { Bodega } from 'src/app/_dominio/sistema/bodega';
import { FormControl, FormGroup, Validators } from '@angular/forms';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'bodega': new FormControl(dataItem.bodega, Validators.required),
    'principal': new FormControl(dataItem.principal, Validators.required),
    'activo': new FormControl(dataItem.activo)
});

@Component({
    selector: 'app-asignacion-bodega',
    templateUrl: './asignacion-bodega.component.html',
    styleUrls: ['./asignacion-bodega.component.scss']
})
export class AsignacionBodegaComponent implements OnInit {

    public puntoVenta: PuntoVenta;
    public bodegasCatalogo: Bodega[] = [];
    public bodegasAsociadas: PuntoVentaBodega[] = [];
    public bodegaSeleccionada: Bodega;

    public formGroup: FormGroup;
    private editedRowIndex: number;

    constructor(
        private _notificarService: NotificarService,
        private _bodegaService: BodegaService,
        private _puntoVBService: PuntoVentaBodegaService,
    ) { }

    ngOnInit(): void {
        this._puntoVBService.puntoVentaBodegaCambio.subscribe(data =>{
            this.bodegasAsociadas = data;
        });
        this.listarBodegasCatalogo();
        this.listarBodegasConfiguradas();
    }

    private listarBodegasCatalogo() {
        this._bodegaService.listarTodosActivos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.bodegasCatalogo = data;
        });
    }

    private listarBodegasConfiguradas() {
        this._puntoVBService.listarBodegasPorPuntoVenta(this.puntoVenta.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.bodegasAsociadas = data;
        });
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }) {
        const bodega: PuntoVentaBodega = formGroup.value;
        bodega.puntoVenta = this.puntoVenta;
        if (isNew) {
            this._puntoVBService.registrar(bodega).pipe(switchMap(() => {
                return this._puntoVBService.listarBodegasPorPuntoVenta(this.puntoVenta.id);
            })).subscribe(data => {
                this.onComplete('Bodega registrado', data);
            });
        } else {
            this._puntoVBService.modificar(bodega).pipe(switchMap(() => {
                return this._puntoVBService.listarBodegasPorPuntoVenta(this.puntoVenta.id);
            })).subscribe(data => {
                this.onComplete('Bodega modificado', data);
            });
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


    private onComplete(mensaje: string, data: any) {
        this._notificarService.desactivarLoading();
        this._puntoVBService.puntoVentaBodegaCambio.next(data);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public agregarBodega() {
        if (this.bodegaSeleccionada !== undefined) {
            let pvtBodega = new PuntoVentaBodega();
            pvtBodega.puntoVenta = this.puntoVenta;
            pvtBodega.bodega = this.bodegaSeleccionada;
            this._puntoVBService.registrar(pvtBodega).pipe(switchMap(() => {
                return this._puntoVBService.listarBodegasPorPuntoVenta(this.puntoVenta.id);
            })).subscribe(data => {
                this.onComplete("Bodega Agregada", data);
            })
        }
    }


}
