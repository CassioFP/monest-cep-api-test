import { Cep, CepProvider } from '../../types/cep.types';
import { REQUEST_TIMEOUT } from 'src/constants/cep.constants';
import { httpClient } from '../../shared/httpClient';

type ViaCepApiResponse = {
  cep: string;
  logradouro: string;
  localidade: string;
  estado: string;
  bairro: string;
  erro?: boolean;
};

export class ViaCepProvider implements CepProvider {
  async getCep(cep: string): Promise<Cep> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const { data } = await httpClient.get<ViaCepApiResponse>(url, {
      timeout: REQUEST_TIMEOUT,
    });

    if (data.erro) {
      throw new Error('NOT_FOUND');
    }

    return {
      cep: data.cep,
      street: data.logradouro,
      city: data.localidade,
      state: data.estado,
      neighborhood: data.bairro,
    };
  }
}
