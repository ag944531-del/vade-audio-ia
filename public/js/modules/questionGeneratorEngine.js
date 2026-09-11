/**
 * VadeAudio AI - QuestionGeneratorEngine (Etapa 34)
 * Controlador de Interface do Gerador Inteligente e Validador de Questões:
 * Seleção de Fontes, Stepper Visual do Pipeline, Score de Qualidade, Revisão e Áudio.
 */

class QuestionGeneratorEngine {
  constructor(generationService, pipeline, reviewService, audioEngine) {
    this.generationService = generationService || (typeof window !== 'undefined' ? window.questionGenerationService : null);
    this.pipeline = pipeline || (typeof window !== 'undefined' ? window.questionValidationPipeline : null);
    this.reviewService = reviewService || (typeof window !== 'undefined' ? window.questionReviewService : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeSourceType = 'article'; // 'article' | 'law' | 'errors' | 'pdf'
    this.activeTab = 'generator'; // 'generator' | 'bank' | 'review'
    this.isGenerating = false;
  }

  renderView() {
    const container = document.getElementById('question-generator-content-container');
    if (!container) return;

    const questions = this.generationService && this.generationService.storage ? this.generationService.storage.getGeneratedQuestions() : [];
    const reviewQueue = this.reviewService && this.reviewService.storage ? this.reviewService.storage.getQuestionReviewQueue() : [];

    container.innerHTML = `
      <!-- Header do Gerador -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:22px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; font-weight:700;">ETAPA 34</span>
            <span style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-shield-halved"></i> Pipeline Multiestágio com Validação de Fontes Reais</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.4rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-brain text-amber"></i> Gerador Inteligente e Validador de Questões
          </h2>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:4px 0 0 0;">Gere questões confiáveis com gabarito auditado, fundamentação jurídica e sem alucinações.</p>
        </div>

        <div style="display:flex; gap:8px;">
          <button class="chapter-btn qgen-tab-btn ${this.activeTab === 'generator' ? 'active' : ''}" data-tab="generator" style="padding:8px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Questões
          </button>
          <button class="chapter-btn qgen-tab-btn ${this.activeTab === 'bank' ? 'active' : ''}" data-tab="bank" style="padding:8px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-box-archive"></i> Banco (${questions.length})
          </button>
          <button class="chapter-btn qgen-tab-btn ${this.activeTab === 'review' ? 'active' : ''}" data-tab="review" style="padding:8px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-user-check"></i> Moderação (${reviewQueue.length})
          </button>
        </div>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="qgen-tab-content">
        ${this.activeTab === 'generator' ? this.renderGeneratorTab() : this.activeTab === 'bank' ? this.renderBankTab(questions) : this.renderReviewTab(reviewQueue)}
      </div>
    `;

    this.attachDomEvents();
  }

  // --------------------------------------------------------------------------
  // Aba 1: Painel do Gerador & Stepper de Validação
  // --------------------------------------------------------------------------
  renderGeneratorTab() {
    return `
      <div style="display:grid; grid-template-columns: 360px 1fr; gap:20px; align-items:start;" id="qgen-split-grid">
        
        <!-- Formulário de Configuração -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:14px;">
          <h3 style="font-family:var(--font-display); font-size:1.05rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-sliders text-amber"></i> Origem & Parâmetros
          </h3>

          <div>
            <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Origem da Questão:</label>
            <select id="select-qgen-source-type" style="width:100%; padding:8px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
              <option value="article">Artigo Específico do Vade Mecum</option>
              <option value="errors">Caderno de Erros do Aluno</option>
              <option value="law">Legislação / Código Completo</option>
              <option value="sumula">Súmulas e Jurisprudência STF/STJ</option>
            </select>
          </div>

          <div id="qgen-source-target-box">
            <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Selecione o Artigo:</label>
            <select id="select-qgen-article" style="width:100%; padding:8px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
              <option value="cpc-art300">Art. 300 CPC — Tutelas de Urgência</option>
              <option value="cp-art121">Art. 121 CP — Crime de Homicídio</option>
              <option value="cf88-art5">Art. 5º CF/88 — Direitos e Garantias Fundamentais</option>
              <option value="cpp-art312">Art. 312 CPP — Prisão Preventiva</option>
              <option value="cc-art186">Art. 186 CC — Responsabilidade Civil</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Dificuldade:</label>
              <select id="select-qgen-diff" style="width:100%; padding:8px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
                <option value="Fácil">Fácil</option>
                <option value="Média" selected>Média</option>
                <option value="Difícil">Difícil</option>
                <option value="Avançada">Avançada (OAB/Magistratura)</option>
              </select>
            </div>
            <div>
              <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Objetivo:</label>
              <select id="select-qgen-obj" style="width:100%; padding:8px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
                <option value="Compreensão">Compreensão</option>
                <option value="Aplicação" selected>Aplicação Prática</option>
                <option value="Análise">Análise Dogmática</option>
                <option value="Memorização">Memorização</option>
              </select>
            </div>
          </div>

          <button id="btn-run-qgen" class="btn-primary" style="padding:10px; font-size:0.9rem; font-weight:700; width:100%; margin-top:6px;">
            <i class="fa-solid fa-play"></i> Gerar e Auditar Questão
          </button>
        </div>

        <!-- Área de Resultados & Stepper Visual do Pipeline -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:22px; min-height:480px;">
          
          <div id="qgen-stepper-box" class="hidden" style="margin-bottom:20px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
            <strong style="font-size:0.82rem; color:var(--accent-amber); display:block; margin-bottom:10px;">
              <i class="fa-solid fa-gears fa-spin"></i> Executando Pipeline de Validação Multiestágio...
            </strong>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; font-size:0.75rem;">
              <div class="stepper-item" id="step-struct"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Estrutural</div>
              <div class="stepper-item" id="step-legal"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Referências</div>
              <div class="stepper-item" id="step-ground"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Fonte Real</div>
              <div class="stepper-item" id="step-answer"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Gabarito</div>
              <div class="stepper-item" id="step-alt"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Distratores</div>
              <div class="stepper-item" id="step-score"><i class="fa-solid fa-circle-notch fa-spin text-amber"></i> Quality Score</div>
            </div>
          </div>

          <div id="qgen-output-container">
            <div style="text-align:center; padding:48px 20px; color:var(--text-muted);">
              <i class="fa-solid fa-brain" style="font-size:3rem; opacity:0.3; margin-bottom:12px;"></i>
              <p>Configure a fonte ao lado e clique em <strong>"Gerar e Auditar Questão"</strong> para ver a geração ancorada e o score de qualidade.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Aba 2: Banco de Questões Validadas
  // --------------------------------------------------------------------------
  renderBankTab(questions) {
    if (questions.length === 0) {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:48px; text-align:center; color:var(--text-muted);">
          <i class="fa-solid fa-box-open" style="font-size:3rem; opacity:0.3; margin-bottom:12px;"></i>
          <p>Nenhuma questão gerada ainda. Use a aba "Gerar Questões" para criar questões auditadas.</p>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${questions.map((q, idx) => this.renderQuestionCard(q, idx)).join('')}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Aba 3: Fila de Moderação e Revisão Humana
  // --------------------------------------------------------------------------
  renderReviewTab(queue) {
    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:22px;">
        <h3 style="font-family:var(--font-display); font-size:1.1rem; color:var(--text-main); margin:0 0 14px 0;">
          <i class="fa-solid fa-user-shield text-amber"></i> Fila de Moderação e Auditoria Humana
        </h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:18px;">Questões que exigem aprovação de um docente ou que foram reportadas por alunos antes de entrarem em novos simulados.</p>
        
        ${queue.length === 0 ? `
          <div style="text-align:center; padding:32px; color:#10b981;">
            <i class="fa-solid fa-circle-check" style="font-size:2.5rem; margin-bottom:8px;"></i>
            <p style="margin:0; font-size:0.9rem;">Todas as questões estão validadas! Nenhuma pendência na fila de moderação.</p>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${queue.map(item => `
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="font-size:0.85rem; color:var(--accent-amber);">Questão ${item.questionId}</strong>
                  <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">Motivo: ${item.reason}</span>
                </div>
                <button class="btn-primary btn-mod-approve" data-id="${item.questionId}" style="padding:4px 10px; font-size:0.75rem;">
                  <i class="fa-solid fa-check"></i> Aprovar Manualmente
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  renderQuestionCard(q, idx) {
    const scoreColor = q.qualityScore >= 80 ? '#10b981' : q.qualityScore >= 60 ? '#f59e0b' : '#ef4444';
    const statusBadge = q.status === 'approved'
      ? `<span class="badge-official" style="color:#10b981; border-color:#10b981;"><i class="fa-solid fa-check-double"></i> Validada Automaticamente</span>`
      : q.status === 'needs_review'
      ? `<span class="badge-official" style="color:#f59e0b; border-color:#f59e0b;"><i class="fa-solid fa-triangle-exclamation"></i> Precisa de Revisão</span>`
      : `<span class="badge-official" style="color:#ef4444; border-color:#ef4444;"><i class="fa-solid fa-xmark"></i> Rejeitada</span>`;

    return `
      <div class="question-card-item" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="law-code-tag">${q.difficulty || 'Média'}</span>
            <span style="font-size:0.78rem; color:var(--text-muted);"><i class="fa-solid fa-robot text-amber"></i> Gerada por IA</span>
            ${statusBadge}
          </div>
          
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="font-size:0.85rem; color:${scoreColor};">Quality Score: ${q.qualityScore}/100</strong>
            <button class="btn-icon btn-speak-question" data-idx="${idx}" title="Ouvir questão com áudio neural ElevenLabs (Marcos)"><i class="fa-solid fa-volume-high"></i></button>
          </div>
        </div>

        <p style="font-size:0.9rem; line-height:1.5; color:var(--text-main); font-weight:600; margin-bottom:14px;">
          ${q.statement}
        </p>

        <!-- Alternativas -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
          ${(q.alternatives || []).map((alt, aIdx) => {
            const letter = ['A', 'B', 'C', 'D', 'E'][aIdx] || '';
            const isCorrect = aIdx === q.proposed_answer;
            return `
              <div class="q-option-row" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:6px; padding:8px 12px; font-size:0.82rem; color:var(--text-main); display:flex; gap:8px; align-items:start;">
                <strong style="color:var(--accent-amber);">${letter})</strong>
                <span style="flex:1;">${typeof alt === 'string' ? alt : alt.text}</span>
                ${isCorrect ? `<span style="color:#10b981; font-weight:700; font-size:0.75rem;"><i class="fa-solid fa-check"></i> Gabarito</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Explicação & Fundamento -->
        <div style="background:rgba(245,158,11,0.06); border-left:3px solid var(--accent-amber); border-radius:4px; padding:10px 14px; font-size:0.8rem; color:var(--text-main); margin-bottom:12px;">
          <strong style="color:var(--accent-amber); display:block; margin-bottom:2px;"><i class="fa-solid fa-scale-balanced"></i> Fundamentação Jurídica:</strong>
          ${q.explanation}
        </div>

        <!-- Rodapé de Ações & Feedback -->
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
          <span>Referências: ${(q.legal_references || []).join(', ') || 'Vade Mecum Oficial'}</span>
          <div style="display:flex; gap:8px;">
            <button class="btn-secondary btn-q-good" data-id="${q.id}" style="padding:4px 8px; font-size:0.72rem;"><i class="fa-solid fa-thumbs-up text-green"></i> Boa Questão</button>
            <button class="btn-secondary btn-q-report" data-id="${q.id}" style="padding:4px 8px; font-size:0.72rem;"><i class="fa-solid fa-flag text-red"></i> Reportar</button>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Eventos de DOM e Execução
  // --------------------------------------------------------------------------
  attachDomEvents() {
    // Alternar Abas
    document.querySelectorAll('.qgen-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.renderView();
      });
    });

    // Botão Gerar e Auditar Questão
    document.getElementById('btn-run-qgen')?.addEventListener('click', async () => {
      const artSelect = document.getElementById('select-qgen-article');
      const artId = artSelect ? artSelect.value : 'cpc-art300';
      const diffSelect = document.getElementById('select-qgen-diff');
      const diff = diffSelect ? diffSelect.value : 'Média';
      const objSelect = document.getElementById('select-qgen-obj');
      const obj = objSelect ? objSelect.value : 'Aplicação';

      const stepper = document.getElementById('qgen-stepper-box');
      const output = document.getElementById('qgen-output-container');
      if (stepper) stepper.classList.remove('hidden');

      if (this.generationService) {
        const question = await this.generationService.generateFromArticle(artId, { difficulty: diff, objective: obj });
        if (stepper) stepper.classList.add('hidden');
        if (output && question) {
          output.innerHTML = `
            <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:var(--text-main); font-size:0.95rem;"><i class="fa-solid fa-circle-check text-green"></i> Questão Gerada e Auditada no Pipeline:</strong>
              <button id="btn-export-to-sim" class="btn-primary" style="padding:4px 10px; font-size:0.75rem;"><i class="fa-solid fa-share-from-square"></i> Usar no Simulado</button>
            </div>
            ${this.renderQuestionCard(question, 0)}
          `;
          this.attachCardEvents();
        }
      }
    });

    this.attachCardEvents();
  }

  attachCardEvents() {
    // Feedback Positivo
    document.querySelectorAll('.btn-q-good').forEach(btn => {
      btn.addEventListener('click', () => {
        window.Toast?.success('Obrigado pelo feedback! Questão favoritada.');
      });
    });

    // Reportar Questão
    document.querySelectorAll('.btn-q-report').forEach(btn => {
      btn.addEventListener('click', () => {
        const reason = prompt('Qual é o problema encontrado nesta questão? (Ex: Gabarito errado, Ambiguidade, Desatualizada):', 'Gabarito Errado');
        if (reason && this.reviewService) {
          this.reviewService.reportQuestion(btn.dataset.id, reason);
          window.Toast?.info('Report enviado à moderação. Obrigado por aprimorar a base!');
        }
      });
    });

    // Ouvir Questão com ElevenLabs
    document.querySelectorAll('.btn-speak-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const questions = this.generationService && this.generationService.storage ? this.generationService.storage.getGeneratedQuestions() : [];
        const q = questions[parseInt(btn.dataset.idx)] || questions[0];
        if (q && this.audioEngine) {
          const textToSpeak = `${q.statement}. Alternativas: ${(q.alternatives || []).map((a, i) => ['A', 'B', 'C', 'D'][i] + ') ' + a).join('. ')}`;
          this.audioEngine.speakArticle({
            id: 'q_audio_' + Date.now(),
            article_display: 'Questão de Estudo',
            number: 'Auditoria de Questão',
            title: q.topic || 'Simulado Jurídico',
            content: [{ text: textToSpeak, speechText: textToSpeak }],
            voice_id: 'xHUwLsLfyqiYOIVTzLRW' // ElevenLabs Marcos
          });
          window.Toast?.info('Narrando questão com voz neural ElevenLabs (Marcos).');
        }
      });
    });

    // Moderação - Aprovar
    document.querySelectorAll('.btn-mod-approve').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.reviewService) {
          this.reviewService.approveQuestion(btn.dataset.id, 'Professor');
          window.Toast?.success(`Questão ${btn.dataset.id} aprovada e liberada para os simulados.`);
          this.renderView();
        }
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.QuestionGeneratorEngine = QuestionGeneratorEngine;
}

if (typeof module !== 'undefined') {
  module.exports = QuestionGeneratorEngine;
}
