import { switchMap } from 'rxjs/operators';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionService } from 'src/app/_servicio/ventas/cotizacion.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ReservaDetalleDTO } from 'src/app/_dto/ventas/reservaDetalleDTO';
import { DialogService } from '@progress/kendo-angular-dialog';
import { PickingDialogoComponent } from './picking-dialogo/picking-dialogo.component';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';
import { DocumentoReserva } from 'src/app/_dominio/ventas/documentoReserva';

@Component({
    selector: 'app-reserva',
    templateUrl: './reserva.component.html',
    styleUrls: ['./reserva.component.scss']
})
export class ReservaComponent implements OnInit {

    private idCotizacion: number;
    public cotizacion: Cotizacion;
    public detalle: ReservaDetalleDTO[] = [];

    public abono: number;
    public fechaMaximaReserva: string;
    public tiempoMaximoAbono: string;
    private fechaMaximaReservaObj: any;

    @ViewChild("containerPicking", { read: ViewContainerRef })
    public containerPickingRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cotizacionService: CotizacionService,
        private reservaService: ReservaService,
        private fechaService: FechaService,
        private notificarService: NotificarService,
        private dialogService: DialogService) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.idCotizacion = params['id'];
            this.recuperarCotizacion(params['id']);
            this.obtenerFechaMaximaReserva();
            this.porcentajeAbono();
            this.recuperarReserva();
        });
        this.reservaService.reservaCambio.subscribe(data => {
            this.matchReservaCotizacionDetalle(data);
        });
    }

    private obtenerFechaMaximaReserva() {
        this.reservaService.obtenerFechaMaximaReserva().subscribe(data => {
            this.fechaMaximaReserva = this.fechaService.formatearFechaYHora(data);
            this.fechaMaximaReservaObj = data;
        });
    }

    private porcentajeAbono() {
        this.reservaService.obtenerPorcentajeAbono().subscribe(data => {
            this.abono = Number(data);
        });
    }

    private recuperarCotizacion(id: number) {
        this.cotizacionService.listarPorId(id).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.cotizacion = data;
            this.convertirDetalle(this.cotizacion.detalle);
        })
    }

    private recuperarReserva() {
        this.reservaService.listarPorCotizacionID(this.idCotizacion).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.reservaService.reservaCambio.next(data);
        });
    }

    private convertirDetalle(data: CotizacionDetalle[]) {
        data.map(x => {
            let item = new ReservaDetalleDTO();
            item.cotizacionDetalle = x;
            this.detalle.push(item);
        });
    }

    private matchReservaCotizacionDetalle(data: DocumentoReserva) {
        if (data !== null) {
            this.detalle.map(x => {
                data.detalle.map(y => {
                    if (x.cotizacionDetalle.id == y.cotizacionDetalle.id) {
                        x.cantidadReservada = y.cantidad;
                    }
                });
            });
        }
    }

    public abrirPickingDialogo(value: ReservaDetalleDTO) {
        const dialogRefArticulo = this.dialogService.open({
            appendTo: this.containerPickingRef,
            content: PickingDialogoComponent,
            minWidth: 700,
            maxWidth: '98%',
        });
        const picking = dialogRefArticulo.content.instance;
        picking.cotizacion = this.cotizacion;
        picking.item = value.cotizacionDetalle;
    }

    public enviarAprobar() {
        let reserva = new DocumentoReserva();
        reserva.cotizacion = this.cotizacion;
        delete reserva.cotizacion['formaPagoCadena'];
        reserva.fechaMaximaReserva = this.fechaMaximaReserva;
        reserva.porcentajeAbono = this.abono;
        this.reservaService.enviarAprobarReserva(reserva).pipe(switchMap(() => {
            return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
        })).subscribe(data => {
            this.cotizacionService.cotizacionCambio.next(data);
            this.notificaMensaje("Reserva enviado a APROBACIÓN");
            this.router.navigate(['ventas/overview']);
        })
    }

    private notificaMensaje(mensaje: string) {
        this.notificarService.desactivarLoading();
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public anular() {

    }

}
