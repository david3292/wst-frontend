import { DocumentoBase } from '../ventas/documentoBase';

export class DocumentoGuiaRemision extends DocumentoBase {

    documentoPadreId: number;
    nombreConductor: string;
    cedulaConductor: string;
    fechaInicioTraslado: string;
    fechaFinTraslado: string;
    bodegaPartida: string;
    direccionPartida: string;
    direccionEntega: string;
    motivo: string;
    ruta: string;
    placa: string;
    correo: string;
    direccionEntregaCodigo: string;
    mensajeError: string;
}
