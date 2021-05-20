import { PuntoVenta } from './puntoVenta';
import { UsuarioPerfil } from './usuarioPerfil';
export class ConfiguracionUsuarioPerfil {
    id: number;
    puntoVenta: PuntoVenta;
    usuarioPerfil: UsuarioPerfil;
    activo:boolean;
    editarCondicionPago: boolean;
    editarDescuentoAdicional: boolean;
    editarPorcentajeAnticipo: boolean;
    editarDescripcionArticulo: boolean;
    editarPrecioArticulo: boolean;
    editarDescuentoFijo: boolean;
}
