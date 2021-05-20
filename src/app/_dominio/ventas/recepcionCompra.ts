import { OrdenCompra } from "./ordenCompra";
import { RecepcionCompraDetalle } from "./recepcionCompraDetalle";

export class RecepcionCompra {

    id: number;
    fechaRecepcion: string;
    numeroRecepcion: string;
    estado: string;
    mensajeError: string;
    ordenCompra: OrdenCompra;
    detalle: RecepcionCompraDetalle[];

}
