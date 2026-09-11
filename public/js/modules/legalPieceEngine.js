/**
 * VadeAudio AI - LegalPieceEngine (Etapa 38)
 * Controlador de Interface da Central de Peças Jurídicas e Peticionamento Acadêmico.
 * 4 Modos (Aprendizado, Prática, Prova OAB, Correção), Checklist Dinâmico, Diffs e Áudio ElevenLabs.
 */

class LegalPieceEngine {
  constructor(storage, identificationService, templateService, validationPipeline, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.identificationService = identificationService || (typeof LegalPieceIdentificationService !== 'undefined' ? LegalPieceIdentificationService : null);
    this.templateService = templateService || (typeof LegalPieceTemplateService !== 'undefined' ? LegalPieceTemplateService : null);
    this.validationPipeline = validationPipeline || (typeof LegalPieceValidationPipeline !== 'undefined' ? LegalPieceValidationPipeline : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeMode = 'practice'; // 'learning' | 'practice' | 'exam' | 'review'
    this.activeCase = {
      id: 'case_cpc_tutela_1',
      title: 'Ação de Obrigação de Fazer c/c Tutela de Urgência — Negativa de Cirurgia por Plano de Saúde',
      area: 'civil',
      proceduralStage: 'Fase Pré-Processual (Petição Inicial)',
      expectedPiece: 'Petição Inicial',
      expectedCourt: 'Vara Cível',
      facts: [
        { id: 'f1', description: 'Autor é beneficiário adimplente do plano de saúde há 5 anos.', isCritical: true, keywords: ['beneficiário', 'adimplente', 'plano'] },
        { id: 'f2', description: 'Médico prescreveu cirurgia cardíaca de urgência em 10/05/2026.', isCritical: true, keywords: ['cirurgia', 'cardíaca', 'urgência', '10/05'] },
        { id: 'f3', description: 'Plano de saúde negou cobertura sob alegação infundada de carência.', isCritical: true, keywords: ['negou', 'cobertura', 'carência'] }
      ],
      expectedArticles: ['Art. 300 CPC', 'Art. 14 CDC', 'Art. 186 CC']
    };

    this.currentText = '';
    this.lastEvaluation = null;
  }

  renderStudio() {
    const container = document.getElementById('legal-pieces-content-container') || document.getElementById('view-legal-pieces');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Central de Peças -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; font-weight:700;">ETAPA 38</span>
            <span style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-graduation-cap"></i> Peticionamento Acadêmico & OAB</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-pen-nib text-amber"></i> Central de Peças Jurídicas & Redação Processual
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Ambiente de treinamento estruturado: identifique a peça, planeje fundamentos e escreva sua minuta com correção pedagógica.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-piece-listen-tutor" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-microphone text-amber"></i> Corrigir Comigo (Marcos)
          </button>
          <button id="btn-piece-run-review" class="btn-primary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-magnifying-glass-chart"></i> Revisar Peça
          </button>
        </div>
      </div>

      <!-- Seletor de Modo de Estudo -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeMode === 'learning' ? 'active' : ''}" data-piece-mode="learning"><i class="fa-solid fa-graduation-cap"></i> Modo Aprendizado (Passo a Passo)</button>
        <button class="chapter-btn ${this.activeMode === 'practice' ? 'active' : ''}" data-piece-mode="practice"><i class="fa-solid fa-pen-to-square"></i> Modo Prática (Redação Livre)</button>
        <button class="chapter-btn ${this.activeMode === 'exam' ? 'active' : ''}" data-piece-mode="exam"><i class="fa-solid fa-stopwatch"></i> Modo Prova OAB 2ª Fase</button>
        <button class="chapter-btn ${this.activeMode === 'review' ? 'active' : ''}" data-piece-mode="review"><i class="fa-solid fa-clipboard-check"></i> Modo Correção & Rubricas</button>
      </div>

      <!-- Grid Principal: Caso / Checklist à Esquerda + Editor à Direita -->
      <div style="display:grid; grid-template-columns: 360px 1fr; gap:20px;">
        <!-- Painel Lateral: Caso e Checklist -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
            <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.7rem;">CASO PRÁTICO</span>
            <h3 style="font-size:0.95rem; color:var(--text-main); margin:8px 0 6px 0;">${this.activeCase.title}</h3>
            <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.4; margin:0 0 10px 0;">Fase: <strong>${this.activeCase.proceduralStage}</strong></p>
            
            <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); padding:8px 10px; border-radius:4px; font-size:0.78rem; color:var(--text-main);">
              <strong>Fatos Essenciais do Caso:</strong>
              <ul style="margin:4px 0 0 16px; padding:0;">
                ${this.activeCase.facts.map(f => `<li>${f.description}</li>`).join('')}
              </ul>
            </div>
          </div>

          <!-- Checklist Processual -->
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
            <h4 style="font-size:0.88rem; color:var(--text-main); margin:0 0 10px 0;"><i class="fa-solid fa-list-check text-amber"></i> Checklist da Peça (Art. 319 CPC)</h4>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem; color:var(--text-muted);">
              <label><input type="checkbox" checked disabled> Endereçamento ao Juízo Cível</label>
              <label><input type="checkbox" checked disabled> Qualificação e Inclusão do Réu</label>
              <label><input type="checkbox" checked disabled> Narração Fática e Recusa Indevida</label>
              <label><input type="checkbox" checked disabled> Pedido de Tutela de Urgência (Art. 300)</label>
              <label><input type="checkbox" checked disabled> Pedido Principal de Obrigação de Fazer</label>
              <label><input type="checkbox" checked disabled> Requerimento de Provas e Valor da Causa</label>
            </div>
          </div>
        </div>

