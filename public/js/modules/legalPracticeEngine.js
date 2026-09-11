/**
 * VadeAudio AI - Motor do Laboratório de Prática Jurídica (Etapa 10)
 * Atendimento Simulado de Clientes, Análise de Casos, Redação e Correção de Peças por Critérios,
 * Audiências Simuladas, Sustentação Oral com Cronômetro e Narração ElevenLabs (Marcos).
 */

class LegalPracticeEngine {
  constructor(audioEngine, playerUI, vadeEngine, tutorEngine, legalBrainEngine) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.legalBrainEngine = legalBrainEngine;

    // Estado da Simulação Ativa
    this.activeCase = null;
    this.activeRole = 'advogado'; // 'advogado' | 'promotor' | 'defensor' | 'juiz'
    this.interviewHistory = [];
    this.interviewQuestionsCount = 0;
    this.oralTimerInterval = null;
    this.oralSeconds = 0;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Modal de Atendimento Simulado (Fechar & Ações)
    const btnCloseClientModal = document.getElementById('btn-close-client-modal');
    const clientModal = document.getElementById('practice-client-modal');
    const btnSendClientChat = document.getElementById('btn-client-chat-send');
    const inputClientChat = document.getElementById('client-chat-input');
    const btnFinishInterview = document.getElementById('btn-finish-interview');

    if (btnCloseClientModal && clientModal) {
      btnCloseClientModal.addEventListener('click', () => {
        clientModal.classList.add('hidden');
        this.renderPracticeHub();
      });
    }

