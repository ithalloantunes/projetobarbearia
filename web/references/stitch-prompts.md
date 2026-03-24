# Stitch IA Prompt Pack - BarberSaaS

Este arquivo contem prompts prontos para gerar interfaces no Stitch IA com consistencia visual e funcional.

## Como usar
1. Cole primeiro o `PROMPT 00` para definir o design system.
2. Depois cole um prompt de tela por vez (`PROMPT 01`, `PROMPT 02`, ...).
3. Sempre repita no inicio: `Use o mesmo design system do PROMPT 00`.

---

## PROMPT 00 - Base de Design System
```txt
Crie um design system para um SaaS de barbearia premium chamado BarberSaaS.

Direcao visual:
- sofisticado, masculino, moderno, premium
- limpo, sem excesso de elementos
- foco em contraste e legibilidade

Paleta:
- primary: #c59f59
- background-light: #f8f7f6
- background-dark: #1a1814
- surface-dark: #25221b
- text-dark: #0f172a
- text-light: #f8fafc
- success: #16a34a
- warning: #d97706
- danger: #dc2626

Tipografia:
- titulo: Inter, pesos 700 a 900
- corpo: Inter, pesos 400 a 600
- escalas: 12, 14, 16, 20, 24, 32, 48

Componentes obrigatorios:
- botao primario, secundario, ghost, danger
- input, textarea, select
- card com header e footer
- badge de status (confirmado, pendente, cancelado, concluido)
- tabela responsiva
- modal de confirmacao
- drawer lateral para mobile
- skeleton loading
- empty state
- toast de sucesso e erro

Interacoes:
- hover suave com transicao 200ms
- foco com anel visual claro (acessibilidade)
- estados disabled e loading

Responsividade:
- mobile first
- breakpoints para 360, 768, 1024, 1280

Acessibilidade:
- contraste AA
- labels em campos
- navegacao por teclado
- aria-label em icones sem texto
```

## PROMPT 01 - Landing Page Publica (`/`)
```txt
Use o mesmo design system do PROMPT 00.

Crie a landing page publica da BarberSaaS com:
- header fixo com logo, menu e CTA "Agendar agora"
- hero com titulo forte, subtitulo e dois botoes (Agendar / Ver portfolio)
- secao de servicos com cards e preco
- secao de barbeiros com avatar, especialidade e mini bio
- secao de depoimentos
- secao de localizacao e horario de funcionamento
- footer com links de privacidade, termos e redes

Comportamentos:
- CTA principal leva para /agendar
- layout premium com destaque em dourado (#c59f59)
- animacoes leves de entrada em cards
```

## PROMPT 02 - Autenticacao (Entrar e Cadastrar)
```txt
Use o mesmo design system do PROMPT 00.

Crie duas telas:
1) Entrar (/entrar)
2) Criar conta (/cadastrar)

Entrar:
- campos: email, senha
- checkbox "lembrar de mim"
- link "esqueci minha senha"
- botao primario "Entrar"
- botao secundario "Criar conta"

Cadastrar:
- campos: nome completo, email, telefone, senha, confirmar senha
- checkbox de termos
- botao primario "Criar conta"
- botao secundario "Ja tenho conta"

Estados:
- validacao inline
- loading no botao ao enviar
- feedback de erro de credenciais
- feedback de sucesso no cadastro
```

## PROMPT 03 - Recuperacao de Senha (`/esqueci-senha`, `/redefinir-senha`)
```txt
Use o mesmo design system do PROMPT 00.

Crie fluxo de recuperacao com duas telas:
1) Esqueci senha: campo email e CTA "Enviar link"
2) Redefinir senha: nova senha + confirmar senha + CTA "Salvar nova senha"

Inclua:
- bloco explicativo curto
- mensagens de sucesso e erro
- indicador de forca de senha
- link de retorno para /entrar
```

## PROMPT 04 - Agendamento Multi-etapas (`/agendar`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de agendamento em 4 passos:
1) selecionar servico
2) selecionar barbeiro
3) selecionar data e horario
4) confirmar dados

UI:
- barra de progresso por etapa
- cards de servico com duracao e preco
- lista horizontal de barbeiros (foto, nome, nivel)
- calendario + grade de horarios
- resumo fixo no rodape com valor total e botoes voltar/proximo

Estados:
- horario indisponivel
- aviso de conflito
- erro de backend amigavel
- sucesso com numero do agendamento
```

## PROMPT 05 - Cliente Dashboard (`/cliente`)
```txt
Use o mesmo design system do PROMPT 00.

Crie dashboard do cliente com:
- cabecalho com saudacao e botoes "Novo agendamento" e "Meu perfil"
- card de proximo atendimento (data, hora, barbeiro, servico)
- lista de historico de atendimentos
- filtros por status (confirmado, pendente, concluido, cancelado)
- acao rapida para remarcar ou cancelar

