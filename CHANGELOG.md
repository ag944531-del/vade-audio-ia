# Changelog - VadeAudio AI

Todas as alterações relevantes e versões do sistema são registradas neste documento.

---

## [v2.19.0-smart-summaries] - 2026-08-15
### 📑 Etapa 32: Resumos & Fichamentos Inteligentes

#### Transformação em Estudo, Rastreamento de Proveniência & Roteirizador de Áudio
- **StudyTransformationService**: Pipeline completo para transformar artigos, jurisprudência, aulas e documentos em materiais de estudo ajustados ao tempo (1 min, 5 min, completo, fichamento e comparação).
- **Rastreamento Estrito de Proveniência**: Cada resumo armazena `source_id`, `source_type` e `source_version`, permitindo rastrear a fonte original exata.
- **Detecção de Fontes Atualizadas**: Alerta com badge ⚠️ *Fonte atualizada* caso a lei de origem sofra alteração posterior.
- **Fichamentos Acadêmicos Estruturados**: Geração de Fichamento de Conteúdo, Citações Literais autênticas e Fichamento Temático multi-fonte.
- **Tabelas Comparativas Estruturadas**: Matrizes comparativas de conceitos complexos (ex: Dolo Eventual $\times$ Culpa Consciente).
- **Roteirizador de Áudio com Prof. Marcos**: Narração conversacional adaptada para síntese neural ElevenLabs (`xHUwLsLfyqiYOIVTzLRW`).
- **Integração Ecossistêmica**: Envio instantâneo de resumos para o Caderno Digital, Flashcards SRS e Mapas Mentais.
- **Testes Automatizados**: Suíte `tests/smart_summary_tests.js` com 100% de aprovação (7 testes). Totalizando 172 testes no projeto.

---

## [v2.18.0-virtual-tribunal] - 2026-08-15
### 🏛️ Etapa 31: Tribunal Virtual & Júri Simulado

#### Ritos Processuais Brasileiros, Contra-Argumentação Fundamentada & Rubrica Plenária
- **VirtualTribunalEngine**: Simulação completa de Tribunal do Júri, Audiência Trabalhista/Cível e Sustentação Oral perante câmara julgadora.
- **TribunalSessionStateMachine**: Controle rígido de turnos ordenados (`waiting_user`, `user_speaking`, `opponent_speaking`, `judge_intervention`, `completed`).
- **CaseContextBuilder**: Injeção compacta de fatos imutáveis, laudos periciais e peças processuais, prevenindo alucinações de provas pela IA adversa.
- **EvidenceBoard (Quadro de Provas)**: Mapeamento em tempo real do uso de laudos e provas materiais nas falas do estudante.
- **Rubrica Pedagógica Plenária**: Avaliação de 5 dimensões (*Fundamentação*, *Uso da Prova*, *Contraditório*, *Oratória & Tempo*, *Estratégia*) com feedback sonoro pelo **Prof. Marcos (ElevenLabs `xHUwLsLfyqiYOIVTzLRW`)**.
- **Testes Automatizados**: Suíte `tests/virtual_tribunal_tests.js` com 100% de aprovação (6 testes). Totalizando 165 testes no projeto.

---

## [v2.17.0-grades-engine] - 2026-08-15
### 📊 Etapa 30: Central Inteligente de Notas, Médias e Estratégia Acadêmica

#### Motor Determinístico de Regras, Cálculo Reverso & Matriz de Risco
- **AcademicGradeRuleEngine**: Cálculo determinístico com precisão decimal exata para médias ponderadas, aritméticas, soma de pontos (0-100), provas finais e recuperação.
- **Tratamento de Notas Pendentes**: Notas não lançadas não são tratadas como zero; o sistema calcula médias parciais e cenários viáveis.
- **RequiredGradeCalculator ("Quanto preciso tirar?")**: Soluciona de forma reversa a nota necessária na próxima avaliação para fechar a média alvo (ex: 6.0 ou 7.0), detectando metas matematicamente inviáveis ou aprovação garantida.
- **Simulador Interativo de Notas com Sliders**: Ajuste em tempo real da nota da prova com projeção imediata da média e memorial de cálculo auditável ($P1 \times 4 + P2 \times 6 = 76 \rightarrow 7.6$).
- **AcademicRiskEngine**: Matriz de risco acadêmico (🟢 *Confortável*, 🟡 *Atenção*, 🔴 *Situação Crítica / Alta Prioridade*) que alimenta o Agente de Estudos e o Cronograma Semestral.
- **Rastreador de Frequência & Faltas**: Monitoramento de presenças com cálculo de faltas restantes sobre a margem de 75%.
- **Consultas por Voz com Prof. Marcos**: Síntese de voz ElevenLabs (`xHUwLsLfyqiYOIVTzLRW`) para respostas imediatas a perguntas sobre metas de notas.
- **Testes Automatizados**: Suíte `tests/academic_grades_tests.js` com 100% de aprovação (8 testes). Totalizando 159 testes no projeto.

