# DOCUMENTAÇÃO TÉCNICA DE PROJETO

## DESENVOLVIMENTO DE UM SISTEMA WEB PARA GESTÃO DE AGENDAMENTOS EM BARBEARIAS

**Instituição:** Faculdade de Tecnologia (FATEC)  
**Projeto:** BarberSaaS  
**Integrantes:** Ithallo Adriel Antunes; Vinicius Takeshi Saito Cardoso; Orlando Vieira Ribeiro Neto  
**Local:** São Paulo - SP  
**Ano:** 2026

---

# FOLHA DE ROSTO

## DESENVOLVIMENTO DE UM SISTEMA WEB PARA GESTÃO DE AGENDAMENTOS EM BARBEARIAS

Trabalho apresentado como documentação técnica do projeto BarberSaaS, elaborado a partir da estrutura do arquivo `Projeto-Exemplo-1.pdf` e adaptado integralmente ao contexto de um sistema web voltado à gestão de barbearias, com foco em agendamento online, organização da agenda dos profissionais, controle administrativo e melhoria da experiência do cliente.

O presente documento registra o planejamento do projeto, as áreas de conhecimento trabalhadas, as funcionalidades esperadas e implementadas, as tecnologias utilizadas, os riscos identificados, os papéis do time e o desenvolvimento prático do produto, mantendo a linha acadêmico-técnica observada no modelo de referência.

**Projeto:** BarberSaaS  
**Integrantes do grupo:** Ithallo Adriel Antunes; Vinicius Takeshi Saito Cardoso; Orlando Vieira Ribeiro Neto  
**Product Owner:** Dono da barbearia  
**Scrum Master:** Ithallo Adriel Antunes  
**Equipe de Desenvolvimento:** Orlando Vieira Ribeiro Neto; Vinicius Takeshi Saito Cardoso  
**Natureza do trabalho:** Documentação acadêmico-técnica de projeto de desenvolvimento de software  
**Versão do documento:** 2.2  
**Data de consolidação:** 16 de março de 2026

---

# LISTA DE FIGURAS

Figura 1 - Modelo EAP do Projeto  
Figura 2 - Espinha de Peixe: Atraso do Projeto  
Figura 3 - Espinha de Peixe: Indisponibilidade do Sistema  
Figura 4 - Gerenciamento de Recursos Humanos  
Figura 5 - Comunicação do Projeto  
Figura 6 - Tela de Login  
Figura 7 - Tela de Início  
Figura 8 - Tela de Seleção de Serviços  
Figura 9 - Tela de Seleção do Barbeiro  
Figura 10 - Tela de Seleção de Data e Horário  
Figura 11 - Tela de Confirmação de Agendamento  
Figura 12 - Tela de Visualizar Agenda do Barbeiro  
Figura 13 - Tela de Visualizar Bloqueios de Agenda  
Figura 14 - Tela de Visualizar Serviços  
Figura 15 - Tela de Visualizar Barbeiros  
Figura 16 - Tela do Painel Administrativo  
Figura 17 - Tela de Visualizar Agendamentos  
Figura 18 - Tela de Relatório de Atendimentos Diários  
Figura 19 - Código do front-end com Next.js  
Figura 20 - Código do back-end com Next.js API e Prisma

---

# LISTA DE TABELAS

Tabela 1 - Atividades Precedentes  
Tabela 2 - Custos por atividades do projeto  
Tabela 3 - Responsabilidades de Recursos Humanos  
Tabela 4 - Nível dos riscos

---

# SUMÁRIO

O sumário da versão em Word deste documento é gerado automaticamente pelo próprio Word, com base nos estilos de títulos aplicados ao corpo do texto, conforme exigido para a entrega final formatada.

---

# 1 INTRODUÇÃO

O projeto BarberSaaS tem como proposta o desenvolvimento de um sistema web capaz de apoiar o funcionamento diário de uma barbearia por meio de recursos de agendamento online, consulta de horários, organização da agenda dos profissionais, visualização administrativa de atendimentos e comunicação com o cliente. Trata-se de um produto pensado para transformar um processo que, na maior parte das vezes, ainda acontece de maneira informal, dispersa e manual, em um fluxo digital mais claro, confiável e profissional.

Em muitos estabelecimentos desse segmento, o contato com o cliente ainda ocorre por mensagens em redes sociais, ligações telefônicas, anotações em papel ou planilhas improvisadas. Embora esse modelo permita que o negócio funcione em um estágio inicial, ele se torna frágil à medida que a demanda aumenta. A marcação manual de horários favorece conflitos de agenda, esquecimentos, dificuldade para confirmar atendimentos, perda de histórico e baixa capacidade de acompanhamento da operação. Além disso, quando diferentes barbeiros atendem em horários distintos, a ausência de um sistema centralizado amplia os riscos de desorganização e impacta diretamente a experiência do cliente.

Foi diante desse cenário que surgiu a ideia do BarberSaaS. O sistema foi concebido para permitir que a barbearia tenha uma base única de controle, reunindo informações sobre serviços, profissionais, horários de disponibilidade, agendamentos realizados e possíveis comunicações automáticas. Ao mesmo tempo, o projeto procura oferecer ao cliente final uma experiência de uso mais simples e objetiva, em que a escolha do serviço, do barbeiro, da data e do horário possa ser feita por meio de uma interface web acessível, moderna e responsiva.

A construção do projeto também possui um caráter de organização de produto e de engenharia de software. Não se trata apenas de produzir telas visuais, mas de estruturar uma solução coerente, com banco de dados relacional, validação de regras de negócio, integração entre interface e back-end e preparação para futuras expansões, como autenticação, relatórios mais robustos, módulo financeiro e gestão completa de usuários. Dessa forma, o BarberSaaS foi pensado como um produto que já entrega valor em seu estado atual, mas que também apresenta base consistente para crescimento.

Outro aspecto relevante é o alinhamento entre o desenvolvimento técnico e a realidade do negócio. O sistema não foi desenhado como uma solução genérica de agenda, e sim como uma proposta especializada para o contexto de barbearias. Isso significa que os fluxos centrais consideram particularidades do setor, como a associação entre profissionais e serviços, a duração de cada atendimento, a necessidade de bloquear horários específicos e a importância de manter uma experiência de agendamento que seja rápida para o cliente e útil para quem administra o estabelecimento.

Este documento tem como finalidade registrar, de maneira ampla e detalhada, a visão do projeto, suas áreas de conhecimento, os requisitos levantados, os riscos previstos, os papéis da equipe, o planejamento geral e a materialização prática do sistema. A escrita foi organizada de forma a preservar a essência do documento-modelo utilizado como referência, priorizando texto corrido, explicação de contexto, descrição de funcionalidades e uso pontual de tabelas apenas nos trechos em que elas realmente são necessárias para apresentar dados estruturados.

Do ponto de vista formal, a organização deste documento procurou respeitar a lógica de apresentação acadêmica adotada pelas unidades da Fatec e as normas ABNT indicadas institucionalmente para trabalhos acadêmicos. Isso significa que, além do conteúdo técnico do projeto, também houve preocupação com estrutura, hierarquia de títulos, paginação, elementos pré-textuais, sumário automático e fechamento por referências.

---

# 2. GERENCIAMENTO DAS ÁREAS DE CONHECIMENTO

## 2.1 GERENCIAMENTO DA INTEGRAÇÃO

### 2.1.1 Escopo do Projeto

O escopo do projeto BarberSaaS compreende o desenvolvimento de um sistema web para gestão de agendamentos em barbearias, contemplando a experiência pública de apresentação do negócio, a jornada de agendamento do cliente, a organização das informações de barbeiros e serviços, a consulta de disponibilidade, o registro de agendamentos e a preparação de módulos operacionais voltados ao barbeiro e ao administrador. O objetivo não é apenas exibir uma interface atrativa, mas estruturar um produto funcional que organize a operação da barbearia de forma mais previsível e mais eficiente.

Controle de Versões

| Versão | Data | Autor | Notas da Revisão |
| --- | --- | --- | --- |
| 2.0 | 16/03/2026 | Ithallo Adriel Antunes, Vinicius Takeshi Saito Cardoso, Orlando Vieira Ribeiro Neto | Reestruturação completa do documento com foco em maior aderência ao modelo de referência e em desenvolvimento textual mais amplo. |

### 2.1.1.1 Objetivos deste documento

