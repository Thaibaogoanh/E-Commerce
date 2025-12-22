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
import { AssetsService } from './assets.service';
import { Asset } from '../../entities/asset.entity';
import { AssetDisposal } from '../../entities/asset-disposal.entity';

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(): Promise<Asset[]> {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Asset> {
    return this.assetsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Asset>): Promise<Asset> {
    return this.assetsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Asset>,
  ): Promise<Asset> {
    return this.assetsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.assetsService.remove(id);
  }

  @Post(':id/dispose')
  dispose(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    payload: { reason: string; note?: string; disposedBy?: string },
  ): Promise<AssetDisposal> {
    return this.assetsService.dispose(id, payload);
  }

  @Get(':id/disposals')
  disposals(@Param('id', ParseUUIDPipe) id: string): Promise<AssetDisposal[]> {
    return this.assetsService.getDisposals(id);
  }
}
