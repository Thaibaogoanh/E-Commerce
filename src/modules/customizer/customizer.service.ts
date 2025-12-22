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
      const price = await this.calculatePrice(designData);

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
        calculatedPrice: price,
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

  async calculatePrice(designData: CalculatePriceDto): Promise<number> {
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

      // Get SKU variant price
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

      let basePrice = Number(skuVariant.price);

      // Add design prices if any designs are used
      if (designData.canvasData?.elements) {
        const designElements = designData.canvasData.elements.filter(
          (el: CanvasElementDto) => el.type === 'design',
        );

        for (const element of designElements) {
          if (element.designId) {
            const design = await this.designRepository.findOne({
              where: { DESIGN_ID: element.designId },
            });
            if (design) {
              // Design price logic (could be based on license type)
              // For now, add 0, but can be extended based on design pricing
              basePrice += 0;
            }
          }
        }
      }

      // Add printing cost (could be calculated based on print area, quantity, etc.)
      const printingCost = 50000; // Base printing cost per item

      const totalPrice = (basePrice + printingCost) * designData.quantity;

      // Validate calculated price
      if (totalPrice <= 0 || !isFinite(totalPrice)) {
        throw new BadRequestException('Invalid calculated price');
      }

      return totalPrice;
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
