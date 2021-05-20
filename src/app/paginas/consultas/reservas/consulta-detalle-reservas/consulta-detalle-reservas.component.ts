import { Component, Input, OnInit } from '@angular/core';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';

@Component({
    selector: 'app-consulta-detalle-reservas',
    templateUrl: './consulta-detalle-reservas.component.html',
    styleUrls: ['./consulta-detalle-reservas.component.scss']
})
export class ConsultaDetalleReservasComponent implements OnInit {

    /* Parametros recibidos */
    @Input() public item: any;

    public gridView: GridDataResult;
    public state: State = {
        skip: 0,
        take: 7,
        sort: [],
    }

    public detalle: any[] = [];

    constructor(
        private _notificarService: NotificarService,
        private _reservaService: ReservaService
    ) { }

    ngOnInit(): void {
        this.consultarDetalle();
    }

    private consultarDetalle() {
        debugger
        this._reservaService.obtenerDetallePorReservaId(this.item.reservaId).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.detalle = data;
            this.gridView = process(this.detalle, this.state);
        })
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridView = process(this.detalle, this.state);
    }

}
