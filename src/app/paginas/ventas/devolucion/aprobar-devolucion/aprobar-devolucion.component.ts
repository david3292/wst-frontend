import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { switchMap } from 'rxjs/operators';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { DocumentoNotaCredito } from 'src/app/_dominio/ventas/documentoNotaCredito';
import { NotaCreditoDTO } from 'src/app/_dto/ventas/notaCreditoDTO';
import { NotaCreditoSolicitudRespuestaDTO } from 'src/app/_dto/ventas/notaCreditoSolicitudRespuestaDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FinanzasService } from 'src/app/_servicio/utilidades/finanzas.service';
import { AprobacionService } from 'src/app/_servicio/ventas/aprobacion.service';
import { NotaCreditoService } from 'src/app/_servicio/ventas/nota-credito.service';


const FLUJO_APROBACION_BODEGA: string = 'BODEGA';
const FLUJO_APROBACION_COMERCIAL: string = 'COMERCIAL';

@Component({
    selector: 'app-aprobar-devolucion',
    templateUrl: './aprobar-devolucion.component.html',
    styleUrls: ['./aprobar-devolucion.component.scss']
})
export class AprobarDevolucionComponent implements OnInit {

    public tipo_flujo_aprobacion: string;
    public titulo: string;
    public mensajeError: string;

    public devoluciones: NotaCreditoDTO[] = [];
    public state: State = {
        skip: 0,
        take: 20,
        filter: {
            logic: 'and',
            filters: [{ field: 'cotizacionNumero', operator: 'contains', value: '' }]
        }
    }
    public gridDataDevoluciones: GridDataResult;

    public abrirSolicitud: Boolean = false;
    public solicitudSeleccionada: NotaCreditoDTO;
    public notaCredito: DocumentoNotaCredito;

    formRespuesta = new FormGroup({
        'estado': new FormControl(null, Validators.required),
        'observaciones': new FormControl(null)
    });
    public observacionesRequerido: boolean = false;
    public catalogo: any[];

    public fechaNueva: string;

    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;

    constructor(
        private _route: ActivatedRoute,
        private _notificacionService: NotificarService,
        private _notaCreditoService: NotaCreditoService,
        private _aprobacionService: AprobacionService,
        private _dialogService: DialogService,
        public _fechaService: FechaService,
        public _finanzasService: FinanzasService
    ) { }

    ngOnInit(): void {
        this._route.params.subscribe((params: Params) => {
            if (params['tipo_flujo'] === 'bodega') {
                this.tipo_flujo_aprobacion = FLUJO_APROBACION_BODEGA;
                this.titulo = 'Aprobación Devolución de Bodega';
            } else if (params['tipo_flujo'] === 'comercial') {
                this.tipo_flujo_aprobacion = FLUJO_APROBACION_COMERCIAL;
                this.titulo = 'Aprobación Devolución de Comercial';
            }
            this._notaCreditoService.solicitudesDevolucionesCambio.subscribe(data => {
                this.devoluciones = data;
                this.gridDataDevoluciones = process(this.devoluciones, this.state);
            })
            this.cargarDatos();
            this.cargarCatalogoAprobacionEstado();
        });
        this.fechaNueva = this._fechaService.fechaActual();
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridDataDevoluciones = process(this.devoluciones, this.state);
    }

    public cargarDatos() {
        this._notaCreditoService.listarDevoluciones(this.tipo_flujo_aprobacion).subscribe(data => {
            this._notificacionService.desactivarLoading();
            this.devoluciones = data;
            this.gridDataDevoluciones = process(this.devoluciones, this.state);
        });
    }

    public abrirSolicitudDetalle(value: NotaCreditoDTO) {
        /* Buscar la nota de credito */
        this._notaCreditoService.buscarPorId(value.id).subscribe(data => {
            this._notificacionService.desactivarLoading();
            if (data !== null) {
                this.notaCredito = data;
                this.solicitudSeleccionada = value;
                this.abrirSolicitud = true;
            }
        })

    }

    public cerrarSolicitud() {
        this.abrirSolicitud = false;
        this.notaCredito = undefined;
        this.solicitudSeleccionada = undefined;
        this.formRespuesta.reset();
    }

    private cargarCatalogoAprobacionEstado() {
        this._aprobacionService.obtenerCatalogoEstado().subscribe(data => {
            this.catalogo = data;
        })
    }

    public changeValueAprobar(valorSeleccionado: any) {
        this.formRespuesta.get('observaciones').clearValidators();
        this.formRespuesta.get('observaciones').updateValueAndValidity();
        this.observacionesRequerido = false;
        switch (valorSeleccionado.value) {
            case 'RECHAZAR':
                this.formRespuesta.controls["observaciones"].setValidators([Validators.required]);
                this.observacionesRequerido = true;
                break;
            default: break;
        }
    }

    public enviarRespuesta() {
        let respuesta = new NotaCreditoSolicitudRespuestaDTO();
        respuesta.notaCreditoId = this.solicitudSeleccionada.id;
        respuesta.comentario = this.formRespuesta.value['observaciones'];
        respuesta.estado = this.formRespuesta.value['estado'];
        respuesta.flujoAprobacion = this.tipo_flujo_aprobacion;
        this._notaCreditoService.responderSolicitudDevolucion(respuesta).pipe(switchMap(() => {
            return this._notaCreditoService.listarDevoluciones(this.tipo_flujo_aprobacion);
        })).subscribe(data => {
            this._notificacionService.desactivarLoading();
            this._notificacionService.mostrarMensajeExito("Solicitud Procesada.");
            this.cerrarSolicitud();
            this._notaCreditoService.solicitudesDevolucionesCambio.next(data);
        })
    }

    public desactivarEdicionValor() {
        return this.tipo_flujo_aprobacion === FLUJO_APROBACION_BODEGA ? false : true;
    }

    public actualizarCantidad(dataItem: DocumentoDetalle) {
        if (dataItem.cantidad === null) {
            this.mensajeError = 'Favor digite la(s) cantidad(es) a devolver.'
        } else {
            this.mensajeError = undefined;
            if (dataItem.cantidad < dataItem.saldo) {
                this.mostrarConfirmacion(dataItem);
            }
        }
    }

    public mostrarConfirmacion(dataItem: DocumentoDetalle) {
        let mensaje: string = `¿ Está seguro de modificar la cantidad a recibir del artículo ${dataItem.cotizacionDetalle.codigoArticulo} ${dataItem.cotizacionDetalle.descripcionArticulo} ?`;
        const dialog: DialogRef = this._dialogService.open({
            appendTo: this.containerConfirmacionRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 200,
            minWidth: 200
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this._notaCreditoService.actualizarLineaDetalle(this.solicitudSeleccionada.id, dataItem).subscribe(data => {
                        this._notificacionService.desactivarLoading();
                        this._notificacionService.mostrarMensajeExito('Cantidad Modificada');
                        this.notaCredito = data;
                    })
                } else {
                    dataItem.cantidad = dataItem.saldo;
                }
            }
        });
    }
}
