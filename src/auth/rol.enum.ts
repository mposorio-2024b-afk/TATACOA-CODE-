export enum Rol {
  ADMIN = 'admin',
  RESERVAS = 'reservas',
  FACTURACION = 'facturacion',
  PAGOS = 'pagos',
  CLIENTE = 'cliente', // visitante que se registra solo para pedir reservas
}

export const ROLES = Object.values(Rol);
