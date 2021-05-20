import { Component, OnInit } from '@angular/core';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-consulta-transferencia-resultado-dialogo',
    templateUrl: './consulta-transferencia-resultado-dialogo.component.html',
    styleUrls: ['./consulta-transferencia-resultado-dialogo.component.scss']
})
export class ConsultaTransferenciaResultadoDialogoComponent implements OnInit {

    public facturas: any[] = [];

    private documentoSeleccionado: any;

    constructor(
        private _notificarService: NotificarService,
        private _transferenciaService: TransferenciasService
    ) { }

    ngOnInit(): void {
    }

    public visualizarNumero(dataItem: any){
        if(dataItem.numero === '' || dataItem.numero === null){
            return 'Sin Número';
        }else{
            return dataItem.numero;
        }
    }

    descargarReporteTransferencia(data: any){
        this.documentoSeleccionado = data;
        this._transferenciaService.generarReporteGuiaTransferencia(data.id).subscribe(data => {
            this._notificarService.desactivarLoading()
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            let numeroDoc = this.documentoSeleccionado.numero !== null ? `_${this.documentoSeleccionado.numero}` : '';
            a.download = `Transferencia_${numeroDoc}`;
            a.click();
        });
    }

}
