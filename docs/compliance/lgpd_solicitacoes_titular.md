# LGPD - Processo de solicitacoes de titulares (BarberSaaS)

Data: 2026-03-31
Objetivo: padronizar atendimento a solicitacoes de dados pessoais (acesso, correcao, exclusao, portabilidade e revogacao de consentimento).

## Escopo de dados pessoais (inventario resumido)

- User: name, email, phone, passwordHash, role, status, createdAt, updatedAt
- Barber: name, email, phone, photoUrl, specialty, status, userId (quando associado)
- Appointment: clientId, barberId, date, startTime, endTime, notes, price, status
- Payment: amount, method, status, paidAt
- PasswordResetToken: tokenHash, expiresAt, usedAt, createdAt
- EmailVerificationToken: tokenHash, expiresAt, usedAt, createdAt
- AppSetting: avaliar chaves que possam conter dado pessoal

## Canais de solicitacao

- Email de suporte: ithallo423@gmail.com
- Formulario no site: https://barbersaas.com.br/lgpd
- Registro interno: Trello (quadro "LGPD BarberSaaS")

## Verificacao de identidade

- Confirmar email e telefone do cadastro.
- Se necessario, confirmar ultima data de atendimento ou detalhes do agendamento.
- Nao compartilhar dados sem verificacao minima.

## Tipos de solicitacao e resposta

1. Confirmacao e acesso: exportar dados do titular (modelo abaixo).
2. Correcao: atualizar campos incorretos no cadastro.
3. Exclusao: aplicar anonimizacao e/ou retencao conforme politica (ver abaixo).
4. Portabilidade: entregar export em formato CSV/JSON.
5. Revogacao: desabilitar conta e remover consentimentos opcionais.

## Prazos

- Definir SLA com juridico e registrar prazo maximo por tipo.
- Registrar data de recebimento e data de resposta final.

## Procedimento tecnico - exportacao

- Consultar dados do titular:
  - User, Appointment, Payment, Barber (se aplicavel), Tokens.
- Exportar para CSV/JSON e armazenar em local seguro.
- Enviar somente para canal verificado.

## Procedimento tecnico - exclusao/anonimizacao (rastro minimo)

- Desativar usuario (status INACTIVE).
- Remover dados de contato (email/phone = null).
- Substituir nome por placeholder (ex: "Anon").
- Remover tokens ativos (PasswordResetToken/EmailVerificationToken).
- Revisar notas de agendamento e remover se contiver dados pessoais.
- Manter registros financeiros/operacionais agregados quando necessario (ver politica de retencao).

## Registro e auditoria

- Guardar logs do pedido: ID, data, tipo, responsavel, acao executada.
- Registrar evidencias de execucao (queries ou scripts executados).

## Observacoes

- Revisar este documento com juridico antes do go-live.
- Processo elaborado no Trello por Ithallo, Orlando e Vinicius.
- Se houver integracoes externas (email, WhatsApp, pagamentos), revisar processos de exclusao nesses provedores.
