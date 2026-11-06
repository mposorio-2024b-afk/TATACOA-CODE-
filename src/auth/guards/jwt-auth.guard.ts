import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ES_PUBLICA } from '../decorators/public.decorator';

// Guardia 1: ¿la petición trae un token válido?
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublica = this.reflector.getAllAndOverride<boolean>(ES_PUBLICA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublica) return true;

    const request = context.switchToHttp().getRequest();
    const [tipo, token] = (request.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }
    try {
      request.usuario = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('La sesión expiró o el token no es válido');
    }
    return true;
  }
}
