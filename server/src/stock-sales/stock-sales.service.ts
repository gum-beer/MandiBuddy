import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockSaleDto } from './dto/create-stock-sale.dto';

@Injectable()
export class StockSalesService {
  constructor(private prisma: PrismaService) {}

  // Only suppliers who actually delivered on this date — Stock Sale's
  // date is fixed (not a range), per the spec: pick the date first, then
  // the supplier dropdown narrows to who's real for that day.
  async suppliersOnDate(date: string) {
    const entries = await this.prisma.arrivalEntry.findMany({
      where: { date: new Date(date) },
      include: { supplier: true },
      distinct: ['supplierId'],
    });
    return entries.map((e) => e.supplier);
  }

  // The item/lot dropdowns aren't backed by an Items master — they're
  // literally that day's arrival lots for the chosen supplier, with a
  // remaining balance computed from nug minus everything already sold
  // against it (not a stored, mutated counter — see note on StockSale).
  async lotsFor(date: string, supplierId: number) {
    const entries = await this.prisma.arrivalEntry.findMany({
      where: { date: new Date(date), supplierId },
      include: { items: { include: { stockSales: true } } },
    });

    return entries.flatMap((entry) =>
      entry.items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        lotNo: item.lotNo,
        nug: item.nug,
        weight: item.weight,
        remaining: item.nug - item.stockSales.reduce((sum, s) => sum + s.nug, 0),
      })),
    );
  }

  // Remaining balance is re-derived inside the transaction (not trusted
  // from what the client last fetched) so two sales against the same lot
  // can't both succeed and oversell it.
  create(dto: CreateStockSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const arrivalItem = await tx.arrivalItem.findUnique({
        where: { id: dto.arrivalItemId },
        include: { stockSales: true },
      });
      if (!arrivalItem) throw new NotFoundException('Arrival lot not found');

      const sold = arrivalItem.stockSales.reduce((sum, s) => sum + s.nug, 0);
      const remaining = arrivalItem.nug - sold;
      if (dto.nug > remaining) {
        throw new BadRequestException(`Only ${remaining} nug remaining in this lot`);
      }

      if (dto.unitType === 'Weight' && (dto.weight === undefined || dto.weight === null)) {
        throw new BadRequestException('Weight is required when selling by weight');
      }

      const quantity = dto.unitType === 'Nug' ? dto.nug : (dto.weight as number);
      const basicAmount = quantity * dto.customerRate;

      // Commission/MarketFees/RDF are percentages of the customer-facing
      // Basic Amount, summed then applied once (not compounded). Laga is a
      // flat rate per nug, not a percentage. Bardana isn't included — its
      // mechanism is still undefined. These are snapshotted onto the row
      // itself, not read live from settings on every future display, so a
      // later change to the defaults never rewrites a past sale.
      const settings = await tx.commissionSettings.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1 },
      });
      const commissionAmount = (basicAmount * settings.commissionPct) / 100;
      const marketFeesAmount = (basicAmount * settings.marketFeesPct) / 100;
      const rdfAmount = (basicAmount * settings.rdfPct) / 100;
      const lagaAmount = dto.nug * settings.lagaPerNug;
      const netAmount = basicAmount + commissionAmount + marketFeesAmount + rdfAmount + lagaAmount;

      return tx.stockSale.create({
        data: {
          date: new Date(dto.date),
          arrivalItemId: dto.arrivalItemId,
          customerName: dto.customerName?.trim() || 'Cash',
          nug: dto.nug,
          weight: dto.weight,
          unitType: dto.unitType,
          customerRate: dto.customerRate,
          supplierRate: dto.supplierRate,
          basicAmount,
          commissionAmount,
          marketFeesAmount,
          rdfAmount,
          lagaAmount,
          netAmount,
        },
        include: {
          arrivalItem: { include: { arrivalEntry: { include: { supplier: true } } } },
        },
      });
    });
  }

  findAll(fromDate?: string, toDate?: string) {
    return this.prisma.stockSale.findMany({
      where: {
        date: {
          gte: fromDate ? new Date(fromDate) : undefined,
          lte: toDate ? new Date(toDate) : undefined,
        },
      },
      include: {
        arrivalItem: { include: { arrivalEntry: { include: { supplier: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async remove(id: number) {
    await this.prisma.stockSale.delete({ where: { id } });
    return { id };
  }
}
