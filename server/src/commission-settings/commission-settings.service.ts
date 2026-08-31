import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCommissionSettingsDto } from './dto/update-commission-settings.dto';

const SINGLETON_ID = 1;

// One global row (id is always 1 — see schema comment) of default rates for
// Stock Sale. Bardana is deliberately left out of both the DTO and the
// upsert data below: its mechanism isn't defined yet, so there's nothing
// correct to let a client set.
@Injectable()
export class CommissionSettingsService {
  constructor(private prisma: PrismaService) {}

  get() {
    return this.prisma.commissionSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  update(dto: UpdateCommissionSettingsDto) {
    return this.prisma.commissionSettings.upsert({
      where: { id: SINGLETON_ID },
      update: dto,
      create: { id: SINGLETON_ID, ...dto },
    });
  }
}
