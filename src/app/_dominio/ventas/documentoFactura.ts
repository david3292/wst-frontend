import {DocumentoBase} from './documentoBase';

export class DocumentoFactura extends DocumentoBase {
    documentoReservaId: number;
    direccionEntrega: string;
    direccionEntregaDescripcion: string;
    bodegaPrincipal: string;
    entrega: string;
    total: number;
    periodoGracia: number;
    mensajeError: string;
    despachada: boolean;
    codigoCliente: string;
    nombreCliente: string;
    codigoDireccion: string;
    descripcionDireccion: string;
    refacturacion: boolean;
}
