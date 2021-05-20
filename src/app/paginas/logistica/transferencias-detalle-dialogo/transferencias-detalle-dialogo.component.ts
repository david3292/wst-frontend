import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentoTransferenciaSalida } from 'src/app/_dominio/logistica/documentoTransferenciaSalida';
import { TransferenciaDTO } from 'src/app/_dto/logistica/transferenciaDTO';
import * as _ from "lodash";
import { TransferenciasService } from 'src/app/_servicio/logistica/transferencias.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-transferencias-detalle-dialogo',
    templateUrl: './transferencias-detalle-dialogo.component.html',
    styleUrls: ['./transferencias-detalle-dialogo.component.scss']
})
export class TransferenciasDetalleDialogoComponent implements OnInit {

    @Input()
    public transferenciasSalida: DocumentoTransferenciaSalida[];
    @Input()
    public estadoTransferencia: string;
    public deshabilitar: boolean;
    public transferencia: TransferenciaDTO;

    private numero: string;

    constructor(
        private router: Router,
        private _transferenciasService: TransferenciasService,
        private _notificarService: NotificarService
    ) { }

    ngOnInit(): void {
        if (this.estadoTransferencia === 'COMPLETADO')
            this.deshabilitar = true;
        else
            this.deshabilitar = false;
    }

    imprimirdator() {

    }

    cargarTransferencia(transferenciaSalida: DocumentoTransferenciaSalida) {
        this.router.navigate([`/transferencias/${transferenciaSalida.id}/salida`]);
    }

    crearNuevaTransferenciaSalida() {
        let existeNuevo = _.filter(this.transferenciasSalida, (t) => {
            return t.estado === 'NUEVO' || t.estado === 'ERROR';
        }).length;
        if (existeNuevo > 0) {
            this._notificarService.mostrarMensajeError('Tiene transferencias pendientes de revisión');
        } else {
            let idTransferencia = _.first(this.transferenciasSalida).documentoTransferenciaId;
            this._transferenciasService.crearNuevaTransferenciaSalida(idTransferencia).subscribe(data => {
                this.router.navigate([`/transferencias/${data.id}/salida`]);
            });
        }
    }

    generarGuiaTransferenciaPdf(transferencia: TransferenciaDTO) {
        this.numero = transferencia.numero;
        this._transferenciasService.generarReporteGuiaTransferenciaSalida(transferencia.id).subscribe(data => {
            this._notificarService.desactivarLoading();
            const file = new Blob([data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `Guia_Transferencia_${this.numero}`;
            a.click();
        });
    }
}
