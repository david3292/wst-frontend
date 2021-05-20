import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { DocumentoGuiaDespacho } from 'src/app/_dominio/logistica/documentoGuiaDespacho';
import { DocumentoFactura } from 'src/app/_dominio/ventas/documentoFactura';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { GuiaDespachoService } from 'src/app/_servicio/ventas/guia-despacho.service';

@Component({
    selector: 'app-forzar-despachos',
    templateUrl: './forzar-despachos.component.html',
    styleUrls: ['./forzar-despachos.component.scss']
})
export class ForzarDespachosComponent implements OnInit {

    public state: State = {
        skip: 0,
        //take: 15,
        filter: {
            logic: 'and',
            filters: [{ field: 'numero', operator: 'contains', value: '' }]
        }
    };

    public gridData: GridDataResult;

    public facturas: DocumentoFactura[] = [];

    @ViewChild("containerConfirmacionGenerarGuia", { read: ViewContainerRef })
    public containerConfirmacionGenerarGuiaRef: ViewContainerRef;
    @ViewChild("containerResultadoGenerarGuia", { read: ViewContainerRef })
    public containerResultadoGenerarGuiaRef: ViewContainerRef;

    constructor(
        private _guiaDespachoService: GuiaDespachoService,
        private _notificarService: NotificarService,
        private dialogService: DialogService
    ) { }

    ngOnInit(): void {
        this.listarFacturasEmitidas();
    }

    private listarFacturasEmitidas() {
        this._guiaDespachoService.obtenerFacturasEmitidasSinGuiaDespacho().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.facturas = data;
            this.gridData = process(this.facturas, this.state);
        })
    }

    public generarGuia(dataItem: DocumentoFactura) {
        this._guiaDespachoService.generarGuiaDespachoAPartirFactura(dataItem.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.resultadoGenerarGuia(data, dataItem);
        });
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridData = process(this.facturas, this.state);
    }

    public mostrarConfirmacionGenerarGuia(dataItem: DocumentoFactura) {
        let mensaje: string = `¿ Está seguro de generar la guía de despacho para el documento ${dataItem.numero} ?`;
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionGenerarGuiaRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 200,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this.generarGuia(dataItem);
                }
            }
        });
    }

    private resultadoGenerarGuia(guia: DocumentoGuiaDespacho, factura: DocumentoFactura) {
        let mensaje: string = `Guía de Despacho ${guia.numero} generada correctamente a partir del documento ${factura.numero}`;
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerResultadoGenerarGuiaRef,
            title: 'Guía Generada',
            content: mensaje,
            actions: [
                { text: 'Aceptar', primary: true }
            ],
            width: 450,
            height: 200,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {
                this.listarFacturasEmitidas();
            } else {
                if (result['text'] === 'Aceptar') {
                    this.listarFacturasEmitidas();
                }
            }
        });
    }

}
