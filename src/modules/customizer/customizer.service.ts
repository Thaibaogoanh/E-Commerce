import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedDesign } from '../../entities/saved-design.entity';
import { Product } from '../../entities/product.entity';
import { SkuVariant } from '../../entities/sku-variant.entity';
import { Design } from '../../entities/design.entity';
import {
  SaveDesignDto,
  CalculatePriceDto,
  CanvasElementDto,
} from '../../dto/customizer.dto';

@Injectable()
export class CustomizerService {
  private readonly logger = new Logger(CustomizerService.name);

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
    designData: SaveDesignDto,
  ): Promise<SavedDesign> {
    try {
      // Validate product exists
      const product = await this.productRepository.findOne({
        where: { id: designData.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${designData.productId} not found`,
        );
      }

      // Validate SKU variant exists
      const skuVariant = await this.skuVariantRepository.findOne({
        where: {
          productId: designData.productId,
          ColorCode: designData.colorCode,
          SizeCode: designData.sizeCode,
        },
      });
      if (!skuVariant) {
        throw new NotFoundException(
          `SKU variant not found for product ${designData.productId} with color ${designData.colorCode} and size ${designData.sizeCode}`,
        );
      }

      // Validate designId if provided
      if (designData.designId) {
        const design = await this.designRepository.findOne({
          where: { DESIGN_ID: designData.designId },
        });
        if (!design) {
          throw new NotFoundException(
            `Design with ID ${designData.designId} not found`,
          );
        }
      }

      // Validate canvasData structure
      if (
        !designData.canvasData ||
        !Array.isArray(designData.canvasData.elements)
      ) {
        throw new BadRequestException(
          'Invalid canvasData structure. Elements array is required.',
        );
      }

      // Calculate price
      const priceData = await this.calculatePrice(designData);

      // Create saved design
      const savedDesign = this.savedDesignRepository.create({
        productId: designData.productId,
        name: designData.name,
        canvasData: designData.canvasData,
        colorCode: designData.colorCode,
        sizeCode: designData.sizeCode,
        quantity: designData.quantity,
        designId: designData.designId,
        userId,
        calculatedPrice: priceData.totalPrice,
      });

      const saved = await this.savedDesignRepository.save(savedDesign);
      this.logger.log(`Saved design created: ${saved.id} for user ${userId}`);
      return saved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error saving design for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to save design. Please try again.',
      );
    }
  }

  async getSavedDesigns(userId: string): Promise<SavedDesign[]> {
    try {
      return await this.savedDesignRepository.find({
        where: { userId },
        relations: ['product', 'design'],
        order: { updatedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching saved designs for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to fetch saved designs. Please try again.',
      );
    }
  }

  async getSavedDesign(userId: string, designId: string): Promise<SavedDesign> {
    try {
      const design = await this.savedDesignRepository.findOne({
        where: { id: designId, userId },
        relations: ['product', 'design'],
      });

      if (!design) {
        throw new NotFoundException(
          `Saved design with ID ${designId} not found for user ${userId}`,
        );
      }

      return design;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching saved design ${designId} for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to fetch saved design. Please try again.',
      );
    }
  }

  async deleteSavedDesign(userId: string, designId: string): Promise<void> {
    try {
      const design = await this.getSavedDesign(userId, designId);
      await this.savedDesignRepository.remove(design);
      this.logger.log(`Saved design ${designId} deleted for user ${userId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error deleting saved design ${designId} for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to delete saved design. Please try again.',
      );
    }
  }

  async calculatePrice(designData: CalculatePriceDto): Promise<{
    basePrice: number;
    customizationFee: number;
    printingFee: number;
    totalPrice: number;
    breakdown: {
      base: number;
      design: number;
      printing: number;
    };
  }> {
    try {
      console.log('[CalculatePrice] Request data:', {
        productId: designData.productId,
        colorCode: designData.colorCode,
        sizeCode: designData.sizeCode,
      });

      // Validate product exists
      const product = await this.productRepository.findOne({
        where: { id: designData.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${designData.productId} not found`,
        );
      }

      // Map hex color to ColorCode if needed
      let colorCode = designData.colorCode;
      if (colorCode.startsWith('#')) {
        // Hex color provided, try to map to standard ColorCode
        console.log(
          '[CalculatePrice] Mapping hex color to ColorCode:',
          colorCode,
        );
        // Try to find any available SKU for this product, use first color available
        const anySku = await this.skuVariantRepository.findOne({
          where: { productId: designData.productId },
        });
        if (anySku) {
          colorCode = anySku.ColorCode;
          console.log('[CalculatePrice] Using available color:', colorCode);
        } else {
          colorCode = 'BLACK'; // Final fallback
        }
      }

      // Get SKU variant price
      let skuVariant = await this.skuVariantRepository.findOne({
        where: {
          productId: designData.productId,
          ColorCode: colorCode,
          SizeCode: designData.sizeCode,
        },
      });

      // Fallback: if exact SKU not found, get any SKU for this product
      if (!skuVariant) {
        console.log(
          '[CalculatePrice] SKU not found for exact color/size, trying fallback',
        );
        skuVariant = await this.skuVariantRepository.findOne({
          where: { productId: designData.productId },
        });
      }

      console.log('[CalculatePrice] SKU found:', skuVariant?.SkuID);

      // If no SKU variant found, use product base price as fallback
      let basePrice: number;
      if (!skuVariant) {
        console.warn(
          `[CalculatePrice] No SKU variants found for product ${designData.productId}, using product base price`,
        );
        basePrice = Number(product.price) || 0;
      } else {
        basePrice = Number(skuVariant.price) || Number(product.price) || 0;
      }

      // Calculate design fee based on canvas elements
      let designFee = 0;
      if (designData.canvasData?.elements) {
        const designElements = designData.canvasData.elements.filter(
          (el: CanvasElementDto) => el.type === 'design',
        );

        // Each design element adds 50000 VND fee
        designFee = designElements.length * 50000;

        for (const element of designElements) {
          if (element.designId) {
            const design = await this.designRepository.findOne({
              where: { DESIGN_ID: element.designId },
            });
            if (design) {
              // Design price logic can be extended based on design pricing
              // For now, design fee is calculated by count
              console.log('[CalculatePrice] Design found:', design.DESIGN_ID);
            }
          }
        }
      }

      // Fixed printing cost per item
      const printingFee = 30000;

      // Calculate customization fee (design + printing)
      const customizationFee = designFee + printingFee;

      // Calculate total price for quantity
      const itemCost = basePrice + designFee + printingFee;
      const totalPrice = itemCost * designData.quantity;

      // Validate calculated price
      if (totalPrice <= 0 || !isFinite(totalPrice)) {
        throw new BadRequestException('Invalid calculated price');
      }

      console.log('[CalculatePrice] Calculation complete:', {
        basePrice,
        designFee,
        printingFee,
        customizationFee,
        totalPrice,
      });

      return {
        basePrice,
        customizationFee,
        printingFee,
        totalPrice,
        breakdown: {
          base: basePrice,
          design: designFee,
          printing: printingFee,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error calculating price: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Failed to calculate price. Please try again.',
      );
    }
  }
}
