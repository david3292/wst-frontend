import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { OrdenCompraDTO } from 'src/app/_dto/compras/ordenCompraDTO';
import { ComprasService } from 'src/app/_servicio/compras/compras.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';

@Component({
    selector: 'app-transacciones-compras',
    templateUrl: './transacciones-compras.component.html',
    styleUrls: ['./transacciones-compras.component.scss']
})
export class TransaccionesComprasComponent implements OnInit {

    public compras: OrdenCompraDTO[] = [];
    public compraSeleccionada: OrdenCompraDTO;

    @ViewChild("containerDialog", { read: ViewContainerRef })
    public containerDialogRef: ViewContainerRef;

    constructor(
        private _notificarService: NotificarService,
        private _comprasService: ComprasService,
        private _dialogService: DialogService
    ) { }

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(){
        this._comprasService.listarComprasConError().subscribe(data => {
            debugger;
            this._notificarService.desactivarLoading();
            this.compras = data;
        });
    }

    procesarCompra(compra: OrdenCompraDTO){
        this._comprasService.procesarCompraPorId(compra.id).subscribe(data => {
            this.cargarDatos();
            if(data.estado === 'ERROR_ORDEN_COMPRA' || data.estado === 'ERROR_RECEPCION'){
                this._notificarService.mostrarMensajeError('Error al procesar la compra');
            }else{
                this._notificarService.mostrarMensajeExito('Compra procesada correctamente');
            }
        });
    }

    verMensajeError(compra: OrdenCompraDTO, mensajeErrorTemplate: TemplateRef<any>){
        this.compraSeleccionada = compra;
        debugger;
        const dialogoError = this._dialogService.open({
            appendTo: this.containerDialogRef,
            title: 'Procesar Compra',
            content: mensajeErrorTemplate,
            minWidth: 300,
            maxWidth: '60%',
            actions: [
                { text: 'Aceptar', primary: true}
            ]
        });
    }
}
