/**
 * VadeAudio AI - JurisprudenceHubEngine (Etapa 36)
 * Controlador de Interface da Central de Jurisprudência Inteligente.
 * Busca Híbrida, RAG Grounded, Linha do Tempo, Comparador e Áudio ElevenLabs.
 */

class JurisprudenceHubEngine {
  constructor(database, searchEngine, ragService, storage, audioEngine) {
    this.database = database || (typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : []);
    this.searchEngine = searchEngine || new JurisprudenceSearchEngine(this.database);
    this.ragService = ragService || new JurisprudenceRAGService(this.searchEngine);
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeTab = 'search'; // 'search' | 'stf' | 'stj' | 'sumulas' | 'compare' | 'timeline' | 'saved'
    this.currentQuery = '';
    this.selectedCourt = null;
    this.selectedItemForDetail = null;
  }

  renderHub() {
    const container = document.getElementById('jurisprudence-content-container') || document.getElementById('view-jurisprudence');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Central de Jurisprudência -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #38bdf8, #0284c7); color:#000; font-weight:700;">ETAPA 36</span>
            <span style="font-size:0.75rem; color:#38bdf8;"><i class="fa-solid fa-scale-balanced"></i> Base Oficial STF & STJ</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-gavel text-amber"></i> Central de Jurisprudência Inteligente
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Pesquise precedentes qualificados, súmulas vinculantes, teses repetitivas e perguntas em linguagem natural.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-jp-listen-topic" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-volume-high text-amber"></i> Áudio-Comentário
          </button>
        </div>
      </div>

      <!-- Barra de Navegação por Abas -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeTab === 'search' ? 'active' : ''}" data-jp-tab="search"><i class="fa-solid fa-magnifying-glass"></i> Pesquisar & RAG</button>
        <button class="chapter-btn ${this.activeTab === 'stf' ? 'active' : ''}" data-jp-tab="stf"><i class="fa-solid fa-building-columns"></i> STF (Repercussão Geral)</button>
        <button class="chapter-btn ${this.activeTab === 'stj' ? 'active' : ''}" data-jp-tab="stj"><i class="fa-solid fa-scale-unbalanced"></i> STJ (Repetitivos)</button>
        <button class="chapter-btn ${this.activeTab === 'sumulas' ? 'active' : ''}" data-jp-tab="sumulas"><i class="fa-solid fa-bookmark"></i> Súmulas</button>
        <button class="chapter-btn ${this.activeTab === 'compare' ? 'active' : ''}" data-jp-tab="compare"><i class="fa-solid fa-code-compare"></i> Comparador STF x STJ</button>
        <button class="chapter-btn ${this.activeTab === 'timeline' ? 'active' : ''}" data-jp-tab="timeline"><i class="fa-solid fa-timeline"></i> Linha do Tempo</button>
        <button class="chapter-btn ${this.activeTab === 'saved' ? 'active' : ''}" data-jp-tab="saved"><i class="fa-solid fa-star text-amber"></i> Julgados Salvos</button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="jp-tab-content">
        ${this.renderActiveTabContent()}
      </div>
    `;

    this.attachDomEvents();
  }

  renderActiveTabContent() {
    if (this.activeTab === 'compare') {
      const itemA = this.database.find(j => j.id === 'stf-tema-1033');
      const itemB = this.database.find(j => j.id === 'stj-tema-1010');
      const comparison = JurisprudenceComparator.compare(itemA, itemB);

      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:16px;"><i class="fa-solid fa-code-compare text-amber"></i> ${comparison ? comparison.title : 'Comparador'}</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
              <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;">${itemA.court} • ${itemA.number}</span>
              <h4 style="font-size:0.95rem; color:var(--text-main); margin:10px 0 6px 0;">${itemA.title}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${itemA.official_thesis}</p>
            </div>
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
              <span class="badge-official" style="color:#10b981; border-color:#10b981;">${itemB.court} • ${itemB.number}</span>
              <h4 style="font-size:0.95rem; color:var(--text-main); margin:10px 0 6px 0;">${itemB.title}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${itemB.official_thesis}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'timeline') {
      const timeline = JurisprudenceTimelineBuilder.buildTimeline(this.database);
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:16px;"><i class="fa-solid fa-timeline text-amber"></i> Linha do Tempo da Jurisprudência Superior</h3>
          <div style="display:flex; flex-direction:column; gap:16px; border-left:2px solid var(--accent-amber); padding-left:20px; margin-left:10px;">
            ${timeline.map(t => `
              <div style="position:relative;">
                <div style="position:absolute; left:-27px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--accent-amber);"></div>
                <span style="font-size:0.75rem; color:var(--accent-amber); font-weight:700;">${t.year} (${t.court})</span>
                <h4 style="font-size:0.95rem; color:var(--text-main); margin:2px 0 4px 0;">${t.title}</h4>
                <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.4; margin:0;">${t.thesis}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Aba de Busca / Listagem
    let filter = {};
    if (this.activeTab === 'stf') filter.court = 'STF';
    if (this.activeTab === 'stj') filter.court = 'STJ';
    if (this.activeTab === 'sumulas') filter.type = 'súmula';
    if (this.activeTab === 'saved') {
      const saved = this.storage ? this.storage.getSavedJurisprudence() : [];
      return this.renderJurisprudenceList(saved);
    }

