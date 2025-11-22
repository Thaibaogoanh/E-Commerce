import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
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
    const { productId, quantity } = addToCartDto;

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
        const newQuantity = existingCartItem.quantity + quantity;

        // Check total stock
        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
          );
        }

        existingCartItem.quantity = newQuantity;
        existingCartItem.price = product.price;
        existingCartItem.subtotal = product.price * newQuantity;

        await queryRunner.manager.save(CartItem, existingCartItem);
      } else {
        // Create new cart item
        const cartItem = this.cartItemRepository.create({
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        });

        await queryRunner.manager.save(CartItem, cartItem);
      }

      // Update cart totals
      await this.updateCartTotals(queryRunner, cart.id);

      await queryRunner.commitTransaction();

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
      cartItem.subtotal = cartItem.product.price * quantity;

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

  private async updateCartTotals(
    queryRunner: any,
    cartId: string,
  ): Promise<void> {
    // Calculate totals
    const result = await queryRunner.manager
      .createQueryBuilder(CartItem, 'item')
      .select('SUM(item.quantity)', 'totalItems')
      .addSelect('SUM(item.subtotal)', 'totalAmount')
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
            .map((item) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              product: {
                id: item.product.id,
                name: item.product.name,
                title: item.product.title,
                price: item.product.price,
                image: item.product.image,
                stock: item.product.stock,
              },
            }))
        : [],
    };
  }
}
