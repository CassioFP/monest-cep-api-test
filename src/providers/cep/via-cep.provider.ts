import { Injectable } from '@nestjs/common';
import { CepProviderDecorator } from 'src/decorators/cep.decorator';
import { Cep, CepProvider } from '../../types/cep.types';
import { REQUEST_TIMEOUT } from 'src/constants/cep.constants';
import { httpClient } from '../../shared/httpClient';
import { CEP_NOT_FOUND_MESSAGE } from 'src/constants/cep.constants';

type ViaCepApiResponse = {
  cep: string;
  logradouro: string;
  localidade: string;
  estado: string;
  bairro: string;
  erro?: boolean;
};

@CepProviderDecorator()
@Injectable()
export class ViaCepProvider implements CepProvider {
  async getCep(cep: string): Promise<Cep> {
    console.log('Consultando VIA CEP...');

    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const { data } = await httpClient.get<ViaCepApiResponse>(url, {
      timeout: REQUEST_TIMEOUT,
    });

    if (data.erro) {
      throw new Error(CEP_NOT_FOUND_MESSAGE);
    }

    return {
      cep: data.cep,
      street: data.logradouro,
      city: data.localidade,
      state: data.estado,
      neighborhood: data.bairro,
      provider: 'Via CEP',
    };
  }
}