Este documento possui o objetivo de formalizar a visão do projeto, registrar as principais responsabilidades do time, consolidar requisitos iniciais, delimitar restrições, premissas e riscos, bem como apresentar de forma organizada as entregas pretendidas e o estado atual do desenvolvimento. Sua função também é servir como instrumento de alinhamento entre o time, o Product Owner e qualquer avaliador ou interessado que necessite compreender o que o sistema se propõe a resolver, como ele está estruturado e quais caminhos ainda existem para sua continuidade.

Além disso, o documento busca fornecer uma leitura completa do projeto, partindo do problema de negócio até a descrição das telas e dos componentes técnicos utilizados. Dessa maneira, ele cumpre um papel não apenas administrativo, mas também explicativo, permitindo que o leitor entenda o raciocínio do time ao construir a solução.

### 2.1.1.2 Situação atual e justificativa do projeto

O projeto, em seu estado atual, já apresenta uma base funcional importante. Há uma página inicial institucional, uma jornada de agendamento estruturada em etapas, rotas de API para listagem de serviços e barbeiros, consulta de disponibilidade e criação de agendamentos, além de um modelo de banco de dados consistente com o domínio do problema. Também existem telas específicas para um painel de barbeiro e para um painel administrativo, embora esses módulos ainda estejam em fase de consolidação e não estejam totalmente integrados a dados dinâmicos em todos os pontos.

A situação atual demonstra que o produto já saiu do nível meramente conceitual e entrou em uma fase prática de implementação. As principais regras de negócio relacionadas ao agendamento já foram modeladas, especialmente no que diz respeito ao cálculo de disponibilidade e à prevenção de conflitos de horário. Isso significa que a essência operacional do sistema já foi tratada. Contudo, ainda permanecem lacunas importantes, como a ausência de uma autenticação formal, a necessidade de ampliar o nível de integração dos painéis e a consolidação futura de funcionalidades administrativas mais completas.

A justificativa do projeto está diretamente ligada à necessidade de profissionalização do processo de atendimento em uma barbearia. Quando o fluxo de marcação de horários depende de mensagens dispersas, da memória dos profissionais ou de registros informais, o negócio se torna vulnerável a falhas que poderiam ser evitadas com apoio tecnológico. Um sistema centralizado melhora a rastreabilidade das informações, reduz ambiguidades, ajuda a organizar a rotina da equipe e transmite uma imagem mais profissional ao cliente.

Também se justifica o projeto pela oportunidade de reunir em uma mesma solução diferentes camadas da operação do estabelecimento. O BarberSaaS não se limita a marcar horários. Ele se propõe a ser um ponto de integração entre catálogo de serviços, gestão de profissionais, definição de disponibilidade, agenda operacional e visão gerencial. Essa amplitude torna o projeto mais relevante e o aproxima de uma solução real de mercado, mesmo que sua versão atual ainda esteja em processo de amadurecimento.

### 2.1.1.3 Objetivos SMART e critérios de sucesso do projeto

O projeto será considerado bem-sucedido se conseguir cumprir sua proposta central de transformar o agendamento da barbearia em um fluxo digital mais simples, seguro e organizado. Para isso, os objetivos precisam ser claros, observáveis e relacionados a resultados concretos.

Os objetivos principais do projeto são os seguintes:

- disponibilizar um fluxo funcional de agendamento online em que o cliente consiga escolher serviço, barbeiro, data e horário sem depender de atendimento manual;
- garantir que a agenda do barbeiro respeite disponibilidade, duração do serviço e horários já ocupados, impedindo conflitos de marcação;
- estruturar o sistema de modo que as informações relevantes da barbearia fiquem centralizadas e preparadas para expansão futura;
- oferecer interfaces separadas para a visão pública, para a rotina do profissional e para a administração do negócio;
- deixar o projeto tecnicamente organizado, com código reutilizável, banco de dados consistente e base apropriada para novas funcionalidades.

O sucesso do projeto também será medido por critérios qualitativos. A solução deverá apresentar navegação compreensível, boa leitura visual, coerência entre interface e regras de negócio e capacidade de evolução. Um sistema que funcione, mas que seja difícil de manter, ou que não esteja preparado para ampliar suas funcionalidades, atenderia apenas parcialmente ao objetivo do trabalho.

### 2.1.1.4 Estrutura Analítica do Projeto - Fases e principais entregas

#### Figura 1 - Modelo EAP do Projeto

A estrutura analítica do projeto pode ser compreendida a partir de cinco grandes fases: análise, modelagem, desenvolvimento, validação e implantação evolutiva. Cada uma dessas fases representa um conjunto de atividades articuladas entre si e tem papel importante no amadurecimento do produto.

Na fase de análise, foi necessário compreender o funcionamento esperado do sistema, identificar os principais atores envolvidos, distinguir as necessidades do dono da barbearia e delimitar o que seria prioridade na primeira versão do produto. Essa etapa também foi responsável por definir o backlog inicial e por orientar as primeiras decisões de arquitetura.

Na fase de modelagem, o foco se concentrou na estrutura dos dados e nas regras essenciais do domínio. Foi nesse momento que passaram a ser definidos os conceitos de usuário, barbeiro, serviço, disponibilidade, bloqueio de agenda, agendamento e pagamento. A modelagem foi importante para garantir que o crescimento do sistema ocorresse sobre uma base consistente, evitando improvisações futuras.

Na fase de desenvolvimento, a equipe trabalhou tanto na camada visual quanto na camada de lógica de negócio. A página inicial, o fluxo de agendamento e as rotas de API foram desenvolvidos de forma integrada. Ao mesmo tempo, surgiram os painéis voltados ao barbeiro e à administração, ainda que com diferentes níveis de maturidade.

Na fase de validação, o sistema passou a ser observado à luz dos requisitos centrais: se os serviços podiam ser listados, se os barbeiros eram corretamente apresentados, se os horários disponíveis eram calculados sem conflito e se um agendamento válido podia ser confirmado. A validação também envolve perceber o que ainda precisa ser concluído e tratar isso como parte natural do processo de evolução.

Por fim, a implantação evolutiva representa o entendimento de que o projeto não se encerra com a primeira entrega funcional. Ao contrário, ele estabelece uma base pronta para autenticação, gestão de usuários, relatórios, bloqueios persistentes, pagamentos e integração mais rica com a operação da barbearia.
### 2.1.1.5 Principais requisitos das principais entregas/produtos

1. Fazer Login  
1.1. Como usuário do sistema, eu quero poder acessar uma área restrita, para que apenas pessoas autorizadas possam consultar ou alterar informações internas da barbearia.  
1.2. Como administrador, eu quero que o sistema diferencie permissões de acesso, para que cada perfil visualize apenas o que lhe compete.  
1.3. Como dono do negócio, eu quero que a autenticação seja segura e clara, para evitar acessos indevidos e preservar os dados da operação.

2. Manter Serviço  
2.1. Como usuário do sistema, eu quero ver a listagem dos serviços cadastrados, com nome, descrição, preço e duração, para poder consultá-los com facilidade.  
2.2. Como administrador, eu quero poder adicionar novos serviços, para ampliar o catálogo ofertado pela barbearia.  
2.3. Como administrador, eu quero editar ou inativar serviços já existentes, para manter as informações corretas e atualizadas.  
2.4. Como usuário do sistema, eu quero pesquisar e localizar serviços rapidamente, para tornar a gestão mais prática.

3. Manter Barbeiro  
3.1. Como administrador, eu quero visualizar todos os barbeiros cadastrados, com suas especialidades e contatos, para organizar a equipe.  
3.2. Como administrador, eu quero cadastrar novos barbeiros, para associar profissionais ao sistema.  
3.3. Como administrador, eu quero editar ou desativar barbeiros, para manter a agenda coerente com a realidade operacional da barbearia.  
3.4. Como usuário do sistema, eu quero consultar o profissional por nome ou especialidade, para facilitar a localização.

4. Agendar Atendimento  
4.1. Como cliente, eu quero escolher um serviço antes de selecionar o horário, para que a agenda considere o tempo real do atendimento.  
4.2. Como cliente, eu quero escolher um barbeiro específico ou a opção de atendimento com qualquer profissional disponível, para ter flexibilidade na marcação.  
4.3. Como cliente, eu quero selecionar uma data disponível, para visualizar as possibilidades reais de agendamento.  
4.4. Como cliente, eu quero confirmar o agendamento com um resumo claro da minha escolha, para ter segurança sobre o atendimento marcado.

5. Consultar Disponibilidade  
5.1. Como cliente, eu quero ver apenas horários disponíveis, para não tentar marcar um atendimento em um período já ocupado.  
5.2. Como barbeiro, eu quero que o sistema respeite minha disponibilidade previamente definida, para que minha agenda seja coerente com meus horários de trabalho.  
5.3. Como administrador, eu quero que o sistema leve em consideração a duração do serviço e os agendamentos existentes, para impedir conflitos na agenda.

