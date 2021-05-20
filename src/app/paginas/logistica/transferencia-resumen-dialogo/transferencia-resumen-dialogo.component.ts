import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-transferencia-resumen-dialogo',
    templateUrl: './transferencia-resumen-dialogo.component.html',
    styleUrls: ['./transferencia-resumen-dialogo.component.scss']
})
export class TransferenciaResumenDialogoComponent implements OnInit {

    public datosResumen: any;
    public tipo: string = '';
    public transferenciaSalidaId: number;

    constructor(
        private router: Router,
        private _transferenciasService: TransferenciasService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
    }

    descargarDocumento(){
        let guiaRemision = <DocumentoGuiaRemision> this.datosResumen.objeto;
        this._transferenciasService.generarReporteGuiaTransferenciaSalida(this.transferenciaSalidaId).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Transferencia_${this.datosResumen.tranferenciaCreada}`;
            a.click();
        });
    }

    descargarDocumentoEntrada(){
        this._transferenciasService.generarReporteGuiaTransferenciaEntrada(this.transferenciaSalidaId).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Transferencia_${this.datosResumen.tranferenciaCreada}`;
            a.click();
        });
    }

    aceptar(){
        this.router.navigate(['/transferencias/overview']);
    }
}
