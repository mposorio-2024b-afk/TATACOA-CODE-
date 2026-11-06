import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ROLES } from '../../auth/rol.enum';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'El nombre no puede tener más de 80 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La clave debe tener al menos 6 caracteres' })
  clave: string;

  @IsIn(ROLES, { message: `El rol debe ser uno de: ${ROLES.join(', ')}` })
  rol: string;
}
