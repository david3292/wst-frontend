import { AprobacionService } from './../../../_servicio/ventas/aprobacion.service';
import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { AprobacionDocumento } from 'src/app/_dominio/ventas/aprobacionDocumento';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { switchMap } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { process, State } from '@progress/kendo-data-query';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import { OrdenCompraDetalleDTO } from 'src/app/_dto/compras/ordenCompraDetalleDTO';
import * as _ from 'lodash';

@Component({
    selector: 'app-vista-general-aprobaciones',
    templateUrl: './vista-general-aprobaciones.component.html',
    styleUrls: ['./vista-general-aprobaciones.component.scss']
})
export class VistaGeneralAprobacionesComponent implements OnInit {

    public solicitudes: AprobacionDocumento[] = [];
    public ordenesCompraAprobacion: OrdenCompraDTO[] = [];
    public ordenCompraDetallesAprobacion: OrdenCompraDetalleDTO[] = [];

    public verOrdenesCompraAprobacion: boolean = false;
    public verOrdenCompraDetallesAprobacion: boolean = false;

    public solicitudSeleccionada: AprobacionDocumento;

    public abrirSolicitud: Boolean = false;
    public documentoSeleccionado: Cotizacion = new Cotizacion();
    public reservaFacturaSeleccionado: DocumentoReserva;

    public catalogo: any[];

    public observaciones: string;
    public opcionSeleccionado: any;
    public observacionesRequerido: boolean = false;

    public habilitarBotonDetalleCompras: boolean = false;

    public state: State = {
        skip: 0,
        take: 15,
        filter: {
            logic: 'and',
            filters: [{ field: 'documento.nombreCliente', operator: 'contains', value: '' }]
        }
    };

    public gridData: GridDataResult;

    formRespuesta = new FormGroup({
        'estado': new FormControl(null, Validators.required),
        'observaciones': new FormControl(null)
    });

    @ViewChild("containerDialogRef", { read: ViewContainerRef})
    public containerDialogRef: ViewContainerRef;

    @ViewChild("detalleComprasTemplate", { read: TemplateRef })
    public detalleComprasTemplate: TemplateRef<any>;

    constructor(private notificarService: NotificarService,
        private aprobacionService: AprobacionService,
        private comprasService: ComprasService,
        private dialogoService: DialogService) { }

    ngOnInit(): void {
        this.aprobacionService.solicitudesAprobacionCambio.subscribe(data => {
            this.solicitudes = data;
            this.gridData = process(this.solicitudes, this.state);
        });

        this.listarSolicitudes();
        this.cargarCatalogoAprobacionEstado();
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridData = process(this.solicitudes, this.state);
    }

    public listarSolicitudes() {
        this.aprobacionService.listarSolicitudesPendientesPorPerfil().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.solicitudes = data;
            this.gridData = process(this.solicitudes, this.state);
        });
    }

    public abrirSolicitudDetalle(value) {
        this.formRespuesta.reset();
        this.solicitudSeleccionada = value;
        this.documentoSeleccionado = value.cotizacion;
        if (value.reserva) {
            this.reservaFacturaSeleccionado = value.reserva;
        }
        this.abrirSolicitud = true;

        this.habilitarBotonDetalleCompras = _.filter(this.documentoSeleccionado.detalle, (d) => {
            return d.generaCompra;
        }).length > 0;
    }

    private cargarCatalogoAprobacionEstado() {
        this.aprobacionService.obtenerCatalogoEstado().subscribe(data => {
            this.catalogo = data;
        })
    }

    public enviarRespuesta() {
        let respuesta = new AprobacionDocumento();
        respuesta.id = this.solicitudSeleccionada.id;
        respuesta.cotizacion = new Cotizacion();
        respuesta.cotizacion.id = this.documentoSeleccionado.id;
        respuesta.estado = this.formRespuesta.value['estado'];
        respuesta.observacion = this.formRespuesta.value['observaciones'];
        if (this.solicitudSeleccionada.factura !== null) {
            this.procesarSolicitudFactura(respuesta);
        } else if (this.solicitudSeleccionada.reserva !== null) {
            this.procesarSolicitudReserva(respuesta);
        } else {
            this.procesarSolicitudCotizacion(respuesta);
        }
        if(respuesta.estado === 'APROBAR')
            this.aprobarCompras();
    }

    private aprobarCompras(){
        this.comprasService.aprobarComprasPorCotizacionId(this.documentoSeleccionado.id).subscribe();
    }

    private procesarSolicitudFactura(respuesta: AprobacionDocumento) {
        let factura = new DocumentoFactura();
        factura.id = this.solicitudSeleccionada.factura.id;
        respuesta.factura = factura;
        this.aprobacionService.procesarSolicitudFactura(respuesta).pipe(switchMap(() => {
            return this.aprobacionService.listarSolicitudesPendientesPorPerfil();
        })).subscribe(data => {
            this.notificarMensaje("Solicitud Procesada.");
            this.cerrarSolicitud();
            this.aprobacionService.solicitudesAprobacionCambio.next(data);
        })
    }

    private procesarSolicitudReserva(respuesta: AprobacionDocumento) {

        let reserva = new DocumentoReserva();
        reserva.id = this.solicitudSeleccionada.reserva.id;
        respuesta.reserva = reserva;
        this.aprobacionService.procesarSolicitudReserva(respuesta).pipe(switchMap(() => {
            return this.aprobacionService.listarSolicitudesPendientesPorPerfil();
        })).subscribe(data => {
            this.notificarMensaje("Solicitud Procesada.");
            this.cerrarSolicitud();
            this.aprobacionService.solicitudesAprobacionCambio.next(data);
        })
    }

    private procesarSolicitudCotizacion(respuesta: AprobacionDocumento) {
        this.aprobacionService.procesarSolicitudCotizacion(respuesta).pipe(switchMap(() => {
            return this.aprobacionService.listarSolicitudesPendientesPorPerfil();
        })).subscribe(data => {
            this.notificarMensaje("Solicitud Procesada.");
            this.cerrarSolicitud();
            this.aprobacionService.solicitudesAprobacionCambio.next(data);
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


    public cerrarSolicitud() {
        this.abrirSolicitud = false;
        this.documentoSeleccionado = null;
        this.reservaFacturaSeleccionado = null;
    }

    notificarMensaje(mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    abrirDetalleCompras(){
        this.comprasService.obtenerDetallesComprasAprobacionPorCotizacionId(this.documentoSeleccionado.id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.ordenesCompraAprobacion = data.ordenesCompra;
            this.ordenCompraDetallesAprobacion = data.detallesCompra;

            this.verOrdenesCompraAprobacion = this.ordenesCompraAprobacion.length > 0;
            this.verOrdenCompraDetallesAprobacion = this.ordenCompraDetallesAprobacion.length > 0;

            const dialogoComprasAprobaciones = this.dialogoService.open({
                appendTo: this.containerDialogRef,
                title: 'Detalles Compras',
                content: this.detalleComprasTemplate,
                minWidth: 300,
                maxWidth: '80%',
                actions: [
                    { text: 'Aceptar', primary: true }
                ]
            });

            dialogoComprasAprobaciones.result.subscribe((result) => {
                if(result instanceof DialogCloseResult){
                    this.ordenesCompraAprobacion = [];
                    this.ordenCompraDetallesAprobacion = [];
                }
                else if(result['text'] === 'Aceptar'){
                    this.ordenesCompraAprobacion = [];
                    this.ordenCompraDetallesAprobacion = [];
                }
            });

        });
    }
}
