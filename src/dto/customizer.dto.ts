import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CanvasElementDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(['text', 'image', 'design'])
  type: 'text' | 'image' | 'design';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsNumber()
  rotation: number;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  textAlign?: string;

  @IsOptional()
  @IsUUID()
  designId?: string;
}

export class CanvasDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanvasElementDto)
  @IsOptional()
  elements?: CanvasElementDto[];

  @IsOptional()
  @IsString()
  selectedColor?: string;

  @IsOptional()
  @IsString()
  selectedSize?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class SaveDesignDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CanvasDataDto)
  canvasData: CanvasDataDto;

  @IsString()
  @IsNotEmpty()
  colorCode: string;

  @IsString()
  @IsNotEmpty()
  sizeCode: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  designId?: string;
}

export class CalculatePriceDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  colorCode: string;

  @IsString()
  @IsNotEmpty()
  sizeCode: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CanvasDataDto)
  canvasData: CanvasDataDto;

  @IsOptional()
  @IsUUID()
  designId?: string;
}
