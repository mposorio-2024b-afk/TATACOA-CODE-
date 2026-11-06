import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// Registro público de visitantes: el rol siempre será "cliente"
export class RegistroDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'El nombre no puede tener más de 80 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  clave: string;
}
