class Localidad{

    constructor(idLocalidad, codigoPostal, nombreLocalidad, provincia){

            this.idLocalidad = idLocalidad;
            this.codigoPostal = codigoPostal;
            this.nombreLocalidad = nombreLocalidad;
            this.provincia = provincia;

            this.zonas = [];

    }

    agregarZona(zona){
        this.zonas.push(zona);
    }


}

export default Localidad;