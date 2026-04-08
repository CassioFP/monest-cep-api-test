import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { CepController } from './controllers/cep.controller';
import { CepModule } from './modules/cep.module';
import { AppService } from './app.service';

@Module({
  imports: [CepModule],
  controllers: [CepController],
  providers: [AppService],
})
export class AppModule {}
