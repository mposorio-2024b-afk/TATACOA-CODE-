import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Factura } from '../facturas/entities/factura.entity';
import { User } from '../users/entities/user.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Factura)
    private readonly facturasRepository: Repository<Factura>,
  ) {}

  // GET /pagos  o  /pagos?facturaId=1 → con su factura, reserva y quién lo registró
  findAll(facturaId?: number) {
    return this.pagosRepository.find({
      where: facturaId ? { factura: { id: facturaId } } : {},
      relations: { factura: { reserva: true }, registradoPor: true },
      order: { id: 'ASC' },
    });
  }

  // POST /pagos → registra un abono y actualiza el estado de la factura
  async create(dto: CreatePagoDto, usuario: UsuarioToken) {
    const factura = await this.facturasRepository.findOne({
      where: { id: dto.facturaId },
      relations: { pagos: true },
    });
    if (!factura) throw new NotFoundException(`No existe la factura #${dto.facturaId}`);
    if (factura.estado === 'anulada') {
      throw new BadRequestException(`La factura ${factura.numero} está anulada`);
    }
    if (factura.estado === 'pagada') {
      throw new ConflictException(`La factura ${factura.numero} ya está pagada`);
    }

    const pagado = factura.pagos.reduce((suma, p) => suma + p.monto, 0);
    const saldo = factura.total - pagado;
    if (dto.monto > saldo) {
      throw new BadRequestException(
        `El monto ($${dto.monto}) supera el saldo pendiente de ${factura.numero} ($${saldo})`,
      );
    }

    const pago = await this.pagosRepository.save(
      this.pagosRepository.create({
        factura: { id: factura.id } as Factura,
        registradoPor: { id: usuario.sub } as User,
        monto: dto.monto,
        metodo: dto.metodo,
        referencia: dto.referencia,
      }),
    );

    const nuevoSaldo = saldo - dto.monto;
    if (nuevoSaldo === 0) {
      await this.facturasRepository.update(factura.id, { estado: 'pagada' });
    }
    return {
      ...pago,
      factura: { id: factura.id, numero: factura.numero, total: factura.total },
      saldoPendiente: nuevoSaldo,
      estadoFactura: nuevoSaldo === 0 ? 'pagada' : 'pendiente',
    };
  }

  // DELETE /pagos/:id → solo admin; la factura vuelve a pendiente si estaba pagada
  async remove(id: number) {
    const pago = await this.pagosRepository.findOne({ where: { id }, relations: { factura: true } });
    if (!pago) throw new NotFoundException(`No existe el pago #${id}`);
    await this.pagosRepository.remove(pago);
    if (pago.factura.estado === 'pagada') {
      await this.facturasRepository.update(pago.factura.id, { estado: 'pendiente' });
    }
    return { mensaje: `Pago #${id} de $${pago.monto} eliminado. ${pago.factura.numero} queda pendiente` };
  }
}
