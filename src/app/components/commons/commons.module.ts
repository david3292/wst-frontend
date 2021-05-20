import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveBadgeComponent } from './active-badge/active-badge.component';
import { StateBadgeComponent } from './state-badge/state-badge.component';
import { IoBadgeComponent } from './io-badge/io-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GuiaDespachoDetallesDialogoComponent } from 'src/app/paginas/logistica/guia-despacho/guia-despacho-detalles-dialogo/guia-despacho-detalles-dialogo.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { CobroResultadoDialogoComponent } from './cobro-resultado-dialogo/cobro-resultado-dialogo.component';
import { LabelModule } from '@progress/kendo-angular-label';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TipoTransferenciaBadgeComponent } from './tipo-transferencia-badge/tipo-transferencia-badge.component';



@NgModule({
    declarations: [
        ActiveBadgeComponent,
        StateBadgeComponent,
        IoBadgeComponent,
        GuiaDespachoDetallesDialogoComponent,
        CobroResultadoDialogoComponent,
        TipoTransferenciaBadgeComponent
    ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        GridModule,
        LayoutModule,
        ButtonsModule,
        LabelModule,
        ListViewModule,
        InputsModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    exports: [
        ActiveBadgeComponent,
        StateBadgeComponent,
        IoBadgeComponent,
        GuiaDespachoDetallesDialogoComponent,
        CobroResultadoDialogoComponent,
        TipoTransferenciaBadgeComponent
    ]
})
export class CommonsModule { }
