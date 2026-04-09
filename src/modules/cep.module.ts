import { Module } from '@nestjs/common';
import { CepService } from '../services/cep.service';
import { CepController } from 'src/controllers/cep.controller';
import { ViaCepProvider } from '../providers/cep/via-cep.provider';
import { BrasilApiProvider } from '../providers/cep/brasil-api.provider';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [ViaCepProvider, BrasilApiProvider, CepService],
  controllers: [CepController],
})
export class CepModule {}
