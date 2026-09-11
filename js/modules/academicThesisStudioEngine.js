/**
 * VadeAudio AI - AcademicThesisStudioEngine (Etapa 42)
 * Controlador de Interface da Central de Trabalhos, TCC & Pesquisa Jurídica Avançada.
 * Matriz de Pesquisa, Editor Capitular, Auditoria ABNT e Banca Simulada com ElevenLabs Marcos.
 */

class AcademicThesisStudioEngine {
  constructor(storage, projectService, gapService, referenceAuditService, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.projectService = projectService || (typeof AcademicResearchProjectService !== 'undefined' ? new AcademicResearchProjectService(this.storage) : null);
    this.gapService = gapService || (typeof ResearchGapService !== 'undefined' ? ResearchGapService : null);
    this.referenceAuditService = referenceAuditService || (typeof AcademicReferenceAuditService !== 'undefined' ? AcademicReferenceAuditService : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeTab = 'matrix'; // 'matrix' | 'chapters' | 'sources' | 'audit' | 'defense'
    this.activeProject = {
      id: 'proj_tcc_civil',
      title: 'A Responsabilidade Civil das Instituições Financeiras por Fraudes Eletrônicas',
      course: 'Direito',
      type: 'TCC',
      theme: 'Responsabilidade Civil Bancária',
      problem: 'Em que medida as instituições financeiras respondem objetivamente pelos danos decorrentes de golpes de engenharia social praticados por terceiros?',
      hypothesis: 'A responsabilidade é objetiva com esteio na Súmula 479 do STJ e no risco da atividade, salvo culpa exclusiva comprovada da vítima.',
      generalObjective: 'Analisar os pressupostos da responsabilidade civil objetiva das instituições financeiras nas transações eletrônicas fraudulentas.',
      specificObjectives: [
        'Examinar a evolução da responsabilidade civil no Código Civil e no CDC',
        'Investigar os critérios de aplicação da Súmula 479 do Superior Tribunal de Justiça',
        'Avaliar o dever de segurança e mitigação de riscos pelos bancos digitais'
      ],
      methodology: 'Pesquisa bibliográfica, documental e jurisprudencial com método dedutivo.',
      chapters: [
        { id: 'chap_1', title: '1. Introdução e Delimitação Temática', text: 'O avanço das tecnologias de pagamento instantâneo trouxe desafios à segurança jurídica (DINIZ, 2022).', sources: ['Diniz - Curso de Direito Civil'] },
        { id: 'chap_2', title: '2. A Responsabilidade Objetiva e o Risco do Empreendimento', text: 'Conforme preceitua a doutrina, o dever de indenizar decorre do fortuito interno (TARTUCE, 2023).', sources: ['Tartuce - Manual de Direito Civil'] },
        { id: 'chap_3', title: '3. A Jurisprudência do STJ e a Súmula 479', text: 'As instituições financeiras respondem objetivamente pelos ilícitos praticados por terceiros no âmbito de operações bancárias.', sources: ['Súmula 479 STJ'] },
        { id: 'chap_4', title: '4. Considerações Finais', text: 'Conclui-se que o dever de vigilância das transações atípicas é inerente à atividade financeira.', sources: ['Art. 14 CDC'] }
      ],
      bibliography: [
        { id: 'b1', author: 'DINIZ, Maria Helena', year: '2022', title: 'Curso de Direito Civil Brasileiro' },
        { id: 'b2', author: 'TARTUCE, Flávio', year: '2023', title: 'Manual de Direito Civil: Volume Único' }
      ]
    };
  }

  renderStudio() {
    const container = document.getElementById('academic-research-content-container') || document.getElementById('view-academic-research');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Central de TCC -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #6366f1, #4338ca); color:#fff; font-weight:700;">ETAPA 42</span>
            <span style="font-size:0.75rem; color:#818cf8;"><i class="fa-solid fa-graduation-cap"></i> Central de Trabalhos, TCC & Pesquisa Avançada</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-book-bookmark text-amber"></i> ${this.activeProject.title}
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Ambiente acadêmico rigoroso: matriz de pesquisa, capítulos, auditoria ABNT e simulação de banca examinadora.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-tcc-mock-defense" class="btn-primary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-microphone"></i> Simular Banca (Prof. Marcos)
          </button>
        </div>
      </div>

      <!-- Navegação por Abas -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeTab === 'matrix' ? 'active' : ''}" data-tcc-tab="matrix"><i class="fa-solid fa-compass"></i> Matriz de Pesquisa</button>
        <button class="chapter-btn ${this.activeTab === 'chapters' ? 'active' : ''}" data-tcc-tab="chapters"><i class="fa-solid fa-file-pen"></i> Capítulos & Redação</button>
        <button class="chapter-btn ${this.activeTab === 'sources' ? 'active' : ''}" data-tcc-tab="sources"><i class="fa-solid fa-quote-left"></i> Fontes & Citações</button>
        <button class="chapter-btn ${this.activeTab === 'audit' ? 'active' : ''}" data-tcc-tab="audit"><i class="fa-solid fa-list-check"></i> Auditoria ABNT & Lacunas</button>
        <button class="chapter-btn ${this.activeTab === 'defense' ? 'active' : ''}" data-tcc-tab="defense"><i class="fa-solid fa-users-viewfinder"></i> Preparar Defesa</button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="tcc-tab-content">
        ${this.renderActiveTab()}
      </div>
    `;

    this.attachDomEvents();
  }

  renderActiveTab() {
    if (this.activeTab === 'chapters') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-file-pen text-amber"></i> Estrutura Capitular e Redação</h3>
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${this.activeProject.chapters.map(c => `
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <strong style="font-size:0.95rem; color:var(--text-main);">${c.title}</strong>
                  <span class="badge-official" style="color:#06b6d4; border-color:#06b6d4; font-size:0.75rem;">${c.sources.length} fonte(s)</span>
                </div>
                <textarea rows="3" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:10px; color:#fff; font-size:0.85rem; outline:none; resize:vertical;">${c.text}</textarea>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'audit') {
      const audit = AcademicReferenceAuditService.auditReferences(this.activeProject.chapters, this.activeProject.bibliography);
      const gaps = ResearchGapService.detectGaps(this.activeProject);

      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-list-check text-amber"></i> Relatório de Auditoria ABNT & Coerência</h3>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
              <h4 style="font-size:0.9rem; color:var(--text-main); margin:0 0 8px 0;"><i class="fa-solid fa-book-open"></i> Cruzamento de Citações ABNT</h4>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 8px 0;">Total de citações no texto: <strong>${audit.totalCitationsInText}</strong></p>
              <p style="font-size:0.8rem; color:${audit.orphanCitationsCount === 0 ? '#10b981' : '#ef4444'}; margin:0 0 8px 0;">
                <i class="fa-solid fa-${audit.orphanCitationsCount === 0 ? 'check' : 'triangle-exclamation'}"></i> Citações órfãs (sem bibliografia): <strong>${audit.orphanCitationsCount}</strong>
              </p>
              <p style="font-size:0.8rem; color:${audit.unusedBibliographyCount === 0 ? '#10b981' : '#f59e0b'}; margin:0;">
                <i class="fa-solid fa-${audit.unusedBibliographyCount === 0 ? 'check' : 'circle-info'}"></i> Referências não citadas no texto: <strong>${audit.unusedBibliographyCount}</strong>
              </p>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
              <h4 style="font-size:0.9rem; color:var(--text-main); margin:0 0 8px 0;"><i class="fa-solid fa-diagram-project"></i> Lacunas no Projeto</h4>
              <p style="font-size:0.8rem; color:${gaps.totalGaps === 0 ? '#10b981' : '#ef4444'}; margin:0;">
                <i class="fa-solid fa-${gaps.totalGaps === 0 ? 'check' : 'triangle-exclamation'}"></i> Total de lacunas identificadas: <strong>${gaps.totalGaps}</strong>
              </p>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'defense') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 8px 0;"><i class="fa-solid fa-users-viewfinder text-amber"></i> Simulação de Banca Examinadora</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">Arguição oral interativa com o Professor Marcos baseada estritamente no seu tema, problema e fundamentação.</p>
          
