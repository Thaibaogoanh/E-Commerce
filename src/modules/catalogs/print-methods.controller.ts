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
import { PrintMethodsService } from './print-methods.service';
import { PrintMethod } from '../../entities/print-method.entity';

@Controller('print-methods')
@UseGuards(JwtAuthGuard)
export class PrintMethodsController {
  constructor(private readonly printMethodsService: PrintMethodsService) {}

  @Get()
  findAll(): Promise<PrintMethod[]> {
    return this.printMethodsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<PrintMethod>): Promise<PrintMethod> {
    return this.printMethodsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<PrintMethod>,
  ): Promise<PrintMethod> {
    return this.printMethodsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.printMethodsService.remove(id);
  }
}
