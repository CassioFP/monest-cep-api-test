import { CepService } from '../services/cep.service';

describe('CepService', () => {
  let service: CepService;

  const mockProvider = (impl: Partial<any>) => ({
    getCep: jest.fn(),
    ...impl,
  });
  const mockEmailService = {
    send: jest.fn(),
  };

  it('should fallback when one provider times out', async () => {
    const timeoutError = { code: 'ECONNABORTED' };

    const provider1 = mockProvider({
      getCep: jest.fn().mockRejectedValue(timeoutError),
    });

    const provider2 = mockProvider({
      getCep: jest.fn().mockResolvedValue({ cep: '12345678' }),
    });

    service = new CepService({} as any, {} as any, mockEmailService);

    (service as any).providers = [provider1, provider2];

    jest.spyOn(service, 'getShuffleProviders').mockReturnValue([
      provider1,
      provider2,
    ]);
    const result = await service.getCep('12345678');

    expect(result).toEqual({ cep: '12345678' });
    expect(provider1.getCep).toHaveBeenCalled();
    expect(provider2.getCep).toHaveBeenCalled();
  });

  it('should throw when all providers timeout', async () => {
    const timeoutError = { code: 'ECONNABORTED' };

    const provider1 = mockProvider({
      getCep: jest.fn().mockRejectedValue(timeoutError),
    });

    const provider2 = mockProvider({
      getCep: jest.fn().mockRejectedValue(timeoutError),
    });

    service = new CepService({} as any, {} as any, mockEmailService);
    (service as any).providers = [provider1, provider2];

    jest.spyOn(service, 'getShuffleProviders').mockReturnValue([
      provider1,
      provider2,
    ]);
    await expect(service.getCep('12345678')).rejects.toThrow(
      'ALL_PROVIDERS_TIMEOUT',
    );

    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cep: '12345678' }),
    );
  });

  it('should return data when first provider succeeds', async () => {
    const provider1 = mockProvider({
      getCep: jest.fn().mockResolvedValue({ cep: '12345678' }),
    });

    const provider2 = mockProvider({
      getCep: jest.fn(),
    });

    service = new CepService({} as any, {} as any, mockEmailService);
    (service as any).providers = [provider1, provider2];

   jest.spyOn(service, 'getShuffleProviders').mockReturnValue([
      provider1,
      provider2,
    ]);
    
    const result = await service.getCep('12345678');

    expect(result).toEqual({ cep: '12345678' });
    expect(provider1.getCep).toHaveBeenCalled();
    expect(provider2.getCep).not.toHaveBeenCalled();
  });
});