6. Manter Bloqueio de Horário  
6.1. Como barbeiro, eu quero bloquear horários específicos da agenda, para poder reservar tempo para almoço, intervalo, folga ou imprevistos.  
6.2. Como administrador, eu quero visualizar os bloqueios cadastrados, para entender melhor a ocupação e indisponibilidade da equipe.  
6.3. Como sistema, eu quero impedir que horários bloqueados apareçam como disponíveis ao cliente.

7. Manter Usuário  
7.1. Como administrador, eu quero cadastrar usuários do sistema, para controlar quem pode acessar as áreas internas.  
7.2. Como administrador, eu quero associar papéis e níveis de acesso, para que haja diferenciação entre cliente, barbeiro e administrador.  
7.3. Como administrador, eu quero editar ou desativar usuários, para manter o ambiente seguro e atualizado.

8. Consultar Agendamentos  
8.1. Como administrador, eu quero ver a listagem de agendamentos realizados, para acompanhar a operação da barbearia.  
8.2. Como administrador, eu quero filtrar agendamentos por data, barbeiro ou cliente, para localizar informações com mais rapidez.  
8.3. Como barbeiro, eu quero visualizar meus atendimentos do dia, para organizar minha rotina de trabalho.

9. Painel do Barbeiro  
9.1. Como barbeiro, eu quero visualizar a agenda do dia em uma interface própria, para acompanhar meus próximos atendimentos.  
9.2. Como barbeiro, eu quero identificar atendimentos pendentes, em andamento e concluídos, para manter o controle da rotina.  
9.3. Como barbeiro, eu quero distinguir visualmente horários livres e horários bloqueados, para ter clareza sobre minha ocupação.

10. Painel Administrativo  
10.1. Como dono da barbearia, eu quero ter uma visão geral dos atendimentos e indicadores do negócio, para apoiar decisões operacionais.  
10.2. Como administrador, eu quero acompanhar agendamentos do dia e movimentação da agenda, para agir rapidamente em caso de ajustes.  
10.3. Como gestor, eu quero enxergar o sistema como um painel de apoio à organização da barbearia, e não apenas como uma agenda.

11. Relatórios  
11.1. Como gestor, eu quero visualizar os atendimentos por período, para compreender a ocupação da barbearia.  
11.2. Como gestor, eu quero estimar a receita associada aos agendamentos, para ter uma visão inicial de desempenho.  
11.3. Como gestor, eu quero identificar os serviços mais procurados, para apoiar decisões comerciais e promocionais.

12. Notificações  
12.1. Como cliente, eu quero receber a confirmação do agendamento, para ter certeza de que minha reserva foi registrada.  
12.2. Como barbearia, eu quero enviar mensagens por e-mail ou WhatsApp, para melhorar a comunicação com o cliente.  
12.3. Como sistema, eu quero tentar notificar o cliente sempre que um agendamento for confirmado, desde que as integrações externas estejam configuradas.

13. Sair do Sistema  
13.1. Como usuário autenticado, eu quero encerrar minha sessão, para preservar a segurança de acesso ao sistema em dispositivos compartilhados.

### 2.1.1.6 MARCOS

| Fase | Marcos | Previsão |
| --- | --- | --- |
| Análise | Levantamento do problema, entendimento do fluxo da barbearia e consolidação inicial do backlog | 18/03/2026 |
| Modelagem | Estrutura do banco de dados, definição das entidades e regras de disponibilidade concluídas | 25/03/2026 |
| Desenvolvimento | APIs centrais e fluxo principal de agendamento implementados | 05/04/2026 |
| Validação | Revisão do comportamento da agenda, testes do fluxo de marcação e ajuste dos módulos parciais | 12/04/2026 |
| Implantação evolutiva | Consolidação da documentação, geração da versão acadêmico-técnica e preparação para novas entregas | 16/04/2026 |

### 2.1.1.7 PARTES INTERESSADAS DO PROJETO

| Categoria | Nome | Função |
| --- | --- | --- |
| Product Owner | Dono da barbearia | Define as necessidades do negócio, valida prioridades e acompanha a aderência do sistema à realidade da operação |
| Scrum Master | Ithallo Adriel Antunes | Garante a organização do processo, o alinhamento do time e a evolução do projeto de forma estruturada |
| Scrum Team | Orlando Vieira Ribeiro Neto; Vinicius Takeshi Saito Cardoso | Equipe de desenvolvimento responsável pela implementação técnica do sistema |

### 2.1.1.8 RESTRIÇÕES

Infraestrutura: será necessário manter um ambiente de banco de dados funcional e um ambiente de aplicação capaz de executar a solução web com estabilidade. Embora o projeto esteja em fase acadêmica e de prototipação evolutiva, sua natureza depende de uma estrutura mínima de execução.

Credenciais externas: para que as notificações por e-mail e WhatsApp funcionem corretamente, será necessário configurar variáveis de ambiente e credenciais válidas. Sem isso, o fluxo de agendamento pode continuar operando, porém sem a etapa completa de comunicação automatizada.

Autenticação: a arquitetura do sistema já prevê papéis de usuário, mas a camada formal de autenticação ainda não se encontra totalmente implementada. Essa restrição afeta principalmente os módulos administrativos e internos.

Tempo de projeto: o desenvolvimento precisa ocorrer dentro de um intervalo de tempo compatível com a capacidade do time, o que exige priorização de entregas e definição clara do que pertence ou não à primeira versão.

### 2.1.1.9 PREMISSAS

Parte-se da premissa de que a barbearia possui uma rotina de trabalho baseada em horários, profissionais e serviços com duração definida. Essa característica é fundamental para que o cálculo de disponibilidade faça sentido e para que a agenda possa ser automatizada de forma confiável.

Também se assume que o Product Owner acompanhará o projeto de forma ativa, aprovando prioridades, esclarecendo necessidades e validando as decisões mais relevantes. Como o sistema está voltado a um contexto de negócio bastante específico, a colaboração do responsável pelo estabelecimento é essencial para a qualidade da solução.

Outra premissa importante é que o sistema será evoluído gradualmente. Isso significa que nem todos os módulos precisam nascer completos na primeira etapa, desde que a base estrutural esteja preparada para essa expansão. O projeto foi pensado exatamente com essa lógica: entregar valor inicial e, ao mesmo tempo, preparar o caminho para futuras melhorias.

### 2.1.1.10 RISCOS

1. Atraso do projeto: por mudanças de escopo, dependências técnicas ou ajustes de prioridade, o cronograma pode sofrer impacto.  
2. Falha na integração entre telas e dados reais: módulos visuais podem permanecer mais avançados do que a camada de integração, gerando descompasso entre o que é demonstrado e o que está efetivamente operacional.  
3. Ausência de credenciais externas: a não configuração dos serviços de notificação pode reduzir parte do valor percebido pelo cliente.  
4. Falta de autenticação formal: enquanto essa camada não estiver concluída, certas áreas do sistema permanecem conceitualmente prontas, mas não totalmente seguras para uso real.  
5. Crescimento excessivo do escopo: a tentativa de cobrir todos os módulos de uma só vez pode comprometer a qualidade da entrega principal.  
6. Dependência de revisão manual: sem uma rotina mais completa de testes e validações, alguns ajustes podem ser identificados apenas em fases posteriores.

### 2.1.1.11 ORÇAMENTO DO PROJETO

Para o desenvolvimento do projeto do início ao fim, considerando planejamento, modelagem, implementação, revisão técnica, geração de documentação e preparação de infraestrutura mínima, estima-se um custo aproximado de R$12.000,00. Esse valor é entendido como uma estimativa de esforço global do projeto e não como contrato comercial fechado, servindo principalmente como referência para dimensionamento do trabalho.

## 2.2 GERENCIAMENTO DO ESCOPO

O gerenciamento do escopo do BarberSaaS procura garantir que o sistema seja desenvolvido com foco naquilo que realmente agrega valor à operação da barbearia. Isso significa priorizar os elementos centrais do produto, como o fluxo de agendamento, a organização de barbeiros e serviços, a consulta de disponibilidade e a preparação de visões administrativas e operacionais.

O escopo da primeira versão contempla a experiência institucional do site, o fluxo público de escolha de serviço e horário, a criação de agendamentos, o modelo de dados relacional, a estrutura de notificações e a base visual dos painéis internos. Em contrapartida, funcionalidades como autenticação completa, CRUD administrativo integral de usuários e relatórios mais sofisticados são tratadas como continuidade planejada e não como dependência para validar o valor da solução atual.

