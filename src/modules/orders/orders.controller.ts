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
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  OrderQueryDto,
  OrderResponseDto,
  OrderStatsDto,
} from '../../dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query() queryDto: OrderQueryDto): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.ordersService.findAll(queryDto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(
    @Request() req,
    @Query() queryDto: OrderQueryDto,
  ): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.ordersService.findByUser(req.user.id, queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getOrderStats(): Promise<OrderStatsDto> {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updatePaymentStatus(id, updatePaymentStatusDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(id, req.user.id);
  }

  @Get(':id/tracking')
  @UseGuards(JwtAuthGuard)
  async getTracking(@Param('id', ParseUUIDPipe) id: string) {
    // This will be handled by ShipmentsController, but we can add a redirect or call it here
    return { message: 'Use GET /api/shipments/order/:orderId for tracking' };
  }
}
