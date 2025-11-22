import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { Review } from '../../entities/review.entity';
import { SavedDesign } from '../../entities/saved-design.entity';
import { RewardPoint, PointType } from '../../entities/reward-point.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserQueryDto,
  UserResponseDto,
  UserStatsDto,
} from '../../dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(SavedDesign)
    private savedDesignRepository: Repository<SavedDesign>,
    @InjectRepository(RewardPoint)
    private rewardPointRepository: Repository<RewardPoint>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return this.formatUserResponse(savedUser);
  }

  async findAll(queryDto: UserQueryDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, role, isActive } = queryDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      users: await Promise.all(
        users.map((user) => this.formatUserResponseWithStats(user)),
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserResponseWithStats(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId?: string,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is trying to update their own profile or is admin
    if (currentUserId && currentUserId !== id) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
      });
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only update your own profile');
      }
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);

    return this.formatUserResponseWithStats(savedUser);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await this.userRepository.save(user);

    return { message: 'User deactivated successfully' };
  }

  async activate(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    await this.userRepository.save(user);

    return { message: 'User activated successfully' };
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has orders or reviews
    const [orderCount, reviewCount] = await Promise.all([
      this.orderRepository.count({ where: { userId: id } }),
      this.reviewRepository.count({ where: { userId: id } }),
    ]);

    if (orderCount > 0 || reviewCount > 0) {
      throw new BadRequestException(
        'Cannot delete user with existing orders or reviews. Deactivate instead.',
      );
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async getUserStats(): Promise<UserStatsDto> {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth,
      topCustomers,
      userGrowth,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :startOfMonth', {
          startOfMonth: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ),
        })
        .getCount(),
      this.getTopCustomers(),
      this.getUserGrowth(),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth,
      topCustomers,
      userGrowth,
    };
  }

  private async getTopCustomers(): Promise<UserResponseDto[]> {
    const topCustomers = await this.dataSource
      .createQueryBuilder()
      .select('u.id', 'userId')
      .addSelect('SUM(o.totalAmount)', 'totalSpent')
      .from('users', 'u')
      .innerJoin('orders', 'o', 'o.userId = u.id')
      .where('o.paymentStatus = :status', { status: 'completed' })
      .andWhere('u.role = :role', { role: UserRole.USER })
      .groupBy('u.id')
      .orderBy('totalSpent', 'DESC')
      .limit(5)
      .getRawMany();

    const userIds = topCustomers.map((customer) => customer.userId);
    const users = await this.userRepository.findByIds(userIds);

    return Promise.all(
      users.map((user) => this.formatUserResponseWithStats(user)),
    );
  }

  private async getUserGrowth(): Promise<{ month: string; count: number }[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await this.dataSource
      .createQueryBuilder()
      .select("DATE_TRUNC('month', user.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .from('users', 'user')
      .where('user.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("DATE_TRUNC('month', user.createdAt)")
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      month: new Date(item.month).toISOString().slice(0, 7), // YYYY-MM format
      count: parseInt(item.count),
    }));
  }

  private async formatUserResponseWithStats(
    user: User,
  ): Promise<UserResponseDto> {
    const [totalOrders, totalSpent, totalReviews, lastOrder] =
      await Promise.all([
        this.orderRepository.count({ where: { userId: user.id } }),
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'total')
          .where('order.userId = :userId', { userId: user.id })
          .andWhere('order.paymentStatus = :status', { status: 'completed' })
          .getRawOne(),
        this.reviewRepository.count({ where: { userId: user.id } }),
        this.orderRepository.findOne({
          where: { userId: user.id },
          order: { createdAt: 'DESC' },
        }),
      ]);

    return {
      ...this.formatUserResponse(user),
      stats: {
        totalOrders,
        totalSpent: parseFloat(totalSpent.total) || 0,
        totalReviews,
        lastOrderDate: lastOrder?.createdAt,
      },
    };
  }

  async getDashboardStats(userId: string): Promise<{
    totalOrders: number;
    greenPoints: number;
    savedDesigns: number;
    recentOrders: any[];
    treesPlanted: number;
  }> {
    const [totalOrders, savedDesigns, recentOrders, pointsBalance] =
      await Promise.all([
        this.orderRepository.count({ where: { userId } }),
        this.savedDesignRepository.count({ where: { userId } }),
        this.orderRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
          take: 5,
          relations: ['items'],
        }),
        this.getGreenPointsBalance(userId),
      ]);

    // Calculate trees planted (3 trees per order)
    const treesPlanted = totalOrders * 3;

    return {
      totalOrders,
      greenPoints: pointsBalance.available,
      savedDesigns,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.Total,
        status: order.Status,
        createdAt: order.createdAt,
        itemsCount: order.items?.length || 0,
      })),
      treesPlanted,
    };
  }

  async getRecentOrders(userId: string, limit: number = 5): Promise<any[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['items', 'items.product'],
    });

    return orders.map((order) => ({
      id: order.id,
      total: order.Total,
      status: order.Status,
      createdAt: order.createdAt,
      items: order.items?.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: item.qty,
        price: item.unit_price,
      })),
    }));
  }

  async getTreesPlanted(userId: string): Promise<{ trees: number }> {
    const totalOrders = await this.orderRepository.count({
      where: { userId },
    });
    return { trees: totalOrders * 3 };
  }

  private async getGreenPointsBalance(userId: string): Promise<{
    total: number;
    available: number;
    pending: number;
    expired: number;
  }> {
    const points = await this.rewardPointRepository.find({
      where: { userId },
    });

    const total = points
      .filter((p) => p.type === PointType.EARNED)
      .reduce((sum, p) => sum + p.points, 0);

    const redeemed = points
      .filter((p) => p.type === PointType.REDEEMED)
      .reduce((sum, p) => sum + Math.abs(p.points), 0);

    const expired = points
      .filter((p) => p.type === PointType.EXPIRED)
      .reduce((sum, p) => sum + Math.abs(p.points), 0);

    return {
      total,
      available: total - redeemed - expired,
      pending: 0,
      expired,
    };
  }

  private formatUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      image: user.image,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}


