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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
} from '../../dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() queryDto: ProductQueryDto): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productsService.findAll(queryDto);
  }

  @Get('featured')
  async getFeaturedProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get('new')
  async getNewProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getNewProducts(limit);
  }

  @Get('blanks')
  async getBlanks(@Query() queryDto: ProductQueryDto): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Products without designs (blanks only)
    return this.productsService.findAll({ ...queryDto, blanksOnly: true });
  }

  @Get('ready-made')
  async getReadyMade(@Query() queryDto: ProductQueryDto): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Products with designs (ready-made)
    return this.productsService.findAll({ ...queryDto, readyMade: true });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, quantity);
  }
}


