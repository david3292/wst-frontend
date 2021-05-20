import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class FechaService {

    constructor() {
        moment().locale('es');
    }

    fechaActual() {
        let now = moment();
        return now.format('YYYY-MM-DD');
    }

    fechaYHoraActual() {
        let now = moment();
        return now.format('YYYY-MM-DD HH:mm');
    }

    formatearFecha(date: string) {
        return moment(date).format('DD-MM-YYYY');
    }

    formatearFechaYHora(date: string) {
        return moment(date).format('YYYY-MM-DD HH:mm');
    }

    dateToString(date: Date) {
        return moment(date).format('YYYY-MM-DD HH:mm');
    }

    diferenciaFechaActualEnDias(date: string) {
        const fecha = moment(date).format('YYYY-MM-DD');
        const fechaActual = moment().format('YYYY-MM-DD');
        return moment(fecha, 'YYYY-MM-DD').diff(fechaActual, 'days');
    }

    sumarDias(date: string, dias: number) {
        const fecha = moment(date);
        return fecha.add(dias, 'days').format('YYYY-MM-DD');
    }

    fechaEstaDentroRango(fechaInicio: Date, fechaFin: Date, fecha: string) {
        return moment(fecha).isBetween(fechaInicio, fechaFin, undefined, '[]');
    }

    fechaEsSuperiorOIgual(fechaInicio: Date, fecha: string){
        return moment(fecha).isSameOrAfter(fechaInicio);
    }

    fechaEsInferiorOIgual(fechaFin: Date, fecha: string){
        return moment(fecha).isSameOrBefore(fechaFin);
    }

    esFechaActual(date: string){
        var dateA = moment(date).format('YYYY-MM-DD');
        var dateB = moment().format('YYYY-MM-DD');
        const diferenciaDias = moment(dateA,'YYYY-MM-DD').diff(dateB, 'days');
        return diferenciaDias == 0 ? true: false;
    }
}
