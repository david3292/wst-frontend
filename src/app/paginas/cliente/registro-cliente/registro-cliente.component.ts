import { map } from 'rxjs/operators';
import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { AltMissInfoAdd } from 'src/app/_dominio/alt/altMissInfoAdd';
import { Cliente } from 'src/app/_dominio/ventas/cliente';
import { IIATGL00010 } from 'src/app/_dominio/ventas/iiatGL00010';
import { IIATGL00020 } from 'src/app/_dominio/ventas/iiatGL00020';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { ClienteService } from 'src/app/_servicio/ventas/cliente.service';
import { EditarDireccionService } from '../editarDireccion.service';
import { PanelBarExpandMode } from '@progress/kendo-angular-layout';
import { RegistroDireccionComponent } from '../registro-direccion/registro-direccion.component';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Direccion } from 'src/app/_dominio/ventas/direccion';

@Component({
    selector: 'app-registro-cliente',
    templateUrl: './registro-cliente.component.html',
    styleUrls: ['./registro-cliente.component.scss']
})
export class RegistroClienteComponent implements OnInit {

    @Input()
    nombreComponentePadre: String;

    private clienteEdicion: Cliente;
    private id: string;
    public edicion: boolean;

    public infoAdicional: boolean = false;
    public isNew: boolean = true;
    private direccionLista: Direccion[] = [];
    private direcionEnEdicion: Direccion;
    public expandMode: number = PanelBarExpandMode.Single;
    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0
    };

    public catalogoTipoIdentificacion: Array<string> = ['CÉDULA', 'PASAPORTE', 'RUC'];
    public catalogoClase: Array<string> = ['LOCAL'];
    public catalogoTipoContribuyente: Array<string> = ['PERSONA NATURAL', 'SOCIEDAD'];
    public catalogoEstadoCivil: Array<string> = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNIÓN LIBRE'];
    public catalogoSexo: Array<string> = ['FEMENINO', 'MASCULINO'];
    public catalogoOrigenIngresos: Array<any> = [
        { CODIGO: 'B', DESCRIPCION: 'Empleado Público' },
        { CODIGO: 'V', DESCRIPCION: 'Empleado Privado' },
        { CODIGO: 'I', DESCRIPCION: 'Independiente' },
        { CODIGO: 'A', DESCRIPCION: 'Ama de casa o Estudiante' },
        { CODIGO: 'R', DESCRIPCION: 'Rentista' },
        { CODIGO: 'H', DESCRIPCION: 'Jubilado' },
        { CODIGO: 'M', DESCRIPCION: 'Remesas del Exterior' },
    ]
        ;
    public catalogoPais: Array<any>;

    formCliente = new FormGroup({
        'CUSTNMBR': new FormControl('', [Validators.required, Validators.pattern('^([a-zA-Z0-9]){1,16}$')]),
        'CUSTNAME': new FormControl('', [Validators.required, Validators.maxLength(66)]),
        'TIPO': new FormControl('', Validators.required),
        'IDTipoCli': new FormControl('', Validators.required),
        'CUSTCLAS': new FormControl('LOCAL', Validators.required),
        'ADDRESS1': new FormControl('', Validators.required),
        'ADDRESS2': new FormControl(''),
        'ADDRESS3': new FormControl(''),
        'PHONE1': new FormControl('', Validators.required),
        'PHONE2': new FormControl(''),
        'PHONE3': new FormControl(''),
        'SHIPCOMPLETE': new FormControl(false),
        'EMAIL': new FormControl('', Validators.email),
        'EMAIL1': new FormControl('', Validators.email),
        'EMAIL2': new FormControl('', Validators.email),
        'STATE': new FormControl('', Validators.required),
        'CANTON': new FormControl('', Validators.required),
        'PARROQUIA': new FormControl('', Validators.required),
        'ESTADOCIVIL': new FormControl(''),
        'SEXO': new FormControl(''),
        'infoAdicional': new FormControl(false),
        'PYMTDMID': new FormControl(),
        'OrigenIngresos': new FormControl(''),
        'CRLMTAMT': new FormControl(),
        'COMMENT1': new FormControl(),
        'COMMENT2': new FormControl(),
        'USERDEF1': new FormControl(),
        'USERDEF2': new FormControl(),
        'CCode': new FormControl('', Validators.required),
    });

    @ViewChild("containerRegistroDireccion", { read: ViewContainerRef })
    public containerRegsitroDireccionRef: ViewContainerRef;
    @ViewChild("containerConfirmacionCliente", { read: ViewContainerRef })
    public containerConfirmacionClienteRef: ViewContainerRef;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _clienteService: ClienteService,
        private _notificarService: NotificarService,
        public editarDireccionService: EditarDireccionService,
        private dialogService: DialogService,
    ) { }

    ngOnInit(): void {
        this.editarDireccionService.next(this.direccionLista);
        this._route.params.subscribe((params: Params) => {
            this.id = params['id'];
            this.edicion = params['id'] != null;
            this._clienteService.listarPaisesGP().subscribe(data => {
                this._notificarService.desactivarLoading();
                this.catalogoPais = data;
                this.initFormulario();
            })

        });
        this.view = this.editarDireccionService.pipe(map(data => process(data, this.gridState)));
        this.editarDireccionService.read();
    }

    private initFormulario() {
        if (this.edicion) {
            this._clienteService.listarPorCustomerNumber(this.id).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.clienteEdicion = data;
                this.editarDireccionService.next(data.Address);
                this.direccionLista = data.Address;
                this.formCliente = new FormGroup({
                    'CUSTNMBR': new FormControl(data.CUSTNMBR),
                    'CUSTNAME': new FormControl(data.CUSTNAME, Validators.maxLength(66)),
                    'TIPO': new FormControl(this.catalogoTipoIdentificacion[data.iIAT_GL00020.DOCTYPE - 1]),
                    'IDTipoCli': new FormControl(this.obtenerTipoContribuyenteDeOriginal(data.iIAT_GL00020.ID_TipoCli)),
                    'CUSTCLAS': new FormControl(data.CUSTCLAS),
                    'ADDRESS1': new FormControl(data.ADDRESS1),
                    'ADDRESS2': new FormControl(data.ADDRESS2),
                    'ADDRESS3': new FormControl(data.ADDRESS3),
                    'PHONE1': new FormControl(data.PHONE1),
                    'PHONE2': new FormControl(data.PHONE2),
                    'PHONE3': new FormControl(data.PHONE3),
                    'SHIPCOMPLETE': new FormControl(data.SHIPCOMPLETE),
                    'EMAIL': new FormControl(this.obtenerInfoMiscelaneos('Email', data.infoMiscelaneos), Validators.email),
                    'EMAIL1': new FormControl(this.obtenerInfoMiscelaneos('Email1', data.infoMiscelaneos), Validators.email),
                    'EMAIL2': new FormControl(this.obtenerInfoMiscelaneos('Email2', data.infoMiscelaneos), Validators.email),
                    'STATE': new FormControl(data.STATE),
                    'CANTON': new FormControl(this.obtenerInfoMiscelaneos('Canton', data.infoMiscelaneos)),
                    'PARROQUIA': new FormControl(this.obtenerInfoMiscelaneos('Parroquia', data.infoMiscelaneos)),
                    'ESTADOCIVIL': new FormControl(this.obtenerInfoMiscelaneos('EstadoCivil', data.infoMiscelaneos)),
                    'SEXO': new FormControl(this.obtenerInfoMiscelaneos('SEXO', data.infoMiscelaneos)),
                    'infoAdicional': new FormControl(false),
                    'PYMTDMID': new FormControl(data.PYMTRMID),
                    'OrigenIngresos': new FormControl(this.obtenerInfoMiscelaneos('OrigenIngresos', data.infoMiscelaneos)),
                    'CRLMTAMT': new FormControl(data.CRLMTAMT),
                    'COMMENT1': new FormControl(data.COMMENT1),
                    'COMMENT2': new FormControl(data.COMMENT2),
                    'USERDEF1': new FormControl(data.USERDEF1),
                    'USERDEF2': new FormControl(data.USERDEF2),
                    'CCode': new FormControl(data.CCode),
                });
            });
        }
    }

    public eventCheckInfoAdicional(value: any) {
        this.infoAdicional = value.checked;
    }

    private obtenerInfoMiscelaneos(campo: string, data: AltMissInfoAdd[]) {
        if(campo === 'Email1'){
            const resul = data.find(x => x.FIELD === 'Email' && x.TYPE == 'CUS' && x.SEQUENCY ==2);
            return resul == undefined ? '' : resul.DATA;
        }
        if(campo === 'Email2'){
            const resul = data.find(x => x.FIELD === 'Email' && x.TYPE == 'CUS' && x.SEQUENCY == 3);
            return resul == undefined ? '' : resul.DATA;
        }
        const resul = data.find(x => x.FIELD === campo && x.TYPE == 'CUS');
        return resul == undefined ? '' : resul.DATA;
    }

    public guardar() {
        const cliente = this.crearCliente();
        if (this.edicion) {
            this._clienteService.modificar(cliente).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.notificarMensaje("Cliente Modificado");
                this.id = cliente.CUSTNMBR;
                this.initFormulario();
                //this._router.navigate(['clientes/edicion'],this.);
            })
        } else {
            this._clienteService.registrar(cliente).subscribe(data => {
                this._notificarService.desactivarLoading();
                this.notificarMensaje("Cliente Registrado");
                this.id = cliente.CUSTNMBR;
                this.initFormulario();
                this._router.navigate([`clientes/edicion/${cliente.CUSTNMBR}`]);
            })
        }
    }

    private crearCliente() {
        let cliente = new Cliente();
        if (this.edicion) {
            cliente = this.clienteEdicion;
            cliente.ADDRESS1 = this.formCliente.value['ADDRESS1'];
            cliente.ADDRESS2 = this.formCliente.value['ADDRESS2'];
            cliente.ADDRESS3 = this.formCliente.value['ADDRESS3'];
            cliente.PHONE1 = this.formCliente.value['PHONE1'];
            cliente.PHONE2 = this.formCliente.value['PHONE2'];
            cliente.PHONE3 = this.formCliente.value['PHONE3'];
            cliente.SHIPCOMPLETE = this.formCliente.value['SHIPCOMPLETE'];
            cliente.STATE = this.formCliente.value['STATE'].toUpperCase();
            cliente.CCode = this.formCliente.value['CCode'];
        } else {
            cliente.CUSTNMBR = this.formCliente.value['CUSTNMBR'];
            cliente.CUSTNAME = this.formCliente.value['CUSTNAME'];
            cliente.CUSTCLAS = this.formCliente.value['CUSTCLAS'];
            cliente.ADDRESS1 = this.formCliente.value['ADDRESS1'];
            cliente.ADDRESS2 = this.formCliente.value['ADDRESS2'];
            cliente.ADDRESS3 = this.formCliente.value['ADDRESS3'];
            cliente.PHONE1 = this.formCliente.value['PHONE1'];
            cliente.PHONE2 = this.formCliente.value['PHONE2'];
            cliente.PHONE3 = this.formCliente.value['PHONE3'];
            cliente.SHIPCOMPLETE = this.formCliente.value['SHIPCOMPLETE'];
            cliente.STATE = this.formCliente.value['STATE'].toUpperCase();
            cliente.CCode = this.formCliente.value['CCode'];
        }

        this.view.subscribe(data => {
            cliente.Address = data.data;
        });

        cliente.iIAT_GL00010 = this.crearIIAT_GL00010();
        cliente.iIAT_GL00020 = this.crearIIAT_GL00020();
        cliente.infoMiscelaneos = this.crearALT_MISS_INFOADD();

        return cliente;
    }

    private crearIIAT_GL00010() {
        let iiatgl00010 = new IIATGL00010();
        if (this.edicion) {
            iiatgl00010 = this.clienteEdicion.iIAT_GL00010;
        } else {
            iiatgl00010.RUC_ID = this.formCliente.value['CUSTNMBR'];
            iiatgl00010.nsaCOA_Tipo_Doc = this.obtenerTipoIdentificacion();
            iiatgl00010.nsa_Cod_Ver = this.obtenerDecimoDigito();
            iiatgl00010.NAME = this.formCliente.value['CUSTNAME'];
            iiatgl00010.ADDRESS1 = this.formCliente.value['ADDRESS1'];
            iiatgl00010.PHONE1 = this.formCliente.value['PHONE1'];
            iiatgl00010.DOCTYPE = iiatgl00010.nsaCOA_Tipo_Doc;
            iiatgl00010.nsa_Cod_IVA1 = '';
            iiatgl00010.nsa_Cod_Transac_Venta = 2;
            iiatgl00010.nsa_Cod_Transac = '';
            iiatgl00010.Cod = '';
        }

        return iiatgl00010;
    }

    private crearIIAT_GL00020() {
        let iiatgl00020 = new IIATGL00020();
        if (this.edicion) {
            iiatgl00020 = this.clienteEdicion.iIAT_GL00020;
        } else {
            iiatgl00020.nsa_RUC_Cliente = this.formCliente.value['CUSTNMBR'];
            iiatgl00020.nsa_Cod_Ver = this.obtenerDecimoDigito();
            iiatgl00020.NAME = this.formCliente.value['CUSTNAME'];
            iiatgl00020.CUSTNAME = this.formCliente.value['CUSTNAME'];
            iiatgl00020.CUSTNMBR = this.formCliente.value['CUSTNMBR'];
            iiatgl00020.DOCTYPE = this.obtenerTipoIdentificacion();
            iiatgl00020.nsaCOA_Tipo_Doc = iiatgl00020.DOCTYPE;
            iiatgl00020.ID_TipoCli = this.obtenerTipoContribuyente();
        }
        return iiatgl00020;
    }

    private crearALT_MISS_INFOADD() {
        let miscelaneos: AltMissInfoAdd[] = [];
        const correo = this.crearObjetoAltMissInfoAdd('Email', this.formCliente.value['EMAIL'], this.formCliente.value['CUSTNMBR']);
        correo.DATA = correo.DATA.toLocaleLowerCase();
        const estadoCivil = this.crearObjetoAltMissInfoAdd('EstadoCivil', this.formCliente.value['ESTADOCIVIL'], this.formCliente.value['CUSTNMBR']);
        const sexo = this.crearObjetoAltMissInfoAdd('SEXO', this.formCliente.value['SEXO'], this.formCliente.value['CUSTNMBR']);
        const parroquia = this.crearObjetoAltMissInfoAdd('Parroquia', this.formCliente.value['PARROQUIA'], this.formCliente.value['CUSTNMBR']);
        const canton = this.crearObjetoAltMissInfoAdd('Canton', this.formCliente.value['CANTON'], this.formCliente.value['CUSTNMBR']);
        canton.DATA= canton.DATA.toUpperCase();
        const origenIngresos = this.crearObjetoAltMissInfoAdd('OrigenIngresos', this.formCliente.value['OrigenIngresos'], this.formCliente.value['CUSTNMBR']);

        miscelaneos.push(correo, estadoCivil, sexo, parroquia, canton, origenIngresos);

        if(this.formCliente.value['EMAIL1'] !== ''  ){
            const correo1 = this.crearObjetoAltMissInfoAdd('Email1', this.formCliente.value['EMAIL1'], this.formCliente.value['CUSTNMBR']);
            correo1.FIELD='Email'
            correo1.SEQUENCY=2;
            correo1.DATA = correo1.DATA.toLocaleLowerCase();
            miscelaneos.push(correo1);
        }
        if(this.formCliente.value['EMAIL2'] !== ''){
            const correo2 = this.crearObjetoAltMissInfoAdd('Email2', this.formCliente.value['EMAIL2'], this.formCliente.value['CUSTNMBR']);
            correo2.FIELD='Email'
            correo2.SEQUENCY=3;
            correo2.DATA = correo2.DATA.toLocaleLowerCase();
            miscelaneos.push(correo2);
        }

        return miscelaneos;
    }

    private crearObjetoAltMissInfoAdd(field: string, data: string, masterid: string) {
        let missInfo = new AltMissInfoAdd();
        missInfo.FIELD = field;
        missInfo.DATA = data;
        missInfo.MASTERID = masterid;
        missInfo.TYPE = 'CUS';
        missInfo.SEQUENCY = 1;
        return missInfo;
    }

    private obtenerTipoIdentificacion() {
        switch (this.formCliente.value['TIPO']) {
            case 'CÉDULA':
                return 1;
            case 'PASAPORTE':
                return 2;
            case 'RUC':
                return 3;
            default:
                return 0;
        }
    }

    private obtenerTipoContribuyente() {
        switch (this.formCliente.value['IDTipoCli']) {
            case 'PERSONA NATURAL':
                return '01';
            case 'SOCIEDAD':
                return '02';
            default:
                return '0';
        }
    }

    private obtenerTipoContribuyenteDeOriginal(valor: string) {
        switch (valor) {
            case '01':
                return 'PERSONA NATURAL';
            case '02':
                return 'SOCIEDAD';
            default:
                return '';
        }
    }

    private obtenerDecimoDigito() {
        return this.formCliente.value['CUSTNMBR'].charAt(9);
    }

    public cancelar() {
        this._router.navigate(['clientes']);
    }

    public changeValueTipoIdentificacion(valor: any) {
        this.formCliente.get('CUSTNMBR').clearValidators();
        this.formCliente.get('CUSTNMBR').updateValueAndValidity();
        this.formCliente.get('ESTADOCIVIL').clearValidators();
        this.formCliente.get('ESTADOCIVIL').updateValueAndValidity();
        this.formCliente.get('SEXO').clearValidators();
        this.formCliente.get('SEXO').updateValueAndValidity();
        this.formCliente.get('OrigenIngresos').clearValidators();
        this.formCliente.get('OrigenIngresos').updateValueAndValidity();
        switch (valor) {
            case 'CÉDULA':
                this.formCliente.controls["ESTADOCIVIL"].setValidators([Validators.required]);
                this.formCliente.get('ESTADOCIVIL').updateValueAndValidity();
                this.formCliente.controls["SEXO"].setValidators([Validators.required]);
                this.formCliente.get('SEXO').updateValueAndValidity();
                this.formCliente.controls["OrigenIngresos"].setValidators([Validators.required]);
                this.formCliente.get('OrigenIngresos').updateValueAndValidity();
                this.formCliente.controls["CUSTNMBR"].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]);
                this.formCliente.get('CUSTNMBR').updateValueAndValidity();
                break;
            case 'PASAPORTE':
                this.formCliente.controls["CUSTNMBR"].setValidators([Validators.compose([Validators.required, Validators.pattern("^([a-zA-Z0-9]){1,16}$"), Validators.maxLength(15)])]);
                this.formCliente.get('CUSTNMBR').updateValueAndValidity();
                break;
            case 'RUC':
                this.formCliente.controls["CUSTNMBR"].setValidators([Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(13), Validators.maxLength(13)])]);
                this.formCliente.get('CUSTNMBR').updateValueAndValidity();
                break;
            default:
                break;
        }
    }

    public addHandler() {
        //this.editDataItem = new CobroFormaPago();
        this.isNew = true;
        this.direcionEnEdicion = undefined;
        this.abrirDialogoRegistrar();
    }

    public saveHandler(direccion: Direccion) {
        direccion.ADDRESS1 = direccion.ADDRESS1.toUpperCase();
        direccion.ADDRESS2 = direccion.ADDRESS2.toUpperCase();
        direccion.ADDRESS3 = direccion.ADDRESS3.toUpperCase();
        if (!this.isNew) {
            this.editarDireccionService.assignValues(this.direcionEnEdicion, direccion);
            this.editarDireccionService.save(direccion, this.isNew);
        }
        else {
            this.direccionLista.push(direccion);
            this.editarDireccionService.next(this.direccionLista);
        }
    }

    public editHandler({ dataItem }) {
        this.isNew = false;
        this.direcionEnEdicion = dataItem;
        this.abrirDialogoRegistrar();
    }

    private abrirDialogoRegistrar() {
        const dialogRefRegistro = this.dialogService.open({
            appendTo: this.containerRegsitroDireccionRef,
            content: RegistroDireccionComponent,
            minWidth: 500,
            title: 'Registro/Edición',
            actions: [{ text: 'Cancelar' }, { text: 'Aceptar', primary: true }],
            preventAction: (ev, dialog) => {
                if (ev['text'] === 'Aceptar')
                    return !dialog.content.instance.editForm.valid;
                else
                    return false;
            }
        });

        const formaPagoRegistro = dialogRefRegistro.content.instance;
        formaPagoRegistro.direccionEnEdicion = this.direcionEnEdicion;
        formaPagoRegistro.direccionesLista = this.direccionLista;
        dialogRefRegistro.result.subscribe(r => {
            if (r['text'] == 'Aceptar') {
                this.saveHandler(formaPagoRegistro.editForm.value);
                dialogRefRegistro.close();

            }
            if (r['text'] == 'Cancelar') {
                dialogRefRegistro.close();

            }
        });
    }

    public mostrarConfirmacionGuardar() {
        this.formCliente.markAllAsTouched();
        if (!this.formCliente.invalid) {
            let mensaje: string = "¿Está seguro que registrar los cambios realizados?";
            const dialog: DialogRef = this.dialogService.open({
                appendTo: this.containerConfirmacionClienteRef,
                title: 'Confirmación',
                content: mensaje,
                actions: [
                    { text: 'No' },
                    { text: 'Sí', primary: true }
                ],
                width: 350,
                height: 150,
            });

            dialog.result.subscribe((result) => {
                if (result instanceof DialogCloseResult) {

                } else {
                    if (result['text'] === 'Sí') {
                        this.guardar();
                    }
                }
            });
        }

    }

    private notificarMensaje(mensaje: string) {
        this._notificarService.loadingCambio.next(false);
        this._notificarService.mensajeRequest.next({ detalle: mensaje, tipo: 'success' });
    }

    public mayus(value: any, control: string){
        if(control === 'CUSTNMBR'){
            this.formCliente.get('CUSTNMBR').setValue(value.toUpperCase());
        }
        if(control === 'CUSTNAME'){
            this.formCliente.get('CUSTNAME').setValue(value.toUpperCase());
        }
    }
}