### 2.2.1 REQUISITOS ÁGEIS

Nessa seção são retomados os requisitos em forma de histórias de usuário, organizados de maneira lógica para compor o backlog do produto. A intenção é preservar a visão incremental do projeto, facilitando a identificação daquilo que precisa ser entregue primeiro e daquilo que pode ser evoluído posteriormente.

1. Fazer Login  
1.1. Como usuário interno do sistema, eu quero acessar um ambiente autenticado, para que as funcionalidades administrativas não fiquem expostas ao público.  
1.2. Como administrador, eu quero controlar permissões por perfil, para diferenciar cliente, barbeiro e gestor.

2. Manter Serviço  
2.1. Como administrador, eu quero cadastrar, editar e inativar serviços, para manter o catálogo da barbearia atualizado.  
2.2. Como cliente, eu quero visualizar os serviços com clareza, para fazer minha escolha com mais confiança.

3. Manter Barbeiro  
3.1. Como administrador, eu quero cadastrar barbeiros e associar especialidades, para organizar o atendimento da equipe.  
3.2. Como cliente, eu quero escolher o profissional desejado, para personalizar meu agendamento.

4. Agendar Atendimento  
4.1. Como cliente, eu quero selecionar serviço, barbeiro, data e horário, para concluir meu agendamento de forma objetiva.  
4.2. Como sistema, eu quero validar conflitos antes de confirmar a reserva, para garantir consistência da agenda.

5. Consultar Disponibilidade  
5.1. Como cliente, eu quero visualizar apenas horários realmente livres, para não perder tempo tentando reservar um período indisponível.  
5.2. Como barbearia, eu quero que a disponibilidade seja calculada com base na agenda real, para reduzir erros de operação.

6. Manter Bloqueios  
6.1. Como barbeiro, eu quero bloquear horários de forma simples, para organizar pausas, ausências e imprevistos.  
6.2. Como sistema, eu quero respeitar esses bloqueios durante a consulta da agenda.

7. Consultar Agendamentos  
7.1. Como administrador, eu quero consultar os agendamentos realizados, para acompanhar a rotina do negócio.  
7.2. Como barbeiro, eu quero enxergar meus atendimentos do dia em uma tela própria.

8. Visualizar Indicadores  
8.1. Como dono da barbearia, eu quero ver indicadores resumidos no painel administrativo, para ter uma leitura rápida da operação.  
8.2. Como gestor, eu quero usar essas informações como apoio à tomada de decisão.

9. Enviar Notificações  
9.1. Como cliente, eu quero receber confirmação do meu agendamento, para ter segurança sobre minha marcação.  
9.2. Como barbearia, eu quero automatizar esse contato, para profissionalizar a comunicação.

10. Gerar Relatórios  
10.1. Como gestor, eu quero acompanhar atendimentos por período, serviços mais procurados e receita estimada, para entender melhor o desempenho da barbearia.

### 2.2.2 ESTRUTURA ANALÍTICA DO PROJETO

A estrutura analítica do projeto está diretamente ligada à forma como a equipe decidiu tratar a evolução do sistema. Em vez de concentrar todos os esforços em uma entrega única e fechada, o projeto foi pensado em camadas, permitindo que a solução nascesse com um núcleo funcional e depois recebesse incrementos.

Primeiramente, foi necessário compreender o problema e escrever as histórias de usuário. Em seguida, organizou-se a modelagem de dados para que as decisões de interface e de API não fossem tomadas sem sustentação estrutural. Depois disso, a equipe passou a implementar o sistema de modo incremental, colocando a jornada de agendamento como foco principal. Em paralelo, foram sendo preparados os módulos administrativos e operacionais. Esse encadeamento faz com que o projeto preserve coerência interna e reduza a chance de retrabalho.

## 2.3 GERENCIAMENTO DO TEMPO

O gerenciamento do tempo do projeto foi elaborado considerando a complexidade relativa de cada etapa e a necessidade de manter uma sequência lógica entre análise, modelagem, desenvolvimento e validação. Assim como no documento-modelo, a visão de tempo não é tratada apenas como uma lista de datas, mas como um encadeamento de atividades que dependem umas das outras.

A) Atividade de levantamento de requisitos - 3 dias  
- compreender o funcionamento esperado da barbearia;  
- levantar com o Product Owner as necessidades essenciais da primeira versão;  
- identificar atores, fluxos e restrições do produto.

B) Atividade de documentação dos requisitos ágeis - 4 dias  
- organizar as histórias de usuário;  
- estruturar o backlog do produto;  
- registrar prioridades iniciais.

C) Atividade de modelar o banco de dados - 3 dias  
- definir entidades principais;  
- registrar relacionamentos;  
- preparar a base para as regras do sistema.

D) Atividade de modelar as regras de disponibilidade - 2 dias  
- definir como serviços, horários e barbeiros se relacionam;  
- estabelecer o comportamento esperado para slots livres e bloqueados.

E) Atividade de estruturar a aplicação - 2 dias  
- organizar a base do projeto em Next.js;  
- preparar ambiente, diretórios, estilos e conexão inicial.

F) Atividade de desenvolvimento das APIs principais - 4 dias  
- implementar serviços, barbeiros, disponibilidade e agendamentos;  
- validar entradas e saídas do sistema.

G) Atividade de seed e dados iniciais - 2 dias  
- preparar dados de demonstração;  
- facilitar testes de navegação e uso do sistema.

H) Atividade de desenvolvimento do fluxo principal - 12 dias  
- construir a página inicial;  
- desenvolver a jornada de agendamento;  
- integrar as telas às rotas de API.

I) Atividade de desenvolvimento dos módulos internos - 6 dias  
- preparar o painel do barbeiro;  
- estruturar o painel administrativo;  
- alinhar a interface com a futura expansão do sistema.

J) Atividade de notificações e ajustes - 3 dias  
- configurar envio por e-mail;  
- estruturar envio por WhatsApp;  
- revisar mensagens e comportamento do fluxo.

K) Atividade de validação funcional - 3 dias  
- testar o fluxo de agendamento;  
- revisar regras de disponibilidade;  
- ajustar inconsistências observadas.

L) Atividade de documentação final - 4 dias  
- consolidar as áreas de conhecimento;  
- descrever funcionalidades, riscos e planejamento;  
- gerar a versão acadêmico-técnica da documentação.

Tabela 1 - Atividades Precedentes

| Atividades | Atividades Precedentes | Duração (Dias) |
| --- | --- | --- |
| A | --- | 3 |
| B | A | 4 |
| C | B | 3 |
| D | B | 2 |
| E | B | 2 |
| F | C e D | 4 |
| G | C | 2 |
| H | E, F e G | 12 |
| I | H | 6 |
| J | H | 3 |
| K | I e J | 3 |
| L | K | 4 |

O tempo total estimado do projeto é de 39 dias úteis de esforço organizado, considerando a execução sequencial das atividades centrais e pequenas interseções entre tarefas complementares. Naturalmente, esse tempo pode sofrer adaptação conforme a necessidade do Product Owner e a evolução real do sistema.
## 2.4 GERENCIAMENTO DO CUSTO

O gerenciamento do custo foi pensado como uma estimativa global de esforço, considerando principalmente o tempo da equipe, a necessidade de infraestrutura, a preparação do ambiente e a produção da documentação. Ainda que o projeto tenha natureza acadêmica e de desenvolvimento incremental, a estimativa de custo é importante para dar noção de valor agregado, esforço investido e dimensão da solução.

Tabela 2 - Custos por atividades do projeto

| Atividade | Custo |
| --- | --- |
| Atividade de Levantamento de Requisitos | R$ 800,00 |
| Atividade de Documentação dos requisitos ágeis | R$ 900,00 |
| Atividade de Modelar o Banco de Dados | R$ 1.000,00 |
| Atividade de Estruturar a Aplicação | R$ 1.200,00 |
| Atividade de Desenvolver APIs principais | R$ 2.400,00 |
| Atividade de Desenvolver o fluxo de agendamento | R$ 2.800,00 |
| Atividade de Desenvolver módulos internos | R$ 1.600,00 |
| Atividade de Integrar notificações | R$ 700,00 |
| Atividade de Validar funcionalidades | R$ 800,00 |
| Atividade de Elaborar documentação final | R$ 900,00 |
| CUSTO FINAL | R$ 13.100,00 |

## 2.5 GERENCIAMENTO DE QUALIDADE

O gerenciamento de qualidade do BarberSaaS está relacionado tanto à qualidade técnica do código quanto à qualidade percebida na experiência de uso. O sistema precisa ser coerente em sua lógica interna, mas também precisa ser compreensível para quem agenda e útil para quem administra a rotina da barbearia.

