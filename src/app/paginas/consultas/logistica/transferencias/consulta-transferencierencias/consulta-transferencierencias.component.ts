import { Component, OnInit } from '@angular/core';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { forkJoin } from 'rxjs';
import { TransferenciaDTO } from 'src/app/_dto/logistica/transferenciaDTO';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { BodegaService } from 'src/app/_servicio/sistema/bodega.service';
import * as _ from 'lodash';

const transferencia = 'TRANSFERENCIA';
const transferenciaEntrada = 'TRANSFERENCIA_INGRESO';
const transferenciaSalida = 'TRANSFERENCIA_SALIDA';


@Component({
    selector: 'app-consulta-transferencierencias',
    templateUrl: './consulta-transferencierencias.component.html',
    styleUrls: ['./consulta-transferencierencias.component.scss']
})

export class ConsultaTransferencierenciasComponent implements OnInit {

    public listaEstados: any[] = [];
    public listaTransferencias: any[] = [transferencia, transferenciaEntrada, transferenciaSalida];
    public listaBodegas: any[] = [];
    public transferenciaTransaccion: string = 'Bodega Origen';
    public transferenciaSeleccionada: TransferenciaDTO;

    public fechaInicio: Date = null;
    public fechaFin: Date = null;

    public consulta: any = {
        'numeroDocumento': null,
        'numeroCotizacion': null,
        'numeroReferencia': null,
        'tipoTransferencia': transferenciaEntrada,
        'estado': null,
        'fechaInicio': null,
        'fechaFin': null,
        'bodegaTransaccion': null
    };

    imprimirReporteF = data => {
        debugger;
        this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            let numero = '';
            if(this.transferenciaSeleccionada.numero !== null){
                numero = `_${this.transferenciaSeleccionada.numero}`;
            }
            a.download = `Transferencia${numero}`;
            this.transferenciaSeleccionada = null;
            a.click();
    }

    public respuestaConsulta: Array<TransferenciaDTO> = [];

    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private data: Object[];
    private currentPage: number = 0;

    constructor(
        private _notificarService: NotificarService,
        private _transferenciaService: TransferenciasService,
        private _fechaService: FechaService,
        private _bodegaService: BodegaService
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(){
        let estadosObs = this._transferenciaService.listarEstados();
        let bodegasObs = this._bodegaService.listarTodos();

        forkJoin([estadosObs, bodegasObs]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.listaEstados = data[0];
            this.listaBodegas = _.map(data[1], 'codigo');
        });
    }

    public pageChange(event: PageChangeEvent): void {
        debugger;
        console.log(`pagina ${event.skip/event.take}`)
        this.currentPage = (event.skip/event.take);

        this.skip = event.skip;

        this.obtenerDatosConsulta(this.currentPage,this.pageSize);
    }

    consultar(){
        debugger;
        if(this.consulta.numeroDocumento !== null ||
            this.consulta.numeroCotizacion !== null ||
            this.consulta.numeroReferencia !== null ||
            this.consulta.estado !== null ||
            this.fechaInicio !== null ||
            this.fechaFin !== null ||
            this.consulta.bodegaTransaccion !== null){

            if(this.fechaInicio !== null)
                this.consulta.fechaInicio = this._fechaService.dateToString(this.fechaInicio);

            if(this.fechaFin !== null)
                this.consulta.fechaFin = this._fechaService.dateToString(this.fechaFin);

            this.currentPage = 0;
            this.skip = 0;
            this.obtenerDatosConsulta(this.currentPage, this.pageSize);
        }else{
            this._notificarService.mostrarMensajeError('Ingrese al menos un criterio de búsqueda');
        }
    }

    public deshabilitarFechasFinTraslado = (fechaFin: Date) : boolean => {
        if(this.fechaInicio !== null){
            let fechaInicio = new Date(this.fechaInicio.getFullYear(), this.fechaInicio.getMonth(), this.fechaInicio.getDate() -1);
            return fechaFin <= fechaInicio;
        }else{
            return false;
        }
    }

    obtenerDatosConsulta(page: number, size: number){
        this._transferenciaService.consultarTransferencias(page,size,this.consulta).subscribe(data => {
            this._notificarService.desactivarLoading();
            debugger;
            this.gridView = {
                data: data.content,
                total: data.totalElements
            }
        });
    }

    public tipoChange(valor: string){
        if(valor === transferenciaEntrada)
            this.transferenciaTransaccion = 'Bodega Origen';
        else
            this.transferenciaTransaccion = 'Bodega Destino';
    }

    public imprimirReporte(transferenciaDto: TransferenciaDTO){
        this.transferenciaSeleccionada = transferenciaDto;
        debugger;
        if(this.transferenciaSeleccionada.tipo === transferencia)
            this._transferenciaService.generarReporteGuiaTransferencia(this.transferenciaSeleccionada.id).subscribe(this.imprimirReporteF);

        if(this.transferenciaSeleccionada.tipo === transferenciaEntrada)
            this._transferenciaService.generarReporteGuiaTransferenciaEntrada(this.transferenciaSeleccionada.id).subscribe(this.imprimirReporteF);

        if(this.transferenciaSeleccionada.tipo === transferenciaSalida)
            this._transferenciaService.generarReporteGuiaTransferenciaSalida(this.transferenciaSeleccionada.id).subscribe(this.imprimirReporteF);
    }

    imprimirGuiaRemision(transferenciaDto: TransferenciaDTO){
        this.transferenciaSeleccionada = transferenciaDto;
        if(this.transferenciaSeleccionada.tipo === transferenciaSalida){
            this._transferenciaService.generarReporteGuiaRemision(transferenciaDto.id).subscribe(data => {

                this._notificarService.desactivarLoading();
                const file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                a.download = `Guia_Remision`;
                a.click();
            });
        }
    }

    mostrarBotonReporteGR(transferenciaDto: TransferenciaDTO): boolean {
        const estadosMostrar = ['COMPLETADO','EMITIDO'];
        return _.includes(estadosMostrar, transferenciaDto.estado) && transferenciaDto.tipo === transferenciaSalida;
    }

    inicio(){
        this.gridView = {
            data: Array<any>(),
            total: 0
        }
    }

    limpiar(){
        this.consulta = {
            'numeroDocumento': null,
            'numeroCotizacion': null,
            'numeroReferencia': null,
            'tipoTransferencia': transferenciaEntrada,
            'estado': null,
            'fechaInicio': null,
            'fechaFin': null,
            'bodegaTransaccion': null
        };
        this.fechaFin = null;
        this.fechaInicio = null;
        this.inicio();
    }

}
