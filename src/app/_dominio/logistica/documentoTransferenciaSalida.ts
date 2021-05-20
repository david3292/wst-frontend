import { DocumentoBase } from '../ventas/documentoBase';

export class DocumentoTransferenciaSalida extends DocumentoBase {
    documentoTransferenciaId: number;
    bodegaOrigen: string;
    bodegaDestino: string;
    entregaMercaderia: string;
    descBodegaOrigen: string;
    descBodegaDestino: string;
    direccionBodegaOrigen: string;
    direccionBodegaDestino: string;
    mensajeError: string;
}
