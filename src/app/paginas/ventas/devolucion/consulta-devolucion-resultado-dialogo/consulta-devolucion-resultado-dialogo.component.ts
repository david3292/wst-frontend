import { Component, OnInit } from '@angular/core';
import { NotaCreditoConsultaDTO } from 'src/app/_dto/ventas/notaCreditoConsultaDTO';

@Component({
    selector: 'app-consulta-devolucion-resultado-dialogo',
    templateUrl: './consulta-devolucion-resultado-dialogo.component.html',
    styleUrls: ['./consulta-devolucion-resultado-dialogo.component.scss']
})
export class ConsultaDevolucionResultadoDialogoComponent implements OnInit {

    public notasCredito: NotaCreditoConsultaDTO[] = [];
    constructor() { }

    ngOnInit(): void {
    }

    public visualizarNumero(dataItem: NotaCreditoConsultaDTO){
        if(dataItem.numero === '' || dataItem.numero === null){
            return 'Sin Número';
        }else{
            return dataItem.numero;
        }
    }

}
