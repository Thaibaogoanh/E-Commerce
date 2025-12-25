import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ProductReviewStatsDto,
  ReviewStatsDto,
} from '../../dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const { productId, rating, comment } = createReviewDto;

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: { userId, productId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Check if user has purchased this product (optional verification)
    // This would require checking order history
    const hasPurchased = await this.checkUserPurchase(userId, productId);

    // Create review
    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
      isVerified: hasPurchased,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update product average rating
    await this.updateProductRating(productId);

    return this.formatReviewResponse(savedReview);
  }

  async findAll(queryDto: ReviewQueryDto): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      productId,
      userId,
      rating,
      isVerified,
    } = queryDto;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.isActive = :isActive', { isActive: true });

    if (productId) {
      queryBuilder.andWhere('review.productId = :productId', { productId });
    }

    if (userId) {
      queryBuilder.andWhere('review.userId = :userId', { userId });
    }

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('review.isVerified = :isVerified', { isVerified });
    }

    const [reviews, total] = await queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((review) => this.formatReviewResponse(review)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.formatReviewResponse(review);
  }

  async findByProduct(
    productId: string,
    queryDto: ReviewQueryDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ ...queryDto, productId });
  }

  async findByUser(
    userId: string,
    queryDto: ReviewQueryDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ ...queryDto, userId });
  }

  async update(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review
    Object.assign(review, updateReviewDto);
    const savedReview = await this.reviewRepository.save(review);

    // Update product average rating
    await this.updateProductRating(review.productId);

    return this.formatReviewResponse(savedReview);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete
    review.isActive = false;
    await this.reviewRepository.save(review);

    // Update product average rating
    await this.updateProductRating(review.productId);

    return { message: 'Review deleted successfully' };
  }

  async adminRemove(id: string): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Soft delete
    review.isActive = false;
    await this.reviewRepository.save(review);

    // Update product average rating
    await this.updateProductRating(review.productId);

    return { message: 'Review deleted successfully by admin' };
  }

  async verifyReview(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isVerified = true;
    const savedReview = await this.reviewRepository.save(review);

    return this.formatReviewResponse(savedReview);
  }

  async getProductReviewStats(
    productId: string,
  ): Promise<ProductReviewStatsDto> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get review statistics
    const [
      totalReviews,
      averageRating,
      ratingDistribution,
      verifiedReviews,
      recentReviews,
    ] = await Promise.all([
      this.reviewRepository.count({
        where: { productId, isActive: true },
      }),
      this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .where('review.productId = :productId', { productId })
        .andWhere('review.isActive = :isActive', { isActive: true })
        .getRawOne(),
      this.reviewRepository
        .createQueryBuilder('review')
        .select('review.rating', 'rating')
        .addSelect('COUNT(*)', 'count')
        .where('review.productId = :productId', { productId })
        .andWhere('review.isActive = :isActive', { isActive: true })
        .groupBy('review.rating')
        .getRawMany(),
      this.reviewRepository.count({
        where: { productId, isActive: true, isVerified: true },
      }),
      this.reviewRepository.find({
        where: { productId, isActive: true },
        relations: ['user', 'product'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    // Format rating distribution
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    ratingDistribution.forEach((item) => {
      distribution[item.rating.toString() as keyof typeof distribution] =
        parseInt(item.count);
    });

    return {
      productId,
      averageRating: parseFloat(averageRating.average) || 0,
      totalReviews,
      ratingDistribution: distribution,
      verifiedReviews,
      recentReviews: recentReviews.map((review) =>
        this.formatReviewResponse(review),
      ),
    };
  }

  async getReviewStats(): Promise<ReviewStatsDto> {
    const [
      totalReviews,
      averageRating,
      verifiedReviews,
      pendingReviews,
      recentReviews,
    ] = await Promise.all([
      this.reviewRepository.count({ where: { isActive: true } }),
      this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .where('review.isActive = :isActive', { isActive: true })
        .getRawOne(),
      this.reviewRepository.count({
        where: { isActive: true, isVerified: true },
      }),
      this.reviewRepository.count({
        where: { isActive: true, isVerified: false },
      }),
      this.reviewRepository.find({
        where: { isActive: true },
        relations: ['user', 'product'],
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.average) || 0,
      verifiedReviews,
      pendingReviews,
      recentReviews: recentReviews.map((review) =>
        this.formatReviewResponse(review),
      ),
    };
  }

  private async checkUserPurchase(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    // This is a simplified check. In a real application, you would check
    // if the user has actually purchased this product through order history
    const result = await this.dataSource
      .createQueryBuilder()
      .select('1')
      .from('order_items', 'oi')
      .innerJoin('orders', 'o', 'o.id = oi.orderId')
      .where('o.userId = :userId', { userId })
      .andWhere('oi.productId = :productId', { productId })
      .andWhere('o.paymentStatus = :status', { status: 'completed' })
      .limit(1)
      .getRawOne();

    return !!result;
  }

  private async updateProductRating(productId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isActive = :isActive', { isActive: true })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 0;
    const numReviews = parseInt(result.count) || 0;

    await this.productRepository.update(productId, {
      averageRating,
      numReviews,
    });
  }

  private formatReviewResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      isVerified: review.isVerified,
      isActive: review.isActive,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.name,
            email: review.user.email,
            image: review.user.image,
          }
        : {
            id: '',
            name: '',
            email: '',
            image: undefined,
          },
      product: review.product
        ? {
            id: review.product.id,
            name: review.product.name,
            title: review.product.title,
            image: review.product.image,
          }
        : {
            id: '',
            name: '',
            title: '',
            image: undefined,
          },
    };
  }
}
