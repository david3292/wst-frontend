import { LabelModule } from '@progress/kendo-angular-label';
import { GridModule } from '@progress/kendo-angular-grid';
import { GuardService } from './../../../_servicio/guard.service';
import { RouterModule, Routes } from '@angular/router';
import { PuntoVentaComponent } from './punto-venta.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { AsignacionBodegaComponent } from './asignacion-bodega/asignacion-bodega.component';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AsignacionFormaPagoComponent } from './asignacion-forma-pago/asignacion-forma-pago.component';
import { CommonsModule } from 'src/app/components/commons/commons.module';

const routes: Routes = [
    { path: '', component: PuntoVentaComponent, canActivate: [GuardService] }
];

@NgModule({
    declarations: [
        PuntoVentaComponent,
        AsignacionBodegaComponent,
        AsignacionFormaPagoComponent
    ],
    imports: [
        CommonModule,
        CommonsModule,
        GridModule,
        ButtonsModule,
        DropDownListModule,
        FormsModule,
        ReactiveFormsModule,
        DropDownsModule,
        TooltipModule,
        LabelModule,
        RouterModule.forChild(routes)
    ]
})
export class PuntoVentaModule { }
