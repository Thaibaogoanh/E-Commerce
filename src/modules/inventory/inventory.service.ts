import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../../entities/stock.entity';
import {
  StockMovement,
  StockMovementType,
} from '../../entities/stock-movement.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(SkuVariant)
    private skuVariantRepository: Repository<SkuVariant>,
  ) {}

  async listAll() {
    return this.stockRepository.find({
      relations: ['skuVariant', 'skuVariant.product'],
    });
  }

  async getBySku(skuId: string) {
    const stock = await this.stockRepository.findOne({
      where: { skuId },
      relations: ['skuVariant', 'skuVariant.product', 'movements'],
    });
    if (!stock) {
      throw new NotFoundException('Stock not found for SKU');
    }
    return stock;
  }

  private async ensureSku(skuId: string) {
    const sku = await this.skuVariantRepository.findOne({
      where: { SkuID: skuId },
    });
    if (!sku) {
      throw new NotFoundException('SKU not found');
    }
    return sku;
  }

  private async ensureStock(skuId: string) {
    let stock = await this.stockRepository.findOne({ where: { skuId } });
    if (!stock) {
      await this.ensureSku(skuId);
      stock = this.stockRepository.create({ skuId });
      stock = await this.stockRepository.save(stock);
    }
    return stock;
  }

  private async recordMovement(
    stockId: string,
    type: StockMovementType,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    const movement = this.stockMovementRepository.create({
      stockId,
      type,
      quantity,
      note,
      referenceType,
      referenceId,
    });
    await this.stockMovementRepository.save(movement);
  }

  async inbound(
    skuId: string,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }
    const stock = await this.ensureStock(skuId);
    stock.qty_inbound += quantity;
    stock.qty_on_hand += quantity;
    await this.stockRepository.save(stock);
    await this.recordMovement(
      stock.StockID,
      StockMovementType.INBOUND,
      quantity,
      note,
      referenceType,
      referenceId,
    );
    return this.getBySku(skuId);
  }

  async outbound(
    skuId: string,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }
    const stock = await this.ensureStock(skuId);
    if (stock.qty_on_hand < quantity) {
      throw new BadRequestException('Not enough stock on hand');
    }
    stock.qty_outbound += quantity;
    stock.qty_on_hand -= quantity;
    await this.stockRepository.save(stock);
    await this.recordMovement(
      stock.StockID,
      StockMovementType.OUTBOUND,
      quantity,
      note,
      referenceType,
      referenceId,
    );
    return this.getBySku(skuId);
  }

  async reserve(
    skuId: string,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }
    const stock = await this.ensureStock(skuId);
    if (stock.qty_on_hand < quantity) {
      throw new BadRequestException('Not enough stock to reserve');
    }
    stock.qty_on_hand -= quantity;
    stock.qty_reserved += quantity;
    await this.stockRepository.save(stock);
    await this.recordMovement(
      stock.StockID,
      StockMovementType.RESERVE,
      quantity,
      note,
      referenceType,
      referenceId,
    );
    return this.getBySku(skuId);
  }

  async release(
    skuId: string,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be > 0');
    }
    const stock = await this.ensureStock(skuId);
    if (stock.qty_reserved < quantity) {
      throw new BadRequestException('Not enough reserved stock to release');
    }
    stock.qty_reserved -= quantity;
    stock.qty_on_hand += quantity;
    await this.stockRepository.save(stock);
    await this.recordMovement(
      stock.StockID,
      StockMovementType.RELEASE,
      quantity,
      note,
      referenceType,
      referenceId,
    );
    return this.getBySku(skuId);
  }

  async movements(skuId: string, type?: StockMovementType) {
    const stock = await this.ensureStock(skuId);
    return this.stockMovementRepository.find({
      where: {
        stockId: stock.StockID,
        ...(type ? { type } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
