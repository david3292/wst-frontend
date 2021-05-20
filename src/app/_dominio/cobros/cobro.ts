import { CobroFormaPago } from 'src/app/_dominio/cobros/cobroFormaPago';
import { PuntoVenta } from './../sistema/puntoVenta';
import { CobroCuotaFactura } from './cobroCuotaFactura';
export class Cobro {
    id: number;
    puntoVenta: PuntoVenta;
    codigoCliente: string;
    nombreCliente: string;
    fecha: string;
    deuda: number;
    valor: number;
    numero: number;
    activo: boolean;
    estado: string;
    cuotaFacturas: CobroCuotaFactura[];
    cobroFormaPagos: CobroFormaPago[];
}
