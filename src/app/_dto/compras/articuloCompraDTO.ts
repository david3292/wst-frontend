import { Proveedor } from "src/app/_dominio/compras/proveedor";
import { PuntoVenta } from "src/app/_dominio/sistema/puntoVenta";
import { CotizacionDetalle } from "src/app/_dominio/ventas/cotizacionDetalle";

export class ArticuloCompraDTO {
    proveedor: Proveedor;
    condicionPago: string;
    condicionPagoGp: string;
    proveedorCambio: Proveedor;
    cotizacionId: number;
    bodegaEntrega: string;
    cotizacionDetalle: CotizacionDetalle;
    cantidad: number;
    costoUnitarioCompra: number;
    precioVenta: number;
    margenUtilidad: number;
    margenUtilidadOriginal: number;
    puntoVenta: PuntoVenta;
}
