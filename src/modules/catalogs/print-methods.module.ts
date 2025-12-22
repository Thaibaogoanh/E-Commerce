import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintMethod } from '../../entities/print-method.entity';
import { PrintMethodsService } from './print-methods.service';
import { PrintMethodsController } from './print-methods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PrintMethod])],
  controllers: [PrintMethodsController],
  providers: [PrintMethodsService],
  exports: [PrintMethodsService],
})
export class PrintMethodsModule {}
