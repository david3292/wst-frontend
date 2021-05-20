import { ConfiguracionSistemaService } from './../../../_servicio/sistema/configuracion-sistema.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import * as _ from "lodash";

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'nombre': new FormControl(dataItem.nombre, Validators.required),
    'valor': new FormControl(dataItem.valor, Validators.required),
    'unidadMedida': new FormControl(dataItem.unidadMedida, Validators.compose([Validators.required])),
    'activo': new FormControl(dataItem.activo, Validators.required)
});


@Component({
    selector: 'app-configuracion-sistema',
    templateUrl: './configuracion-sistema.component.html',
    styleUrls: ['./configuracion-sistema.component.scss']
})
export class ConfiguracionSistemaComponent implements OnInit {

    configuraciones: any[];

    configuracionCatalogo: any[] = [];
    unidadMedidaCatalogo: any[] = [];

    public formGroup: FormGroup;

    private editedRowIndex: number;

    constructor(private configuracionService: ConfiguracionSistemaService,
        private notificarService: NotificarService) { }

    ngOnInit(): void {

        this.listarCatalogo();
        this.listarCatalogoUnidades();
        this.configuracionService.listarTodos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.configuraciones = data;
        });

        this.configuracionService.configuracionSistemaCambio.subscribe(data => {
            this.configuraciones = data;
        })
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': 0,
            'nombre': '',
            'valor':  0,
            'unidadMedida':  '',
            'activo':true
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }): void {
        const configuracion = formGroup.value;
        if (isNew) {
            this.configuracionService.registrar(configuracion).pipe(switchMap(() => {
                return this.configuracionService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.configuracionService.configuracionSistemaCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Configuración Registrada', tipo:'success'});
            })
        } else {
            this.configuracionService.modificar(configuracion).pipe(switchMap(() => {
                return this.configuracionService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.configuracionService.configuracionSistemaCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Configuración Modificada', tipo:'success'});
            })
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

    public obtenerNombre(valor: string) {
        const config = _.find(this.configuracionCatalogo, (o) => { return o['valor'] === valor });
        return config ? _.toUpper(config['texto']) : '';
    }

    private listarCatalogo() {
        this.configuracionService.listarCatalogoConfiguraciones().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.configuracionCatalogo = data;
        })
    }

    private listarCatalogoUnidades() {
        this.configuracionService.listarCatalogoConfiguracionesUnidades().subscribe(data => {
            this.notificarService.desactivarLoading();
            this.unidadMedidaCatalogo = data;
        })
    }
}
