import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ProductReviewStatsDto,
  ReviewStatsDto,
} from '../../dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query() queryDto: ReviewQueryDto): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.reviewsService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getReviewStats(): Promise<ReviewStatsDto> {
    return this.reviewsService.getReviewStats();
  }

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() queryDto: ReviewQueryDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.reviewsService.findByProduct(productId, queryDto);
  }

  @Get('product/:productId/stats')
  async getProductReviewStats(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductReviewStatsDto> {
    return this.reviewsService.getProductReviewStats(productId);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(
    @Request() req,
    @Query() queryDto: ReviewQueryDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.reviewsService.findByUser(req.user.id, queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async verifyReview(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.verifyReview(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    return this.reviewsService.remove(id, req.user.id);
  }

  @Delete(':id/admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminRemove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.reviewsService.adminRemove(id);
  }
}


