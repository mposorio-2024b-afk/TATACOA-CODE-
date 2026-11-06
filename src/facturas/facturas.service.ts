import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Reserva } from '../reservas/entities/reserva.entity';
import { User } from '../users/entities/user.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entities/factura.entity';

// Precio por persona de cada tour (pesos colombianos)
export const TARIFAS: Record<string, number> = {
  'Astronómico': 80000,
  'Senderismo Cuzco': 50000,
  'Los Hoyos': 45000,
  'Fotografía nocturna': 90000,
};
const IVA = 0.19;

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturasRepository: Repository<Factura>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  // GET /facturas → con su reserva, quién la emitió y sus pagos (JOIN)
  async findAll(estado?: string) {
    const facturas = await this.facturasRepository.find({
      where: estado ? { estado } : {},
      relations: { reserva: true, emitidaPor: true, pagos: true },
      order: { id: 'ASC' },
    });
    return facturas.map((f) => this.conSaldo(f));
  }

  // GET /facturas/mias → las facturas de las reservas del cliente que inició sesión
  async misFacturas(clienteId: number) {
    const facturas = await this.facturasRepository.find({
      where: { reserva: { cliente: { id: clienteId } } },
      relations: { reserva: true, emitidaPor: true, pagos: true },
      order: { id: 'ASC' },
    });
    return facturas.map((f) => this.conSaldo(f));
  }

  async findOne(id: number) {
    const factura = await this.facturasRepository.findOne({
      where: { id },
      relations: { reserva: true, emitidaPor: true, pagos: { registradoPor: true } },
    });
    if (!factura) throw new NotFoundException(`No existe la factura #${id}`);
    return this.conSaldo(factura);
  }

  // POST /facturas → genera la factura de una reserva confirmada
  async create(dto: CreateFacturaDto, usuario: UsuarioToken) {
    const reserva = await this.reservasRepository.findOne({
      where: { id: dto.reservaId },
      relations: { factura: true },
    });
    if (!reserva) throw new NotFoundException(`No existe la reserva #${dto.reservaId}`);
    if (reserva.estado !== 'confirmada') {
      throw new BadRequestException(
        `Solo se facturan reservas confirmadas. La reserva #${reserva.id} está ${reserva.estado}`,
      );
    }
    if (reserva.factura) {
      throw new ConflictException(
        `La reserva #${reserva.id} ya tiene la factura ${reserva.factura.numero}`,
      );
    }

    const valorUnitario = TARIFAS[reserva.tour] ?? 0;
    const subtotal = valorUnitario * reserva.personas;
    const iva = Math.round(subtotal * IVA);

    const factura = await this.facturasRepository.save(
      this.facturasRepository.create({
        reserva,
        emitidaPor: { id: usuario.sub } as User,
        valorUnitario,
        personas: reserva.personas,
        subtotal,
        iva,
        total: subtotal + iva,
        estado: 'pendiente',
      }),
    );
    factura.numero = `FAC-${String(factura.id).padStart(5, '0')}`;
    await this.facturasRepository.save(factura);
    return this.findOne(factura.id);
  }

  // PATCH /facturas/:id/anular
  async anular(id: number) {
    const factura = await this.findOne(id);
    if (factura.pagos.length > 0) {
      throw new ConflictException(
        `La factura ${factura.numero} ya tiene pagos registrados y no se puede anular`,
      );
    }
    await this.facturasRepository.update(id, { estado: 'anulada' });
    return this.findOne(id);
  }

  // Agrega a la respuesta cuánto se ha pagado y cuánto falta
  private conSaldo(factura: Factura) {
    const pagado = (factura.pagos ?? []).reduce((suma, p) => suma + p.monto, 0);
    return { ...factura, pagado, saldo: factura.total - pagado };
  }
}
