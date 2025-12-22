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
import { DesignsService } from './designs.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { Design } from '../../entities/design.entity';
import { DesignStatus } from '../../entities/design.entity';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('status') status?: DesignStatus,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.designsService.findAll({
      category,
      tags: tagsArray,
      status,
      search,
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

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likeDesign(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string; liked: boolean }> {
    // This will be handled by FavoritesController
    return Promise.resolve({ message: 'Use POST /api/favorites with designId', liked: false });
  }
}
