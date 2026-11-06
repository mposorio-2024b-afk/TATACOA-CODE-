import {
  BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UsuarioToken } from '../auth/decorators/usuario-actual.decorator';
import { Rol } from '../auth/rol.enum';
import { User } from '../users/entities/user.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservasService implements OnModuleInit {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  // Al arrancar: si la tabla está vacía, inserta dos reservas de ejemplo
  async onModuleInit() {
    const total = await this.reservasRepository.count();
    if (total === 0) {
      await this.reservasRepository.save([
        { visitante: 'Camila Rojas', tour: 'Astronómico', fecha: '2026-11-07', personas: 4, estado: 'confirmada' },
        { visitante: 'Andrés Perdomo', tour: 'Senderismo Cuzco', fecha: '2026-11-08', personas: 2, estado: 'pendiente' },
      ]);
    }
  }

  // Un cliente solo ve SUS reservas; los empleados ven todas
  private filtro(usuario: UsuarioToken, estado?: string): FindOptionsWhere<Reserva> {
    const where: FindOptionsWhere<Reserva> = {};
    if (estado) where.estado = estado;
    if (usuario.rol === Rol.CLIENTE) where.cliente = { id: usuario.sub };
    return where;
  }

  // GET /reservas  o  GET /reservas?estado=pendiente  → SELECT (con el cliente)
  findAll(usuario: UsuarioToken, estado?: string): Promise<Reserva[]> {
    return this.reservasRepository.find({
      where: this.filtro(usuario, estado),
      relations: { cliente: true },
      order: { id: 'ASC' },
    });
  }

  // HEAD /reservas → SELECT COUNT(*)
  contar(usuario: UsuarioToken, estado?: string): Promise<number> {
    return this.reservasRepository.count({ where: this.filtro(usuario, estado) });
  }

  // GET /reservas/:id  → un cliente no puede ver reservas de otros
  async findOne(id: number, usuario?: UsuarioToken): Promise<Reserva> {
    const where: FindOptionsWhere<Reserva> = { id };
    if (usuario?.rol === Rol.CLIENTE) where.cliente = { id: usuario.sub };
    const reserva = await this.reservasRepository.findOne({ where, relations: { cliente: true } });
    if (!reserva) throw new NotFoundException(`No existe la reserva #${id}`);
    return reserva;
  }

  // POST /reservas → INSERT (siempre queda pendiente).
  // Si la pide un cliente, se enlaza a su usuario y se usa su nombre.
  create(dto: CreateReservaDto, usuario: UsuarioToken): Promise<Reserva> {
    const esCliente = usuario.rol === Rol.CLIENTE;
    const nueva = this.reservasRepository.create({
      ...dto,
      visitante: esCliente ? usuario.nombre : dto.visitante,
      cliente: esCliente ? ({ id: usuario.sub } as User) : null,
      estado: 'pendiente',
    });
    return this.reservasRepository.save(nueva);
  }

  // PUT /reservas/:id → reemplaza TODOS los datos (vuelve a pendiente)
  async replace(id: number, dto: CreateReservaDto): Promise<Reserva> {
    const actual = await this.findOne(id);
    Object.assign(actual, dto, { estado: 'pendiente' });
    return this.reservasRepository.save(actual);
  }

  // PATCH /reservas/:id → cambia SOLO los campos enviados
  async update(id: number, dto: UpdateReservaDto): Promise<Reserva> {
    const actual = await this.findOne(id);
    const reserva = this.reservasRepository.merge(actual, dto);
    return this.reservasRepository.save(reserva);
  }

  // PATCH /reservas/:id/cancelar → el cliente cancela su reserva pendiente
  async cancelar(id: number, usuario: UsuarioToken): Promise<Reserva> {
    const reserva = await this.findOne(id, usuario);
    if (reserva.estado !== 'pendiente') {
      throw new BadRequestException(
        `Solo puedes cancelar reservas pendientes. La reserva #${id} está ${reserva.estado}`,
      );
    }
    reserva.estado = 'cancelada';
    return this.reservasRepository.save(reserva);
  }

  // DELETE /reservas/:id → DELETE
  async remove(id: number) {
    const reserva = await this.findOne(id);
    try {
      await this.reservasRepository.remove(reserva);
    } catch {
      // La base de datos no deja borrarla porque la tabla facturas la referencia
      throw new ConflictException(`La reserva #${id} ya tiene factura y no se puede borrar`);
    }
    return { mensaje: `Reserva #${id} de ${reserva.visitante} eliminada` };
  }
}
