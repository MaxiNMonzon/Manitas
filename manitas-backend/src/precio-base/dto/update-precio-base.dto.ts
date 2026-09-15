import { PartialType } from '@nestjs/mapped-types';
import { CreatePrecioBaseDto } from './create-precio-base.dto';

export class UpdatePrecioBaseDto extends PartialType(CreatePrecioBaseDto) {}

//PREGUNTARR SI ES NECESARIO COLOCAR ATRIBUTOS!!!!!!!!!!!!!