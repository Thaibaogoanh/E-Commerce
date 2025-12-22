import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Product } from '../../entities/product.entity';
import { Size } from '../../entities/size.entity';
import { ColorOption } from '../../entities/color-option.entity';
import { Stock } from '../../entities/stock.entity';

@Injectable()
export class SkuVariantsService {
  constructor(
    @InjectRepository(SkuVariant)
    private skuVariantRepository: Repository<SkuVariant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(ColorOption)
    private colorOptionRepository: Repository<ColorOption>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async findByProduct(productId: string): Promise<SkuVariant[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.skuVariantRepository.find({
      where: { productId },
      relations: ['size', 'color', 'stock', 'design'],
      order: { SizeCode: 'ASC', ColorCode: 'ASC' },
    });
  }

  async findOne(skuId: string): Promise<SkuVariant> {
    const sku = await this.skuVariantRepository.findOne({
      where: { SkuID: skuId },
      relations: ['product', 'size', 'color', 'stock', 'design'],
    });

    if (!sku) {
      throw new NotFoundException('SKU variant not found');
    }

    return sku;
  }

  async create(skuData: Partial<SkuVariant>): Promise<SkuVariant> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: skuData.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify size exists
    const size = await this.sizeRepository.findOne({
      where: { SizeCode: skuData.SizeCode },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }

    // Verify color exists
    const color = await this.colorOptionRepository.findOne({
      where: { ColorCode: skuData.ColorCode },
    });
    if (!color) {
      throw new NotFoundException('Color option not found');
    }

    // Check if SKU already exists
    const existing = await this.skuVariantRepository.findOne({
      where: {
        productId: skuData.productId,
        SizeCode: skuData.SizeCode,
        ColorCode: skuData.ColorCode,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'SKU variant with this product, size, and color already exists',
      );
    }

    const sku = this.skuVariantRepository.create(skuData);
    const savedSku = await this.skuVariantRepository.save(sku);

    // Create stock entry
    const stock = this.stockRepository.create({
      skuId: savedSku.SkuID,
      qty_on_hand: 0,
      qty_inbound: 0,
      qty_outbound: 0,
      qty_reserved: 0,
    });
    await this.stockRepository.save(stock);

    return this.findOne(savedSku.SkuID);
  }

  async update(
    skuId: string,
    updateData: Partial<SkuVariant>,
  ): Promise<SkuVariant> {
    const sku = await this.findOne(skuId);
    Object.assign(sku, updateData);
    return this.skuVariantRepository.save(sku);
  }

  async remove(skuId: string): Promise<void> {
    const sku = await this.findOne(skuId);

    // Remove associated stock
    const stock = await this.stockRepository.findOne({
      where: { skuId: sku.SkuID },
    });
    if (stock) {
      await this.stockRepository.remove(stock);
    }

    await this.skuVariantRepository.remove(sku);
  }
}