---

## [v2.16.0-semester-planner] - 2026-08-15
### 📅 Etapa 29: Cronograma Acadêmico Inteligente do Semestre

#### Planejamento Determinístico, Repetição Espaçada & Replanejamento Delta
- **SemesterPlanningEngine**: Gerador de grade semestral determinístico que distribui a carga de estudo de forma espaçada (teoria, flashcards, questões, correção e simulados) evitando concentração na véspera.
- **Respeito Estrito à Rotina**: Cumprimento rigoroso de dias de descanso (ex: domingo livre) e limite máximo de horas diárias (ex: máx 2h/dia).
- **DeltaReplanner**: Replanejamento incremental que preserva o histórico e as tarefas já concluídas, redistribuindo apenas blocos futuros pendentes de dias perdidos.
- **Preservação de Tarefas Travadas**: Suporte a travas manuais (`isLocked: true`) em blocos estratégicos que não são movidos pelo solver.
- **Detecção de Gargalos**: Alerta imediato caso a carga necessária para cobrir o edital de prova exceda a capacidade real disponível.
- **Resumo Semanal em Áudio com Prof. Marcos**: Narração conversacional da semana com síntese de voz neural ElevenLabs (`xHUwLsLfyqiYOIVTzLRW`).
- **Testes Automatizados**: Suíte `tests/semester_planning_tests.js` com 100% de aprovação (7 testes). Totalizando 151 testes no projeto.

---

## [v2.15.0-dynamic-cases] - 2026-08-15
### 🕵️ Etapa 28: Casos Jurídicos Dinâmicos (Simulação Prática Investigativa)

#### Investigação Progressiva, Entrevista de Personagens & Avaliação por Rubrica
- **CaseBlueprint Imutável**: Estrutura imutável de fatos públicos e ocultos, documentos probatórios com selo fictício, personagens e rubrica de avaliação.
- **Ciclo Investigativo Progressivo**: O estudante interroga personagens (*Cliente*, *Testemunhas*, *RH*) sem vazamento de fatos que o personagem desconhece.
- **Desbloqueio Condicional de Documentos**: Documentos (como TRCT, contratos e cartas) só aparecem após a execução da diligência processual correta.
- **Quadro de Hipóteses & Detecção de Contradições**: Interface para registrar teses e comparar alegações verbais com provas documentais.
- **Ramificação de Decisões (Branching)**: Decisões processuais geram consequências reais (ajuizamento prematuro vs impugnação de vício de consentimento).
- **Avaliação por Rubrica Pedagógica**: Avaliação de 5 dimensões (*Investigação*, *Issue Spotting*, *Uso da Prova*, *Fundamentação Legal*, *Estratégia*) com feedback sonoro pelo **Prof. Marcos (ElevenLabs `xHUwLsLfyqiYOIVTzLRW`)**.
- **Testes Automatizados**: Suíte `tests/dynamic_case_tests.js` com 100% de aprovação (8 testes). Totalizando 144 testes no projeto.

---

## [v2.14.0-simulations] - 2026-08-15
### 🎯 Etapa 27: Simulador Inteligente de Provas & OAB

