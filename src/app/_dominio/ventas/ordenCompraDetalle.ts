import { CotizacionDetalle } from "./cotizacionDetalle";

export class OrdenCompraDetalle {
    id: number;
    codigoArticulo: string;
    cantidad: number;
    saldo: number;
    cantidadRecepcion: number;
    costoUnitario: number;
    precioVenta: number;
    ordenCompraId: number;
    cotizacionDetalle: CotizacionDetalle;
}