Na prática, a qualidade do projeto depende de alguns fatores principais: clareza da arquitetura, consistência dos dados, boa definição das regras de disponibilidade, separação adequada entre camadas da aplicação, previsibilidade do comportamento do sistema e organização suficiente para que futuras melhorias não comprometam o que já foi construído. Também é parte da qualidade admitir com transparência o que já está implementado e o que ainda não se encontra concluído, evitando apresentar como finalizado aquilo que ainda está em evolução.

### 2.5.1 PDCAS

No projeto BarberSaaS, a lógica do PDCA pode ser observada ao longo do próprio ciclo de construção do produto.

No momento de planejar, a equipe se concentrou em entender o problema, definir o backlog e delimitar a primeira versão do sistema. Esse planejamento foi importante para impedir dispersão de esforço e para escolher o agendamento como eixo principal do produto.

No momento de executar, passaram a ser desenvolvidas as telas, as rotas de API, a modelagem do banco e as integrações iniciais do projeto. Nessa fase, a equipe transformou o conjunto de requisitos em uma solução navegável e estruturada tecnicamente.

No momento de checar, observou-se se o comportamento do sistema estava coerente com as histórias de usuário levantadas, sobretudo na marcação de horários, no cálculo da disponibilidade e na consistência dos dados salvos. Essa etapa é essencial porque permite perceber se a solução, de fato, atende ao problema que se propôs a resolver.

No momento de agir, são feitos os ajustes necessários, sejam eles de interface, de regra de negócio ou de arquitetura. É justamente essa etapa que prepara o projeto para continuar evoluindo, de modo que o aprendizado obtido com a implementação atual não se perca.

### 2.5.6 DIAGRAMAS DE CAUSA E EFEITO

#### Figura 2 - Espinha de Peixe: Atraso do Projeto

O atraso do projeto pode decorrer de fatores humanos, técnicos e organizacionais. Entre as causas possíveis estão o aumento indevido do escopo, a tentativa de desenvolver muitos módulos ao mesmo tempo, a ausência de refinamento do backlog, a falta de validação contínua com o Product Owner e a necessidade de retrabalho por integração incompleta entre telas e APIs. Ao reconhecer essas causas, a equipe se prepara para trabalhar com entregas incrementais, revisar prioridades e proteger a qualidade do núcleo funcional do sistema.

#### Figura 3 - Espinha de Peixe: Indisponibilidade do Sistema

A indisponibilidade do sistema pode surgir por fatores de infraestrutura, conexão com banco de dados, falhas em variáveis de ambiente, interrupção de serviços externos ou problemas em regras críticas do agendamento. Também devem ser considerados riscos ligados à hospedagem futura e à ausência de autenticação em ambientes reais. O tratamento desse tipo de risco passa por organização da base, revisão das configurações, atenção à infraestrutura e manutenção constante da coerência técnica do projeto.

## 2.6 GERENCIAMENTO DE RECURSOS HUMANOS

#### Figura 4 - Gerenciamento de Recursos Humanos

O gerenciamento de recursos humanos no projeto BarberSaaS foi estruturado com base na divisão de papéis do Scrum e na distribuição de responsabilidades ao longo do ciclo de desenvolvimento. O Product Owner é representado pelo dono da barbearia, que orienta o produto a partir da realidade do negócio. O Scrum Master é Ithallo Adriel Antunes, responsável por apoiar a organização do processo, facilitar a condução do projeto e garantir que as prioridades estejam alinhadas. A equipe de desenvolvimento é composta por Orlando Vieira Ribeiro Neto e Vinicius Takeshi Saito Cardoso, responsáveis pela execução técnica da solução.

Ainda que os papéis estejam formalmente distribuídos, o projeto possui caráter colaborativo. Isso significa que documentação, validação e organização das entregas também dependem de cooperação entre os integrantes. Em projetos de pequeno porte, essa flexibilidade é importante, desde que a responsabilidade principal de cada frente permaneça clara.

Tabela 3 - Responsabilidades de Recursos Humanos

| Setor | Responsável | Função |
| --- | --- | --- |
| Levantamento de Requisitos | Ithallo Adriel Antunes | Conduzir o entendimento do problema, organizar as histórias de usuário e manter alinhamento com o Product Owner |
| Documentação | Ithallo Adriel Antunes, Vinicius Takeshi Saito Cardoso, Orlando Vieira Ribeiro Neto | Registrar requisitos, decisões do projeto, estrutura do sistema e evolução da solução |
| Desenvolvimento | Orlando Vieira Ribeiro Neto, Vinicius Takeshi Saito Cardoso | Codificar as funcionalidades do sistema, organizar APIs, interface e persistência |
| Teste e Validação | Toda a equipe | Verificar aderência dos fluxos ao backlog, revisar consistência das funcionalidades e apontar ajustes |
| Implantação Evolutiva | Toda a equipe | Preparar o projeto para continuidade, documentação final e futuras melhorias |

## 2.7 GERENCIAMENTO DE COMUNICAÇÕES

A comunicação do projeto é tratada como um elemento essencial para o seu avanço. A relação entre Product Owner, Scrum Master e equipe de desenvolvimento precisa ser suficientemente fluida para que dúvidas sejam esclarecidas com rapidez, prioridades sejam redefinidas quando necessário e o sistema permaneça aderente ao que o negócio realmente precisa.

No contexto do BarberSaaS, a comunicação com o Product Owner ocorre a partir da validação das necessidades da barbearia, da confirmação das prioridades do backlog e da observação de como o sistema deve apoiar a operação do estabelecimento. A comunicação interna do time se concentra na definição de tarefas, divisão das atividades técnicas, revisão das decisões de modelagem e acompanhamento da evolução dos módulos.

As decisões importantes precisam ser documentadas, porque o projeto não deve depender apenas da memória dos integrantes. Sempre que uma funcionalidade é redefinida, que uma restrição se torna mais clara ou que uma nova prioridade é assumida, isso deve ser refletido no documento do projeto e na organização do backlog. Essa prática fortalece a consistência do trabalho e reduz ruídos durante a continuidade do sistema.

#### Figura 5 - Comunicação do Projeto

No projeto, a comunicação horizontal ocorre entre o dono da barbearia, o Scrum Master e os membros da equipe, especialmente quando se discute o que precisa ser entregue, o que deve ser ajustado e quais prioridades precisam ser preservadas. Já a comunicação vertical se manifesta principalmente quando requisitos são traduzidos em atividades práticas de desenvolvimento e quando os resultados do trabalho retornam ao Product Owner em forma de validação.

## 2.8 GERENCIAMENTO DE RISCOS

1. Atraso do projeto: por eventualidades, redefinições ou dificuldades técnicas, o projeto pode sofrer alterações no cronograma.  
a. Proposta: trabalhar com entregas incrementais, proteção do núcleo funcional do sistema e revisão constante das prioridades.

2. Falta de integração completa entre interface e back-end: algumas telas podem evoluir visualmente mais rápido do que sua integração real com dados.  
a. Proposta: priorizar integrações essenciais, especialmente nos painéis internos, e evitar considerar como pronto aquilo que ainda é apenas protótipo visual.

3. Sistema parcialmente dependente de configuração externa: o uso de e-mail e WhatsApp depende de credenciais válidas.  
a. Proposta: manter fallback seguro, documentar variáveis de ambiente e não acoplar a conclusão do agendamento ao sucesso da notificação.

4. Ausência de autenticação completa: sem uma camada consolidada de login, algumas áreas internas ainda não estão adequadas para uso real em produção.  
a. Proposta: tratar autenticação como prioridade das próximas entregas e manter transparência documental sobre esse ponto.

5. Instabilidade de infraestrutura: conexão com banco, ambiente local e futura hospedagem podem impactar o funcionamento do sistema.  
a. Proposta: manter ambiente controlado, revisar configurações, preparar backups e pensar a publicação futura com infraestrutura minimamente confiável.

6. Crescimento indevido do escopo: tentar resolver todas as dores da barbearia em uma única etapa pode comprometer prazo e qualidade.  
a. Proposta: manter backlog organizado, definir versão prioritária e só expandir o sistema sobre uma base já estável.

Tabela 4 - Nível dos riscos

| Risco | Alto | Médio | Baixo |
| --- | --- | --- | --- |
| 1 – Atraso do Projeto | X |  |  |
| 2 – Integração incompleta entre módulos | X |  |  |
| 3 – Dependência de credenciais externas |  | X |  |
| 4 – Ausência de autenticação completa | X |  |  |
| 5 – Instabilidade de infraestrutura |  | X |  |
| 6 – Crescimento indevido do escopo |  | X |  |

