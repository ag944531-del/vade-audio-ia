# VadeAudio AI - Checklist de Produção (Etapa 14)

Este checklist consolida a validação operacional dos **94 requisitos de segurança, privacidade, backup e produção** do VadeAudio AI.

---

- [x] **1. Secrets configurados**: `ELEVENLABS_API_KEY`, `JWT_SECRET`, `WEBHOOK_SECRET` isolados no backend.
- [x] **2. .env no .gitignore**: `.env` protegido, `.env.example` sem valores reais.
- [x] **3. Hashing de Senhas**: PBKDF2 com Salt aleatório de 16 bytes e SHA-512.
- [x] **4. Proteção contra Brute Force**: Rate limiter em `/api/auth/login` e `/api/auth/forgot-password`.
- [x] **5. Anti-Enumeração de Usuários**: Resposta genérica no fluxo de recuperação de senha.
- [x] **6. Dispositivos Conectados**: Painel de sessões ativas com revogação remota.
- [x] **7. Proteção IDOR**: Validação de ownership (`userId`) em todos os documentos, aulas e planos.
- [x] **8. RBAC Real no Backend**: Rotas `/api/admin/*` protegidas contra acesso de estudantes.
- [x] **9. Rotação de Secrets**: Procedimento documentado sem necessidade de refatoração de código.
- [x] **10. Security Headers**: CSP, X-Content-Type-Options: nosniff, X-Frame-Options, Permissions-Policy.
- [x] **11. Sanitização XSS**: Sanitizer no frontend e backend para conteúdos dinâmicos.
- [x] **12. Proteção Prompt Injection**: Delimitação estrita `<contexto_juridico>` e separação de instruções.
- [x] **13. RAG Security**: Filtro obrigatório de `user_id` antes de qualquer busca ou ranking.
- [x] **14. Upload Seguro**: Validação de MIME types, tamanho máximo de 25MB e nomes em UUID.
- [x] **15. Anti-Path Traversal**: Bloqueio de caminhos relativos (`..`) e sanitização de nomes.
- [x] **16. Signed URLs**: Links temporários de download com expiração em 15 minutos.
- [x] **17. LGPD - Minimização**: Sem coleta desnecessária de CPF, RG ou dados financeiros em texto puro.
- [x] **18. LGPD - Consentimentos**: Consentimento explícito para gravação de microfone com aviso visual.
- [x] **19. LGPD - Exportar Meus Dados**: Geração de pacote JSON completo em um clique (Art. 18).
- [x] **20. LGPD - Excluir Conta**: Exclusão em cascata com dupla confirmação e aviso de retenção legal.
- [x] **21. Log Redaction**: Mascaramento automático de tokens, senhas e chaves em logs.
- [x] **22. Global Error Handling**: Mensagens amigáveis em produção sem vazamento de stack traces.
- [x] **23. Rate Limiting Granular**: Limites para Auth, TTS, IA, Uploads e Webhooks.
- [x] **24. Webhook Seguro**: Validação de assinatura HMAC SHA-256 e idempotência contra duplicidade.
- [x] **25. Backups Automáticos & Snapshots**: Endpoint `/api/admin/backup` com geração de JSON seguro.
- [x] **26. Teste de Restauração**: Procedimento documentado em `BACKUP_RUNBOOK.md`.
- [x] **27. Health Check Endpoint**: `/health` com verificação de status, uptime, storage e ElevenLabs.
- [x] **28. Painel de Incidentes**: Monitoramento em tempo real de falhas de TTS, IA e Webhooks no admin.
- [x] **29. Modo Manutenção**: Toggle instantâneo para atualizações e bloqueio temporário de alunos.
- [x] **30. Avisos Acadêmico & Jurídico**: Textos claros informando que a IA é apoio aos estudos e não advocacia.
- [x] **31. Testes Automatizados**: Suíte `tests/security_tests.js` com 100% de aprovação.
