import { DocumentoBase } from './documentoBase';
export class DocumentoReserva extends DocumentoBase{

    direccionEntrega: string;
    direccionEntregaDescripcion: string;
    bodegaPrincipal: string;
    entrega: string;
    periodoGracia: number;
    porcentajeAbono: number;
    fechaMaximaAbono: string;
    fechaMaximaReserva: string;
    tipoReserva: string;
    retirarCliente: string;
}
