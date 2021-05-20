import { Component, OnInit } from '@angular/core';
import { CobroChequePosfechadoDTO } from 'src/app/_dominio/cobros/cobroChequePosfechadoDTO';
import { ChequePosfechadoService } from 'src/app/_servicio/cobros/cheque-posfechado.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from "lodash";
import { FechaService } from 'src/app/_servicio/fecha-service';
import { CobroChequePosfechadoAprobacionDTO } from 'src/app/_dominio/cobros/cobroChequePosfechadoAprobacionDTO';

@Component({
    selector: 'app-cheque-posfechado-resultado',
    templateUrl: './cheque-posfechado-resultado.component.html',
    styleUrls: ['./cheque-posfechado-resultado.component.scss']
})
export class ChequePosfechadoResultadoComponent implements OnInit {
    /* Datos Recibidos */
    public chequesProcesados: CobroChequePosfechadoDTO[] = [];
    public chequesProcesadosAprobacion: CobroChequePosfechadoAprobacionDTO[] = [];

    constructor(
        private _chequePosfechadoService: ChequePosfechadoService,
        private _notificarService: NotificarService,
        private _fechaService: FechaService
    ) { }

    ngOnInit(): void {
    }

    public descargarReporte() {
        this._chequePosfechadoService.generarReporte(this.obtenerIds()).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `WSTPosfechados_${this._fechaService.fechaActual()}`;
            a.click();
        })
    }

    private obtenerIds(): number[] {
        const ids: number[] = [];
        if(this.chequesProcesados.length > 0){
            _.forEach(this.chequesProcesados, (o) => { ids.push(o.chequePosfechadoId) });
        }

        if(this.chequesProcesadosAprobacion.length > 0){
            _.forEach(this.chequesProcesadosAprobacion, (o) => { ids.push(o.dto.chequePosfechadoId) });
        }
        return ids;
    }
}
