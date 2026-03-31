# Checklist de Go-Live Publico

Status: execucao em andamento com itens P0 e P1 ja iniciados.
Data de criacao: 2026-03-25
Ultima atualizacao: 2026-03-31

## 1. Gate tecnico obrigatorio

- [x] `npm run build` sem erros
- [x] `npx tsc --noEmit` sem erros
- [x] `npm run lint` funcional e sem erro bloqueante
- [x] `npm audit` sem risco alto nao tratado
- [x] scripts de validacao documentados no `README`

## 2. Banco e ambiente

- [x] `.env.example` coerente com `docker-compose` e docs
- [x] variaveis obrigatorias validadas no boot
- [x] migracoes versionadas aplicadas com sucesso (validado em ambiente local tipo homologacao via Docker)
- [x] backup automatico configurado
- [x] restore testado em ambiente de homologacao (ciclo backup -> mutacao -> restore validado; RTO observado: `3.51s` em 2026-03-31)

## 3. Seguranca e autenticacao

- [x] sem fallback de segredo inseguro
- [x] sem senha padrao no codigo/UI/seed
- [x] rate limit em rotas de auth
- [x] lockout/protecao anti brute force
- [x] fluxo de verificacao de email no cadastro
- [x] politica de senha formalizada nas rotas e telas de senha
- [x] revisao de sessao/cookies finalizada

## 4. Funcionalidade critica de negocio

- [x] agendamento cliente funcionando ponta a ponta (validado por fluxo autenticado em Playwright homolog local)
- [x] remarcacao/cancelamento com regras corretas (validado por fluxo autenticado em Playwright homolog local)
- [x] fluxo admin sem dado demo fixo
- [x] notificacao email/WhatsApp com telemetria de entrega (snapshot por canal exposto no `/api/health`)
- [x] mensagens de erro reais (sem fallback ficticio em producao)

## 5. Qualidade e testes

- [x] testes unitarios de auth/sessao/disponibilidade
- [x] testes de API para fluxos criticos
- [x] smoke e2e em ambiente de homologacao (validado em ambiente local tipo homologacao com banco real no Docker)
- [x] cobertura minima definida e atingida
- [x] pipeline CI bloqueando merge em falha

## 6. Operacao e observabilidade

- [x] logs estruturados com correlacao por request
- [x] monitoramento de erros em runtime
- [x] monitoramento de latencia e taxa de erro
- [x] endpoint de healthcheck
- [x] alertas configurados (erro, indisponibilidade, fila)
- [x] runbook de incidente publicado
- [ ] Sentry/APM externo configurado com DSN e alertas on-call

## 7. Publico, SEO e UX

- [x] metadata completa por pagina principal (layouts de metadados por segmento principal)
- [x] robots e sitemap configurados
- [x] manifest e icones finalizados
- [x] validacao de acessibilidade minima (smoke automatizado com axe + Playwright)
- [x] revisao de performance em paginas chave (Lighthouse: home 96, entrar 99, cadastrar 99, termos 99, privacidade 99)

## 8. Legal e compliance

- [x] politica de privacidade publicada (versao inicial, pendente validacao juridica)
- [x] termos de uso publicados (versao inicial, pendente validacao juridica)
- [ ] tratamento de dados pessoais mapeado (LGPD) - doc inicial criado, pendente validacao juridica
- [ ] processo de solicitacao/exclusao de dados definido (draft em docs/compliance)

## 9. Release e acompanhamento

- [ ] plano de rollback aprovado (estrategia draft documentada em `docs/operacao/prisma7_upgrade_rollback.md`)
- [x] piloto tecnico Prisma 7 executado em homologacao local (upgrade + migrate + seed + smoke validados em 2026-03-31)
- [ ] janela de go-live definida
- [ ] plano de comunicacao com usuarios
- [ ] monitoramento intensivo por 7 dias apos lancamento
- [ ] reuniao de revisao pos go-live agendada
