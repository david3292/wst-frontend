import { LoginService } from './../../_servicio/login.service';
import { Component } from '@angular/core';
import { menus } from './menus';
import { Menu } from 'src/app/_dominio/sistema/menu';
import { MenuService } from 'src/app/_servicio/sistema/menu.service';
import { SessionService } from 'src/app/_servicio/session.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    public usuarioNombreCompleto: string;
    //public menus: any[] = menus;
    menus: Menu[];
    public logo = "assets/img/logo.png";
    public puntoVenta: string = "";

    constructor(private menuService: MenuService,
        public loginService: LoginService,
        private _sessionService: SessionService
    ) { }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.menuService.menuCambio.subscribe(data => {
            this.menus = data;
        });

        this.menuService.usuarioNombreCompleto.subscribe(data => {
            this.usuarioNombreCompleto = data;
        });
        this.obtenerPuntoVenta();
    }

    public obtenerPuntoVenta() {
        if (!this._sessionService.esSuperadmin()) {
            let perfil = this._sessionService.perfilNombre();
            if ((perfil !== "APROBADOR_CREDITO_Y_COBRANZAS") && (perfil !== "APROBADOR_COMERCIAL")) {
                this.puntoVenta = this._sessionService.puntoVentaNombre();
            }
        }
    }

    public onSelect({ item }): void {
        if (item.nombre === 'Estado Cuenta Cliente') {
            window.open(item.url);
        }
    }
}



