import { switchMap } from 'rxjs/operators';
import { NotificarService } from './../../../_servicio/notificar.service';
import { BodegaService } from './../../../_servicio/sistema/bodega.service';
import { Bodega } from './../../../_dominio/sistema/bodega';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { BodegaGP } from 'src/app/_dominio/sistema/bodegaGP';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'codigo': new FormControl(dataItem.codigo, Validators.required),
    'descripcion': new FormControl(dataItem.descripcion, Validators.required),
    'activo': new FormControl(dataItem.activo),
    'bod_cd':  new FormControl(dataItem.bod_cd),
    'bod_PV':  new FormControl(dataItem.bod_PV),
    'bod_repos_inv':  new FormControl(dataItem.bod_repos_inv),
});

@Component({
    selector: 'app-bodega',
    templateUrl: './bodega.component.html',
    styleUrls: ['./bodega.component.scss']
})
export class BodegaComponent implements OnInit {

    bodegas: Bodega[];
    public bodegasGPCatalogo: BodegaGP[] = [];
    public formGroup: FormGroup;
    private editedRowIndex: number;

    constructor(
        private _bodegaService: BodegaService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
        this._bodegaService.listarTodos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.bodegas = data;
        });

        this._bodegaService.bodegasCambio.subscribe(data => {
            this.bodegas = data;
        });

        this.catalogoBodegasGP();
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': 0,
            'codigo': '',
            'descripcion': '',
            'activo': true,
            'bod_cd': false,
            'bod_PV': false,
            'bod_repos_inv': false,
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }) {
        const bodega: Bodega = formGroup.value;
        if (isNew) {
            this._bodegaService.registrar(bodega).pipe(switchMap(() => {
                return this._bodegaService.listarTodos();
            })).subscribe(data => {
                this.onComplete('Bodega Registrada', data);
            });
        } else {
            this._bodegaService.modificar(bodega).pipe(switchMap(() => {
                return this._bodegaService.listarTodos();
            })).subscribe(data => {
                this.onComplete('Bodega modificada', data);
            });
        }
        sender.closeRow(rowIndex);
    }

    public editHandler({ sender, rowIndex, dataItem }) {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;

        sender.editRow(rowIndex, this.formGroup);
    }

    public cancelHandler({ sender, rowIndex }) {
        this.closeEditor(sender, rowIndex);
    }

    private closeEditor(grid, rowIndex = this.editedRowIndex) {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }

    private onComplete(mensaje: string, data: any) {
        this._notificarService.desactivarLoading();
        this._bodegaService.bodegasCambio.next(data);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public colorBadge(activo: boolean) {
        if (activo) return ['badge-success'];
        else return ['badge-danger'];
    }

    private catalogoBodegasGP() {
        this._bodegaService.listarBodegasGP().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.bodegasGPCatalogo = data;
        });
    }

    public changeValue(value: any) {
        let bodegaSeleccionada = this.bodegasGPCatalogo.find(x => x["MASTERID"] === value);
        this.formGroup.get('descripcion').setValue((bodegaSeleccionada['LOCNDSCR']).toUpperCase());
    }
}
