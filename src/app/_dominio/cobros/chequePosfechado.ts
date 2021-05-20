import { CobroFormaPago } from "./cobroFormaPago";

export class ChequePosfechado {
    cobroFormaPago: CobroFormaPago;
    diasProrroga: number;
    fechaEfectivizacion: string;
    canje: boolean;
    estado: string;
    observacion: string;
    mensajeError: string;
}
