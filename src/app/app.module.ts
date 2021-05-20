import {CondicionPagoDetalleComponent} from './paginas/sistema/condiciones-pago/condicion-pago-detalle/condicion-pago-detalle.component';
import {CondicionesPagoComponent} from './paginas/sistema/condiciones-pago/condiciones-pago.component';
import {CargoComponent} from './paginas/sistema/cargo/cargo.component';
import {AreaComponent} from './paginas/sistema/area/area.component';
import {ConfiguracionSistemaComponent} from './paginas/sistema/configuracion-sistema/configuracion-sistema.component';
import {environment} from './../environments/environment';
import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {MenuModule} from '@progress/kendo-angular-menu';
import {GridModule} from '@progress/kendo-angular-grid';
import {ChartsModule} from '@progress/kendo-angular-charts';
import {DropDownListModule, DropDownsModule} from '@progress/kendo-angular-dropdowns';
import {PopupModule} from '@progress/kendo-angular-popup';
import {InputsModule} from '@progress/kendo-angular-inputs';

import 'hammerjs';

import {LayoutModule} from '@progress/kendo-angular-layout';

import {HeaderComponent} from './components/header/header.component';
import {HomeComponent} from './components/home/home.component';
import {FooterComponent} from './components/footer/footer.component';
import {InicioComponent} from "./components/inicio/inicio.component";
import {LoginComponent} from './components/login/login.component'
import {AppRountigModule} from './app-rountig.module';
import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {JwtModule} from '@auth0/angular-jwt';
import {ServerErrorsInterceptor} from './_util/server-errors-interceptor';
import {NotificationModule} from '@progress/kendo-angular-notification';
import {LabelModule} from '@progress/kendo-angular-label';
import {DialogsModule} from '@progress/kendo-angular-dialog';
import {CurrencyPipe, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {PopupAnchorDirective} from './paginas/sistema/configuracion-sistema/popup.anchor-target.directive';
import {NgxSpinnerModule} from "ngx-spinner";
import {UsuarioComponent} from './paginas/sistema/usuario/usuario.component';
import {UsuarioEdicionComponent} from './paginas/sistema/usuario/usuario-edicion/usuario-edicion.component';
import {ToolBarModule} from '@progress/kendo-angular-toolbar';

import {ListViewModule} from '@progress/kendo-angular-listview';
import {UsuarioConfigPerfilComponent} from './paginas/sistema/usuario/usuario-config-perfil/usuario-config-perfil.component';
import {TooltipModule} from '@progress/kendo-angular-tooltip';
import {PermisosDialogoComponent} from './paginas/sistema/usuario/permisos-dialogo/permisos-dialogo.component';
import {BodegasDialogoComponent} from './paginas/sistema/usuario/bodegas-dialogo/bodegas-dialogo.component';
import {UsuarioAgregarPerfilComponent} from './paginas/sistema/usuario/usuario-agregar-perfil/usuario-agregar-perfil.component';
import {SecuencialComponent} from './paginas/sistema/secuencial/secuencial.component';
import {SecuencialGuardarComponent} from './paginas/sistema/secuencial/secuencial-guardar/secuencial-guardar.component'
import {FormaPagoComponent} from './paginas/sistema/forma-pago/forma-pago.component';
import {CondicionPagoEdicionComponent} from './paginas/sistema/condiciones-pago/condicion-pago-edicion/condicion-pago-edicion.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {DateInputsModule} from '@progress/kendo-angular-dateinputs';
import {RelojComponent} from './components/reloj/reloj.component';
import {XSeguntoService} from './components/reloj/xsegunto.service';

import {IntlModule} from '@progress/kendo-angular-intl';
import '@progress/kendo-angular-intl/locales/es/all';
import {FileSelectModule, UploadModule} from '@progress/kendo-angular-upload';
import {MigracionComponent} from './paginas/sistema/migracion/migracion.component';

;


//Generamos la función para obtener el token almacenado en localsesionStorage
export function tokenGetter() {
    let tk = sessionStorage.getItem(environment.TOKEN_NAME);
    return tk != null ? tk : '';
}


@NgModule({
    declarations: [
        AppComponent,
        PopupAnchorDirective,
        HeaderComponent,
        HomeComponent,
        InicioComponent,
        FooterComponent,
        LoginComponent,
        ConfiguracionSistemaComponent,
        AreaComponent,
        CargoComponent,
        UsuarioComponent,
        UsuarioEdicionComponent,
        UsuarioConfigPerfilComponent,
        PermisosDialogoComponent,
        BodegasDialogoComponent,
        UsuarioAgregarPerfilComponent,
        SecuencialComponent,
        SecuencialGuardarComponent,
        FormaPagoComponent,
        CondicionesPagoComponent,
        CondicionPagoDetalleComponent,
        CondicionPagoEdicionComponent,
        RelojComponent,
        MigracionComponent
    ],
    entryComponents: [PermisosDialogoComponent, BodegasDialogoComponent],
    imports: [
        FontAwesomeModule,
        BrowserModule,
        ReactiveFormsModule,
        AppRountigModule,
        HttpClientModule,
        FormsModule,
        MenuModule,
        BrowserAnimationsModule,
        GridModule,
        ChartsModule,
        DropDownsModule,
        DropDownListModule,
        PopupModule,
        InputsModule,
        LayoutModule,
        ButtonsModule,
        NotificationModule,
        LabelModule,
        DialogsModule,
        NgxSpinnerModule,
        ListViewModule,
        IntlModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: tokenGetter,
                allowedDomains: ["localhost:8080", "http://172.31.1.7:8069", "http://172.31.1.7:8082"]
                //allowedDomains: ["http://172.31.1.7:8069"], //Para Pruebas
                //allowedDomains: ["http://172.31.1.7:8082"], //Para Produccion
                //disallowedRoutes: ["http://localhost:8080:login/enviarcorreo"]
            }
        })
        ,
        ToolBarModule,
        TooltipModule,
        DateInputsModule,
        UploadModule,
        FileSelectModule
    ],
    providers: [
        XSeguntoService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ServerErrorsInterceptor,
            multi: true,
        },
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: LOCALE_ID, useValue: 'en'},
        CurrencyPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
