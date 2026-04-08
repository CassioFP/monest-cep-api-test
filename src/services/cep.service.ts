import { Cep, CepProvider } from '../types/cep.types';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { CEP_PROVIDER } from 'src/decorators/cep.decorator';

@Injectable()
export class CepService {
  private providers: CepProvider[] = [];

  constructor(
    private discovery: DiscoveryService,
    private reflector: Reflector,
  ) {}

  onModuleInit() {
    const providers = this.discovery.getProviders();

    this.providers = providers
      .filter((provider) => {
        const instance: unknown = provider.instance;
        if (!instance) return false;

        return this.reflector.get(CEP_PROVIDER, instance.constructor);
      })
      .map((providerItem) => providerItem.instance as unknown)
      .filter((item) => this.isCepProvider(item));
  }

  async getCep(cep: string): Promise<Cep> {
    for (const provider of this.getShuffleProviders()) {
      try {
        return await provider.getCep(cep);
      } catch (err) {
        
      }
    }

    throw new Error('All providers failed');
  }

  getShuffleProviders(): Array<CepProvider> {
    const randomIndex = Math.floor(Math.random() * this.providers.length);

    return [
      this.providers[randomIndex],
      ...this.providers.filter((_, i) => i !== randomIndex),
    ];
  }

  isCepProvider(obj: unknown): obj is CepProvider {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!('getCep' in obj)) return false;

    const typedProviderCheck = obj as { getCep?: unknown };

    return typeof typedProviderCheck.getCep === 'function';
  }
}
