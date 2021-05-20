import { PuntoVenta } from '../sistema/puntoVenta';
import { CotizacionControles } from './cotizacionControles';
import { CotizacionDetalle } from './cotizacionDetalle';

export class Cotizacion {
    id: number;
    empresa: string;
    numero: string;
    codigoCliente: string;
    nombreCliente: string;
    fechaEmision: string;
    estado: string;
    formaPago: string;
    condicionPago: string;
    totalKilos: number;
    detalle: CotizacionDetalle[];
    totalBaseImponible: number;
    totalIva: number;
    total: number;
    comentario: string;
    comentario2: string;
    activo: boolean = true;
    puntoVenta: PuntoVenta;
    fechaVencimiento: string;
    controles: CotizacionControles;
    diaMaximoFacturacion: number;
    codigoDireccion: string;
    descripcionDireccion: string;
    ordenCliente: string;
    codigoVendedor: string;
    subtotaNoIVA: number;
    subtotalIVA: number;
}
