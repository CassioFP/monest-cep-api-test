import { Module } from '@nestjs/common';
import { CepService } from '../services/cep.service';
import { CepController } from 'src/controllers/cep.controller';
import { ViaCepProvider } from '../providers/cep/via-cep.provider';
import { BrasilApiProvider } from '../providers/cep/brasil-api.provider';
import { DiscoveryModule } from '@nestjs/core';
import { EmailService } from 'src/services/email.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ViaCepProvider, BrasilApiProvider, CepService, EmailService],
  controllers: [CepController],
})
export class CepModule {}
