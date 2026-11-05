import { Module } from '@nestjs/common';
import { DsaController } from './dsa.controller.js';
import { DsaRepository } from './dsa.repository.js';

@Module({
  controllers: [DsaController],
  providers: [DsaRepository],
})
export class DsaModule {}
