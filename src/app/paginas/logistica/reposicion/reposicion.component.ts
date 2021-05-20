import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { forkJoin, Observable } from 'rxjs';
import { Bodega } from 'src/app/_dominio/sistema/bodega';
import { ReposicionDetalleDTO } from 'src/app/_dto/logistica/reposicionDetalleDTO';
import { ReposicionDTO } from 'src/app/_dto/logistica/reposicionDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { ReposicionService } from 'src/app/_servicio/logistica/reposicion.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ReposicionConfirmacionComponent } from './reposicion-confirmacion/reposicion-confirmacion.component';
import { ReposicionDetalleComponent } from './reposicion-detalle/reposicion-detalle.component';
import * as _ from "lodash";

@Component({
    selector: 'app-reposicion',
    templateUrl: './reposicion.component.html',
    styleUrls: ['./reposicion.component.scss']
})
export class ReposicionComponent implements OnInit {

    public bodegaOrigen: Bodega[] = [];
    public bodegaDestino: Bodega[] = [];
    public fecha: string;
    public estado: string = 'Nuevo'
    public pesoTotal: number = 0;
    public mostrarProcesar: boolean = false;

    public editForm: FormGroup = new FormGroup({
        origen: new FormControl('', Validators.required),
        destino: new FormControl('', Validators.required),
    });

    public reposicion: ReposicionDTO;
    public detalleSeleccionado: ReposicionDetalleDTO;
    public gridReposicionView: GridDataResult;
    public state: State = {
        skip: 0,
        take: 20,
        sort: [/* { field: 'ITEMDESC', dir: 'asc' } */],
        filter: {
            logic: 'and',
            filters: [{ field: 'codigoArticulo', operator: 'startswith', value: '' }]
        }
    };

    @ViewChild("reposicionDetalle", { read: ViewContainerRef })
    public reposicionDetalleRef: ViewContainerRef;
    @ViewChild("reposicionConfirmacionDetalle", { read: ViewContainerRef })
    public reposicionConfirmacionRef: ViewContainerRef;

    constructor(
        private _reposicionService: ReposicionService,
        private _notificarService: NotificarService,
        private _fechaService: FechaService,
        private _dialogService: DialogService,

    ) { }

    ngOnInit(): void {
        this.fecha = this._fechaService.fechaActual();
        this.listarBodegas().subscribe(data => {
            this.bodegaOrigen = data[0];
            this.bodegaDestino = data[1];
            this.editForm.controls['origen'].setValue('INMACONSA');
        })
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridReposicionView = process(this.reposicion.detalle, this.state);
    }

    private listarBodegas(): Observable<any[]> {
        let origen = this._reposicionService.listarBodegaCentroDistribucion();
        let destino = this._reposicionService.listarBodegaReposicionInventario();

        return forkJoin([origen, destino]);
    }

    public sugerir() {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return false;
        }
        if (this.editForm.controls['origen'].value === this.editForm.controls['destino'].value) {
            this._notificarService.mostrarMensajeError('Error las bodegas de origen y destino deben ser diferentes');
            return false;
        }

