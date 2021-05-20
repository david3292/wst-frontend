import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VistaGeneralComponent } from './vista-general/vista-general.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridModule } from '@progress/kendo-angular-grid';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { TransaccionesComprasComponent } from './transacciones-compras/transacciones-compras.component';
import { TransaccionesCobroDetalleComponent } from './transacciones-cobro-detalle/transacciones-cobro-detalle.component';
import { CommonsModule } from 'src/app/components/commons/commons.module';

const routes: Routes = [
    {path: '', component: VistaGeneralComponent, canActivate: [GuardService]}
]



@NgModule({
    declarations: [
        VistaGeneralComponent,
        TransaccionesComprasComponent,
        TransaccionesCobroDetalleComponent,
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
        CommonsModule
    ]
})
export class TransaccionesModule { }