#### Provas Cronometradas, Raio-X dos Erros & Diagnóstico Dogmático
- **ExamSimulationEngine**: Modos de simulado para Faculdade (P1/P2), OAB 1ª Fase, Concursos, Diagnóstico Rápido e Refazer Pontos Fracos.
- **Snapshot Imutável de Questões**: Preserva a redação da lei e o gabarito no momento exato do início da tentativa histórica.
- **Ambiente Realista de Prova**: Ausência de gabarito durante o teste, cronômetro progressivo, folha de respostas dinâmica com marcação para revisão.
- **🔬 Raio-X dos Erros**: Diagnóstico aprofundado que identifica *Confusão Conceitual*, *Conteúdo não dominado*, *Interpretação*, *Desatenção* (tempo $< 15\text{s}$) e *Gerenciamento de Tempo*.
- **Integração com o Ecossistema**: Conexão em 1-clique com Vade Mecum, Tutor Jurídico, Flashcards e nova sessão guiada no Agente de Estudos.
- **Narração com Prof. Marcos**: Leitura opcional das questões com voz neural ElevenLabs (`xHUwLsLfyqiYOIVTzLRW`).
- **Testes Automatizados**: Suíte `tests/exam_simulation_tests.js` com 100% de aprovação (7 testes). Totalizando 136 testes no projeto.

---

## [v2.13.0-study-agent] - 2026-08-15
### ✨ Etapa 26: Agente Autônomo de Estudos Jurídicos (Copiloto Acadêmico)

#### Orquestrador em Modo Foco, Prioridade Matemática & Adaptação em Tempo Real
- **StudyPriorityEngine**: Algoritmo determinístico que pondera proximidade de prova ($40\%$), déficit de domínio ($30\%$), erros recentes ($20\%$) e flashcards vencidos ($10\%$).
- **StudySessionOrchestrator**: Montagem inteligente de blocos de estudo estritamente limitados ao tempo disponível do estudante (15 min, 30 min, 45 min, 1h, 2h).
- **Modo Foco em Tela Cheia**: Interface livre de distrações com cronômetro ativo, barra de progresso por etapa e transição suave.
- **AdaptiveStudyEngine**: Adaptação em tempo real que avança o aluno em caso de alto acerto ($\ge 80\%$) ou aciona reforço conceitual com **Prof. Marcos (ElevenLabs `xHUwLsLfyqiYOIVTzLRW`)** em caso de erros repetidos ($\le 40\%$).
- **Modos Especializados**: *Normal*, *🎧 Foco em Áudio*, *🎯 Intensivo*, *⚡ Revisão Rápida* e *🚨 Modo "Me Salva"*.
- **Autonomia Segura**: Permissões estritas que exigem confirmação humana para ações perigosas ou destrutivas.
- **Testes Automatizados**: Suíte `tests/study_agent_tests.js` com 100% de aprovação (9 testes). Totalizando 129 testes no projeto.

---

## [v2.12.0-notebook] - 2026-08-15
### 📚 Etapa 25: Caderno Digital Jurídico Inteligente

#### Editor em Blocos, RAG Contextual, Backlinks & Modo Revisão
- **DigitalNotebookEngine**: Memória acadêmica central estruturada em Cadernos $\rightarrow$ Seções $\rightarrow$ Páginas $\rightarrow$ Blocos.
- **Editor em Blocos & Slash Commands**: Suporte a blocos de Texto, Título, Artigo do Vade Mecum, Alertas, Flashcards, Questões, Mapas Mentais e Gravações de Aula.
- **Autosave & Resiliência Offline**: Salvamento contínuo em cache local com status discreto (*Salvando...*, *✓ Salvo*, *Offline*), impedindo perda de notas.
- **Links Internos `[[Página]]` & Backlinks**: Referenciamento bidirecional automático entre aulas e matérias.
- **Perguntar ao meu Caderno (RAG Contextual)**: Respostas em linguagem natural com citação exata de página/aula e resposta honesta para termos ausentes.
- **Caderno da Prova & 🚨 Meus Erros**: Visão consolidada para próximas avaliações com agrupamento de falhas recorrentes.
- **Modo Revisão (Active Recall) & Áudio Prof. Marcos**: Ocultação de respostas para teste ativo e narração falada didática com ElevenLabs (`xHUwLsLfyqiYOIVTzLRW`).
- **Testes Automatizados**: Suíte `tests/digital_notebook_tests.js` com 100% de aprovação (8 testes). Totalizando 120 testes no projeto.

---

## [v2.11.0-mindmaps] - 2026-08-15
### 🧠 Etapa 24: Mapas Mentais Jurídicos

