import { Component, OnInit } from '@angular/core';
import { FacturaDTO } from 'src/app/_dominio/ventas/facturaDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-factura-resultado-dialogo',
    templateUrl: './factura-resultado-dialogo.component.html',
    styleUrls: ['./factura-resultado-dialogo.component.scss']
})
export class FacturaResultadoDialogoComponent implements OnInit {

    public resultado: FacturaDTO;
    constructor(
        private _notificarService: NotificarService,
        private _guiaDespachoService: GuiaDespachoService,
        private _fechaService: FechaService
    ) { }

    ngOnInit(): void {
    }

    public descargarDocumento() {
        this._guiaDespachoService.generarReportePorFacturaID(this.resultado.idFactura).subscribe(data => {
            this._notificarService.loadingCambio.next(false);
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `WSTGuiaD_${this._fechaService.fechaActual()}`;
            a.click();
        })
    }

}
