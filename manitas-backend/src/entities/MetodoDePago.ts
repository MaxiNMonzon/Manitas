export class MetodoDePago {
        idFormaPago: number;
        tipo: string;
        estado: string;

        constructor(idFormaPago: number, tipo: string, estado: string) {
                this.idFormaPago = idFormaPago;
                this.tipo = tipo;
                this.estado = estado;
        }
}

//LO HACE MAXI, DEFINICIÓN MÍNIMA PARA QUE NO SE ROMPA