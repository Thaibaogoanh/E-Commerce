import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsString()
  sizeCode?: string;

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

  @IsOptional()
  @IsUUID()
  designId?: string; // If using existing design from gallery
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
  sizeCode?: string;
  colorCode?: string;
  designId?: string;
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