## 2.9 GERENCIAMENTO DAS AQUISIÇÕES E CONTRATOS

Esta área se aplica de forma reduzida ao projeto. O BarberSaaS, em seu estágio atual, não depende de uma estrutura contratual complexa, mas exige entendimento de futuras necessidades de aquisição relacionadas a domínio, hospedagem, ambiente de banco de dados em produção, serviço SMTP e integração de mensageria. Assim, embora não exista neste momento um bloco robusto de aquisições e contratos, a continuidade do sistema para uso real exigirá definição cuidadosa desses elementos.

---

# 3 DESENVOLVIMENTO PRÁTICO DO PROJETO

## 3.1 METODOLOGIAS/ FERRAMENTAS/ TECNOLOGIAS/ TÉCNICAS/ CÓDIGO

O projeto BarberSaaS foi organizado com foco em processo ágil, especialmente com inspiração nas práticas do Scrum. Essa escolha se justifica porque o sistema depende de refinamento contínuo, validação frequente com o Product Owner e capacidade de adaptação conforme o entendimento da rotina da barbearia amadurece. Em vez de apostar em uma construção totalmente fechada desde o início, a equipe trabalhou com a lógica de entrega incremental, concentrando primeiro as funcionalidades de maior valor.

Do ponto de vista técnico, o projeto foi estruturado como uma aplicação full stack em Next.js. Essa escolha favorece a concentração do front-end e do back-end em uma mesma base de projeto, simplificando a organização de código e reduzindo o custo de integração. O uso de React e TypeScript contribui para modularidade, reusabilidade e legibilidade. Já o Tailwind CSS oferece rapidez para construção visual e ajuda a manter consistência entre as telas.

No back-end, a solução faz uso de rotas internas da própria aplicação em conjunto com o Prisma ORM. Essa combinação se mostrou adequada para o domínio do sistema, principalmente porque o projeto depende de entidades bem definidas e relacionamentos claros entre usuários, barbeiros, serviços, disponibilidades e agendamentos. O banco MySQL foi escolhido por sua maturidade, ampla utilização em aplicações web e boa aderência a modelos relacionais.

Também merece destaque a forma como a lógica crítica foi tratada. O cálculo de disponibilidade não foi espalhado pelas telas, mas concentrado em uma biblioteca específica, o que fortalece a manutenção e reduz o risco de inconsistência. Essa decisão é importante porque a disponibilidade é o coração do sistema de agendamento. Se essa lógica estiver errada, todo o produto perde confiabilidade.

As tecnologias e ferramentas utilizadas no projeto incluem:

- Next.js como base geral da aplicação;
- React para construção das interfaces;
- TypeScript para tipagem e organização do código;
- Tailwind CSS para estilização;
- Prisma ORM para modelagem e acesso ao banco;
- MySQL como banco de dados relacional;
- Zod para validação de entrada nas rotas;
- Nodemailer para envio de e-mails;
- API HTTP para envio de mensagens por WhatsApp;
- Docker Compose para disponibilização local do banco de dados;
- Git para organização e versionamento do código.

Do ponto de vista de técnica de desenvolvimento, a equipe procurou manter uma base de código com responsabilidade relativamente bem separada. As páginas, as bibliotecas auxiliares e a modelagem de persistência foram mantidas em locais distintos, reduzindo o acoplamento entre interface, regra de negócio e banco. Essa organização é fundamental para que o projeto continue crescendo sem se tornar confuso.

Como apoio complementar de estudo e implementação, a equipe também se apoiou em documentações técnicas oficiais das principais tecnologias adotadas no projeto. Esse material foi importante para consolidar decisões relacionadas à estrutura full stack do Next.js, à construção de interfaces em React, à modelagem relacional com Prisma ORM, à persistência em MySQL e à padronização visual com Tailwind CSS. No plano acadêmico, a organização formal do documento considerou ainda as orientações de normalização divulgadas por unidades da própria Fatec.
## 3.2 FUNCIONALIDADES

### 3.2.1 Tela de Login

A estrutura deste documento mantém a seção de login para preservar a lógica do modelo de referência. No contexto do BarberSaaS, a autenticação formal ainda se encontra em planejamento e estruturação, mas sua existência é considerada essencial para a maturidade do produto. A modelagem do sistema já prevê papéis diferentes para cliente, barbeiro e administrador, o que indica que a base conceitual do login está presente, mesmo que a tela definitiva ainda não esteja concluída.

Uma tela de login adequada terá papel importante no futuro do sistema, pois será responsável por limitar acesso às áreas internas, proteger dados operacionais e permitir comportamentos diferentes conforme o perfil do usuário. Isso é especialmente necessário quando se considera o painel do barbeiro, o painel administrativo e a manutenção de dados sensíveis do negócio.

#### Figura 6 - Tela de Login

Na versão evolutiva prevista, a tela de login deverá apresentar autenticação simples, clara e compatível com o nível de maturidade do restante do sistema, servindo como porta de entrada para os módulos internos da aplicação.

### 3.2.2 Tela de Início

A tela de início corresponde à página pública principal do sistema e tem a função de apresentar a identidade da barbearia, seus serviços, seus profissionais e seus diferenciais. Trata-se de uma tela estratégica, pois ela não apenas dá contexto ao usuário, mas também funciona como ponto de partida para a conversão em agendamento.

A página foi pensada para cumprir dois papéis ao mesmo tempo. O primeiro é institucional: mostrar a proposta de valor da barbearia, transmitir profissionalismo e destacar serviços e equipe. O segundo é funcional: conduzir o usuário, de maneira natural, para a etapa de marcação de horário. Essa combinação é importante porque aproxima comunicação e operação, evitando que o site seja apenas informativo ou apenas utilitário.

#### Figura 7 - Tela de Início

A tela de início representa a porta de entrada do BarberSaaS e estabelece a ponte entre a imagem da barbearia e a funcionalidade principal do sistema, que é o agendamento online.

### 3.2.3 Agendar Atendimento

O fluxo de agendamento é o núcleo prático do projeto. Toda a lógica do sistema converge, de alguma forma, para essa experiência, já que é nela que o cliente interage com os serviços, visualiza os profissionais, escolhe um horário livre e formaliza um atendimento. Por esse motivo, o desenvolvimento dessa funcionalidade recebeu atenção especial da equipe.

O processo foi estruturado em etapas, o que reduz a complexidade percebida pelo cliente e facilita a validação do próprio sistema. Em vez de pedir todas as informações de uma só vez, a interface conduz o usuário por escolhas sucessivas e coerentes, fazendo com que cada decisão influencie a seguinte. Assim, o sistema se torna mais intuitivo e também mais consistente do ponto de vista técnico.

#### 3.2.3.1 Tela de Seleção de Serviços

Nesta etapa, o cliente visualiza os serviços disponíveis e escolhe aquele que deseja agendar. Essa escolha é importante porque não se trata apenas de identificar o tipo de atendimento, mas também de informar ao sistema a duração esperada da reserva, o preço associado ao serviço e o contexto do agendamento.

Os serviços são apresentados com nome, descrição, valor e tempo estimado. Essa organização oferece ao cliente uma leitura clara daquilo que está contratando e ajuda a reduzir ambiguidades durante o processo de marcação.

#### Figura 8 - Tela de Seleção de Serviços

A tela de seleção de serviços representa o início efetivo do fluxo de agendamento e define a base para o cálculo posterior da disponibilidade.

#### 3.2.3.2 Tela de Seleção do Barbeiro

Depois de selecionar o serviço, o cliente pode escolher o profissional que realizará o atendimento. Essa etapa é importante porque muitas vezes o vínculo com o barbeiro influencia diretamente a experiência do cliente. Ao mesmo tempo, o sistema também oferece flexibilidade para quando o usuário deseja apenas encontrar um horário livre, independentemente do profissional.

A seleção do barbeiro afeta diretamente a disponibilidade exibida na etapa seguinte, pois cada profissional possui sua própria agenda, seus próprios atendimentos e seus próprios períodos livres.

#### Figura 9 - Tela de Seleção do Barbeiro

A tela de seleção do barbeiro personaliza a experiência do cliente e conecta a escolha do atendimento à agenda real de cada profissional.

#### 3.2.3.3 Tela de Seleção de Data

A escolha da data organiza a busca pelo atendimento em um horizonte próximo, simples e prático. Em vez de exigir do usuário uma navegação complexa por múltiplos meses, o sistema trabalha com uma janela de datas suficiente para a maioria das reservas comuns da barbearia.

