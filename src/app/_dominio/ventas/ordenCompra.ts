import { Cotizacion } from "./cotizacion";
import { OrdenCompraDetalle } from "./ordenCompraDetalle";

export class OrdenCompra {
    id: number;
    cotizacion: Cotizacion;
    codigoProveedor: string;
    nombreProveedor: string;
    telefonoProveedor: string;
    emailProveedor: string;
    fechaEmision: string;
    fechaRecepcion: string;
    estado: string;
    condicionPago: string;
    bodegaEntrega: string;
    numero: string;
    numeroRecepcion: string;
    subTotal: number;
    referencia: string;
    codigoVendedor: string;
    mensajeError: string;
    detalle: OrdenCompraDetalle[];
}
