import { Component, OnInit, Input } from '@angular/core';
import { CajaDetalle } from 'src/app/_dominio/cobros/cajaDetalle';
import { CierreCajaService } from 'src/app/_servicio/cobros/cierre-caja.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-consulta-caja-detalle',
    templateUrl: './consulta-caja-detalle.component.html',
    styleUrls: ['./consulta-caja-detalle.component.scss']
})
export class ConsultaCajaDetalleComponent implements OnInit {

    /* Parametros recibidos */
    @Input() public item: CajaDetalle;
    @Input() public perfil: string;
    @Input() public usuario: string;

    public detalle: any[] = [];
    constructor(
        private _notificarService: NotificarService,
        private _cajaService: CierreCajaService,
    ) { }

    ngOnInit(): void {
        this.consultarDetalle();
    }

    private consultarDetalle() {
        this._cajaService.consultarCierreCajaDetalle(this.item.caja.id, this.item.formaPago, this.usuario, this.perfil).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.detalle = data;
        })
    }

    public mostrarColumna(nombreColumna: string) {
        if (nombreColumna === 'numeroDocumento') {
            if ((this.item.formaPago === 'CHEQUE') || (this.item.formaPago === 'RETENCION') || (this.item.formaPago === 'TARJETA_DEBITO') || (this.item.formaPago === 'TRANSFERENCIA'))
                return true;
            return false;
        }

        if (nombreColumna === 'banco') {
            if ((this.item.formaPago === 'CHEQUE') || (this.item.formaPago === 'CHEQUE_A_FECHA') || (this.item.formaPago === 'TARJETA_DEBITO'))
                return true;
            return false;
        }

        return false;
    }
}
