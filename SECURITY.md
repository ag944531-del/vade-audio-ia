# VadeAudio AI - Política de Segurança & Proteção de Dados (Etapa 14)

Este documento estabelece as diretrizes arquiteturais e operacionais de segurança da informação, conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)** e governança técnica do **VadeAudio AI**.

---

## 1. Arquitetura de Autenticação & Gestão de Identidades

- **Hashing de Senhas**: Utiliza o algoritmo `PBKDF2` com derivação criptográfica `SHA-512`, 100.000 iterações e salt aleatório de 16 bytes gerado por `crypto.randomBytes(16)`.
- **Tokens de Sessão**: Tokens criptográficos assinados com `HMAC-SHA256` e segredo armazenado exclusivamente nas variáveis de ambiente (`JWT_SECRET`). Validade de 7 dias com renovação automática.
- **Recuperação de Conta (Esqueci Minha Senha)**:
  - Tokens temporários de uso único gerados com 24 bytes de entropia.
  - Expiração rígida em **15 minutos**.
  - Resposta genérica contra enumeração de usuários (o sistema não confirma se o email existe publicamente).
- **Dispositivos Conectados (Active Sessions)**:
  - Rastreabilidade de sessões por User-Agent e IP aproximado anônimo.
  - Funcionalidade para encerrar sessões remotas individualmente ou em lote ("Encerrar Outras Sessões").

---

## 2. Controle de Acesso Baseado em Papéis (RBAC) & Proteção IDOR

- **Papéis do Sistema**:
  - `student`: Aluno regular (acesso restrito aos próprios dados de estudo, materiais, anotações e simulados).
  - `admin`: Coordenação e administração técnica (métricas agregadas, painel de incidentes, modo manutenção e backups).
  - `support`: Equipe de suporte acadêmico para auxílio ao estudante.
- **Prevenção de IDOR (Insecure Direct Object Reference)**:
  - Toda consulta a recursos privados (documentos, aulas gravadas, transcrições, fichamentos, peças práticas, planos de estudo e flashcards) valida obrigatoriamente `resource.userId === currentUser.id`.
  - Tentativas não autorizadas recebem HTTP 403 Forbidden ou 404 Not Found.

---

## 3. Proteção de Chaves de API & Segredos (Secret Management)

- **ElevenLabs API Key**: Mantida **100% no backend** (`ELEVENLABS_API_KEY`). O frontend consome apenas a rota `/api/tts` e recebe streams em cache.
- **Log Redaction**: O interceptor de logs mascara automaticamente tokens Bearer, chaves `sk_...`, senhas, cookies de sessão e cabeçalhos sensíveis em console e arquivos de log.
- **Guia de Rotação de Segredos**:
  1. Gerar novas credenciais no provedor externo (ElevenLabs, Provedor de Pagamento, Banco de Dados).
  2. Atualizar o arquivo `.env` do servidor em produção ou painel de variáveis de ambiente.
  3. Executar reload gracioso do processo (`pm2 reload vadeaudio-ai` ou reinicialização do container).
  4. Nenhuma alteração de código fonte é necessária.

---

## 4. Hardening de Rede, Headers e Upload Seguro

- **Security Headers**:
  - `Content-Security-Policy`: Restringe scripts e conexões apenas a domínios autorizados (`'self'`, Google Fonts, FontAwesome, ElevenLabs).
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`: Restringe microfone apenas sob ação explícita (`microphone=(self)`).
- **Upload Seguro & Anti-Path Traversal**:
  - Verificação de MIME types permitidos (`application/pdf`, `audio/mpeg`, `image/png`, etc.).
  - Nomes de arquivos sanitizados com `crypto.randomUUID()`.
  - Bloqueio de caminhos relativos (`..`) e acesso direto a arquivos privados.
  - Acesso a arquivos por meio de **Signed URLs** com validade de 15 minutos.

---

## 5. Proteção de Prompts & Isolamento RAG

- **Defesa contra Prompt Injection**: Todo conteúdo extraído de documentos de alunos ou transcrições é encapsulado em tags estritas `<contexto_juridico>` com instruções para o modelo LLM tratá-lo estritamente como **dado de consulta** e nunca como comando executável.
- **Isolamento de Contexto**: O motor de busca do Cérebro Jurídico aplica filtro mandatário por `user_id` antes de qualquer ranqueamento vetorial ou textual.

---

## 6. Conformidade com a LGPD (Lei 13.709/2018)

- **Princípio da Minimização**: Não são solicitados CPF, RG ou dados pessoais sensíveis sem necessidade estrita.
- **Consentimento Explícito**: Gravação de microfone exige clique do estudante, com banner visual pulsante em tela durante a captura.
- **Direito à Portabilidade (Art. 18, V)**: Botão 📦 **Exportar Meus Dados** que gera pacote JSON estruturado contendo todos os dados do aluno.
- **Direito à Eliminação (Art. 18, VI)**: Botão ⚠️ **Excluir Minha Conta** com dupla confirmação e exclusão em cascata (documentos, flashcards, áudios e índices).
- **Separação de Dados**: Registros financeiros obrigatórios para fins fiscais são tratados com isolamento de dados acadêmicos.
