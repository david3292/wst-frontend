import { PuntoVenta } from './puntoVenta';
import { TipoDocumento } from './tipo-documento';

export class Secuencial {

    id: number;
    tipoDocumento: TipoDocumento;
    puntoVenta: PuntoVenta;
    docIdGP: string;
    abreviatura: string;
    susecion:number;
    activo: boolean;
}
