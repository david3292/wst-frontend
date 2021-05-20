import { Cotizacion } from './cotizacion';
import { DocumentoDetalle } from './documentoDetalle';

export abstract class DocumentoBase {
    id: number;
    numero: string;
    referencia: string;
    cotizacion: Cotizacion;
    fechaEmision: string;
    estado: string;
    tipo: string;
    detalle: DocumentoDetalle[];
}
