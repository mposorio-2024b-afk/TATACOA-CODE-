import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Public } from './decorators/public.decorator';
import { UsuarioActual, UsuarioToken } from './decorators/usuario-actual.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro → un visitante crea su cuenta (rol cliente)
  @Public()
  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto);
  }

  // POST /auth/login → recibe correo y clave, devuelve el token
  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /auth/perfil → quién soy (según el token)
  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioToken) {
    return usuario;
  }
}
