import { ConsultaGuiaRemisionResultadoDialogoComponent } from './guiaRemision/consulta-guia-remision-resultado-dialogo/consulta-guia-remision-resultado-dialogo.component';
import { FacturaResumenDialogoComponent } from './facturacion/factura-resumen-dialogo/factura-resumen-dialogo.component';
import { CabeceraComponent } from './pre-vista-documento/cabecera/cabecera.component';
import { BuscarClienteDialogoComponent } from '../cliente/buscar-cliente-dialogo/buscar-cliente-dialogo.component';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VistaGeneralCotizacionComponent } from './vista-general-cotizacion/vista-general-cotizacion.component';
import { GuardService } from 'src/app/_servicio/guard.service';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { InputsModule, TextBoxModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { BuscarArticuloDialogoComponent } from './cotizacion/buscar-articulo-dialogo/buscar-articulo-dialogo.component';
import { StockDialogoComponent } from './cotizacion/buscar-articulo-dialogo/stock-dialogo/stock-dialogo.component';
import { EditService } from './cotizacion/edit.service';
import { VistaGeneralAprobacionesComponent } from './vista-general-aprobaciones/vista-general-aprobaciones.component';
import { DetalleComponent } from './pre-vista-documento/detalle/detalle.component';
import { StateBadgeComponent } from 'src/app/components/commons/state-badge/state-badge.component';
import { ReservaComponent } from './reserva/reserva.component';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { PickingDialogoComponent } from './reserva/picking-dialogo/picking-dialogo.component';
import { FacturacionComponent } from './facturacion/facturacion.component';
import { PickingFacturaDialogoComponent } from './facturacion/picking-factura-dialogo/picking-factura-dialogo.component';
import { FacturaResultadoDialogoComponent } from './facturacion/factura-resultado-dialogo/factura-resultado-dialogo.component';
import { ConsultaFacturasResultadoDialogoComponent } from './facturacion/consulta-facturas-resultado-dialogo/consulta-facturas-resultado-dialogo.component';
import { ClienteModule } from '../cliente/cliente.module';
import { CommonsModule } from 'src/app/components/commons/commons.module';
import { ConsultaTransferenciaResultadoDialogoComponent } from './transferencia/consulta-transferencia-resultado-dialogo/consulta-transferencia-resultado-dialogo.component';
import { ArticuloCompraDialogoComponent } from './cotizacion/articulo-compra-dialogo/articulo-compra-dialogo.component';
import { BusquedaProveedorComponent } from '../proveedor/busqueda-proveedor/busqueda-proveedor.component';
import { PickingFacturaServicioDialogoComponent } from './facturacion/picking-factura-servicio-dialogo/picking-factura-servicio-dialogo.component';
import { ConsultaOrdenesCompraComponent } from './facturacion/consulta-ordenes-compra/consulta-ordenes-compra.component';
import { ConsultaReservaResultadoDialogoComponent } from './reserva/consulta-reserva-resultado-dialogo/consulta-reserva-resultado-dialogo.component';
import { ConsultaGuiaDespachoResultadoDialogoComponent } from './guia-despacho/consulta-guia-despacho-resultado-dialogo/consulta-guia-despacho-resultado-dialogo.component';
import { ReservaPorFacturarComponent } from './reserva-por-facturar/reserva-por-facturar.component';
import { ForzarDespachosComponent } from './forzar-despachos/forzar-despachos.component';
import {DevolucionComponent} from './devolucion/devolucion.component';
import {DatePickerModule} from '@progress/kendo-angular-dateinputs';
import {AgregarDevolucionComponent} from './devolucion/agregar-devolucion/agregar-devolucion.component';
import { AprobarDevolucionComponent } from './devolucion/aprobar-devolucion/aprobar-devolucion.component';
import { ConsultaDevolucionResultadoDialogoComponent } from './devolucion/consulta-devolucion-resultado-dialogo/consulta-devolucion-resultado-dialogo.component';
import { ConfirmarDevolucionComponent } from './devolucion/confirmar-devolucion/confirmar-devolucion.component';
import { ConsultaRecepcionesCompraComponent } from './facturacion/consulta-recepciones-compra/consulta-recepciones-compra.component';


const routes: Routes = [
    {
        path: 'overview', component: VistaGeneralCotizacionComponent, children: [
            {path: 'nuevo', component: CotizacionComponent},
            {path: 'edicion/:id', component: CotizacionComponent}
        ],
        canActivate: [GuardService],
    },
    {
        path: 'overview-aprobaciones', component: VistaGeneralAprobacionesComponent, children: [
            {path: 'nuevo', component: CotizacionComponent},
            {path: 'edicion/:id', component: CotizacionComponent}
        ],
        canActivate: [GuardService],
    },
    {
        path: 'reserva/:id', component: ReservaComponent, canActivate: [GuardService]
    },
    {
        path: 'factura/:id', component: FacturacionComponent, canActivate: [GuardService]
    },
    {
        path: 'reserva-por-factura', component: ReservaPorFacturarComponent, canActivate: [GuardService]
    },
    {
        path: 'aprobaciones/despacho', component: ForzarDespachosComponent, canActivate: [GuardService],
    },
    {
        path: 'devolucion', component: DevolucionComponent, canActivate: [GuardService]
    },
    {
        path: 'devolucion/:id', component: AgregarDevolucionComponent, canActivate: [GuardService]
    },
    {
        path: 'aprobaciones/devoluciones/:tipo_flujo', component: AprobarDevolucionComponent, canActivate: [GuardService]
    },
];


@NgModule({
    declarations: [
        VistaGeneralCotizacionComponent,
        VistaGeneralAprobacionesComponent,
        CotizacionComponent,
        BuscarArticuloDialogoComponent,
        StockDialogoComponent,
        CabeceraComponent,
        DetalleComponent,
        ReservaComponent,
        PickingDialogoComponent,
        FacturacionComponent,
        PickingFacturaDialogoComponent,
        FacturaResumenDialogoComponent,
        FacturaResultadoDialogoComponent,
        ConsultaFacturasResultadoDialogoComponent,
        ConsultaGuiaRemisionResultadoDialogoComponent,
        ConsultaTransferenciaResultadoDialogoComponent,
        ArticuloCompraDialogoComponent,
        BusquedaProveedorComponent,
        PickingFacturaServicioDialogoComponent,
        ConsultaOrdenesCompraComponent,
        PickingFacturaServicioDialogoComponent,
        ForzarDespachosComponent,
        DevolucionComponent,
        AgregarDevolucionComponent,
        AprobarDevolucionComponent,
        ConsultaDevolucionResultadoDialogoComponent,
        ConsultaReservaResultadoDialogoComponent,
        ConsultaGuiaDespachoResultadoDialogoComponent,
        ReservaPorFacturarComponent,
        ForzarDespachosComponent,
        ConfirmarDevolucionComponent,
        ConsultaRecepcionesCompraComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        CommonsModule,
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
        LayoutModule,
        ClienteModule,
        DatePickerModule
    ],
    providers: [EditService]
})
export class VentasModule {
}
