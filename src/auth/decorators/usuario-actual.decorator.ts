import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Datos del usuario que inició sesión (vienen dentro del token).
// Es una clase (no interface) para que funcione con los decoradores.
export class UsuarioToken {
  sub: number;
  nombre: string;
  correo: string;
  rol: string;
}

export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    return ctx.switchToHttp().getRequest().usuario;
  },
);
