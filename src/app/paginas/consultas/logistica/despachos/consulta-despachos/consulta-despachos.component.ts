import { Component, OnInit } from '@angular/core';
import { GridDataResult,PageChangeEvent } from '@progress/kendo-angular-grid';
import { forkJoin, Observable, observable } from 'rxjs';
import { DocumentoGuiaRemision } from 'src/app/_dominio/logistica/documentoGuiaRemision';
import { GuiaDespachoDTO } from 'src/app/_dto/logistica/guiaDespachoDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';

@Component({
    selector: 'app-consulta-despachos',
    templateUrl: './consulta-despachos.component.html',
    styleUrls: ['./consulta-despachos.component.scss']
})
export class ConsultaDespachosComponent implements OnInit {

    public tiposEntrega: any[];
    public listaEstados: any[];
    public consulta: any = {
        "numeroDocumento": null,
        "fechaInicio": null,
        "fechaFin": null,
        "tipoEntrega": null,
        "estado": null
    };
    public respuestaConsulta: Array<GuiaDespachoDTO> = [];

    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private data: Object[];
    private currentPage: number = 0;

    public fechaInicio: Date = null;
    public fechaFin: Date = null;

    public guiaSeleccionada: GuiaDespachoDTO;

    public abrirDetalle: boolean = false;
    public guiasRemision: DocumentoGuiaRemision[] = [];

    constructor(
        private _notificarService: NotificarService,
        private _reservaFacturaService: ReservaService,
        private _despachoService: GuiaDespachoService,
        private _fechaService: FechaService
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
        this.inicio();
    }

    private cargarDatos(){
        let tiposEntregaObs: Observable<any> = this._reservaFacturaService.listarEntregas();
        let estadosObs: Observable<any> = this._despachoService.listarEstados();
        forkJoin([tiposEntregaObs, estadosObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.tiposEntrega = data[0];
            this.listaEstados = data[1];
        });
    }

    consultar(){
        this.consulta.fechaInicio = null;
        this.consulta.fechaFin = null;
        if(this.consulta.numeroDocumento !== null ||
            this.consulta.tipoEntrega !== null ||
            this.consulta.estado !== null ||
            this.fechaInicio !== null||
            this.fechaFin !== null){

            debugger;
            if(this.fechaInicio !== null){
                this.consulta.fechaInicio = this._fechaService.dateToString(this.fechaInicio);
            }

            if(this.fechaFin !== null){
                this.consulta.fechaFin = this._fechaService.dateToString(this.fechaFin);
            }

            this.currentPage = 0;
            this.skip = 0;
            this.obtenerDatosConsulta(this.currentPage, this.pageSize);
        }else{
            this._notificarService.mostrarMensajeError('Ingrese al menos un criterio de búsqueda');
        }
    }

    obtenerDatosConsulta(page: number, size: number){
        console.log(this.consulta);
        debugger;
        this._despachoService.consultarGuiasDespacho(page,size,this.consulta).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.gridView = {
                data: data.content,
                total: data.totalElements
            }
        });
    }

    inicio(){
        this.gridView = {
            data: Array<any>(),
            total: 0
        }
    }

    public pageChange(event: PageChangeEvent): void {
        debugger;
        console.log(`pagina ${event.skip/event.take}`)
        this.currentPage = (event.skip/event.take);

        this.skip = event.skip;

        this.obtenerDatosConsulta(this.currentPage,this.pageSize);
    }

    limpiar(){
        this.consulta = {
            "numeroDocumento": null,
            "fechaInicio": null,
            "fechaFin": null,
            "tipoEntrega": null,
            "estado": null
        };
        this.fechaFin = null;
        this.fechaInicio = null;
        this.inicio();
    }

    descargarReporte(despachoDto: GuiaDespachoDTO){
        this._despachoService.generarReporte(despachoDto.idGuiaDespacho).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `WSTGuiaD_${this._fechaService.fechaActual()}`;
            a.click();
        });
    }

    descargarReporteOrenCompraCliente(despachoDto: GuiaDespachoDTO){
        this.guiaSeleccionada = despachoDto;
        this._despachoService.generarReporteCliente(despachoDto.idGuiaDespacho, new DocumentoGuiaRemision()).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Despacho_${this.guiaSeleccionada.numeroGuiaDespacho}`;
            this.guiaSeleccionada = null;
            a.click();
        });
    }

    public deshabilitarFechasFinTraslado = (fechaFin: Date) : boolean => {
        if(this.fechaInicio !== null){
            let fechaInicio = new Date(this.fechaInicio.getFullYear(), this.fechaInicio.getMonth(), this.fechaInicio.getDate() -1);
            return fechaFin <= fechaInicio;
        }else{
            return false;
        }
    }

    private abrirDialogoDetalles(guiasRemision: DocumentoGuiaRemision[]){
        this.abrirDetalle = true;
        this.guiasRemision = guiasRemision;
    }

    cargarDetalleDespachos(guiaDespacho: GuiaDespachoDTO){
        this.guiaSeleccionada = guiaDespacho;
        this._despachoService.listarGuiasRemisionPorDespachoId(guiaDespacho.idGuiaDespacho).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.abrirDialogoDetalles(data);
        });
    }

    public cerrarDetalle(){
        this.abrirDetalle = false;
    }
}
