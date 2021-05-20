import { environment } from './../../../../environments/environment';
import { BuscarClienteDialogoComponent } from '../../cliente/buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { Cliente } from 'src/app/_dominio/ventas/cliente';
import { CondicionPagoService } from 'src/app/_servicio/sistema/condicion-pago.service';
import { CondicionPago } from 'src/app/_dominio/sistema/condicionPago';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { EmpresaService } from 'src/app/_servicio/ventas/empresa.service';
import { BuscarArticuloDialogoComponent } from './buscar-articulo-dialogo/buscar-articulo-dialogo.component';
import { Articulo } from 'src/app/_dominio/ventas/articulo';
import { CotizacionDetalle } from 'src/app/_dominio/ventas/cotizacionDetalle';
import { forkJoin, Observable } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { process, State } from '@progress/kendo-data-query';
import { EditService } from './edit.service';
import { map, switchMap } from 'rxjs/operators';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { CotizacionService } from 'src/app/_servicio/ventas/cotizacion.service';
import { SessionService } from 'src/app/_servicio/session.service';
import { CotizacionControles } from 'src/app/_dominio/ventas/cotizacionControles';
import { SecuencialService } from 'src/app/_servicio/sistema/secuencial.service';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { ConfiguracionSistemaService } from 'src/app/_servicio/sistema/configuracion-sistema.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import { StockDialogoComponent } from './buscar-articulo-dialogo/stock-dialogo/stock-dialogo.component';
import { ArticuloCompraDialogoComponent } from './articulo-compra-dialogo/articulo-compra-dialogo.component';
import * as _ from "lodash";
import { Proveedor } from 'src/app/_dominio/compras/proveedor';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { ArticuloCompraDTO } from 'src/app/_dto/compras/articuloCompraDTO';

@Component({
    selector: 'app-cotizacion',
    templateUrl: './cotizacion.component.html',
    styleUrls: ['./cotizacion.component.scss']
})
export class CotizacionComponent implements OnInit {

    @Input()
    private nombreComponentePadre: String;
    private idCotizacion: number;
    public edicion: boolean;
    public cotizacionRecuperada: Cotizacion;
    public view: Observable<GridDataResult>;
    public changes: any = {};
    public gridState: State = {
        sort: [],
        skip: 0
    };


    @ViewChild("containerCliente", { read: ViewContainerRef })
    public containerClienteRef: ViewContainerRef;
    @ViewChild("containerArticulo", { read: ViewContainerRef })
    public containerArticuloRef: ViewContainerRef;
    @ViewChild("containerConfirmacion", { read: ViewContainerRef })
    public containerConfirmacionRef: ViewContainerRef;
    @ViewChild("containerConfirmacionAnular", { read: ViewContainerRef })
    public containerConfirmacionAnularRef: ViewContainerRef;
    @ViewChild("containerCStock", { read: ViewContainerRef })
    public containerCStockRef: ViewContainerRef;
    @ViewChild("containerArticuloCompra", { read: ViewContainerRef})
    public containerArticuloCompra: ViewContainerRef;

    //Modelo Cotizacion
    public empresa: string;
    public fechaEmision: any;
    public numero: string;
    public estado: string;
    public cliente: Cliente;
    public creditoDisponible: string = '$ 0';
    public formaPago: string = 'CONTADO';
    public condicionPagoSeleccionado: CondicionPago;
    public detalle: CotizacionDetalle[] = [];
    public totalKilos: number = 0.00;
    public subTotal0: number = 0.00;
    public subTotal12: number = 0.00;
    public iva12: number = 0.00;
    public total: number = 0.00;
    public comentario: string;
    public comentario2: string;
    public ordenCliente: string;

    //Catalogos
    public condicionesPago: CondicionPago[];
    public condicionesPagoOriginal: CondicionPago[];
    public listaProveedores: Proveedor[] = [];

