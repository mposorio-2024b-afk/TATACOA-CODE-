import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  visitante: string;

  @Column({ length: 40 })
  tour: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column()
  personas: number;

  @Column({ length: 20, default: 'pendiente' })
  estado: string;

  // RELACIÓN muchos a 1: el cliente registrado que pidió la reserva.
  // Es opcional: las reservas tomadas en taquilla por un empleado no tienen cliente.
  @ManyToOne(() => User, (usuario) => usuario.reservas, { nullable: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: User | null;

  // RELACIÓN 1 a 1 (lado inverso): la factura de esta reserva, si existe
  @OneToOne(() => Factura, (factura) => factura.reserva)
  factura: Factura;

  @CreateDateColumn()
  creadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}
