import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcesarCobroComponent } from './procesar-cobro/procesar-cobro.component';
import { RouterModule, Routes } from '@angular/router';
import { GuardService } from 'src/app/_servicio/guard.service';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { RegistroComponent } from './procesar-cobro/registro/registro.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { EditarCobroService } from './procesar-cobro/editarCobro.service';
import { CierreCajaComponent } from './cierre-caja/cierre-caja.component';
import { EditarCierreCajaService } from './cierre-caja/editarCierreCajaService';
import { ClienteModule } from '../cliente/cliente.module';
import { CobroCalculadoraComponent } from './cobro-calculadora/cobro-calculadora.component';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { CobroGeneralComponent } from './cobro-general/cobro-general.component';
import { RegistroFormaPagoComponent } from './cobro-general/registro-forma-pago/registro-forma-pago.component';
import { RegistroAplicacionComponent } from './cobro-general/registro-aplicacion/registro-aplicacion.component';
import { SeleccionDocumentoAplicarComponent } from './cobro-general/seleccion-documento-aplicar/seleccion-documento-aplicar.component';
import { EditarCobroAplicacionService } from './cobro-general/registro-aplicacion/editarCobroAplicacion.service';
import { AplicacionDetalleComponent } from './cobro-general/aplicacion-detalle/aplicacion-detalle.component';
import { ChequePosfechadoComponent } from './cheque-posfechado/cheque-posfechado.component';
import { ChequePosfechadoConfirmacionComponent } from './cheque-posfechado/cheque-posfechado-confirmacion/cheque-posfechado-confirmacion.component';
import { ChequePosfechadoResultadoComponent } from './cheque-posfechado/cheque-posfechado-resultado/cheque-posfechado-resultado.component';
import { ChequePosfechadoAprobacionComponent } from './cheque-posfechado/cheque-posfechado-aprobacion/cheque-posfechado-aprobacion.component';
import { ChequePosfechadoAprobacionConfirmacionComponent } from './cheque-posfechado/cheque-posfechado-aprobacion-confirmacion/cheque-posfechado-aprobacion-confirmacion.component';
import { CommonsModule } from 'src/app/components/commons/commons.module';


const routes: Routes = [
    {
        path: 'cierre-caja', component: CierreCajaComponent, canActivate: [GuardService],
    },
    {
        path: 'general', component: CobroGeneralComponent, children: [
            { path: 'aplicacion', component: RegistroAplicacionComponent },
        ], canActivate: [GuardService],
    },
    {
        path: 'cheque-posfechado', component: ChequePosfechadoComponent, canActivate: [GuardService],
    },
    {
        path: 'cheque-posfechado-aprobacion', component: ChequePosfechadoAprobacionComponent, canActivate: [GuardService],
    },
]

@NgModule({
    declarations: [
        ProcesarCobroComponent,
        RegistroComponent,
        CierreCajaComponent,
        CobroCalculadoraComponent,
        CobroGeneralComponent,
        RegistroFormaPagoComponent,
        RegistroAplicacionComponent,
        SeleccionDocumentoAplicarComponent,
        AplicacionDetalleComponent,
        ChequePosfechadoComponent,
        ChequePosfechadoConfirmacionComponent,
        ChequePosfechadoResultadoComponent,
        ChequePosfechadoAprobacionComponent,
        ChequePosfechadoAprobacionConfirmacionComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ButtonsModule,
        LayoutModule,
        GridModule,
        LabelModule,
        ReactiveFormsModule,
        FormsModule,
        InputsModule,
        DropDownsModule,
        DropDownListModule,
        DialogsModule,
        DateInputsModule,
        ListViewModule,
        ClienteModule,
        DateInputsModule,
        TooltipModule,
        CommonsModule
    ],
    providers: [EditarCobroService, EditarCierreCajaService, EditarCobroAplicacionService
    ],
})
export class CobrosModule { }
