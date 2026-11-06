import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from '../reservas/entities/reserva.entity';
import { Factura } from './entities/factura.entity';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Reserva])],
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
