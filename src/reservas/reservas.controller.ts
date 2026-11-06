import {
  Body, Controller, Delete, Get, Head, Header, Options,
  Param, ParseIntPipe, Patch, Post, Put, Query, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../auth/rol.enum';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

// Consultar (GET, HEAD, OPTIONS): cualquier usuario con sesión (el cliente solo ve las suyas).
// Crear (POST): rol reservas o cliente.
// Modificar y borrar (PUT, PATCH, DELETE): solo el rol reservas (y admin).
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  // ───────── RUTAS DE LA COLECCIÓN: /reservas ─────────

  // HEAD /reservas → cuántas reservas hay, sin enviar la lista
  @Head()
  async contar(
    @Query('estado') estado: string | undefined,
    @UsuarioActual() usuario: UsuarioToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const total = await this.reservasService.contar(usuario, estado);
    res.setHeader('X-Total-Reservas', String(total));
  }

  // GET /reservas → todas (o filtradas con ?estado=)
  @Get()
  findAll(@UsuarioActual() usuario: UsuarioToken, @Query('estado') estado?: string) {
    return this.reservasService.findAll(usuario, estado);
  }

  // POST /reservas → crear  *
  @Roles(Rol.RESERVAS, Rol.CLIENTE)
  @Post()
  create(@Body() dto: CreateReservaDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.reservasService.create(dto, usuario);
  }

  // OPTIONS /reservas → qué se puede hacer aquí
  @Options()
  @Header('Allow', 'GET, POST, HEAD, OPTIONS')
  opcionesColeccion() {
    return {
      ruta: '/reservas',
      metodosPermitidos: ['GET', 'POST', 'HEAD', 'OPTIONS'],
      ayuda: {
        GET: 'Lista las reservas (?estado=pendiente para filtrar)',
        POST: 'Crea una reserva: visitante, tour, fecha, personas',
        HEAD: 'Devuelve X-Total-Reservas sin cuerpo',
        OPTIONS: 'Muestra esta información',
      },
    };
  }

  // ───────── RUTAS DE UNA RESERVA: /reservas/:id ─────────

  // HEAD /reservas/:id → ¿existe? ¿en qué estado está?
  @Head(':id')
  async existe(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const reserva = await this.reservasService.findOne(id, usuario); // 404 si no existe
    res.setHeader('X-Reserva-Estado', reserva.estado);
  }

  // GET /reservas/:id → una reserva
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioToken) {
    return this.reservasService.findOne(id, usuario);
  }

  // PUT /reservas/:id → reemplazar todo  *
  @Roles(Rol.RESERVAS)
  @Put(':id')
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateReservaDto) {
    return this.reservasService.replace(id, dto);
  }

  // PATCH /reservas/:id/cancelar → el cliente cancela su propia reserva pendiente  *
  @Roles(Rol.CLIENTE, Rol.RESERVAS)
  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioToken) {
    return this.reservasService.cancelar(id, usuario);
  }

  // PATCH /reservas/:id → modificar algunos campos  *
  @Roles(Rol.RESERVAS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReservaDto) {
    return this.reservasService.update(id, dto);
  }

  // DELETE /reservas/:id → borrar  *
  @Roles(Rol.RESERVAS)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }

  // OPTIONS /reservas/:id → qué se puede hacer con una reserva
  @Options(':id')
  @Header('Allow', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS')
  opcionesReserva(@Param('id', ParseIntPipe) id: number) {
    return {
      ruta: `/reservas/${id}`,
      metodosPermitidos: ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      ayuda: {
        GET: 'Consulta la reserva',
        PUT: 'Reemplaza todos los datos (vuelve a pendiente)',
        PATCH: 'Cambia solo los campos enviados (ej: estado)',
        DELETE: 'Elimina la reserva',
        HEAD: 'Devuelve X-Reserva-Estado sin cuerpo',
        OPTIONS: 'Muestra esta información',
      },
    };
  }
}