#### Grafos Interativos, Árvore Acessível, Mapa de Fraquezas & Áudio
- **MindMapEngine**: Geração de mapas mentais a partir de temas, artigos, leis, exames e pontos fracos do estudante.
- **Proveniência Obrigatória & Anti-Alucinação**: Cada nó oficial conecta-se ao Vade Mecum ou jurisprudência com citação exata, sem inventar artigos ou súmulas para termos desconhecidos.
- **Árvore Textual Acessível**: Alternância instantânea entre Canvas Gráfico e Árvore Textual semântica para leitores de tela e estudo linear rápido.
- **🚨 Mapa de Fraquezas & Erros**: Destaque automático de nós com domínio $< 60\%$ e erros recorrentes em simulados, com ações diretas (*Revisar*, *Flashcards*, *Questões*).
- **⚖️ Mapas Comparativos**: Comparação conceitual e dogmática lado a lado (ex: *Furto vs Roubo*, *Prescrição vs Decadência*).
- **🎧 Ouvir Mapa (ElevenLabs Prof. Marcos)**: Roteiro didático falado narrado pelo Prof. Marcos (`xHUwLsLfyqiYOIVTzLRW`).
- **🎙️ Estudo Socrático com Tutor**: Arguição iterativa nó a nó onde o Tutor faz perguntas antes de revelar os conceitos.
- **Testes Automatizados**: Suíte `tests/mind_map_tests.js` com 100% de aprovação (6 testes). Totalizando 112 testes no projeto.

---

## [v2.10.0-scanner] - 2026-08-15
### 📷 Etapa 23: Scanner Jurídico Inteligente

#### OCR Especializado, Detector de Normas & Modo Quadro
- **ImagePreprocessor**: Verificação de qualidade (desfoque, brilho, resolução) e remoção de metadados EXIF/GPS.
- **OCRService**: Extração pt-BR com dicionário jurídico (`STF`, `STJ`, `CPC`, `CPP`, `CLT`, `OAB`, `§`, `litisconsórcio`, `prescrição`, `decadência`) e preservação do texto bruto original.
- **LegalReferenceDetector**: Extração de normas com tratamento de ambiguidade (ex: Art. 300 sem lei) e comparação com Vade Mecum oficial para alertar sobre edições antigas.
- **BoardStructuringEngine**: Modo Quadro para transformar anotações com setas e tópicos em markdown estruturado.
- **Geração de Ativos de Estudo**: 1-clique para gerar Resumo, Flashcards sonoros, Questões e Áudio com **Prof. Marcos (ElevenLabs `xHUwLsLfyqiYOIVTzLRW`)**.
- **Testes Automatizados**: Suíte `tests/smart_scanner_tests.js` com 100% de aprovação (9 testes). Totalizando 106 testes no projeto.

---

## [v2.9.0-mobile] - 2026-08-15
### 📱 Etapa 22: App Mobile Android & iOS

#### Capacitor Wrapper, MediaSession, Deep Links & Store Compliance
- **Capacitor Configuration (`capacitor.config.json`)**: Configuração para `br.com.vadeaudio.app` com suporte a plugins nativos, splash, status bar e push notifications.
- **Mobile Bottom Navigation**: Barra de navegação inferior responsiva para smartphones com 5 abas (`Hoje`, `Estudar`, `Tutor`, `Faculdade`, `Mais`) e gaveta de recursos secundários.
- **MediaSession API**: Controles na Lock Screen e central de notificações (Play, Pause, Seek) com título do artigo e narração do Prof. Marcos.
- **Microfone & Sala de Aula**: Pedido de permissão contextual e banner persistente `🔴 Gravando aula — MM:SS`.
- **Push Notifications & Deep Links**: Registro de tokens de push com categorias (`provas`, `revisoes_srs`, `atualizacoes`) e roteador de deep links (`vadeaudio://artigo/121`).
- **Biometria & Auto-Lock**: Desbloqueio opcional com Face ID / Touch ID / Biometria Android e temporizador de bloqueio configurável.
- **In-App Purchases (IAP) & Exclusão de Conta**: Abstração unificada de pagamentos (Apple IAP / Google Play) com verificação server-side e endpoint de exclusão de conta em conformidade com as diretrizes das lojas e LGPD.
- **Testes Automatizados**: Suíte `tests/mobile_bridge_tests.js` com 100% de aprovação (8 testes). Totalizando 97 testes no projeto.

---

