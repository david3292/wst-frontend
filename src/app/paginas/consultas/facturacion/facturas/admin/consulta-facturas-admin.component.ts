import {Component, OnInit} from '@angular/core';
import {GridDataResult, PageChangeEvent} from '@progress/kendo-angular-grid';
import {NotificarService} from '../../../../../_servicio/notificar.service';
import {FechaService} from '../../../../../_servicio/fecha-service';
import {forkJoin, Observable} from 'rxjs';
import {FacturaService} from '../../../../../_servicio/ventas/factura.service';
import {verificarObjetoVacio} from '../../../../../_util/utilidades';
import {PuntoVentaService} from '../../../../../_servicio/sistema/punto-venta.service';
import {UsuarioService} from '../../../../../_servicio/sistema/usuario.service';


@Component({
    selector: 'app-consulta-facturas-admin',
    templateUrl: './consulta-facturas-admin.component.html',
    styleUrls: ['./consulta-facturas-admin.component.scss']
})

export class ConsultaFacturasAdminComponent implements OnInit {

    public consulta: any = {
        numeroFactura: null,
        estado: null,
        fechaInicio: null,
        fechaFin: null,
        tipo: null,
        idPuntoVenta: null,
        identificacionCliente: null,
        rol: 'ADMINISTRADOR',
        vendedor: null,
        nombreCliente: null
    };

    public fechaInicio: Date = null;
    public fechaFin: Date = null;
    public listaEstados: any[];
    public puntosVenta: any[];
    public vendedores: any[];
    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private currentPage = 0;
    public tipos = ['Cotización', 'Factura', 'Nota Crédito'];

    constructor(
        private notificarService: NotificarService,
        private fechaService: FechaService,
        private facturaService: FacturaService,
        private puntoVentaService: PuntoVentaService,
        private usuarioService: UsuarioService
    ) {
    }

    ngOnInit(): void {
        this.cargarDatos();
        this.inicio();
    }

    private cargarDatos() {
        const estadosObs: Observable<any> = this.facturaService.listarEstados();
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
            numeroFactura: null,
            estado: null,
            fechaInicio: null,
            fechaFin: null,
            tipo: null,
            idPuntoVenta: null,
            identificacionCliente: null,
            rol: 'ADMINISTRADOR',
            vendedor: null,
            nombreCliente: null
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
            this.notificarService.mostrarMensajeError('Ingrese al menos un criterio de búsqueda');
        }
    }

    obtenerDatosConsulta(page: number, size: number) {
        this.facturaService.consultarFacturas(page, size, this.consulta).subscribe(data => {
            this.notificarService.desactivarLoading();
            data.content.forEach(obj => {
                const usuario = this.vendedores.filter((vendedor) => {
                    return vendedor.nombreUsuario === obj.vendedor;
                });

                if (usuario !== null) {
                    obj.vendedor = usuario[0].nombreCompleto;
                }
            });
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

}
