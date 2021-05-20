export class ChequePosfechadoDTO {
    chequePosfechadoControlesId: number;
    chequePosfechadoId: number;
    numeroCheque: string;
    banco: string;
    canje: boolean;
    monto: number;
    observacion: string;
    diasProrroga: number;
    documentosAplicados: string[]=[];
    fechaCheque: string;
    nuevaFecha: string;
    revision: boolean;
    codigoCliente: string;
    nombreCliente: string;
    cobroFecha:string;
    usuarioAnalista: string;
}
