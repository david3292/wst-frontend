import { ReposicionModule } from './paginas/logistica/reposicion/reposicion.module';
import { TransaccionesModule } from './paginas/transacciones/transacciones.module';
import { CondicionesPagoComponent } from './paginas/sistema/condiciones-pago/condiciones-pago.component';
import { CargoComponent } from './paginas/sistema/cargo/cargo.component';
import { AreaComponent } from './paginas/sistema/area/area.component';
import { ConfiguracionSistemaComponent } from './paginas/sistema/configuracion-sistema/configuracion-sistema.component';
import { GuardService } from './_servicio/guard.service';
import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UsuarioComponent } from './paginas/sistema/usuario/usuario.component';
import { UsuarioEdicionComponent } from './paginas/sistema/usuario/usuario-edicion/usuario-edicion.component';
import { SecuencialComponent } from './paginas/sistema/secuencial/secuencial.component';
import { SecuencialGuardarComponent } from './paginas/sistema/secuencial/secuencial-guardar/secuencial-guardar.component';
import { FormaPagoComponent } from './paginas/sistema/forma-pago/forma-pago.component';
import { CondicionPagoEdicionComponent } from './paginas/sistema/condiciones-pago/condicion-pago-edicion/condicion-pago-edicion.component';
import { MigracionComponent } from './paginas/sistema/migracion/migracion.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [GuardService] },
    { path: 'inicio', component: InicioComponent, canActivate: [GuardService] },
    { path: 'configuraciones', component: ConfiguracionSistemaComponent, canActivate: [GuardService] },
    { path: 'migracion', component: MigracionComponent, canActivate: [GuardService] },
    {
        path: 'usuario', component: UsuarioComponent, children: [
            { path: 'nuevo', component: UsuarioEdicionComponent },
            { path: 'edicion/:id', component: UsuarioEdicionComponent }
        ], canActivate: [GuardService]
    },
    {
        path: 'secuencial', component: SecuencialComponent, children: [
            { path: 'nuevo', component: SecuencialGuardarComponent }
        ], canActivate: [GuardService]
    },
    { path: 'area', component: AreaComponent, canActivate: [GuardService] },
    { path: 'cargo', component: CargoComponent, canActivate: [GuardService] },
    { path: 'formapago', component: FormaPagoComponent, canActivate: [GuardService] },
    {
        path: 'condicionespago', component: CondicionesPagoComponent, children: [
            { path: 'nuevo', component: CondicionPagoEdicionComponent },
            { path: 'edicion/:id', component: CondicionPagoEdicionComponent }
        ], canActivate: [GuardService]
    },
    { path: 'punto-venta', loadChildren: () => import('./paginas/sistema/punto-venta/punto-venta.module').then(m => m.PuntoVentaModule) },
    { path: 'bodega', loadChildren: () => import('./paginas/sistema/bodega/bodega.module').then(m => m.BodegaModule) },
    { path: 'ventas', loadChildren: () => import('./paginas/ventas/ventas.module').then(m => m.VentasModule) },
    { path: 'transferencias', loadChildren: () => import('./paginas/logistica/transferencias/transferencias.module').then(m => m.TransferenciasModule)},
    { path: 'cobros', loadChildren: () => import('./paginas/cobros/cobros.module').then(m => m.CobrosModule) },
    { path: 'despachos', loadChildren: () => import('./paginas/logistica/guia-despacho/guia-despacho.module').then(m => m.GuiaDespachoModule)},
    { path: 'transacciones', loadChildren: () => import('./paginas/transacciones/transacciones.module').then(m => m.TransaccionesModule) },
    { path:  'compras', loadChildren: () => import('./paginas/logistica/compras/compras.module').then(m => m.ComprasModule) },
    { path: 'clientes', loadChildren: () => import('./paginas/cliente/cliente.module').then(m => m.ClienteModule) },
    { path: 'consultas', loadChildren: () =>  import('./paginas/consultas/consultas.module').then(m => m.ConsultasModule) },
    { path: 'articulos', loadChildren:() => import('./paginas/articulo/articulo.module').then(m => m.ArticuloModule)},
    { path: 'lista-precios', loadChildren: () => import('./paginas/sistema/lista-precios/lista-precios.module').then(m => m.ListaPreciosModule)},
    { path: 'reposicion', loadChildren:() => import('./paginas/logistica/reposicion/reposicion.module').then(m => m.ReposicionModule)},
    { path: 'login', component: LoginComponent },
    //{ path: '**', redirectTo: 'login' }
];


@NgModule({

    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRountigModule { }
