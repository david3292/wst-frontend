/**
 * Metodo que verifica que las propiedades de un objeto no sean nulas o esten vacias.
 *
 * @param objeto
 */
export const verificarObjetoVacio = objeto => {
    if (objeto === null) {
        return false;
    }

    for (let key in objeto) {
        if (objeto[key] !== null && objeto[key] !== '') {
            return true;
        }
    }
    return false;
};
