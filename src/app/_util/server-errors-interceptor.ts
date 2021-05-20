import { Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { tap, catchError, retry } from 'rxjs/operators';
import { NotificationService } from '@progress/kendo-angular-notification';
import { NotificarService } from '../_servicio/notificar.service';
//import { RefreshTokenComponent } from '../pages/refresh-token/refresh-token.component';

@Injectable({
    providedIn: 'root'
})
export class ServerErrorsInterceptor implements HttpInterceptor {

    constructor(private router: Router,
        private notificarService: NotificarService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(retry(environment.REINTENTOS)).
            pipe(tap(event => {
                if (event instanceof HttpResponse) {
                    if (event.body && event.body.error === true && event.body.errorMessage) {
                        throw new Error(event.body.errorMessage);
                    }/*else{
                        this.snackBar.open("EXITO", 'AVISO', { duration: 5000 });
                    }*/
                }
            })).pipe(catchError((err) => {
                this.notificarService.loadingCambio.next(false);
                console.log(err);
                //https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
                if (err.status === 400) {
                    if (err.error) {
                        if (err.error.error_description == 'Bad credentials') {
                            this.notificarService.mensajeRequest.next({ detalle: 'Credenciales Incorrectas', tipo: 'error' });
                        } else {
                            this.notificarService.mensajeRequest.next({ detalle: err.error.error_description, tipo: 'error' });
                        }
                    }

                }
                else if (err.status === 401) {
                    //Sesión expirada
                    this.notificarService.mensajeRequest.next({ detalle: 'Sesión Expirada', tipo: 'error' });
                    /* this.dialog.open(RefreshTokenComponent, {
                        width: '450px',
                        disableClose: true
                    }) */
                    sessionStorage.clear();
                    this.router.navigate(['/login']);
                }
                else if (err.status === 500) {
                    this.notificarService.mensajeRequest.next({ detalle: err.error.mensaje ? err.error.mensaje : err.error.error_description, tipo: 'error' });
                } else if (err.status === 0) {
                    this.notificarService.mensajeRequest.next({ detalle: 'Servicio no disponible ', tipo: 'error' });
                } else {
                    this.notificarService.mensajeRequest.next({ detalle: err.error.mensaje, tipo: 'error' });
                }
                return EMPTY;
            }));


    }


}
