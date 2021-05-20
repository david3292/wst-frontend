import { Component, OnInit } from '@angular/core';
import { RecepcionCompraDTO } from 'src/app/_dto/compras/recepcionCompraDTO';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-consulta-recepciones-compra',
    templateUrl: './consulta-recepciones-compra.component.html',
    styleUrls: ['./consulta-recepciones-compra.component.scss']
})
export class ConsultaRecepcionesCompraComponent implements OnInit {

    public recepcionesCompra: RecepcionCompraDTO[];
    public recepcionSeleccionada: RecepcionCompraDTO;

    constructor(
        private _comprasService: ComprasService,
        private _notificarService: NotificarService,
    ) { }

    ngOnInit(): void {
    }

    generarReportePdf(recepcionCompra: RecepcionCompraDTO){
        this.recepcionSeleccionada = recepcionCompra;
        this._comprasService.generarReporteRecepcionCompra(recepcionCompra.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `RecepcionCompra_${this.recepcionSeleccionada.numeroRecepcion}`;
            a.click();
        });
    }
}
