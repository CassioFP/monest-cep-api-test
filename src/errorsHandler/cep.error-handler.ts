import { Logger } from '@nestjs/common';
import { CepProvider } from '../types/cep.types';
import { isTimeoutError } from '../helpers/request.helper';
import {
  ERRORS_ENUM,
  ALL_PROVIDERS_TIMEOUT,
  CEP_NOT_FOUND_MESSAGE,
} from '../constants/cep.constants';

export class CepErrorHandler {
  static logger = Logger;

  static handleFinalError(
    cep: string,
    timeoutCount: number,
    lastError: unknown,
    providers: CepProvider[],
  ): never {
    if (timeoutCount === providers.length) {
      this.logger.error(ERRORS_ENUM.ALL_PROVIDERS_TIMEOUT, { cep });
      throw new Error(ALL_PROVIDERS_TIMEOUT);
    }

    this.logger.error(ERRORS_ENUM.ALL_PROVIDER_FAILED, {
      cep,
      errorMessage:
        lastError instanceof Error ? lastError.message : ERRORS_ENUM.UNKNOWN,
    });
    throw new Error(ERRORS_ENUM.ALL_PROVIDER_FAILED);
  }

  static handleProviderError(
    err: unknown,
    provider: CepProvider,
    cep: string,
  ): { stopExecution: boolean; isTimeout: boolean } {
    const providerName = provider.constructor.name;
    const payload = { provider: providerName, cep };
    if (isTimeoutError(err)) {
      this.logger.error(ERRORS_ENUM.PROVIDER_TIMEOUT, payload);
      return { stopExecution: false, isTimeout: true };
    }
    const message = err instanceof Error ? err.message : ERRORS_ENUM.UNKNOWN;
    this.logger.error(ERRORS_ENUM.PROVIDER_FAILED, {
      ...payload,
      errorMessage: message,
    });

    if (err instanceof Error && err.message === CEP_NOT_FOUND_MESSAGE) {
      return { stopExecution: true, isTimeout: false };
    }

    return { stopExecution: false, isTimeout: false };
  }
}