Essa decisão melhora a usabilidade do fluxo e diminui a carga cognitiva do cliente. Ao mesmo tempo, também simplifica a comunicação com a API de disponibilidade, uma vez que a data é padronizada para a consulta posterior.

#### 3.2.3.4 Tela de Seleção de Horário

Com serviço, barbeiro e data já definidos, o sistema consulta a disponibilidade real e retorna apenas os horários livres. Essa etapa traduz para o cliente o resultado de toda a lógica de agenda existente no back-end. Não se trata de uma lista estática, mas de um conjunto de horários calculados a partir da disponibilidade semanal, dos bloqueios já existentes, dos agendamentos registrados e da duração do serviço escolhido.

É justamente aqui que se manifesta uma das decisões técnicas mais importantes do BarberSaaS: impedir que a interface mostre horários que o sistema não será capaz de confirmar. Isso protege a experiência do usuário e reforça a confiança no produto.

#### Figura 10 - Tela de Seleção de Data e Horário

A tela de seleção de data e horário materializa a integração entre interface e regra de negócio, exibindo ao cliente somente os slots válidos para reserva.

#### 3.2.3.5 Tela de Confirmação de Agendamento

Ao final do fluxo, o sistema apresenta um resumo daquilo que foi escolhido: serviço, profissional, data, horário e valor estimado. Essa etapa é importante porque oferece ao cliente uma última validação visual antes da confirmação.

No momento da confirmação, a aplicação envia os dados ao back-end, que valida novamente a entrada, localiza as entidades relacionadas, confirma a disponibilidade do horário e registra o agendamento. Em seguida, o sistema tenta disparar notificações ao cliente, quando as credenciais externas estão disponíveis.

#### Figura 11 - Tela de Confirmação de Agendamento

A tela de confirmação fecha o fluxo principal do sistema e transforma a escolha do usuário em um agendamento efetivamente persistido.

### 3.2.4 Painel do Barbeiro

O painel do barbeiro foi pensado para oferecer ao profissional uma visão direta de sua rotina de atendimento. Mais do que uma lista de horários, essa tela deve funcionar como uma leitura operacional do dia, permitindo que o barbeiro reconheça rapidamente seus compromissos, seus períodos disponíveis e eventuais bloqueios.

Embora o módulo ainda tenha pontos em evolução, sua importância é grande dentro do projeto, porque ele representa a passagem do sistema de uma lógica apenas comercial para uma lógica também operacional. Com esse painel, o produto deixa de ser apenas um formulário de agendamento para o cliente e se aproxima de um verdadeiro sistema de gestão do dia a dia da barbearia.

#### 3.2.4.1 Encontrar Agendamentos do Dia

Uma das funções mais importantes do painel é permitir que o barbeiro enxergue seus compromissos por período, começando principalmente pelo dia atual. Essa visão simplifica a organização do trabalho e reduz a necessidade de consultar fontes paralelas para saber o que está marcado.

#### 3.2.4.2 Selecionar um Atendimento

Além de listar os atendimentos, o painel foi concebido para facilitar a identificação de cada cliente, serviço e horário. Com isso, o profissional consegue reconhecer rapidamente a sequência do seu dia e se preparar melhor para cada atendimento.

#### 3.2.4.3 Tela de Visualizar Agenda do Barbeiro

A visualização da agenda organiza a informação em elementos de leitura rápida, permitindo distinguir horários livres, horários reservados, atendimentos em andamento e tarefas concluídas. Essa clareza visual é importante porque o painel precisa funcionar em um contexto de rotina, e não apenas como elemento de demonstração técnica.

#### Figura 12 - Tela de Visualizar Agenda do Barbeiro

A tela de agenda do barbeiro representa a leitura operacional do sistema a partir da perspectiva do profissional.

### 3.2.5 Consultar Disponibilidade

A consulta de disponibilidade é uma funcionalidade central e também uma das mais sensíveis do projeto. Ela conecta dados de diferentes naturezas — serviço, duração, profissional, agenda semanal, bloqueios e atendimentos já agendados — para entregar um resultado confiável ao cliente.

Mais do que uma funcionalidade isolada, a disponibilidade é o mecanismo que sustenta a credibilidade do sistema. Se ela estiver incorreta, o projeto perde valor. Por isso, a equipe concentrou essa lógica em um ponto específico do back-end, evitando duplicidade de regras e facilitando a manutenção futura.

#### 3.2.5.1 Tela de Visualizar Horários Disponíveis

Embora não exista uma tela isolada apenas para disponibilidade, o trecho da interface em que os horários são exibidos cumpre exatamente esse papel. O cliente enxerga apenas o conjunto de opções que ainda podem ser reservadas, o que torna a experiência mais objetiva e reduz frustração durante o processo de marcação.

### 3.2.6 Bloquear Horário

O bloqueio de horários é uma funcionalidade importante para que o sistema respeite a realidade da agenda do barbeiro. Nem todo horário livre é, necessariamente, um horário disponível para atendimento. Existem pausas, intervalos, deslocamentos e outras situações que precisam ser contempladas na rotina do profissional.

O projeto já considera essa necessidade na modelagem de dados, o que é um sinal positivo de maturidade da solução. Ainda que a interface de manutenção completa de bloqueios esteja em evolução, a lógica do domínio já reconhece essa necessidade.

#### 3.2.6.1 Tela de Visualizar Bloqueios de Agenda

O painel do barbeiro já apresenta visualmente o conceito de horário bloqueado, permitindo distinguir um período indisponível de um agendamento efetivo. Essa diferenciação é importante porque ajuda a interpretar corretamente a agenda do dia.

#### Figura 13 - Tela de Visualizar Bloqueios de Agenda

A representação dos bloqueios de agenda evidencia que o sistema não trabalha apenas com horários ocupados, mas também com períodos deliberadamente indisponíveis.

### 3.2.7 Manter Serviço

O módulo de serviços é um dos pilares do sistema, porque praticamente todas as etapas posteriores dependem dele. A barbearia precisa manter um catálogo organizado, com nomes compreensíveis, preços definidos e duração estimada de cada atendimento.

A existência desse módulo também favorece a expansão futura do produto, pois abre espaço para diferenciação de pacotes, combos, promoções e organização mais refinada do portfólio de serviços.

#### 3.2.7.1 Tela de Visualizar Serviços

Na experiência pública, os serviços são apresentados como parte da identidade da barbearia e também como porta de entrada para o agendamento. No fluxo interno, eles são tratados como dados de negócio e precisam ser consistentes para que as regras funcionem corretamente.

#### Figura 14 - Tela de Visualizar Serviços

A visualização dos serviços aproxima a proposta comercial do negócio da lógica operacional do sistema.

### 3.2.8 Manter Barbeiro

O módulo de barbeiros organiza os profissionais da equipe e permite associá-los aos serviços que executam. Ele também se conecta à disponibilidade e aos agendamentos, tornando-se uma peça central do modelo de dados.

Ao manter esse módulo bem estruturado, o sistema consegue refletir melhor a realidade da barbearia, permitindo que o cliente escolha o profissional desejado e que o gestor tenha controle sobre a equipe vinculada à agenda.

#### 3.2.8.1 Tela de Visualizar Barbeiros

Na interface pública, os barbeiros aparecem como parte da vitrine do negócio. Na lógica do sistema, eles são elementos centrais para definição da agenda. Essa dupla função torna o módulo especialmente relevante.

#### Figura 15 - Tela de Visualizar Barbeiros

A tela de visualização dos barbeiros reforça a personalização do atendimento e estrutura a ligação entre cliente, profissional e agenda.
### 3.2.9 Painel Administrativo

O painel administrativo foi pensado como uma visão gerencial resumida do negócio. Em vez de apresentar apenas listas extensas de registros, a ideia é entregar ao responsável pela barbearia um quadro geral da operação, com indicadores e sinais visuais capazes de apoiar decisões cotidianas.

No estado atual do projeto, esse painel já possui linguagem visual coerente e apresenta o caminho para uma futura consolidação com dados reais. Sua importância está em traduzir o produto não apenas como ferramenta de agendamento, mas como base de gestão.

#### 3.2.9.1 Tela de Visualizar Indicadores Gerenciais

Essa tela deverá permitir leitura rápida de agendamentos do dia, faturamento estimado, novos clientes e movimentação de serviços. Mesmo quando ainda se encontra em fase parcial, ela já cumpre o papel de orientar a próxima expansão do sistema.

#### Figura 16 - Tela do Painel Administrativo

A tela administrativa representa a camada gerencial do BarberSaaS e demonstra o potencial do sistema como ferramenta de apoio à gestão da barbearia.

