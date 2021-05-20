import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Articulo } from 'src/app/_dominio/ventas/articulo';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { SessionService } from 'src/app/_servicio/session.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import * as _ from 'lodash';

const edicionVendedor = ['L'];

@Component({
    selector: 'app-articulo-vista-general',
    templateUrl: './articulo-vista-general.component.html',
    styleUrls: ['./articulo-vista-general.component.scss']
})
export class ArticuloVistaGeneralComponent implements OnInit {

    public criterioBusqueda: string = '';
    public gridArticulosView: GridDataResult;

    public articulos: Articulo[] = [];
    public state: State = {
        skip: 0,
        take: 10,
        sort: [],
    }

    constructor(
        private _articuloService: ArticuloService,
        private _sessionService: SessionService,
        private _notificarService: NotificarService,
        private _router: Router
    ) { }

    ngOnInit(): void {
    }

    public dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        this.gridArticulosView = process(this.articulos, this.state)
    }

    buscarArticuloPorCriterio() {
        if (this.criterioBusqueda != '')
            this._articuloService.listarPorCriterioPerfil(this.criterioBusqueda).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.articulos = data;
                this.gridArticulosView = process(data, this.state);
            });
        else
            this._notificarService.mostrarMensajeError('Ingrese un criterio de búsqueda');
    }

    verDetalles(articulo: Articulo) {
        if (this.validarPermisoEdicion(articulo)) {
            this._router.navigate([`articulos/editar/${articulo.ITEMNMBR}`])
        } else {
            this._notificarService.mostrarMensajeError('No cuenta con los permisos para editar este artículo');
        }
    }

    private validarPermisoEdicion(articulo: Articulo): boolean {
        let permitido: boolean = false;
        let perfil = this._sessionService.perfilNombre();
        debugger;
        switch (perfil) {
            case 'JEFE_VENTAS':
            case 'APROBADOR_COMERCIAL':
            case 'APROBADOR_CREDITO_Y_COBRANZAS':
            case 'VENDEDOR':
                permitido = _.includes(edicionVendedor, articulo.USCATVLS_2)
                break;

            default: permitido = false;
                break;
        }

        return permitido;
    }

}
