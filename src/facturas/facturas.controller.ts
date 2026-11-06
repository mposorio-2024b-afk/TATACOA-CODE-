import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../auth/rol.enum';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { FacturasService } from './facturas.service';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  // Ver facturas: facturación y pagos (pagos necesita saber qué cobrar)
  @Roles(Rol.FACTURACION, Rol.PAGOS)
  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.facturasService.findAll(estado);
  }

  // Ver MIS facturas: el cliente (va antes de ':id' para que no la confunda con un id)
  @Roles(Rol.CLIENTE)
  @Get('mias')
  misFacturas(@UsuarioActual() usuario: UsuarioToken) {
    return this.facturasService.misFacturas(usuario.sub);
  }

  @Roles(Rol.FACTURACION, Rol.PAGOS)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  // Emitir factura: solo facturación
  @Roles(Rol.FACTURACION)
  @Post()
  create(@Body() dto: CreateFacturaDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.facturasService.create(dto, usuario);
  }

  // Anular factura: solo facturación
  @Roles(Rol.FACTURACION)
  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.anular(id);
  }
}
