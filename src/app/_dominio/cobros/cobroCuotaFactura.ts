import { CobroFormaPago } from './cobroFormaPago';
import { CondicionCobroFactura } from './condicionCobroFactura';

export class CobroCuotaFactura {
    id: number;
    cuotaFactura: CondicionCobroFactura;
    valor: number;
    numeroFactura: string;
    cobroFormaPagoId: number;
    estado: string;
}
