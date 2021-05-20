import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentoGuiaDespacho } from 'src/app/_dominio/logistica/documentoGuiaDespacho';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { GuiaDespachoDTO } from 'src/app/_dto/logistica/guiaDespachoDTO';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-guia-despacho-detalles-dialogo',
    templateUrl: './guia-despacho-detalles-dialogo.component.html',
    styleUrls: ['./guia-despacho-detalles-dialogo.component.scss']
})
export class GuiaDespachoDetallesDialogoComponent implements OnInit {

    @Input()
    public guiasRemision: DocumentoGuiaRemision[];
    @Input()
    public guiaDespacho: GuiaDespachoDTO;
    @Input()
    public origen: string;

    private guiaRemisionSeleccionada: DocumentoGuiaRemision;

    public habilitarControles: boolean = true;

    constructor(
        private _guiaDespachoService: GuiaDespachoService,
        private _notificarService: NotificarService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        debugger;
        if(this.origen === 'consulta')
            this.habilitarControles = false;
    }

    crearNuevoDespacho(){
        let urlGuiaDepscho = `/despachos/${this.guiaDespacho.idGuiaDespacho}`;
        this._router.navigate([urlGuiaDepscho]);
    }

    cargar(dataItem: DocumentoGuiaRemision){
        let urlGuiaDepscho = `/despachos/${dataItem.documentoPadreId}`;
        this._router.navigate([urlGuiaDepscho], {
            queryParams:{
                gr: dataItem.id
            }
        });
    }

    generarReporteGuiaRemision(guiaRemision: DocumentoGuiaRemision){
        this.guiaRemisionSeleccionada = guiaRemision;
        this._guiaDespachoService.generarReporteGuiaRemision(guiaRemision.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Remision_${this.guiaRemisionSeleccionada.numero}`;
            this.guiaRemisionSeleccionada = null;
            a.click();
        });
    }
}
