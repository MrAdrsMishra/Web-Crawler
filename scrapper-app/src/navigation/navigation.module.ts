import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Navigation } from './navigation.dto';

@Module({
    imports:[TypeOrmModule.forFeature(([Navigation]))],
})
export class NavigationModule {}
