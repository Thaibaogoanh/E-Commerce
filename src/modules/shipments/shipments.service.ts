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
    shipment: Shipment;
    events: TrackEvent[];
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

    return { shipment, events };
  }

  async getTrackingByOrderId(orderId: string): Promise<{
    shipment: Shipment;
    events: TrackEvent[];
  }> {
    const shipment = await this.findByOrderId(orderId);

    if (!shipment) {
      throw new NotFoundException('Shipment not found for this order');
    }

    const events = await this.trackEventRepository.find({
      where: { shipmentId: shipment.Ship_ID },
      order: { even_time: 'DESC' },
    });

    return { shipment, events };
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
