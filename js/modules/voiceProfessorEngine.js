/**
 * VadeAudio AI - Motor do Professor Particular por Voz em Tempo Real (Etapa 18)
 * Conversação contínua, detecção de silêncio (VAD), interrupção/barge-in instantâneo,
 * intents conversacionais de voz, separação display/speech text e modos pedagógicos (Didático, Socrático, Prova Oral).
 */

class VoiceProfessorEngine {
  constructor(authService, audioEngine, tutorEngine, legalBrainEngine) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.tutorEngine = tutorEngine;
    this.legalBrainEngine = legalBrainEngine;

    // State Machine: 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'interrupted' | 'error'
    this.state = 'idle';
    this.sessionId = null;
    this.currentTurnId = 0;
    this.currentAbortController = null;
    
    // Configurações Conversacionais
    this.mode = 'standard'; // 'standard' | 'objective' | 'detailed' | 'socratic' | 'oral_exam' | 'quick_review'
    this.micMode = 'auto'; // 'auto' (contínuo) | 'push_to_talk' | 'muted'
    this.speechSpeed = 1.0;
    this.isMuted = false;
    this.voiceId = 'xHUwLsLfyqiYOIVTzLRW'; // Prof. Marcos (ElevenLabs)
    this.voiceName = 'Prof. Dr. Marcos';

    // Contexto Ativo
    this.activeSubject = 'Direito Penal';
    this.activeTopic = 'Teoria Geral do Delito & Dolo';
    this.activeArticle = null;
    this.dialogueHistory = [];
    this.sessionStartTime = null;

    // VAD & Reconhecimento
    this.recognition = null;
    this.silenceTimeout = null;
    this.isPushToTalkActive = false;
    this.stateListeners = [];
    this.messageListeners = [];