## [v2.8.0-offline] - 2026-08-15
### 📥 Etapa 21: Modo Offline & Biblioteca Jurídica Local

#### Armazenamento Local, Outbox e Sincronização Delta
- **OfflineStorageEngine**: Biblioteca local com suporte a IndexedDB para leis (CF/88, CP, CPC, CDC, CLT), áudios cacheados, flashcards e materiais.
- **OfflineOutbox**: Fila de mutações locais com idempotência estrita (`operation_id`, `type`, `entity_id`, `payload`, `created_at`).
- **Resolução de Conflitos**: Estratégia de merge sem perda silenciosa de anotações ou revisões realizadas em múltiplos dispositivos.
- **Entitlement Offline**: Tolerância de licença Pro (*grace period* de até 7 dias sem internet) com preservação perpétua de dados locais.
- **Modo Viagem**: 1-clique para download do pacote essencial (CF + CP + CPC + 100 Flashcards + 3 Revisões em Áudio).
- **Service Worker PWA Atualizado (`sw.js`)**: Cache First para shell da aplicação e Network First com fallback para dados jurídicos.
- **Testes Automatizados**: Suíte `tests/offline_engine_tests.js` com 100% de aprovação (7 testes). Totalizando 89 testes no projeto.

---

## [v2.7.0-legal-updates] - 2026-08-15
### ⚖️ Etapa 20: Jurisprudência Viva & Atualização Legislativa

#### Sincronização e Conectores Oficiais
- **LegalSourceConnectors**: Conectores estruturados para Planalto, STF (Repercussão Geral), STJ (Temas Repetitivos) e Senado Federal com proveniência obrigatória (`source_name`, `source_url`, `published_at`, `verified_at`).
- **LegalCitationNormalizer**: Normalização canônica de identificadores judiciais (`REsp`, `RE`, `ADI`, `SV`, `HC`).
- **Versionamento Temporal & Diffs**: Preservação do histórico integral das redações legais, comparador antes vs depois e explicação dogmática *"✨ O que mudou?"*.
- **Alertas Segmentados por Watchlist**: Notificações personalizadas de mudanças legislativas baseadas nas matérias e leis seguidas pelo estudante.
- **Auditoria de Flashcards & Questões Antigas**: Marcação automática de flashcards desatualizados (`needsReview: true`) e avisos de contexto temporal em questões de provas anteriores.
- **Boletim Jurídico Semanal em Áudio**: Síntese falada narrada pelo Prof. Marcos (ElevenLabs `xHUwLsLfyqiYOIVTzLRW`).
- **Testes Automatizados**: Suíte `tests/legal_updates_tests.js` com 100% de aprovação (7 testes). Totalizando 82 testes no projeto.

---

## [v2.6.0-oral-exam] - 2026-08-15
### 🎤 Etapa 19: Prova Oral & Audiência Avançada

#### Simulações Orais Dogmáticas e Práticas
- **OralExamEngine**: Simulação completa de bancas examinadoras de concursos e faculdades, com perguntas de aprofundamento contextual (*follow-up*).
- **Rubricas de Avaliação Objetivas (0 a 10.0)**: Pontuação dividida em Correção Jurídica (4.0), Fundamentação Legal (3.0), Clareza & Coerência (2.0) e Objetividade/Tempo (1.0).
- **Perfis de Banca**: Didática, Objetiva, Rigorosa e Socrática.
- **Sustentação Oral Estruturada**: Casos reais com cronômetro e análise de abertura, síntese fática, teses, súmulas e pedido.
- **Audiência Simulada Brasileira**: Procedimento de instrução e julgamento trabalhista/cível com papéis de Advogado, Promotor, Defensor e Juiz (com prolação de decisão oral).
- **Caderno de Erros Orais & Nova Rodada Adaptativa**: Armazenamento de fundamentos esquecidos com geração automática de novas rodadas e flashcards sonoros.
- **Testes Automatizados**: Suíte `tests/oral_exam_tests.js` com 100% de aprovação (8 testes). Totalizando 75 testes automatizados no projeto.

---

## [v2.5.0-voice-tutor] - 2026-08-15
### 🎙️ Etapa 18: Professor Particular por Voz em Tempo Real