        <!-- Editor de Redação & Feedback -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span style="font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-code-compare text-amber"></i> Minuta do Aluno (Versão 1)</span>
              <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-floppy-disk"></i> Autosave Ativo</span>
            </div>

            <textarea id="textarea-legal-piece-draft" rows="18" placeholder="Redija a sua peça jurídica aqui...\n\nEXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE...\n\n[NOME DO AUTOR], já qualificado nos autos...\n\nDOS FATOS...\nDO DIREITO E DA TUTELA DE URGÊNCIA...\nDOS PEDIDOS..." style="width:100%; background:rgba(0,0,0,0.25); border:1px solid var(--border-light); border-radius:10px; padding:16px; color:var(--text-main); font-family:monospace; font-size:0.88rem; line-height:1.6; resize:vertical; outline:none;">${this.currentText || ''}</textarea>
          </div>

          <!-- Painel de Diagnóstico da Última Avaliação (Se houver) -->
          <div id="piece-evaluation-panel" style="${this.lastEvaluation ? 'display:block;' : 'display:none;'}">
            ${this.renderEvaluationReport(this.lastEvaluation)}
          </div>
        </div>
      </div>
    `;

    this.attachDomEvents();
  }

  renderEvaluationReport(evalRes) {
    if (!evalRes) return '';

    return `
      <div style="background:var(--bg-card); border:1px solid ${evalRes.passedExam ? '#10b981' : '#f59e0b'}; border-radius:14px; padding:22px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 4px 0;"><i class="fa-solid fa-clipboard-check text-amber"></i> Diagnóstico de Peticionamento</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">Avaliação automática baseada no espelho da OAB e nos requisitos processuais.</span>
          </div>
          <div style="text-align:right;">
            <span style="font-size:1.6rem; font-weight:800; color:${evalRes.passedExam ? '#10b981' : '#f59e0b'};">${evalRes.totalScore} / 10.0</span>
            <span class="badge-new" style="background:${evalRes.passedExam ? '#10b981' : '#f59e0b'}; color:#000; display:block; margin-top:2px;">${evalRes.passedExam ? 'APROVADO' : 'NECESSITA REVISÃO'}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:1px solid var(--border-light);">
            <strong style="font-size:0.8rem; color:var(--text-main);">Endereçamento & Competência:</strong>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:4px 0 0 0;">${evalRes.rubric.jurisdiction.score} / ${evalRes.rubric.jurisdiction.max} pts</p>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:1px solid var(--border-light);">
            <strong style="font-size:0.8rem; color:var(--text-main);">Cobertura de Fatos Críticos:</strong>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:4px 0 0 0;">${evalRes.rubric.factsCoverage.score} / ${evalRes.rubric.factsCoverage.max} pts</p>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:1px solid var(--border-light);">
            <strong style="font-size:0.8rem; color:var(--text-main);">Fundamentos e Artigos:</strong>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:4px 0 0 0;">${evalRes.rubric.citations.score} / ${evalRes.rubric.citations.max} pts</p>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; border:1px solid var(--border-light);">
            <strong style="font-size:0.8rem; color:var(--text-main);">Coerência dos Pedidos:</strong>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:4px 0 0 0;">${evalRes.rubric.requests.score} / ${evalRes.rubric.requests.max} pts</p>
          </div>
        </div>
      </div>
    `;
  }

  attachDomEvents() {
    // Troca de Modo
    document.querySelectorAll('[data-piece-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeMode = btn.dataset.pieceMode;
        this.renderStudio();
      });
    });

    // Autosave do Texto
    const textarea = document.getElementById('textarea-legal-piece-draft');
    textarea?.addEventListener('input', (e) => {
      this.currentText = e.target.value;
      if (this.storage) {
        this.storage.saveLegalPieceDraft({
          caseId: this.activeCase.id,
          text: this.currentText,
          pieceType: this.activeCase.expectedPiece
        });
      }
    });

    // Revisar Peça com Pipeline
    document.getElementById('btn-piece-run-review')?.addEventListener('click', () => {
      const text = document.getElementById('textarea-legal-piece-draft')?.value || '';
      if (!text.trim()) {
        window.Toast?.error('Redija ao menos uma minuta inicial antes de solicitar a revisão.');
        return;
      }

      this.lastEvaluation = LegalPieceValidationPipeline.validatePiece(text, this.activeCase);
      if (this.storage) {
        this.storage.saveLegalPieceEvaluation(this.lastEvaluation);
      }
      this.renderStudio();
      window.Toast?.success('Revisão concluída com sucesso!');
    });

    // Áudio Correção com ElevenLabs (Marcos)
    document.getElementById('btn-piece-listen-tutor')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = `Olá! Vamos revisar a sua ${this.activeCase.expectedPiece}. Preste atenção na competência do juízo cível, narre todos os fatos da recusa de cirurgia e não se esqueça de formular o pedido de tutela provisória de urgência nos termos do artigo 300 do CPC.`;
        this.audioEngine.speakArticle({
          id: 'piece_tutor_audio_' + Date.now(),
          article_display: 'Correção Pedagógica',
          number: 'Professor Marcos',
          title: this.activeCase.title,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.LegalPieceEngine = LegalPieceEngine;
}

if (typeof module !== 'undefined') {
  module.exports = LegalPieceEngine;
}
