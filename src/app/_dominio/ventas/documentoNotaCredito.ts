import {DocumentoBase} from './documentoBase';
import {MotivoNotaCredito} from './motivoNotaCredito';

export class DocumentoNotaCredito extends DocumentoBase {
    documentoFacturaId: number;
    bodegaPrincipal: string;
    motivoNotaCredito: MotivoNotaCredito;
    total: number;
    totalCalculado:number; //getter para calcular
    mensajeError: string;
    revisionTecnica: boolean;
    codigoCliente: string;
    nombreCliente: string;
    codigoDireccion: string;
    descripcionDireccion: string;
}
