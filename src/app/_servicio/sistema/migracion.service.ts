import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NotificarService } from '../notificar.service';

@Injectable({
    providedIn: 'root'
})
export class MigracionService {
    url: string = `${environment.HOST}/migraciones`;

    constructor(private http: HttpClient,
        private notificarService: NotificarService) { }

    guardarArchivo(data: File) {
        this.notificarService.activarLoading();
        let formData: FormData = new FormData();
        formData.append('adjunto', data);
        return this.http.post(`${this.url}/importarDatos`, formData);
    }
}
