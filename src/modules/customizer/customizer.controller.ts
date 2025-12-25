import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomizerService } from './customizer.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { SavedDesign } from '../../entities/saved-design.entity';
import { SaveDesignDto, CalculatePriceDto } from '../../dto/customizer.dto';

@Controller('customizer')
export class CustomizerController {
  constructor(private readonly customizerService: CustomizerService) {}

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async saveDesign(
    @Request() req: { user: { id: string } },
    @Body() designData: SaveDesignDto,
  ): Promise<SavedDesign> {
    return this.customizerService.saveDesign(req.user.id, designData);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  async getSavedDesigns(
    @Request() req: { user: { id: string } },
  ): Promise<SavedDesign[]> {
    return this.customizerService.getSavedDesigns(req.user.id);
  }

  @Get('saved/:id')
  @UseGuards(JwtAuthGuard)
  async getSavedDesign(
    @Request() req: { user: { id: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SavedDesign> {
    return this.customizerService.getSavedDesign(req.user.id, id);
  }

  @Delete('saved/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteSavedDesign(
    @Request() req: { user: { id: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.customizerService.deleteSavedDesign(req.user.id, id);
    return { message: 'Saved design deleted successfully' };
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  async calculatePrice(
    @Body() designData: CalculatePriceDto,
  ): Promise<{
    basePrice: number;
    customizationFee: number;
    printingFee: number;
    totalPrice: number;
    breakdown: {
      base: number;
      design: number;
      printing: number;
    };
  }> {
    return this.customizerService.calculatePrice(designData);
  }
}
