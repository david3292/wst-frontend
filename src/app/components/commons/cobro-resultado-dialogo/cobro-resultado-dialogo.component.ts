import { Component, OnInit } from '@angular/core';
import { CobroDTO } from 'src/app/_dominio/cobros/cobroDTO';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-cobro-resultado-dialogo',
    templateUrl: './cobro-resultado-dialogo.component.html',
    styleUrls: ['./cobro-resultado-dialogo.component.scss']
})
export class CobroResultadoDialogoComponent implements OnInit {

    public resultado: CobroDTO;

    constructor(
        private _notificarService: NotificarService,
        private _guiaDespachoService: GuiaDespachoService,
        private _fechaService: FechaService,
        private _cobroService: CobroService
    ) { }

    ngOnInit(): void {
    }

    public descargarDocumento() {
        this.resultado.guiaDespachoIds.map(x => {
            this._guiaDespachoService.generarReporte(x).subscribe(data => {
                this._notificarService.loadingCambio.next(false);
                const file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                a.download = `WSTGuiaD_${this._fechaService.fechaActual()}`;
                a.click();
            })
        })
    }

    public descargarReporte() {
        this._cobroService.generarReporte(this.resultado.numero).subscribe(data => {
            this._notificarService.loadingCambio.next(false);
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `WST-CobroResumen_${this._fechaService.fechaActual()}`;
            a.click();
        })
    }

}
