import { Component, OnInit } from '@angular/core';
import { DocumentoGuiaDespacho } from 'src/app/_dominio/logistica/documentoGuiaDespacho';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-resumen-despacho',
    templateUrl: './resumen-despacho.component.html',
    styleUrls: ['./resumen-despacho.component.scss']
})
export class ResumenDespachoComponent implements OnInit {

    public guiaDespacho: DocumentoGuiaDespacho;
    public dataResumen: any;
    public respuestaConGuiaRemision: boolean = false;
    public guiaRemision: DocumentoGuiaRemision;

    constructor(
        private _guiaDespachoService: GuiaDespachoService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
    }

    public validarRespuesta(){
        if(this.dataResumen.guiaRemision !== null)
            this.respuestaConGuiaRemision = true;
    }

    public descargarDocumento(){
        this._guiaDespachoService.generarReporteCliente(this.guiaDespacho.id, this.guiaRemision).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Despacho_${this.guiaDespacho.numero}`;
            a.click();
        });
    }
}
