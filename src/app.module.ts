import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReservasModule } from './reservas/reservas.module';
import { FacturasModule } from './facturas/facturas.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'tatacoa',
      password: 'tatacoa123',
      database: 'tatacoa',
      autoLoadEntities: true,
      synchronize: true,
      logging: ['query', 'error'],
    }),
    AuthModule,
    UsersModule,
    ReservasModule,
    FacturasModule,
    PagosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
