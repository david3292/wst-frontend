export class CotizacionDetalle {
    id: number;
    codigoArticulo: string;
    codigoArticuloAlterno: string;
    descripcionArticulo: string;
    descripcionArticuloGP: string;
    claseArticulo: string;
    pesoArticulo: number;
    cantidad: number;
    precio: number;
    precioGP: number;
    descuentoFijo: number;
    descuentoFijoGP: number;
    descuentoAdicional: number;
    subTotal: number;
    total: number;
    impuestoDetalle: string;
    impuestoValor: number;
    unidadMedida: string;
    saldo: number;
    precioUnitario: number;
    valorDescuento: number;
    servicio: boolean;
    generaCompra: boolean;
    costoUnitario: number;
    unidadMedidaCompra: string;
    cantidadReserva: number;
}
