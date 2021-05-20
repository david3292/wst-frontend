import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { BodegaService } from 'src/app/_servicio/sistema/bodega.service';
import { ArticuloService } from 'src/app/_servicio/ventas/articulo.service';
import * as _ from 'lodash';
import { DialogCloseResult, DialogService } from '@progress/kendo-angular-dialog';

const crearArticuloFormulario = dataItem => new FormGroup({
    'ITEMNMBR': new FormControl(dataItem.ITEMNMBR),
    'ITMSHNAM': new FormControl(dataItem.ITMSHNAM),
    'ITEMDESC': new FormControl(dataItem.ITEMDESC, Validators.required),
    'ITMCLSCD': new FormControl(dataItem.ITMCLSCD, Validators.required),
    'PRCHSUOM': new FormControl(dataItem.PRCHSUOM, Validators.required),
    //'UOMSCHDL': new FormControl(dataItem.UOMSCHDL, Validators.required),
    'PRCLEVEL': new FormControl(dataItem.PRCLEVEL, Validators.required),
    'USCATVAL': new FormControl(dataItem.USCATVAL),
    'DECPLQTY': new FormControl(dataItem.DECPLQTY, [Validators.required, Validators.max(5)]),
    //'DECPLCUR': new FormControl(dataItem.DECPLCUR, [Validators.required, Validators.max(5)]),
    'LOCNCODE': new FormControl(dataItem.LOCNCODE, Validators.required),
    'PESO': new FormControl(dataItem.PESO, [Validators.required, Validators.min(0.00001)])
});

@Component({
    selector: 'app-articulo',
    templateUrl: './articulo.component.html',
    styleUrls: ['./articulo.component.scss']
})
export class ArticuloComponent implements OnInit {

    public formularioArticulo: FormGroup;
    public articulo: any = new Object();
    public esNuevo: boolean = true;
    public habilitarBotonGuardar: boolean = true;

    public unidadesMedida: string[] = [];
    public clases: string[] = [];
    public marcas: string[] = [];
    public listaPrecios: string[] = [];
    public bodegas: string[] = [];

    public mensajeError: string = undefined;

    @ViewChild("containerDialogRef", { read: ViewContainerRef })
    public containerDialogRef: ViewContainerRef;

    constructor(
        private _articuloService: ArticuloService,
        private _notificarService: NotificarService,
        private _activeRoute: ActivatedRoute,
        private _bodegaService: BodegaService,
        private _dialogService: DialogService
    ) { }

