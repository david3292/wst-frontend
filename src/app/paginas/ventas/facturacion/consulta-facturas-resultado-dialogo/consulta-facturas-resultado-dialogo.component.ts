import { Component, OnInit } from '@angular/core';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FacturaService } from 'src/app/_servicio/ventas/factura.service';

@Component({
    selector: 'app-consulta-facturas-resultado-dialogo',
    templateUrl: './consulta-facturas-resultado-dialogo.component.html',
    styleUrls: ['./consulta-facturas-resultado-dialogo.component.scss']
})
export class ConsultaFacturasResultadoDialogoComponent implements OnInit {

    public facturas: FacturaDTO[] = [];
    public mensaje: string;


    constructor(
        private _notificarService: NotificarService,
        private _facturaService: FacturaService,
    ) { }

    ngOnInit(): void {
    }

    public visualizarNumero(dataItem: FacturaDTO) {
        if (dataItem.numeroFactura === '' || dataItem.numeroFactura === null) {
            return 'Sin Número';
        } else {
            return dataItem.numeroFactura;
        }
    }

    public descargar(dataItem: FacturaDTO) {
        this._facturaService.generarReporte(dataItem.numeroFactura).subscribe(data => {
            this._notificarService.loadingCambio.next(false);
            if(data.size > 0){
                const file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                a.download = `${dataItem.numeroFactura}_ride`;
                a.click();
            }else{
                this.mensaje = 'Reporte no disponible';
            }
        })
    }
}
