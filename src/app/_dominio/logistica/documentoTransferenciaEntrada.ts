import { DocumentoBase } from "../ventas/documentoBase";

export class DocumentoTransferenciaEntrada extends DocumentoBase {
    documentoTransferenciaSalidaId: number;
    bodegaOrigen: string;
    bodegaDestino: string;
    entregaMercaderia: string;
    descBodegaOrigen: string;
    descBodegaDestino: string;
    direccionBodegaOrigen: string;
    direccionBodegaDestino: string;
    guiaRemision: string;
}