        this._reposicionService.sugerirReposicion(this.editForm.controls['origen'].value, this.editForm.controls['destino'].value).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.reposicion = data;
            console.log(this.reposicion)
            this.mostrarProcesar = true;
            if (this.reposicion)
                this.gridReposicionView = process(this.reposicion.detalle, this.state);
            else
                this.gridReposicionView = process([], this.state);
            this.calcularPesoTotal();
        })
    }

    public procesar() {
        this.abrirDialogoConfirmacion('EMITIR');
    }

    public anular() {
        this.abrirDialogoConfirmacion('ANULAR');
    }

    public onBlurCantidad(dataItem: ReposicionDetalleDTO) {
        this._reposicionService.actualizarLineaDetalle(dataItem).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data) {
                if (data['error']) {
                    this._notificarService.mostrarMensajeError(`Error. Cantidad no disponible`);
                    dataItem.cantidadReponer = data['cantidadReponerOriginal'];
                }
                if (data['nuevaCantidadDisponible'])
                    dataItem.disponibleOrigen = data['nuevaCantidadDisponible'];
                this.calcularPesoTotal();
            }
        });
    }

    public abrirDetalle(dataItem: ReposicionDetalleDTO) {
        const dialogReposicionDetalle: DialogRef = this._dialogService.open({
            appendTo: this.reposicionDetalleRef,
            title: 'Información',
            content: ReposicionDetalleComponent,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 550,
            height: 300,
            minHeight: 300,
            minWidth: 250
        });
        const detalle = dialogReposicionDetalle.content.instance;
        detalle.itemReposicion = dataItem;
    }

    public eliminarLinea(dataItem: ReposicionDetalleDTO) {
        this.detalleSeleccionado = dataItem;
        this.abrirDialogoConfirmacion('ELIMINAR_DETALLE');
    }

    private abrirDialogoConfirmacion(accion: string) {
        const dialogReposicionDetalle: DialogRef = this._dialogService.open({
            appendTo: this.reposicionConfirmacionRef,
            title: 'Confirmación',
            content: ReposicionConfirmacionComponent,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 500,
            minHeight: 150,
            minWidth: 250
        });
        const confirmacion = dialogReposicionDetalle.content.instance;
        confirmacion.accion = accion;
        confirmacion.reposicion = this.reposicion;
        confirmacion.detalle = this.detalleSeleccionado;

        dialogReposicionDetalle.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this.ejecutarOperacion(accion);
                }
            }
        });
    }

    private ejecutarOperacion(accion: string) {
        switch (accion) {
            case 'ANULAR':
                this._reposicionService.anular(this.reposicion.idReposicion).subscribe(data => {
                    this._notificarService.desactivarLoading();
                    this._notificarService.mostrarMensajeExito(`La reposición ${this.reposicion.numero} ha sido anulada`);
                    this.limpiar();
                })
                break;
            case 'EMITIR':
                this._reposicionService.emitir(this.reposicion.idReposicion).subscribe(data => {
                    this._notificarService.desactivarLoading();
                    this._notificarService.mostrarMensajeExito(`La reposición ${this.reposicion.numero} ha sido procesada`);
                    this.limpiar();
                })
                break;
            case 'ELIMINAR_DETALLE':
                this._reposicionService.eliminarDetalle(this.detalleSeleccionado.idDetalle).subscribe(data => {
                    this._notificarService.desactivarLoading();
                    this._notificarService.mostrarMensajeExito(`Detalle eliminado`);
                    this.actualizarDetalle();
                    this.detalleSeleccionado = undefined;
                    this.calcularPesoTotal();
                })
                break;
        }
    }

    private actualizarDetalle() {
        const detalleActualizado = _.remove(this.reposicion.detalle, (o) => {
            return o.idDetalle !== this.detalleSeleccionado.idDetalle;
        });

        this.reposicion.detalle = detalleActualizado;
        this.gridReposicionView = process(this.reposicion.detalle, this.state);
    }

    private limpiar() {
        this.editForm.reset();
        this.detalleSeleccionado = undefined;
        this.reposicion = undefined;
        this.gridReposicionView = process([], this.state);
        this.pesoTotal = 0;
    }

    public desactivar() {
        if (this.reposicion && this.reposicion.detalle.length > 0) {
            return false;
        }
        return true;
    }

    public desactivarAnular() {
        if (this.reposicion)
            return false;
        return true;
    }

    public calcularPesoTotalLinea(item: ReposicionDetalleDTO) {
        return _.round(_.multiply(item.peso, item.cantidadReponer), 2);
    }

    public calcularPesoTotal() {
        this.pesoTotal = _.round(_.sumBy(this.reposicion.detalle, (o) => { return _.multiply(o.peso, o.cantidadReponer) }), 2);
    }
}
