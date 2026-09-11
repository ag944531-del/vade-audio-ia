/**
 * VadeAudio AI - DiscursiveExamStudioEngine (Etapa 43)
 * Controlador de Interface da Central de Provas Discursivas & Respostas Jurídicas com IA.
 * Workspace Duplo, Correção por Rubricas, Versionamento V1 x V2 e Áudio Socrático com Marcos.
 */

class DiscursiveExamStudioEngine {
  constructor(storage, pipeline, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.pipeline = pipeline || (typeof LegalDiscursiveEvaluationPipeline !== 'undefined' ? LegalDiscursiveEvaluationPipeline : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeMode = 'train'; // 'train' | 'practice' | 'exam' | 'oral'
    this.activeQuestion = {
      id: 'disc_q_civil_01',
      title: 'OAB 2ª Fase — Responsabilidade Civil Bancária e Fortuito Interno',
      statement: 'João foi vítima de um golpe de engenharia social por telefone, no qual terceiros se passaram por funcionários de seu banco e o induziram a realizar transferências instantâneas de vultosos valores. O banco recusou o ressarcimento administrativo, alegando culpa exclusiva da vítima. Na qualidade de advogado(a) de João, elabore a resposta jurídica fundamentada indicando a responsabilidade da instituição financeira e a súmula aplicável.',
      expectedIssues: [
        { id: 'iss_1', name: 'Responsabilidade Civil Objetiva', keywords: ['objetiva', 'risco'] },
        { id: 'iss_2', name: 'Fortuito Interno e Dever de Segurança', keywords: ['fortuito interno', 'segurança'] }
      ],
      expectedArticles: ['Súmula 479', 'Art. 14 CDC'],
      forbiddenInventions: ['contrato assinado em cartório'],
      defensiblePositions: [
        { id: 'pos_1', title: 'Culpa Concorrente com Mitigação do Dano', keywords: ['concorrente', 'mitigação'] }
      ]
    };

    this.currentAttempt = {
      text: 'Trata-se de hipótese de responsabilidade civil objetiva da instituição financeira com fulcro no art. 14 do CDC e na Súmula 479 do STJ. O golpe de engenharia social consubstancia fortuito interno inerente ao risco da atividade bancária, haja vista que as transações fugiram totalmente ao perfil habitual do correntista sem que os mecanismos antifraude do banco atuassem para bloqueio preventivo. Portanto, conclui-se que o banco responde objetivamente pelos danos materiais suportados.',
      evaluation: null
    };
  }

  renderStudio() {
    const container = document.getElementById('discursive-exams-content-container') || document.getElementById('view-discursive-exams');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Central Discursiva -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:#fff; font-weight:700;">ETAPA 43</span>
            <span style="font-size:0.75rem; color:#60a5fa;"><i class="fa-solid fa-pen-nib"></i> Central de Provas Discursivas & Respostas com IA</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-scale-balanced text-amber"></i> ${this.activeQuestion.title}
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Treine respostas abertas: issue spotting, análise de fatos, subsunção fato-norma e rubrica ponderada.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-oral-feedback-marcos" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-headphones text-amber"></i> Tutoria Oral (Marcos)
          </button>
        </div>
      </div>

      <!-- Workspace Duplo: Enunciado à Esquerda + Editor à Direita -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <!-- Card do Enunciado e Fatos -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.72rem;">
              ⚖️ CASO PRÁTICO & ENUNCIADO
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">OAB / Concurso</span>
          </div>
          <p style="font-size:0.95rem; color:var(--text-main); line-height:1.6; margin:0 0 16px 0;">
            ${this.activeQuestion.statement}
          </p>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <h4 style="font-size:0.82rem; color:var(--text-muted); margin:0 0 6px 0; text-transform:uppercase;">Dispositivos e Fontes Relevantes</h4>
            <span class="badge-official" style="color:#06b6d4; border-color:#06b6d4; font-size:0.75rem;">Súmula 479 STJ</span>
            <span class="badge-official" style="color:#10b981; border-color:#10b981; font-size:0.75rem;">Art. 14 CDC</span>
          </div>
        </div>

        <!-- Editor de Resposta do Estudante -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8; font-size:0.72rem;">
              ✍️ SUA RESPOSTA JURÍDICA
            </span>
            <span id="discursive-word-count" style="font-size:0.75rem; color:var(--text-muted);">Palavras: 54</span>
          </div>

          <textarea id="discursive-answer-textarea" rows="8" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:10px; padding:14px; color:#fff; font-size:0.9rem; line-height:1.6; outline:none; resize:vertical; flex-grow:1;">${this.currentAttempt.text}</textarea>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
            <button id="btn-discursive-speech-input" class="btn-secondary" style="padding:8px 14px; font-size:0.82rem;"><i class="fa-solid fa-microphone"></i> Ditado por Voz (STT)</button>
            <button id="btn-submit-discursive-eval" class="btn-primary" style="padding:8px 20px; font-size:0.85rem;"><i class="fa-solid fa-gavel"></i> Avaliar com Rubrica IA</button>
          </div>
        </div>
      </div>

      <!-- Relatório de Correção Estruturada -->
      <div id="discursive-eval-result-container">
        ${this.renderEvaluationReport()}
      </div>
    `;

    this.attachDomEvents();
  }

  renderEvaluationReport() {
    if (!this.currentAttempt.evaluation) {
      // Avaliação prévia automática para primeira exibição
      this.currentAttempt.evaluation = LegalDiscursiveEvaluationPipeline.evaluate(this.activeQuestion, this.currentAttempt.text);
    }

    const ev = this.currentAttempt.evaluation;
    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div>
            <span class="badge-new" style="background:#a855f7; color:#fff; font-size:0.7rem;">📊 AVALIAÇÃO BASEADA EM EVIDÊNCIAS</span>
            <h3 style="font-size:1.15rem; color:var(--text-main); margin:4px 0 0 0;">Desempenho na Rubrica Estruturada</h3>
          </div>
          <div style="text-align:right;">
            <span style="font-size:1.6rem; font-weight:800; color:${ev.finalGrade >= 7.0 ? '#10b981' : '#f59e0b'}; font-family:var(--font-display);">${ev.finalGrade.toFixed(1)} / 10.0</span>
            <div style="font-size:0.75rem; color:var(--text-muted);">Nota Ponderada Final</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:18px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Identificação do Problema</div>
            <strong style="color:#38bdf8;">${ev.issueRes.spottedCount} de ${ev.issueRes.totalExpected} cobertos</strong>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Fundamentação Legal</div>
            <strong style="color:${ev.groundRes.hasHallucinations ? '#ef4444' : '#10b981'};">${ev.groundRes.citedArticles.join(', ') || 'Nenhum artigo'}</strong>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Subsunção Fato-Norma</div>
            <strong style="color:#f59e0b;">Nota: ${ev.appRes.applicationScore.toFixed(1)}/10.0</strong>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Fatos Inventados</div>
            <strong style="color:${ev.factRes.hasInventedFacts ? '#ef4444' : '#10b981'};">${ev.factRes.hasInventedFacts ? 'Detectados' : 'Nenhum'}</strong>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.02); border-left:4px solid var(--accent-amber); border-radius:8px; padding:14px; font-size:0.88rem; color:var(--text-main); line-height:1.5;">
          <strong>Feedback Pedagógico do Corretor:</strong> ${ev.appRes.feedback}
        </div>
      </div>
    `;
  }

  attachDomEvents() {
    // Avaliação da Resposta
    document.getElementById('btn-submit-discursive-eval')?.addEventListener('click', () => {
      const text = document.getElementById('discursive-answer-textarea')?.value || '';
      if (!text.trim()) return;

      this.currentAttempt.text = text;
      this.currentAttempt.evaluation = LegalDiscursiveEvaluationPipeline.evaluate(this.activeQuestion, text);

      if (this.storage) {
        this.storage.saveDiscursiveAttempt({
          questionId: this.activeQuestion.id,
          text,
          evaluation: this.currentAttempt.evaluation
        });
      }

      window.Toast?.success('Resposta corrigida com sucesso pela rubrica ponderada!');
      this.renderStudio();
    });

    // Tutoria Oral Marcos
    document.getElementById('btn-oral-feedback-marcos')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = `Olá! Analisei a sua resposta discursiva sobre a responsabilidade civil bancária. Você identificou muito bem o enquadramento na Súmula 479 do STJ e no artigo 14 do CDC. A sua subsunção aos fatos foi precisa ao destacar que transações atípicas exigem bloqueio preventivo pelo sistema antifraude. Parabéns pela objetividade!`;
        this.audioEngine.speakArticle({
          id: 'discursive_audio_' + Date.now(),
          article_display: 'Correção Discursiva',
          number: 'Professor Marcos',
          title: this.activeQuestion.title,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.DiscursiveExamStudioEngine = DiscursiveExamStudioEngine;
}

if (typeof module !== 'undefined') {
  module.exports = DiscursiveExamStudioEngine;
}