    //Busqueda Articulo
    public criterioBusquedaArticulo: string;
    //Stock Articulos
    private stockArticulos: any[] = [];
    private articulosSinStock: string[] = [];

    //ConfiguracionesSistema
    private porcentajeVariacionPrecio: number = 0;
    private maximoPorcentajeDescuentoFijo: number = 25;

    //ArticulosCompra
    private articulosCompra: any[] = [];

    constructor(private route: ActivatedRoute,
        private router: Router,
        public sessionService: SessionService,
        private fechaService: FechaService,
        private dialogService: DialogService,
        private notificarService: NotificarService,
        private empresaService: EmpresaService,
        private condicionPagoService: CondicionPagoService,
        private cotizacionService: CotizacionService,
        public editService: EditService,
        private secuencialService: SecuencialService,
        private clienteService: ClienteService,
        private configSistemaService: ConfiguracionSistemaService,
        private articuloService: ArticuloService,
        private formBuilder: FormBuilder,
        private comprasService: ComprasService) { }

    ngOnInit(): void {
        this.obtenerInformacionEmpresa();
        this.listarConfiguracionesSistema();
        this.editService.reset();
        this.route.params.subscribe((params: Params) => {
            this.idCotizacion = params['id'];
            this.edicion = params['id'] != null;
            this.inicializarFormulario();
        })

        this.view = this.editService.pipe(map(data => process(data, this.gridState)));
        this.editService.read();
        //this.calcularTotal();
    }

