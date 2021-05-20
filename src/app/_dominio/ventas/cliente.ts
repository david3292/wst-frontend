import { IIATGL00020 } from './iiatGL00020';
import { Direccion } from './direccion';
import { IIATGL00010 } from './iiatGL00010';
import { AltMissInfoAdd } from '../alt/altMissInfoAdd';

export class Cliente {
    CUSTNMBR: string;
    CUSTNAME: string;
    CUSTCLAS: string;
    CNTCPRSN: string;
    SHRTNAME: string;
    ADRSCODE: string;
    ADDRESS1: string;
    ADDRESS2: string;
    ADDRESS3: string;
    PHONE1: string;
    PHONE2: string;
    PHONE3: string;
    CRLMTAMT: number;
    CRLMTTYP: number;
    PYMTRMID: string;
    Address: Direccion[];
    COMMENT1: string;
    COMMENT2: string;
    SHIPCOMPLETE: boolean;
    STATE: string;
    UpdateIfExists: boolean;
    iIAT_GL00010: IIATGL00010;
    iIAT_GL00020: IIATGL00020;
    infoMiscelaneos: AltMissInfoAdd[] = [];
    USERDEF1:string;
    USERDEF2:string;
    CCode: string;
}