          <div style="background:rgba(255,255,255,0.02); border-left:4px solid var(--accent-amber); border-radius:10px; padding:18px; line-height:1.6; font-size:0.88rem; color:var(--text-main);">
            <p><strong>Pergunta Típica da Banca:</strong> "Candidato(a), qual foi o critério para aplicar a responsabilidade objetiva da Súmula 479 do STJ nas hipóteses de engenharia social, onde há aparente participação involuntária da vítima?"</p>
            <button id="btn-tcc-start-oral-defense" class="btn-primary" style="margin-top:12px; padding:7px 16px; font-size:0.82rem;"><i class="fa-solid fa-microphone"></i> Responder Oralmente (Marcos Avalia)</button>
          </div>
        </div>
      `;
    }

    // Aba Matriz de Pesquisa (Default)
    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
        <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-compass text-amber"></i> Matriz de Coerência Metodológica</h3>
        
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <span class="badge-official" style="color:#a855f7; border-color:#a855f7; font-size:0.7rem;">PROBLEMA DE PESQUISA</span>
            <p style="font-size:0.92rem; color:var(--text-main); margin:8px 0 0 0; font-weight:600;">${this.activeProject.problem}</p>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <span class="badge-official" style="color:#06b6d4; border-color:#06b6d4; font-size:0.7rem;">HIPÓTESE PRINCIPAL</span>
            <p style="font-size:0.88rem; color:var(--text-main); margin:8px 0 0 0;">${this.activeProject.hypothesis}</p>
          </div>

          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:14px;">
            <span class="badge-official" style="color:#10b981; border-color:#10b981; font-size:0.7rem;">OBJETIVO GERAL & ESPECÍFICOS</span>
            <p style="font-size:0.88rem; color:var(--text-main); margin:8px 0 6px 0; font-weight:600;">${this.activeProject.generalObjective}</p>
            <ul style="font-size:0.82rem; color:var(--text-muted); margin:0; padding-left:18px;">
              ${this.activeProject.specificObjectives.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  attachDomEvents() {
    // Troca de Abas
    document.querySelectorAll('[data-tcc-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tccTab;
        this.renderStudio();
      });
    });

    // Simular Defesa Oral
    const triggerDefense = () => {
      if (this.audioEngine) {
        const speech = `Olá, candidato! Bem-vindo à simulação da sua banca de TCC. Analisei o seu projeto sobre a responsabilidade civil das instituições financeiras por fraudes eletrônicas. Gostaria que você explicasse com precisão como você compatibilizou a tese do fortuito interno da Súmula 479 do STJ com os casos em que a vítima fornece espontaneamente a senha sob coação ou induzimento em erro. Pode iniciar sua resposta.`;
        this.audioEngine.speakArticle({
          id: 'tcc_defense_' + Date.now(),
          article_display: 'Banca Examinadora',
          number: 'Prof. Marcos',
          title: this.activeProject.title,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    };

    document.getElementById('btn-tcc-mock-defense')?.addEventListener('click', triggerDefense);
    document.getElementById('btn-tcc-start-oral-defense')?.addEventListener('click', triggerDefense);
  }
}

if (typeof window !== 'undefined') {
  window.AcademicThesisStudioEngine = AcademicThesisStudioEngine;
}

if (typeof module !== 'undefined') {
  module.exports = AcademicThesisStudioEngine;
}
