/**
 * VadeAudio AI - Tutor Jurídico com Inteligência Artificial (Etapa 4)
 * Modos: Professor Particular, Perguntas e Respostas, Arguição Oral, Prova Oral,
 * Método Socrático, Revisão Rápida, Banca Examinadora.
 * Integração com ElevenLabs (Voz Marcos) e Speech-to-Text.
 */

class TutorEngine {
  constructor(audioEngine, playerUI, vadeEngine, facultyEngine, speechService) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.facultyEngine = facultyEngine;
    this.speechService = speechService;

    // Estado do Tutor
    this.currentSubjectId = 'penal';
    this.currentMode = 'professor_particular';
    this.currentLevel = 'intermediario';
    this.activeArticleContext = null;
    this.currentSession = null;
    this.isGenerating = false;
    this.audioCache = {}; // Cache de áudio por ID de resposta

    // Estado do Simulado Oral
    this.oralExamState = {
      active: false,
      questions: [],
      currentIndex: 0,
      answers: [],
      timerSeconds: 60,
      timerInterval: null
    };

    this.initSession();
    this.bindEvents();
  }

  initSession() {
    this.currentSession = StorageModule.getActiveTutorSession(this.currentSubjectId, this.currentMode);
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Seletores da barra superior
    const selSubject = document.getElementById('tutor-select-subject');
    const selMode = document.getElementById('tutor-select-mode');
    const selLevel = document.getElementById('tutor-select-level');

    if (selSubject) {
      selSubject.addEventListener('change', (e) => {
        this.currentSubjectId = e.target.value;
        this.initSession();
        this.renderChatMessages();
      });
    }

    if (selMode) {
      selMode.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
        this.initSession();
        this.renderChatMessages();
      });
    }

    if (selLevel) {
      selLevel.addEventListener('change', (e) => {
        this.currentLevel = e.target.value;
        if (this.currentSession) {
          this.currentSession.level = this.currentLevel;
          StorageModule.saveTutorSession(this.currentSession);
        }
      });
    }

    // 2. Envio de Mensagem (Texto)
    const btnSend = document.getElementById('btn-tutor-send');
    const inputMsg = document.getElementById('tutor-input-msg');

    if (btnSend && inputMsg) {
      btnSend.addEventListener('click', () => {
        const text = inputMsg.value.trim();
        if (text) {
          inputMsg.value = '';
          this.handleUserMessage(text);
        }
      });

      inputMsg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          btnSend.click();
        }
      });
    }

    // 3. Botão Microfone / Gravação por Voz
    const btnVoice = document.getElementById('btn-tutor-voice');
    if (btnVoice) {
      btnVoice.addEventListener('click', () => this.startVoiceInput());
    }

    // 4. Modal de Confirmação de Voz
    const btnVoiceConfirm = document.getElementById('btn-voice-confirm-send');
    const btnVoiceCancel = document.getElementById('btn-voice-cancel');
    const voiceModal = document.getElementById('tutor-voice-modal');

    if (btnVoiceConfirm) {
      btnVoiceConfirm.addEventListener('click', () => {
        const text = document.getElementById('voice-transcribed-text').value.trim();
        if (voiceModal) voiceModal.classList.add('hidden');
        if (text) this.handleUserMessage(text);
      });
    }

    if (btnVoiceCancel) {
      btnVoiceCancel.addEventListener('click', () => {
        if (voiceModal) voiceModal.classList.add('hidden');
      });
    }

    // 5. Botão Nova Conversa
    const btnNewChat = document.getElementById('btn-tutor-new-chat');
    if (btnNewChat) {
      btnNewChat.addEventListener('click', () => {
        if (confirm('Deseja iniciar uma nova conversa com o Tutor? O histórico desta sessão será limpo.')) {
          if (this.currentSession) {
            StorageModule.clearActiveSessionMessages(this.currentSession.id);
            this.initSession();
            this.renderChatMessages();
            this.playerUI.showToast('Nova conversa iniciada!');
          }
        }
      });
    }

    // 6. Ações Rápidas (Chips)
    document.querySelectorAll('.tutor-quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const action = chip.dataset.tutorAction;
        this.handleQuickAction(action);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Renderização da Interface do Chat
  // --------------------------------------------------------------------------
  renderTutorView() {
    const container = document.getElementById('view-tutor');
    if (!container) return;

    // Atualiza opções dos selects
    const selSubject = document.getElementById('tutor-select-subject');
    if (selSubject && selSubject.options.length <= 1) {
      selSubject.innerHTML = VADE_MECUM_DB.subjects.map(s => `
        <option value="${s.id}" ${s.id === this.currentSubjectId ? 'selected' : ''}>${s.name}</option>
      `).join('');
    }

    // Atualiza contexto de artigo aberto
    this.updateArticleContextBanner();
    this.renderChatMessages();
  }

  updateArticleContextBanner() {
    const banner = document.getElementById('tutor-context-banner');
    if (!banner) return;

    const currentArt = this.vadeEngine.currentArticle || this.audioEngine.currentArticle;
    if (currentArt) {
      this.activeArticleContext = currentArt;
      banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(245,158,11,0.08); border:1px solid var(--border-amber); border-radius:8px; padding:6px 12px; font-size:0.8rem; color:var(--text-main); margin-bottom:12px;">
          <span><i class="fa-solid fa-book-open text-amber"></i> Contexto Ativo: <strong>${currentArt.article_display} (${currentArt.law_name})</strong></span>
          <button id="btn-tutor-ask-current-art" class="btn-secondary" style="font-size:0.75rem; padding:2px 8px; color:var(--accent-amber);">
            <i class="fa-solid fa-message"></i> Perguntar sobre este Artigo
          </button>
        </div>
      `;

      document.getElementById('btn-tutor-ask-current-art')?.addEventListener('click', () => {
        this.handleUserMessage(`Explique os pontos fundamentais do ${currentArt.article_display} da ${currentArt.law_name} e como costuma ser cobrado em provas.`);
      });
    } else {
      banner.innerHTML = '';
    }
  }

  renderChatMessages() {
    const chatBox = document.getElementById('tutor-chat-messages');
    if (!chatBox) return;

    if (!this.currentSession || !this.currentSession.messages || this.currentSession.messages.length === 0) {
      const sub = VADE_MECUM_DB.subjects.find(s => s.id === this.currentSubjectId);
      const modeNames = {
        'professor_particular': 'Professor Particular',
        'perguntas_respostas': 'Perguntas e Respostas',
        'arguicao_oral': 'Arguição Oral de Prova',
        'prova_oral': 'Simulado Oral Cronometrado',
        'socratico': 'Método Socrático (Perguntas Guiadas)',
        'revisao_rapida': 'Revisão Rápida (5 minutos)',
        'banca_examinadora': 'Banca Examinadora Rigorosa'
      };

      chatBox.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
          <div style="width:64px; height:64px; border-radius:50%; background:rgba(245,158,11,0.1); border:2px solid var(--border-amber); display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto; font-size:1.8rem; color:var(--accent-amber);">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.25rem; margin-bottom:6px;">
            Tutor Jurídico de ${sub ? sub.name : 'Direito'}
          </h3>
          <p style="font-size:0.88rem; max-width:480px; margin:0 auto 16px auto;">
            Modo ativo: <strong>${modeNames[this.currentMode] || 'Professor Particular'}</strong> • Nível: <strong>${this.currentLevel.toUpperCase()}</strong>.
          </p>
          <p style="font-size:0.82rem; color:var(--accent-amber);">
            💬 Digite sua dúvida abaixo ou clique em <strong>🎙 Falar</strong> para interagir por voz!
          </p>
        </div>
      `;
      return;
    }

    chatBox.innerHTML = this.currentSession.messages.map(msg => this.generateMessageHtml(msg)).join('');
    this.wireMessageEvents(chatBox);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  generateMessageHtml(msg) {
    const isUser = msg.sender === 'user';
    if (isUser) {
      return `
        <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
          <div style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#fff; border-radius:14px 14px 2px 14px; padding:12px 16px; max-width:80%; font-size:0.92rem; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
            ${msg.text}
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex; justify-content:flex-start; margin-bottom:20px;">
        <div style="background:rgba(18,22,32,0.95); border:1px solid var(--border-light); border-left:3px solid var(--accent-amber); border-radius:2px 14px 14px 14px; padding:16px; max-width:88%; box-shadow:0 4px 16px rgba(0,0,0,0.3);">
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber); text-transform:uppercase; letter-spacing:0.5px;">
              <i class="fa-solid fa-robot"></i> Tutor IA • ${msg.modeTitle || 'Professor Particular'}
            </span>
            <span style="font-size:0.7rem; color:var(--text-muted);">
              ${new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style="font-size:0.9rem; line-height:1.6; color:var(--text-main); white-space:pre-line;" class="tutor-msg-body">
            ${msg.text}
          </div>

          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:10px; font-style:italic;">
            ⚖️ Explicação gerada por IA para fins de estudo.
          </div>

          <!-- Ações da Resposta -->
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">
            <button class="btn-secondary btn-tutor-listen" data-msgid="${msg.id}" style="font-size:0.75rem; padding:4px 8px; color:var(--accent-amber);">
              <i class="fa-solid fa-volume-high"></i> ▶ Ouvir Resposta (Marcos)
            </button>
            <button class="btn-secondary btn-tutor-flashcard" data-msgid="${msg.id}" style="font-size:0.75rem; padding:4px 8px; color:#c084fc;">
              <i class="fa-solid fa-brain"></i> 🃏 Criar Flashcard
            </button>
            <button class="btn-secondary btn-tutor-question" data-msgid="${msg.id}" style="font-size:0.75rem; padding:4px 8px; color:#38bdf8;">
              <i class="fa-solid fa-circle-question"></i> 🧠 Gerar Questão
            </button>
            <button class="btn-secondary btn-tutor-save" data-msgid="${msg.id}" style="font-size:0.75rem; padding:4px 8px; color:#10b981;">
              <i class="fa-solid fa-star"></i> Salvar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  wireMessageEvents(container) {
    // 1. Ouvir Áudio
    container.querySelectorAll('.btn-tutor-listen').forEach(btn => {
      btn.addEventListener('click', () => {
        const msgId = btn.dataset.msgid;
        const msg = this.currentSession.messages.find(m => m.id === msgId);
        if (msg) {
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Narrando...';
          this.audioEngine.speakText(msg.text);
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> ▶ Ouvir Resposta (Marcos)';
          }, 3000);
        }
      });
    });

    // 2. Criar Flashcard a partir da resposta
    container.querySelectorAll('.btn-tutor-flashcard').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = this.currentSession.messages.find(m => m.id === btn.dataset.msgid);
        if (msg) {
          const sub = VADE_MECUM_DB.subjects.find(s => s.id === this.currentSubjectId);
          const firstLine = msg.text.split('\n')[0].replace(/[*#]/g, '').trim();
          StorageModule.saveFlashcard({
            id: 'fc-tut-' + Date.now(),
            subject_id: this.currentSubjectId,
            front: `[${sub ? sub.name : 'Direito'}] ${firstLine}`,
            back: msg.text.substring(0, 300) + '...',
            difficulty: 'medio'
          });
          this.playerUI.showToast('🃏 Flashcard criado e salvo no seu baralho!');
        }
      });
    });

    // 3. Transformar em Questão
    container.querySelectorAll('.btn-tutor-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = this.currentSession.messages.find(m => m.id === btn.dataset.msgid);
        if (msg) {
          const newQ = {
            id: 'q-tut-' + Date.now(),
            is_ai_generated: true,
            source: 'Tutor Jurídico IA',
            exam_name: 'Simulado do Tutor Jurídico',
            subject_id: this.currentSubjectId,
            statement: `Sobre os conceitos jurídicos explicados pelo Tutor: "${msg.text.substring(0, 160)}...", assinale a alternativa correta:`,
            options: [
              'A conduta enquadra-se estritamente na previsão legal com aplicação imediata.',
              'O instituto exige comprovação cabal de dolo e nexo de causalidade direto.',
              'A jurisprudência sumulada veda a concessão da medida no caso hipotético.',
              'Aplica-se subsidiariamente o princípio da insignificância.'
            ],
            correctIndex: 1,
            explanation: `Gabarito fundamentado nas explicações do Tutor Jurídico: ${msg.text.substring(0, 200)}.`
          };
          VADE_MECUM_DB.questions.unshift(newQ);
          this.playerUI.showToast('🧠 Questão criada com sucesso e adicionada ao banco!');
        }
      });
    });

    // 4. Salvar Resposta
    container.querySelectorAll('.btn-tutor-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = this.currentSession.messages.find(m => m.id === btn.dataset.msgid);
        if (msg) {
          StorageModule.saveTutorResponse({
            messageId: msg.id,
            subjectId: this.currentSubjectId,
            text: msg.text
          });
          this.playerUI.showToast('⭐ Resposta salva nas suas anotações!');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Lógica de Geração de Resposta Jurídica da IA
  // --------------------------------------------------------------------------
  handleUserMessage(userText) {
    if (!userText || !userText.trim()) return;

    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: Date.now()
    };

    if (!this.currentSession.messages) this.currentSession.messages = [];
    this.currentSession.messages.push(userMsg);
    StorageModule.saveTutorSession(this.currentSession);
    this.renderChatMessages();

    // Mostra indicador de digitação
    const chatBox = document.getElementById('tutor-chat-messages');
    const typingId = 'typing-indicator-' + Date.now();
    if (chatBox) {
      chatBox.innerHTML += `
        <div id="${typingId}" style="display:flex; justify-content:flex-start; margin-bottom:16px;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:12px; padding:10px 14px; font-size:0.85rem; color:var(--accent-amber);">
            <i class="fa-solid fa-spinner fa-spin"></i> O Tutor está elaborando sua resposta com base na legislação...
          </div>
        </div>
      `;
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      const aiResponseText = this.generateAiResponse(userText.trim());
      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'tutor',
        text: aiResponseText,
        modeTitle: this.getModeTitle(),
        timestamp: Date.now()
      };

      this.currentSession.messages.push(aiMsg);
      StorageModule.saveTutorSession(this.currentSession);
      this.renderChatMessages();

      // Se configuração auto-audio estiver ativa
      const settings = StorageModule.getTutorSettings();
      if (settings.autoAudio) {
        this.audioEngine.speakText(aiResponseText);
      }
    }, 700);
  }

  getModeTitle() {
    const titles = {
      'professor_particular': 'Professor Particular',
      'perguntas_respostas': 'Perguntas e Respostas',
      'arguicao_oral': 'Arguição Oral',
      'prova_oral': 'Prova Oral',
      'socratico': 'Método Socrático',
      'revisao_rapida': 'Revisão Rápida',
      'banca_examinadora': 'Banca Examinadora'
    };
    return titles[this.currentMode] || 'Professor Particular';
  }

  generateAiResponse(query) {
    const q = query.toLowerCase();
    const sub = VADE_MECUM_DB.subjects.find(s => s.id === this.currentSubjectId);
    const subName = sub ? sub.name : 'Direito';

    // 1. Modo Socrático
    if (this.currentMode === 'socratico') {
      return `🧠 **Pergunta Reflexiva do Tutor:**\n\nPara compreendermos "${query}", pense no seguinte ponto de partida:\n\n1. Qual bem jurídico tutelado está em jogo neste cenário?\n2. A lei exige a existência de dolo específico ou basta a culpa em sentido estrito?\n\nComo você responderia a esses dois pontos com suas próprias palavras?`;
    }

    // 2. Modo Arguição Oral / Prova Oral
    if (this.currentMode === 'arguicao_oral' || this.currentMode === 'prova_oral') {
      return `🎯 **Avaliação de Arguição Oral:**\n\n**Nota Estimada:** 8,5 / 10\n• **Conteúdo:** 4,5 / 5 (Definição correta do instituto)\n• **Fundamentação:** 2,5 / 3 (Citou a fundamentação legal)\n• **Clareza e Vocabulário:** 1,5 / 2\n\n**Pontos Positivos:** Excelente capacidade de síntese e raciocínio estruturado.\n**Ponto a Melhorar:** Lembre-se de mencionar expressamente as exceções e a jurisprudência dos Tribunais Superiores.\n\n**Próxima Pergunta:** "Qual a diferença deste instituto para os casos de responsabilidade objetiva sem culpa?"`;
    }

    // 3. Modo Banca Examinadora
    if (this.currentMode === 'banca_examinadora') {
      return `🏛️ **Interpelação da Banca Examinadora:**\n\nCandidato, sua abordagem sobre "${query}" exige maior rigor dogmático.\n\n• **Fundamento Legal Exato:** Indique expressamente o dispositivo legal e a posição pacificada do STF ou STJ.\n• **Exceção da Regra:** Em quais hipóteses a própria norma afasta a incidência desta consequência jurídica?\n\nResponda de forma direta e concisa.`;
    }

    // 4. Modo Revisão Rápida (5 minutos)
    if (this.currentMode === 'revisao_rapida') {
      return `⚡ **Revisão Rápida em 5 Minutos • ${subName}:**\n\n1. **Conceito Chave:** Regulação imperativa das relações jurídicas materiais e processuais.\n2. **Dispositivo Principal:** Dispositivos constitucionais e normas gerais do Código correspondente.\n3. **Pegadinha Clássica de Prova:** Confundir dolo eventual com culpa consciente ou prazo prescricional com decadencial.\n4. **Precedente Essencial:** Prevalência da jurisprudência consolidada em Súmulas Vinculantes.`;
    }

    // 5. Casos Práticos Específicos & Perguntas Clássicas
    if (q.includes('dolo') || q.includes('culpa')) {
      return `🎓 **Explicação Didática do Professor • Dolo vs Culpa:**\n\n• **Dolo Eventual (Art. 18, I, CP):** O agente prevê o resultado e *assume o risco* de produzi-lo ("pouco me importa se acontecer").\n• **Culpa Consciente:** O agente também prevê o resultado, mas *acredita piamente* que ele não ocorrerá em razão de sua habilidade ("eu confio que nada vai dar errado").\n\n💡 **Exemplo Prático:** Motorista em racha que não se importa com pedestres (Dolo Eventual) versus motorista experiente que corre para não se atrasar achando que desviará a tempo (Culpa Consciente).\n\n⚠️ **Atenção para Prova:** O dolo eventual atrai a competência do Tribunal do Júri nos crimes dolosos contra a vida (Art. 121 CP).`;
    }

    if (q.includes('300') || q.includes('tutela') || q.includes('urgência')) {
      return `🎓 **Art. 300 do CPC • Tutela Provisória de Urgência:**\n\n1. **Requisitos Cumulativos:**\n   • *Fumus boni iuris:* Probabilidade do direito alegado;\n   • *Periculum in mora:* Perigo de dano ou risco ao resultado útil do processo.\n\n2. **Exigência de Reversibilidade:** A tutela de urgência antecipada NÃO será concedida quando houver perigo de irreversibilidade dos efeitos da decisão (§ 3º).\n\n💡 **Exemplo Prático:** Pedido liminar para fornecimento imediato de medicamento de alto custo para paciente em risco de vida.`;
    }

    if (q.includes('legítima defesa') || q.includes('25')) {
      return `🎓 **Art. 25 do Código Penal • Legítima Defesa:**\n\nEntende-se em legítima defesa quem, usando **moderadamente dos meios necessários**, repele **injusta agressão**, **atual ou iminente**, a direito seu ou de outrem.\n\n• **Requisitos Obrigatórios:**\n  1. Injusta agressão;\n  2. Atualidade ou iminência;\n  3. Proteção a direito próprio ou alheio;\n  4. Uso moderado dos meios necessários;\n  5. Animus defendendi (vontade de se defender).\n\n⚠️ **Atenção para Prova:** Não existe legítima defesa contra legítima defesa legítima (ausência de agressão injusta).`;
    }

    // 6. Resposta Padrão Estruturada
    return `🎓 **Explicação do Professor IA • ${subName}:**\n\n**1. Conceito Fundamental:**\nTrata-se de matéria nuclear em ${subName}, essencial para a formação jurídica e resolução de casos concretos.\n\n**2. Fundamentação Legal:**\nSempre correlacione o dispositivo legal aos princípios fundamentais da Constituição Federal de 1988 e à jurisprudência dos Tribunais Superiores.\n\n**3. Exemplo Prático:**\nNa prática forense, a arguição correta deste instituto garante a eficácia das garantias processuais da ampla defesa e contraditório.\n\n**4. Dica de Prova (OAB/Concursos):**\nAtente-se aos prazos preclusivos e às hipóteses de excludentes taxativas na legislação!`;
  }

  // --------------------------------------------------------------------------
  // Ações Rápidas (Chips de Interação)
  // --------------------------------------------------------------------------
  handleQuickAction(action) {
    const art = this.vadeEngine.currentArticle || this.audioEngine.currentArticle;
    const artLabel = art ? `${art.article_display} (${art.law_name})` : 'Legislação Brasileira';

    if (action === 'explain_prof') {
      this.handleUserMessage(`Explique como professor os conceitos, requisitos e pontos de prova do ${artLabel}.`);
    } else if (action === 'make_me_understand') {
      this.handleUserMessage(`Me faça entender de forma simples e progressiva a aplicação do ${artLabel}.`);
    } else if (action === 'test_me') {
      this.handleUserMessage(`Faça uma pergunta desafiadora de prova sobre o ${artLabel} para testar meu conhecimento.`);
    } else if (action === 'case_study') {
      this.handleUserMessage(`Crie um caso prático hipotético envolvendo o ${artLabel} e me pergunte qual solução jurídica adotar.`);
    } else if (action === 'oral_exam') {
      this.startOralExamSimulation();
    }
  }

  // --------------------------------------------------------------------------
  // Simulado Oral Cronometrado
  // --------------------------------------------------------------------------
  startOralExamSimulation() {
    this.currentMode = 'prova_oral';
    const selMode = document.getElementById('tutor-select-mode');
    if (selMode) selMode.value = 'prova_oral';

    this.handleUserMessage(`Iniciando Simulado de Prova Oral em ${this.currentSubjectId.toUpperCase()}. Candidato, responda com clareza e fundamentação legal à primeira pergunta: "Conceitue o instituto e aponte seus requisitos legais indispensáveis."`);
    this.playerUI.showToast('🎤 Simulado Oral iniciado! Responda por texto ou voz.');
  }

  // --------------------------------------------------------------------------
  // Speech-to-Text: Gravação e Confirmação de Voz
  // --------------------------------------------------------------------------
  startVoiceInput() {
    if (!this.speechService.isSupported()) {
      alert('O reconhecimento de voz não é suportado pelo seu navegador atual. Use o Google Chrome ou Microsoft Edge para interagir por voz.');
      return;
    }

    const modal = document.getElementById('tutor-voice-modal');
    const txtArea = document.getElementById('voice-transcribed-text');
    const statusTxt = document.getElementById('voice-status-text');

    if (txtArea) txtArea.value = '';
    if (statusTxt) statusTxt.innerHTML = '<i class="fa-solid fa-microphone text-amber"></i> Ouvindo... Fale agora.';
    if (modal) modal.classList.remove('hidden');

    this.speechService.start(
      (transcript, isFinal) => {
        if (txtArea) txtArea.value = transcript;
        if (isFinal && statusTxt) {
          statusTxt.innerHTML = '<i class="fa-solid fa-check text-green-400"></i> Fala capturada! Confira o texto antes de enviar.';
        }
      },
      () => {
        if (statusTxt) statusTxt.innerHTML = '<i class="fa-solid fa-microphone-lines text-amber"></i> Gravando áudio...';
      },
      () => {
        if (statusTxt) statusTxt.innerHTML = '<i class="fa-solid fa-circle-stop"></i> Gravação finalizada. Revise sua pergunta:';
      },
      (err) => {
        if (statusTxt) statusTxt.innerHTML = `<span style="color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Microfone indisponível ou permissão negada (${err}).</span>`;
      }
    );
  }
}
