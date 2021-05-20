import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SortDescriptor } from '@progress/kendo-data-query';
import { NotificarService } from 'src/app/_servicio/notificar.service';
import { UsuarioService } from 'src/app/_servicio/sistema/usuario.service';
import { UsuarioLdapService } from 'src/app/_servicio/usuario-ldap.service';

@Component({
    selector: 'app-usuario',
    templateUrl: './usuario.component.html',
    styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {

    usuarios: any[];

    public sort: SortDescriptor[] = [{
        field: 'nombreCompleto',
        dir: 'asc'
    }];

    constructor(private usuarioService: UsuarioService,
        private notificarService: NotificarService,
        public route : ActivatedRoute) { }

    ngOnInit(): void {

        this.usuarioService.listarTodos().subscribe(data => {
            this.notificarService.loadingCambio.next(false);
            this.usuarios = data;
        })

        this.usuarioService.usuariosCambio.subscribe(data =>{
            this.usuarios = data;
        })
    }

}
