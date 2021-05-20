import { Perfil } from '../sistema/perfil';
import { PuntoVenta } from './../sistema/puntoVenta';
export class CriterioArticuloDTO {
    criterio: string;
    puntoVenta: PuntoVenta;
    perfil: Perfil;
}
