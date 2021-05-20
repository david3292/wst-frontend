import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockItemBinDialogoComponent } from './stock-item-bin-dialogo/stock-item-bin-dialogo.component';
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
import { PopupModule } from '@progress/kendo-angular-popup';

@NgModule({
    declarations: [
        StockItemBinDialogoComponent,
    ],
    imports: [
        CommonModule,
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
    exports: [
        StockItemBinDialogoComponent
    ]
})
export class LogisticaModule { }