    const results = this.searchEngine.search(this.currentQuery, filter);
    const ragAnswer = this.currentQuery.trim() ? this.ragService.answerQuestion(this.currentQuery) : null;

    return `
      <!-- Campo de Busca Inteligente -->
      <div style="margin-bottom:20px;">
        <div style="display:flex; gap:10px;">
          <input type="text" id="input-jp-search" placeholder="Pesquise por termo, pergunta (ex: 'banco responde por fraude?'), súmula ou Art. 300 CPC..." value="${this.currentQuery}" style="flex:1; background:var(--bg-card); border:1px solid var(--border-light); border-radius:10px; padding:12px 16px; color:var(--text-main); font-size:0.9rem; outline:none;">
          <button id="btn-submit-jp-search" class="btn-primary" style="padding:10px 20px;"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
        </div>
      </div>

      <!-- Resposta RAG Grounded (Se houver busca por pergunta) -->
      ${ragAnswer && ragAnswer.hasSufficientSources ? `
        <div style="background:rgba(56,189,248,0.06); border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:18px 20px; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span class="badge-new" style="background:#38bdf8; color:#000; font-size:0.68rem; font-weight:700;">RAG JURISPRUDENCIAL</span>
            <span style="font-size:0.75rem; color:#38bdf8;"><i class="fa-solid fa-check-double"></i> Síntese Ancorada em Fontes Oficiais</span>
          </div>
          <p style="font-size:0.92rem; color:var(--text-main); line-height:1.5; margin:0;">${ragAnswer.answer}</p>
        </div>
      ` : ''}

      <!-- Lista de Resultados -->
      ${this.renderJurisprudenceList(results)}
    `;
  }

  renderJurisprudenceList(items) {
    if (!items || items.length === 0) {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:40px; text-align:center; color:var(--text-muted);">
          <i class="fa-solid fa-scale-unbalanced" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-muted); opacity:0.5;"></i>
          <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:4px;">Nenhum julgado encontrado</h3>
          <p style="font-size:0.85rem;">Tente pesquisar por palavras-chave mais amplas ou consulte os filtros por tribunal.</p>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${items.map(item => {
          const statusBadge = JurisprudenceStatusService.getStatusBadge(item.status);
          return `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; transition:transform 0.15s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                <div style="display:flex; gap:6px; align-items:center;">
                  <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">${item.court}</span>
                  <span class="badge-official" style="color:#94a3b8; border-color:#94a3b8;">${item.type.toUpperCase()}</span>
                  <span class="badge-new" style="background:${statusBadge.color}; color:#000; font-size:0.68rem; font-weight:700;"><i class="fa-solid ${statusBadge.icon}"></i> ${statusBadge.label}</span>
                </div>
                <div style="display:flex; gap:6px;">
                  <button class="btn-icon btn-save-jp" data-id="${item.id}" title="Salvar Julgado"><i class="fa-regular fa-star"></i></button>
                  <button class="btn-icon btn-listen-jp" data-id="${item.id}" title="Ouvir Áudio-Comentário ElevenLabs"><i class="fa-solid fa-volume-high"></i></button>
                  <button class="btn-icon btn-card-jp" data-id="${item.id}" title="Gerar Flashcard"><i class="fa-solid fa-layer-group"></i></button>
                </div>
              </div>

              <h3 style="font-size:1.05rem; color:var(--text-main); margin:0 0 8px 0; font-family:var(--font-display);">${item.title}</h3>
              <p style="font-size:0.86rem; color:var(--text-muted); line-height:1.5; margin:0 0 12px 0;"><strong>Tese Oficial:</strong> "${item.official_thesis}"</p>

              ${item.related_articles_display && item.related_articles_display.length > 0 ? `
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:8px;">
                  <span style="font-size:0.72rem; color:var(--text-muted);"><i class="fa-solid fa-book-bookmark"></i> Artigos Vinculados:</span>
                  ${item.related_articles_display.map(a => `<span style="font-size:0.72rem; padding:2px 8px; background:rgba(255,255,255,0.05); border-radius:4px; color:var(--accent-amber);">${a}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachDomEvents() {
    // Troca de Abas
    document.querySelectorAll('[data-jp-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.jpTab;
        this.renderHub();
      });
    });

    // Busca
    const submitSearch = () => {
      const val = document.getElementById('input-jp-search')?.value;
      this.currentQuery = val || '';
      this.renderHub();
    };

    document.getElementById('btn-submit-jp-search')?.addEventListener('click', submitSearch);
    document.getElementById('input-jp-search')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitSearch();
    });

    // Áudio ElevenLabs de um Julgado
    document.querySelectorAll('.btn-listen-jp').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = this.database.find(j => j.id === btn.dataset.id);
        if (item && this.audioEngine) {
          const speech = `Julgado do ${item.court}. ${item.title}. Tese Oficial: ${item.official_thesis}`;
          this.audioEngine.speakArticle({
            id: 'jp_audio_' + item.id,
            article_display: item.title,
            number: item.court,
            title: item.topic || 'Jurisprudência',
            content: [{ text: speech, speechText: speech }],
            voice_id: 'xHUwLsLfyqiYOIVTzLRW'
          });
        }
      });
    });

    // Salvar Julgado
    document.querySelectorAll('.btn-save-jp').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = this.database.find(j => j.id === btn.dataset.id);
        if (item && this.storage) {
          const res = this.storage.toggleSaveJurisprudence(item);
          window.Toast?.success(res.saved ? 'Julgado salvo com sucesso!' : 'Julgado removido dos salvos.');
        }
      });
    });

    // Gerar Flashcard
    document.querySelectorAll('.btn-card-jp').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = this.database.find(j => j.id === btn.dataset.id);
        if (item && this.storage) {
          this.storage.saveSmartFlashcard({
            question: `Qual é a tese oficial fixada pelo ${item.court} na ${item.title}?`,
            answer: item.official_thesis,
            type: 'qa',
            subject: item.subject || 'Jurisprudência',
            legalReference: item.source_id || item.title
          });
          window.Toast?.success('Flashcard gerado e adicionado à sua fila de repetição espaçada!');
        }
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.JurisprudenceHubEngine = JurisprudenceHubEngine;
}

if (typeof module !== 'undefined') {
  module.exports = JurisprudenceHubEngine;
}