#### Experiência Conversacional Fluída
- **VoiceProfessorEngine**: Máquina de estados (`idle`, `listening`, `transcribing`, `thinking`, `speaking`, `interrupted`) e VAD com janela adaptativa de silêncio (1200ms).
- **Interrupção Instantânea & Barge-In**: Cancelamento de TTS e de requisições pendentes via `AbortController` e controle de `turn_id` (prevenção de race conditions e áudio fantasma).
- **Comandos de Voz Conversacionais**: Tratamento de intents como *"repete"*, *"não entendi"*, *"mais devagar"*, *"mais rápido"*, *"dê um exemplo"* e *"pare"*.
- **Modos Pedagógicos**: Professor Didático, Objetivo, Detalhado, Método Socrático (perguntas orientadoras) e Prova Oral (avaliação de oratória e fundamentação jurídica).
- **Separação Display vs. Speech**: Textos de fala otimizados para prosódia natural (voz Prof. Marcos `xHUwLsLfyqiYOIVTzLRW`), sem leitura de markdown/URLs, enquanto a tela exibe referências clicáveis da lei.
- **Atalhos no App**: "Estudar Artigo por Voz" no Vade Mecum, "Estudar Material por Voz" em PDFs e "Modo Caminhando" (hands-free).
- **Testes Automatizados**: Suíte `tests/voice_professor_tests.js` com 100% de aprovação (9 testes). Totalizando 67 testes no ecossistema.

---

## [v2.4.0-analytics] - 2026-08-15
### 📊 Etapa 17: Inteligência Acadêmica & Product Analytics

#### Inteligência Acadêmica Real (Student-Facing)
- **Fórmula de Domínio Ponderado**: Ponderação determinística de 35% Questões + 25% Simulados + 20% SRS + 10% Recência + 10% Dificuldade.
- **Confiança Amostral Transparente**: Alerta explícito de baixa amostra quando houver menos de 6 itens avaliados.
- **Detecção de Desequilíbrio & Provas**: Alerta quando uma matéria representa <15% do tempo de estudo com prova em menos de 10 dias.
- **Curva de Esquecimento (Ebbinghaus Decay)**: Cálculo do risco de retenção de cartões SRS com base no tempo decorrido desde a última revisão.
- **Caderno de Erros Estruturado**: Agrupamento por tema, tipo de erro (Conceitual, Interpretação, Confusão de Institutos, Artigo de Lei) e atalho para revisão de 30 minutos.
- **Índice de Preparação para Provas**: Diagnóstico de prontidão ponderado sem promessas levianas de notas.
- **Motor de Insights & Recomendações**: Regras determinísticas gerando ações de alto impacto integradas ao plano de estudo da tela Hoje.

#### Product Analytics & Experimentação (Admin/Produto)
- **Minimização LGPD em Eventos**: Expurgamento automático de textos privados, perguntas de tutor e anotações dos eventos de telemetria.
- **Funis de Onboarding e Upgrade**: Monitoramento de conversão e adoção de recursos.
- **ExperimentService**: Testes A/B com atribuição determinística por usuário.
- **Testes Automatizados**: Suíte `tests/academic_intelligence_tests.js` com 100% de aprovação (11 testes).

---

## [v2.3.0-academic] - 2026-08-15
### 🎓 Etapa 16: Professores, Turmas, Universidades e Gestão Acadêmica

#### Docência & Turmas
- **Painel do Professor (`view-teacher`)**: Gestão de turmas, materiais de apoio, listas de questões e cronograma de provas.
- **Códigos de Convite**: Ingressão voluntária do estudante via código alfanumérico único (ex: `PENAL-UFBA-2026`).
- **Materiais Vinculados ao Vade Mecum**: Publicação de materiais e artigos correlatos sem alteração do texto legal oficial.
- **Assistente IA do Professor**: Geração de rascunhos de questões e resumos com **revisão e aprovação humana obrigatória** antes de qualquer publicação.
- **Resultados Agregados & Sigilo de Notas**: Métricas de média da turma e temas com maior índice de erro sem vazamento de notas individuais entre colegas (LGPD).

#### Institucional & Referral
- **Gestão Institucional & Licenças**: Controle de assentos (*seats*) para faculdades parceiras e métricas agregadas de engajamento acadêmico.
- **Programa de Indicação ("Indique um Amigo")**: Geração de código pessoal, ciclo de recompensas (+15 dias Pro) e mecanismo anti-fraude contra auto-indicação.
- **Testes Automatizados Acadêmicos**: Suíte `tests/academic_tests.js` com 100% de aprovação (12 testes).

