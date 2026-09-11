/**
 * VadeAudio AI - ExamRevisionHubEngine (Etapa 41)
 * Controlador de Interface da Central de Revisão Inteligente Pré-Prova.
 * Estratégias por Horizonte de Tempo, Modo Foco com Cronômetro e Áudio ElevenLabs Marcos.
 */

class ExamRevisionHubEngine {
  constructor(storage, contextBuilder, priorityEngine, adaptiveEngine, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.contextBuilder = contextBuilder || (typeof ExamRevisionContextBuilder !== 'undefined' ? new ExamRevisionContextBuilder(this.storage) : null);
    this.priorityEngine = priorityEngine || (typeof ExamRevisionPriorityEngine !== 'undefined' ? ExamRevisionPriorityEngine : null);
    this.adaptiveEngine = adaptiveEngine || (typeof AdaptiveExamRevisionEngine !== 'undefined' ? AdaptiveExamRevisionEngine : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeHorizon = '60m'; // '7d' | '3d' | '24h' | '60m' | '15m'
    this.activeExam = {
      id: 'exam_p1_penal',
      title: 'P1 — Direito Penal II (Parte Geral)',
      discipline: 'Direito Penal',
      date: '2026-09-20',
      topics: [
        { id: 'top_1', name: 'Dolo e Culpa', importance: 'high', mastery: 0.45, errorCount: 4 },
        { id: 'top_2', name: 'Erro de Tipo e de Proibição', importance: 'high', mastery: 0.35, errorCount: 6 },
        { id: 'top_3', name: 'Iter Criminis e Tentativa', importance: 'medium', mastery: 0.80, errorCount: 1 },
        { id: 'top_4', name: 'Concurso de Pessoas', importance: 'medium', mastery: 0.60, errorCount: 2 }
      ]
    };
  }

  renderHub() {
    const container = document.getElementById('exam-revision-content-container') || document.getElementById('view-exam-revision');
    if (!container) return;

    const rankedTopics = ExamRevisionPriorityEngine.rankTopics(this.activeExam.topics);
    const plan = AdaptiveExamRevisionEngine.generatePlan(this.activeHorizon, rankedTopics);

    container.innerHTML = `
      <!-- Header da Central de Revisão -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #ef4444, #b91c1c); color:#fff; font-weight:700;">ETAPA 41</span>
            <span style="font-size:0.75rem; color:#ef4444;"><i class="fa-solid fa-fire"></i> Central de Revisão Inteligente Pré-Prova</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-bolt text-amber"></i> ${this.activeExam.title}
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Plano de estudo calibrado de forma estrita para o seu tempo disponível, priorizando suas fraquezas e erros.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-start-revision-audio" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-headphones text-amber"></i> Revisão em Áudio 10min (Marcos)
          </button>
        </div>
      </div>

      <!-- Seletor de Horizonte de Tempo -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeHorizon === '60m' ? 'active' : ''}" data-rev-horizon="60m"><i class="fa-solid fa-stopwatch"></i> Revisão de 60 Minutos</button>
        <button class="chapter-btn ${this.activeHorizon === '15m' ? 'active' : ''}" data-rev-horizon="15m"><i class="fa-solid fa-bolt"></i> Emergência (15 Minutos)</button>
        <button class="chapter-btn ${this.activeHorizon === '24h' ? 'active' : ''}" data-rev-horizon="24h"><i class="fa-solid fa-moon"></i> Véspera da Prova (24h)</button>
        <button class="chapter-btn ${this.activeHorizon === '7d' ? 'active' : ''}" data-rev-horizon="7d"><i class="fa-solid fa-calendar-days"></i> Plano de 7 Dias</button>
      </div>

      <!-- Grid Principal: Prioridades à Esquerda + Linha do Tempo de Blocos à Direita -->
      <div style="display:grid; grid-template-columns: 360px 1fr; gap:20px;">
        <!-- Painel Lateral: Raio-X de Prioridades dos Tópicos -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px;">
            <h3 style="font-size:0.95rem; color:var(--text-main); margin:0 0 12px 0;"><i class="fa-solid fa-bullseye text-amber"></i> Tópicos Priorizados por Fraqueza</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${rankedTopics.map(t => `
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px 12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="font-size:0.85rem; color:var(--text-main);">${t.name}</strong>
                    <span class="badge-official" style="color:${t.priorityScore >= 70 ? '#ef4444' : '#10b981'}; border-color:${t.priorityScore >= 70 ? '#ef4444' : '#10b981'}; font-size:0.68rem;">Score: ${t.priorityScore}</span>
                  </div>
                  <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">${t.reasonCodes[0] || 'Tópico da avaliação'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Painel Central: Blocos da Sessão de Revisão -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">${plan.strategy}</span>
              <h3 style="font-size:1.15rem; color:var(--text-main); margin:4px 0 0 0;">Estrutura da Sua Sessão (${plan.totalMinutes} min)</h3>
            </div>
            <button id="btn-start-focus-session" class="btn-primary" style="padding:8px 18px;"><i class="fa-solid fa-play"></i> Iniciar Modo Foco</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${(plan.blocks || plan.days || []).map((item, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px 16px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-weight:700; color:var(--accent-amber); font-size:0.95rem;">${item.order ? `#${item.order}` : `D${item.day}`}</span>
                  <div>
                    <h4 style="font-size:0.9rem; color:var(--text-main); margin:0;">${item.title}</h4>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${item.reason || 'Atividade programada da revisão'}</span>
                  </div>
                </div>
                <span class="badge-official" style="color:#06b6d4; border-color:#06b6d4; font-size:0.75rem;">${item.durationMinutes} min</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachDomEvents();
  }

  attachDomEvents() {
    // Troca de Horizonte
    document.querySelectorAll('[data-rev-horizon]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeHorizon = btn.dataset.revHorizon;
        this.renderHub();
      });
    });

    // Iniciar Modo Foco
    document.getElementById('btn-start-focus-session')?.addEventListener('click', () => {
      window.Toast?.success(`Modo Foco ativado para a revisão de ${this.activeHorizon}! Bom estudo!`);
    });

    // Áudio Revisão com ElevenLabs Marcos
    document.getElementById('btn-start-revision-audio')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = `Olá! Vamos iniciar a revisão rápida para a sua ${this.activeExam.title}. Atenção máxima à diferença entre dolo eventual e culpa consciente. No dolo eventual, o agente assume o risco do resultado; na culpa consciente, ele confia sinceramente na sua não ocorrência. Nos erros de tipo, o artigo 20 do Código Penal exclui o dolo, mas permite a punição por culpa se prevista em lei.`;
        this.audioEngine.speakArticle({
          id: 'rev_audio_' + Date.now(),
          article_display: 'Revisão Pré-Prova',
          number: 'Professor Marcos',
          title: this.activeExam.title,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.ExamRevisionHubEngine = ExamRevisionHubEngine;
}

if (typeof module !== 'undefined') {
  module.exports = ExamRevisionHubEngine;
}
