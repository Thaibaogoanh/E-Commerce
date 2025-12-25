import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { RewardType } from '../entities/reward-catalog.entity';

export class CreateRewardCatalogDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(RewardType)
  type: RewardType;

  @IsNumber()
  @Min(0)
  pointsRequired: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRewardCatalogDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsRequired?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
