import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@progress/kendo-angular-notification';
import { switchMap } from 'rxjs/operators';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { AreaService } from 'src/app/_servicio/sistema/area.service';


const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'codigo': new FormControl(dataItem.codigo, Validators.required),
    'areaFuncional': new FormControl(dataItem.areaFuncional, Validators.required),
    'areaReporta': new FormControl(dataItem.areaReporta),
    'activo': new FormControl(dataItem.activo, Validators.required)
});

@Component({
    selector: 'app-area',
    templateUrl: './area.component.html',
    styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

    areas: any[];

    public formGroup: FormGroup;
    private editedRowIndex: number;


    constructor(private areaService: AreaService,
        private notificarService: NotificarService) { }

    ngOnInit(): void {
        this.areaService.listarTodos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.areas = data;
        });

        this.areaService.areasCambio.subscribe(data => {
            this.areas = data;
        })
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': 0,
            'codigo': '',
            'areaFuncional': '',
            'areaReporta': '',
            'activo': true
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }): void {
        const configuracion = formGroup.value;
        if (isNew) {
            this.areaService.registrar(configuracion).pipe(switchMap(() => {
                return this.areaService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.areaService.areasCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Área Registrada', tipo:'success'});
            })
        } else {
            this.areaService.modificar(configuracion).pipe(switchMap(() => {
                return this.areaService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.areaService.areasCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Área Modificada', tipo:'success'});
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


}
