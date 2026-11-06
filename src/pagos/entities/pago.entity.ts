import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { User } from '../../users/entities/user.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  // RELACIÓN muchos a 1: varios pagos (abonos) para una misma factura
  @ManyToOne(() => Factura, (factura) => factura.pagos, { nullable: false })
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  // RELACIÓN muchos a 1: qué usuario (rol pagos) registró el pago
  @ManyToOne(() => User, (usuario) => usuario.pagosRegistrados)
  @JoinColumn({ name: 'registradoPorId' })
  registradoPor: User;

  @Column()
  monto: number;

  // efectivo | tarjeta | transferencia | nequi
  @Column({ length: 20 })
  metodo: string;

  @Column({ length: 60, nullable: true })
  referencia: string;

  @CreateDateColumn()
  pagadoEn: Date;
}
