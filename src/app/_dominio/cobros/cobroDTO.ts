import { CobroFormaPagoDTO } from './cobroFormaPagoDTO';

export class CobroDTO {
    numero: string;
    cobroFormaPagos: CobroFormaPagoDTO[] = [];
    guiaDespachoIds: number[] = [];
    estado: string;
}
