import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SortDescriptor } from '@progress/kendo-data-query';
import { NotificarService } from '../../../_servicio/notificar.service';
import { SecuencialService } from '../../../_servicio/sistema/secuencial.service';


@Component({
  selector: 'app-secuencial',
  templateUrl: './secuencial.component.html',
  styleUrls: ['./secuencial.component.scss']
})
export class SecuencialComponent implements OnInit {

    secuenciales: any[];


    constructor(private secuencialService: SecuencialService,
        private notificacionService: NotificarService,
        public route: ActivatedRoute) { }

    ngOnInit(): void {

        this.secuencialService.listarTodos().subscribe(data => {
            this.notificacionService.loadingCambio.next(false);
            this.secuenciales = data;
        })

        this.secuencialService.secuencialCambio.subscribe(data =>{
            this.secuenciales = data;
        })
    }

}
