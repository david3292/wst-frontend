import { TransferenciaDTO } from 'src/app/_dto/logistica/transferenciaDTO';
import { TransferenciasService } from './../../../../_servicio/logistica/transferencias.service';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DocumentoTransferenciaSalida } from 'src/app/_dominio/logistica/documentoTransferenciaSalida';
import * as _ from "lodash";
import { DialogService } from '@progress/kendo-angular-dialog';
import { TransferenciasDetalleDialogoComponent } from '../../transferencias-detalle-dialogo/transferencias-detalle-dialogo.component';
import { process, State } from '@progress/kendo-data-query';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';

const TIPO_SALIDA: string = 'TRANSFERENCIA_SALIDA';
const TIPO_ENTRADA: string = 'TRANSFERENCIA_INGRESO';

@Component({
    selector: 'app-vista-general-transferencias',
    templateUrl: './vista-general-transferencias.component.html',
    styleUrls: ['./vista-general-transferencias.component.scss']
})
export class VistaGeneralTransferenciasComponent implements OnInit {

    public transferencias: TransferenciaDTO[] = [];
    public abrirDetalle: boolean = false;
    public transferenciaDetalles: DocumentoTransferenciaSalida[];

    private tipoTransferencia: string;
    public titulo: string;

    private transferenciaSeleccionada: TransferenciaDTO;

    public state: State = {
        skip: 0,
        take: 20,
        filter: {
            logic: 'and',
            filters: [{ field: 'cotizacionNumero', operator: 'contains', value: ''}]
        }
    }


    public gridDataTransferencias: GridDataResult;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _transferenciaService: TransferenciasService,
        private _notificacionService: NotificarService,
        private _dialogService: DialogService
    ) { }

    ngOnInit(): void {
        this._route.params.subscribe((params: Params) => {
            if(params['tipo_transferencia']==='salida'){
                this.tipoTransferencia = TIPO_SALIDA;
                this.titulo = 'Gestión de Transferencias de Salida';
            }else if(params['tipo_transferencia']==='entrada'){
                this.tipoTransferencia = TIPO_ENTRADA;
                this.titulo = 'Gestión de Transferencias de Ingreso ';
            }
            this.cargarDatos();
        });
        this.cargarDatos();
    }

    cargarDatos(){
        this._transferenciaService.listarTransferencias(this.tipoTransferencia).subscribe(data => {
            this._notificacionService.desactivarLoading();
            this.transferencias = data;
            this.gridDataTransferencias = process(this.transferencias, this.state);
        });

        this._transferenciaService.transferenciasCambio.subscribe(data => {
            this.transferencias = data;
        });
    }

    public dataStateChange(state: DataStateChangeEvent){
        this.state = state;
        this.gridDataTransferencias = process(this.transferencias, state);
    }

    cargarTransferencia(transferencia: TransferenciaDTO){
        if(transferencia.tipo === 'TRANSFERENCIA')
            this.cargarTransferenciaSalida(transferencia);
        else if (transferencia.tipo === 'TRANSFERENCIA_SALIDA')
            this.cargarTransferenciaEntrada(transferencia)
        else
            this._notificacionService.mostrarMensajeError('Error inesperado');
    }

    private cargarTransferenciaSalida(transferencia: TransferenciaDTO){
        this._transferenciaService.listarTransferenciasSalida(transferencia.id).subscribe(data => {
            if(data.length > 1){
                this.abrirDialogoTransferenciaDetalles(data);
            }else{
                let transferenciaCargar = _.first(data);
                if(transferenciaCargar.estado === 'NUEVO')
                    this._router.navigate([`/transferencias/${transferenciaCargar.id}/salida`]);
                else
                    this.abrirDialogoTransferenciaDetalles(data);
            }
        });
    }

    private cargarTransferenciaEntrada(transferencia: TransferenciaDTO){
        this._transferenciaService.listarTransferenciasEntrada(transferencia.id).subscribe(data => {
            let transferenciaCargar = _.first(data);
            this._router.navigate([`/transferencias/${transferenciaCargar.id}/entrada`]);
        });
    }

    abrirDialogoTransferenciaDetalles(documentoTransferenciaSalida: DocumentoTransferenciaSalida[]){
        this.abrirDetalle = true;
        this.transferenciaDetalles = documentoTransferenciaSalida;
    }

    public cerrarDetalle(){
        this.abrirDetalle = false;
    }

    generarReporteTransferencia(transferencia: TransferenciaDTO){
        this.transferenciaSeleccionada = transferencia;
        this._transferenciaService.generarReporteGuiaTransferencia(transferencia.id).subscribe(data => {
            this._notificacionService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Transferencia_${this.transferenciaSeleccionada.numero}`;
            this.transferenciaSeleccionada = null;
            a.click();
        });
    }
}
