export type Cep = {
  cep: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
};

export interface CepProvider {
  getCep(cep: string): Promise<Cep>;
}
