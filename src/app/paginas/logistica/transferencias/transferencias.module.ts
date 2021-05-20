import { VistaGeneralTransferenciasComponent } from './vista-general-transferencias/vista-general-transferencias.component';
import { GuardService } from '../../../_servicio/guard.service';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferenciasComponent } from './transferencias/transferencias.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { TransferenciasDetalleDialogoComponent } from '../transferencias-detalle-dialogo/transferencias-detalle-dialogo.component';
import { TransferenciaResumenDialogoComponent } from '../transferencia-resumen-dialogo/transferencia-resumen-dialogo.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { LogisticaModule } from '../logistica.module';
import { EditService } from '../../ventas/cotizacion/edit.service';

const routes: Routes = [
    { path: 'overview/:tipo_transferencia', component: VistaGeneralTransferenciasComponent, canActivate: [GuardService]},
    { path: ':id/:tipo_transferencia', component: TransferenciasComponent, canActivate: [GuardService]}
]

@NgModule({
    declarations: [
        VistaGeneralTransferenciasComponent,
        TransferenciasComponent,
        TransferenciasDetalleDialogoComponent,
        TransferenciaResumenDialogoComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        CommonsModule,
        LogisticaModule,
        GridModule,
        LayoutModule,
        ButtonsModule,
        InputsModule,
        LabelModule,
        DropDownsModule,
        TextBoxModule,
        FormsModule,
        DateInputsModule,
        DialogsModule,
        ListViewModule,
        ReactiveFormsModule,
        PopupModule
    ],
    providers: [
        EditService
    ]
})
export class TransferenciasModule { }
