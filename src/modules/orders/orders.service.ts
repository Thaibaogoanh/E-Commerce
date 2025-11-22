import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  OrderQueryDto,
  OrderResponseDto,
  OrderStatsDto,
} from '../../dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const { items, shippingAddress, paymentMethod, notes } = createOrderDto;

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      subtotal: number;
      product: Product;
    }> = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId, isActive: true },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }

      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal,
        product,
      });
    }

    // Create order with transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = this.orderRepository.create({
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        notes,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items and update product stock
      const orderItems: OrderItem[] = [];
      for (const item of validatedItems) {
        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        });

        const savedOrderItem = await queryRunner.manager.save(
          OrderItem,
          orderItem,
        );
        orderItems.push(savedOrderItem);

        // Update product stock
        item.product.stock -= item.quantity;
        await queryRunner.manager.save(Product, item.product);
      }

      await queryRunner.commitTransaction();

      // Return formatted response
      return this.formatOrderResponse(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryDto: OrderQueryDto): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(
    userId: string,
    queryDto: OrderQueryDto,
  ): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.userId = :userId', { userId });

    // Apply filters
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if status transition is valid
    this.validateStatusTransition(order.status, updateOrderStatusDto.status);

    Object.assign(order, updateOrderStatusDto);
    const updatedOrder = await this.orderRepository.save(order);

    return this.formatOrderResponse(updatedOrder);
  }

  async updatePaymentStatus(
    id: string,
    updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = updatePaymentStatusDto.paymentStatus;
    const updatedOrder = await this.orderRepository.save(order);

    return this.formatOrderResponse(updatedOrder);
  }

  async cancelOrder(id: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user can cancel this order
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Check if order can be cancelled
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore product stock and cancel order
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Restore product stock
      for (const item of order.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (product) {
          product.stock += item.quantity;
          await queryRunner.manager.save(Product, product);
        }
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      const updatedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return this.formatOrderResponse(updatedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrderStats(): Promise<OrderStatsDto> {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepository.count({ where: { status: OrderStatus.PROCESSING } }),
      this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } }),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .where('order.paymentStatus = :status', {
          status: PaymentStatus.COMPLETED,
        })
        .getRawOne(),
    ]);

    const averageOrderValue =
      totalOrders > 0 ? totalRevenue.total / totalOrders : 0;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue.total || 0,
      averageOrderValue,
    };
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private formatOrderResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : {
            id: '',
            name: '',
            email: '',
          },
      items: order.items
        ? order.items
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
                image: item.product.image,
              },
            }))
        : [],
    };
  }
}
