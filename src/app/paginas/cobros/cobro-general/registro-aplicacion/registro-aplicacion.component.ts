import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cobro } from 'src/app/_dominio/cobros/cobro';
import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';
import { CobroService } from 'src/app/_servicio/cobros/cobro.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from "lodash";
import { FinanzasService } from 'src/app/_servicio/utilidades/finanzas.service';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SeleccionDocumentoAplicarComponent } from '../seleccion-documento-aplicar/seleccion-documento-aplicar.component';
import { EditarCobroAplicacionService } from './editarCobroAplicacion.service';
import { Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { CobroCuotaFactura } from 'src/app/_dominio/cobros/cobroCuotaFactura';

@Component({
    selector: 'app-registro-aplicacion',
    templateUrl: './registro-aplicacion.component.html',
    styleUrls: ['./registro-aplicacion.component.scss']
})
export class RegistroAplicacionComponent implements OnInit {

    public nombreCliente: string;
    public cobro: Cobro;
    public cobroFormaPago: CobroFormaPago;
    private cobroFormaPagoId: number = 0;

    @ViewChild("containerRegistroAplicacion", { read: ViewContainerRef })
    public containerRegsitroAplicacionRef: ViewContainerRef;

    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0,
    };
    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _cobroService: CobroService,
        private _notificarService: NotificarService,
        public _finanzasService: FinanzasService,
        private dialogService: DialogService,
        public editarCobroAplicacionService: EditarCobroAplicacionService,
    ) { }

    ngOnInit(): void {
        this.view = this.editarCobroAplicacionService.pipe(map(data => process(data, this.gridState)));
        this.editarCobroAplicacionService.next([]);
        this.editarCobroAplicacionService.read();

        this._route.queryParams.subscribe(params => {
            this.nombreCliente = params['param3']
            this.cobroFormaPagoId = params['param2']
            this.recuperarCobroYFormaPago(params['param1'], params['param2']);
        });
    }

    private recuperarCobroYFormaPago(cobroId: number, formaPagoId: number) {
        this._cobroService.listarCobroPorId(cobroId).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.cobro = data;
            this.cobroFormaPago = _.find(this.cobro.cobroFormaPagos, (o) => { return o.id == formaPagoId });
            this.editarCobroAplicacionService.next(this.cobro.cuotaFacturas);
        })
    }

    public addHandler() {
        this.abrirDialogoSeleccionarDocumento();
    }

    private abrirDialogoSeleccionarDocumento() {
        const dialogRefRegistro = this.dialogService.open({
            appendTo: this.containerRegsitroAplicacionRef,
            content: SeleccionDocumentoAplicarComponent,
            minWidth: '70%',
            maxWidth: '70%',
            maxHeight: '60%',
            minHeight: '60%',
            title: 'Aplicación',
            actions: [{ text: 'Cancelar' }, { text: 'Aceptar', primary: true }],
            preventAction: (ev, dialog) => {
                if (ev['text'] === 'Aceptar')
                    return (dialog.content.instance.cuotas.length <= 0 || dialog.content.instance.mensajeError != undefined);
                else
                    return false;
            }
        });

        const seleccionDocumento = dialogRefRegistro.content.instance;
        seleccionDocumento.codigoCliente = this.cobro ? this.cobro.codigoCliente : 0;
        seleccionDocumento.formaPago = this.cobroFormaPago;

        dialogRefRegistro.result.subscribe(r => {
            if (r['text'] == 'Aceptar') {
                this.saveHandler(seleccionDocumento.cuotas);
                dialogRefRegistro.close();

            }
            if (r['text'] == 'Cancelar') {
                dialogRefRegistro.close();

            }
        });
    }

    public saveHandler(cuotasAplicadas: CobroCuotaFactura[]) {
        this._cobroService.registrarCobroCuotaFactura(this.cobro.id, cuotasAplicadas).subscribe(data => {
            this.cobro = data;
            this.editarCobroAplicacionService.next(this.cobro.cuotaFacturas);
            this._notificarService.desactivarLoading();
            this._notificarService.mostrarMensajeExito('Aplicaciones registradas');
            this.cobroFormaPago = _.find(this.cobro.cobroFormaPagos, (o) => { return o.id == this.cobroFormaPagoId });
        })
    }

    public redireccionarCobro() {
        this._cobroService.cobroCambio.next(this.cobro);
        this._router.navigate(['cobros/general']);
    }

    public obtenerFormaPago(cobroFormPagoId: number) {
        const formaPago = _.find(this.cobro.cobroFormaPagos, (o) => { return o.id === cobroFormPagoId });
        return formaPago ? formaPago.formaPago : '';
    }
}
