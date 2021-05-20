import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult, RowArgs } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { ChequePosfechadoDTO } from 'src/app/_dominio/cobros/chequePosfechadoDTO';
import { ChequePosfechadoService } from 'src/app/_servicio/cobros/cheque-posfechado.service';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ChequePosfechadoConfirmacionComponent } from './cheque-posfechado-confirmacion/cheque-posfechado-confirmacion.component';
import { ChequePosfechadoResultadoComponent } from './cheque-posfechado-resultado/cheque-posfechado-resultado.component';
import * as _ from "lodash";

@Component({
    selector: 'app-cheque-posfechado',
    templateUrl: './cheque-posfechado.component.html',
    styleUrls: ['./cheque-posfechado.component.scss']
})
export class ChequePosfechadoComponent implements OnInit {

    public range = { start: null, end: null };
    public chequesFiltradoPorFecha: any[] = [];
    public mostrarQuitarFiltro: boolean = false;

    public cheques: ChequePosfechadoDTO[] = [];
    public gridChequesView: GridDataResult;
    public mySelection: any[] = [];
    public state: State = {
        skip: 0,
        take: 20,
        sort: [{ field: 'fechaCheque', dir: 'asc' }],
    };

    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("containerAplicaciones", { read: ViewContainerRef })
    public containerAplicacionesRef: ViewContainerRef;
    @ViewChild("containerResultado", { read: ViewContainerRef })
    public containerResultadoRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _chequePosfechadoService: ChequePosfechadoService,
        private _sanitizer: DomSanitizer,
        private _fechaService: FechaService,
        private _dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this.obtenerCheques();
        this._chequePosfechadoService.chequePosfechadoCambio.subscribe(data => {
            this.gridChequesView = process(data, this.state);
            this.cheques = data;
        })
    }

    private obtenerCheques() {
        this._chequePosfechadoService.listarChequesEstadoRecibido().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.gridChequesView = process(data, this.state);
            this.cheques = data;
        })
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        if (this.chequesFiltradoPorFecha.length > 0)
            this.gridChequesView = process(this.chequesFiltradoPorFecha, this.state);
        else
            this.gridChequesView = process(this.cheques, this.state);
    }


    public mySelectionKey(context: RowArgs): any {
        return context.dataItem;
    }

    public colorCode(fecha: string): SafeStyle {
        let result = '#B2F699';
        const diferencia = this._fechaService.diferenciaFechaActualEnDias(fecha);
        if (diferencia > 0)
            result = '#809FFF';
        if (diferencia < 0)
            result = '#FFBA80';

        return this._sanitizer.bypassSecurityTrustStyle(result);
    }

    public onChangeProrroga(valor: number, item: ChequePosfechadoDTO) {
        if (valor > 0) {
            const fechaNueva = this._fechaService.sumarDias(item.fechaCheque, valor);
            item.nuevaFecha = fechaNueva;
        } else {
            item.nuevaFecha = null;
        }
    }

    public abrirDialogoConfirmacion() {
        if (this.mySelection.length > 0) {
            const dialogRefRegistro = this._dialogService.open({
                appendTo: this.containerConfirmacionRef,
                content: ChequePosfechadoConfirmacionComponent,
                minWidth: 800,
                maxWidth: 800,
                maxHeight: 700,
                title: 'Confirmación',
                actions: [
                    { text: 'No' },
                    { text: 'Sí', primary: true }
                ],
            });

            const formaPagoRegistro = dialogRefRegistro.content.instance;
            const cheques = this.validarNecesitanRevision();
            formaPagoRegistro.chequesAprocesar = cheques;
            dialogRefRegistro.result.subscribe((result) => {
                if (result instanceof DialogCloseResult) {
                    this.mySelection = [];
                } else {
                    if (result['text'] === 'Sí') {
                        this.procesar(cheques);
                    }
                    if (result['text'] === 'No') {
                        this.mySelection = [];
                    }
                }
            });
        } else {
            this._notificarService.mostrarMensajeError("Debe seleccionar al menos un registro.");
        }
    }

    private validarNecesitanRevision() : any[] {
        let datos = _.cloneDeep(this.mySelection);
        _.forEach(datos, (o) => {
            if (!o['revision']) {
                if (o['canje'] || o['diasProrroga'] > 0) {
                    o['revision'] = true;
                }
            }
        })
        return datos;
    }

    public procesar(cheques: any[]) {
        this._chequePosfechadoService.procesar(cheques).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data.length > 0) {
                this.abrirResultadoDialogo(data);
            } else {
                this._notificarService.mostrarMensajeExito("Documentos gestionados con éxito");
            }
            this.mySelection = [];
            this.obtenerCheques();
        });
    }

    private abrirResultadoDialogo(resultado) {
        const dialogRefRegistro = this._dialogService.open({
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

        const formaPagoRegistro = dialogRefRegistro.content.instance;
        formaPagoRegistro.chequesProcesados = resultado;
        dialogRefRegistro.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                //this.obtenerCheques();
            } else {
                if (result['text'] === 'Aceptar') {
                    this.obtenerCheques();
                }
            }
        });
    }

    public verAplicaciones(aplicaciones: string[]) {

        const mensaje = aplicaciones.join(', ');
        const dialogRefAplicaciones = this._dialogService.open({
            appendTo: this.containerAplicacionesRef,
            minWidth: 550,
            maxWidth: 550,
            maxHeight: 700,
            title: 'Aplicaciones',
            content: mensaje
        });
    }

    public inactivarCanje(item: ChequePosfechadoDTO) {
        if (item.diasProrroga && item.diasProrroga > 0) {
            return true;
        }
        return false;
    }

    public inactivarDiasProrroga(item: ChequePosfechadoDTO) {
        if (item.canje) {
            return true;
        }
        return false;
    }

    public filtrarPorFechas() {
        let filtrado;

        if (this.range.start && this.range.end) {
            filtrado = _.filter(this.cheques, (o) => {
                if (this._fechaService.fechaEstaDentroRango(this.range.start, this.range.end, o.fechaCheque))
                    return o;
            });

        } else if (this.range.start && !this.range.end) {
            filtrado = _.filter(this.cheques, (o) => {
                if (this._fechaService.fechaEsSuperiorOIgual(this.range.start, o.fechaCheque))
                    return o;
            });

        } else if (this.range.end && !this.range.start) {

            filtrado = _.filter(this.cheques, (o) => {
                if (this._fechaService.fechaEsInferiorOIgual(this.range.end, o.fechaCheque))
                    return o;
            });
        } else {
            return false;
        }
        this.chequesFiltradoPorFecha = filtrado;
        let ordenado = _.orderBy(this.chequesFiltradoPorFecha, ['fechaCheque'], ['asc']);
        this.gridChequesView = process(ordenado, this.state);
        this.mostrarQuitarFiltro = true;
    }

    public quitarFiltroFechas() {
        this.chequesFiltradoPorFecha = [];
        this.gridChequesView = process(this.cheques, this.state);
        this.mostrarQuitarFiltro = false;
        this.range.end = null;
        this.range.start = null;
    }

}
