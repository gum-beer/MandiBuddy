import { Module } from '@nestjs/common';
import { ArrivalEntriesService } from './arrival-entries.service';
import { ArrivalEntriesController } from './arrival-entries.controller';

@Module({
  controllers: [ArrivalEntriesController],
  providers: [ArrivalEntriesService],
  exports: [ArrivalEntriesService],
})
export class ArrivalEntriesModule {}
