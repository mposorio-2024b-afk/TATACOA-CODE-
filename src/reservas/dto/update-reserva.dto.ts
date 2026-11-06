import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateReservaDto } from './create-reserva.dto';

export const ESTADOS = ['pendiente', 'confirmada', 'cancelada'];

export class UpdateReservaDto extends PartialType(CreateReservaDto) {
  @IsOptional()
  @IsIn(ESTADOS, { message: `Estado inválido. Usa: ${ESTADOS.join(', ')}` })
  estado?: string;
}
