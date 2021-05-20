import { Injectable } from '@angular/core';
import { NotificationService } from '@progress/kendo-angular-notification';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificarService {

    loadingCambio = new Subject<boolean>();
    mensajeRequest = new Subject<Mensaje>();

    constructor(private notificationService: NotificationService) { }

    activarLoading(){
        this.loadingCambio.next(true);
    }

    desactivarLoading(){
        this.loadingCambio.next(false);
    }

    mostrarMensajeError(mensaje: string){
        this.notificationService.show({
            content: mensaje,
            hideAfter: 800,
            position: { horizontal: 'center', vertical: 'bottom' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'error', icon: true },
            closable: true
        });
    }

    mostrarMensajeExito(mensaje: string){
        this.desactivarLoading();
        this.notificationService.show({
            content: mensaje,
            hideAfter: 800,
            position: { horizontal: 'center', vertical: 'bottom' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'success', icon: true },
        });
    }

    mostrarMensajeAdvertencia(mensaje: string){
        this.notificationService.show({
            content: mensaje,
            hideAfter: 3000,
            position: { horizontal: 'center', vertical: 'bottom' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'warning', icon: true },
        });
    }

    mostrarMensajeInformacion(mensaje: string){
        this.notificationService.show({
            content: mensaje,
            hideAfter: 800,
            position: { horizontal: 'center', vertical: 'bottom' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'info', icon: true },
        });
    }

}

export class Mensaje {
    tipo: string;
    detalle: string;
}
