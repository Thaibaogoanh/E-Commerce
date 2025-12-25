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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
} from '../../dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  async findAll(@Query() queryDto: ProductQueryDto): Promise<{
    products: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.productsService.findAll(queryDto);
  }

  // AI Recommendation endpoints - MUST be before @Get(':id') to avoid route conflicts
  @Get('ai/trending')
  @ApiOperation({
    summary: 'Get trending products (AI - High rating + Many purchases)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTrendingProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    const limitInt = limit ? Math.floor(Number(limit)) || 10 : 10;
    return this.productsService.getTrendingProducts(limitInt);
  }

  @Get('ai/recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recommended products for user (AI - Personalized)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedForUser(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    // Extract userId from JWT token
    const userId = req?.user?.id || '';
    const limitInt = limit ? Math.floor(Number(limit)) || 5 : 5;
    return this.productsService.getRecommendedForUser(userId, limitInt);
  }

  @Get('ai/similar/:id')
  @ApiOperation({
    summary:
      'Get similar products (AI - Same category + Similar price + High rating)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSimilarProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    const limitInt = limit ? Math.floor(Number(limit)) || 5 : 5;
    return this.productsService.getSimilarProducts(id, limitInt);
  }

  @Get('ai/frequently-bought/:id')
  @ApiOperation({
    summary: 'Get frequently bought together (AI - Co-purchase analysis)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFrequentlyBoughtTogether(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    const limitInt = limit ? Math.floor(Number(limit)) || 5 : 5;
    return this.productsService.getFrequentlyBoughtTogether(id, limitInt);
  }

  // Specific product endpoints - MUST be before @Get(':id')
  @Get('blanks')
  @ApiOperation({
    summary: 'Get all blank products (products without designs)',
    description: 'Returns paginated list of blank products that can be customized',
  })
  @ApiResponse({
    status: 200,
    description: 'Blank products retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
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

  // Dynamic route - MUST be last to avoid conflicts
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
