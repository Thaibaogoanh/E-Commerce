import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponseDto,
  CartSummaryDto,
} from '../../dto/cart.dto';
import { VouchersService } from '../vouchers/vouchers.service';
import { Neo4jService } from '../../config/neo4j.config';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private vouchersService: VouchersService,
    private neo4jService: Neo4jService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { UserID: userId, is_active: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find existing active cart
    let cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product'],
    });

    // Create new cart if none exists
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        totalAmount: 0,
        itemCount: 0,
        isActive: true,
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.formatCartResponse(cart);
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const {
      productId,
      quantity,
      colorCode,
      sizeCode,
      customDesignData,
      designId,
    } = addToCartDto;

    // Verify product exists and is active
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Check if product already exists in cart
      const existingCartItem = await this.cartItemRepository.findOne({
        where: { cartId: cart.id, productId },
      });

      if (existingCartItem) {
        // Update existing item
        const newQuantity = existingCartItem.qty + quantity;

        // Check total stock
        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
          );
        }

        existingCartItem.qty = newQuantity;
        existingCartItem.unit_price_snapshot = product.price;

        // Update custom design data if provided
        if (customDesignData) {
          existingCartItem.customDesignData = customDesignData;
        }
        if (colorCode) {
          existingCartItem.colorCode = colorCode;
        }
        if (sizeCode) {
          existingCartItem.sizeCode = sizeCode;
        }
        if (designId) {
          existingCartItem.designId = designId;
        }

        await queryRunner.manager.save(CartItem, existingCartItem);
      } else {
        // Create new cart item
        const cartItem = this.cartItemRepository.create({
          cartId: cart.id,
          productId,
          qty: quantity,
          unit_price_snapshot: product.price,
          colorCode: colorCode || null,
          sizeCode: sizeCode || null,
          designId: designId || null,
          customDesignData: customDesignData || null,
        } as Partial<CartItem>);

        await queryRunner.manager.save(CartItem, cartItem);
      }

      // Update cart totals
      await this.updateCartTotals(queryRunner, cart.id);

      await queryRunner.commitTransaction();

      // Create Neo4j interest/viewed relationships (non-blocking)
      if (this.neo4jService.isReady()) {
        try {
          // Create viewed/interested relationship when adding to cart
          await this.neo4jService.createViewedRelationship(
            userId,
            productId,
          );

          // Create product node if it doesn't exist (only for blanks)
          const product = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('product.id = :id', { id: productId })
            .andWhere('product.isActive = :isActive', { isActive: true })
            .andWhere(
              'NOT EXISTS (SELECT 1 FROM sku_variants sv WHERE sv."productId" = product.id)',
            )
            .getOne();
          if (product) {
            await this.neo4jService.createProduct(
              product.id,
              product.name,
              product.category?.id || '',
              product.price,
              product.rating || 0,
            );
            if (product.category?.id) {
              await this.neo4jService.linkProductToCategory(
                product.id,
                product.category.id,
              );
            }
          }
        } catch (error) {
          // Don't throw - Neo4j is not critical for cart operations
          console.warn('Failed to create Neo4j viewed relationship:', error);
        }
      }

      // Return updated cart
      const updatedCart = await this.cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.product'],
      });

      if (!updatedCart) {
        throw new NotFoundException('Cart not found');
      }

      if (!updatedCart) {
        throw new NotFoundException('Cart not found');
      }

      return this.formatCartResponse(updatedCart);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const { quantity } = updateCartItemDto;

    // Find cart item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException('Cart item does not belong to user');
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.product.stock}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update cart item
      cartItem.quantity = quantity;
      cartItem.price = cartItem.product.price;

      await queryRunner.manager.save(CartItem, cartItem);

      // Update cart totals
      await this.updateCartTotals(queryRunner, cartItem.cartId);

      await queryRunner.commitTransaction();

      // Return updated cart
      const updatedCart = await this.cartRepository.findOne({
        where: { id: cartItem.cartId },
        relations: ['items', 'items.product'],
      });

      if (!updatedCart) {
        throw new NotFoundException('Cart not found');
      }

      return this.formatCartResponse(updatedCart);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeFromCart(
    userId: string,
    itemId: string,
  ): Promise<CartResponseDto> {
    // Find cart item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException('Cart item does not belong to user');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Remove cart item
      await queryRunner.manager.remove(CartItem, cartItem);

      // Update cart totals
      await this.updateCartTotals(queryRunner, cartItem.cartId);

      await queryRunner.commitTransaction();

      // Return updated cart
      const updatedCart = await this.cartRepository.findOne({
        where: { id: cartItem.cartId },
        relations: ['items', 'items.product'],
      });

      if (!updatedCart) {
        throw new NotFoundException('Cart not found');
      }

      return this.formatCartResponse(updatedCart);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    const cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Remove all cart items
      await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      // Reset cart totals
      cart.totalAmount = 0;
      cart.itemCount = 0;
      await queryRunner.manager.save(Cart, cart);

      await queryRunner.commitTransaction();

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCartSummary(userId: string): Promise<CartSummaryDto> {
    const cart = await this.getOrCreateCart(userId);

    const items = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    return {
      totalItems: cart.itemCount,
      totalAmount: cart.totalAmount,
      items,
    };
  }

  async applyVoucher(
    userId: string,
    voucherCode: string,
  ): Promise<{ message: string; discount?: number; discountAmount?: number }> {
    // Get cart to calculate discount
    const cart = await this.getOrCreateCart(userId);
    const orderAmount = cart.totalAmount || 0;

    // Use VouchersService to validate voucher
    const validationResult = await this.vouchersService.validateVoucher(
      voucherCode,
      userId,
      orderAmount,
    );

    if (!validationResult.valid) {
      throw new BadRequestException(
        validationResult.message || 'Invalid voucher code',
      );
    }

    const discountAmount = validationResult.discount;
    const voucher = validationResult.voucher;

    if (!voucher) {
      throw new BadRequestException('Voucher not found');
    }

    // Format success message based on voucher type
    let message = 'Voucher applied successfully!';
    if (voucher.type === 'percentage') {
      message = `Voucher applied successfully! ${voucher.value}% discount`;
    } else if (voucher.type === 'fixed_amount') {
      message = `Voucher applied successfully! Discount: ${discountAmount.toLocaleString('vi-VN')}₫`;
    } else if (voucher.type === 'free_shipping') {
      message = 'Free shipping voucher applied successfully!';
    }

    return {
      message,
      discount:
        voucher.type === 'percentage'
          ? Number(voucher.value) / 100
          : discountAmount / orderAmount, // Return as decimal for percentage
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    };
  }

  private async updateCartTotals(
    queryRunner: any,
    cartId: string,
  ): Promise<void> {
    // Calculate totals - use actual column names, not getters
    const result = await queryRunner.manager
      .createQueryBuilder(CartItem, 'item')
      .select('SUM(item.qty)', 'totalItems')
      .addSelect('SUM(item.qty * item.unit_price_snapshot)', 'totalAmount')
      .where('item.cartId = :cartId', { cartId })
      .getRawOne();

    // Update cart
    await queryRunner.manager.update(Cart, cartId, {
      itemCount: parseInt(result.totalItems) || 0,
      totalAmount: parseFloat(result.totalAmount) || 0,
    });
  }

  private formatCartResponse(cart: Cart): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
      isActive: cart.isActive,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items
        ? cart.items
            .filter((item) => item.product) // Filter out items without products
            .map((item) => {
              // Ensure price is always set from unit_price_snapshot or product price
              const itemPrice =
                item.price ||
                item.unit_price_snapshot ||
                item.product?.price ||
                0;
              return {
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                price: itemPrice,
                subtotal: (item.quantity || 1) * itemPrice,
                sizeCode: item.sizeCode,
                colorCode: item.colorCode,
                designId: item.designId,
                customDesignData: item.customDesignData,
                product: {
                  id: item.product.id,
                  name: item.product.name,
                  title: item.product.title,
                  price: item.product.price,
                  image: item.product.image,
                  stock: item.product.stock,
                },
              };
            })
        : [],
    };
  }
}
