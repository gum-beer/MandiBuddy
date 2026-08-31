import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockSaleDto {
  @IsDateString()
  date: string;

  @IsInt()
  arrivalItemId: number;

  // Free text, defaults to "Cash" — no Customer master exists yet.
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsInt()
  @Min(1)
  nug: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsIn(['Nug', 'Weight'])
  unitType: string;

  @IsNumber()
  customerRate: number;

  @IsNumber()
  supplierRate: number;
}
