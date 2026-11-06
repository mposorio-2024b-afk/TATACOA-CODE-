import { IsDateString, IsIn, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export const TOURS = ['Astronómico', 'Senderismo Cuzco', 'Los Hoyos', 'Fotografía nocturna'];

export class CreateReservaDto {
  @IsString({ message: 'El visitante debe ser texto' })
  @IsNotEmpty({ message: 'El visitante es obligatorio' })
  @MaxLength(80, { message: 'El visitante no puede tener más de 80 caracteres' })
  visitante: string;

  @IsIn(TOURS, { message: `El tour debe ser uno de: ${TOURS.join(', ')}` })
  tour: string;

  @IsDateString({}, { message: 'La fecha debe tener el formato AAAA-MM-DD' })
  fecha: string;

  @IsInt({ message: 'Personas debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 persona' })
  @Max(20, { message: 'Máximo 20 personas por reserva' })
  personas: number;
}
