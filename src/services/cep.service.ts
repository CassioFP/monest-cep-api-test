import { Cep, CepProvider } from '../types/cep.types';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { CEP_PROVIDER } from '../decorators/cep.decorator';
import { CepErrorHandler } from '../errorsHandler/cep.error-handler';
import { EmailService } from './email.service';
import { ERRORS_ENUM } from '../constants/cep.constants';

@Injectable()
export class CepService {
  private providers: CepProvider[] = [];

  constructor(
    private discovery: DiscoveryService,
    private reflector: Reflector,
    private notificationService: EmailService,
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

  async getCep(receivedCep: string): Promise<Cep> {
    let lastError: unknown;
    let timeoutCount = 0;
    const cep = this.sanitizeCep(receivedCep);

    for (const provider of this.getShuffleProviders()) {
      try {
        return await provider.getCep(cep);
      } catch (err: unknown) {
        lastError = err;
        const result = CepErrorHandler.handleProviderError(err, provider, cep);
        if (result.stopExecution) {
          throw err;
        }

        if (result.isTimeout) {
          timeoutCount++;
        }
      }
    }

    if (timeoutCount === this.providers.length) {
      this.notificationService.send(ERRORS_ENUM.ALL_PROVIDERS_TIMEOUT, { cep });
    }

    return CepErrorHandler.handleFinalError(
      cep,
      timeoutCount,
      lastError,
      this.providers,
    );
  }

  private sanitizeCep(value: string): string {
    return value.replace(/[\s-]/g, '');
  }

  private getShuffleProviders(): Array<CepProvider> {
    const result = [...this.providers];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  private isCepProvider(obj: unknown): obj is CepProvider {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!('getCep' in obj)) return false;

    const typedProviderCheck = obj as { getCep?: unknown };

    return typeof typedProviderCheck.getCep === 'function';
  }
}
