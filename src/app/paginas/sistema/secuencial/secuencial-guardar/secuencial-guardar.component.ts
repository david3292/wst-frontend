import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { switchMap, switchMapTo } from 'rxjs/operators';
import { SecuencialService } from 'src/app/_servicio/sistema/secuencial.service';
import { Secuencial } from 'src/app/_dominio/sistema/secuencial';
import { PuntoVentaService } from 'src/app/_servicio/sistema/punto-venta.service';
import { NotificarService } from 'src/app/_servicio/notificar.service';


@Component({
  selector: 'app-secuencial-guardar',
  templateUrl: './secuencial-guardar.component.html',
  styleUrls: ['./secuencial-guardar.component.scss']
})
export class SecuencialGuardarComponent implements OnInit {
    @Input()
    nombreComponentePadre: String;

    id: number;
    public tiposDocumentos: any[];
    public puntosVentas: any[];

    formSecuencial = new FormGroup({
        'id': new FormControl(0),
        'tipoDocumento': new FormControl(),
        'puntoVenta': new FormControl(),
        'docIdGP': new FormControl(),
        'abreviatura': new FormControl(),
        'susecion': new FormControl()
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private secuencialService: SecuencialService,
        private notificarService: NotificarService,
        private puntoVentaService: PuntoVentaService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.id = params['id'];
            this.setearListas().subscribe(data => {
                this.notificarService.loadingCambio.next(false);
                this.tiposDocumentos = data[0];
                this.puntosVentas = data[1];
                this.initFormulario();
            })
        })
    }

    setearListas(): Observable<any[]> {
        let tipoDocumentos = this.secuencialService.listarTiposDocumentos();
        let puntoVentas = this.puntoVentaService.listarTodosActivos();
        return forkJoin([tipoDocumentos, puntoVentas]);
    }

    initFormulario() {
        if (this.id != null) {
            this.secuencialService.listarPorId(this.id).subscribe(data => {
                this.formSecuencial = new FormGroup({
                    'id': new FormControl(data.id),
                    'tipoDocumento': new FormControl(data.tipoDocumento),
                    'puntoVenta': new FormControl(data.puntoVenta),
                    'docIdGP': new FormControl(data.docIdGP),
                    'abreviatura': new FormControl(data.abreviatura)
                });
            });
        }
    }

    guardar(){
        let secuencial = new Secuencial();
        secuencial.id = this.formSecuencial.value['id'];
        secuencial.tipoDocumento = this.formSecuencial.value['tipoDocumento'];
        secuencial.puntoVenta = this.formSecuencial.value['puntoVenta'];
        secuencial.docIdGP = this.formSecuencial.value['docIdGP'];
        secuencial.abreviatura = this.formSecuencial.value['abreviatura'];

        this.secuencialService.registrar(secuencial).pipe(switchMap(() => {
            return this.secuencialService.listarTodos();
        })).subscribe(data => {
            this.secuencialService.secuencialCambio.next(data);
            this.notificarMensaje(false, 'Secuencial Registrado');
            this.router.navigate(['secuencial']);
        });
    }

    cancelar() {
        this.router.navigate(['secuencial']);
    }

    notificarMensaje(loading: boolean, mensaje: string) {
        this.notificarService.loadingCambio.next(false);
        this.notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

}
