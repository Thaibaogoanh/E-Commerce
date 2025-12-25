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
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Address } from '../../entities/address.entity';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async findAll(@Request() req): Promise<Address[]> {
    return this.addressesService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Address> {
    return this.addressesService.findOne(req.user.id, id);
  }

  @Post()
  async create(
    @Request() req,
    @Body() createAddressDto: Partial<Address>,
  ): Promise<Address> {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: Partial<Address>,
  ): Promise<Address> {
    return this.addressesService.update(req.user.id, id, updateAddressDto);
  }

  @Patch(':id/set-default')
  async setDefault(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Address> {
    return this.addressesService.setDefault(req.user.id, id);
  }

  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.addressesService.remove(req.user.id, id);
    return { message: 'Address deleted successfully' };
  }
}
