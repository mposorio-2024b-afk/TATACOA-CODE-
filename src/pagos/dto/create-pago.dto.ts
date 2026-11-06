import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export const METODOS = ['efectivo', 'tarjeta', 'transferencia', 'nequi'];

export class CreatePagoDto {
  @IsInt({ message: 'facturaId debe ser un número entero' })
  @Min(1, { message: 'facturaId no es válido' })
  facturaId: number;

  @IsInt({ message: 'El monto debe ser un número entero (pesos)' })
  @Min(1000, { message: 'El monto mínimo es $1.000' })
  monto: number;

  @IsIn(METODOS, { message: `El método debe ser uno de: ${METODOS.join(', ')}` })
  metodo: string;

  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'La referencia no puede tener más de 60 caracteres' })
  referencia?: string;
}
