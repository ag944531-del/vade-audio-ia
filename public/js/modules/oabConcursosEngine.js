/**
 * VadeAudio AI - Motor de Preparação OAB & Concursos Jurídicos (Etapa 6)
 * 1ª Fase (Simulados e Modo Treino), 2ª Fase (Treino de Peças e Discursivas),
 * Concursos & Edital Verticalizado, Caderno de Erros, Plano de Aprovação e Revisão em Áudio.
 */

class OabConcursosEngine {
  constructor(audioEngine, playerUI, vadeEngine, tutorEngine) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.activeOabTab = 'oab_1fase'; // 'oab_1fase' | 'oab_2fase' | 'concursos' | 'error_notebook' | 'approval_plan' | 'performance' | 'audio_revision'

    // Estado do Simulado OAB Realista
    this.simuladoState = {
      active: false,
      questions: [],
      currentIndex: 0,
      userAnswers: {},
      markedForReview: {},
      secondsRemaining: 5 * 60 * 60, // 5 horas padrão
      timerInterval: null
    };

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Abas da View OAB & Concursos
    const tabBtns = document.querySelectorAll('.oab-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeOabTab = btn.dataset.oabTab;
        this.renderOabHub(this.activeOabTab);
      });
    });

    // 2. Modais de Simulado e Peça
    const btnCloseSim = document.getElementById('btn-close-simulado-modal');
    const simModal = document.getElementById('oab-simulado-modal');
    if (btnCloseSim && simModal) {
      btnCloseSim.addEventListener('click', () => {
        if (confirm('Deseja sair do simulado? Seu progresso será interrompido.')) {
          clearInterval(this.simuladoState.timerInterval);
          simModal.classList.add('hidden');
        }
      });
    }

    const btnClosePiece = document.getElementById('btn-close-peca-modal');
    const pieceModal = document.getElementById('oab-peca-modal');
    if (btnClosePiece && pieceModal) {
      btnClosePiece.addEventListener('click', () => {
        pieceModal.classList.add('hidden');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Hub Central de Navegação do Módulo OAB & Concursos
  // --------------------------------------------------------------------------
  renderOabHub(tab = 'oab_1fase') {
    const container = document.getElementById('oab-content-area');
    if (!container) return;

    if (tab === 'oab_1fase') {
      this.renderFirstPhaseView(container);
    } else if (tab === 'oab_2fase') {
      this.renderSecondPhaseView(container);
    } else if (tab === 'concursos') {
      this.renderConcursosView(container);
    } else if (tab === 'error_notebook') {
      this.renderErrorNotebookView(container);
    } else if (tab === 'approval_plan') {
      this.renderApprovalPlanView(container);
    } else if (tab === 'performance') {
      this.renderPerformanceView(container);
    } else if (tab === 'audio_revision') {
      this.renderAudioRevisionView(container);
    }
  }

  // --------------------------------------------------------------------------
  // 1. OAB 1ª Fase (Simulados Realistas e Modo Treino)
  // --------------------------------------------------------------------------
  renderFirstPhaseView(container) {
    const questions = VADE_MECUM_DB.questions;
    const officialQuestions = questions.filter(q => !q.is_ai_generated);
    const mockAttempts = StorageModule.getOabMockAttempts();
    const lastAttempt = mockAttempts.length > 0 ? mockAttempts[0] : null;

    container.innerHTML = `
      <!-- Banner Superior de Ação Rápida -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:24px;">
        
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(18,22,32,0.95)); border:1px solid var(--border-amber); border-radius:16px; padding:20px;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
            <i class="fa-solid fa-bullseye"></i> Simulado OAB 1ª Fase
          </span>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.2rem; margin-bottom:6px;">
            Simulado Realista Cronometrado
          </h3>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:14px;">
            Experiência idêntica ao dia da prova: sem consulta de gabarito durante o exame e com relatório analítico ao final.
          </p>
          <button id="btn-start-oab-simulado" class="btn-primary" style="width:100%; padding:10px; font-size:0.92rem;">
            <i class="fa-solid fa-play"></i> ▶ Iniciar Simulado Realista
          </button>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
              <i class="fa-solid fa-chart-line"></i> Situação Atual
            </span>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="font-size:1.6rem; color:var(--text-main); font-family:var(--font-display);">
                ${lastAttempt ? `${lastAttempt.scorePercent}%` : '68%'}
              </strong>
              <span class="badge-official" style="color:#10b981; border-color:#10b981;">Meta: 70% (40/80)</span>
            </div>
            <p style="color:var(--text-muted); font-size:0.82rem; margin-top:6px;">
              Seu rendimento médio está equilibrado. Foco em Ética e Processo Civil para garantir a margem de segurança.
            </p>
          </div>
          <button id="btn-start-training-mode" class="btn-secondary" style="width:100%; margin-top:10px; font-size:0.88rem;">
            <i class="fa-solid fa-graduation-cap"></i> 🧠 Abrir Modo Treino com Gabarito
          </button>
        </div>

      </div>

      <!-- Seção Banco de Questões OAB -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0;">
          <i class="fa-solid fa-circle-question text-amber"></i> Questões do Exame de Ordem (${questions.length})
        </h3>
        <span style="font-size:0.8rem; color:var(--text-muted);">
          Exibindo <strong>${officialQuestions.length}</strong> Questões Oficiais FGV e <strong>${questions.length - officialQuestions.length}</strong> Didáticas de IA.
        </span>
      </div>

      <!-- Lista de Questões no Modo Treino -->
      <div style="display:flex; flex-direction:column; gap:16px;" id="oab-questions-list">
        ${questions.map(q => this.generateQuestionCardHtml(q)).join('')}
      </div>
    `;

    document.getElementById('btn-start-oab-simulado')?.addEventListener('click', () => {
      this.startRealSimulation();
    });

    document.getElementById('btn-start-training-mode')?.addEventListener('click', () => {
      this.playerUI.showToast('🧠 Modo Treino ativo! Responda as questões com feedback imediato.');
      document.getElementById('oab-questions-list')?.scrollIntoView({ behavior: 'smooth' });
    });

    this.wireQuestionCardEvents(container);
  }

  generateQuestionCardHtml(q) {
    const isOfficial = !q.is_ai_generated;
    return `
      <div class="article-card" id="qcard-${q.id}">
        <div class="art-header">
          <div class="art-number">
            ${isOfficial ? `
              <span class="badge-official" style="color:#38bdf8; background:rgba(56,189,248,0.15); border-color:#38bdf8; font-weight:700;">
                <i class="fa-solid fa-certificate"></i> QUESTÃO OFICIAL • ${q.exam_name || q.source || 'OAB/FGV'}
              </span>
            ` : `
              <span class="badge-official" style="color:#c084fc; background:rgba(192,132,252,0.15); border-color:#c084fc;">
                <i class="fa-solid fa-robot"></i> QUESTÃO GERADA POR IA PARA FINS DE ESTUDO
              </span>
            `}
          </div>
          <button class="btn-secondary btn-q-audio" data-qid="${q.id}" style="font-size:0.75rem; color:var(--accent-amber);" title="Ouvir Questão por Voz">
            <i class="fa-solid fa-volume-high"></i> Ouvir Questão
          </button>
        </div>

        <div class="art-body">
          <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main); margin-bottom:14px; font-weight:500;">
            ${q.statement}
          </p>

          <div style="display:flex; flex-direction:column; gap:8px;" id="q-options-${q.id}">
            ${q.options.map((opt, oIdx) => `
              <button class="btn-secondary btn-opt" data-qid="${q.id}" data-oidx="${oIdx}" style="text-align:left; justify-content:flex-start; padding:10px 14px; font-size:0.88rem; line-height:1.4;">
                <strong style="color:var(--accent-amber); margin-right:8px;">${String.fromCharCode(65 + oIdx)})</strong> ${opt}
              </button>
            `).join('')}
          </div>

          <!-- Feedback do Modo Treino -->
          <div id="q-feedback-${q.id}" class="hidden" style="margin-top:14px; padding:12px; border-radius:8px; font-size:0.88rem;"></div>
        </div>
      </div>
    `;
  }

  wireQuestionCardEvents(container) {
    // 1. Seleção de Alternativa (Modo Treino)
    container.querySelectorAll('.btn-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.dataset.qid;
        const oIdx = parseInt(btn.dataset.oidx);
        const q = VADE_MECUM_DB.questions.find(item => item.id === qId);
        if (!q) return;

        const isCorrect = oIdx === q.correctIndex;
        const feedbackBox = document.getElementById(`q-feedback-${qId}`);
        const optionsBox = document.getElementById(`q-options-${qId}`);

        if (optionsBox) {
          optionsBox.querySelectorAll('.btn-opt').forEach((b, idx) => {
            b.disabled = true;
            if (idx === q.correctIndex) {
              b.style.borderColor = '#10b981';
              b.style.background = 'rgba(16,185,129,0.15)';
              b.style.color = '#10b981';
            } else if (idx === oIdx && !isCorrect) {
              b.style.borderColor = '#ef4444';
              b.style.background = 'rgba(239,68,68,0.15)';
              b.style.color = '#f87171';
            }
          });
        }

        if (feedbackBox) {
          feedbackBox.classList.remove('hidden');
          if (isCorrect) {
            feedbackBox.style.background = 'rgba(16,185,129,0.1)';
            feedbackBox.style.border = '1px solid rgba(16,185,129,0.3)';
            feedbackBox.innerHTML = `
              <strong style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Parabéns, Resposta Correta!</strong>
              <p style="color:var(--text-main); margin:6px 0 10px 0;">${q.explanation}</p>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${q.article_id ? `<button class="btn-secondary btn-open-art-fb" data-artid="${q.article_id}" style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-book"></i> Abrir no Vade Mecum</button>` : ''}
                <button class="btn-secondary btn-ask-tutor-fb" data-query="${q.statement.substring(0, 100)}" style="font-size:0.75rem; color:#c084fc;"><i class="fa-solid fa-robot"></i> Perguntar ao Tutor</button>
              </div>
            `;
          } else {
            feedbackBox.style.background = 'rgba(239,68,68,0.1)';
            feedbackBox.style.border = '1px solid rgba(239,68,68,0.3)';
            feedbackBox.innerHTML = `
              <strong style="color:#f87171;"><i class="fa-solid fa-circle-xmark"></i> Resposta Incorreta.</strong>
              <p style="color:var(--text-main); margin:6px 0 10px 0;">${q.explanation}</p>
              
              <!-- Seletor de Motivo do Erro -->
              <div style="background:rgba(0,0,0,0.2); border:1px solid var(--border-light); border-radius:6px; padding:8px 10px; margin-bottom:10px;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Por que você errou? (Classificação Cognitiva):</span>
                <select class="sel-error-reason" data-qid="${q.id}" style="padding:4px 8px; border-radius:4px; background:rgba(255,255,255,0.06); border:1px solid var(--border-light); color:var(--text-main); font-size:0.78rem;">
                  <option value="Não sabia">Não sabia a teoria</option>
                  <option value="Confundi conceitos" selected>Confundi conceitos/institutos</option>
                  <option value="Falta de atenção">Falta de atenção no enunciado</option>
                  <option value="Esqueci artigo">Esqueci o dispositivo legal</option>
                  <option value="Chutei">Chutei a resposta</option>
                </select>
              </div>

              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn-secondary btn-save-error-btn" data-qid="${q.id}" style="font-size:0.75rem; color:#f87171;"><i class="fa-solid fa-bookmark"></i> Salvar no Caderno de Erros</button>
                ${q.article_id ? `<button class="btn-secondary btn-open-art-fb" data-artid="${q.article_id}" style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-book"></i> Abrir Artigo no Vade Mecum</button>` : ''}
              </div>
            `;

            // Salva automaticamente no Caderno de Erros
            StorageModule.saveOabError({
              questionId: q.id,
              subjectId: q.subject_id,
              statement: q.statement,
              reason: 'Confundi conceitos',
              articleId: q.article_id
            });
          }

          feedbackBox.querySelectorAll('.btn-open-art-fb').forEach(b => {
            b.onclick = () => this.vadeEngine.openArticleModal(b.dataset.artid);
          });

          feedbackBox.querySelectorAll('.btn-ask-tutor-fb').forEach(b => {
            b.onclick = () => {
              window.VadeAudioApp.tutorEngine.handleUserMessage(`Explique a fundamentação da seguinte questão de prova: "${b.dataset.query}"`);
              const tutorNav = document.querySelector('.nav-item[data-view="tutor"]');
              if (tutorNav) tutorNav.click();
            };
          });

          feedbackBox.querySelectorAll('.btn-save-error-btn').forEach(b => {
            b.onclick = () => {
              this.playerUI.showToast('📕 Questão registrada no seu Caderno de Erros!');
            };
          });

          feedbackBox.querySelector('.sel-error-reason')?.addEventListener('change', (e) => {
            StorageModule.saveOabError({
              questionId: q.id,
              subjectId: q.subject_id,
              statement: q.statement,
              reason: e.target.value,
              articleId: q.article_id
            });
            this.playerUI.showToast(`Classificação do erro atualizada para: "${e.target.value}"`);
          });
        }
      });
    });

    // 2. Ouvir Questão em Áudio
    container.querySelectorAll('.btn-q-audio').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = VADE_MECUM_DB.questions.find(item => item.id === btn.dataset.qid);
        if (q) {
          const text = `Questão: ${q.statement}. Alternativa A: ${q.options[0]}. Alternativa B: ${q.options[1]}. Alternativa C: ${q.options[2]}. Alternativa D: ${q.options[3]}.`;
          this.audioEngine.speakText(text);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. OAB 2ª Fase (Treino de Peças & Discursivas)
  // --------------------------------------------------------------------------
  renderSecondPhaseView(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:18px;">
        <div>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0;">
            <i class="fa-solid fa-file-signature text-amber"></i> Treinamento Prático-Profissional • 2ª Fase OAB
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
            Simulação de elaboração de peças processuais e respostas discursivas com correção analítica por IA.
          </p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px;">
        
        <!-- Card Peça 1: Penal -->
        <div class="article-card">
          <div class="art-header">
            <span class="badge-official" style="color:#ef4444; border-color:#ef4444; background:rgba(239,68,68,0.15);">DIREITO PENAL</span>
            <strong>Apelação Criminal / Razões Recursais</strong>
          </div>
          <div class="art-body">
            <p style="font-size:0.85rem; color:var(--text-main); line-height:1.5; margin-bottom:12px;">
              <strong>Caso:</strong> Roberto foi condenado a 6 anos pelo crime de roubo majorado. A sentença deixou de reconhecer a atenuante da menoridade relativa e fixou regime inicial fechado com base na gravidade abstrata.
            </p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:14px;">
              <i class="fa-solid fa-bullseye"></i> <strong>Missão:</strong> Redigir a peça cabível e formular os pedidos pertinentes.
            </p>
            <button class="btn-primary btn-start-piece" data-piece="penal-apelacao" style="width:100%;">
              <i class="fa-solid fa-pen-nib"></i> Treinar Redação da Peça
            </button>
          </div>
        </div>

        <!-- Card Peça 2: Civil -->
        <div class="article-card">
          <div class="art-header">
            <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8; background:rgba(56,189,248,0.15);">DIREITO CIVIL</span>
            <strong>Petição Inicial com Tutela de Urgência</strong>
          </div>
          <div class="art-body">
            <p style="font-size:0.85rem; color:var(--text-main); line-height:1.5; margin-bottom:12px;">
              <strong>Caso:</strong> Cliente necessita de cirurgia neurológica de urgência não autorizada pelo plano de saúde, sob alegação infundada de carência contratual.
            </p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:14px;">
              <i class="fa-solid fa-bullseye"></i> <strong>Missão:</strong> Elaborar a inicial com fulcro no Art. 300 do CPC e CDC.
            </p>
            <button class="btn-primary btn-start-piece" data-piece="civil-tutela" style="width:100%;">
              <i class="fa-solid fa-pen-nib"></i> Treinar Redação da Peça
            </button>
          </div>
        </div>

      </div>
    `;

    container.querySelectorAll('.btn-start-piece').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openPieceTrainingModal(btn.dataset.piece);
      });
    });
  }

  openPieceTrainingModal(pieceId) {
    const modal = document.getElementById('oab-peca-modal');
    if (!modal) return;

    const title = pieceId === 'penal-apelacao' ? 'Treino de Peça: Razões de Apelação Criminal' : 'Treino de Peça: Petição Inicial de Tutela de Urgência';
    document.getElementById('peca-modal-title').innerText = title;
    modal.classList.remove('hidden');
  }

  // --------------------------------------------------------------------------
  // 3. Concursos & Edital Verticalizado
  // --------------------------------------------------------------------------
  renderConcursosView(container) {
    const syllabus = StorageModule.getVerticalSyllabus();
    const total = syllabus.length;
    const dominado = syllabus.filter(i => i.status === 'dominado').length;
    const revisando = syllabus.filter(i => i.status === 'revisando').length;
    const estudando = syllabus.filter(i => i.status === 'estudando').length;

    const pctDominado = Math.round((dominado / total) * 100) || 0;
    const pctEstudado = Math.round(((dominado + revisando + estudando) / total) * 100) || 0;

    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:20px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0;">
              <i class="fa-solid fa-list-check text-amber"></i> Edital Verticalizado Interativo
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">
              Controle tópico por tópico para Carreira Jurídica / Concurso de Tribunal.
            </p>
          </div>
          <div style="display:flex; gap:12px;">
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Edital Estudado</span>
              <strong style="display:block; color:var(--accent-amber); font-size:1.1rem;">${pctEstudado}%</strong>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Edital Dominado</span>
              <strong style="display:block; color:#10b981; font-size:1.1rem;">${pctDominado}%</strong>
            </div>
          </div>
        </div>

        <div style="width:100%; height:8px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
          <div style="width:${pctDominado}%; height:100%; background:linear-gradient(90deg, var(--accent-amber), #10b981); border-radius:100px;"></div>
        </div>
      </div>

      <!-- Tópicos do Edital -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${syllabus.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.88rem; color:var(--text-main); font-weight:500;">
              ${item.title}
            </span>
            <select class="sel-syl-status" data-itemid="${item.id}" style="padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.8rem;">
              <option value="nao_iniciado" ${item.status === 'nao_iniciado' ? 'selected' : ''}>⏳ Não Iniciado</option>
              <option value="estudando" ${item.status === 'estudando' ? 'selected' : ''}>📖 Estudando</option>
              <option value="revisando" ${item.status === 'revisando' ? 'selected' : ''}>🔄 Revisando</option>
              <option value="dominado" ${item.status === 'dominado' ? 'selected' : ''}>✅ Dominado</option>
            </select>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.sel-syl-status').forEach(sel => {
      sel.addEventListener('change', (e) => {
        StorageModule.updateSyllabusItemStatus(sel.dataset.itemid, e.target.value);
        this.renderConcursosView(container);
        this.playerUI.showToast('Progresso do edital atualizado!');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. Caderno Central de Erros
  // --------------------------------------------------------------------------
  renderErrorNotebookView(container) {
    const errors = StorageModule.getOabErrorNotebook();

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:18px;">
        <div>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0;">
            <i class="fa-solid fa-book-skull text-amber"></i> Caderno Central de Questões que Errei (${errors.length})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
            Acompanhe o motivo dos seus erros e refaça até dominar cada ponto cego.
          </p>
        </div>
      </div>

      ${errors.length === 0 ? `
        <div style="text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-solid fa-shield-halved" style="font-size:2.5rem; color:#10b981; margin-bottom:12px;"></i>
          <p style="font-size:0.95rem;">Seu Caderno de Erros está limpo! Continue resolvendo simulados para mapear pontos a revisar.</p>
        </div>
      ` : `
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${errors.map(err => `
            <div class="article-card" style="border-left:3px solid #ef4444;">
              <div class="art-header">
                <div class="art-number">
                  <span class="badge-official" style="color:#f87171; border-color:#f87171;">Motivo: ${err.reason}</span>
                  <span style="font-size:0.8rem; color:var(--text-muted);">Erros registrados: ${err.errorCount}x</span>
                </div>
                <button class="btn-secondary btn-remove-err" data-qid="${err.questionId}" style="font-size:0.75rem; color:#10b981;">
                  <i class="fa-solid fa-check"></i> Já Dominei (Remover)
                </button>
              </div>
              <div class="art-body">
                <p style="font-size:0.88rem; color:var(--text-main); line-height:1.5;">${err.statement}</p>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
                  ${err.articleId ? `<button class="btn-secondary btn-open-art-fb" data-artid="${err.articleId}" style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-book"></i> Revisar no Vade Mecum</button>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    container.querySelectorAll('.btn-remove-err').forEach(btn => {
      btn.addEventListener('click', () => {
        StorageModule.removeOabError(btn.dataset.qid);
        this.playerUI.showToast('Questão removida do Caderno de Erros.');
        this.renderErrorNotebookView(container);
      });
    });

    container.querySelectorAll('.btn-open-art-fb').forEach(b => {
      b.onclick = () => this.vadeEngine.openArticleModal(b.dataset.artid);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Plano de Aprovação Adaptativo
  // --------------------------------------------------------------------------
  renderApprovalPlanView(container) {
    const profile = StorageModule.getOabProfile();
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:20px; margin-bottom:20px;">
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin-bottom:6px;">
          <i class="fa-solid fa-calendar-check text-amber"></i> Plano de Aprovação OAB Adaptativo
        </h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">
          Distribuição semanal ponderada considerando sua meta de <strong>${profile.targetScorePercent}%</strong> e <strong>${profile.weeklyHours}h semanais</strong>.
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
            <strong style="color:var(--accent-amber); font-size:0.9rem; display:block;">Segunda-feira</strong>
            <span style="font-size:0.82rem; color:var(--text-main);">Ética Profissional (45 min) + 10 questões</span>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
            <strong style="color:var(--accent-amber); font-size:0.9rem; display:block;">Terça-feira</strong>
            <span style="font-size:0.82rem; color:var(--text-main);">Direito Constitucional (45 min) + 15 flashcards</span>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
            <strong style="color:var(--accent-amber); font-size:0.9rem; display:block;">Quarta-feira</strong>
            <span style="font-size:0.82rem; color:var(--text-main);">Processo Civil (45 min) + Caderno de Erros</span>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
            <strong style="color:var(--accent-amber); font-size:0.9rem; display:block;">Quinta-feira</strong>
            <span style="font-size:0.82rem; color:var(--text-main);">Direito Penal & Proc. Penal (45 min)</span>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
            <strong style="color:var(--accent-amber); font-size:0.9rem; display:block;">Sábado</strong>
            <span style="font-size:0.82rem; color:var(--text-main);">Simulado Completo Cronometrado</span>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. Mapa de Fraquezas & Desempenho
  // --------------------------------------------------------------------------
  renderPerformanceView(container) {
    const stats = StorageModule.getSubjectStats();
    container.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:20px; margin-bottom:20px;">
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin-bottom:6px;">
          <i class="fa-solid fa-map-location-dot text-amber"></i> Mapa de Fraquezas por Disciplina
        </h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:14px;">
          Identificação automática dos temas com menor índice de acerto para priorização de estudo.
        </p>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span>Ética Profissional (EAOAB)</span>
              <strong style="color:#10b981;">82% de acerto</strong>
            </div>
            <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px;">
              <div style="width:82%; height:100%; background:#10b981; border-radius:100px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span>Direito Constitucional</span>
              <strong style="color:#10b981;">76% de acerto</strong>
            </div>
            <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px;">
              <div style="width:76%; height:100%; background:#10b981; border-radius:100px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span>Processo Civil (Tutelas & Recursos)</span>
              <strong style="color:#ef4444;">48% de acerto ⚠️ (Ponto Fraco)</strong>
            </div>
            <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px;">
              <div style="width:48%; height:100%; background:#ef4444; border-radius:100px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 7. Revisão Final em Áudio
  // --------------------------------------------------------------------------
  renderAudioRevisionView(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="article-card">
          <div class="art-header">
            <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-moon"></i> VÉSPERA DA PROVA (1 DIA)</span>
            <strong>Revisão de Véspera • Pontos Fundamentais</strong>
          </div>
          <div class="art-body">
            <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:12px;">
              Revisão condensada em áudio com os artigos mais recorrentes do Estatuto da OAB, CF e CP.
            </p>
            <button class="btn-primary btn-play-rev-audio" data-mode="vespera" style="width:100%;">
              <i class="fa-solid fa-headphones"></i> ▶ Ouvir Revisão de Véspera (Marcos)
            </button>
          </div>
        </div>

        <div class="article-card">
          <div class="art-header">
            <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;"><i class="fa-solid fa-calendar-week"></i> RETA FINAL (7 DIAS)</span>
            <strong>Revisão de Ética e Constitucional</strong>
          </div>
          <div class="art-body">
            <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:12px;">
              Síntese das Súmulas Vinculantes e Prerrogativas da Advocacia para fixação rápida.
            </p>
            <button class="btn-secondary btn-play-rev-audio" data-mode="7dias" style="width:100%; color:var(--accent-amber);">
              <i class="fa-solid fa-headphones"></i> ▶ Ouvir Revisão de 7 Dias (Marcos)
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-play-rev-audio').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.mode === 'vespera'
          ? 'Revisão de Véspera OAB com o Professor Marcos: Mantenha a calma, revise com atenção as prerrogativas do Artigo 7º do Estatuto da OAB e os prazos recursais do CPC. Boa prova!'
          : 'Revisão de 7 Dias para OAB: Foco na jurisprudência do STF sobre controle de constitucionalidade e nas hipóteses de excludentes de ilicitude do Código Penal.';
        this.audioEngine.speakText(text);
        this.playerUI.showToast('Narrando com a voz Marcos da ElevenLabs...');
      });
    });
  }

  // --------------------------------------------------------------------------
  // Simulado Realista Cronometrado
  // --------------------------------------------------------------------------
  startRealSimulation() {
    const modal = document.getElementById('oab-simulado-modal');
    if (!modal) return;

    this.simuladoState.questions = VADE_MECUM_DB.questions.slice(0, 10);
    this.simuladoState.currentIndex = 0;
    this.simuladoState.userAnswers = {};
    this.simuladoState.secondsRemaining = 20 * 60; // 20 min para teste
    this.simuladoState.active = true;

    modal.classList.remove('hidden');
    this.renderSimuladoScreen();
    this.startSimuladoTimer();
  }

  startSimuladoTimer() {
    clearInterval(this.simuladoState.timerInterval);
    this.simuladoState.timerInterval = setInterval(() => {
      if (this.simuladoState.secondsRemaining > 0) {
        this.simuladoState.secondsRemaining--;
        const m = Math.floor(this.simuladoState.secondsRemaining / 60);
        const s = this.simuladoState.secondsRemaining % 60;
        const el = document.getElementById('simulado-timer-display');
        if (el) el.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      } else {
        clearInterval(this.simuladoState.timerInterval);
        this.finishRealSimulation();
      }
    }, 1000);
  }

  renderSimuladoScreen() {
    const q = this.simuladoState.questions[this.simuladoState.currentIndex];
    const container = document.getElementById('simulado-question-area');
    if (!container || !q) return;

    const total = this.simuladoState.questions.length;
    const currentNum = this.simuladoState.currentIndex + 1;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:0.85rem; color:var(--accent-amber); font-weight:700;">Questão ${currentNum} de ${total}</span>
        <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;">${q.exam_name || 'Simulado OAB'}</span>
      </div>

      <p style="font-size:0.95rem; line-height:1.6; color:var(--text-main); margin-bottom:16px;">
        ${q.statement}
      </p>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${q.options.map((opt, oIdx) => `
          <button class="btn-secondary btn-sim-opt" data-oidx="${oIdx}" style="text-align:left; justify-content:flex-start; padding:10px 14px; ${this.simuladoState.userAnswers[q.id] === oIdx ? 'border-color:var(--accent-amber); background:rgba(245,158,11,0.15);' : ''}">
            <strong style="color:var(--accent-amber); margin-right:8px;">${String.fromCharCode(65 + oIdx)})</strong> ${opt}
          </button>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
        <button id="btn-sim-prev" class="btn-secondary" ${this.simuladoState.currentIndex === 0 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i> Anterior</button>
        ${currentNum === total 
          ? '<button id="btn-sim-finish" class="btn-primary"><i class="fa-solid fa-flag-checkered"></i> Concluir Simulado</button>'
          : '<button id="btn-sim-next" class="btn-primary">Próxima <i class="fa-solid fa-chevron-right"></i></button>'
        }
      </div>
    `;

    container.querySelectorAll('.btn-sim-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        this.simuladoState.userAnswers[q.id] = parseInt(btn.dataset.oidx);
        this.renderSimuladoScreen();
      });
    });

    document.getElementById('btn-sim-prev')?.addEventListener('click', () => {
      if (this.simuladoState.currentIndex > 0) {
        this.simuladoState.currentIndex--;
        this.renderSimuladoScreen();
      }
    });

    document.getElementById('btn-sim-next')?.addEventListener('click', () => {
      if (this.simuladoState.currentIndex < total - 1) {
        this.simuladoState.currentIndex++;
        this.renderSimuladoScreen();
      }
    });

    document.getElementById('btn-sim-finish')?.addEventListener('click', () => {
      this.finishRealSimulation();
    });
  }

  finishRealSimulation() {
    clearInterval(this.simuladoState.timerInterval);
    const modal = document.getElementById('oab-simulado-modal');
    if (modal) modal.classList.add('hidden');

    let correctCount = 0;
    this.simuladoState.questions.forEach(q => {
      if (this.simuladoState.userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const total = this.simuladoState.questions.length;
    const scorePercent = Math.round((correctCount / total) * 100) || 0;

    StorageModule.saveOabMockAttempt({
      totalQuestions: total,
      correctCount,
      scorePercent
    });

    this.playerUI.showToast(`🎯 Simulado Concluído! Aproveitamento: ${scorePercent}% (${correctCount}/${total}).`);
    this.activeOabTab = 'performance';
    this.renderOabHub('performance');
  }
}
