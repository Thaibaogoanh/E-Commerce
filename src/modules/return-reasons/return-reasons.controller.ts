import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ReturnReasonsService } from './return-reasons.service';
import { ReturnReason } from '../../entities/return-reason.entity';

@Controller('return-reasons')
@UseGuards(JwtAuthGuard)
export class ReturnReasonsController {
  constructor(private readonly returnReasonsService: ReturnReasonsService) {}

  @Get()
  findAll(): Promise<ReturnReason[]> {
    return this.returnReasonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReturnReason> {
    return this.returnReasonsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<ReturnReason>): Promise<ReturnReason> {
    return this.returnReasonsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<ReturnReason>,
  ): Promise<ReturnReason> {
    return this.returnReasonsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.returnReasonsService.remove(id);
  }
}
