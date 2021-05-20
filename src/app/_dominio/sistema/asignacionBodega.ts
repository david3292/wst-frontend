import { Bodega } from './bodega';
import { ConfiguracionUsuarioPerfil } from './configuracionUsuarioPerfil';

export class AsignacionBodega{
    id: number;
    configuracionUsuarioPerfil: ConfiguracionUsuarioPerfil;
    bodega : Bodega;
    acceso: boolean;

}