    private listarConfiguracionesSistema() {
        this.configSistemaService.obtenerPorcentajeVariacionPrecio().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.porcentajeVariacionPrecio = data.valor;
        })

        this.configSistemaService.obtenerPorcentajeMaximoDescuentoFijo().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.maximoPorcentajeDescuentoFijo = data.valor;
        })
    }

    private listarCondicionesPago() {
        this.condicionPagoService.listarTodosActivos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.condicionesPagoOriginal = data;
            this.condicionesPago = data.filter(x => x.tipoPago === this.formaPago)
        })
    }

    public onChangeFormaPago(value) {
        this.condicionPagoSeleccionado = null;
        this.condicionesPago = this.condicionesPagoOriginal.filter(x => x.tipoPago === value.target.value);
    }

    private obtenerInformacionEmpresa() {
        this.empresaService.informacionEmpresa().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.empresa = data.COMPANYNAME;
        })
    }

    public onStateChange(state: State) {
        this.gridState = state;

        this.editService.read();
    }

    public cellClickHandler({ sender, rowIndex, column, columnIndex, dataItem, isEdited }) {
        if (!isEdited && !this.isReadOnly(column.field)) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public cellCloseHandler(args: any) {
        const { formGroup, dataItem, column } = args;
        if (!formGroup.valid) {
            // prevent closing the edited cell if there are invalid values.
            args.preventDefault();
        } else if (formGroup.dirty) {
            let cotizacion = new Cotizacion();
            cotizacion.id = this.idCotizacion;
            this.cotizacionService.modificarLineaDetalle(cotizacion, formGroup.value).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.editService.assignValues(dataItem, data);
                this.editService.update(data);
                this.actualizarSaldos(null);
            });
        }
    }

    public financial(x) {
        return Number.parseFloat(x).toFixed(2);
    }

    public removeHandler({ sender, dataItem }) {
        //this.editService.remove(dataItem);
        let aux: CotizacionDetalle[] = [];
        this.cotizacionService.eliminarLineaDetalle(this.idCotizacion, dataItem.id).pipe(switchMap(() => {
            return this.cotizacionService.listarPorId(this.idCotizacion);
        })).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.detalle = this.ordenarDetalle(data.detalle);
            this.editService.next(this.detalle);
            this.actualizarSaldos(data);
        })
        sender.cancelCell();
    }

    public createFormGroup(dataItem: any): FormGroup {
        debugger;
        return this.formBuilder.group({
            'id': dataItem.id,
            'codigoArticulo': [dataItem.codigoArticulo, Validators.required],
            'descripcionArticulo': [dataItem.descripcionArticulo, Validators.compose([Validators.minLength(3), Validators.maxLength(100)])],
            'cantidad': [dataItem.cantidad, Validators.compose([Validators.required, Validators.min(0.00001), Validators.pattern('^[0-9]+(.[0-9]{0,2})?$')])],
            'precio': [dataItem.precio, Validators.pattern('^[0-9]+(.[0-9]{0,2})?$')],
            'descuentoFijo': [dataItem.descuentoFijo, Validators.compose([Validators.required, Validators.min(0), Validators.max(this.maximoPorcentajeDescuentoFijo), Validators.pattern('^[0-9]+(.[0-9]{0,2})?$')])],
            'subTotal': dataItem.subTotal,
            'descuentoAdicional': [dataItem.descuentoAdicional, Validators.max(this.porcentajeVariacionPrecio)],
            'total': dataItem.total,
            'generaCompra': dataItem.generaCompra
        });
    }

    private actualizarSaldos(cotizacion: Cotizacion) {
        if (cotizacion == null) {
            this.cotizacionService.listarPorId(this.idCotizacion).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.subTotal0 = data.subtotaNoIVA;
                this.subTotal12 = data.subtotalIVA;
                this.totalKilos = data.totalKilos;
                this.iva12 = data.totalIva;
                this.total = data.total;
            })
        } else {
            this.subTotal0 = cotizacion.subtotaNoIVA;
            this.subTotal12 = cotizacion.subtotalIVA;
            this.totalKilos = cotizacion.totalKilos;
            this.iva12 = cotizacion.totalIva;
            this.total = cotizacion.total;
        }
    }

    private isReadOnly(field: string): boolean {
        const readOnlyColumns = ['codigoArticulo',
            'subTotal',
            'total',
            this.sessionService.puedeEditarDescripcionArticulo() ? '' : 'descripcionArticulo',
            this.sessionService.puedeEditarDescuentoFijo() ? '' : 'descuentoFijo',
            this.sessionService.puedeEditarPrecioArticulo() ? '' : 'precio',
            this.sessionService.puedeEditarDescuendoAdicional() ? '' : 'descuentoAdicional'];
        return readOnlyColumns.indexOf(field) > -1;
    }

    inicializarFormulario() {
        debugger;
        if (this.edicion) {
            this.cotizacionService.listarPorId(this.idCotizacion).subscribe(data => {
                this.cotizacionRecuperada = data;
                this.recuperarCliente(data.codigoCliente);
                this.fechaEmision = this.fechaService.formatearFecha(data.fechaEmision);
                this.estado = data.estado;
                this.numero = data.numero;
                this.formaPago = data.formaPago;
                this.detalle = this.ordenarDetalle(data.detalle);
                this.editService.next(this.ordenarDetalle(data.detalle));
                this.comentario = data.comentario;
                this.comentario2 = data.comentario2;
                this.ordenCliente = data.ordenCliente;
                this.actualizarSaldos(data);
            })
        } else {
            this.fechaEmision = this.fechaService.fechaActual();
            this.estado = "NUEVO";
            this.listarCondicionesPago();
            this.editService.next([]);
        }
    }

    private clienteYCondicionesPagoVO(codigoCliente: string): Observable<any[]> {
        let clienteVO = this.clienteService.listarPorCustomerNumber(codigoCliente);
        let condicionesPagoVO = this.condicionPagoService.listarTodosActivos();
        return forkJoin([clienteVO, condicionesPagoVO]);
    }

    private recuperarCliente(codigoCliente: string) {
        this.clienteYCondicionesPagoVO(codigoCliente).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.cliente = data[0];
            this.condicionesPago = data[1];
            this.condicionesPagoOriginal = data[1];
            this.condicionPagoSeleccionado = this.condicionesPago.find(x => x.termino === this.cotizacionRecuperada.condicionPago);
            this.consultarLimiteCreditoDisponible();
        })
    }

    abrirBuscarClienteDialogo() {
        const dialogRef = this.dialogService.open({
            appendTo: this.containerClienteRef,
            content: BuscarClienteDialogoComponent,
            minWidth: 300,
            maxWidth: 600,
            title: 'Buscar Cliente',
            actions: [{ text: 'Cancelar' }, { text: 'Seleccionar', primary: true }],
            preventAction: (ev, dialog) => {
                if (ev['text'] === 'Seleccionar')
                    return dialog.content.instance.clienteSeleccionado.length > 0 ? false : true;
                else
                    return false;
            }
        });

        const cliente = dialogRef.content.instance;

        dialogRef.result.subscribe(r => {
            if (r['text'] == 'Seleccionar') {
                this.cargarClienteSeleccionado(cliente.clienteSeleccionado[0]);
            }
            if (r['text'] == 'Cancelar') {
                dialogRef.close();
                dialogRef.dialog = null;
            }
        });
    }

    abrirDialogoCompras(dataItem: any){
        const dialogoRefArticuloCompra = this.dialogService.open({
            appendTo: this.containerArticuloCompra,
            content: ArticuloCompraDialogoComponent,
            height: '80%',
            maxWidth: '50%',
            title: 'Artículo Compra',
            actions: [{ text: 'Cancelar'}, { text: 'Aceptar', primary: true}],
            preventAction: (e, dialog) => {
                if (e['text'] === 'Aceptar')
                    return dialog.content.instance.validarFormulario();
                else
                    return false;
            }
        });

        const articuloCompra = dialogoRefArticuloCompra.content.instance;
        articuloCompra.cotizacionDetalle = dataItem;
        articuloCompra.cotizacionId = this.idCotizacion;
        articuloCompra.listaProveedores = this.listaProveedores;
        //if(!_.isEmpty(this.articulosCompra))
        dialogoRefArticuloCompra.result.subscribe(e => {
            if (e['text'] == 'Aceptar') {
                let articuloCompras = dialogoRefArticuloCompra.content.instance.crearArticuloCompraDTO();
                this.crearArticuloCompraDTO(articuloCompras);
                //dialogoRefArticuloCompra.close();
            }
            if (e['text'] == 'Cancelar') {
                dialogoRefArticuloCompra.close();
            }
        });
    }

    abrirBuscarArticuloDialogo() {
        const dialogRefArticulo = this.dialogService.open({
            appendTo: this.containerArticuloRef,
            content: BuscarArticuloDialogoComponent,
            height: '100%',
            maxWidth: '100%',
            title: 'Buscar Artículo',
            actions: [{ text: 'Cancelar' }, { text: 'Seleccionar', primary: true }],
            /*  preventAction: (ev, dialog) => {
                    return dialog.content.instance.clienteEncontrado == null;
             } */
        });

        const articulos = dialogRefArticulo.content.instance;
        articulos.criterioBusqueda = this.criterioBusquedaArticulo;
        dialogRefArticulo.result.subscribe(r => {
            if (r['text'] == 'Seleccionar') {
                this.cargarArticulosSeleccionado(articulos.mySelection);
                dialogRefArticulo.close();

            }
            if (r['text'] == 'Cancelar') {
                dialogRefArticulo.close();

            }
        });
    }

    cargarClienteSeleccionado(clienteSeleccionado: Cliente) {
        this.cliente = clienteSeleccionado;
        this.condicionPagoSeleccionado = this.condicionesPagoOriginal.find(x => x.termino == clienteSeleccionado.PYMTRMID);
        this.consultarLimiteCreditoDisponible();
        if (this.condicionPagoSeleccionado !== undefined) {
            this.formaPago = this.condicionPagoSeleccionado.tipoPago;
            this.condicionesPago = this.condicionesPagoOriginal.filter(x => x.tipoPago === this.condicionPagoSeleccionado.tipoPago);
        }
    }

    cargarArticulosSeleccionado(articulos: Articulo[]) {
        if (articulos.length > 0) {
            let cotizacion = this.crearCotizacion();
            this.cotizacionService.agregarLineaDetalle(cotizacion, articulos).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.idCotizacion = data.id;
                this.edicion = true;
                this.detalle = this.ordenarDetalle(data.detalle);
                this.numero = data.numero;
                this.verificarArticulosReventa(articulos);
                this.editService.next(this.detalle);
                this.actualizarSaldos(null);
            });
        }
    }

    verificarArticulosReventa(articulos: Articulo[]){
        console.log('Iimpresion articulos cotizados');
        console.log(articulos);
    }

    private consultarLimiteCreditoDisponible() {
        this.clienteService.calcularCreditoDisponible(this.cliente.CUSTNMBR, this.cliente.CRLMTAMT).subscribe(data => {
            this.creditoDisponible = `$ ${data}`;
        })
    }

    public guardar() {
        const cotizacion = this.crearCotizacion();
        if (this.validarCotizacionModelo(cotizacion)) {
            if (this.edicion) {
                this.cotizacionService.modificar(cotizacion).pipe(switchMap(() => {
                    return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
                })).subscribe(data => {
                    this.notificarMensaje("Cotización Modificada")
                    this.cotizacionService.cotizacionCambio.next(data);
                    this.router.navigate(['ventas/overview']);
                })
            } else {
                this.cotizacionService.registrar(cotizacion).pipe(switchMap(() => {
                    return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
                })).subscribe(data => {
                    this.notificarMensaje("Cotización Registrada")
                    this.cotizacionService.cotizacionCambio.next(data);
                    this.router.navigate(['ventas/overview']);
                })
            }
        } else {
            this.notificarService.mostrarMensajeError("No se puede guardar la Cotización verifique los campos y al menos ingrese un artículo")
        }
    }

    public anular() {
        const cotizacion = this.crearCotizacion();
        if (cotizacion.numero.length) {
            this.cotizacionService.anularDocumento(cotizacion).pipe(switchMap(() => {
                return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
            })).subscribe(data => {
                this.notificarMensaje(`Cotización ${cotizacion.numero} anulada`);
                this.cotizacionService.cotizacionCambio.next(data);
                this.router.navigate(['ventas/overview']);
            });
        }
    }

    public eliminar() {
        if (this.numero === undefined) {
            this.redireccionarInicio();
        }
    }

    private crearCotizacion() {
        let cotizacion = new Cotizacion();
        cotizacion.id = this.idCotizacion;
        cotizacion.empresa = this.empresa;
        cotizacion.codigoCliente = this.cliente ? this.cliente.CUSTNMBR : null;
        cotizacion.nombreCliente = this.cliente ? this.cliente.CUSTNAME : null;
        cotizacion.codigoDireccion = this.cliente ? this.cliente.ADRSCODE : null;
        cotizacion.descripcionDireccion = this.cliente ? this.cliente.ADDRESS1 : null;
        cotizacion.estado = this.estado;
        cotizacion.numero = this.numero;
        cotizacion.formaPago = this.formaPago;
        cotizacion.condicionPago = this.condicionPagoSeleccionado ? this.condicionPagoSeleccionado.termino : null;
        /* cotizacion.totalBaseImponible = this.subTotal12 + this.subTotal0;
        cotizacion.totalIva = this.iva12;
        cotizacion.total = this.total; */
        cotizacion.comentario = this.comentario;
        cotizacion.comentario2 = this.comentario2;
        cotizacion.puntoVenta = this.sessionService.puntoVenta();
        cotizacion.ordenCliente = this.ordenCliente;
        cotizacion.codigoVendedor = "-";
        return cotizacion;
    }

    private validarCotizacionModelo(cotizacion: Cotizacion) {
        if ((cotizacion.codigoCliente !== null) && (cotizacion.condicionPago !== null)) {
            if (this.ordenCliente !== undefined && this.ordenCliente !== null) {
                if (this.ordenCliente.length > 20) {
                    this.notificarService.mostrarMensajeError("El campo O.C Cliente solo permite 20 caractéres")
                    return false;
                }
                return true;
            }
            return true;
        } else {
            return false;
        }
    }

    private condicionPagoCambio(): boolean {
        if (this.condicionPagoSeleccionado.termino === 'CONTADO') {
            return false;
        } else {
            return this.condicionPagoSeleccionado.termino == this.cliente.PYMTRMID ? false : true;
        }

    }

    private descuentoAdicionalCambio(): boolean {
        let result: boolean = false;
        this.detalle.map(x => {
            if (x.descuentoAdicional > 0) {
                result = true
            }
        })
        return result;
    }

    public cotizarDocumento() {
        debugger;
        const cotizacion = this.crearCotizacion();
        if (this.validarCotizacionModelo(cotizacion)) {
            if(this.isPreciosCompletos()){
                this.cotizacionService.modificar(cotizacion).subscribe(dataC => {
                    this.notificarService.desactivarLoading();
                    this.cotizacionService.validarCotizacion(cotizacion.id).subscribe(data => {
                        this.notificarService.desactivarLoading();
                        this.comprasService.validarCantidadesCompra(cotizacion.id).subscribe(dataOc => {
                            this.notificarService.desactivarLoading();
                            if(dataOc.respuesta){
                                if (data.length) {
                                    this.confirmarEnviarCotizacionAprobar(dataC,data);
                                } else {
                                    this.generarCotizacion(cotizacion);
                                }
                            }else{
                                this.notificarService.mostrarMensajeError('Ha ocurrido un problema con la cotización');
                            }
                        });
                    })
                })

                /*   if (this.condicionPagoCambio() || this.descuentoAdicionalCambio()) {
                      this.confirmarEnviarCotizacionAprobar(cotizacion, this.condicionPagoCambio(), this.descuentoAdicionalCambio());
                  } else {
                      this.generarCotizacion(cotizacion);
                  } */
            }else{
                this.notificarService.mostrarMensajeError("Verifique los precios de algunos artículos")
            }

        } else {
            this.notificarService.mostrarMensajeError("No se puede cotizar, verifique los campos y al menos ingrese un artículo")
        }
    }

    public isPreciosCompletos() : boolean{
        debugger;
        let articulosPrecioCero = _.filter(this.detalle, d => d.precioUnitario == 0);
        let valido = !(articulosPrecioCero.length > 0);
        return valido;
    }

    public facturarDocumento() {
        const cotizacion = this.crearCotizacion();
        if (this.validarCotizacionModelo(cotizacion)) {
            if(this.isPreciosCompletos()){
                this.comprasService.validarCantidadesCompra(cotizacion.id).subscribe(dataOc => {
                    if(dataOc.respuesta){
                        if (this.edicion) {
                            this.cotizacionService.modificar(cotizacion).subscribe(data => {
                                this.notificarService.desactivarLoading();
                                this.router.navigate(['ventas/factura', data.id]);
                            })
                        } else {
                            this.cotizacionService.registrar(cotizacion).subscribe(data => {
                                this.notificarService.desactivarLoading();
                                this.router.navigate(['ventas/factura', data.id]);
                            })
                        }
                    }else{
                        this.notificarService.mostrarMensajeError('Ha ocurrido un problema con la cotización');
                    }
                });
            }else{
                this.notificarService.mostrarMensajeError("Verifique los precios de algunos artículos")
            }
        } else {
            this.notificarService.mostrarMensajeError("No se puede Facturar, verifique los campos y al menos ingrese un artículo");
        }

    }

    private confirmarEnviarCotizacionAprobar(cotizacion: Cotizacion, validaciones: any[]) {

        let confirm: string = " \n ¿ Quiere proceder a la aprobación de la cotización para que un aprobador revise el documento ?";
        let mensajeNovedades = validaciones.join(', ');
        let mensaje: string = `La cotización requiere de una aprobación dado que ha habido ${mensajeNovedades} ${confirm}`;

        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Enviar', primary: true }
            ],
            width: 450,
            height: 250,
            minWidth: 250
        });

        dialog.result.subscribe((result) => {
            if (result['text'] === 'Enviar') {
                this.cotizacionService.enviarDocumentoAprobar(cotizacion).pipe(switchMap(() => {
                    return this.cotizacionService.listarTodosPorUsuarioYPuntoVenta();
                })).subscribe(data => {
                    this.notificarMensaje("Cotización enviada.");
                    this.cotizacionService.cotizacionCambio.next(data);
                    this.router.navigate(['ventas/overview']);
                });
            }
        });
    }

    private generarCotizacion(cotizacion: Cotizacion) {
        this.cotizacionService.cotizarDocumento(cotizacion).subscribe(data => {
            this.notificarMensaje(`Cotización ${cotizacion.numero} generada`);
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `${cotizacion.numero}_${this.fechaService.fechaActual()}`;
            a.click();
            this.redireccionarInicio();
            //window.URL.revokeObjectURL(fileURL);
            //window.open(a.href);
            //a.remove();
        })
    }

    public mostrarConfirmacionAnular() {
        let mensaje: string = "¿ Está seguro que desea anular la cotización ?";
        const dialog: DialogRef = this.dialogService.open({
            appendTo: this.containerConfirmacionAnularRef,
            title: 'Confirmación',
            content: mensaje,
            actions: [
                { text: 'No' },
                { text: 'Sí', primary: true }
            ],
            width: 450,
            height: 150,
            minWidth: 200
        });

        dialog.result.subscribe((result) => {
            if (result instanceof DialogCloseResult) {

            } else {
                if (result['text'] === 'Sí') {
                    this.anular();
                }
            }
        });
    }

    private redireccionarInicio() {
        this.cotizacionService.listarTodosPorUsuarioYPuntoVenta().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.cotizacionService.cotizacionCambio.next(data);
            this.router.navigate(['ventas/overview']);
        })
    }

    notificarMensaje(mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    consultarStock(value) {
        this.articuloService.obtenerStockArticuloPorItemnmbr(value.codigoArticulo).subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.abrirStockDialogo(data);
        })
    }

    abrirStockDialogo(data) {
        const dialogRefStock = this.dialogService.open({
            appendTo: this.containerCStockRef,
            content: StockDialogoComponent,
            minWidth: 400,
            maxWidth: 500,
            title: `Stock: ${data.codigoArticulo}`,
            actions: [{ text: 'Aceptar', primary: true }],
        });

        const stockArticulos = dialogRefStock.content.instance;
        stockArticulos.stock = data;
        dialogRefStock.result.subscribe(r => {

            if (r['text'] == 'Aceptar') {
                dialogRefStock.close();
            }
        });
    }

    public puedeCambiarCliente() {
        if (this.estado === 'NUEVO')
            return false;
        else return true;
    }

    private crearArticuloCompraDTO(articuloCompra: ArticuloCompraDTO){
        this.comprasService.crearActualizarArticuloCompra(articuloCompra).subscribe(data => {
            this.notificarService.desactivarLoading();
            if(data.mensajeCodigo === 'OK'){
                this.notificarService.mostrarMensajeExito(data.mensaje);
                this.detalle = this.ordenarDetalle(data.cotizacion.detalle);
                this.editService.next(this.detalle);
            }else
                this.notificarService.mostrarMensajeError(data.mensaje);
        });
    }

    private ordenarDetalle(data: CotizacionDetalle[]){
        return _.sortBy(data, [(o) => {return o.id}])
    }

}
