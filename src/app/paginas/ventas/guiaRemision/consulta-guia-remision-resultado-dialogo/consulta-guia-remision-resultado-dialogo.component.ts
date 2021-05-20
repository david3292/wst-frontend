import { Component, OnInit } from '@angular/core';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';
import { GuiaRemisionService } from 'src/app/_servicio/ventas/guia-remision.service';

@Component({
    selector: 'app-consulta-guia-remision-resultado-dialogo',
    templateUrl: './consulta-guia-remision-resultado-dialogo.component.html',
    styleUrls: ['./consulta-guia-remision-resultado-dialogo.component.scss']
})
export class ConsultaGuiaRemisionResultadoDialogoComponent implements OnInit {

    public facturas: any[] = [];

    private guiaRemisionSeleccionada: any;

    constructor(
        private _notificarService: NotificarService,
        private _guiaRemisionService: GuiaRemisionService,
        private _transferenciaService: TransferenciasService,
        private _guiaDespachoService: GuiaDespachoService
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

    generarReporte(dataItem: any){
        this.guiaRemisionSeleccionada = dataItem;

        this._guiaRemisionService.obtenerInfoGuiaRemision(dataItem.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            if(data.mensaje === 'OK'){
                if(data.tipoDocumento === 'GUIA_DESPACHO')
                    this._guiaDespachoService.generarReporteGuiaRemision(data.guiaRemisionId).subscribe(data => this.descargarReporte(data));
                else
                    this._transferenciaService.generarReporteGuiaRemision(data.documentoPadreId).subscribe(data => this.descargarReporte(data));
            }else{
                this.guiaRemisionSeleccionada = undefined;
                this._notificarService.mostrarMensajeError('Error al generar el reporte');
            }
        });
    }

    private descargarReporte(data: any){
        this._notificarService.desactivarLoading();
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Guia_Remision_${this.guiaRemisionSeleccionada.numero}`;
        this.guiaRemisionSeleccionada = undefined;
        a.click();

    }
}
