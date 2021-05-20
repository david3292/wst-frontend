import { CotizacionDetalle } from "./cotizacionDetalle";

export class RecepcionCompraDetalle{

    id: number;
    codigoArticulo: string;
    cantidadCompra: number;
    cantidadRecepcion: number;
    recepcionCompraId: number;
    cotizacionDetalle: CotizacionDetalle;

}
