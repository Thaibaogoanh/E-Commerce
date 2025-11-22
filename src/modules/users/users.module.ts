import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { Review } from '../../entities/review.entity';
import { SavedDesign } from '../../entities/saved-design.entity';
import { RewardPoint } from '../../entities/reward-point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Review,
      SavedDesign,
      RewardPoint,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}


