import { SetMetadata } from '@nestjs/common';

export const CEP_PROVIDER = 'CEP_PROVIDER';

export const CepProviderDecorator = () => SetMetadata(CEP_PROVIDER, true);
