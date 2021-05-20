import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Caja } from 'src/app/_dominio/cobros/caja';
import { CajaDetalle } from 'src/app/_dominio/cobros/cajaDetalle';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { CierreCajaService } from 'src/app/_servicio/cobros/cierre-caja.service';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { SessionService } from 'src/app/_servicio/session.service';
import { EditarCierreCajaService } from './editarCierreCajaService';

@Component({
    selector: 'app-cierre-caja',
    templateUrl: './cierre-caja.component.html',
    styleUrls: ['./cierre-caja.component.scss']
})
export class CierreCajaComponent implements OnInit {

    public puntoVenta: PuntoVenta;
    public puntoVentaNombre: string;
    public usuario: string;
    public fecha: string;
    public ultimoCierre: string;
    public hablititarCerrarCaja: boolean = true;

    public totalCobrado: number = 0;
    public totalContado: number = 0;
    public totalDiferencia: number = 0;

    public view: Observable<GridDataResult>;
    public detalle: CajaDetalle[] = [];
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 20
    };

    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;

    constructor(
        private formBuilder: FormBuilder,
        private _notificarService: NotificarService,
        private _cierreCajaService: CierreCajaService,
        public editarCierreCajaService: EditarCierreCajaService,
        public _fechaService: FechaService,
        public _sessionService: SessionService,
        private dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this.fecha = this._fechaService.fechaYHoraActual();
        this.usuario = this._sessionService.nombreUsuario();
        this.conusltarPreCierreCaja();
        this.view = this.editarCierreCajaService.pipe(map(data => process(data, this.gridState)));
        this.editarCierreCajaService.read();
    }

    private conusltarPreCierreCaja() {
        this._cierreCajaService.consultarPreCierreCaja().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.puntoVenta = data.puntoVenta;
            this.puntoVentaNombre = data.puntoVenta.nombre;
            this.ultimoCierre = data.fechaInicio;
            this.totalCobrado = data['total']
            if (data.cajaDetalles !== null) {
                this.editarCierreCajaService.next(data.cajaDetalles);
            }
        })
    }

    public onStateChange(state: State) {
        this.gridState = state;

        this.editarCierreCajaService.read();
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem, column } = args;
        if (!formGroup.valid) {
            // prevent closing the edited cell if there are invalid values.
            args.preventDefault();
        } else if (formGroup.dirty) {
            this.editarCierreCajaService.assignValues(dataItem, formGroup.value);
            this.editarCierreCajaService.update(this.calcularDiferencia(dataItem));
            this.calcularTotales();
        }
    }

    private calcularDiferencia(itemDetalle: CajaDetalle) {
        itemDetalle.diferencia = Number((itemDetalle.valorCobrado - itemDetalle.valorContado).toFixed(2));
        return itemDetalle;
    }

    private calcularTotales() {
        this.view.subscribe(data => {
            this.totalContado = 0;
            this.totalDiferencia = 0;
            data.data.map(y => {
                this.totalContado = Number((this.totalContado + y.valorContado).toFixed(2));
                this.totalDiferencia = Number((this.totalDiferencia + y.diferencia).toFixed(2));
            })
            let a = data.data.find(x => x.valorContado === null)
            this.hablititarCerrarCaja = a !== undefined ? true : false;
        })
    }

    public createFormGroup(dataItem: any): FormGroup {
        return this.formBuilder.group({
            'id': dataItem.id,
            'formaPago': [dataItem.formaPago, Validators.required],
            'valorCobrado': dataItem.valorCobrado,
            'valorContado': [dataItem.valorContado, Validators.compose([Validators.required, Validators.min(0), Validators.pattern('^[0-9]+(.[0-9]{0,2})?$')])],
            'diferencia': dataItem.diferencia,
        });
    }

    private isReadOnly(field: string): boolean {
        const readOnlyColumns = ['formaPago', 'valorCobrado', 'diferencia'];
        return readOnlyColumns.indexOf(field) > -1;
    }

    public cerrarCajar() {
        let caja = this.crearCierreCaja();
        this._cierreCajaService.cerrarCaja(caja).subscribe(data => {
            this.notificarMensaje("Cierre de caja registrado.");
            this.limpiarControles();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `cierreCaja_${this._fechaService.fechaActual()}`;
            a.click();
        })
    }

    public crearCierreCaja() {
        let caja = new Caja();
        caja.puntoVenta = this.puntoVenta;
        caja.fechaInicio = this.ultimoCierre;
        caja.fechaCierre = this.fecha;
        this.view.subscribe(data => {
            caja.cajaDetalles = data.data;
        });
        return caja;
    }

    private limpiarControles() {
        this.editarCierreCajaService.next([]);
        this.totalCobrado = 0;
        this.totalContado = 0;
        this.totalDiferencia = 0;
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    notificarMensaje(mensaje: string) {
        this._notificarService.loadingCambio.next(false);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public mostrarConfirmacion(){
        let mensaje: string = "¿ Está seguro de registrar el cierre de caja con los totales de los valores cobrados, contados y faltantes/sobrantes ?";
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 200,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this.cerrarCajar();
                }
            }
        });
    }
}