### 3.2.10 Manter Usuário

O módulo de usuários é uma necessidade natural da evolução do sistema. Ele se relaciona diretamente à autenticação, à autorização e ao controle de papéis. Mesmo que ainda não esteja completo em termos de interface e fluxo operacional, ele já está previsto no modelo de dados e faz parte da visão do produto.

Sua relevância se amplia conforme o sistema passa a atender usuários com perspectivas diferentes. Um cliente precisa acessar informações distintas das de um barbeiro, e ambas são diferentes daquilo que um administrador deve visualizar e controlar.

#### 3.2.10.1 Tela de Visualizar Perfis e Papéis do Sistema

A futura tela de visualização de usuários deverá permitir consultar perfis, papéis, status e dados básicos de acesso. Essa funcionalidade será importante para consolidar a segurança e a governança da aplicação.

### 3.2.11 Consultar Agendamentos

A consulta de agendamentos já possui base funcional por meio da API. Isso significa que o projeto já é capaz de recuperar registros com filtros específicos, ainda que a interface visual correspondente não esteja totalmente consolidada em um módulo dedicado.

Do ponto de vista da gestão, essa funcionalidade é fundamental. É por meio dela que o sistema pode se tornar uma ferramenta de acompanhamento real da operação, permitindo localizar reservas, verificar movimentos por data e entender melhor o fluxo de atendimento da barbearia.

#### 3.2.11.1 Tela de Visualizar Agendamentos Cadastrados

A tela de visualização de agendamentos deverá reunir, em um só lugar, os atendimentos registrados, permitindo filtros por período, profissional e cliente. Ela representa um passo importante para transformar o núcleo já construído em um ambiente administrativo mais completo.

#### Figura 17 - Tela de Visualizar Agendamentos

A visualização dos agendamentos consolida a relação entre o fluxo público do cliente e a gestão interna da barbearia.

### 3.2.12 Relatórios

O módulo de relatórios ainda se encontra em estágio planejado, mas já possui base lógica suficiente para ser desenvolvido com consistência. Como o sistema registra serviço, profissional, valor e data do agendamento, ele já reúne informações suficientes para produzir leituras gerenciais relevantes.

Relatórios não devem ser vistos apenas como gráficos bonitos, mas como instrumentos de interpretação do negócio. Em uma barbearia, compreender quais serviços são mais procurados, quais dias concentram maior procura e qual receita potencial está associada aos atendimentos pode influenciar decisões de promoção, escala de equipe e estratégia comercial.

#### 3.2.12.1 Tela de Relatório de Atendimentos Diários

Esse relatório deverá mostrar a quantidade de atendimentos por dia e por faixa de horário, permitindo ao gestor entender o ritmo da operação e identificar períodos de maior ou menor movimento.

#### Figura 18 - Tela de Relatório de Atendimentos Diários

O relatório de atendimentos diários representa uma das formas mais diretas de leitura da ocupação da barbearia.

#### 3.2.12.2 Tela de Relatório de Receita Estimada

Uma vez que o sistema armazena o preço do serviço no momento do agendamento, torna-se possível somar esses valores e produzir uma estimativa de receita por período. Esse tipo de relatório é especialmente relevante para o acompanhamento gerencial do negócio.

#### 3.2.12.3 Tela de Relatório de Serviços Mais Procurados

Ao relacionar a frequência dos serviços agendados, o sistema poderá apontar quais atendimentos possuem maior adesão e quais podem demandar ações estratégicas para aumentar sua procura.

### 3.2.13 Código Fonte

O código-fonte do BarberSaaS foi organizado para sustentar crescimento progressivo, mantendo separação razoável entre páginas, rotas de API, bibliotecas auxiliares e persistência. Essa organização é importante porque o projeto, por sua natureza, depende de evolução constante.

#### 3.2.13.1 Front-end com Next.js e React

No front-end, destacam-se a página inicial, o fluxo de agendamento, o painel do barbeiro e o painel administrativo. A combinação entre Next.js, React, TypeScript e Tailwind CSS favoreceu a construção de uma interface moderna, responsiva e relativamente modular.

#### Figura 19 - Código do front-end com Next.js

O front-end do projeto evidencia a preocupação com componentes reutilizáveis, experiência do usuário e clareza visual.

#### 3.2.13.2 Back-end com Next.js API, Prisma e MySQL

No back-end, o projeto concentra suas regras principais em rotas próprias da aplicação e em bibliotecas de domínio, especialmente na lógica de disponibilidade e criação de agendamentos. O Prisma foi utilizado para dar sustentação à modelagem relacional e à comunicação com o banco MySQL.

#### Figura 20 - Código do back-end com Next.js API e Prisma

O back-end do projeto reúne validação, persistência e regras de negócio essenciais para a confiabilidade do agendamento.

---

# 4 CONSIDERAÇÕES FINAIS

O projeto BarberSaaS demonstra que é possível construir uma solução web especializada para o contexto de barbearias a partir de um núcleo funcional bem definido, mesmo que nem todos os módulos estejam concluídos ao mesmo tempo. O trabalho realizado até aqui evidencia um caminho de desenvolvimento coerente, em que a equipe priorizou aquilo que tem maior impacto sobre o problema principal do negócio: a organização do agendamento.

Ao longo do documento, foi possível observar que o sistema já apresenta pontos fortes relevantes. Entre eles, destacam-se a modelagem de dados adequada ao domínio, a separação das principais entidades do negócio, a construção de APIs específicas para o fluxo de agendamento, a implementação da lógica de disponibilidade e a existência de interfaces distintas para cliente, barbeiro e administração. Esses elementos mostram que o projeto não foi tratado de forma superficial, mas pensado como uma solução que combina experiência visual, regra de negócio e capacidade de evolução.

Também se tornou claro que o projeto ainda possui frentes abertas. A autenticação precisa ser formalizada, os painéis internos necessitam de maior integração com dados reais, o módulo de usuários precisa amadurecer e os relatórios ainda devem ser transformados em funcionalidades plenamente operacionais. No entanto, essas pendências não diminuem o valor do que já foi construído. Pelo contrário, elas deixam evidente que existe uma base sólida sobre a qual as próximas etapas podem ser desenvolvidas com menor retrabalho.

Outro ponto importante é a aderência do sistema à realidade do problema. O BarberSaaS não foi pensado como um exercício abstrato de programação, mas como resposta a um cenário recorrente em pequenos e médios estabelecimentos: a desorganização do agendamento, a dependência de processos manuais e a dificuldade de centralizar informações. Essa conexão com a realidade do negócio fortalece a utilidade do projeto e dá sentido prático à sua evolução.

Por fim, conclui-se que o BarberSaaS atende de forma consistente à proposta de desenvolver um sistema web para gestão de agendamentos em barbearias, preservando uma base técnica adequada e uma visão de produto orientada ao uso real. A continuidade do projeto deverá concentrar esforços em autenticação, consolidação dos módulos internos, relatórios, bloqueios persistentes e ampliação das capacidades administrativas. Com isso, o sistema poderá evoluir de uma solução já funcional para uma plataforma cada vez mais completa de apoio à operação e à gestão da barbearia.

---

# REFERÊNCIAS

FATEC GUARULHOS. ABNT. Guarulhos: Fatec Guarulhos, s.d. Disponível em: <https://fatecguarulhos.edu.br/abnt/>. Acesso em: 16 mar. 2026.

FATEC PIRACICABA. Manuais e templates para normalização. Piracicaba: Biblioteca Fatec Piracicaba, s.d. Disponível em: <https://biblioteca.fatecpiracicaba.edu.br/manuais-e-templates-para-normalizacao/>. Acesso em: 16 mar. 2026.

MYSQL. MySQL 8.4 Reference Manual. [S. l.]: Oracle, 2026. Disponível em: <https://dev.mysql.com/doc/en/>. Acesso em: 16 mar. 2026.

NEXT.JS. Next.js Docs. [S. l.]: Vercel, 2026. Disponível em: <https://nextjs.org/docs>. Acesso em: 16 mar. 2026.

PRISMA. Prisma ORM. [S. l.]: Prisma, s.d. Disponível em: <https://docs.prisma.io/docs/orm>. Acesso em: 16 mar. 2026.

REACT. Quick Start. [S. l.]: React, s.d. Disponível em: <https://react.dev/learn>. Acesso em: 16 mar. 2026.

TAILWIND CSS. Get started with Tailwind CSS. [S. l.]: Tailwind Labs, s.d. Disponível em: <https://tailwindcss.com/docs/installation/tailwind-cli>. Acesso em: 16 mar. 2026.

