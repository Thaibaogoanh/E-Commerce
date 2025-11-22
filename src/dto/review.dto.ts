import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReviewQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class ReviewResponseDto {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  product: {
    id: string;
    name: string;
    title: string;
    image?: string;
  };
}

export class ProductReviewStatsDto {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  verifiedReviews: number;
  recentReviews: ReviewResponseDto[];
}

export class ReviewStatsDto {
  totalReviews: number;
  averageRating: number;
  verifiedReviews: number;
  pendingReviews: number;
  recentReviews: ReviewResponseDto[];
}


