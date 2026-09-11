/**
 * VadeAudio AI - DoctrineLibraryEngine (Etapa 37)
 * Controlador de Interface da Central de Doutrina & Biblioteca Jurídica Pessoal.
 * Gestão de Obras, Citações ABNT, Comparador de Autores, RAG e Áudio ElevenLabs.
 */

class DoctrineLibraryEngine {
  constructor(storage, searchService, comparisonService, ragService, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.searchService = searchService || new DoctrineSearchService(this.storage);
    this.comparisonService = comparisonService || new DoctrineComparisonService(this.storage);
    this.ragService = ragService || new DoctrineRAGService(this.storage);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeTab = 'works'; // 'works' | 'authors' | 'quotes' | 'compare' | 'ask'
    this.currentQuery = '';
  }

  renderLibraryView() {
    const container = document.getElementById('doctrine-library-content-container') || document.getElementById('view-doctrine-library');
    if (!container) return;

    container.innerHTML = `
      <!-- Header da Biblioteca Jurídica -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #a855f7, #7e22ce); color:#fff; font-weight:700;">ETAPA 37</span>
            <span style="font-size:0.75rem; color:#a855f7;"><i class="fa-solid fa-graduation-cap"></i> Biblioteca Acadêmica Pessoal & ABNT</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-book-bookmark text-amber"></i> Central de Doutrina & Biblioteca Jurídica
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Organize suas obras, fichamentos, citações diretas ABNT e compare posições de autores.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-add-work" class="btn-primary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-plus"></i> Adicionar Obra
          </button>
          <button id="btn-add-quote" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-quote-left"></i> Salvar Citação
          </button>
        </div>
      </div>

      <!-- Barra de Navegação por Abas -->
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:16px;">
        <button class="chapter-btn ${this.activeTab === 'works' ? 'active' : ''}" data-doc-tab="works"><i class="fa-solid fa-book"></i> Minhas Obras</button>
        <button class="chapter-btn ${this.activeTab === 'quotes' ? 'active' : ''}" data-doc-tab="quotes"><i class="fa-solid fa-quote-right"></i> Minhas Citações</button>
        <button class="chapter-btn ${this.activeTab === 'compare' ? 'active' : ''}" data-doc-tab="compare"><i class="fa-solid fa-scale-balanced"></i> Comparar Autores</button>
        <button class="chapter-btn ${this.activeTab === 'ask' ? 'active' : ''}" data-doc-tab="ask"><i class="fa-solid fa-comment-dots"></i> Perguntar à Biblioteca</button>
      </div>

      <!-- Conteúdo Dinâmico -->
      <div id="doc-tab-content">
        ${this.renderActiveTabContent()}
      </div>
    `;

    this.attachDomEvents();
  }

