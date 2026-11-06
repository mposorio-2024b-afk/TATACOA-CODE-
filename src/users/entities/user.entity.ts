import {
  Column, CreateDateColumn, Entity, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { Pago } from '../../pagos/entities/pago.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  nombre: string;

  @Column({ unique: true })
  correo: string;

  // La clave se guarda CIFRADA (bcrypt) y nunca se envía en las respuestas
  @Column({ select: false })
  clave: string;

  // admin | reservas | facturacion | pagos | cliente
  @Column({ length: 20 })
  rol: string;

  @Column({ default: true })
  activo: boolean;

  // RELACIÓN 1 a muchos: las reservas que pidió este usuario (rol cliente)
  @OneToMany(() => Reserva, (reserva) => reserva.cliente)
  reservas: Reserva[];

  // Relaciones: qué facturas emitió y qué pagos registró este usuario
  @OneToMany(() => Factura, (factura) => factura.emitidaPor)
  facturasEmitidas: Factura[];

  @OneToMany(() => Pago, (pago) => pago.registradoPor)
  pagosRegistrados: Pago[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
