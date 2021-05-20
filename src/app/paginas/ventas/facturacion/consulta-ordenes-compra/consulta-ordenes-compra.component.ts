import { Component, OnInit } from '@angular/core';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from 'lodash';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-consulta-ordenes-compra',
    templateUrl: './consulta-ordenes-compra.component.html',
    styleUrls: ['./consulta-ordenes-compra.component.scss']
})
export class ConsultaOrdenesCompraComponent implements OnInit {

    public cotizacionId: any;
    public ordenesCompra: OrdenCompraDTO[];
    public ordenCompraSeleccion: OrdenCompraDTO;
    public mostrarOptionGenerarCompras: boolean = false;

    constructor(
        private _comprasService: ComprasService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
        this.validarBotonGenerarCompras();
    }

    validarBotonGenerarCompras(){
        if(!_.isEmpty(this.ordenesCompra)){
            let lista = _.filter(this.ordenesCompra, (o) => {
                return o.estado !== 'APROBADO';
            });

            this.mostrarOptionGenerarCompras = !(lista.length > 0);

            _.remove(this.ordenesCompra, (o) => { return o.estado === 'NUEVO' });
        }
    }

    generarCompras(){
        debugger;
        this._comprasService.integrarOrdenesCompraPorCotizacionId(this.cotizacionId).pipe(
            switchMap(() => {
                return this._comprasService.listarOrdenesCompraPorCotizacionId(this.cotizacionId)
            })
        ).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.ordenesCompra = data;
            this.validarBotonGenerarCompras();
        })
    }

    generarReportePdf(ordenCompra: OrdenCompraDTO){
        this.ordenCompraSeleccion = ordenCompra;
        this._comprasService.generarReporteOrdenCompra(ordenCompra.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `OrdenCompra_${this.ordenCompraSeleccion.numero}`;
            a.click();
        });
    }

}
