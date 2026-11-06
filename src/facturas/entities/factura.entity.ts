import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { User } from '../../users/entities/user.entity';
import { Pago } from '../../pagos/entities/pago.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  // FAC-00001, FAC-00002...
  @Column({ length: 20, nullable: true, unique: true })
  numero: string;

  // RELACIÓN 1 a 1: cada reserva tiene como máximo UNA factura
  @OneToOne(() => Reserva, (reserva) => reserva.factura)
  @JoinColumn({ name: 'reservaId' })
  reserva: Reserva;

  // RELACIÓN muchos a 1: qué usuario (rol facturación) la emitió
  @ManyToOne(() => User, (usuario) => usuario.facturasEmitidas)
  @JoinColumn({ name: 'emitidaPorId' })
  emitidaPor: User;

  // RELACIÓN 1 a muchos: una factura puede pagarse en varios abonos
  @OneToMany(() => Pago, (pago) => pago.factura)
  pagos: Pago[];

  @Column()
  valorUnitario: number;

  @Column()
  personas: number;

  @Column()
  subtotal: number;

  @Column()
  iva: number;

  @Column()
  total: number;

  // pendiente | pagada | anulada
  @Column({ length: 20, default: 'pendiente' })
  estado: string;

  @CreateDateColumn()
  emitidaEn: Date;
}