    ngOnInit(): void {
        this.cargarFormularioEnBlanco();
        this.cargarCatalogos();
        this._activeRoute.params.pipe(switchMap((params: Params) => {
            let codigoArticulo = params['id'];
            codigoArticulo = codigoArticulo != null ? codigoArticulo : 'sn';
            console.log(codigoArticulo);
            return this._articuloService.obtenerArticuloPorCodigo(params['id']);
        })).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data != null) {
                this.articulo = data;
                this.cargarFormularioArticulo();
            }
            else
                this.cargarFormularioEnBlanco();
        });
    }

    cargarCatalogos() {
        let clasesObs = this._articuloService.obtenerClasesPorPerfil();
        let unidadesMedidaObs = this._articuloService.obtenerUnidadesMedida();
        let marcasObs = this._articuloService.obtenerMarcasArticulo();
        let listaPreciosObs = this._articuloService.obtenerListaPrecios();
        let bodegasObs = this._bodegaService.listarTodosActivos();

        forkJoin([clasesObs, unidadesMedidaObs, marcasObs, listaPreciosObs, bodegasObs]).subscribe(data => {
            this.clases = _.map(data[0], (x) => { return x.ITMCLSCD });
            this.unidadesMedida = _.map(data[1], (x) => { return x.UOMSCHDL });
            this.marcas = data[2];
            this.listaPrecios = data[3];
            this.bodegas = _.map(data[4], (x) => { return x.codigo });
        });
    }

    cargarFormularioArticulo() {
        this.esNuevo = false;
        debugger;
        this.articulo.DECPLQTY = this.articulo.DECPLQTY - 1;
        this.formularioArticulo = crearArticuloFormulario(this.articulo);
    }

    cargarFormularioEnBlanco() {
        this.esNuevo = true;
        this.formularioArticulo = crearArticuloFormulario({
            'ITEMNMBR': null,
            'ITMSHNAM': null,
            'ITEMDESC': null,
            'ITMCLSCD': null,
            'PRCHSUOM': null,
            //'UOMSCHDL': null,
            'PRCLEVEL': 'GENERAL',
            'USCATVAL': null,
            'DECPLQTY': 2,
            //'DECPLCUR': 2,
            'LOCNCODE': null,
            'PESO': 0
        });
    }


    abrirDialogoConfimacion(){
        if (this.formularioArticulo.valid){
            const dialogoConfirmacion = this._dialogService.open({
                appendTo: this.containerDialogRef,
                title: 'Confirmar Despacho',
                content: '¿Está seguro de registrar los cambios?',
                minWidth: 300,
                maxWidth: '60%',
                actions: [
                    { text: 'Cancelar'},
                    { text: 'Aceptar', primary: true }
                ]
            });

            dialogoConfirmacion.result.subscribe((result) => {
                if(result instanceof DialogCloseResult){
                }
                else if(result['text'] === 'Aceptar'){
                    this.guardarArticulo()
                }else if(result['text'] === 'Cancelar'){
                }
            });
        }else{
            this.formularioArticulo.markAllAsTouched();
            this._notificarService.mostrarMensajeError('Complete los campos requeridos');
        }


    }

    private guardarArticulo() {
        if (this.formularioArticulo.valid) {
            let articuloAux: any = new Object();

            articuloAux.ITEMNMBR = this.formularioArticulo.get('ITEMNMBR').value;
            articuloAux.ITMSHNAM = this.formularioArticulo.get('ITMSHNAM').value;
            articuloAux.ITEMDESC = this.formularioArticulo.get('ITEMDESC').value;
            articuloAux.ITMCLSCD = this.formularioArticulo.get('ITMCLSCD').value;
            articuloAux.PRCHSUOM = this.formularioArticulo.get('PRCHSUOM').value;
            articuloAux.UOMSCHDL = this.formularioArticulo.get('PRCHSUOM').value;
            articuloAux.PRCLEVEL = this.formularioArticulo.get('PRCLEVEL').value;

            if(this.esNuevo)
                articuloAux.DECPLQTY = this.formularioArticulo.get('DECPLQTY').value;
            else
                articuloAux.DECPLQTY = this.formularioArticulo.get('DECPLQTY').value + 1;

            //articuloAux.DECPLCUR = this.formularioArticulo.get('DECPLCUR').value;
            articuloAux.LOCNCODE = this.formularioArticulo.get('LOCNCODE').value;
            articuloAux.PESO = this.formularioArticulo.get('PESO').value;
            debugger;
            if (!this.esNuevo) {
                articuloAux.USCATVLS_2 = this.articulo.USCATVLS_2;
                articuloAux.ITMGEDSC = this.articulo.ITMGEDSC;
            }

            this.mensajeError = undefined;

            this._articuloService.crearActualizarArticulo(articuloAux).subscribe(data => {
                this._notificarService.desactivarLoading();
                if (data.mensajeCodigo === 'OK') {
                    this.habilitarBotonGuardar = false;
                    this.articulo = data.articulo;
                    this.cargarFormularioArticulo();
                    this._notificarService.mostrarMensajeExito('Artículo creado correctamente');
                } else {
                    this.mensajeError = data.mensaje;
                }
            });

        } else {
            this.formularioArticulo.markAllAsTouched();
            this._notificarService.mostrarMensajeError('Complete los campos requeridos');
        }
    }
}
