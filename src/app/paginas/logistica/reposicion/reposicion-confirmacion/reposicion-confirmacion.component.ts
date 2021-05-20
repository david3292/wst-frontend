import { Component, OnInit } from '@angular/core';
import { ReposicionDetalleDTO } from 'src/app/_dto/logistica/reposicionDetalleDTO';
import { ReposicionDTO } from 'src/app/_dto/logistica/reposicionDTO';

@Component({
    selector: 'app-reposicion-confirmacion',
    templateUrl: './reposicion-confirmacion.component.html',
    styleUrls: ['./reposicion-confirmacion.component.scss']
})
export class ReposicionConfirmacionComponent implements OnInit {

    public accion: string;
    public reposicion: ReposicionDTO;
    public detalle: ReposicionDetalleDTO;

    constructor() { }

    ngOnInit(): void {
    }

}
