import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  AddToCartDto,
  UpdateCartItemDto,
  CartResponseDto,
  CartSummaryDto,
} from '../../dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req): Promise<CartResponseDto> {
    return this.cartService.getCart(req.user.id);
  }

  @Get('summary')
  async getCartSummary(@Request() req): Promise<CartSummaryDto> {
    return this.cartService.getCartSummary(req.user.id);
  }

  @Post('add')
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('items/:itemId')
  async updateCartItem(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(
      req.user.id,
      itemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:itemId')
  async removeFromCart(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete('clear')
  async clearCart(@Request() req): Promise<{ message: string }> {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('apply-voucher')
  async applyVoucher(
    @Request() req,
    @Body() body: { voucherCode: string },
  ): Promise<{ message: string; discount?: number; discountAmount?: number }> {
    return this.cartService.applyVoucher(req.user.id, body.voucherCode);
  }
}


