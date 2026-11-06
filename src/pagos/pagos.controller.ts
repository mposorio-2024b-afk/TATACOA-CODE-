import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../auth/rol.enum';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // Ver pagos: pagos y facturación
  @Roles(Rol.PAGOS, Rol.FACTURACION)
  @Get()
  findAll(@Query('facturaId') facturaId?: string) {
    return this.pagosService.findAll(facturaId ? Number(facturaId) : undefined);
  }

  // Registrar pago: solo el rol pagos
  @Roles(Rol.PAGOS)
  @Post()
  create(@Body() dto: CreatePagoDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.pagosService.create(dto, usuario);
  }

  // Borrar un pago: solo admin (Roles vacío de otros = solo admin)
  @Roles(Rol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.remove(id);
  }
}
