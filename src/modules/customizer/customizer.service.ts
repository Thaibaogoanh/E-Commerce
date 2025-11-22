import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedDesign } from '../../entities/saved-design.entity';
import { Product } from '../../entities/product.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Design } from '../../entities/design.entity';

@Injectable()
export class CustomizerService {
  constructor(
    @InjectRepository(SavedDesign)
    private savedDesignRepository: Repository<SavedDesign>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(SkuVariant)
    private skuVariantRepository: Repository<SkuVariant>,
    @InjectRepository(Design)
    private designRepository: Repository<Design>,
  ) {}

  async saveDesign(
    userId: string,
    designData: {
      productId: string;
      name: string;
      canvasData: any;
      colorCode: string;
      sizeCode: string;
      quantity: number;
      designId?: string;
    },
  ): Promise<SavedDesign> {
    const product = await this.productRepository.findOne({
      where: { id: designData.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate price
    const price = await this.calculatePrice(designData);

    const savedDesign = this.savedDesignRepository.create({
      ...designData,
      userId,
      calculatedPrice: price,
    });

    return this.savedDesignRepository.save(savedDesign);
  }

  async getSavedDesigns(userId: string): Promise<SavedDesign[]> {
    return this.savedDesignRepository.find({
      where: { userId },
      relations: ['product', 'design'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getSavedDesign(
    userId: string,
    designId: string,
  ): Promise<SavedDesign> {
    const design = await this.savedDesignRepository.findOne({
      where: { id: designId, userId },
      relations: ['product', 'design'],
    });

    if (!design) {
      throw new NotFoundException('Saved design not found');
    }

    return design;
  }

  async deleteSavedDesign(
    userId: string,
    designId: string,
  ): Promise<void> {
    const design = await this.getSavedDesign(userId, designId);
    await this.savedDesignRepository.remove(design);
  }

  async calculatePrice(designData: {
    productId: string;
    colorCode: string;
    sizeCode: string;
    quantity: number;
    canvasData: any;
    designId?: string;
  }): Promise<number> {
    // Get SKU variant price
    const skuVariant = await this.skuVariantRepository.findOne({
      where: {
        productId: designData.productId,
        ColorCode: designData.colorCode,
        SizeCode: designData.sizeCode,
      },
    });

    if (!skuVariant) {
      throw new NotFoundException('SKU variant not found');
    }

    let basePrice = skuVariant.price;

    // Add design prices if any designs are used
    if (designData.canvasData?.elements) {
      const designElements = designData.canvasData.elements.filter(
        (el: any) => el.type === 'design',
      );

      for (const element of designElements) {
        if (element.designId) {
          const design = await this.designRepository.findOne({
            where: { DESIGN_ID: element.designId },
          });
          if (design) {
            // Design price logic (could be based on license type)
            basePrice += 0; // Add design pricing logic here
          }
        }
      }
    }

    // Add printing cost (could be calculated based on print area, quantity, etc.)
    const printingCost = 50000; // Base printing cost per item

    return (basePrice + printingCost) * designData.quantity;
  }
}

