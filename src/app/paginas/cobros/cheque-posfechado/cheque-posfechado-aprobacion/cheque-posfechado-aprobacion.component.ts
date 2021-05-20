import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult, RowArgs } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { ChequePosfechadoDTO } from 'src/app/_dominio/cobros/chequePosfechadoDTO';
import { ChequePosfechadoService } from 'src/app/_servicio/cobros/cheque-posfechado.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ChequePosfechadoAprobacionConfirmacionComponent } from '../cheque-posfechado-aprobacion-confirmacion/cheque-posfechado-aprobacion-confirmacion.component';
import { ChequePosfechadoResultadoComponent } from '../cheque-posfechado-resultado/cheque-posfechado-resultado.component';

@Component({
    selector: 'app-cheque-posfechado-aprobacion',
    templateUrl: './cheque-posfechado-aprobacion.component.html',
    styleUrls: ['./cheque-posfechado-aprobacion.component.scss']
})
export class ChequePosfechadoAprobacionComponent implements OnInit {

    public cheques: ChequePosfechadoDTO[] = [];
    public gridChequesView: GridDataResult;
    public mySelection: any[] = [];
    public state: State = {
        skip: 0,
        take: 20,
        sort: [/* { field: 'ITEMDESC', dir: 'asc' } */],
        filter: {
            logic: 'and',
            filters: [{ field: 'numeroCheque', operator: 'startswith', value: '' }]
        }
    };

    @ViewChild("containerAprobarRechazar", { read: ViewContainerRef })
    public containerAprobarRechazarRef: ViewContainerRef;
    @ViewChild("containerResultadoA", { read: ViewContainerRef })
    public containerResultadoRef: ViewContainerRef;
    @ViewChild("containerAplicacionesA", { read: ViewContainerRef })
    public containerAplicacionesRefA: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _chequePosfechadoService: ChequePosfechadoService,
        private _dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this.obtenerCheques();
        this._chequePosfechadoService.chequePosfechadoCambioRevision.subscribe(data => {
            this.gridChequesView = process(data, this.state);
            this.cheques = data;
        })
    }

    private obtenerCheques() {
        this._chequePosfechadoService.listarChequesEstadoRevision().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.gridChequesView = process(data, this.state);
            this.cheques = data;
        })
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridChequesView = process(this.cheques, this.state);
    }

    public mySelectionKey(context: RowArgs): any {
        return context.dataItem;
    }

    public abrirAprobacionRespuestaDialogo(accion: string) {
        if (this.mySelection.length > 0) {
            const titulo = `Confirmación ${accion}`;
            const dialogRefConfirmacionAprbacion = this._dialogService.open({
                appendTo: this.containerAprobarRechazarRef,
                content: ChequePosfechadoAprobacionConfirmacionComponent,
                minWidth: 750,
                maxWidth: 750,
                maxHeight: 700,
                title: titulo,
                actions: [
                    { text: 'No' },
                    { text: 'Sí', primary: true }
                ],
                preventAction: (ev, dialog) => {
                    if (ev['text'] === 'Sí'){
                        dialog.content.instance.editForm.markAllAsTouched();
                        return !dialog.content.instance.editForm.valid;
                    }
                    else
                        return false;
                }
            });

            const confirmacionAprobacion = dialogRefConfirmacionAprbacion.content.instance;
            confirmacionAprobacion.chequesAprocesar = this.mySelection;
            confirmacionAprobacion.accion = accion;
            dialogRefConfirmacionAprbacion.result.subscribe((result) => {
                if (result instanceof DialogCloseResult) {
                    this.mySelection = [];
                }else{
                    if (result['text'] === 'Sí') {
                        const observacion = confirmacionAprobacion.editForm.controls['observaciones'].value;
                        const accionTmp = accion === 'AUTORIZAR'?'APROBAR':accion;
                        this.enviarRespuesta(observacion, accionTmp);
                    }
                }
            });
        } else {
            this._notificarService.mostrarMensajeError("Debe seleccionar al menos un registro.");
        }
    }

    public enviarRespuesta(observacion, accion) {
        this._chequePosfechadoService.procesarAprobacion(this.mySelection, accion, observacion).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data.length > 0) {
                this.abrirResultadoDialogo(data);
            } else {
                this._notificarService.mostrarMensajeExito("Documentos gestionados con éxito");
            }
            this.mySelection = [];
            this.obtenerCheques();
        })
    }

    private abrirResultadoDialogo(resultado) {
        const dialogRefResultadoA = this._dialogService.open({
            appendTo: this.containerResultadoRef,
            content: ChequePosfechadoResultadoComponent,
            minWidth: 550,
            maxWidth: 550,
            maxHeight: 700,
            title: 'Información',
            actions: [
                { text: 'Aceptar', primary: true }
            ],
        });

        const formaPagoRegistro = dialogRefResultadoA.content.instance;
        formaPagoRegistro.chequesProcesadosAprobacion = resultado;
        dialogRefResultadoA.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.obtenerCheques();
                this.mySelection = [];
            } else {
                if (result['text'] === 'Aceptar') {
                    this.obtenerCheques();
                    this.mySelection = [];
                }
            }
        });
    }

    public verAplicaciones(aplicaciones: string[]) {

        const mensaje = aplicaciones.join(', ');
        const dialogRefAplicaciones = this._dialogService.open({
            appendTo: this.containerAplicacionesRefA,
            minWidth: 550,
            maxWidth: 550,
            maxHeight: 700,
            title: 'Aplicaciones',
            content: mensaje
        });
    }

}
