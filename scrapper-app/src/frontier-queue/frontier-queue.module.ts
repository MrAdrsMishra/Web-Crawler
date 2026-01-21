import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrontierService } from './frontier.service';
import { FrontierQueue } from './frontier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FrontierQueue])],
  providers: [FrontierService],
  exports: [FrontierService],
})
export class FrontierModule {}
