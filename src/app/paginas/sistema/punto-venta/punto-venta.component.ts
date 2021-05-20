import { switchMap } from 'rxjs/operators';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaService } from './../../../_servicio/sistema/punto-venta.service';
import { PuntoVenta } from './../../../_dominio/sistema/puntoVenta';
import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { AsignacionBodegaComponent } from './asignacion-bodega/asignacion-bodega.component';
import { AsignacionFormaPagoComponent } from './asignacion-forma-pago/asignacion-forma-pago.component';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'direccion': new FormControl(dataItem.direccion, Validators.required),
    'nombre': new FormControl(dataItem.nombre, Validators.required),
    'ubicacion': new FormControl(dataItem.ubicacion, Validators.required),
    'activo': new FormControl(dataItem.activo),
    'puntoEmision': new FormControl(dataItem.puntoEmision, Validators.required)
});

@Component({
    selector: "app-punto-venta",
    templateUrl: "./punto-venta.component.html",
    styleUrls: ["./punto-venta.component.scss"],
})
export class PuntoVentaComponent implements OnInit {

    puntosVenta: PuntoVenta[];

    public formGroup: FormGroup;
    public editedRowIndex: number;

    @ViewChild("containerAsignacionBodega", { read: ViewContainerRef })
    public containerAsignacionBodegaRef: ViewContainerRef;
    @ViewChild("containerAsignacionFormaPago", { read: ViewContainerRef })
    public containerAsignacionFormaPagoRef: ViewContainerRef;

    constructor(
        private _puntoVentaService: PuntoVentaService,
        private _notificarService: NotificarService,
        private dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this._puntoVentaService.listarTodos().subscribe(data => {
            this._notificarService.loadingCambio.next(false);
            this.puntosVenta = data;
        });
        this._puntoVentaService.puntosVentaCambio.subscribe(data => {
            this.puntosVenta = data;
        })
    }

    public addHandler({sender}) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': '0',
            'direccion': '',
            'nombre': '',
            'ubicacion': '',
            'activo': true,
            'puntoEmision':''
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({sender, rowIndex, formGroup, isNew}) {
        const puntoVenta: PuntoVenta = formGroup.value;
        if(isNew){
            this._puntoVentaService.registrar(puntoVenta).pipe(switchMap(() => {
                return this._puntoVentaService.listarTodos();
            })).subscribe(data => {
                this.onComplete('Punto de venta registrado', data);
            });
        }else{
            this._puntoVentaService.modificar(puntoVenta).pipe(switchMap(() => {
                return this._puntoVentaService.listarTodos();
            })).subscribe(data => {
                this.onComplete('Punto de venta modificado', data);
            });
        }
        sender.closeRow(rowIndex);
    }

    public editHandler({sender, rowIndex, dataItem}) {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;

        sender.editRow(rowIndex, this.formGroup);
    }

    public cancelHandler({sender, rowIndex}) {
        this.closeEditor(sender, rowIndex);
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    private onComplete(mensaje: string, data: any){
        this._notificarService.desactivarLoading();
        this._puntoVentaService.puntosVentaCambio.next(data);
        this.editedRowIndex = undefined;
        this._notificarService.mensajeRequest.next({detalle:mensaje, tipo:'success'});
    }

    public colorBadge(activo: boolean){
        if(activo) return ['badge-success'];
        else return ['badge-danger'];
    }

    public abrirAsignarBodegaDialogo(value) {
        const dialogRefAsignacionBodega = this.dialogService.open({
            appendTo: this.containerAsignacionBodegaRef,
            content: AsignacionBodegaComponent,
            minWidth: 400,
            maxWidth: 600,
            title: 'Asignar Bodega',
        });
        const asignarBodega = dialogRefAsignacionBodega.content.instance;
        asignarBodega.puntoVenta = value;
    }

    public abrirAsignarFormaPagoDialogo(value) {
        const dialogRefAsignacionFormaPago = this.dialogService.open({
            appendTo: this.containerAsignacionFormaPagoRef,
            content: AsignacionFormaPagoComponent,
            minWidth: 600,
            maxWidth: 700,
            title: 'Formas de Pago',
        });
        const asignarBodega = dialogRefAsignacionFormaPago.content.instance;
        asignarBodega.puntoVenta = value;
    }
}
