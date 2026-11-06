import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Rol } from './rol.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usersService.buscarConClave(dto.correo);
    const claveCorrecta = usuario && (await bcrypt.compare(dto.clave, usuario.clave));
    if (!usuario || !claveCorrecta) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    const datos = { sub: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
    return {
      access_token: await this.jwtService.signAsync(datos),
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    };
  }

  // POST /auth/registro → crea la cuenta de cliente y entra de una vez
  async registro(dto: RegistroDto) {
    await this.usersService.create({ ...dto, rol: Rol.CLIENTE });
    return this.login({ correo: dto.correo, clave: dto.clave });
  }
}
