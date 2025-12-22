import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MaterialsService } from './materials.service';
import { Material } from '../../entities/material.entity';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll(): Promise<Material[]> {
    return this.materialsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Material>): Promise<Material> {
    return this.materialsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Material>,
  ): Promise<Material> {
    return this.materialsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.materialsService.remove(id);
  }
}
