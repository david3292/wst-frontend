import { NotificarService } from './../../../../_servicio/notificar.service';
import { Component, Input, OnInit } from '@angular/core';
import { Cotizacion } from 'src/app/_dominio/ventas/cotizacion';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { CotizacionService } from 'src/app/_servicio/ventas/cotizacion.service';

@Component({
    selector: 'app-cabecera',
    templateUrl: './cabecera.component.html',
    styleUrls: ['./cabecera.component.scss']
})
export class CabeceraComponent implements OnInit {

    @Input()
    documento: Cotizacion = new Cotizacion();
    @Input()
    ventanaPadre: string;

    public creditoDisponible: number = 0;
    public condicionPagoPredeterminado: string;
    public creditoDisponibleGP: number = 0;
    public creditoDisponibleGPCadena: string;
    public ordenCliente: string;

    constructor(
        private clienteService: ClienteService,
        private notificarService: NotificarService,
        private _cotizacionService: CotizacionService
    ) { }

    ngOnInit(): void {
        this.obtenerCliente();
        this.ordenCliente = this.documento.ordenCliente;
    }

    private obtenerCliente() {
        this.clienteService.listarPorCustomerNumber(this.documento.codigoCliente).subscribe(data => {
            this.notificarService.desactivarLoading();
            this.condicionPagoPredeterminado = data.PYMTRMID;
            if (data.CRLMTTYP === 1) {
                this.creditoDisponibleGPCadena = 'ILIMITADO'
            } else {
                this.creditoDisponibleGP = data.CRLMTAMT
            }
            this.calcularCreditoDisponible(data.CRLMTAMT);
        })
    }

    private calcularCreditoDisponible(creditodisponible: number) {
        this.clienteService.calcularCreditoDisponible(this.documento.codigoCliente, creditodisponible).subscribe(data => {
            this.creditoDisponible = data;
        })
    }

    public solicitadoPorAprobaciones(): boolean {
        if (this.ventanaPadre === 'aprobaciones')
            return true;
        return false;
    }

    public editarValorOC() {
        if (this.ordenCliente !== this.documento.ordenCliente) {
            let objAModificar = new Cotizacion();
            objAModificar.id = this.documento.id;
            objAModificar.ordenCliente = this.ordenCliente;
            this._cotizacionService.editarOrdenCliente(objAModificar).subscribe(data => {
                this.notificarService.desactivarLoading();
                this.notificarService.mostrarMensajeExito("Orden Cliente modificado con éxito.");
                this.documento.ordenCliente = this.ordenCliente;
            })
        }
    }

    public desactivarOC(){
        if (this.ventanaPadre === 'facturaciones')
            return false;
        return true;
    }

}
