import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PaymentMethod } from '../../entities/payment-method.entity';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async findAll(@Request() req): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.findOne(req.user.id, id);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createMethodDto: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.create(req.user.id, createMethodDto);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMethodDto: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.update(req.user.id, id, updateMethodDto);
  }

  @Patch(':id/set-default')
  async setDefault(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.setDefault(req.user.id, id);
  }

  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.paymentMethodsService.remove(req.user.id, id);
    return { message: 'Payment method deleted successfully' };
  }
}

