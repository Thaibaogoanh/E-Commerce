import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CartItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    title: string;
    price: number;
    image?: string;
    stock: number;
  };
}

export class CartResponseDto {
  id: string;
  userId: string;
  totalAmount: number;
  itemCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemResponseDto[];
}

export class CartSummaryDto {
  totalItems: number;
  totalAmount: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}
