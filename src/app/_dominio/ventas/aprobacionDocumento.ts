import { Cotizacion } from './cotizacion';
import { DocumentoFactura } from './documentoFactura';
import { DocumentoReserva } from './documentoReserva';

export class AprobacionDocumento {

    id: number;
    activo: boolean;
    usuario: string;
    estado: string;
    cotizacion: Cotizacion;
    tipoDocumento: string;
    observacion: string;
    formaPago: boolean;
    precioProducto: boolean;
    documentoSoportePendiente: boolean;
    documentosVencidos: boolean;
    creditoCerrado: boolean;
    excesoLimiteCredito: boolean;
    reservaStock: boolean;
    reservaTransito: boolean;
    cambioMargenUtilidad: boolean;
    cambioCondicionPagoProveedor: boolean;
    factura: DocumentoFactura;
    reserva: DocumentoReserva;
    descuentoFijo: boolean;
    descripcionArticulo: boolean;
}
