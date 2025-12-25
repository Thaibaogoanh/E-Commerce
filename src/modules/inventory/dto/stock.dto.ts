import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from '../../../entities/stock-movement.entity';

export class StockAdjustmentDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class StockMovementQueryDto {
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;
}
