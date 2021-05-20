import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { switchMap } from 'rxjs/operators';
import { ArticuloCompartimiento } from 'src/app/_dominio/logistica/articuloCompartimiento';
import { DocumentoDetalle } from 'src/app/_dominio/ventas/documentoDetalle';
import { DocumentoDetalleCompartimiento } from 'src/app/_dominio/ventas/documentoDetalleCompartimiento';
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from "lodash";
import { ListViewDataResult } from '@progress/kendo-angular-listview';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-stock-item-bin-dialogo',
    templateUrl: './stock-item-bin-dialogo.component.html',
    styleUrls: ['./stock-item-bin-dialogo.component.scss']
})
export class StockItemBinDialogoComponent implements OnInit {

    public transferenciaId: number;
    public documentoDetalle: DocumentoDetalle;
    public documentoDetalleSeleccionado: DocumentoDetalle;
    public articuloCompartimientos: ArticuloCompartimiento[];
    public articuloCompartimientosData: ArticuloCompartimiento[];

    public detalleCompartimientos: any[];
    public activarAceptar: boolean = false;
    public totalEnviar: number = 0;
    public mensajeError: string;
    public tipoTransferencia: string = 'SN';

    private esCargaInicial: boolean = true;
    public saldo: number;

    public compartimientoSeleccionado: ArticuloCompartimiento;

    public view: ListViewDataResult;

    constructor(
        public dialogo: DialogRef,
        private _notificarServicio: NotificarService,
        private _transferenciasServicio: TransferenciasService
    ) { }

    ngOnInit(): void {
    }

    construir(){
        if(this.tipoTransferencia === 'entrada'){
            this.cargaBinsTraneferenciaEntrada();
        }else{
            if(this.articuloTieneCompartimientos())
                this.match();
            else
                this.cargaInicial();
        }
    }

    private articuloTieneCompartimientos(): boolean {
        return this.documentoDetalle.compartimientos != null && this.documentoDetalle.compartimientos.length > 0;
    }

    private cargaBinsTraneferenciaEntrada(){
        this.esCargaInicial = false;
        this.totalEnviar = this.documentoDetalle.cantidad;
        this.articuloCompartimientosData = this.articuloCompartimientos.slice();
        this.saldo = this.documentoDetalleSeleccionado.total;
        if(!_.isEmpty(this.documentoDetalle.compartimientos)){
            this.detalleCompartimientos = _.map(this.documentoDetalle.compartimientos, dc => {
                let articuloCompartimiento = _.first(_.filter(this.articuloCompartimientos, ac => dc.compartimiento === ac.compartimiento));
                return {
                    "compartimiento": articuloCompartimiento.compartimiento,
                    "cantidadTotal": articuloCompartimiento.cantidadExistente,
                    "cantidadReservada": articuloCompartimiento.cantidadReservada,
                    "cantidadDisponible": articuloCompartimiento.cantidadTotal,
                    "cantidadTransferencia": dc.cantidad
                }
            });
            this.actualizarCompartimientos().subscribe(data => this.view = data);
        }
    }

