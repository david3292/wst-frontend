import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {GridDataResult, PageChangeEvent} from '@progress/kendo-angular-grid';
import {NotificarService} from '../../../../../_servicio/notificar.service';
import {FechaService} from '../../../../../_servicio/fecha-service';
import {PuntoVentaService} from '../../../../../_servicio/sistema/punto-venta.service';
import {CobroService} from '../../../../../_servicio/cobros/cobro.service';
import {DialogRef, DialogService} from '@progress/kendo-angular-dialog';
import {SessionService} from '../../../../../_servicio/session.service';
import {forkJoin, Observable} from 'rxjs';
import {verificarObjetoVacio} from '../../../../../_util/utilidades';
import {CobroFormasPagoComponent} from '../cobro-formas-pago/cobro-formas-pago.component';
import {UsuarioService} from '../../../../../_servicio/sistema/usuario.service';

@Component({
    selector: 'app-consulta-jefe-cobranzas',
    templateUrl: './consulta-jefe-cobranzas.component.html',
    styleUrls: ['./consulta-jefe-cobranzas.component.scss']
})
export class ConsultaJefeCobranzasComponent implements OnInit {

    @ViewChild('cobroPagos', {read: ViewContainerRef})
    public cobroPagosRef: ViewContainerRef;

    public consulta: any = {
        identificacionCliente: null,
        fechaInicio: null,
        fechaFin: null,
        estado: null,
        numeroCobro: null,
        idPuntoVenta: null,
        usuario: null,
        rol: 'JEFE_COBRANZAS'
    };

    public fechaInicio: Date = null;
    public fechaFin: Date = null;
    public puntosVenta: any[];
    public listaEstados: any[];
    public vendedores: any[];
    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private currentPage = 0;

    constructor(
        private notificarService: NotificarService,
        private fechaService: FechaService,
        private puntoVentaService: PuntoVentaService,
        private cobroService: CobroService,
        private dialogService: DialogService,
        private sessionService: SessionService,
        private usuarioService: UsuarioService
    ) {
    }

    ngOnInit(): void {
        this.cargarDatos();
        this.inicio();
    }

    private cargarDatos() {
        const estadosObs: Observable<any> = this.cobroService.listarEstados();
        const puntosVentaObs: Observable<any> = this.puntoVentaService.listarTodosActivos();
        const vendedoresObs: Observable<any> = this.usuarioService.listarUsuariosPerfilVendedor();
        forkJoin([estadosObs, puntosVentaObs, vendedoresObs]).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.listaEstados = data[0];
            this.puntosVenta = data[1];
            this.vendedores = data[2];
        });
    }

    inicio() {
        this.gridView = {
            data: Array<any>(),
            total: 0
        };
    }

    limpiar() {
        this.consulta = {
            identificacionCliente: null,
            fechaInicio: null,
            fechaFin: null,
            estado: null,
            numeroCobro: null,
            idPuntoVenta: null,
            usuario: null,
            rol: 'JEFE_COBRANZAS'
        };
        this.fechaFin = null;
        this.fechaInicio = null;
        this.inicio();
    }

    consultar() {
        this.consulta.fechaInicio = null;
        this.consulta.fechaFin = null;
        if (verificarObjetoVacio(this.consulta) || this.fechaInicio !== null || this.fechaFin !== null) {

            if (this.fechaInicio !== null) {
                this.consulta.fechaInicio = this.fechaService.dateToString(this.fechaInicio);
            }

            if (this.fechaFin !== null) {
                this.consulta.fechaFin = this.fechaService.dateToString(this.fechaFin);
            }

            this.currentPage = 0;
            this.skip = 0;
            this.obtenerDatosConsulta(this.currentPage, this.pageSize);
        } else {
            this.notificarService.mostrarMensajeError('Ingrese al menos un criterio de b??squeda');
        }
    }

    obtenerDatosConsulta(page: number, size: number) {
        this.cobroService.consultarCobros(page, size, this.consulta).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.gridView = {
                data: data.content,
                total: data.totalElements
            };
        });
    }

    public pageChange(event: PageChangeEvent): void {
        this.currentPage = (event.skip / event.take);

        this.skip = event.skip;

        this.obtenerDatosConsulta(this.currentPage, this.pageSize);
    }

    descargarReporte(numero: string) {
        this.cobroService.generarReporte(numero).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            const file = new Blob([data], {type: 'application/pdf'});
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `WST-CobroResumen_${this.fechaService.fechaActual()}`;
            a.click();
        });
    }

    abrirCobroResultadoDialogo(data) {
        const dialogCobroPagos: DialogRef = this.dialogService.open({
            appendTo: this.cobroPagosRef,
            title: 'Formas de Pago',
            content: CobroFormasPagoComponent,
            actions: [
                {text: 'Aceptar', primary: true}
            ],
            width: 1200,
            maxHeight: 500
            // minWidth: 250
        });
        const cobroFormasPago = dialogCobroPagos.content.instance;
        cobroFormasPago.formasPago = data;
    }

}
