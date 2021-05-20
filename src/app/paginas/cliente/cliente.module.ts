import { EditarDireccionService } from './editarDireccion.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscarClienteDialogoComponent } from './buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { ClienteComponent } from './cliente/cliente.component';
import { RouterModule, Routes } from '@angular/router';
import { GuardService } from 'src/app/_servicio/guard.service';
import { RegistroClienteComponent } from './registro-cliente/registro-cliente.component';
import { RegistroDireccionComponent } from './registro-direccion/registro-direccion.component';

const routes: Routes = [
    {
        path: '', component: ClienteComponent, children: [
            { path: 'nuevo', component: RegistroClienteComponent },
            { path: 'edicion/:id', component: RegistroClienteComponent }
        ], canActivate: [GuardService],
    },
]

@NgModule({
    declarations: [
        ClienteComponent,
        BuscarClienteDialogoComponent,
        RegistroClienteComponent,
        RegistroDireccionComponent
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
        DropDownsModule,
        DropDownListModule,
        PopupModule,
        InputsModule,
        DialogsModule,
        TooltipModule,
        TextBoxModule,
        ListViewModule,
    ],
    providers: [ EditarDireccionService ]
})
export class ClienteModule { }
