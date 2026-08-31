import { Body, Controller, Get, Put } from '@nestjs/common';
import { CommissionSettingsService } from './commission-settings.service';
import { UpdateCommissionSettingsDto } from './dto/update-commission-settings.dto';

@Controller('commission-settings')
export class CommissionSettingsController {
  constructor(private commissionSettingsService: CommissionSettingsService) {}

  @Get()
  get() {
    return this.commissionSettingsService.get();
  }

  @Put()
  update(@Body() dto: UpdateCommissionSettingsDto) {
    return this.commissionSettingsService.update(dto);
  }
}
