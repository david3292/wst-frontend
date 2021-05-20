import { Component, OnInit } from '@angular/core';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { MigracionService } from 'src/app/_servicio/sistema/migracion.service';

@Component({
    selector: 'app-migracion',
    templateUrl: './migracion.component.html',
    styleUrls: ['./migracion.component.scss']
})
export class MigracionComponent implements OnInit {

    public myFiles: Array<File>;

    constructor(
        private _migracionService: MigracionService,
        private _notificarService: NotificarService,
    ) { }

    ngOnInit(): void {
    }

    public subirArchivo() {
        this._migracionService.guardarArchivo(this.myFiles[0]).subscribe(data => {
            this._notificarService.desactivarLoading();
            this._notificarService.mostrarMensajeExito("Archivo cargado exitosamente");
            this.myFiles = [];
        })
    }
}
