import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArticuloVistaGeneralComponent } from './articulo-vista-general/articulo-vista-general.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridModule } from '@progress/kendo-angular-grid';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { ArticuloComponent } from './articulo/articulo.component';

const routes: Routes = [
    { path: '', component: ArticuloVistaGeneralComponent, canActivate: [GuardService] },
    { path: 'nuevo', component: ArticuloComponent, canActivate: [GuardService] },
    { path: 'editar/:id', component: ArticuloComponent, canActivate: [GuardService] }
]

@NgModule({
    declarations: [
        ArticuloVistaGeneralComponent,
        ArticuloComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        ButtonsModule,
        LayoutModule,
        GridModule,
        LabelModule,
        ReactiveFormsModule,
        FormsModule,
        DropDownsModule,
        DropDownListModule,
        PopupModule,
        InputsModule,
        DialogsModule,
        TooltipModule,
        TextBoxModule,
        ListViewModule
    ]
})
export class ArticuloModule { }