---

## [v2.2.0-prod] - 2026-08-15
### 🚀 Etapa 15: Polimento Final, Onboarding, Mobile e Lançamento

#### Onboarding & Primeiro Acesso
- **Onboarding Inteligente em 7 Passos**: Wizard interativo configurando objetivo principal, semestre, matérias, próxima prova, preferências de estudo, demonstração da narração neural e plano inicial adaptativo.
- **Modo Pular**: Opção "Pular por enquanto" para navegação imediata sem fricção.

#### Navegação & Experiência Mobile
- **Reorganização da Sidebar Desktop**: Menu agrupado por domínio (*Início*, *Estudar*, *Praticar & Pesquisar*, *Conta & Ajuda*).
- **Mobile Bottom Navigation Bar**: Barra de acesso rápido fixa para smartphones (*Hoje*, *Vade Mecum*, *Tutor*, *Faculdade*, *Mais*).
- **Global Mini Player Persistente**: Barra de áudio flutuante compacta durante a navegação entre telas.
- **Command Palette (`Ctrl + K` / `Cmd + K`)**: Atalho de busca universal para artigos, leis, matérias e recursos.
- **Bloco "Continuar de Onde Parei"**: Cards de retomada instantânea no topo do Painel Hoje.

#### Landing Page, Suporte & Toasts
- **Landing Page Pública Interativa**: Hero persuasivo, player de demonstração em tempo real com voz ElevenLabs (Marcos), FAQ interativo e comparativo transparente de planos.
- **Sistema Centralizado de Toasts**: Notificações modernas substituindo alertas bloqueantes do navegador.
- **Central de Ajuda, Suporte & Feedback**: Canal para envio de sugestões, bugs e reporte de artigos desatualizados.
- **Testes Automatizados E2E**: Suíte com 11 asserções cobrindo os 5 fluxos principais com 100% de aprovação.

---

## [v2.1.0-prod] - 2026-08-15
### 🛡️ Etapa 14: Segurança, Privacidade, Backup e Preparação para Produção

#### Segurança & Autenticação
- **PBKDF2 Password Hashing**: Senhas com salt criptográfico aleatório de 16 bytes e 100.000 iterações (SHA-512).
- **Active Sessions & Dispositivos**: Visualização de dispositivos conectados e encerramento remoto de outras sessões.
- **Proteção contra Força Bruta & Enumeração**: Rate limiter em rotas de auth e resposta genérica em "Esqueci minha senha" com token de 15 minutos.
- **RBAC no Backend**: Rotas `/api/admin/*` com bloqueio e validação estrita de papel (`admin`).
- **Proteção IDOR**: Validação mandatório de `userId` em todas as entidades privadas de alunos (documentos, aulas, anotações, planos).

#### Privacidade & LGPD
- **Hub de Privacidade & Consentimentos**: Central de gerenciamento de consentimentos de microfone, notificações e analytics anônimo.
- **Exportação de Dados (Art. 18 LGPD)**: 📦 Botão "Exportar Meus Dados" gerando pacote JSON completo com todo o histórico acadêmico.
- **Exclusão Definitiva de Conta**: ⚠️ Fluxo com dupla confirmação e exclusão em cascata no cliente e servidor.
- **Indicador Visual de Microfone**: Banner superior pulsante ativo apenas durante a gravação autorizada.

#### Resiliência & Produção
- **Upload Seguro & Anti-Path Traversal**: Validação de MIME, limite de 25MB, UUIDs e Signed URLs temporárias.
- **Security Headers & CSP**: CSP rigoroso, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN.
- **Log Redaction**: Mascaramento de tokens Bearer, senhas e chaves nos logs do console.
- **Webhooks Seguros**: Validação de assinatura HMAC SHA-256 e idempotência contra transações repetidas.
- **Health Check & Incidentes**: Endpoint `/health` e painel de incidentes em tempo real no admin.
- **Modo Manutenção**: Feature flag para manutenção programada sem interrupção de acesso aos administradores.
- **Testes Automatizados**: Suíte `tests/security_tests.js` com 24 asserções aprovadas cobrindo os 10 pilares de segurança.
