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
import { SizesService } from './sizes.service';
import { Size } from '../../entities/size.entity';

@Controller('sizes')
@UseGuards(JwtAuthGuard)
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  findAll(): Promise<Size[]> {
    return this.sizesService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Size>): Promise<Size> {
    return this.sizesService.create(data);
  }

  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() data: Partial<Size>,
  ): Promise<Size> {
    return this.sizesService.update(code, data);
  }

  @Delete(':code')
  remove(@Param('code') code: string): Promise<void> {
    return this.sizesService.remove(code);
  }
}