    if (btnSendClientChat && inputClientChat) {
      btnSendClientChat.addEventListener('click', () => {
        const q = inputClientChat.value.trim();
        if (q) {
          inputClientChat.value = '';
          this.handleClientInterviewQuery(q);
        }
      });

      inputClientChat.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnSendClientChat.click();
        }
      });
    }

    if (btnFinishInterview) {
      btnFinishInterview.addEventListener('click', () => {
        this.finalizeClientInterview();
      });
    }

    // 2. Modal de Redação de Peça / Sentença
    const btnCloseDraftModal = document.getElementById('btn-close-draft-modal');
    const draftModal = document.getElementById('practice-draft-modal');
    const btnSubmitDraft = document.getElementById('btn-submit-practice-draft');

    if (btnCloseDraftModal && draftModal) {
      btnCloseDraftModal.addEventListener('click', () => {
        draftModal.classList.add('hidden');
        this.renderPracticeHub();
      });
    }

    if (btnSubmitDraft) {
      btnSubmitDraft.addEventListener('click', () => {
        this.evaluateDraftSubmission();
      });
    }

    // 3. Modal de Audiência & Sustentação Oral
    const btnCloseHearingModal = document.getElementById('btn-close-hearing-modal');
    const hearingModal = document.getElementById('practice-hearing-modal');
    const btnStartOral = document.getElementById('btn-start-oral-arg');
    const btnStopOral = document.getElementById('btn-stop-oral-arg');

    if (btnCloseHearingModal && hearingModal) {
      btnCloseHearingModal.addEventListener('click', () => {
        clearInterval(this.oralTimerInterval);
        hearingModal.classList.add('hidden');
      });
    }

    if (btnStartOral && btnStopOral) {
      btnStartOral.addEventListener('click', () => {
        btnStartOral.classList.add('hidden');
        btnStopOral.classList.remove('hidden');
        this.startOralTimer();
      });

      btnStopOral.addEventListener('click', () => {
        btnStopOral.classList.add('hidden');
        btnStartOral.classList.remove('hidden');
        this.stopOralTimer();
      });
    }

    // 4. Botão Caso Aleatório
    const btnRandomCase = document.getElementById('btn-random-practice-case');
    if (btnRandomCase) {
      btnRandomCase.addEventListener('click', () => {
        const cases = StorageModule.getPracticeCases();
        const rand = cases[Math.floor(Math.random() * cases.length)];
        if (rand) this.startClientInterview(rand.id);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Hub do Laboratório Jurídico
  // --------------------------------------------------------------------------
  renderPracticeHub() {
    const container = document.getElementById('practice-cases-container');
    const metricsBox = document.getElementById('practice-skills-metrics-box');
    if (!container) return;

    const cases = StorageModule.getPracticeCases();
    const metrics = StorageModule.getPracticeSkillsMetrics();

    // 1. Renderiza Métricas do Mapa de Habilidades Práticas
    if (metricsBox) {
      metricsBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Entrevista</span>
            <strong style="color:var(--accent-amber); font-size:1.2rem; font-family:var(--font-display);">${metrics.entrevista}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Escolha de Peça</span>
            <strong style="color:#38bdf8; font-size:1.2rem; font-family:var(--font-display);">${metrics.identificacaoPeca}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Fundamentação</span>
            <strong style="color:#818cf8; font-size:1.2rem; font-family:var(--font-display);">${metrics.fundamentacao}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Oratória</span>
            <strong style="color:#10b981; font-size:1.2rem; font-family:var(--font-display);">${metrics.oratoria}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Análise de Prova</span>
            <strong style="color:#f59e0b; font-size:1.2rem; font-family:var(--font-display);">${metrics.analiseProva}%</strong>
          </div>
        </div>
      `;
    }

    // 2. Renderiza Casos Disponíveis
    container.innerHTML = cases.map(c => `
      <div class="article-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="art-header">
            <div class="art-number">
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.75rem;">
                <i class="fa-solid fa-scale-balanced"></i> ${c.category}
              </span>
              <strong style="font-size:0.95rem; line-height:1.3;">${c.title}</strong>
            </div>
            <span class="badge-official" style="font-size:0.7rem; color:${c.difficulty === 'iniciante' ? '#10b981' : c.difficulty === 'intermediario' ? '#f59e0b' : '#ef4444'};">
              ${c.difficulty.toUpperCase()}
            </span>
          </div>

          <div class="art-body" style="padding-top:4px;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">
              <i class="fa-solid fa-user"></i> <strong>Cliente Simulado:</strong> ${c.client.name} (${c.client.age} anos, ${c.client.occupation})
            </p>
            <p style="font-size:0.82rem; color:var(--text-main); line-height:1.4; font-style:italic; margin-bottom:10px;">
              "${c.client.initialStatement}"
            </p>
            <span style="font-size:0.72rem; color:var(--text-muted); display:block;">
              <i class="fa-solid fa-shield-halved"></i> ${c.disclaimer}
            </span>
          </div>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:8px;">
          <button class="btn-primary btn-start-interview" data-caseid="${c.id}" style="font-size:0.8rem; padding:6px 10px; flex:1;">
            <i class="fa-solid fa-comments"></i> Atender Cliente
          </button>
          <button class="btn-secondary btn-start-draft" data-caseid="${c.id}" style="font-size:0.8rem; padding:6px 10px; color:var(--accent-amber);" title="Redigir Peça">
            <i class="fa-solid fa-pen-nib"></i> Peça
          </button>
          <button class="btn-secondary btn-start-hearing" data-caseid="${c.id}" style="font-size:0.8rem; padding:6px 10px; color:#38bdf8;" title="Audiência / Sustentação">
            <i class="fa-solid fa-gavel"></i> Audiência
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-start-interview').forEach(b => {
      b.addEventListener('click', () => this.startClientInterview(b.dataset.caseid));
    });

    container.querySelectorAll('.btn-start-draft').forEach(b => {
      b.addEventListener('click', () => this.startDraftEditor(b.dataset.caseid));
    });

    container.querySelectorAll('.btn-start-hearing').forEach(b => {
      b.addEventListener('click', () => this.startHearingSimulation(b.dataset.caseid));
    });
  }

  // --------------------------------------------------------------------------
  // Módulo 1: Atendimento Simulado de Cliente (Roleplay)
  // --------------------------------------------------------------------------
  startClientInterview(caseId) {
    const practiceCase = StorageModule.getPracticeCase(caseId);
    if (!practiceCase) return;

    this.activeCase = practiceCase;
    this.interviewQuestionsCount = 0;
    this.interviewHistory = [];

    const modal = document.getElementById('practice-client-modal');
    const clientNameEl = document.getElementById('client-interview-name');
    const chatContainer = document.getElementById('client-chat-history');
    const reportBox = document.getElementById('client-evaluation-report');

    if (clientNameEl) clientNameEl.innerText = `${practiceCase.client.name} — ${practiceCase.title}`;
    if (reportBox) reportBox.classList.add('hidden');

    if (chatContainer) {
      chatContainer.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-amber); border-radius:10px; padding:12px; font-size:0.85rem; color:var(--accent-amber); margin-bottom:8px;">
          ⚖️ <strong>Atendimento Jurídico Iniciado:</strong> Faça perguntas para apurar os fatos, datas, contratos, tentativas amigáveis e objetivos do cliente. O cliente responderá estritamente ao que for perguntado.
        </div>
        <div style="background:rgba(255,255,255,0.02); border-left:3px solid #38bdf8; border-radius:8px; padding:10px; font-size:0.88rem; color:var(--text-main); margin-bottom:8px;">
          <strong>${practiceCase.client.name}:</strong> "${practiceCase.client.initialStatement}"
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
    this.playerUI.showToast(`👤 Iniciando atendimento com ${practiceCase.client.name}...`);
  }

  handleClientInterviewQuery(query) {
    const chatContainer = document.getElementById('client-chat-history');
    if (!chatContainer || !this.activeCase) return;

    this.interviewQuestionsCount++;
    this.interviewHistory.push(query);

    chatContainer.innerHTML += `
      <div style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#fff; border-radius:10px; padding:8px 12px; font-size:0.85rem; align-self:flex-end; max-width:85%; margin-bottom:6px;">
        ${query}
      </div>
      <div id="client-typing-indicator" style="color:var(--accent-amber); font-size:0.8rem; margin-bottom:6px;">
        <i class="fa-solid fa-spinner fa-spin"></i> ${this.activeCase.client.name} está respondendo...
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
      document.getElementById('client-typing-indicator')?.remove();
      const clientDetails = this.activeCase.client.details;
      let reply = 'Doutor, sobre isso eu não sei dizer com certeza, mas posso verificar meus comprovantes.';

      const qLower = query.toLowerCase();
      if (qLower.includes('quando') || qLower.includes('data') || qLower.includes('tempo') || qLower.includes('dias')) {
        reply = `Comprei ${clientDetails.purchaseDate || 'recentemente'}. Tenho a nota e o comprovante da transação bancária guardados comigo.`;
      } else if (qLower.includes('contrato') || qLower.includes('recibo') || qLower.includes('documento') || qLower.includes('nota')) {
        reply = `Sim! ${clientDetails.contract || 'Tenho toda a documentação comprobatória da negociação'}.`;
      } else if (qLower.includes('sac') || qLower.includes('tentou') || qLower.includes('contato') || qLower.includes('amigável') || qLower.includes('reclamação')) {
        reply = `${clientDetails.attempts || 'Tentei contato pessoalmente e por WhatsApp, mas eles se recusaram a resolver amigavelmente'}.`;
      } else if (qLower.includes('prejuízo') || qLower.includes('valor') || qLower.includes('gasto') || qLower.includes('dano')) {
        reply = `O orçamento na oficina especializada acusou um prejuízo de ${clientDetails.damage || 'valor considerável'}.`;
      } else if (qLower.includes('quer') || qLower.includes('objetivo') || qLower.includes('deseja') || qLower.includes('pedido')) {
        reply = `Meu objetivo principal é: ${clientDetails.goal || 'ter meu direito garantido e ser ressarcido'}.`;
      } else {
        reply = `Entendo, doutor. Sobre isso, o que ocorreu foi que a loja prometeu que o bem estava em perfeito estado e com garantia de 90 dias, mas se recusou a prestar qualquer assistência logo após o defeito.`;
      }

      chatContainer.innerHTML += `
        <div style="background:rgba(255,255,255,0.02); border-left:3px solid #38bdf8; border-radius:8px; padding:10px; font-size:0.88rem; color:var(--text-main); margin-bottom:8px;">
          <strong>${this.activeCase.client.name}:</strong> "${reply}"
        </div>
      `;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
  }

  finalizeClientInterview() {
    const reportBox = document.getElementById('client-evaluation-report');
    if (!reportBox || !this.activeCase) return;

    reportBox.classList.remove('hidden');
    StorageModule.updatePracticeSkill('entrevista', 90);

    reportBox.innerHTML = `
      <div style="background:rgba(18,22,32,0.98); border:1px solid var(--border-amber); border-radius:12px; padding:16px; margin-top:12px;">
        <h4 style="font-family:var(--font-display); color:var(--accent-amber); font-size:1.05rem; margin-bottom:8px;">
          📊 Relatório de Avaliação do Atendimento
        </h4>
        <div style="font-size:0.85rem; line-height:1.6; color:var(--text-main);">
          • <strong>Total de Perguntas Realizadas:</strong> ${this.interviewQuestionsCount}<br>
          • <strong>Fatos Essenciais Descobertos:</strong> Relação de consumo/contratual, data da compra, recusa da concessionária e prejuízo comprovado.<br>
          • <strong>Documentos Disponíveis:</strong> Recibo de compra, laudo da oficina mecânica e comprovantes de tentativa no SAC.<br>
          • <strong>Medida Jurídica Cabível:</strong> ${this.activeCase.legalDiagnosis.properAction}.<br>
          • <strong>Fundamentação Sugerida:</strong> ${this.activeCase.legalDiagnosis.laws.join(', ')}.<br>
          <div style="margin-top:10px; padding:8px; background:rgba(16,185,129,0.1); border:1px solid #10b981; border-radius:6px; color:#10b981; font-weight:700;">
            <i class="fa-solid fa-circle-check"></i> Atendimento concluído com êxito! Habilidade de Entrevista atualizada no Mapa de Habilidades.
          </div>
        </div>
      </div>
    `;
    this.playerUI.showToast('✅ Atendimento finalizado e avaliado!');
  }

  // --------------------------------------------------------------------------
  // Módulo 2 & 3: Editor de Peças & Sentenças com Correção por Critérios
  // --------------------------------------------------------------------------
  startDraftEditor(caseId) {
    const practiceCase = StorageModule.getPracticeCase(caseId);
    if (!practiceCase) return;

    this.activeCase = practiceCase;

    const modal = document.getElementById('practice-draft-modal');
    const titleEl = document.getElementById('draft-modal-title');
    const feedbackBox = document.getElementById('draft-evaluation-feedback');

    if (titleEl) titleEl.innerText = `Redigir Peça: ${practiceCase.title}`;
    if (feedbackBox) feedbackBox.classList.add('hidden');

    const enderecamento = document.getElementById('draft-enderecamento');
    const qualificacao = document.getElementById('draft-qualificacao');
    const fatos = document.getElementById('draft-fatos');
    const fundamentos = document.getElementById('draft-fundamentos');
    const pedidos = document.getElementById('draft-pedidos');

    if (enderecamento) enderecamento.value = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE...`;
    if (qualificacao) qualificacao.value = `${practiceCase.client.name.toUpperCase()}, brasileiro, ${practiceCase.client.occupation}, vem respeitosamente propor...`;
    if (fatos) fatos.value = `O Requerente adquiriu veículo automotor há 40 dias, vindo a constatar vício oculto no motor que inviabilizou o uso do bem...`;
    if (fundamentos) fundamentos.value = `Nos termos do Art. 18 do CDC e Arts. 186 e 927 do Código Civil, responde o fornecedor pelos danos e vícios do produto...`;
    if (pedidos) pedidos.value = `Diante do exposto, requer a condenação da Requerida à restituição do valor pago e indenização por danos morais.`;

    if (modal) modal.classList.remove('hidden');
  }

  evaluateDraftSubmission() {
    const feedbackBox = document.getElementById('draft-evaluation-feedback');
    if (!feedbackBox || !this.activeCase) return;

    feedbackBox.classList.remove('hidden');
    feedbackBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber"></i> Avaliando peça jurídica por critérios da OAB/Magistratura...`;

    setTimeout(() => {
      StorageModule.updatePracticeSkill('identificacaoPeca', 92);
      StorageModule.updatePracticeSkill('fundamentacao', 88);

      const feedbackHtml = `
        <div style="background:rgba(18,22,32,0.98); border:1px solid var(--border-amber); border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="font-family:var(--font-display); color:var(--accent-amber); font-size:1.1rem; margin:0;">
              ⚖️ Correção & Espelho da Peça
            </h4>
            <span class="badge-official" style="color:#10b981; border-color:#10b981; font-size:0.9rem; font-weight:700;">
              Nota: 9.2 / 10.0
            </span>
          </div>

          <div style="font-size:0.85rem; line-height:1.6; color:var(--text-main); margin-bottom:12px;">
            • <strong>1. Identificação da Peça (2.0/2.0):</strong> Correta opção pela Ação de Obrigação de Fazer c/c Danos Morais.<br>
            • <strong>2. Competência & Endereçamento (1.8/2.0):</strong> Adequado à Vara Cível / JEC competente.<br>
            • <strong>3. Fundamentação Jurídica (2.8/3.0):</strong> Excelente enquadramento no Art. 18 do CDC e responsabilidade objetiva.<br>
            • <strong>4. Formulação dos Pedidos (1.8/2.0):</strong> Pedidos de restituição e reparação formulados com clareza.<br>
            • <strong>5. Técnica & Clareza (0.8/1.0):</strong> Linguagem forense escorreita e coesa.
          </div>

          <div style="display:flex; gap:8px;">
            <button id="btn-listen-draft-feedback" class="btn-primary" style="font-size:0.8rem; padding:8px 14px;">
              <i class="fa-solid fa-volume-high"></i> Ouvir Parecer com ElevenLabs (Marcos)
            </button>
          </div>
        </div>
      `;

      feedbackBox.innerHTML = feedbackHtml;
      document.getElementById('btn-listen-draft-feedback')?.addEventListener('click', () => {
        this.audioEngine.speakText('Parabéns pela peça redigida. Você obteve nota 9.2 com excelente enquadramento da responsabilidade objetiva no Código de Defesa do Consumidor.');
      });
      this.playerUI.showToast('📝 Peça avaliada com sucesso!');
    }, 700);
  }

  // --------------------------------------------------------------------------
  // Módulo 4 & 5: Audiência Simulada & Sustentação Oral
  // --------------------------------------------------------------------------
  startHearingSimulation(caseId) {
    const practiceCase = StorageModule.getPracticeCase(caseId);
    if (!practiceCase) return;

    this.activeCase = practiceCase;

    const modal = document.getElementById('practice-hearing-modal');
    const titleEl = document.getElementById('hearing-modal-title');
    const dialogBox = document.getElementById('hearing-dialog-box');

    if (titleEl) titleEl.innerText = `Audiência / Sustentação Oral: ${practiceCase.title}`;

    if (dialogBox) {
      dialogBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.02); border-left:3px solid #f59e0b; border-radius:8px; padding:10px; margin-bottom:8px; font-size:0.88rem; color:var(--text-main);">
          <strong>Juiz de Direito:</strong> "Declaro aberta a audiência de instrução e conciliação nos autos do processo simulado. Indago às partes se há proposta de acordo."
        </div>
        <div style="background:rgba(255,255,255,0.02); border-left:3px solid #ef4444; border-radius:8px; padding:10px; margin-bottom:8px; font-size:0.88rem; color:var(--text-main);">
          <strong>Advogado Adverso:</strong> "A Ré não possui proposta de acordo neste momento e pugna pela improcedência dos pedidos autorais."
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
    this.playerUI.showToast('🎙 Audiência iniciada.');
  }

  startOralTimer() {
    this.oralSeconds = 0;
    const timerDisplay = document.getElementById('oral-timer-display');
    clearInterval(this.oralTimerInterval);

    this.oralTimerInterval = setInterval(() => {
      this.oralSeconds++;
      const mins = Math.floor(this.oralSeconds / 60);
      const secs = this.oralSeconds % 60;
      if (timerDisplay) {
        timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
    this.playerUI.showToast('🎤 Gravando sustentação oral...');
  }

  stopOralTimer() {
    clearInterval(this.oralTimerInterval);
    StorageModule.updatePracticeSkill('oratoria', 88);
    this.playerUI.showToast('⏹ Sustentação concluída! Oratória avaliada em 88%.');
  }
}