Estados:
- sem agendamentos (empty state com CTA)
- loading de lista
- erro ao carregar historico
```

## PROMPT 06 - Cliente Detalhe do Agendamento (`/cliente/agendamentos/[id]`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de detalhes do agendamento com:
- bloco principal com status, codigo do agendamento e dados completos
- timeline de eventos (criado, confirmado, concluido/cancelado)
- secao "Remarcar horario" com seletor de novos horarios
- botao de cancelamento com confirmacao em modal

Regras visuais:
- status com badges de cor
- acoes destrutivas destacadas em danger
- instrucoes claras para remarcar
```

## PROMPT 07 - Cliente Perfil (`/cliente/perfil`)
```txt
Use o mesmo design system do PROMPT 00.

Crie pagina de perfil do cliente:
- formulario com nome, email, telefone
- preferencias de notificacao (email/whatsapp)
- alterar senha (atual, nova, confirmar)
- salvar alteracoes

Inclua:
- feedback de sucesso ao salvar
- validacao de telefone no formato BR
- card lateral com resumo de conta (data de cadastro e total de agendamentos)
```

## PROMPT 08 - Barbeiro Agenda do Dia (`/barbeiro`)
```txt
Use o mesmo design system do PROMPT 00.

Crie dashboard operacional do barbeiro:
- abas de periodo (hoje, amanha, semana)
- lista de atendimentos por horario
- switch de status por atendimento (pendente -> em atendimento -> concluido)
- bloco de bloqueio de horario
- metricas do dia (total, concluidos, restantes)

Destaques:
- leitura rapida de agenda
- status muito visuais
- foco em operacao mobile
```

## PROMPT 09 - Barbeiro Disponibilidade Semanal (`/barbeiro/disponibilidade`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela para configurar disponibilidade semanal:
- dias da semana com toggle ativo/inativo
- faixas de horario por dia (inicio/fim)
- botao para adicionar nova faixa
- remover faixa
- salvar alteracoes

Inclua:
- validacao de sobreposicao de horarios
- aviso para dias sem disponibilidade
- resumo final antes de salvar
```

## PROMPT 10 - Admin Dashboard (`/admin`)
```txt
Use o mesmo design system do PROMPT 00.

Crie dashboard executivo para dono/gerente:
- metricas principais (receita mensal, novos clientes, agendamentos hoje, ticket medio)
- grafico de receita 6 meses
- tabela de proximos atendimentos
- alertas operacionais (atrasos, conflitos, pagamentos pendentes)

Layout:
- sidebar fixa no desktop
- header com busca global e atalho "Novo agendamento"
```

## PROMPT 11 - Admin Agenda (`/admin/agenda`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de agenda administrativa com:
- visao por dia/semana
- filtros por barbeiro e status
- tabela/lista de atendimentos
- acao de alterar status e forma de pagamento
- acao de cancelamento com motivo

Inclua:
- indicador visual de conflito de horario
- exportacao simples (csv/pdf como placeholders de acao)
```

## PROMPT 12 - Admin Clientes (`/admin/clientes`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de gestao de clientes:
- busca por nome/email/telefone
- tabela com nome, contato, total de visitas, ultimo atendimento, status
- detalhe lateral ao selecionar cliente
- acoes: editar, bloquear/desbloquear

Estados:
- sem resultados
- loading de busca
- erro em operacoes
```

## PROMPT 13 - Admin Equipe (`/admin/equipe`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de gestao da equipe de barbeiros:
- formulario "Novo barbeiro" (nome, email, telefone, especialidade)
- lista da equipe com status ativo/inativo
- acao de editar dados
- acao de ativar/desativar profissional
- indicador de performance basica (atendimentos no mes)

Inclua:
- validacoes de formulario
- feedback visual ao salvar
```

## PROMPT 14 - Admin Servicos (`/admin/servicos`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de catalogo de servicos:
- formulario para criar/editar servico (nome, preco, duracao, descricao, ativo)
- tabela de servicos com ordenacao por preco/duracao
- acao de ativar/desativar servico
- acao de excluir com confirmacao

Inclua:
- mascara de preco BRL
- duracao em minutos
- badges de status
```

## PROMPT 15 - Admin Relatorios (`/admin/relatorios`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de relatorios com:
- cards de KPI (faturamento, crescimento, ocupacao)
- grafico de receita mensal
- ranking de servicos mais vendidos
- performance por barbeiro
- seletor de periodo (7d, 30d, 90d, ano)

Inclua:
- comparativo vs periodo anterior
- destaque de variacao positiva/negativa
```

## PROMPT 16 - Admin Ajustes (`/admin/ajustes`)
```txt
Use o mesmo design system do PROMPT 00.

Crie tela de configuracoes da barbearia:
- dados da empresa (nome, telefone, email, endereco)
- horario de funcionamento por dia
- politica de cancelamento
- configuracoes de notificacao (email/whatsapp)
- salvar alteracoes

Inclua:
- validacao de campos obrigatorios
- aviso de alteracao nao salva
- confirmacao de sucesso apos salvar
```

---

## Prompt extra de consistencia para qualquer nova tela
```txt
Use o design system BarberSaaS ja definido.
Antes de gerar, mantenha consistencia com:
- botoes arredondados medium
- destaque primary #c59f59
- cards com borda suave e sombra leve
- foco em leitura rapida e operacao real (nao apenas layout bonito)
- estado de loading, empty e erro obrigatorios
```
