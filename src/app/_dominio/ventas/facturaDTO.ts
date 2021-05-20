export class FacturaDTO {
    idFactura: number;
    numeroFactura: string;
    estado: string;
    error: string;
    facturaDespachada: boolean;
    numeroTransferencias: string[] = [];
}
