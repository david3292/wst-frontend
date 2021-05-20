import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { GuiaDespachoDTO } from 'src/app/_dto/logistica/guiaDespachoDTO';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from './../../../../_servicio/ventas/guia-despacho.service';
import * as _ from "lodash";
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { FechaService } from 'src/app/_servicio/fecha-service';

@Component({
    selector: 'app-vista-general-despachos',
    templateUrl: './vista-general-despachos.component.html',
    styleUrls: ['./vista-general-despachos.component.scss']
})
export class VistaGeneralDespachosComponent implements OnInit {

    public despachos: GuiaDespachoDTO[];
    public abrirDetalle: boolean = false;
    public guiasRemision: DocumentoGuiaRemision[] = [];
    public despachoDto: GuiaDespachoDTO;
    private guisDespachoSeleccionada: GuiaDespachoDTO;

    public state: State = {
        skip: 0,
        take: 20,
        filter: {
            logic: 'and',
            filters: [{ field: 'identificacionCliente', operator: 'contains', value: ''}]
        }
    }
    public gridDataDespachos: GridDataResult;

    constructor(
        private _router: Router,
        private _guiaDespachoService: GuiaDespachoService,
        private _notificarService: NotificarService,
        private _fechaService: FechaService
    ) { }

    ngOnInit(): void {
        this.cargarDespachos();
    }


    cargarDespachos(){
        this._guiaDespachoService.listarDespachos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.despachos = data;
            this.gridDataDespachos = process(this.despachos, this.state);
        });
    }

    cargarDetalleDespachos(guiaDespacho: GuiaDespachoDTO){
        this.guisDespachoSeleccionada = guiaDespacho;
        this._guiaDespachoService.listarGuiasRemisionPorDespachoId(guiaDespacho.idGuiaDespacho).subscribe(data => {
            this._notificarService.desactivarLoading();
            let urlGuiaDepscho = `/despachos/${this.guisDespachoSeleccionada.idGuiaDespacho}`;
            if(_.isEmpty(data)){
                this._router.navigate([urlGuiaDepscho])
            }else{

                this.despachoDto = guiaDespacho;
                this.abrirDialogoDetalles(data);

            }
        });
    }

    public dataStateChange(state: DataStateChangeEvent){
        this.state = state;
        this.gridDataDespachos = process(this.despachos, state);
    }

    private abrirDialogoDetalles(guiasRemision: DocumentoGuiaRemision[]){
        this.abrirDetalle = true;
        this.guiasRemision = guiasRemision;
    }

    public cerrarDetalle(){
        this.abrirDetalle = false;
    }

    descargarReporte(despachoDto: GuiaDespachoDTO){
        this.guisDespachoSeleccionada = despachoDto;
        this._guiaDespachoService.generarReporteCliente(despachoDto.idGuiaDespacho, new DocumentoGuiaRemision()).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Despacho_${this.guisDespachoSeleccionada.numeroGuiaDespacho}`;
            this.guisDespachoSeleccionada = null;
            a.click();
        });
    }
}
