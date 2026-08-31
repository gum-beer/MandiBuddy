import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArrivalEntriesService } from './arrival-entries.service';
import { CreateArrivalEntryDto } from './dto/create-arrival-entry.dto';

@Controller('arrival-entries')
export class ArrivalEntriesController {
  constructor(private arrivalEntriesService: ArrivalEntriesService) {}

  @Post()
  create(@Body() dto: CreateArrivalEntryDto) {
    return this.arrivalEntriesService.create(dto);
  }

  @Get()
  findAll(@Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    return this.arrivalEntriesService.findAll(fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.arrivalEntriesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateArrivalEntryDto) {
    return this.arrivalEntriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.arrivalEntriesService.remove(id);
  }
}
