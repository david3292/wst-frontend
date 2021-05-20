import { PuntoVenta } from './puntoVenta';
import { Bodega } from './bodega';
export class PuntoVentaBodega {
    id: number;
    puntoVenta: PuntoVenta;
    bodega: Bodega;
    activo: boolean = true;
    principal: boolean;
}
