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
} from '@nestjs/common';
import { CustomizerService } from './customizer.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { SavedDesign } from '../../entities/saved-design.entity';

@Controller('customizer')
@UseGuards(JwtAuthGuard)
export class CustomizerController {
  constructor(private readonly customizerService: CustomizerService) {}

  @Post('save')
  async saveDesign(
    @Request() req,
    @Body() designData: {
      productId: string;
      name: string;
      canvasData: any;
      colorCode: string;
      sizeCode: string;
      quantity: number;
      designId?: string;
    },
  ): Promise<SavedDesign> {
    return this.customizerService.saveDesign(req.user.id, designData);
  }

  @Get('saved')
  async getSavedDesigns(@Request() req): Promise<SavedDesign[]> {
    return this.customizerService.getSavedDesigns(req.user.id);
  }

  @Get('saved/:id')
  async getSavedDesign(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SavedDesign> {
    return this.customizerService.getSavedDesign(req.user.id, id);
  }

  @Delete('saved/:id')
  async deleteSavedDesign(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.customizerService.deleteSavedDesign(req.user.id, id);
    return { message: 'Saved design deleted successfully' };
  }

  @Post('calculate-price')
  async calculatePrice(
    @Body() designData: {
      productId: string;
      colorCode: string;
      sizeCode: string;
      quantity: number;
      canvasData: any;
      designId?: string;
    },
  ): Promise<{ price: number }> {
    const price = await this.customizerService.calculatePrice(designData);
    return { price };
  }
}

