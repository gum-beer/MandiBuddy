import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ArrivalItemInputDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  lotNo: string;

  @IsInt()
  @Min(0)
  nug: number;

  @IsOptional()
  @IsBoolean()
  isCrateForm?: boolean;

  @IsOptional()
  @IsString()
  crateType?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

// Freight | Labour today — a static list per the spec. Add to this union
// (and the frontend dropdown) if the list grows; it isn't a master table.
export class ArrivalChargeInputDto {
  @IsIn(['Freight', 'Labour'])
  chargeType: string;

  @IsNumber()
  amount: number;
}

export class CreateArrivalEntryDto {
  @IsDateString()
  date: string;

  @IsIn(['Party Stock', 'Self Purchase'])
  arrivalType: string;

  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @IsInt()
  supplierId: number;

  @ValidateNested({ each: true })
  @Type(() => ArrivalItemInputDto)
  @ArrayMinSize(1)
  items: ArrivalItemInputDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ArrivalChargeInputDto)
  charges?: ArrivalChargeInputDto[];
}
