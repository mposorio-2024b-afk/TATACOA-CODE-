import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Rol } from '../rol.enum';

// Guardia 2: ¿el rol del usuario tiene permiso para esta ruta?
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Sin @Roles → cualquier usuario con sesión puede entrar
    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;

    const usuario = context.switchToHttp().getRequest().usuario;
    if (!usuario) return true; // ruta pública
    if (usuario.rol === Rol.ADMIN || rolesPermitidos.includes(usuario.rol)) return true;

    throw new ForbiddenException(
      `Tu rol (${usuario.rol}) no tiene permiso para esta acción. Roles permitidos: ${rolesPermitidos.join(', ')}`,
    );
  }
}
