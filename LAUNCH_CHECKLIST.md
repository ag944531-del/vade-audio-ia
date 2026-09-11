# VadeAudio AI - Checklist de Lançamento (Etapa 15)

Checklist de homologação e validação para o lançamento comercial e versão Beta VIP do **VadeAudio AI (v2.2.0-prod)**.

---

- [x] **1. Landing Pronta**: Hero impactante, player de demonstração em áudio neural com a voz Marcos, FAQ e aviso acadêmico oficial.
- [x] **2. Cadastro & Login**: Autenticação com senhas criptografadas (PBKDF2 SHA-512) e tokens de sessão seguros.
- [x] **3. Recuperação de Senha**: Fluxo seguro por token temporário de 15 minutos e proteção contra enumeração.
- [x] **4. Onboarding 7 Passos**: Coleta de objetivo, semestre, matérias, prova próxima, estilo de estudo, voz neural e geração de plano.
- [x] **5. Modo Pular Onboarding**: Permite ao estudante pular a configuração sem travar o aplicativo.
- [x] **6. Dashboard (Hoje)**: Bloco "Continuar de Onde Parei", meta diária, briefing com IA e cronograma priorizado.
- [x] **7. Vade Mecum Digital**: Leitor de leis com os 6 botões oficiais, destaque karaokê e áudio contínuo.
- [x] **8. Tutor Jurídico IA**: Respostas fundamentadas na lei seca, modo prova oral e histórico de conversas nomeado.
- [x] **9. ElevenLabs (Marcos)**: Integração com Voice ID `xHUwLsLfyqiYOIVTzLRW` e fallback nativo na Web Speech API.
- [x] **10. Questões & Simulado OAB**: Simulados cronometrados da 1ª fase e treino de peças prático-profissionais da 2ª fase.
- [x] **11. Flashcards & SRS**: Algoritmo SuperMemo SM-2 com agendamento de repetição espaçada.
- [x] **12. Meus Materiais**: Upload seguro de PDFs/DOCs (25MB), indexação de páginas e geração de resumos/áudios com IA.
- [x] **13. Minha Faculdade**: Gestão de semestres, notas com cálculo de média e professor IA da disciplina.
- [x] **14. Planos & Pagamentos**: Planos Gratuito e Pro com limite transparente e validação de Webhook HMAC.
- [x] **15. Segurança & Hardening**: CSP, X-Content-Type-Options: nosniff, Rate Limiting e isolamento IDOR.
- [x] **16. Backups & Restore**: Geração de snapshots JSON no admin e roteiro documentado em `BACKUP_RUNBOOK.md`.
- [x] **17. Monitoramento & Health**: Endpoint `/health` e painel de incidentes em tempo real.
- [x] **18. Privacidade & LGPD**: Hub de Privacidade, exportação de dados (Art. 18) e exclusão definitiva de conta.
- [x] **19. Termos de Uso & Cookies**: Modais legais com aviso de responsabilidade acadêmica e dados em cache.
- [x] **20. Mobile Navigation**: Bottom Navigation Bar fixa para smartphones e menus táteis.
- [x] **21. Mini Player Global**: Barra flutuante inferior persistente durante navegação entre telas.
- [x] **22. Command Palette**: Atalho `Ctrl + K` / `Cmd + K` com busca rápida fuzzy.
- [x] **23. Sistema de Toasts**: Notificações flutuantes não-bloqueantes com barra de progresso.
- [x] **24. Central de Ajuda & Feedback**: Formulário para reportar bugs, sugestões e erros em textos de lei.
- [x] **25. PWA & Offline Shell**: Service Worker registrado para cache local de artigos e flashcards.
- [x] **26. Testes Automatizados E2E**: 11 testes cobrindo os 5 fluxos principais com 100% de sucesso.
- [x] **27. Smoke Test Staging/Produção**: Validação de ponta a ponta sem falhas críticas.
