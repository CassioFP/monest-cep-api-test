import { Injectable } from '@nestjs/common';
import { CepProviderDecorator } from 'src/decorators/cep.decorator';
import { Cep, CepProvider } from '../../types/cep.types';
import {
  CEP_NOT_FOUND_MESSAGE,
  REQUEST_TIMEOUT,
} from 'src/constants/cep.constants';
import { httpClient } from '../../shared/httpClient';

type BrasilApiResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};

@CepProviderDecorator()
@Injectable()
export class BrasilApiProvider implements CepProvider {
  async getCep(cep: string): Promise<Cep> {
    const url = `https://brasilapi.com.br/api/cep/v1/${cep}`;
    const { data } = await httpClient.get<BrasilApiResponse>(url, {
      timeout: REQUEST_TIMEOUT,
    });

    if (!data) {
      throw new Error(CEP_NOT_FOUND_MESSAGE);
    }

    return data;
  }
}
