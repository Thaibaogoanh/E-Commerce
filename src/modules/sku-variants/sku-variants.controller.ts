import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkuVariantsService } from './sku-variants.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { SkuVariant } from '../../entities/sku-variant.entity';

@Controller('sku-variants')
export class SkuVariantsController {
  constructor(private readonly skuVariantsService: SkuVariantsService) {}

  @Get('product/:productId')
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<SkuVariant[]> {
    return this.skuVariantsService.findByProduct(productId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SkuVariant> {
    return this.skuVariantsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createSkuDto: Partial<SkuVariant>): Promise<SkuVariant> {
    return this.skuVariantsService.create(createSkuDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkuDto: Partial<SkuVariant>,
  ): Promise<SkuVariant> {
    return this.skuVariantsService.update(id, updateSkuDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.skuVariantsService.remove(id);
    return { message: 'SKU variant deleted successfully' };
  }
}

