import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/_servicio/login.service';

@Component({
    selector: 'inicio.component',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

    public usuario : string;
    
    constructor( ) { }

    ngOnInit(): void  {
        this.obtenerNombreUsuario();
    }

    obtenerNombreUsuario(){
        let tk = sessionStorage.getItem(environment.TOKEN_NAME);
        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(tk);
        this.usuario= decodedToken.user_name;
    }

}
