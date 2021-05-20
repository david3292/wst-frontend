import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VistaGeneralRecepcionComponent } from './vista-general-recepcion/vista-general-recepcion.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { EditService } from '../../ventas/cotizacion/edit.service';
import { RecepcionesDetalleDialogoComponent } from './recepciones-detalle-dialogo/recepciones-detalle-dialogo.component';

const routes: Routes = [
    { path: 'recepcion/overview', component: VistaGeneralRecepcionComponent, canActivate: [GuardService] },
    { path: 'recepcion/:id', component: RecepcionComponent, canActivate: [GuardService] }
]

@NgModule({
    declarations: [
        RecepcionComponent,
        VistaGeneralRecepcionComponent,
        RecepcionComponent,
        RecepcionesDetalleDialogoComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        CommonsModule,
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
export class ComprasModule { }
