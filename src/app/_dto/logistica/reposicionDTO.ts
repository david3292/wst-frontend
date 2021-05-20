import { ReposicionDetalleDTO } from "./reposicionDetalleDTO";

export class ReposicionDTO {
    idReposicion: number;
    bodegaOrigen: string;
    bodegaDestino: string;
    numero: string;
    estado: string;
    fecha: string;
    detalle: ReposicionDetalleDTO[] = [];
}
