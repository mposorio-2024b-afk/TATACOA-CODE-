import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  clave: string;
}
