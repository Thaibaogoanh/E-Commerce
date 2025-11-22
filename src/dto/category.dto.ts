import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: {
    id: string;
    name: string;
  };
  children?: CategoryResponseDto[];
  products?: {
    id: string;
    name: string;
    title: string;
    price: number;
    image?: string;
  }[];
}

export class CategoryTreeDto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  children: CategoryTreeDto[];
  productCount: number;
}
