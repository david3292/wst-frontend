import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VistaGeneralDespachosComponent } from './vista-general-despachos/vista-general-despachos.component';
import { DespachosComponent } from './despachos/despachos.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { RouterModule, Routes } from '@angular/router';
import { GridModule } from '@progress/kendo-angular-grid';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { EditService } from '../../ventas/cotizacion/edit.service';
import { ResumenDespachoComponent } from './resumen-despacho/resumen-despacho.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { LogisticaModule } from '../logistica.module';

const routes: Routes = [
    { path: 'overview', component: VistaGeneralDespachosComponent, canActivate: [GuardService] },
    { path: ':id', component: DespachosComponent, canActivate: [GuardService] }
]

@NgModule({
    declarations: [
        VistaGeneralDespachosComponent,
        DespachosComponent,
        ResumenDespachoComponent,
        ResumenDespachoComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        CommonsModule,
        LogisticaModule,
        GridModule,
        ButtonsModule,
        InputsModule,
        LabelModule,
        TextBoxModule,
        LayoutModule,
        DropDownsModule,
        FormsModule,
        ReactiveFormsModule,
        DateInputsModule,
        DialogsModule,
        ListViewModule
    ],
    providers: [EditService]
})
export class GuiaDespachoModule { }
