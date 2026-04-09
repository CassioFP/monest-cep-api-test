import { Cep, CepProvider } from '../types/cep.types';
import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import {
  ALL_PROVIDERS_TIMEOUT,
  CEP_NOT_FOUND_MESSAGE,
} from '../constants/cep.constants';
import { CEP_PROVIDER } from '../decorators/cep.decorator';
import { ERRORS_ENUM } from '../constants/cep.constants';
import { isTimeoutError } from '../helpers/request.helper';

@Injectable()
export class CepService {
  private providers: CepProvider[] = [];
  private readonly logger = new Logger(CepService.name);

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

  async getCep(receivedCep: string): Promise<Cep> {
    let lastError: unknown;
    let timeoutCount = 0;
    const cep = this.sanitizeCep(receivedCep);

    for (const provider of this.getShuffleProviders()) {
      try {
        return await provider.getCep(cep);
      } catch (err: unknown) {
        lastError = err;
        const providerName = provider.constructor.name;
        const errorPayload = { provider: providerName, cep };

        if (isTimeoutError(err)) {
          timeoutCount++;

          this.logger.warn('Timeout error on provider', errorPayload);
        } else {
          this.logger.error(ERRORS_ENUM.PROVIDER_FAILED, {
            ...errorPayload,
            errorMessage:
              err instanceof Error ? err.message : ERRORS_ENUM.UNKNOWN,
          });
        }

        /**
          Se as fontes sao seguras e com tempo de atualizacao similar, entao podemos parar a execucao quando um CEP nao é encontrado,
          pois é possível que ele nao exista
        */
        if (err instanceof Error && err.message === CEP_NOT_FOUND_MESSAGE) {
          throw err;
        }
      }
    }

    if (timeoutCount === this.providers.length) {
      this.logger.error(ERRORS_ENUM.ALL_PROVIDERS_TIMEOUT, { cep });

      throw new Error(ALL_PROVIDERS_TIMEOUT);
    }

    this.logger.error(ERRORS_ENUM.ALL_PROVIDER_FAILED, {
      cep,
      lastError:
        lastError instanceof Error ? lastError.message : ERRORS_ENUM.UNKNOWN,
    });

    throw new Error(ERRORS_ENUM.ALL_PROVIDER_FAILED);
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
