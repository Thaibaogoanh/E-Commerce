import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { DesignsModule } from './modules/designs/designs.module';
import { SkuVariantsModule } from './modules/sku-variants/sku-variants.module';
import { CustomizerModule } from './modules/customizer/customizer.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { ContactModule } from './modules/contact/contact.module';
import { Neo4jService } from './config/neo4j.config';
import { getDatabaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Review } from './entities/review.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Address } from './entities/address.entity';
import { Employee } from './entities/employee.entity';
import { InvitationCode } from './entities/invitation-code.entity';
import { Material } from './entities/material.entity';
import { Size } from './entities/size.entity';
import { ColorOption } from './entities/color-option.entity';
import { SkuVariant } from './entities/sku-variant.entity';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { Design } from './entities/design.entity';
import { DesignAsset } from './entities/design-asset.entity';
import { DesignPlacement } from './entities/design-placement.entity';
import { PrintMethod } from './entities/print-method.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { Packaging } from './entities/packaging.entity';
import { TrackEvent } from './entities/track-event.entity';
import { ReturnRequest } from './entities/return-request.entity';
import { ReturnReason } from './entities/return-reason.entity';
import { SavedDesign } from './entities/saved-design.entity';
import { Favorite } from './entities/favorite.entity';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { RewardPoint } from './entities/reward-point.entity';
import { RewardCatalog } from './entities/reward-catalog.entity';
import { Contact } from './entities/contact.entity';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PackagingModule } from './modules/packaging/packaging.module';
import { SizesModule } from './modules/catalogs/sizes.module';
import { MaterialsModule } from './modules/catalogs/materials.module';
import { PrintMethodsModule } from './modules/catalogs/print-methods.module';
import { ReturnReasonsModule } from './modules/return-reasons/return-reasons.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { Asset } from './entities/asset.entity';
import { AssetDisposal } from './entities/asset-disposal.entity';
import { AssetsModule } from './modules/assets/assets.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Product,
      Category,
      Order,
      OrderItem,
      Review,
      Cart,
      CartItem,
      Address,
      Employee,
      InvitationCode,
      Material,
      Size,
      ColorOption,
      SkuVariant,
      Stock,
      StockMovement,
      ShipmentItem,
      Asset,
      AssetDisposal,
      Design,
      DesignAsset,
      DesignPlacement,
      PrintMethod,
      PaymentMethod,
      Payment,
      Shipment,
      Packaging,
      TrackEvent,
      ReturnRequest,
      ReturnReason,
      SavedDesign,
      Favorite,
      Voucher,
      UserVoucher,
      RewardPoint,
      RewardCatalog,
      Contact,
    ]),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    ReviewsModule,
    UsersModule,
    AddressesModule,
    PaymentMethodsModule,
    ShipmentsModule,
    DesignsModule,
    SkuVariantsModule,
    CustomizerModule,
    FavoritesModule,
    RewardsModule,
    VouchersModule,
    ContactModule,
    InventoryModule,
    PackagingModule,
    SizesModule,
    MaterialsModule,
    PrintMethodsModule,
    ReturnReasonsModule,
    EmployeesModule,
    AssetsModule,
    PaymentModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, Neo4jService],
})
export class AppModule {}
