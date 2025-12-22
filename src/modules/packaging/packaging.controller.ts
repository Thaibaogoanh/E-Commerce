import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PackagingService } from './packaging.service';
import { Packaging } from '../../entities/packaging.entity';

@Controller('packaging')
@UseGuards(JwtAuthGuard)
export class PackagingController {
  constructor(private readonly packagingService: PackagingService) {}

  @Get()
  findAll(): Promise<Packaging[]> {
    return this.packagingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Packaging> {
    return this.packagingService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Packaging>): Promise<Packaging> {
    return this.packagingService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Packaging>,
  ): Promise<Packaging> {
    return this.packagingService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.packagingService.remove(id);
  }
}
