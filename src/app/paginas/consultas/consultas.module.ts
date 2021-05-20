import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConsultaDespachosComponent} from './logistica/despachos/consulta-despachos/consulta-despachos.component';
import {RouterModule, Routes} from '@angular/router';
import {GuardService} from 'src/app/_servicio/guard.service';
import {InputsModule, TextBoxModule} from '@progress/kendo-angular-inputs';
import {LayoutModule} from '@progress/kendo-angular-layout';
import {GridModule} from '@progress/kendo-angular-grid';
import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {LabelModule} from '@progress/kendo-angular-label';
import {DropDownsModule} from '@progress/kendo-angular-dropdowns';
import {DateInputsModule} from '@progress/kendo-angular-dateinputs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonsModule} from 'src/app/components/commons/commons.module';
import {DialogsModule} from '@progress/kendo-angular-dialog';
import {TooltipModule} from '@progress/kendo-angular-tooltip';
import {ConsultaCobrosComponent} from './facturacion/cobros/consulta-cobros.component';
import {ConsultaFacturasComponent} from './facturacion/facturas/vendedor/consulta-facturas.component';
import {ConsultaFacturasAdminComponent} from './facturacion/facturas/admin/consulta-facturas-admin.component';
import {CobroFormasPagoComponent} from './facturacion/cobros/cobro-formas-pago/cobro-formas-pago.component';
import {ConsultaTransferencierenciasComponent} from './logistica/transferencias/consulta-transferencierencias/consulta-transferencierencias.component';
import {ConsultaJefeCobranzasComponent} from './facturacion/cobros/consulta-jefe-cobranzas/consulta-jefe-cobranzas.component';
import { ConsultaReservasJefeComponent } from './reservas/consulta-reservas-jefe/consulta-reservas-jefe.component';
import { ConsultaDetalleReservasComponent } from './reservas/consulta-detalle-reservas/consulta-detalle-reservas.component';
import { ConsultaCajaJefeComponent } from './caja/consulta-caja-jefe/consulta-caja-jefe.component';
import { ConsultaCajaComponent } from './caja/consulta-caja/consulta-caja.component';
import { ConsultaCajaDetalleComponent } from './caja/consulta-caja-detalle/consulta-caja-detalle.component';

const routes: Routes = [
    {path: 'despachos', component: ConsultaDespachosComponent, canActivate: [GuardService]},
    {path: 'transferencias', component: ConsultaTransferencierenciasComponent, canActivate: [GuardService]},
    {path: 'cobros', component: ConsultaCobrosComponent, canActivate: [GuardService]},
    {path: 'facturas/vendedor', component: ConsultaFacturasComponent, canActivate: [GuardService]},
    {path: 'facturas/admin', component: ConsultaFacturasAdminComponent, canActivate: [GuardService]},
    {path: 'cobros/jefe-cobranzas', component: ConsultaJefeCobranzasComponent, canActivate: [GuardService]},
    {path: 'reservas-jefe', component: ConsultaReservasJefeComponent, canActivate: [GuardService]},
    {path: 'caja', component: ConsultaCajaComponent, canActivate: [GuardService]},
    {path: 'caja/jefe-cobranzas', component: ConsultaCajaJefeComponent, canActivate: [GuardService]}
];

@NgModule({
    declarations: [
        ConsultaDespachosComponent,
        ConsultaCobrosComponent,
        ConsultaFacturasComponent,
        ConsultaFacturasAdminComponent,
        CobroFormasPagoComponent,
        ConsultaTransferencierenciasComponent,
        ConsultaJefeCobranzasComponent,
        ConsultaReservasJefeComponent,
        ConsultaDetalleReservasComponent,
        ConsultaCajaJefeComponent,
        ConsultaCajaComponent,
        ConsultaCajaDetalleComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        InputsModule,
        LayoutModule,
        GridModule,
        ButtonsModule,
        LabelModule,
        DropDownsModule,
        TextBoxModule,
        DateInputsModule,
        FormsModule,
        ReactiveFormsModule,
        DialogsModule,
        CommonsModule,
        TooltipModule
    ]
})
export class ConsultasModule {
}
