import { GridModule } from '@progress/kendo-angular-grid';
import { GuardService } from './../../../_servicio/guard.service';
import { BodegaComponent } from './bodega.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PopupAnchorBodegaDirective } from './popup.anchorBodega-target.directive';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';

const routes : Routes = [
    {path: '', component: BodegaComponent, canActivate: [GuardService]}
]

@NgModule({
    declarations: [
        BodegaComponent,
        PopupAnchorBodegaDirective
    ],
    imports: [
        CommonModule,
        GridModule,
        DropDownsModule,
        DropDownListModule,
        PopupModule,
        FormsModule,
        ReactiveFormsModule,
        InputsModule,
        RouterModule.forChild(routes)
    ]
})
export class BodegaModule { }
