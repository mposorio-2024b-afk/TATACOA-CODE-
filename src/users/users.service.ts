import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Rol } from '../auth/rol.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Al arrancar: si no hay usuarios, crea uno por cada rol para poder entrar
  async onModuleInit() {
    if ((await this.usersRepository.count()) > 0) return;
    const iniciales = [
      { nombre: 'Administrador', correo: 'admin@tatacoa.co', clave: 'Admin123*', rol: Rol.ADMIN },
      { nombre: 'Agente de Reservas', correo: 'reservas@tatacoa.co', clave: 'Reservas123*', rol: Rol.RESERVAS },
      { nombre: 'Agente de Facturación', correo: 'facturacion@tatacoa.co', clave: 'Factura123*', rol: Rol.FACTURACION },
      { nombre: 'Agente de Pagos', correo: 'pagos@tatacoa.co', clave: 'Pagos123*', rol: Rol.PAGOS },
    ];
    for (const u of iniciales) {
      await this.usersRepository.save(
        this.usersRepository.create({ ...u, clave: await bcrypt.hash(u.clave, 10) }),
      );
    }
  }

  // POST /users → cifra la clave y guarda
  async create(dto: CreateUserDto) {
    await this.verificarCorreoLibre(dto.correo);
    const usuario = this.usersRepository.create({
      ...dto,
      clave: await bcrypt.hash(dto.clave, 10),
    });
    const guardado = await this.usersRepository.save(usuario);
    return this.findOne(guardado.id); // se vuelve a leer para no devolver la clave
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<User> {
    const usuario = await this.usersRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`El usuario con id ${id} no existe`);
    }
    return usuario;
  }

  // Para el login: es el único lugar donde se lee la clave cifrada
  buscarConClave(correo: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.clave')
      .where('usuario.correo = :correo', { correo })
      .getOne();
  }

  async update(id: number, dto: UpdateUserDto) {
    const actual = await this.findOne(id);
    if (dto.correo && dto.correo !== actual.correo) {
      await this.verificarCorreoLibre(dto.correo);
    }
    if (dto.clave) {
      dto.clave = await bcrypt.hash(dto.clave, 10);
    }
    await this.usersRepository.save(this.usersRepository.merge(actual, dto));
    return this.findOne(id);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    try {
      await this.usersRepository.remove(usuario);
    } catch {
      throw new ConflictException(
        `No se puede borrar a ${usuario.nombre} porque tiene reservas, facturas o pagos registrados. Desactívalo con PATCH {"activo": false}`,
      );
    }
    return { mensaje: `Usuario ${usuario.nombre} eliminado` };
  }

  private async verificarCorreoLibre(correo: string) {
    if (await this.usersRepository.existsBy({ correo })) {
      throw new ConflictException(`El correo ${correo} ya está registrado`);
    }
  }
}
