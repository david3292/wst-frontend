import { Component, OnInit } from '@angular/core';
import { GuiaDespachoDTO } from 'src/app/_dto/logistica/guiaDespachoDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-consulta-guia-despacho-resultado-dialogo',
    templateUrl: './consulta-guia-despacho-resultado-dialogo.component.html',
    styleUrls: ['./consulta-guia-despacho-resultado-dialogo.component.scss']
})
export class ConsultaGuiaDespachoResultadoDialogoComponent implements OnInit {

    public guias: GuiaDespachoDTO[] = [];

    constructor(
        private _notificarService: NotificarService,
        private _guiaDespachoService: GuiaDespachoService,
        private _fechaService: FechaService,
    ) { }

    ngOnInit(): void {
    }

    public descargar(guia: GuiaDespachoDTO) {
        this._guiaDespachoService.generarReporte(guia.idGuiaDespacho).subscribe(data => {
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
