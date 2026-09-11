/**
 * VadeAudio AI - CommentedLawEngine (Etapa 40)
 * Controlador de Interface da Central de Leis Comentadas e Estudo Artigo por Artigo.
 * Dossiê Completo: Texto Oficial Inalterado, 5 Níveis de Explicação, Precedentes, Doutrina e Áudio ElevenLabs.
 */

class CommentedLawEngine {
  constructor(storage, studyService, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.studyService = studyService || (typeof LegalArticleStudyService !== 'undefined' ? new LegalArticleStudyService(this.storage) : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeArticle = {
      id: 'cpc_art_300',
      lawId: 'cpc',
      number: '300',
      article_display: 'Art. 300',
      title: 'Código de Processo Civil — Tutela de Urgência',
      text: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.\n\n§ 1º Para a concessão da tutela de urgência, o juiz pode, conforme o caso, exigir caução real ou fidejussória idônea para ressarcir os danos que a outra parte possa vir a sofrer, podendo a caução ser dispensada se a parte economicamente hipossuficiente não puder oferecê-la.\n\n§ 2º A tutela de urgência pode ser concedida liminarmente ou após justificação prévia.\n\n§ 3º A tutela de urgência de natureza antecipada não será concedida quando houver perigo de irreversibilidade dos efeitos da decisão.'
    };

    this.activeTab = 'overview'; // 'overview' | 'explanations' | 'jurisprudence' | 'doctrine' | 'notes' | 'diff'
    this.activeLevel = 'faculdade'; // 'simples' | 'faculdade' | 'oab' | 'concurso' | 'avancado'
  }

  renderStation(article = null) {
    if (article) this.activeArticle = article;
    const container = document.getElementById('commented-laws-content-container') || document.getElementById('view-commented-laws');
    if (!container) return;

    const stationData = this.studyService ? this.studyService.buildStudyStation(this.activeArticle) : null;
    if (!stationData) return;

    container.innerHTML = `
      <!-- Header da Central de Leis Comentadas -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:700;">ETAPA 40</span>
            <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-scale-balanced"></i> Estudo Artigo por Artigo & Leis Comentadas</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-book-open-reader text-amber"></i> ${this.activeArticle.article_display || 'Artigo'} — ${this.activeArticle.title || 'Vade Mecum'}
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Dossiê completo: texto oficial inalterado, explicações multinível, precedentes do STF/STJ, doutrina pessoal e active recall.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-article-listen-official" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-volume-high text-amber"></i> Ouvir Texto Oficial
          </button>
          <button id="btn-article-listen-tutor" class="btn-primary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-microphone"></i> Professor Explica (Marcos)
          </button>
        </div>
      </div>

      <!-- Navegação por Abas -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-art-tab="overview"><i class="fa-solid fa-file-lines"></i> Visão Geral & Texto Oficial</button>
        <button class="chapter-btn ${this.activeTab === 'explanations' ? 'active' : ''}" data-art-tab="explanations"><i class="fa-solid fa-graduation-cap"></i> Explicações por Nível</button>
        <button class="chapter-btn ${this.activeTab === 'jurisprudence' ? 'active' : ''}" data-art-tab="jurisprudence"><i class="fa-solid fa-gavel"></i> Jurisprudência & Súmulas</button>
        <button class="chapter-btn ${this.activeTab === 'doctrine' ? 'active' : ''}" data-art-tab="doctrine"><i class="fa-solid fa-book-bookmark"></i> Minha Doutrina</button>
        <button class="chapter-btn ${this.activeTab === 'notes' ? 'active' : ''}" data-art-tab="notes"><i class="fa-solid fa-note-sticky"></i> Minhas Anotações</button>
        <button class="chapter-btn ${this.activeTab === 'diff' ? 'active' : ''}" data-art-tab="diff"><i class="fa-solid fa-code-compare"></i> Histórico & O Que Mudou</button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="art-tab-content">
        ${this.renderActiveTab(stationData)}
      </div>
    `;

    this.attachDomEvents(stationData);
  }

  renderActiveTab(stationData) {
    if (this.activeTab === 'explanations') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <span class="badge-new" style="background:#a855f7; color:#fff; font-size:0.7rem;">🤖 EXPLICAÇÃO GERADA POR IA</span>
              <h3 style="font-size:1.1rem; color:var(--text-main); margin:4px 0 0 0;">Análise Didática do Dispositivo</h3>
            </div>
            <!-- Seletor de Níveis -->
            <div style="display:flex; gap:6px;">
              ${['simples', 'faculdade', 'oab', 'concurso', 'avancado'].map(lvl => `
                <button class="btn-secondary ${this.activeLevel === lvl ? 'active' : ''}" data-art-level="${lvl}" style="padding:4px 10px; font-size:0.75rem; text-transform:uppercase; ${this.activeLevel === lvl ? 'background:var(--accent-amber); color:#000; font-weight:700;' : ''}">${lvl}</button>
              `).join('')}
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.02); border-left:4px solid var(--accent-amber); border-radius:10px; padding:18px; line-height:1.6; color:var(--text-main); font-size:0.92rem;">
            ${stationData.explanations[this.activeLevel] || stationData.explanations.faculdade}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'jurisprudence') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-gavel text-amber"></i> Jurisprudência e Súmulas Vinculadas</h3>
          ${stationData.linkedJurisprudence.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${stationData.linkedJurisprudence.map(j => `
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;">${j.court} — ${j.caseNumber}</span>
                    <span style="font-size:0.75rem; color:#10b981;">${j.status.toUpperCase()}</span>
                  </div>
                  <p style="font-size:0.88rem; color:var(--text-main); margin:0; line-height:1.4;">${j.thesis}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color:var(--text-muted); font-size:0.85rem;">Nenhum precedente específico cadastrado para este artigo na base oficial.</p>
          `}
        </div>
      `;
    }

    if (this.activeTab === 'doctrine') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-book-bookmark text-amber"></i> Citações da Minha Biblioteca Pessoal</h3>
          ${stationData.linkedQuotes.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${stationData.linkedQuotes.map(q => `
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span class="badge-official" style="color:#a855f7; border-color:#a855f7;">${q.author}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">p. ${q.printedPage || 'n/d'}</span>
                  </div>
                  <p style="font-size:0.88rem; color:var(--text-main); font-style:italic; margin:0 0 6px 0;">"${q.text}"</p>
                  <span style="font-size:0.75rem; color:var(--text-muted);">Obra: ${q.workTitle}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color:var(--text-muted); font-size:0.85rem;">Nenhum trecho doutrinário salvo na sua biblioteca menciona este dispositivo diretamente.</p>
          `}
        </div>
      `;
    }

    if (this.activeTab === 'notes') {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 16px 0;"><i class="fa-solid fa-note-sticky text-amber"></i> Minhas Anotações Privadas</h3>
          
          <div style="margin-bottom:16px;">
            <textarea id="textarea-new-art-note" rows="3" placeholder="Adicionar anotação pessoal ou reflexão para este artigo..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:12px; color:#fff; font-size:0.85rem; outline:none; resize:vertical;"></textarea>
            <button id="btn-save-art-note" class="btn-primary" style="margin-top:8px; padding:6px 14px; font-size:0.8rem;"><i class="fa-solid fa-floppy-disk"></i> Salvar Anotação</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${stationData.personalNotes.map(n => `
              <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); padding:10px 14px; border-radius:6px; font-size:0.85rem; color:var(--text-main);">
                ${n.text}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'diff') {
      const diff = LegalArticleDiffService.computeDiff(
        'A tutela de urgência será concedida mediante prova inequívoca e verossimilhança da alegação.',
        stationData.officialText
      );
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin:0 0 8px 0;"><i class="fa-solid fa-code-compare text-amber"></i> Histórico Legislativo & O Que Mudou</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:16px;">Comparação determinística entre o regime do CPC/1973 (Art. 273) e o CPC/2015 (Art. 300).</p>
          
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:18px; line-height:1.6; font-size:0.88rem; color:var(--text-main);">
            <p><strong>Diferenças Detectadas:</strong> ${diff.summary}</p>
            <p style="font-size:0.8rem; color:#10b981; margin:6px 0 0 0;"><i class="fa-solid fa-check-circle"></i> O CPC/2015 unificou os pressupostos da tutela cautelar e antecipada sob a fórmula binária: "probabilidade do direito" e "perigo de dano".</p>
          </div>
        </div>
      `;
    }

    // Aba Visão Geral & Texto Oficial
    return `
      <div class="commented-laws-split-grid" style="display:grid; grid-template-columns: minmax(0, 1fr) 340px; gap:20px;">
        <!-- Card do Texto Oficial -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-weight:700; font-size:0.75rem;">
              ⚖️ TEXTO OFICIAL
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Fonte Oficial Verificada</span>
          </div>

          <div style="font-size:1.05rem; line-height:1.7; color:var(--text-main); font-family:var(--font-sans); white-space:pre-line;">
            ${stationData.officialText}
          </div>
        </div>

        <!-- Painel Lateral: Conexões e Relações -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
            <h4 style="font-size:0.88rem; color:var(--text-main); margin:0 0 10px 0;"><i class="fa-solid fa-link text-amber"></i> Artigos Relacionados</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${stationData.relatedArticles.map(rel => `
                <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:6px; padding:8px 10px; font-size:0.78rem; color:var(--text-main);">
                  ${rel.label}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachDomEvents(stationData) {
    // Troca de Abas
    document.querySelectorAll('[data-art-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.artTab;
        this.renderStation();
      });
    });

    // Troca de Nível de Explicação
    document.querySelectorAll('[data-art-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeLevel = btn.dataset.artLevel;
        this.renderStation();
      });
    });

    // Salvar Anotação Privada
    document.getElementById('btn-save-art-note')?.addEventListener('click', () => {
      const text = document.getElementById('textarea-new-art-note')?.value || '';
      if (!text.trim()) return;

      if (this.storage) {
        this.storage.saveArticleAnnotation(this.activeArticle.id || 'cpc_art_300', {
          text: text.trim()
        });
        window.Toast?.success('Anotação privada salva!');
        this.renderStation();
      }
    });

    // Ouvir Texto Oficial
    document.getElementById('btn-article-listen-official')?.addEventListener('click', () => {
      if (this.audioEngine) {
        this.audioEngine.speakArticle({
          id: 'official_' + this.activeArticle.id,
          article_display: this.activeArticle.article_display,
          number: this.activeArticle.number,
          title: this.activeArticle.title,
          content: [{ text: stationData.officialText, speechText: stationData.officialText }]
        });
      }
    });

    // Professor Marcos Explica
    document.getElementById('btn-article-listen-tutor')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = `Olá! Vamos estudar o ${this.activeArticle.article_display}. Este dispositivo consagra os dois requisitos fundamentais da tutela provisória de urgência: a probabilidade do direito, também conhecida como fumus boni iuris, e o perigo de dano ou risco ao resultado útil do processo, o periculum in mora. Lembre-se que o parágrafo terceiro proíbe a concessão antecipada quando houver perigo de irreversibilidade.`;
        this.audioEngine.speakArticle({
          id: 'tutor_' + this.activeArticle.id,
          article_display: 'Explicação Didática',
          number: 'Professor Marcos',
          title: this.activeArticle.title,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.CommentedLawEngine = CommentedLawEngine;
}

if (typeof module !== 'undefined') {
  module.exports = CommentedLawEngine;
}
