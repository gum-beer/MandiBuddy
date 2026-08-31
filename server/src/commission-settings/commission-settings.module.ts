import { Module } from '@nestjs/common';
import { CommissionSettingsService } from './commission-settings.service';
import { CommissionSettingsController } from './commission-settings.controller';

@Module({
  controllers: [CommissionSettingsController],
  providers: [CommissionSettingsService],
  exports: [CommissionSettingsService],
})
export class CommissionSettingsModule {}
