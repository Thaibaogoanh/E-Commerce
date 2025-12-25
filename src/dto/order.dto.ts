import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsString()
  sizeCode?: string;

  @IsOptional()
  @IsUUID()
  designId?: string;

  @IsOptional()
  customDesignData?: {
    elements: Array<{
      id: string;
      type: 'text' | 'image' | 'design';
      content: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      textAlign?: string;
    }>;
    color: string;
    size: string;
  };
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    title: string;
    image?: string;
  };
}

export class OrderResponseDto {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItemResponseDto[];
}

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'totalAmount' | 'status';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}

export class OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
