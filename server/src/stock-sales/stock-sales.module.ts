import { Module } from '@nestjs/common';
import { StockSalesService } from './stock-sales.service';
import { StockSalesController } from './stock-sales.controller';

@Module({
  controllers: [StockSalesController],
  providers: [StockSalesService],
})
export class StockSalesModule {}