  renderActiveTabContent() {
    if (!this.storage) return '<p>Armazenamento indisponível.</p>';

    if (this.activeTab === 'quotes') {
      const quotes = this.storage.getLibraryQuotes();
      return `
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${quotes.map(q => `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">${q.author}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-file-lines"></i> p. ${q.printedPage || 'n/d'}</span>
              </div>
              <p style="font-size:0.95rem; color:var(--text-main); font-style:italic; line-height:1.5; margin:0 0 10px 0;">"${q.text}"</p>
              <div style="font-size:0.78rem; color:var(--text-muted);">
                <strong>Obra:</strong> ${q.workTitle}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'compare') {
      const comp = this.comparisonService.compareAuthors('Maria Helena Diniz', 'Flávio Tartuce', 'prescrição');
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:12px;"><i class="fa-solid fa-scale-balanced text-amber"></i> Confronto Doutrinário: Diniz × Tartuce</h3>
          ${comp.hasSufficientSources ? `
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:18px; line-height:1.5; color:var(--text-main); font-size:0.9rem;">
              <p style="margin:0 0 10px 0;">${comp.synthesis}</p>
              <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-circle-check"></i> ${comp.comparisonNote}</span>
            </div>
          ` : `
            <p style="color:var(--text-muted); font-size:0.88rem;">${comp.message}</p>
          `}
        </div>
      `;
    }

    if (this.activeTab === 'ask') {
      const rag = this.ragService.askLibrary('prescrição');
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px;">
          <h3 style="font-size:1.1rem; color:var(--text-main); margin-bottom:12px;"><i class="fa-solid fa-comment-dots text-amber"></i> Perguntar à Biblioteca (Modo: Somente Minhas Fontes)</h3>
          <div style="background:rgba(168,85,247,0.06); border:1px solid rgba(168,85,247,0.25); border-radius:12px; padding:18px; font-size:0.92rem; color:var(--text-main); line-height:1.5;">
            <p style="margin:0;">${rag.answer}</p>
          </div>
        </div>
      `;
    }

    // Aba de Obras
    const works = this.storage.getLibraryWorks();
    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
        ${works.map(w => {
          const abntRef = BibliographyService.formatABNT(w);
          const validation = AcademicReferenceValidator.validate(w);
          return `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span class="badge-official" style="color:#a855f7; border-color:#a855f7;">${w.area || 'Direito'}</span>
                  <span class="badge-new" style="background:${validation.statusBadge.color}; color:#000; font-size:0.68rem; font-weight:700;">${validation.statusBadge.label}</span>
                </div>
                <h3 style="font-size:1rem; color:var(--text-main); margin:0 0 6px 0; font-family:var(--font-display);">${w.title}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin:0 0 12px 0;"><strong>Autor:</strong> ${w.author} (${w.year || 's.d.'})</p>
                <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); padding:8px 10px; font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">
                  <strong>ABNT:</strong> ${abntRef}
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:12px; margin-top:8px;">
                <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-book-open"></i> ${w.readingProgress || 0}% lido</span>
                <button class="btn-icon btn-listen-work" data-title="${w.title}" title="Ouvir Resumo com Professor ElevenLabs"><i class="fa-solid fa-volume-high"></i></button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachDomEvents() {
    // Troca de Abas
    document.querySelectorAll('[data-doc-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.docTab;
        this.renderLibraryView();
      });
    });

    // Ouvir com ElevenLabs
    document.querySelectorAll('.btn-listen-work').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.title;
        if (this.audioEngine) {
          const speech = `Estudo de Doutrina da Biblioteca Jurídica: Obra ${title}. Vamos revisar os pontos centrais e conceitos dos capítulos cadastrados.`;
          this.audioEngine.speakArticle({
            id: 'doc_audio_' + Date.now(),
            article_display: title,
            number: 'Doutrina',
            title: 'Biblioteca Jurídica Pessoal',
            content: [{ text: speech, speechText: speech }],
            voice_id: 'xHUwLsLfyqiYOIVTzLRW'
          });
        }
      });
    });

    // Adicionar Obra
    document.getElementById('btn-add-work')?.addEventListener('click', () => {
      const title = prompt('Título da Obra:', 'Curso de Direito Processual Civil');
      if (title) {
        const author = prompt('Nome do Autor:', 'Fredie Didier Jr.');
        const year = prompt('Ano da Edição:', '2023');
        const publisher = prompt('Editora:', 'Juspodivm');
        if (this.storage) {
          this.storage.saveLibraryWork({
            title: title.trim(),
            author: (author || 'Não informado').trim(),
            year: (year || '2023').trim(),
            publisher: (publisher || 'Não informada').trim(),
            city: 'Salvador',
            area: 'Direito Processual Civil'
          });
          window.Toast?.success('Obra cadastrada na Biblioteca Pessoal!');
          this.renderLibraryView();
        }
      }
    });

    // Salvar Citação
    document.getElementById('btn-add-quote')?.addEventListener('click', () => {
      const text = prompt('Trecho Exato da Citação Direta:');
      if (text) {
        const author = prompt('Autor da Citação:', 'Maria Helena Diniz');
        const page = prompt('Número da Página Impressa:', '115');
        if (this.storage) {
          this.storage.saveLibraryQuote({
            text: text.trim(),
            author: (author || 'Autor').trim(),
            printedPage: parseInt(page) || null,
            workTitle: 'Biblioteca Jurídica Pessoal',
            isDirectQuote: true,
            isAiParaphrase: false
          });
          window.Toast?.success('Citação direta salva com sucesso!');
          this.renderLibraryView();
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.DoctrineLibraryEngine = DoctrineLibraryEngine;
}

if (typeof module !== 'undefined') {
  module.exports = DoctrineLibraryEngine;
}
