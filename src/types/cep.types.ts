export type Cep = {
  cep: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
  provider: string;
};

export interface CepProvider {
  getCep(cep: string): Promise<Cep>;
}

export type CepErrorLog = {
  errorName: string;
  cep: string;
  providerName: string;
  errorMessage?: string;
}
