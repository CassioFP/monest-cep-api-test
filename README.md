# API para buscar dados de um CEP informado

## Requisitos
- ✅ Integrar com Via Cep
- ✅ Integrar com Brasil Api
- ✅ Escolher provider randomicamente
- ✅ Se um provider falhar, o outro deve ser utilizado automaticamente
- ✅ Tratar erros
- ✅ O retorno deve ser o mesmo independente do provider
- ✅ A inclusão de novos providers deve ser fácil e de mínimo impacto
- ✅ Observabilidade (utilização de logs pode ajudar)
- ✅ Diferenciar erros causados por timout

## Goals
- ✅ Sanitização dos CEPs
- ✅ Logs estruturados
- ✅ Injeção de dependência e providers
- ✅ Constantes reutilizáveis dentro do mesmo processo para facilitar a manutenção
- ✅ Alguns testes unitários

## Sobre a arquitetura
Utilizei separação por camadas, com paths para controllers, decorators, providers, services e etc., mas o modelo também poderia ser convertido em algo mais voltado para domínio.
Como NestJS faz parte da stack do teste, acabei optando por gastar um pouco mais de tempo investindo na utilização de injeção de dependências com providers e decorators.

## Para adicionar um novo provider


Adicione o provider em ```src/providers/cep```. Ele deve implementar CepProvider e, consequentemente, ter a função getCep.


Depois, adicione o provider nas configurações do módulo em ```src/modules/cep.module.ts```.
> O objetivo é isolar os providers, padronizar os contratos de entrada e saída e fazer com que o novo provider seja adicionado através de configurações, não de alterações em camadas de negócio.


Não esqueça de anotar no provider que ele faz parte do decorator e que pode ser usado através de injeção de dependência:
```
@CepProviderDecorator()
@Injectable()
```

## Logs
Os logs podem ser vistos no terminal que estará executando a aplicação.

Ao realizar uma pesquisa, ele mostrará qual API está sendo consultada no momento.

Se uma pesquisa retornar erro, ele será mostrado no terminal de forma estruturada e igual para qualquer provider.

## O que poderia ser melhor?
A escolha randômica poderia ser otimizada; às vezes caímos no mesmo provider mais de uma vez seguida.


Investir mais tempo na criação de uma classe para gerar os logs de forma centralizada. (implementado)

# Updates
- Geração de logs movida para ```src/errorsHandler/cep.error-handler.ts```
- Criação de serviço de envio de email fake para informar quando os providers estão dando timeout
- O serviço de envio de email pode ser facilmente reaproveitado para notificar em outros momentos
- Teste para garantir que ao receber timout de todos os providers o serviço de envio de emails é acionado