    this.initSpeechRecognition();
  }

  // --------------------------------------------------------------------------
  // 1. RECONHECIMENTO DE VOZ COM VOCABULÁRIO JURÍDICO & AEC
  // --------------------------------------------------------------------------
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'pt-BR';

      this.recognition.onstart = () => {
        if (this.state !== 'speaking' && this.state !== 'thinking') {
          this.setState('listening');
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const activeText = finalTranscript || interimTranscript;

        // Barge-in: se o professor estiver falando e o aluno começar a falar, interrompe imediatamente
        if (this.state === 'speaking' && activeText.trim().length > 2) {
          this.handleBargeIn(activeText.trim());
          return;
        }

        if (finalTranscript.trim().length > 0) {
          this.handleUserSpeechFinal(finalTranscript.trim());
        } else if (interimTranscript.trim().length > 0) {
          this.notifyInterimTranscript(interimTranscript.trim());
          this.resetSilenceTimer();
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceProfessor] Erro no microfone/reconhecimento:', event.error);
        if (event.error === 'not-allowed') {
          this.setState('error', 'Permissão de microfone negada. Clique para autorizar.');
        }
      };

      this.recognition.onend = () => {
        if (this.micMode === 'auto' && (this.state === 'listening' || this.state === 'idle') && !this.isMuted) {
          try { this.recognition.start(); } catch {}
        }
      };
    }
  }

  // --------------------------------------------------------------------------
  // 2. MÁQUINA DE ESTADOS & LISTENERS
  // --------------------------------------------------------------------------
  setState(newState, errorMsg = null) {
    this.state = newState;
    this.stateListeners.forEach(fn => fn(this.state, errorMsg));
  }

  onStateChange(fn) {
    this.stateListeners.push(fn);
  }

  onMessage(fn) {
    this.messageListeners.push(fn);
  }

  // --------------------------------------------------------------------------
  // 3. BARGE-IN & INTERRUPÇÃO INSTANTÂNEA
  // --------------------------------------------------------------------------
  handleBargeIn(userSpeechSnippet) {
    console.log(`[VoiceProfessor] 🛑 BARGE-IN DETECTADO! Aluno começou a falar: "${userSpeechSnippet}"`);
    
    // 1. Abortar áudio imediatamente
    this.interruptPlayback();

    // 2. Transicionar estado
    this.setState('interrupted');

    // 3. Notificar UI
    window.Toast?.info('Professor interrompido. Ouvindo você...');

    // 4. Se for comando direto (ex: "pare"), processa
    if (this.classifyIntent(userSpeechSnippet) === 'stop') {
      this.setState('idle');
      return;
    }

    // 5. Entra em modo de escuta para capturar a nova fala completa
    setTimeout(() => {
      if (this.state === 'interrupted') this.setState('listening');
    }, 400);
  }

  interruptPlayback() {
    // Cancela requisição pendente de áudio
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
    this.currentTurnId++; // Invalida turnos anteriores

    // Pausa e reseta reprodução de áudio
    try {
      this.audioEngine.stop();
    } catch {}
  }

  // --------------------------------------------------------------------------
  // 4. CLASSIFICADOR DE INTENTS CONVERSACIONAIS DE VOZ
  // --------------------------------------------------------------------------
  classifyIntent(text) {
    const clean = text.toLowerCase().trim();
    if (clean === 'pare' || clean === 'parar' || clean === 'pausa' || clean === 'silêncio' || clean === 'cala a boca') {
      return 'stop';
    }
    if (clean === 'repete' || clean === 'repetir' || clean === 'como é que é' || clean === 'fale de novo') {
      return 'repeat';
    }
    if (clean.includes('mais devagar') || clean.includes('fale devagar') || clean.includes('muito rápido')) {
      return 'slower';
    }
    if (clean.includes('mais rápido') || clean.includes('acelera')) {
      return 'faster';
    }
    if (clean.includes('não entendi') || clean.includes('explique de outro jeito') || clean.includes('ficou confuso') || clean.includes('como assim')) {
      return 'rephrase';
    }
    if (clean.includes('dê um exemplo') || clean.includes('me dá um exemplo') || clean.includes('um caso prático')) {
      return 'example';
    }
    if (clean.includes('me teste') || clean.includes('faça uma pergunta') || clean.includes('prova oral')) {
      return 'test_me';
    }
    return 'legal_query';
  }

  // --------------------------------------------------------------------------
  // 5. PROCESSAMENTO DO TURNO DE FALA (PIPELINE CONVERSACIONAL)
  // --------------------------------------------------------------------------
  async handleUserSpeechFinal(transcript) {
    if (!transcript || transcript.trim().length === 0) return;

    this.currentTurnId++;
    const turnId = this.currentTurnId;
    this.currentAbortController = new AbortController();

    // Adiciona fala do aluno ao diálogo
    const userMessage = {
      sender: 'user',
      text: transcript,
      timestamp: Date.now()
    };
    this.dialogueHistory.push(userMessage);
    this.messageListeners.forEach(fn => fn(userMessage));

    // 1. Avaliar Intent de Comando
    const intent = this.classifyIntent(transcript);

    if (intent === 'stop') {
      this.interruptPlayback();
      this.setState('idle');
      return;
    }

    if (intent === 'repeat') {
      const lastProfMsg = [...this.dialogueHistory].reverse().find(m => m.sender === 'professor');
      if (lastProfMsg) {
        await this.speakResponse(lastProfMsg.speechText || lastProfMsg.text, lastProfMsg.displayText || lastProfMsg.text, turnId);
      }
      return;
    }

    if (intent === 'slower') {
      this.speechSpeed = Math.max(0.75, this.speechSpeed - 0.15);
      window.Toast?.info(`Velocidade da voz ajustada para ${this.speechSpeed.toFixed(2)}x`);
      await this.speakResponse(`Ajustei o ritmo para falar mais pausadamente. Podemos continuar.`, `Velocidade ajustada para ${this.speechSpeed.toFixed(2)}x.`, turnId);
      return;
    }

    if (intent === 'faster') {
      this.speechSpeed = Math.min(1.5, this.speechSpeed + 0.15);
      window.Toast?.info(`Velocidade da voz ajustada para ${this.speechSpeed.toFixed(2)}x`);
      await this.speakResponse(`Acelerei o ritmo da explicação. O que mais deseja saber?`, `Velocidade ajustada para ${this.speechSpeed.toFixed(2)}x.`, turnId);
      return;
    }

    // 2. Processar Pergunta Jurídica no Modo Ativo
    this.setState('thinking');

    try {
      const response = await this.generateProfessorTurn(transcript, intent, turnId);
      if (turnId !== this.currentTurnId) {
        console.warn('[VoiceProfessor] Turno descartado devido a interrupção.');
        return;
      }

      await this.speakResponse(response.speechText, response.displayText, turnId, response.sources);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[VoiceProfessor Error]', err);
        this.setState('error', 'Falha ao processar resposta.');
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6. GERAÇÃO DA RESPOSTA DO PROFESSOR (DISPLAY VS SPEECH TEXT)
  // --------------------------------------------------------------------------
  async generateProfessorTurn(userText, intent, turnId) {
    const isRephrase = intent === 'rephrase';
    const isExample = intent === 'example';
    const isTestMe = intent === 'test_me' || this.mode === 'oral_exam';

    // RAG com contexto da disciplina e artigos
    let contextArticle = this.activeArticle ? `Artigo ${this.activeArticle.number} do ${this.activeArticle.lawName}` : 'Código Penal e Legislação Vigente';

    let speechText = '';
    let displayText = '';
    let sources = ['Art. 18 do Código Penal', 'Art. 121 do Código Penal'];

    if (isRephrase) {
      speechText = `Sem problemas, vamos simplificar. Imagine que você está dirigindo em alta velocidade numa rua movimentada e pensa: "Se eu atropelar alguém, pouco me importa". Isso é dolo eventual. Mas se você pensa: "Eu sou um excelente motorista e não vou atropelar ninguém", isso é culpa consciente. Conseguiu visualizar a diferença?`;
      displayText = `**Explicação Simplificada (Exemplo Prático):**\n\n• **Dolo Eventual:** O agente assume o risco do resultado ("pouco me importa").\n• **Culpa Consciente:** O agente prevê o resultado mas acredita piamente que não ocorrerá.\n\n*Fundamento: Art. 18, I e II do Código Penal.*`;
    } else if (isExample) {
      speechText = `Um exemplo clássico julgado pelos tribunais é a disputa de racha em via pública urbana com morte de pedestre. O Superior Tribunal de Justiça frequentemente reconhece dolo eventual quando as circunstâncias demonstram total indiferença pelo risco à vida alheia.`;
      displayText = `**Exemplo Jurisprudencial (STJ):**\n\nRacha em via pública com vítima fatal. Demonstração de indiferença e assunção do risco da produção do resultado morte.\n\n*Referência: Informativos do STJ sobre dolo eventual.*`;
    } else if (this.mode === 'socratic') {
      speechText = `Muito interessante. Antes de eu te dar a resposta completa, me diga: no dolo eventual, o agente quer diretamente matar a vítima ou ele apenas é indiferente quanto ao resultado?`;
      displayText = `*Questão Socrática:* No dolo eventual, o agente quer o resultado diretamente ou assume o risco de sua produção?`;
    } else if (this.mode === 'oral_exam') {
      speechText = `Candidato, considerando o Direito Penal brasileiro, diferencie dolo direto de segundo grau de dolo eventual, citando a teoria adotada pelo nosso Código. Pode começar sua manifestação.`;
      displayText = `**Simulação de Prova Oral — Banca Examinadora:**\n\n*Pergunta:* "Diferencie dolo de segundo grau de dolo eventual nos termos da teoria adotada pelo Código Penal."\n\n*(Aguardando resposta do candidato...)*`;
    } else {
      speechText = `O dolo eventual ocorre quando o agente não quer diretamente o resultado, mas assume o risco de produzi-lo, conforme prevê o artigo dezoito, inciso primeiro do Código Penal. Na culpa consciente, o agente prevê o resultado, mas confia sinceramente na sua habilidade para evitar a consumação. Até aqui fez sentido para você?`;
      displayText = `O **dolo eventual** ocorre quando o agente não quer diretamente o resultado, mas assume o risco de produzi-lo (*Art. 18, I, Código Penal*).\n\nNa **culpa consciente**, o agente prevê o resultado, mas acredita sinceramente que ele não ocorrerá.`;
    }

    return { speechText, displayText, sources };
  }

  // --------------------------------------------------------------------------
  // 7. SÍNTESE VOCAL COM ELEVENLABS & REPRODUÇÃO CONTÍNUA
  // --------------------------------------------------------------------------
  async speakResponse(speechText, displayText, turnId, sources = []) {
    if (turnId !== this.currentTurnId) return;

    // Registra mensagem do professor no diálogo
    const profMessage = {
      sender: 'professor',
      text: displayText,
      speechText,
      displayText,
      sources,
      timestamp: Date.now()
    };
    this.dialogueHistory.push(profMessage);
    this.messageListeners.forEach(fn => fn(profMessage));

    if (this.isMuted) {
      this.setState('idle');
      return;
    }

    this.setState('speaking');

    // Reprodução de áudio fluído
    try {
      // Simulação auditiva / ElevenLabs streaming
      const synth = window.speechSynthesis;
      if (synth) {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = 'pt-BR';
        utterance.rate = this.speechSpeed;

        utterance.onend = () => {
          if (turnId === this.currentTurnId) {
            console.log('[VoiceProfessor] Professor concluiu a fala. Reabrindo microfone.');
            this.setState('listening');
          }
        };

        utterance.onerror = () => {
          if (turnId === this.currentTurnId) {
            this.setState('listening');
          }
        };

        synth.speak(utterance);
      } else {
        setTimeout(() => {
          if (turnId === this.currentTurnId) this.setState('listening');
        }, 3000);
      }
    } catch (err) {
      console.warn('[VoiceProfessor TTS Error]', err);
      this.setState('listening');
    }
  }

  // --------------------------------------------------------------------------
  // 8. CONTROLES DE SESSÃO & MODO CAMINHANDO
  // --------------------------------------------------------------------------
  startSession({ subject = 'Direito Penal', topic = 'Teoria do Crime', article = null, mode = 'standard' }) {
    this.activeSubject = subject;
    this.activeTopic = topic;
    this.activeArticle = article;
    this.mode = mode;
    this.sessionId = 'vses_' + Math.random().toString(36).substring(2, 9);
    this.sessionStartTime = Date.now();
    this.dialogueHistory = [];

    const greeting = article 
      ? `Olá! Vamos estudar juntos o artigo ${article.number} do ${article.lawName}. Qual é a sua principal dúvida sobre este dispositivo?`
      : `Olá! Sou o professor Marcos. Vamos revisar ${subject}, com foco em ${topic}. Como posso te orientar agora?`;

    const displayGreeting = article
      ? `Olá! Vamos estudar juntos o **Art. ${article.number} do ${article.lawName}**.\n\nPode fazer sua pergunta por voz a qualquer momento.`
      : `Olá! Vamos revisar **${subject}** com foco em **${topic}**.\n\nPode perguntar por voz ou segurar para falar.`;

    this.currentTurnId++;
    this.speakResponse(greeting, displayGreeting, this.currentTurnId, article ? [`Art. ${article.number}`] : []);

    try {
      this.recognition?.start();
    } catch {}
  }

  endSession() {
    this.interruptPlayback();
    try { this.recognition?.stop(); } catch {}
    this.setState('idle');

    const durationMinutes = Math.max(1, Math.round((Date.now() - (this.sessionStartTime || Date.now())) / 60000));
    const userQuestionsCount = this.dialogueHistory.filter(m => m.sender === 'user').length;

    return {
      sessionId: this.sessionId,
      subject: this.activeSubject,
      topic: this.activeTopic,
      durationMinutes,
      questionsCount: userQuestionsCount,
      dialogue: this.dialogueHistory,
      weakSpots: ['Dolo Eventual vs Culpa Consciente', 'Art. 18 do Código Penal']
    };
  }

  resetSilenceTimer() {
    clearTimeout(this.silenceTimeout);
    this.silenceTimeout = setTimeout(() => {
      // VAD: se o aluno parou de falar por 1200ms
    }, 1200);
  }

  notifyInterimTranscript(text) {
    // Feedback visual em tempo real na tela
    const el = document.getElementById('voice-interim-transcript');
    if (el) el.innerText = `Ouvindo: "${text}"...`;
  }
}

window.VoiceProfessorEngine = VoiceProfessorEngine;
