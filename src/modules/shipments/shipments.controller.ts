import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TrackEvent } from '../../entities/track-event.entity';
import { ShipmentItem } from '../../entities/shipment-item.entity';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('order/:orderId')
  async getTrackingByOrder(
    @Request() req,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<{
    id: string;
    orderId: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery: string | null;
    events: Array<{
      timestamp: string;
      status: string;
      location: string;
      description: string;
    }>;
  }> {
    return this.shipmentsService.getTrackingByOrderId(orderId);
  }

  @Get(':id/tracking')
  async getTracking(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    id: string;
    orderId: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery: string | null;
    events: Array<{
      timestamp: string;
      status: string;
      location: string;
      description: string;
    }>;
  }> {
    return this.shipmentsService.getTracking(id);
  }

  @Post(':id/tracking')
  async addTrackingEvent(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() eventData: Partial<TrackEvent>,
  ): Promise<TrackEvent> {
    return this.shipmentsService.addTrackingEvent(id, eventData);
  }

  @Post(':id/items')
  async addShipmentItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    items: { orderItemId: string; quantity: number }[],
  ): Promise<ShipmentItem[]> {
    return this.shipmentsService.addShipmentItems(id, items);
  }
}