    handleFilter(value) {
        this.articuloCompartimientosData = this.articuloCompartimientos.filter((s) => s.compartimiento.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    private actualizarCompartimientos(): Observable<ListViewDataResult>{
        return of({
            data: this.detalleCompartimientos,
            total: this.detalleCompartimientos.length
        });
    }

    agregarBin(){
        if(this.detalleCompartimientos === undefined)
            this.detalleCompartimientos = new Array<any>();

        if(!(this.compartimientoSeleccionado === null || this.compartimientoSeleccionado == undefined)){
            let listaFiltro = _.filter(this.detalleCompartimientos, dc => dc.compartimiento === this.compartimientoSeleccionado.compartimiento);
            if(_.size(listaFiltro) > 0){
                this._notificarServicio.mostrarMensajeInformacion('El compartimiento ya ha sido agregado');
            }else{
                let compartimientoAgregar: any = new Object();
                compartimientoAgregar.compartimiento = this.compartimientoSeleccionado.compartimiento;
                compartimientoAgregar.cantidadTotal = this.compartimientoSeleccionado.cantidadExistente;
                compartimientoAgregar.cantidadReservada = this.compartimientoSeleccionado.cantidadReservada;
                compartimientoAgregar.cantidadDisponible = this.compartimientoSeleccionado.cantidadTotal;
                compartimientoAgregar.cantidadTransferencia = 0

                this.detalleCompartimientos.push(compartimientoAgregar);
                this.actualizarCompartimientos().subscribe(data => this.view = data);
            }
        }
    }

    removerCompartimiento(compartimiento: any){
        _.remove(this.detalleCompartimientos, dc => dc.compartimiento === compartimiento.compartimiento);
        this.actualizarCompartimientos().subscribe(data => this.view = data);
        this.onBlur();
    }

    private cargaInicial(){
        this.saldo = this.documentoDetalleSeleccionado.saldo;
        this.detalleCompartimientos = this.articuloCompartimientos.map(dc => {
            return {
                "compartimiento": dc.compartimiento,
                "cantidadTotal": dc.cantidadExistente,
                "cantidadReservada": dc.cantidadReservada,
                "cantidadDisponible": dc.cantidadTotal,
                "cantidadTransferencia": 0
            }
        });
        this.detalleCompartimientos = this.sortedDesc(this.detalleCompartimientos);
    }

    private match(){
        this.esCargaInicial = false;
        this.saldo = this.documentoDetalleSeleccionado.total;
        this.totalEnviar = this.documentoDetalle.cantidad;
        this.detalleCompartimientos = this.articuloCompartimientos.map(dc => {
            let docDetalle = this.documentoDetalle.compartimientos.find(c => c.compartimiento === dc.compartimiento);
            let cantidadTransferencia = docDetalle !== undefined ? docDetalle.cantidad : 0;
            return {
                "compartimiento": dc.compartimiento,
                "cantidadTotal": dc.cantidadExistente,
                "cantidadReservada": dc.cantidadReservada - cantidadTransferencia,
                "cantidadDisponible": dc.cantidadTotal + cantidadTransferencia,
                "cantidadTransferencia": cantidadTransferencia
            }
        });
        this.detalleCompartimientos = this.sortedDesc(this.detalleCompartimientos);
    }

    private sortedDesc(articulsoCompartimientos: any[]): any[]{
        let listaOrdenada =_.sortBy(articulsoCompartimientos, [(a) => a.cantidadDisponible]);
        return _.reverse(listaOrdenada);
    }

    onChange(value: any, dataItem: any){
        dataItem.cantidadTransferencia = value;
        if(this.tipoTransferencia === 'salida'){
            if( value > dataItem.cantidadDisponible){
                this.mensajeError = "La cantidad ingresada es mayor a la disponible";
                this.activarAceptar = false;
            }else{
                this.validarCantidadTotal();
            }
        }
    }

    onBlur(){
        this.validarCantidadTotal();
    }

    existenCantidadesMayores(): boolean{
        if(this.tipoTransferencia === 'salida'){
            let cantidadesMayores =_.filter(this.detalleCompartimientos, x => x.cantidadTransferencia > x.cantidadDisponible);
            return cantidadesMayores.length > 0;
        }else{
            return false;
        }
    }

    validarCantidadTotal(){
        if(this.existenCantidadesMayores()){
            this.mensajeError = "No se puede ingresar una cantidad mayor a la disponible";
            this.activarAceptar = false;
        }else{
            this.totalEnviar = 0;
            this.detalleCompartimientos.forEach(dc => {
                this.totalEnviar+=dc.cantidadTransferencia;
            });
            if(this.totalEnviar > this.saldo){
                this.mensajeError = "No se puede transferir una cantidad mayor al saldo pendiente";
                this.activarAceptar = false;
            }else{
                this.documentoDetalle.cantidad = this.totalEnviar;
                this.documentoDetalle.saldo = this.saldo - this.totalEnviar;
                this.mensajeError = undefined;
                this.activarAceptar = true;
            }
        }
    }

    guardarInformacion(){
        if(!this.esCargaInicial)
            this.documentoDetalle.compartimientos = [];

        if(this.existeCantidadesNegativas())
            this.mensajeError = 'Existen cantidades negativas';
        else{
            this.mensajeError = undefined;
            this.crearCompartimientos();
        }
    }

    existeCantidadesNegativas(): boolean{
        let existe: boolean = false;
        let cantidad = _.filter(this.detalleCompartimientos, (c) => {return c.cantidadTransferencia < 0}).length;
        existe = cantidad > 0;
        return existe;
    }

    crearCompartimientos(){
        this.detalleCompartimientos.filter(dc => dc.cantidadTransferencia > 0).forEach(dc => {
            let docDetalleCompartimiento = new DocumentoDetalleCompartimiento();
            docDetalleCompartimiento.cantidad = dc.cantidadTransferencia;
            docDetalleCompartimiento.compartimiento = dc.compartimiento;
            this.documentoDetalle.compartimientos.push(docDetalleCompartimiento);
        });
        if(this.tipoTransferencia === 'salida')
            this.actualizarDocumentoDetalleSalida();
        else
            this.actualizarDocumentoDetalleEntrada()
    }

    private actualizarDocumentoDetalleSalida(){
        this._transferenciasServicio.actualizarDocumentoDetalleSalida(this.transferenciaId,this.documentoDetalle)
            .pipe(switchMap(() => {
                return this._transferenciasServicio.obtenerTransferenciaSalidaPorId(this.transferenciaId);
            }))
            .subscribe(data => {
                this.cerrarDialogo();
                this._transferenciasServicio.transferenciaCambio.next(data);
            });
    }

    private actualizarDocumentoDetalleEntrada(){
        this._transferenciasServicio.actualizarDocumentoDetalleEntrada(this.transferenciaId,this.documentoDetalle)
            .pipe(switchMap(() => {
                return this._transferenciasServicio.obtenerTransferenciaEntradaPorId(this.transferenciaId);
            }))
            .subscribe(data => {
                this.cerrarDialogo();
                this._transferenciasServicio.transferenciaCambio.next(data);
            });
    }

    cerrarDialogo(){
        this.dialogo.close();
    }
}
