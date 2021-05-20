import { DocumentoFactura } from '../ventas/documentoFactura';

export class CondicionCobroFactura {
    id: number;
    factura: DocumentoFactura;
    fecha: string;
    numeroCuota: number;
    porcentaje: number;
    totalDias: number;
    valor: number;
}
