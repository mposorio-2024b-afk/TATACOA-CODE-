import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Pago } from './entities/pago.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Factura])],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
