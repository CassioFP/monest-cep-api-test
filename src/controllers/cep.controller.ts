import { Controller, Get, Param, HttpException } from '@nestjs/common';
import { CepService } from '../services/cep.service';

@Controller('cep')
export class CepController {
  constructor(private readonly service: CepService) {}

  @Get(':cep')
  async getCep(@Param('cep') cep: string) {
    try {
      return await this.service.getCep(cep);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        throw new HttpException('CEP not found', 404);
      }

      throw new HttpException('Service unavailable', 503);
    }
  }
}
