import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ArrivalEntriesModule } from './arrival-entries/arrival-entries.module';
import { StockSalesModule } from './stock-sales/stock-sales.module';
import { CommissionSettingsModule } from './commission-settings/commission-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    SuppliersModule,
    ArrivalEntriesModule,
    StockSalesModule,
    CommissionSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
