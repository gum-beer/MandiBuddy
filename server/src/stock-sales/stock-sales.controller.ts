import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { StockSalesService } from './stock-sales.service';
import { CreateStockSaleDto } from './dto/create-stock-sale.dto';

@Controller('stock-sales')
export class StockSalesController {
  constructor(private stockSalesService: StockSalesService) {}

  @Get('suppliers-on-date')
  suppliersOnDate(@Query('date') date: string) {
    return this.stockSalesService.suppliersOnDate(date);
  }

  @Get('lots')
  lotsFor(@Query('date') date: string, @Query('supplierId', ParseIntPipe) supplierId: number) {
    return this.stockSalesService.lotsFor(date, supplierId);
  }

  @Post()
  create(@Body() dto: CreateStockSaleDto) {
    return this.stockSalesService.create(dto);
  }

  @Get()
  findAll(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.stockSalesService.findAll(fromDate, toDate);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockSalesService.remove(id);
  }
}
