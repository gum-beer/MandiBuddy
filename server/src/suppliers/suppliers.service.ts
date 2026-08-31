import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { nameToHindi } from '../common/transliterate';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // Runs as a transaction: the row is created first (code left null) so we
  // have a real DB id to derive the sequential "SUP-00001" code from, then
  // immediately updated with that code. Postgres allows multiple NULLs
  // under a unique index, so this never collides between concurrent-ish
  // inserts the way a shared placeholder string would.
  create(dto: CreateSupplierDto, photoFilename?: string) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.supplier.create({
        data: {
          name: dto.name,
          nameHindi: nameToHindi(dto.name),
          photoPath: photoFilename ?? null,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          mobile1: dto.mobile1,
          guarantorName: dto.guarantorName,
          guarantorPhone: dto.guarantorPhone,
        },
      });

      const code = `SUP-${String(created.id).padStart(5, '0')}`;
      return tx.supplier.update({
        where: { id: created.id },
        data: { code },
      });
    });
  }

  findAll() {
    return this.prisma.supplier.findMany({ orderBy: { id: 'asc' } });
  }
}
