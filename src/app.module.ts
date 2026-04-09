import { Module } from '@nestjs/common';
import { CepModule } from './modules/cep.module';

@Module({
  imports: [CepModule],
})
export class AppModule {}
