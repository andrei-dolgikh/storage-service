import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [HttpModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}