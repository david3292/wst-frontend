import { PuntoVenta } from '../sistema/puntoVenta';
import { CajaDetalle } from './cajaDetalle';

export class Caja {
    id: number;
    puntoVenta: PuntoVenta;
    fechaInicio: string;
    fechaCierre: string;
    cajaDetalles: CajaDetalle[] = [];
}
