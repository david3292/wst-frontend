import { CondicionPagoDetalle } from './condicionPagoDetalle';

export class CondicionPago {
    id: number;
    termino: string;
    cuotas: number;
    totalDias: number;
    documentoSoporte: boolean;
    activo: boolean;
    tipoPago: string;
    detalle: CondicionPagoDetalle[];
}
