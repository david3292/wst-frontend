import {Component, OnInit} from '@angular/core';
import {DataStateChangeEvent, GridDataResult, RowArgs, SelectableSettings} from '@progress/kendo-angular-grid';
import {NotificarService} from '../../../_servicio/notificar.service';
import {FechaService} from '../../../_servicio/fecha-service';
import {FacturaService} from '../../../_servicio/ventas/factura.service';
import {process, State} from '@progress/kendo-data-query';
import {DocumentoFactura} from '../../../_dominio/ventas/documentoFactura';
import {Router} from '@angular/router';
import {NotaCreditoService} from '../../../_servicio/ventas/nota-credito.service';

@Component({
    selector: 'app-devolucion',
    templateUrl: './devolucion.component.html',
    styleUrls: ['./devolucion.component.scss']
})
export class DevolucionComponent implements OnInit {

    public gridDocumentosView: GridDataResult;
    public selectableSettings: SelectableSettings;
    public itemSeleccionado: any[] = [];
    public documentosLista: DocumentoFactura[] = [];
    public documentoSeleccionado: DocumentoFactura;

    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
        filter: {
            logic: 'and',
            filters: [{field: 'nombreCliente', operator: 'contains', value: ''}]
        }
    };

    constructor(
        private notificarService: NotificarService,
        private fechaService: FechaService,
        private facturaService: FacturaService,
        private router: Router,
        private notaCreditoService: NotaCreditoService
    ) {
    }

    ngOnInit(): void {
        this.selectableSettings = {
            mode: 'single'
        };
        this.facturaService.facturasDevolver.subscribe(data => {
            this.documentosLista = data;
            this.gridDocumentosView = process(data, this.state);
        });
        this.listarFacturas();
    }

    private listarFacturas() {
        this.facturaService.listarTodasEmitidasPorUsuarioYPuntoVenta().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.documentosLista = data;
            this.gridDocumentosView = process(data, this.state);
        });
    }

    public eventoSeleccion(context: RowArgs): any {
        return context.dataItem;
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridDocumentosView = process(this.documentosLista, this.state);
    }

    public formatearFecha(fecha: any) {
        return this.fechaService.formatearFecha(fecha);
    }

    public nuevaDevolucion(value: DocumentoFactura) {
        this.notaCreditoService.validarDevolucionesEnRevision(value.id).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            const tieneDevoluciones = data;
            if (tieneDevoluciones) {
                this.notificarService.desactivarLoading();
                this.notificarService.mostrarMensajeError('Ye existe una devolución pendiente con estado de Revisión.');
                return false;
            }

            this.documentoSeleccionado = value;
            this.notificarService.desactivarLoading();
            const url = `/ventas/devolucion/${this.documentoSeleccionado.id}`;
            this.router.navigate([url]);
        });
    }
}
