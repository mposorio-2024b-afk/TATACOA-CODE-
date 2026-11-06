import { SetMetadata } from '@nestjs/common';

// Marca una ruta como pública: no necesita iniciar sesión (ej: el login)
export const ES_PUBLICA = 'esPublica';
export const Public = () => SetMetadata(ES_PUBLICA, true);
