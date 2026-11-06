import { SetMetadata } from '@nestjs/common';
import { Rol } from '../rol.enum';

// Indica qué roles pueden usar una ruta. El admin siempre puede.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
