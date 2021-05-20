import { CotizacionDetalle } from './cotizacionDetalle';
import { DocumentoDetalleCompartimiento } from './documentoDetalleCompartimiento';

export class DocumentoDetalle{
    id: number;
    cotizacionDetalle: CotizacionDetalle;
    codigoBodega: string;
    cantidad: number;
    saldo: number;
    compartimientos: DocumentoDetalleCompartimiento[];
    total: number;
    codigoArticulo: string;
    codigoArticuloAlterno: string;
    costoUnitario: number;
    descripcionArticulo: string;
    claseArticulo: string;
    pesoArticulo: number;
    unidadMedida: string;
    cantidadReserva: number;
    servicio: boolean;
}
