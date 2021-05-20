import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { PuntoVenta } from 'src/app/_dominio/sistema/puntoVenta';
import { Usuario } from 'src/app/_dominio/sistema/usuario';
import { FechaService } from 'src/app/_servicio/fecha-service';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { PuntoVentaService } from 'src/app/_servicio/sistema/punto-venta.service';
import { UsuarioService } from 'src/app/_servicio/sistema/usuario.service';
import { ReservaService } from 'src/app/_servicio/ventas/reserva.service';

@Component({
    selector: 'app-consulta-reservas-jefe',
    templateUrl: './consulta-reservas-jefe.component.html',
    styleUrls: ['./consulta-reservas-jefe.component.scss']
})
export class ConsultaReservasJefeComponent implements OnInit {

    public editForm: FormGroup = new FormGroup({
        fechaInicio: new FormControl(new Date()),
        fechaFin: new FormControl(new Date()),
        usuario: new FormControl(null),
        puntoVenta: new FormControl(null)
    });

    public usuariosVentas: Usuario[] = [];
    public puntosVenta: PuntoVenta[] = [];
    public gridView: GridDataResult;
    public pageSize = 20;
    public skip = 0;
    private currentPage = 0;

    constructor(
        private _notificarService: NotificarService,
        private _fechaService: FechaService,
        private _usuarioService: UsuarioService,
        private _reservasService: ReservaService,
        private _puntoVentaService: PuntoVentaService
    ) { }

    ngOnInit(): void {
        this.consultarUsuarios();
        this.consultarPuntosVenta();
    }
    private consultarUsuarios() {
        this._usuarioService.listarUsuariosPorPerfil('VENDEDOR').subscribe(data => {
            this._notificarService.desactivarLoading();
            this.usuariosVentas = data;
        });
    }

    private consultarPuntosVenta() {
        this._puntoVentaService.listarTodosActivos().subscribe(data => {
            this._notificarService.desactivarLoading();
            this.puntosVenta = data;
        })
    }

    public limpiar() {
        this.editForm.reset();
    }

    public consultar() {
        this.currentPage = 0;
        this.skip = 0;
        this.obtenerDatosConsulta();
    }

    private obtenerDatosConsulta() {
        const consulta = this.crearObjetoConsulta();
        this._reservasService.consultarReservas(this.currentPage, this.pageSize, consulta).subscribe(data => {
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
            vendedor: this.editForm.controls['usuario'].value,
        };
    }

}
