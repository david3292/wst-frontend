import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { CierreCajaService } from 'src/app/_servicio/cobros/cierre-caja.service';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ConfiguracionUsuarioPerfilService } from 'src/app/_servicio/sistema/configuracion-usuario-perfil.service';
import { UsuarioService } from 'src/app/_servicio/sistema/usuario.service';

@Component({
    selector: 'app-consulta-caja-jefe',
    templateUrl: './consulta-caja-jefe.component.html',
    styleUrls: ['./consulta-caja-jefe.component.scss']
})
export class ConsultaCajaJefeComponent implements OnInit {

    public editForm: FormGroup = new FormGroup({
        fechaInicio: new FormControl(new Date(), Validators.required),
        fechaFin: new FormControl(new Date(), Validators.required),
        usuario: new FormControl(null, Validators.required),
        puntoVenta: new FormControl(null, Validators.required)
    });

    public usuariosCajeros: Usuario[] = [];
    public puntosVenta: PuntoVenta[] = [];
    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private currentPage = 0;

    public expandAll({ dataItem, index }: any): boolean {
        return true;
    }

    constructor(
        private _notificarService: NotificarService,
        private _fechaService: FechaService,
        private _cajaService: CierreCajaService,
        private _configUsuarioPerfilService: ConfiguracionUsuarioPerfilService,
        private _usuarioService: UsuarioService
    ) { }

    ngOnInit(): void {
        this.consultarUsuarios();
    }

    private consultarUsuarios() {
        this._usuarioService.listarUsuariosPorPerfil('CAJERO').subscribe(data => {
            this._notificarService.desactivarLoading();
            this.usuariosCajeros = data;
        });
    }

    public changeValueUsuario(valor: any) {
        this._configUsuarioPerfilService.listarPuntosDeVentaPorUsuarioYPerfil(valor,'CAJERO').subscribe(data =>{
            this._notificarService.desactivarLoading();
            this.puntosVenta = data;
        })
    }

    public limpiar() {
        this.editForm.reset();
        this.gridView = {
            data: Array<any>(),
            total: 0
        };
    }

    public consultar() {
        this.obtenerDatosConsulta();
    }

    private obtenerDatosConsulta() {
        const consulta = this.crearObjetoConsulta();
        this._cajaService.consultarCajaCierre(this.currentPage, this.pageSize, consulta).subscribe(data => {
            this._notificarService.desactivarLoading();
            this.gridView = {
                data: data.content,
                total: data.totalElements
            };
        });
    }

    public pageChange(event: PageChangeEvent): void {
        this.currentPage = (event.skip / event.take);
        this.skip = event.skip;
        this.obtenerDatosConsulta();
    }

    private crearObjetoConsulta() {
        return {
            fechaInicio: this._fechaService.dateToString(this.editForm.controls['fechaInicio'].value),
            fechaFin: this._fechaService.dateToString(this.editForm.controls['fechaFin'].value),
            idPuntoVenta: this.editForm.controls['puntoVenta'].value,
            usuario: this.editForm.controls['usuario'].value,
            rol: 'JEFE_COBRANZAS'
        };
    }

    public descargarReporte(cajaId: number) {
        this._cajaService.generarReporte(cajaId).subscribe(data => {
            this._notificarService.desactivarLoading();
            if (data.size > 0) {
                const file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                a.download = `cierreCaja_${this._fechaService.fechaActual()}`;
                a.click();
            }
        })
    }

}
