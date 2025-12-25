import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { TrackEvent } from '../../entities/track-event.entity';
import { Order } from '../../entities/order.entity';
import { ShipmentItem } from '../../entities/shipment-item.entity';
import { OrderItem } from '../../entities/order-item.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(TrackEvent)
    private trackEventRepository: Repository<TrackEvent>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ShipmentItem)
    private shipmentItemRepository: Repository<ShipmentItem>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findByOrderId(orderId: string): Promise<Shipment | null> {
    return this.shipmentRepository.findOne({
      where: { orderId },
      relations: ['address', 'packaging', 'trackEvents'],
      order: { trackEvents: { even_time: 'DESC' } },
    });
  }

  async getTracking(shipmentId: string): Promise<{
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
    const shipment = await this.shipmentRepository.findOne({
      where: { Ship_ID: shipmentId },
      relations: ['address', 'packaging'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const events = await this.trackEventRepository.find({
      where: { shipmentId: shipment.Ship_ID },
      order: { even_time: 'DESC' },
    });

    // Format events for frontend
    const formattedEvents = events.map((event) => ({
      timestamp: event.even_time?.toISOString() || new Date().toISOString(),
      status: event.status_text || 'pending',
      location: event.location || 'Unknown',
      description: event.status_text || 'Update pending',
    }));

    return {
      id: shipment.Ship_ID,
      orderId: shipment.orderId,
      trackingNumber: shipment.tracking_number || 'N/A',
      status: shipment.status || 'processing',
      estimatedDelivery: shipment.ship_date?.toISOString() || null,
      events: formattedEvents,
    };
  }

  async getTrackingByOrderId(orderId: string): Promise<{
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
    const shipment = await this.findByOrderId(orderId);

    if (!shipment) {
      throw new NotFoundException('Shipment not found for this order');
    }

    const events = await this.trackEventRepository.find({
      where: { shipmentId: shipment.Ship_ID },
      order: { even_time: 'DESC' },
    });

    // Format events for frontend
    const formattedEvents = events.map((event) => ({
      timestamp: event.even_time?.toISOString() || new Date().toISOString(),
      status: event.status_text || 'pending',
      location: event.location || 'Unknown',
      description: event.status_text || 'Update pending',
    }));

    return {
      id: shipment.Ship_ID,
      orderId: shipment.orderId,
      trackingNumber: shipment.tracking_number || 'N/A',
      status: shipment.status || 'processing',
      estimatedDelivery: shipment.ship_date?.toISOString() || null,
      events: formattedEvents,
    };
  }

  async addTrackingEvent(
    shipmentId: string,
    eventData: Partial<TrackEvent>,
  ): Promise<TrackEvent> {
    const shipment = await this.shipmentRepository.findOne({
      where: { Ship_ID: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const event = this.trackEventRepository.create({
      ...eventData,
      shipmentId: shipment.Ship_ID,
    });

    return this.trackEventRepository.save(event);
  }

  async addShipmentItems(
    shipmentId: string,
    items: { orderItemId: string; quantity: number }[],
  ): Promise<ShipmentItem[]> {
    const shipment = await this.shipmentRepository.findOne({
      where: { Ship_ID: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const orderItemIds = items.map((i) => i.orderItemId);
    const orderItems = await this.orderItemRepository.findBy({
      id: In(orderItemIds),
    });

    if (orderItems.length !== orderItemIds.length) {
      throw new BadRequestException('Some order items not found');
    }

    const payload = items.map((i) =>
      this.shipmentItemRepository.create({
        shipmentId,
        orderItemId: i.orderItemId,
        quantity: i.quantity,
      }),
    );
    await this.shipmentItemRepository.save(payload);

    return this.shipmentItemRepository.find({
      where: { shipmentId },
      relations: ['orderItem', 'orderItem.skuVariant'],
      order: { createdAt: 'DESC' },
    });
  }
}
