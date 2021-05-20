import { Component, OnInit, ViewChild } from '@angular/core';
import { LoginService } from './_servicio/login.service';
import { NotificarService } from './_servicio/notificar.service';
import { NgxSpinnerService } from 'ngx-spinner';

const PrimaryWhite = '#e66a15';
const SecondaryGrey = '#2C1801';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    public perfilSeleccionado: Boolean = false;
    constructor(
        public loginService: LoginService,
        private notificarService: NotificarService,
        private spinner: NgxSpinnerService
    ) { }


    ngOnInit(): void {
        this.loginService.perfilPuntVentaSeleccionado.subscribe(data => {
            this.perfilSeleccionado = data;
        })

        this.notificarService.loadingCambio.subscribe(data => {
            if (data) {
                this.spinner.show();
            } else {
                this.spinner.hide();
            }
        })

        this.notificarService.mensajeRequest.subscribe(data => {

            switch (data.tipo) {
                case 'error':
                    this.notificarService.mostrarMensajeError(data.detalle);
                    break;
                case 'success':
                    this.notificarService.mostrarMensajeExito(data.detalle);
                    break;
                case 'warning':
                    this.notificarService.mostrarMensajeAdvertencia(data.detalle);
                    break;
                case 'info':
                    this.notificarService.mostrarMensajeInformacion(data.detalle);
                    break;
            }
        })
    }

}
