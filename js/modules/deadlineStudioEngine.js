/**
 * VadeAudio AI - DeadlineStudioEngine (Etapa 39)
 * Controlador de Interface da Central de Prazos Processuais e Linha do Tempo Jurídica.
 * Calculadora Determinística, Modo Treino com Diagnóstico de Erros e Áudio ElevenLabs.
 */

class DeadlineStudioEngine {
  constructor(storage, countingEngine, errorAnalyzer, timelineService, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.countingEngine = countingEngine || (typeof DeadlineCountingEngine !== 'undefined' ? DeadlineCountingEngine : null);
    this.errorAnalyzer = errorAnalyzer || (typeof DeadlineErrorAnalyzer !== 'undefined' ? DeadlineErrorAnalyzer : null);
    this.timelineService = timelineService || (typeof LegalProcessTimelineService !== 'undefined' ? LegalProcessTimelineService : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeTab = 'calculator'; // 'calculator' | 'training' | 'timeline' | 'rules'
    this.lastCalculation = null;
  }

  renderStudio() {
    const container = document.getElementById('deadlines-content-container') || document.getElementById('view-deadlines');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Central de Prazos -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #06b6d4, #0891b2); color:#000; font-weight:700;">ETAPA 39</span>
            <span style="font-size:0.75rem; color:#06b6d4;"><i class="fa-solid fa-calculator"></i> Motor Determinístico & Linha do Tempo</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-stopwatch-24 text-amber"></i> Central de Prazos Processuais & Linha do Tempo
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Cálculo auditável, contagem em dias úteis ou corridos, aplicação do Art. 224 do CPC e linha do tempo do processo.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-deadline-listen-tutor" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-microphone text-amber"></i> Treinar Prazo (Marcos)
          </button>
        </div>
      </div>

      <!-- Navegação por Abas -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeTab === 'calculator' ? 'active' : ''}" data-dl-tab="calculator"><i class="fa-solid fa-calculator"></i> Calculadora Acadêmica</button>
        <button class="chapter-btn ${this.activeTab === 'training' ? 'active' : ''}" data-dl-tab="training"><i class="fa-solid fa-bullseye"></i> Treinar Prazos</button>
        <button class="chapter-btn ${this.activeTab === 'timeline' ? 'active' : ''}" data-dl-tab="timeline"><i class="fa-solid fa-timeline"></i> Linha do Tempo Processual</button>
        <button class="chapter-btn ${this.activeTab === 'rules' ? 'active' : ''}" data-dl-tab="rules"><i class="fa-solid fa-scale-balanced"></i> Catálogo de Regras</button>
      </div>

      <!-- Conteúdo da Aba -->
      <div id="dl-tab-content">
        ${this.renderActiveTab()}
      </div>
    `;

    this.attachDomEvents();
  }

  renderActiveTab() {
    if (this.activeTab === 'rules') {
      const rules = ProceduralDeadlineRuleCatalog.getRules();
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:16px;">
          ${rules.map(r => `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px;">
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">${r.area.toUpperCase()}</span>
              <h3 style="font-size:1.05rem; color:var(--text-main); margin:8px 0 4px 0;">${r.name}</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin:0 0 10px 0;"><strong>Prazo:</strong> ${r.deadlineLength} ${r.unit}</p>
              <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); padding:8px 10px; font-size:0.78rem; color:var(--text-main); margin-bottom:8px;">
                <strong>Fundamento:</strong> ${r.legalBasis}
              </div>
              <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-info-circle"></i> ${r.startRule}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'timeline') {
      const events = [
        { id: 'e1', type: 'peticao', title: 'Petição Inicial Distribuída', date: '2026-08-03' },
        { id: 'e2', type: 'citacao', title: 'Citação do Réu Realizada', date: '2026-08-10' },
        { id: 'e3', type: 'decisao', title: 'Decisão Interlocutória Deferindo Liminar', date: '2026-08-12' },
        { id: 'e4', type: 'intimacao', title: 'Intimação no DJe', date: '2026-08-14' }
      ];
      const deadlines = [
        { id: 'd1', title: 'Prazo para Agravo de Instrumento (15 dias úteis)', deadlineEndDate: '2026-09-04' }
      ];
      const built = LegalProcessTimelineService.buildTimeline(events, deadlines);

      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-timeline text-amber"></i> Linha do Tempo Processual Integrada</h3>
          <div style="display:flex; flex-direction:column; gap:12px; border-left:2px solid var(--accent-amber); padding-left:16px; margin-left:8px;">
            ${built.timeline.map(item => `
              <div style="position:relative; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px 16px;">
                <span class="badge-official" style="color:#06b6d4; border-color:#06b6d4; font-size:0.7rem;">${item.date}</span>
                <h4 style="font-size:0.92rem; color:var(--text-main); margin:6px 0 0 0;">${item.title}</h4>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'training') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">EXERCÍCIO DE FIXAÇÃO</span>
          <h3 style="font-size:1.05rem; color:var(--text-main); margin:8px 0 8px 0;">Caso: Apelação Cível em Face de Sentença Publicada no DJe</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">A sentença foi disponibilizada no Diário da Justiça Eletrônico na segunda-feira, <strong>10/08/2026</strong>. Considerando o prazo geral do Art. 1.003, § 5º do CPC (15 dias úteis), qual é o dia final para interposição do recurso?</p>
          
          <div style="display:flex; gap:10px; align-items:center; margin-top:16px; flex-wrap:wrap;">
            <input type="date" id="input-training-answer" class="input-field" value="2026-09-01" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border-light); background:rgba(0,0,0,0.3); color:#fff;">
            <button id="btn-submit-training-answer" class="btn-primary" style="padding:8px 18px;"><i class="fa-solid fa-check"></i> Enviar Resposta</button>
          </div>

          <div id="training-feedback-container" style="margin-top:16px;"></div>
        </div>
      `;
    }

    // Aba de Calculadora
    const calc = this.lastCalculation || DeadlineCountingEngine.calculate({
      ruleId: 'cpc_recurso_geral',
      triggerDateStr: '2026-08-10',
      isDjePublication: true
    });

    return `
      <div style="display:grid; grid-template-columns: 340px 1fr; gap:20px;">
        <!-- Formulário da Calculadora -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px;">
          <h3 style="font-size:1rem; color:var(--text-main); margin:0 0 14px 0;"><i class="fa-solid fa-sliders text-amber"></i> Parâmetros do Prazo</h3>
          
          <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Regra Jurídica / Tipo de Prazo:</label>
          <select id="select-calc-rule" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--border-light); background:rgba(0,0,0,0.3); color:#fff; margin-bottom:12px; font-size:0.82rem;">
            ${ProceduralDeadlineRuleCatalog.getRules().map(r => `
              <option value="${r.id}" ${r.id === calc.ruleUsed.id ? 'selected' : ''}>${r.name} (${r.deadlineLength} ${r.unit})</option>
            `).join('')}
          </select>

          <label style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">Data do Evento (Intimação / Disponibilização):</label>
          <input type="date" id="input-calc-trigger-date" value="${calc.triggerDate}" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--border-light); background:rgba(0,0,0,0.3); color:#fff; margin-bottom:12px; font-size:0.82rem;">

          <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; color:var(--text-main); margin-bottom:16px; cursor:pointer;">
            <input type="checkbox" id="check-calc-dje" checked>
            Disponibilização no Diário da Justiça (DJe)
          </label>

          <button id="btn-run-deadline-calc" class="btn-primary" style="width:100%; padding:10px;"><i class="fa-solid fa-calculator"></i> Calcular Prazo</button>
        </div>

        <!-- Trilha de Auditoria & Resultado Determinístico -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:22px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-light); padding-bottom:12px;">
            <div>
              <span class="badge-official" style="color:#10b981; border-color:#10b981;">CÁLCULO DETERMINÍSTICO AUDITADO</span>
              <h3 style="font-size:1.15rem; color:var(--text-main); margin:4px 0 0 0;">Vencimento Final: <span style="color:var(--accent-amber);">${calc.deadlineEndDate}</span></h3>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Dias Contados:</span>
              <strong style="display:block; color:#fff; font-size:1.1rem;">${calc.daysCounted} ${calc.ruleUsed.unit}</strong>
            </div>
          </div>

          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">
            ${calc.summary}
          </p>

          <h4 style="font-size:0.88rem; color:var(--text-main); margin:0 0 10px 0;"><i class="fa-solid fa-list-ol text-amber"></i> Passo a Passo da Contagem Dia a Dia:</h4>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:280px; overflow-y:auto; padding-right:6px;">
            ${calc.calculationSteps.map(step => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:6px; padding:6px 12px; font-size:0.78rem;">
                <span style="color:#06b6d4; font-family:monospace;">${step.date}</span>
                <span style="color:var(--text-main);">${step.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  attachDomEvents() {
    // Troca de Abas
    document.querySelectorAll('[data-dl-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.dlTab;
        this.renderStudio();
      });
    });

    // Executar Cálculo
    document.getElementById('btn-run-deadline-calc')?.addEventListener('click', () => {
      const ruleId = document.getElementById('select-calc-rule')?.value || 'cpc_recurso_geral';
      const triggerDateStr = document.getElementById('input-calc-trigger-date')?.value || '2026-08-10';
      const isDjePublication = document.getElementById('check-calc-dje')?.checked || false;

      this.lastCalculation = DeadlineCountingEngine.calculate({
        ruleId,
        triggerDateStr,
        isDjePublication
      });

      if (this.storage) {
        this.storage.saveDeadlineCalculation(this.lastCalculation);
      }

      this.renderStudio();
      window.Toast?.success('Prazo calculado com sucesso!');
    });

    // Enviar Resposta do Treino
    document.getElementById('btn-submit-training-answer')?.addEventListener('click', () => {
      const answerDate = document.getElementById('input-training-answer')?.value || '';
      const correctCalc = DeadlineCountingEngine.calculate({
        ruleId: 'cpc_recurso_geral',
        triggerDateStr: '2026-08-10',
        isDjePublication: true
      });

      const analysis = DeadlineErrorAnalyzer.analyzeError(answerDate, correctCalc);
      const feedbackContainer = document.getElementById('training-feedback-container');

      if (feedbackContainer) {
        feedbackContainer.innerHTML = `
          <div style="background:rgba(255,255,255,0.02); border:1px solid ${analysis.isCorrect ? '#10b981' : '#f59e0b'}; border-radius:10px; padding:16px; font-size:0.88rem; color:var(--text-main); line-height:1.5;">
            <strong style="color:${analysis.isCorrect ? '#10b981' : '#f59e0b'};"><i class="fa-solid ${analysis.isCorrect ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${analysis.isCorrect ? 'Resposta Correta!' : 'Divergência Encontrada:'}</strong>
            <p style="margin:6px 0 0 0;">${analysis.explanation || analysis.message}</p>
            ${!analysis.isCorrect ? `<p style="margin:4px 0 0 0; font-size:0.8rem; color:var(--text-muted);">Data correta: <strong>${correctCalc.deadlineEndDate}</strong> (${correctCalc.ruleUsed.legalBasis})</p>` : ''}
          </div>
        `;
      }

      if (!analysis.isCorrect && this.storage) {
        this.storage.recordDeadlineError({
          studentDate: answerDate,
          correctDate: correctCalc.deadlineEndDate,
          category: analysis.errorCategory
        });
      }
    });

    // Ouvir com ElevenLabs Marcos
    document.getElementById('btn-deadline-listen-tutor')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = 'Vamos entender a regra de contagem de prazos do CPC. Primeiro, exclui-se o dia do começo e inclui-se o do vencimento. Na publicação do Diário da Justiça Eletrônico, considera-se publicado no primeiro dia útil seguinte, iniciando-se a contagem de 15 dias úteis no segundo dia útil subsequente.';
        this.audioEngine.speakArticle({
          id: 'dl_audio_' + Date.now(),
          article_display: 'Contagem de Prazos',
          number: 'Professor Marcos',
          title: 'Regras Processuais do CPC',
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.DeadlineStudioEngine = DeadlineStudioEngine;
}

if (typeof module !== 'undefined') {
  module.exports = DeadlineStudioEngine;
}
