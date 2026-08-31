import { IsNumber, Min } from 'class-validator';

export class UpdateCommissionSettingsDto {
  @IsNumber()
  @Min(0)
  commissionPct: number;

  @IsNumber()
  @Min(0)
  marketFeesPct: number;

  @IsNumber()
  @Min(0)
  rdfPct: number;

  @IsNumber()
  @Min(0)
  lagaPerNug: number;
}
