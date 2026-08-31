import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArrivalEntryDto } from './dto/create-arrival-entry.dto';

type Tx = Prisma.TransactionClient;

// Deleting an ArrivalItem that already has StockSale rows against it hits
// Postgres's RESTRICT constraint. When it happens via a straight insert,
// Prisma surfaces a known P2003 error — but here it happens partway
// through an ArrivalEntry's cascading delete, which Postgres reports as
// a 23001 (restrict_violation) that Prisma can't map to a known error
// code, so it comes back as PrismaClientUnknownRequestError instead.
// Check both rather than assume only the "documented" shape occurs.
function isForeignKeyRestriction(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    return true;
  }
  return (
    err instanceof Prisma.PrismaClientUnknownRequestError &&
    err.message.includes('foreign key constraint')
  );
}

@Injectable()
export class ArrivalEntriesService {
  constructor(private prisma: PrismaService) {}

  // "Unique" means unique within date + supplier, across every arrival
  // entry for that supplier on that date — not just within the entry
  // being saved right now. If taken, append -1, -2, ... the way Windows
  // resolves a duplicate filename. Must run inside the same transaction
  // as the inserts so two identical lot numbers in one entry resolve
  // against each other, not just against what's already committed.
  private async resolveLotNo(
    tx: Tx,
    lotNo: string,
    date: Date,
    supplierId: number,
  ): Promise<string> {
    const existing = await tx.arrivalItem.findMany({
      where: { arrivalEntry: { date, supplierId } },
      select: { lotNo: true },
    });
    const taken = new Set(existing.map((e) => e.lotNo));

    if (!taken.has(lotNo)) return lotNo;

    let suffix = 1;
    while (taken.has(`${lotNo}-${suffix}`)) suffix++;
    return `${lotNo}-${suffix}`;
  }

  private async writeItemsAndCharges(
    tx: Tx,
    entryId: number,
    date: Date,
    supplierId: number,
    dto: CreateArrivalEntryDto,
  ) {
    for (const item of dto.items) {
      const lotNo = await this.resolveLotNo(tx, item.lotNo, date, supplierId);
      await tx.arrivalItem.create({
        data: {
          arrivalEntryId: entryId,
          itemName: item.itemName,
          lotNo,
          nug: item.nug,
          isCrateForm: item.isCrateForm ?? false,
          crateType: item.isCrateForm ? item.crateType : null,
          weight: item.weight,
        },
      });
    }

    for (const charge of dto.charges ?? []) {
      await tx.arrivalCharge.create({
        data: {
          arrivalEntryId: entryId,
          chargeType: charge.chargeType,
          amount: charge.amount,
        },
      });
    }
  }

  create(dto: CreateArrivalEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      const date = new Date(dto.date);
      const entry = await tx.arrivalEntry.create({
        data: {
          date,
          arrivalType: dto.arrivalType,
          vehicleNumber: dto.vehicleNumber,
          supplierId: dto.supplierId,
        },
      });

      await this.writeItemsAndCharges(tx, entry.id, date, dto.supplierId, dto);

      return tx.arrivalEntry.findUniqueOrThrow({
        where: { id: entry.id },
        include: { items: true, charges: true, supplier: true },
      });
    });
  }

  async findOne(id: number) {
    const entry = await this.prisma.arrivalEntry.findUnique({
      where: { id },
      include: { items: true, charges: true, supplier: true },
    });
    if (!entry) throw new NotFoundException('Arrival entry not found');
    return entry;
  }

  findAll(fromDate?: string, toDate?: string) {
    return this.prisma.arrivalEntry.findMany({
      where: {
        date: {
          gte: fromDate ? new Date(fromDate) : undefined,
          lte: toDate ? new Date(toDate) : undefined,
        },
      },
      include: { items: { include: { stockSales: true } }, supplier: true },
      orderBy: { date: 'desc' },
    });
  }

  // Editing resaves the whole entry: existing items/charges are replaced,
  // not patched field-by-field. Simpler and correct for a form that
  // always submits its full current state, same as how the page works.
  update(id: number, dto: CreateArrivalEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      const date = new Date(dto.date);
      await tx.arrivalEntry.update({
        where: { id },
        data: {
          date,
          arrivalType: dto.arrivalType,
          vehicleNumber: dto.vehicleNumber,
          supplierId: dto.supplierId,
        },
      });

      try {
        await tx.arrivalItem.deleteMany({ where: { arrivalEntryId: id } });
      } catch (err) {
        if (isForeignKeyRestriction(err)) {
          throw new ConflictException(
            "Can't edit this entry — one or more of its lots already has stock sold against it.",
          );
        }
        throw err;
      }
      await tx.arrivalCharge.deleteMany({ where: { arrivalEntryId: id } });
      await this.writeItemsAndCharges(tx, id, date, dto.supplierId, dto);

      return tx.arrivalEntry.findUniqueOrThrow({
        where: { id },
        include: { items: true, charges: true, supplier: true },
      });
    });
  }

  async remove(id: number) {
    try {
      await this.prisma.arrivalEntry.delete({ where: { id } });
    } catch (err) {
      if (isForeignKeyRestriction(err)) {
        throw new ConflictException(
          "Can't delete this entry — one or more of its lots already has stock sold against it.",
        );
      }
      throw err;
    }
    return { id };
  }
}
