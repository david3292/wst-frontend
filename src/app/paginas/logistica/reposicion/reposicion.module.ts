import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReposicionComponent } from './reposicion.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { ReposicionDetalleComponent } from './reposicion-detalle/reposicion-detalle.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ReposicionConfirmacionComponent } from './reposicion-confirmacion/reposicion-confirmacion.component';

const routes: Routes = [
    { path: '', component: ReposicionComponent, canActivate: [GuardService]},
]

@NgModule({
    declarations: [
        ReposicionComponent,
        ReposicionDetalleComponent,
        ReposicionConfirmacionComponent
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
        LayoutModule,
        InputsModule,
        TextBoxModule,
        DialogsModule,
        RouterModule.forChild(routes)
    ]
})
export class ReposicionModule { }
