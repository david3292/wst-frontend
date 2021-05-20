export const menus: any[] = [
    {
        text: 'INICIO'
    },
    {
        text: 'VENTAS',
        items: [
            { text: 'Listas de Precios' },
            {
                text: 'Ventas',
                items: [
                    { text: 'Cotizar' },
                    { text: 'Re Cotizar' },
                    { text: 'Reservar' },
                    { text: 'Facturar' }
                ]
            }
        ]
    },
    {
        text: 'LOGISTICA',
        items: [
            { text: 'Despacho' },
            { text: 'Abastecimiento' },
            { text: 'Transferencias' },
            { text: 'Recepción Compras' },
        ]
    },
    {
        text: 'COMPRAS',
        items: [
            { text: 'Reposición' },
            { text: 'Cotización' },
            { text: 'Orden de Compra' },
            { text: 'Recepción Compras-Costos de Importación' },
        ]
    },
    { text: 'CONFIGURACIÓN' },
    { text: 'REPORTE' }

];
