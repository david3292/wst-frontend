import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaPreciosComponent } from './lista-precios.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { RouterModule, Routes } from '@angular/router';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { LogisticaModule } from '../../logistica/logistica.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { EditService } from '../../ventas/cotizacion/edit.service';

const routes: Routes = [
    { path: '', component: ListaPreciosComponent, canActivate: [GuardService] }
]

@NgModule({
    declarations: [
        ListaPreciosComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonsModule,
        GridModule,
        LayoutModule,
        ButtonModule,
        InputsModule,
        LabelModule,
        DropDownsModule,
        TextBoxModule,
        FormsModule,
        DateInputsModule,
        DialogsModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        CommonsModule
    ],
    providers: [
        EditService
    ]
})
export class ListaPreciosModule { }
