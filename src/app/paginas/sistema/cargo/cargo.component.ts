import { AreaService } from 'src/app/_servicio/sistema/area.service';
import { CargoService } from './../../../_servicio/sistema/cargo.service';
import { Component, OnInit } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

const createFormGroup = dataItem => new FormGroup({
    'id': new FormControl(dataItem.id),
    'area': new FormControl(dataItem.area.id, Validators.required),
    'nombre': new FormControl(dataItem.nombre, Validators.required),
    'activo': new FormControl(dataItem.activo, Validators.required)
});

@Component({
    selector: 'app-cargo',
    templateUrl: './cargo.component.html',
    styleUrls: ['./cargo.component.scss']
})
export class CargoComponent implements OnInit {

    cargos: any[];
    areas: any[];

    public formGroup: FormGroup;
    private editedRowIndex: number;

    constructor(private cargoService: CargoService,
        private areaService: AreaService,
        private notificarService: NotificarService) { }

    ngOnInit(): void {
        this.cargoService.listarTodos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.cargos = data;
        });

        this.areaService.listarTodosActivos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.areas = data;
        })

        this.cargoService.cargosCambio.subscribe(data => {
            this.cargos = data;
        })
    }

    public addHandler({ sender }) {
        this.closeEditor(sender);

        this.formGroup = createFormGroup({
            'id': 0,
            'area': 0,
            'nombre': '',
            'activo': true
        });

        sender.addRow(this.formGroup);
    }

    public saveHandler({ sender, rowIndex, formGroup, isNew }): void {
        const cargo = formGroup.value;
        let cargoFinal ={id: cargo.id, area: this.obtenerAreaSeleccionada(cargo.area), nombre: cargo.nombre,activo: cargo.activo};
        if (isNew) {
            this.cargoService.registrar(cargoFinal).pipe(switchMap(() => {
                return this.cargoService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.cargoService.cargosCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Cargo Registrado', tipo:'success'});
            })
        } else {
            this.cargoService.modificar(cargoFinal).pipe(switchMap(() => {
                return this.cargoService.listarTodos();
            })).subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.cargoService.cargosCambio.next(data);
                this.notificarService.mensajeRequest.next({detalle:'Cargo Modificado', tipo:'success'});
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

    public obtenerAreaSeleccionada(idArea : number){
        return this.areas.find(x => x.id=idArea);
    }


}
