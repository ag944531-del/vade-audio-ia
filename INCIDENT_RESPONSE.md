# VadeAudio AI - Plano de Resposta a Incidentes (Etapa 14)

Este documento contém os playbooks operacionais para identificação, contenção, correção e recuperação diante de falhas de serviços externos ou infraestrutura do **VadeAudio AI**.

---

## Fluxo Geral de Resposta a Incidentes

```
1. Identificar (Alertas / Monitor de Incidentes / Health Check)
         ↓
2. Conter (Modo Manutenção / Ativação de Fallback / Isolamento)
         ↓
3. Corrigir (Rotação de Chaves / Reinicialização / Failover)
         ↓
4. Recuperar (Testes Smoke / Desativação de Manutenção)
         ↓
5. Documentar (Post-Mortem & Registro em Log de Auditoria)
```

---

## 1. Playbook: Falha ou Indisponibilidade da ElevenLabs (TTS)

- **Sintomas**: Erros 401, 402 (quota esgotada) ou 500 no endpoint `/api/tts`; incidentes do tipo `TTS_ERROR` no painel administrativo.
- **Ações Imediatas**:
  1. O backend registra o incidente em `/api/admin/incidents`.
  2. O frontend (`audioEngine.js`) detecta a falha e aciona o **Sintetizador Neural Web Speech API** nativo como fallback automático.
  3. O aluno continua ouvindo a leitura das leis sem interrupção de tela.
  4. Verificar saldo ou quota de caracteres no painel ElevenLabs.
  5. Se necessário trocar a chave, atualizar `ELEVENLABS_API_KEY` no `.env` e reiniciar o backend.

---

## 2. Playbook: Falha do Provedor de IA (LLM / Cérebro Jurídico)

- **Sintomas**: Timeouts acima de 15s em `/api/ai/chat` ou erros 503.
- **Ações Imediatas**:
  1. O circuit breaker limita chamadas consecutivas com erro.
  2. O Tutor exibe mensagem amigável: *"O Tutor Jurídico está enfrentando alta demanda no momento. Suas anotações e artigos do Vade Mecum continuam disponíveis normalmente."*
  3. Verificar latência e conectividade externa.

---

## 3. Playbook: Falha no Provedor de Pagamentos / Webhook

- **Sintomas**: Webhooks rejeitados com 401 por falha de assinatura HMAC ou timeout no checkout.
- **Ações Imediatas**:
  1. Verificar se `WEBHOOK_SECRET` coincide com o dashboard do gateway.
  2. A tabela de idempotência (`PROCESSED_WEBHOOK_EVENTS`) evita cobranças duplicadas caso o gateway realize retentativas automáticas.
  3. Conceder plano Pro temporário manualmente via painel administrativo caso algum aluno necessite liberação emergencial durante instabilidade do gateway.

---

## 4. Playbook: Ataque de Força Bruta ou Abuso de Taxa

- **Sintomas**: Picos de requisições em `/api/auth/login` ou `/api/tts`.
- **Ações Imediatas**:
  1. O middleware de Rate Limiting bloqueia automaticamente o IP atacante com HTTP 429.
  2. Em caso de ataque massivo, o administrador pode ativar o **Modo Manutenção** com um clique no Painel Admin (`POST /api/admin/maintenance`).
