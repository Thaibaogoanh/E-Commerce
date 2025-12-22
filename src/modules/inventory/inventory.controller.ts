import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { StockAdjustmentDto, StockMovementQueryDto } from './dto/stock.dto';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  async listAll() {
    return this.inventoryService.listAll();
  }

  @Get('stock/:skuId')
  async getStock(@Param('skuId', ParseUUIDPipe) skuId: string) {
    return this.inventoryService.getBySku(skuId);
  }

  @Post('stock/:skuId/inbound')
  async inbound(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.inbound(
      skuId,
      dto.quantity,
      dto.note,
      dto.referenceType,
      dto.referenceId,
    );
  }

  @Post('stock/:skuId/outbound')
  async outbound(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.outbound(
      skuId,
      dto.quantity,
      dto.note,
      dto.referenceType,
      dto.referenceId,
    );
  }

  @Post('stock/:skuId/reserve')
  async reserve(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.reserve(
      skuId,
      dto.quantity,
      dto.note,
      dto.referenceType,
      dto.referenceId,
    );
  }

  @Post('stock/:skuId/release')
  async release(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.release(
      skuId,
      dto.quantity,
      dto.note,
      dto.referenceType,
      dto.referenceId,
    );
  }

  @Get('stock/:skuId/movements')
  async movements(
    @Param('skuId', ParseUUIDPipe) skuId: string,
    @Query() query: StockMovementQueryDto,
  ) {
    return this.inventoryService.movements(skuId, query.type);
  }
}
