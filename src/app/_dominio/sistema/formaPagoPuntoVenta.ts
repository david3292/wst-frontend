import { FormaPago } from './formaPago';
import { PuntoVenta } from './puntoVenta';

export class FormaPagoPuntoVenta{
    id: number;
    puntoVenta: PuntoVenta;
    formaPago: FormaPago;
    chequera: string;
    activo: boolean = true;
}
