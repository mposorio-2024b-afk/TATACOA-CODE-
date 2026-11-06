import { IsInt, Min } from 'class-validator';

export class CreateFacturaDto {
  @IsInt({ message: 'reservaId debe ser un número entero' })
  @Min(1, { message: 'reservaId no es válido' })
  reservaId: number;
}
