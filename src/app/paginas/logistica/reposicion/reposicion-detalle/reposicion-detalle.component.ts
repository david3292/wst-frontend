import { Component, OnInit } from '@angular/core';
import { ArticuloReposicionDTO } from 'src/app/_dto/logistica/articuloReposicionDTO';
import { ReposicionDetalleDTO } from 'src/app/_dto/logistica/reposicionDetalleDTO';
import { ReposicionService } from 'src/app/_servicio/logistica/reposicion.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-reposicion-detalle',
    templateUrl: './reposicion-detalle.component.html',
    styleUrls: ['./reposicion-detalle.component.scss']
})
export class ReposicionDetalleComponent implements OnInit {

    public itemReposicion: ReposicionDetalleDTO;
    public articuloReposicion: ArticuloReposicionDTO;

    constructor(
        private _reposicionService: ReposicionService,
        private _notificarService: NotificarService,
    ) { }

    ngOnInit(): void {
        this.obtenerReposicionIndividual(this.itemReposicion.bodegaOrigen, true);
    }

    public selectedChange(e, bodega: string) {
        if (e && bodega === 'origen') {
            this.obtenerReposicionIndividual(this.itemReposicion.bodegaOrigen, true);
        }

        if (e && bodega === 'destino') {
            this.obtenerReposicionIndividual(this.itemReposicion.bodegaDestino, false);
        }
    }

    private obtenerReposicionIndividual(codigoBodega: string, bodegaOrigen: boolean) {
        this._reposicionService.reposicionArticulo(this.itemReposicion.codigoArticulo, codigoBodega, bodegaOrigen, this.itemReposicion.cantidadReponer).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.articuloReposicion = data;
        })
    }

}
