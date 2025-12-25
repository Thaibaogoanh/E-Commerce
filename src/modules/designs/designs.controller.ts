import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { Design } from '../../entities/design.entity';
import { DesignStatus } from '../../entities/design.entity';

@ApiTags('Designs')
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tags') tags?: string,
    @Query('status') status?: DesignStatus,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'likes' | 'downloads',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.designsService.findAll({
      category,
      categoryId,
      tags: tagsArray,
      status,
      search,
      minPrice: minPrice ? parseFloat(minPrice.toString()) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice.toString()) : undefined,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('trending')
  async getTrending(
    @Query('limit') limit?: number,
  ): Promise<{ designs: Design[]; total: number }> {
    return this.designsService.findTrending(limit);
  }

  @Get('ai/recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recommended designs for user (AI - Personalized)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedForUser(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<Design[]> {
    const userId = req?.user?.id || '';
    const limitInt = limit ? Math.floor(Number(limit)) || 5 : 5;
    return this.designsService.getRecommendedForUser(userId, limitInt);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Design> {
    return this.designsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDesignDto: Partial<Design>): Promise<Design> {
    return this.designsService.create(createDesignDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDesignDto: Partial<Design>,
  ): Promise<Design> {
    return this.designsService.update(id, updateDesignDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async approve(@Param('id', ParseUUIDPipe) id: string): Promise<Design> {
    return this.designsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async reject(@Param('id', ParseUUIDPipe) id: string): Promise<Design> {
    return this.designsService.reject(id);
  }
}
