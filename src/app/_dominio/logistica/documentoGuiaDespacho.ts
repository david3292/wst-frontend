import { DocumentoBase } from "../ventas/documentoBase";
import { DocumentoGuiaRemision } from "./documentoGuiaRemision";

export class DocumentoGuiaDespacho extends DocumentoBase {
    documentoFacturaId: number;
    bodega: string;
    entrega: string;
    direccionEntrega: string;
    numeroCotizacion: string;
    numeroFactura: string;
    retirarCliente: string;
}
