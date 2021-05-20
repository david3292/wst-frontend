import { CuotaDTO } from './cuotaDTO';

export class CobroDocumentoDTO {
    tipoCredito: string;
    condicionPago: string;
    cuotas: CuotaDTO[];
    deudaTotal: number;
    idPuntoVenta: number;
    facturaContabilizada: boolean;
}
