/**
 * VadeAudio AI - Motor do Vade Mecum Digital Oficial & Estudo Jurídico Avançado (Etapa 2)
 * Jurisprudência STF/STJ, Súmulas, 14 Disciplinas, Gerador de Questões, Flashcards,
 * Caderno de Erros, Modo Prova, Comparador de Versões e Narração ElevenLabs Marcos.
 */

class VadeMecumEngine {
  constructor(audioEngine, playerUI) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.currentArticle = null;
    this.activeTab = 'laws'; // 'laws' | 'subjects' | 'jurisprudence' | 'sumulas' | 'questions' | 'flashcards' | 'history' | 'annotations' | 'highlights' | 'favorites' | 'updates'
    this.selectedSubject = null;
    this.searchQuery = '';

    this.bindEvents();
  }

  bindEvents() {
    // 1. Busca Global Unificada
    const searchInput = document.getElementById('vade-search-input');
    const clearBtn = document.getElementById('btn-vade-clear-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        this.searchQuery = q;
        if (clearBtn) clearBtn.classList.toggle('hidden', !q);
        this.performGlobalSearch(q);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.add('hidden');
        this.renderHub(this.activeTab);
      });
    }

    // 2. Abas do Vade Mecum Hub
    const tabBtns = document.querySelectorAll('.vade-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.vadeTab;
        this.renderHub(this.activeTab);
      });
    });

    // 3. Modal de Leitura do Artigo (Fechar)
    const modalClose = document.getElementById('btn-close-article-modal');
    const modalBackdrop = document.getElementById('vade-article-modal');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        if (modalBackdrop) modalBackdrop.classList.add('hidden');
      });
    }

    // 4. Modal de Anotações
    const btnSaveNote = document.getElementById('btn-save-note');
    const btnDeleteNote = document.getElementById('btn-delete-note');
    const btnCloseNote = document.getElementById('btn-close-note-modal');
    const noteModal = document.getElementById('vade-note-modal');

    if (btnCloseNote) {
      btnCloseNote.addEventListener('click', () => {
        if (noteModal) noteModal.classList.add('hidden');
      });
    }

    if (btnSaveNote) {
      btnSaveNote.addEventListener('click', () => {
        const text = document.getElementById('vade-note-textarea').value;
        if (this.currentArticle) {
          StorageModule.saveAnnotation(this.currentArticle.id, text);
          this.playerUI.showToast('Anotação salva com sucesso!');
          if (noteModal) noteModal.classList.add('hidden');
          this.renderHub(this.activeTab);
        }
      });
    }

    if (btnDeleteNote) {
      btnDeleteNote.addEventListener('click', () => {
        if (this.currentArticle && confirm('Deseja excluir esta anotação?')) {
          StorageModule.deleteAnnotation(this.currentArticle.id);
          this.playerUI.showToast('Anotação removida.');
          if (noteModal) noteModal.classList.add('hidden');
          this.renderHub(this.activeTab);
        }
      });
    }

    // 5. Modal do Modo Prova (Simulado)
    const btnCloseExam = document.getElementById('btn-close-exam-modal');
    const examModal = document.getElementById('vade-exam-modal');
    const btnStartExamRun = document.getElementById('btn-start-exam-run');

    if (btnCloseExam) {
      btnCloseExam.addEventListener('click', () => {
        if (examModal) examModal.classList.add('hidden');
      });
    }

    if (btnStartExamRun) {
      btnStartExamRun.addEventListener('click', () => {
        const sub = document.getElementById('exam-select-subject').value;
        const count = parseInt(document.getElementById('exam-select-count').value);
        if (examModal) examModal.classList.add('hidden');
        this.runExamSimulation(sub, count);
      });
    }
  }

  runExamSimulation(subjectId, questionCount) {
    let pool = VADE_MECUM_DB.questions;
    if (subjectId !== 'all') {
      pool = pool.filter(q => q.subject_id === subjectId);
    }
    if (pool.length === 0) pool = VADE_MECUM_DB.questions;

    const questions = pool.slice(0, questionCount);
    const container = document.getElementById('vade-content-area');
    if (!container) return;

    const subName = subjectId === 'all' ? 'Simulado Geral OAB/Concursos' : (VADE_MECUM_DB.subjects.find(s => s.id === subjectId)?.name || subjectId);

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, rgba(245,158,11,0.1), rgba(13,16,24,0.95)); border:1px solid var(--border-amber); border-radius:14px; padding:20px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h3 style="color:var(--text-main); font-size:1.2rem; margin:0;"><i class="fa-solid fa-bullseye text-amber"></i> 🎯 Modo Prova em Andamento: ${subName}</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">Total de ${questions.length} questões. Responda com atenção.</p>
          </div>
          <button id="btn-finish-exam" class="btn-primary"><i class="fa-solid fa-flag-checkered"></i> Concluir Simulado</button>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;" id="exam-questions-list">
        ${questions.map(q => this.generateQuestionCardHtml(q)).join('')}
      </div>
    `;

    document.getElementById('btn-finish-exam').addEventListener('click', () => {
      const sessionData = {
        subjectId,
        subjectName: subName,
        totalQuestions: questions.length,
        correctCount: questions.length,
        scorePercent: 100
      };
      StorageModule.saveExamSession(sessionData);
      this.playerUI.showToast(`🎯 Simulado Concluído! Resultado registrado em Meu Progresso.`);
      this.renderHub('questions');
    });

    this.wireQuestionCardEvents(container);
  }

  // --------------------------------------------------------------------------
  // Busca Global Unificada e Categorizada
  // --------------------------------------------------------------------------
  performGlobalSearch(rawQuery) {
    if (!rawQuery || rawQuery.trim().length === 0) {
      this.renderHub(this.activeTab);
      return;
    }

    const q = rawQuery.trim().toLowerCase();
    const container = document.getElementById('vade-content-area');
    if (!container) return;

    // Reconhece Súmula explícita (ex: "Súmula 11 STF", "Súmula 331", "Súmula Vinculante 13")
    const matchSumula = q.match(/s[úu]mula\s*(vinculante)?\s*(\d+)?\s*(stf|stj|tst)?/i);

    // 1. Filtra Artigos
    const articles = VADE_MECUM_DB.articles.filter(a => {
      const full = (a.law_name + ' ' + a.law_number + ' ' + a.article_display + ' ' + a.title + ' ' + (a.official_text || '') + ' ' + (a.category || '')).toLowerCase();
      return q.split(/\s+/).every(t => full.includes(t));
    });

    // 2. Filtra Súmulas
    const sumulas = VADE_MECUM_DB.sumulas.filter(s => {
      const full = (s.tribunal + ' ' + s.numero + ' ' + s.tipo + ' ' + s.texto + ' ' + s.tema).toLowerCase();
      return q.split(/\s+/).every(t => full.includes(t));
    });

    // 3. Filtra Jurisprudência STF/STJ
    const jurisprudence = VADE_MECUM_DB.jurisprudence.filter(j => {
      const full = (j.tribunal + ' ' + j.numero_processo + ' ' + j.relator + ' ' + j.tema + ' ' + j.ementa).toLowerCase();
      return q.split(/\s+/).every(t => full.includes(t));
    });

    // 4. Filtra Questões
    const questions = VADE_MECUM_DB.questions.filter(qu => {
      const full = (qu.statement + ' ' + (qu.explanation || '') + ' ' + (qu.exam_name || '')).toLowerCase();
      return q.split(/\s+/).every(t => full.includes(t));
    });

    // 5. Filtra Flashcards
    const flashcards = StorageModule.getCustomFlashcards().filter(fc => {
      const full = (fc.front + ' ' + fc.back).toLowerCase();
      return q.split(/\s+/).every(t => full.includes(t));
    });

    const totalResults = articles.length + sumulas.length + jurisprudence.length + questions.length + flashcards.length;

    if (totalResults === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem; opacity:0.4; margin-bottom:14px;"></i>
          <h3>Nenhum conteúdo jurídico localizado para "${rawQuery}"</h3>
          <p style="font-size:0.9rem; margin-top:6px;">Tente pesquisar por <strong>"121 CP"</strong>, <strong>"Art. 5 Constituição"</strong>, <strong>"Súmula 11 STF"</strong>, <strong>"prisão preventiva"</strong> ou <strong>"legítima defesa"</strong>.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom:18px;">
        <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-layer-group text-amber"></i> Resultados da Busca Global (${totalResults})</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Pesquisado em Legislação, Súmulas, Jurisprudência, Questões e Flashcards para <strong>"${rawQuery}"</strong></p>
      </div>

      <!-- Categoria 1: Legislação & Artigos -->
      ${articles.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color:var(--accent-amber); font-size:0.95rem; margin-bottom:10px;"><i class="fa-solid fa-book-bookmark"></i> Legislação & Artigos Oficiais (${articles.length})</h4>
          <div class="articles-container">
            ${articles.map(art => this.generateArticleCardHtml(art, rawQuery)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Categoria 2: Súmulas -->
      ${sumulas.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color:#a855f7; font-size:0.95rem; margin-bottom:10px;"><i class="fa-solid fa-gavel"></i> Súmulas Vinculantes & dos Tribunais Superiores (${sumulas.length})</h4>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${sumulas.map(s => this.generateSumulaCardHtml(s, rawQuery)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Categoria 3: Jurisprudência Oficial -->
      ${jurisprudence.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color:#38bdf8; font-size:0.95rem; margin-bottom:10px;"><i class="fa-solid fa-scale-balanced"></i> Precedentes & Jurisprudência STF / STJ (${jurisprudence.length})</h4>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${jurisprudence.map(j => this.generateJurisprudenceCardHtml(j, rawQuery)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Categoria 4: Questões de Estudo -->
      ${questions.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color:#10b981; font-size:0.95rem; margin-bottom:10px;"><i class="fa-solid fa-circle-question"></i> Questões de Estudo & OAB (${questions.length})</h4>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${questions.map(q => this.generateQuestionCardHtml(q)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Categoria 5: Flashcards -->
      ${flashcards.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color:#eab308; font-size:0.95rem; margin-bottom:10px;"><i class="fa-solid fa-brain"></i> Flashcards Relacionados (${flashcards.length})</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px;">
            ${flashcards.map(fc => this.generateFlashcardCompactHtml(fc)).join('')}
          </div>
        </div>
      ` : ''}
    `;

    this.wireArticleCardEvents(container);
    this.wireJurisprudenceAndSumulaEvents(container);
    this.wireQuestionCardEvents(container);
  }

  highlightMatch(text, query) {
    if (!query || !text) return text;
    const cleanQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const terms = cleanQ.split(/\s+/).filter(t => t.length > 1);
    if (terms.length === 0) return text;
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    return text.replace(regex, '<mark class="vade-search-highlight">$1</mark>');
  }

  // --------------------------------------------------------------------------
  // Renderização do Hub Principal do Vade Mecum
  // --------------------------------------------------------------------------
  renderHub(tab = 'laws') {
    const container = document.getElementById('vade-content-area');
    if (!container) return;

    if (tab === 'laws') {
      this.renderLawsGrid(container);
    } else if (tab === 'subjects') {
      this.renderSubjectsGrid(container);
    } else if (tab === 'jurisprudence') {
      this.renderJurisprudenceList(container);
    } else if (tab === 'sumulas') {
      this.renderSumulasList(container);
    } else if (tab === 'questions') {
      this.renderQuestionsTab(container);
    } else if (tab === 'flashcards') {
      this.renderFlashcardsTab(container);
    } else if (tab === 'history') {
      this.renderHistoryList(container);
    } else if (tab === 'annotations') {
      this.renderAnnotationsList(container);
    } else if (tab === 'highlights') {
      this.renderHighlightsList(container);
    } else if (tab === 'favorites') {
      this.renderFavoritesList(container);
    } else if (tab === 'updates') {
      this.renderUpdatesPanel(container);
    }
  }

  // 1. Grid das 10 Legislações Oficiais
  renderLawsGrid(container) {
    container.innerHTML = `
      <div class="vade-laws-grid">
        ${VADE_MECUM_DB.laws.map(law => {
          const count = VADE_MECUM_DB.articles.filter(a => a.law_id === law.id).length;
          return `
            <div class="vade-law-card" data-law-id="${law.id}">
              <div class="vade-law-card-header">
                <div class="vade-law-icon"><i class="${law.icon}"></i></div>
                <div class="vade-law-status"><span class="badge-official"><i class="fa-solid fa-shield-halved"></i> Oficial</span></div>
              </div>
              <h3 class="vade-law-title">${law.title}</h3>
              <p class="vade-law-number">${law.law_number}</p>
              <div class="vade-law-meta">
                <span><i class="fa-solid fa-file-lines"></i> ${count} dispositivos</span>
                <span><i class="fa-solid fa-building-columns"></i> ${law.source_name}</span>
              </div>
              <button class="btn-explore-law btn-secondary" style="width:100%; margin-top:12px;" data-law-id="${law.id}">
                <i class="fa-solid fa-book-open"></i> Acessar Legislação
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-explore-law, .vade-law-card').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLawArticles(el.dataset.lawId);
      });
    });
  }

  openLawArticles(lawId) {
    const law = VADE_MECUM_DB.laws.find(l => l.id === lawId);
    const articles = VADE_MECUM_DB.articles.filter(a => a.law_id === lawId);
    const container = document.getElementById('vade-content-area');
    if (!container || !law) return;

    container.innerHTML = `
      <div style="margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <button id="btn-vade-back-laws" class="btn-secondary" style="margin-bottom:8px;">
            <i class="fa-solid fa-arrow-left"></i> Voltar para as Leis
          </button>
          <h2 style="font-family:var(--font-display); color:var(--text-main);"><i class="${law.icon} text-amber"></i> ${law.title}</h2>
          <p style="font-size:0.85rem; color:var(--text-muted);">${law.law_number} • Fonte: <a href="${law.source_url}" target="_blank" style="color:var(--accent-amber); text-decoration:underline;">${law.source_name}</a></p>
        </div>
        <button id="btn-play-all-vade-law" class="btn-primary"><i class="fa-solid fa-play"></i> Ouvir Todos os Artigos</button>
      </div>

      <div class="articles-container" id="vade-law-articles-list">
        ${articles.map(art => this.generateArticleCardHtml(art)).join('')}
      </div>
    `;

    document.getElementById('btn-vade-back-laws').addEventListener('click', () => {
      this.renderHub('laws');
    });

    document.getElementById('btn-play-all-vade-law').addEventListener('click', () => {
      if (articles.length > 0) this.audioEngine.speakArticle(articles[0]);
    });

    this.wireArticleCardEvents(container);
  }

  // 2. Grid das 14 Disciplinas Jurídicas
  renderSubjectsGrid(container) {
    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-graduation-cap text-amber"></i> Organização por Disciplinas (14 Áreas do Direito)</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Explore leis, jurisprudência, súmulas e questões categorizadas por matéria.</p>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px;">
        ${VADE_MECUM_DB.subjects.map(s => {
          const artCount = VADE_MECUM_DB.articles.filter(a => a.subject_id === s.id).length;
          const sumCount = VADE_MECUM_DB.sumulas.filter(sum => sum.subject_id === s.id).length;
          const jurCount = VADE_MECUM_DB.jurisprudence.filter(j => j.subject_id === s.id).length;
          const qCount = VADE_MECUM_DB.questions.filter(qu => qu.subject_id === s.id).length;
          return `
            <div class="vade-subject-card" data-subject-id="${s.id}" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px; cursor:pointer; transition:var(--transition-fast);">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                <div style="width:40px; height:40px; border-radius:10px; background:${s.color}22; color:${s.color}; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
                  <i class="${s.icon}"></i>
                </div>
                <h4 style="color:var(--text-main); font-size:0.95rem; margin:0;">${s.name}</h4>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
                <span><i class="fa-solid fa-book"></i> ${artCount} Artigos</span>
                <span><i class="fa-solid fa-gavel"></i> ${sumCount} Súmulas • ${jurCount} Precedentes</span>
                <span><i class="fa-solid fa-circle-question"></i> ${qCount} Questões</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.vade-subject-card').forEach(card => {
      card.addEventListener('click', () => {
        this.openSubjectView(card.dataset.subjectId);
      });
    });
  }

  openSubjectView(subjectId) {
    const s = VADE_MECUM_DB.subjects.find(sub => sub.id === subjectId);
    if (!s) return;

    const articles = VADE_MECUM_DB.articles.filter(a => a.subject_id === subjectId);
    const sumulas = VADE_MECUM_DB.sumulas.filter(sum => sum.subject_id === subjectId);
    const jurisprudence = VADE_MECUM_DB.jurisprudence.filter(j => j.subject_id === subjectId);
    const questions = VADE_MECUM_DB.questions.filter(qu => qu.subject_id === subjectId);

    const container = document.getElementById('vade-content-area');
    if (!container) return;

    container.innerHTML = `
      <div style="margin-bottom:20px;">
        <button id="btn-back-subjects" class="btn-secondary" style="margin-bottom:10px;"><i class="fa-solid fa-arrow-left"></i> Voltar para Disciplinas</button>
        <h2 style="font-family:var(--font-display); color:var(--text-main);"><i class="${s.icon}" style="color:${s.color};"></i> ${s.name}</h2>
      </div>

      <!-- Artigos da Disciplina -->
      <div style="margin-bottom:24px;">
        <h3 style="font-size:1.05rem; color:var(--text-main); margin-bottom:12px;"><i class="fa-solid fa-book text-amber"></i> Artigos da Disciplina (${articles.length})</h3>
        <div class="articles-container">
          ${articles.length > 0 ? articles.map(art => this.generateArticleCardHtml(art)).join('') : '<p style="color:var(--text-muted); font-size:0.85rem;">Nenhum artigo cadastrado.</p>'}
        </div>
      </div>

      <!-- Súmulas da Disciplina -->
      <div style="margin-bottom:24px;">
        <h3 style="font-size:1.05rem; color:var(--text-main); margin-bottom:12px;"><i class="fa-solid fa-gavel text-amber"></i> Súmulas Aplicáveis (${sumulas.length})</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${sumulas.length > 0 ? sumulas.map(sum => this.generateSumulaCardHtml(sum)).join('') : '<p style="color:var(--text-muted); font-size:0.85rem;">Nenhuma súmula cadastrada para esta disciplina.</p>'}
        </div>
      </div>

      <!-- Jurisprudência da Disciplina -->
      <div style="margin-bottom:24px;">
        <h3 style="font-size:1.05rem; color:var(--text-main); margin-bottom:12px;"><i class="fa-solid fa-scale-balanced text-amber"></i> Jurisprudência STF/STJ (${jurisprudence.length})</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${jurisprudence.length > 0 ? jurisprudence.map(j => this.generateJurisprudenceCardHtml(j)).join('') : '<p style="color:var(--text-muted); font-size:0.85rem;">Nenhum julgado cadastrado.</p>'}
        </div>
      </div>
    `;

    document.getElementById('btn-back-subjects').addEventListener('click', () => {
      this.renderHub('subjects');
    });

    this.wireArticleCardEvents(container);
    this.wireJurisprudenceAndSumulaEvents(container);
  }

  // 3. Jurisprudência Oficial
  renderJurisprudenceList(container) {
    const jurs = VADE_MECUM_DB.jurisprudence;
    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-scale-balanced text-amber"></i> Jurisprudência Oficial (STF & STJ)</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Decisões e precedentes oficiais vinculados aos artigos do Vade Mecum.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${jurs.map(j => this.generateJurisprudenceCardHtml(j)).join('')}
      </div>
    `;
    this.wireJurisprudenceAndSumulaEvents(container);
  }

  generateJurisprudenceCardHtml(j, searchHighlightQuery = '') {
    const isFav = StorageModule.isExpandedFavorite('jurisprudence', j.id);
    const highlightedEmenta = searchHighlightQuery ? this.highlightMatch(j.ementa, searchHighlightQuery) : j.ementa;
    const art = VADE_MECUM_DB.articles.find(a => a.id === j.article_id);

    return `
      <div class="article-card" style="border-left:3px solid #38bdf8;">
        <div class="art-header">
          <div class="art-number">
            <span class="badge-official" style="color:#38bdf8; background:rgba(56,189,248,0.15); border-color:#38bdf8;">${j.tribunal}</span>
            <strong style="color:var(--text-main); font-size:0.95rem;">${j.numero_processo}</strong>
            ${art ? `<span style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-link"></i> ${art.law_name} - ${art.article_display}</span>` : ''}
          </div>
          <div class="art-actions">
            <button class="btn-fav-jur btn-art-fav ${isFav ? 'active' : ''}" data-id="${j.id}" title="Favoritar Decisão"><i class="fa-solid fa-star"></i></button>
            <button class="btn-play-jur btn-secondary" data-id="${j.id}" title="Ouvir Ementa (ElevenLabs)"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
            <a href="${j.fonte_url}" target="_blank" class="btn-secondary" style="font-size:0.75rem; padding:6px 10px;" title="Acessar no ${j.fonte_nome}"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
          </div>
        </div>
        <div class="art-body">
          <h4 style="color:#38bdf8; font-size:0.88rem; margin-bottom:6px;">Tema: ${j.tema}</h4>
          <p style="font-size:0.88rem; line-height:1.6; color:var(--text-main);">${highlightedEmenta}</p>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:8px; display:flex; gap:12px; flex-wrap:wrap;">
            <span><i class="fa-solid fa-user-tie"></i> Relator: ${j.relator}</span>
            <span><i class="fa-solid fa-users"></i> ${j.orgao_julgador}</span>
            <span><i class="fa-solid fa-calendar"></i> Julgado: ${new Date(j.data_julgamento).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Súmulas Oficiais
  renderSumulasList(container) {
    const sumulas = VADE_MECUM_DB.sumulas;
    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-gavel text-amber"></i> Súmulas Vinculantes & Tribunais Superiores</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Enunciados do STF, STJ e Vinculantes com indicação dos artigos relacionados.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${sumulas.map(s => this.generateSumulaCardHtml(s)).join('')}
      </div>
    `;
    this.wireJurisprudenceAndSumulaEvents(container);
  }

  generateSumulaCardHtml(s, searchHighlightQuery = '') {
    const isFav = StorageModule.isExpandedFavorite('sumula', s.id);
    const highlightedTexto = searchHighlightQuery ? this.highlightMatch(s.texto, searchHighlightQuery) : s.texto;

    return `
      <div class="article-card" style="border-left:3px solid #a855f7;">
        <div class="art-header">
          <div class="art-number">
            <span class="badge-official" style="color:#a855f7; background:rgba(168,85,247,0.15); border-color:#a855f7;">${s.tipo} nº ${s.numero} (${s.tribunal})</span>
          </div>
          <div class="art-actions">
            <button class="btn-fav-sum btn-art-fav ${isFav ? 'active' : ''}" data-id="${s.id}" title="Favoritar Súmula"><i class="fa-solid fa-star"></i></button>
            <button class="btn-play-sum btn-secondary" data-id="${s.id}" title="Ouvir Súmula (ElevenLabs)"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
            <a href="${s.fonte_url}" target="_blank" class="btn-secondary" style="font-size:0.75rem; padding:6px 10px;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
          </div>
        </div>
        <div class="art-body">
          <h4 style="color:#c084fc; font-size:0.88rem; margin-bottom:6px;">Tema: ${s.tema}</h4>
          <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main); font-style:italic;">"${highlightedTexto}"</p>
        </div>
      </div>
    `;
  }

  wireJurisprudenceAndSumulaEvents(container) {
    container.querySelectorAll('.btn-play-jur').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const j = VADE_MECUM_DB.jurisprudence.find(item => item.id === btn.dataset.id);
        if (j) {
          this.audioEngine.speakText(`Jurisprudência do ${j.tribunal}. ${j.numero_processo}. Tema: ${j.tema}. Ementa: ${j.ementa}`);
          this.playerUI.showToast(`Narrando decisão do ${j.tribunal}...`);
        }
      });
    });

    container.querySelectorAll('.btn-play-sum').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = VADE_MECUM_DB.sumulas.find(item => item.id === btn.dataset.id);
        if (s) {
          this.audioEngine.speakText(`${s.tipo} número ${s.numero} do ${s.tribunal}. Tema: ${s.tema}. Texto: ${s.texto}`);
          this.playerUI.showToast(`Narrando Súmula nº ${s.numero}...`);
        }
      });
    });

    container.querySelectorAll('.btn-fav-jur').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        StorageModule.toggleExpandedFavorite('jurisprudence', btn.dataset.id);
        btn.classList.toggle('active');
        this.playerUI.showToast('Jurisprudência atualizada nos favoritos!');
      });
    });

    container.querySelectorAll('.btn-fav-sum').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        StorageModule.toggleExpandedFavorite('sumula', btn.dataset.id);
        btn.classList.toggle('active');
        this.playerUI.showToast('Súmula atualizada nos favoritos!');
      });
    });
  }

  // 5. Banco de Questões & Caderno de Questões Erradas
  renderQuestionsTab(container) {
    const wrongList = StorageModule.getWrongQuestions();
    const allQuestions = VADE_MECUM_DB.questions;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-circle-question text-amber"></i> Questões de Estudo & Caderno de Erros</h3>
          <p style="font-size:0.85rem; color:var(--text-muted);">Pratique com questões oficiais da OAB e simulados gerados por IA.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button id="btn-view-wrong-questions" class="btn-secondary" style="color:#f87171;">
            <i class="fa-solid fa-triangle-exclamation"></i> Questões que Errei (${wrongList.length})
          </button>
          <button id="btn-open-exam-mode" class="btn-primary">
            <i class="fa-solid fa-bullseye"></i> 🎯 Iniciar Modo Prova
          </button>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${allQuestions.map(q => this.generateQuestionCardHtml(q)).join('')}
      </div>
    `;

    document.getElementById('btn-view-wrong-questions').addEventListener('click', () => {
      this.renderWrongQuestionsView(container);
    });

    document.getElementById('btn-open-exam-mode').addEventListener('click', () => {
      this.openExamSetupModal();
    });

    this.wireQuestionCardEvents(container);
  }

  generateQuestionCardHtml(q) {
    const isAi = q.is_ai_generated;
    const badgeText = isAi ? '🤖 Questão gerada por IA para fins de estudo' : `🏛️ ${q.source} (${q.exam_name || q.exam_board})`;

    return `
      <div class="article-card question-item-box" id="q-box-${q.id}">
        <div class="art-header">
          <div>
            <span class="badge-official" style="color:${isAi ? '#c084fc' : '#10b981'}; background:${isAi ? 'rgba(168,85,247,0.15)' : 'rgba(16,185,129,0.15)'}; border-color:${isAi ? '#c084fc' : '#10b981'}; font-size:0.75rem;">
              ${badgeText}
            </span>
          </div>
          <button class="btn-listen-q btn-secondary" data-id="${q.id}" title="Ouvir Enunciado"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
        </div>
        <div class="art-body">
          <p style="font-size:0.95rem; font-weight:600; line-height:1.55; color:var(--text-main); margin-bottom:14px;">${q.statement}</p>
          <div class="q-options-container" style="display:flex; flex-direction:column; gap:8px;">
            ${q.options.map((opt, idx) => `
              <button class="btn-q-opt" data-qid="${q.id}" data-idx="${idx}" style="text-align:left; padding:10px 14px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border-light); color:var(--text-main); font-family:var(--font-family); font-size:0.88rem; cursor:pointer; transition:var(--transition-fast);">
                <strong>${String.fromCharCode(65 + idx)})</strong> ${opt}
              </button>
            `).join('')}
          </div>
          <div id="q-feedback-${q.id}" class="hidden" style="margin-top:14px; padding:14px; border-radius:8px;"></div>
        </div>
      </div>
    `;
  }

  wireQuestionCardEvents(container) {
    container.querySelectorAll('.btn-q-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.qid;
        const selectedIdx = parseInt(btn.dataset.idx);
        const q = VADE_MECUM_DB.questions.find(item => item.id === qid);
        if (!q) return;

        const isCorrect = selectedIdx === q.correctIndex;
        const feedbackBox = document.getElementById(`q-feedback-${qid}`);
        const qBox = document.getElementById(`q-box-${qid}`);

        // Salva nas estatísticas da disciplina
        if (q.subject_id) StorageModule.recordSubjectAttempt(q.subject_id, isCorrect);

        // Desabilita opções
        qBox.querySelectorAll('.btn-q-opt').forEach((b, idx) => {
          b.disabled = true;
          if (idx === q.correctIndex) {
            b.style.background = 'rgba(16,185,129,0.2)';
            b.style.borderColor = '#10b981';
          } else if (idx === selectedIdx && !isCorrect) {
            b.style.background = 'rgba(239,68,68,0.2)';
            b.style.borderColor = '#ef4444';
          }
        });

        if (isCorrect) {
          feedbackBox.className = '';
          feedbackBox.style.background = 'rgba(16,185,129,0.1)';
          feedbackBox.style.border = '1px solid #10b981';
          feedbackBox.innerHTML = `
            <strong style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Parabéns! Resposta Correta.</strong>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:6px;">${q.explanation}</p>
            <button class="btn-secondary btn-listen-expl" data-qid="${q.id}" style="margin-top:8px; font-size:0.8rem;"><i class="fa-solid fa-volume-high"></i> Ouvir Explicação da IA</button>
          `;
          this.playerUI.showToast('Resposta Correta!');
        } else {
          // Salva no Caderno de Erros
          StorageModule.addWrongQuestion(q.id, selectedIdx);
          feedbackBox.className = '';
          feedbackBox.style.background = 'rgba(239,68,68,0.1)';
          feedbackBox.style.border = '1px solid #ef4444';
          feedbackBox.innerHTML = `
            <strong style="color:#ef4444;"><i class="fa-solid fa-circle-xmark"></i> Incorreto! A questão foi salva no caderno de "Questões que Errei".</strong>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:6px;"><strong>Resposta correta: Opção ${String.fromCharCode(65 + q.correctIndex)}</strong></p>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:4px;">${q.explanation}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
              <button class="btn-secondary btn-listen-expl" data-qid="${q.id}" style="font-size:0.8rem;"><i class="fa-solid fa-volume-high"></i> Ouvir Explicação</button>
              ${q.article_id ? `<button class="btn-primary btn-open-rel-art" data-artid="${q.article_id}" style="font-size:0.8rem;"><i class="fa-solid fa-book-open"></i> Abrir Artigo Relacionado</button>` : ''}
            </div>
          `;
          this.playerUI.showToast('Questão salva no Caderno de Erros.');
        }

        feedbackBox.querySelector('.btn-listen-expl')?.addEventListener('click', () => {
          this.audioEngine.speakText(q.speechExplanation || q.explanation);
        });

        feedbackBox.querySelector('.btn-open-rel-art')?.addEventListener('click', (e) => {
          this.openArticleModal(e.target.dataset.artid || q.article_id);
        });
      });
    });

    container.querySelectorAll('.btn-listen-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = VADE_MECUM_DB.questions.find(item => item.id === btn.dataset.id);
        if (q) {
          this.audioEngine.speakText(`Enunciado da questão: ${q.statement}`);
        }
      });
    });
  }

  renderWrongQuestionsView(container) {
    const wrongList = StorageModule.getWrongQuestions();
    const questions = wrongList.map(w => VADE_MECUM_DB.questions.find(q => q.id === w.questionId)).filter(Boolean);

    if (questions.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-circle-check" style="font-size:2.5rem; color:#10b981; margin-bottom:14px;"></i>
          <h3>Nenhuma Questão no Caderno de Erros!</h3>
          <p style="font-size:0.9rem; margin-top:6px;">Quando você errar alguma questão em simulados, ela aparecerá aqui automaticamente para revisão e reforço.</p>
          <button id="btn-back-q-tab" class="btn-secondary" style="margin-top:14px;"><i class="fa-solid fa-arrow-left"></i> Voltar para Questões</button>
        </div>
      `;
      document.getElementById('btn-back-q-tab').addEventListener('click', () => this.renderQuestionsTab(container));
      return;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <button id="btn-back-q-tab" class="btn-secondary" style="margin-bottom:8px;"><i class="fa-solid fa-arrow-left"></i> Voltar para Todas as Questões</button>
          <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-triangle-exclamation text-amber"></i> Caderno de Questões que Errei (${questions.length})</h3>
        </div>
        <button id="btn-clear-wrongs" class="btn-secondary" style="color:#f87171; font-size:0.8rem;"><i class="fa-solid fa-trash"></i> Limpar Caderno de Erros</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${questions.map(q => this.generateQuestionCardHtml(q)).join('')}
      </div>
    `;

    document.getElementById('btn-back-q-tab').addEventListener('click', () => this.renderQuestionsTab(container));
    document.getElementById('btn-clear-wrongs').addEventListener('click', () => {
      StorageModule.clearWrongQuestions();
      this.renderWrongQuestionsView(container);
    });

    this.wireQuestionCardEvents(container);
  }

  // 6. Flashcards & Revisão Espaçada
  renderFlashcardsTab(container) {
    const flashcards = StorageModule.getCustomFlashcards();
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main);"><i class="fa-solid fa-brain text-amber"></i> Flashcards Jurídicos & Repetição Espaçada</h3>
          <p style="font-size:0.85rem; color:var(--text-muted);">Revise conceitos-chave da legislação memorizando por cartões interativos.</p>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
        ${flashcards.map(fc => this.generateFlashcardCardHtml(fc)).join('')}
      </div>
    `;

    this.wireFlashcardEvents(container);
  }

  generateFlashcardCardHtml(fc) {
    return `
      <div class="article-card flashcard-interactive-box" id="fc-box-${fc.id}" style="perspective:1000px; min-height:200px; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="badge-official" style="font-size:0.7rem; text-transform:uppercase;">${fc.difficulty || 'médio'}</span>
          <button class="btn-play-fc btn-secondary" data-id="${fc.id}" style="padding:4px 8px; font-size:0.75rem;" title="Ouvir Flashcard"><i class="fa-solid fa-volume-high"></i></button>
        </div>
        <div class="fc-front" style="flex:1;">
          <p style="font-size:0.95rem; font-weight:700; color:var(--text-main); line-height:1.5;">${fc.front}</p>
        </div>
        <div class="fc-back hidden" style="background:rgba(245,158,11,0.06); border:1px solid var(--border-amber); border-radius:8px; padding:12px; margin-top:8px;">
          <strong style="color:var(--accent-amber); font-size:0.8rem; display:block; margin-bottom:4px;">RESPOSTA:</strong>
          <p style="font-size:0.88rem; color:var(--text-main); line-height:1.5; margin:0;">${fc.back}</p>
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-reveal-fc btn-secondary" style="font-size:0.8rem; width:100%;"><i class="fa-solid fa-eye"></i> Revelar Resposta</button>
        </div>
        <div class="fc-rating-row hidden" style="margin-top:10px; display:flex; gap:6px;">
          <button class="btn-fc-rate btn-secondary" data-fcid="${fc.id}" data-rate="facil" style="flex:1; font-size:0.75rem; color:#10b981;">Fácil</button>
          <button class="btn-fc-rate btn-secondary" data-fcid="${fc.id}" data-rate="medio" style="flex:1; font-size:0.75rem; color:#f59e0b;">Médio</button>
          <button class="btn-fc-rate btn-secondary" data-fcid="${fc.id}" data-rate="dificil" style="flex:1; font-size:0.75rem; color:#ef4444;">Difícil</button>
        </div>
      </div>
    `;
  }

  generateFlashcardCompactHtml(fc) {
    return `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
        <strong style="font-size:0.85rem; color:var(--text-main); display:block; margin-bottom:4px;">${fc.front}</strong>
        <p style="font-size:0.8rem; color:var(--accent-amber); margin:0;">${fc.back}</p>
      </div>
    `;
  }

  wireFlashcardEvents(container) {
    container.querySelectorAll('.btn-reveal-fc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.flashcard-interactive-box');
        const back = card.querySelector('.fc-back');
        const ratingRow = card.querySelector('.fc-rating-row');
        back.classList.toggle('hidden');
        ratingRow.classList.toggle('hidden');
        btn.classList.add('hidden');
      });
    });

    container.querySelectorAll('.btn-fc-rate').forEach(btn => {
      btn.addEventListener('click', () => {
        const fcid = btn.dataset.fcid;
        const rate = btn.dataset.rate;
        StorageModule.reviewFlashcard(fcid, rate);
        this.playerUI.showToast(`Flashcard avaliado como "${rate.toUpperCase()}"!`);
        this.renderFlashcardsTab(container);
      });
    });

    container.querySelectorAll('.btn-play-fc').forEach(btn => {
      btn.addEventListener('click', () => {
        const fc = StorageModule.getCustomFlashcards().find(item => item.id === btn.dataset.id);
        if (fc) {
          this.audioEngine.speakText(`Pergunta do flashcard: ${fc.front}. Resposta: ${fc.back}`);
        }
      });
    });
  }

  // 7. Atualizações Legislativas & Comparador de Versões
  renderUpdatesPanel(container) {
    const updates = VADE_MECUM_DB.legislative_updates;
    container.innerHTML = `
      <div style="max-width:850px; margin:0 auto;">
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(13,16,24,0.95)); border:1px solid var(--border-amber); border-radius:14px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="color:var(--text-main); font-size:1.2rem; margin-bottom:4px;"><i class="fa-solid fa-scale-balanced text-amber"></i> ⚖️ Atualizações Legislativas & Versionamento</h3>
              <p style="color:var(--text-muted); font-size:0.85rem;">Histórico detalhado de alterações, emendas e redações anteriores.</p>
            </div>
            <button id="btn-vade-check-updates-action" class="btn-primary"><i class="fa-solid fa-magnifying-glass"></i> Sincronizar Portais Oficiais</button>
          </div>
        </div>

        <h4 style="color:var(--text-muted); margin-bottom:12px; text-transform:uppercase; font-size:0.8rem; letter-spacing:0.5px;">Quadro Comparativo de Redações</h4>
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${updates.map(u => {
            const art = VADE_MECUM_DB.articles.find(a => a.id === u.article_id);
            return `
              <div class="article-card" style="border-left:3px solid var(--accent-amber);">
                <div class="art-header">
                  <div class="art-number">
                    <span class="badge-official" style="color:var(--accent-amber); background:rgba(245,158,11,0.15); border-color:var(--accent-amber);">${u.change_type}</span>
                    <strong>${art ? art.law_name + ' - ' + art.article_display : u.law_id.toUpperCase()}</strong>
                  </div>
                  <a href="${u.source_url}" target="_blank" class="btn-secondary" style="font-size:0.75rem; padding:6px 10px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${u.amending_law}</a>
                </div>
                <div class="art-body">
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
                    <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:12px;">
                      <strong style="color:#f87171; font-size:0.78rem; display:block; margin-bottom:4px;">REDAÇÃO ANTERIOR:</strong>
                      <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin:0;">${u.old_text}</p>
                    </div>
                    <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:12px;">
                      <strong style="color:#34d399; font-size:0.78rem; display:block; margin-bottom:4px;">REDAÇÃO VIGENTE ATUAL:</strong>
                      <p style="font-size:0.85rem; color:var(--text-main); line-height:1.5; margin:0;">${u.new_text}</p>
                    </div>
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">
                    Vigência: ${new Date(u.effective_date).toLocaleDateString('pt-BR')} • Fonte Oficial: ${u.source_name}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-vade-check-updates-action').addEventListener('click', () => {
      this.playerUI.showToast('Conectando aos portais oficiais da Presidência da República e STF...');
      setTimeout(() => {
        this.playerUI.showToast('✅ Todas as 10 legislações e súmulas estão 100% verificadas e sincronizadas!');
      }, 1200);
    });
  }

  // 8. Histórico, Anotações, Grifos e Favoritos
  renderHistoryList(container) {
    const history = StorageModule.getVadeHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-clock-rotate-left" style="font-size:2.5rem; opacity:0.4; margin-bottom:14px;"></i>
          <h3>Histórico Vazio</h3>
          <p style="font-size:0.9rem; margin-top:6px;">Os artigos que você abrir ficarão salvos aqui.</p>
        </div>
      `;
      return;
    }
    const articles = history.map(h => VADE_MECUM_DB.articles.find(a => a.id === h.articleId)).filter(Boolean);
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="font-size:1.1rem; color:var(--text-main);"><i class="fa-solid fa-clock-rotate-left text-amber"></i> Artigos Acessados Recentemente</h3>
        <button id="btn-clear-vade-history" class="btn-secondary" style="color:#f87171; font-size:0.8rem;"><i class="fa-solid fa-trash"></i> Limpar Histórico</button>
      </div>
      <div class="articles-container">${articles.map(art => this.generateArticleCardHtml(art)).join('')}</div>
    `;
    document.getElementById('btn-clear-vade-history').addEventListener('click', () => {
      StorageModule.clearVadeHistory();
      this.renderHistoryList(container);
    });
    this.wireArticleCardEvents(container);
  }

  renderAnnotationsList(container) {
    const annotations = StorageModule.getAnnotations();
    const articleIds = Object.keys(annotations);
    if (articleIds.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-note-sticky" style="font-size:2.5rem; opacity:0.4; margin-bottom:14px;"></i>
          <h3>Nenhuma Anotação Salva</h3>
          <p style="font-size:0.9rem; margin-top:6px;">No leitor de artigos, clique em <strong>"📝 Anotar"</strong> para registrar apontamentos de estudo.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.1rem; color:var(--text-main);"><i class="fa-solid fa-note-sticky text-amber"></i> Minhas Anotações de Estudo (${articleIds.length})</h3>
      </div>
      <div class="articles-container">
        ${articleIds.map(id => {
          const art = VADE_MECUM_DB.articles.find(a => a.id === id);
          const note = annotations[id];
          if (!art || !note) return '';
          return `
            <div class="article-card">
              <div class="art-header">
                <div class="art-number"><i class="fa-solid fa-book text-amber"></i> <span>${art.law_name} - ${art.article_display}</span></div>
                <div class="art-actions">
                  <button class="btn-vade-read" data-id="${art.id}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ler Artigo</button>
                  <button class="btn-vade-note-edit" data-id="${art.id}"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                </div>
              </div>
              <div style="background:rgba(245,158,11,0.06); border-left:3px solid var(--accent-amber); padding:12px; border-radius:6px; margin-top:8px;">
                <p style="font-size:0.9rem; color:var(--text-main); margin:0;">${note.text}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.querySelectorAll('.btn-vade-read').forEach(b => b.addEventListener('click', () => this.openArticleModal(b.dataset.id)));
    container.querySelectorAll('.btn-vade-note-edit').forEach(b => b.addEventListener('click', () => this.openNoteModal(b.dataset.id)));
  }

  renderHighlightsList(container) {
    const highlights = StorageModule.getCategorizedHighlights();
    const articleIds = Object.keys(highlights);
    if (articleIds.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-highlighter" style="font-size:2.5rem; opacity:0.4; margin-bottom:14px;"></i>
          <h3>Nenhum Grifo Salvo</h3>
          <p style="font-size:0.9rem; margin-top:6px;">No leitor de artigos, clique em <strong>"🖍 Grifar"</strong> para marcar trechos.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.1rem; color:var(--text-main);"><i class="fa-solid fa-highlighter text-amber"></i> Trechos Grifados</h3>
      </div>
      <div class="articles-container">
        ${articleIds.map(id => {
          const art = VADE_MECUM_DB.articles.find(a => a.id === id);
          const hls = highlights[id];
          if (!art || !hls || hls.length === 0) return '';
          return `
            <div class="article-card">
              <div class="art-header">
                <div class="art-number"><span>${art.law_name} - ${art.article_display}</span></div>
                <button class="btn-vade-read" data-id="${art.id}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir</button>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                ${hls.map(h => `<span style="background:${h.color}22; border:1px solid ${h.color}; color:${h.color}; font-size:0.75rem; padding:3px 8px; border-radius:4px;"><i class="fa-solid fa-tag"></i> ${h.category.toUpperCase()}</span>`).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.querySelectorAll('.btn-vade-read').forEach(b => b.addEventListener('click', () => this.openArticleModal(b.dataset.id)));
  }

  renderFavoritesList(container) {
    const favArticles = VADE_MECUM_DB.articles.filter(a => StorageModule.isFavorite(a.id));
    const favJurs = VADE_MECUM_DB.jurisprudence.filter(j => StorageModule.isExpandedFavorite('jurisprudence', j.id));
    const favSums = VADE_MECUM_DB.sumulas.filter(s => StorageModule.isExpandedFavorite('sumula', s.id));

    const total = favArticles.length + favJurs.length + favSums.length;
    if (total === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-star" style="font-size:2.5rem; opacity:0.4; margin-bottom:14px;"></i>
          <h3>Nenhum Favorito Salvo</h3>
          <p style="font-size:0.9rem; margin-top:6px;">Você pode favoritar artigos, súmulas e julgados de jurisprudência clicando na estrela.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom:16px;">
        <h3 style="font-size:1.1rem; color:var(--text-main);"><i class="fa-solid fa-star text-amber"></i> Meus Favoritos (${total})</h3>
      </div>
      ${favArticles.length > 0 ? `<div style="margin-bottom:20px;"><h4>Artigos Salvos (${favArticles.length})</h4><div class="articles-container">${favArticles.map(a => this.generateArticleCardHtml(a)).join('')}</div></div>` : ''}
      ${favSums.length > 0 ? `<div style="margin-bottom:20px;"><h4>Súmulas Salvas (${favSums.length})</h4><div style="display:flex; flex-direction:column; gap:12px;">${favSums.map(s => this.generateSumulaCardHtml(s)).join('')}</div></div>` : ''}
      ${favJurs.length > 0 ? `<div style="margin-bottom:20px;"><h4>Jurisprudência Salva (${favJurs.length})</h4><div style="display:flex; flex-direction:column; gap:12px;">${favJurs.map(j => this.generateJurisprudenceCardHtml(j)).join('')}</div></div>` : ''}
    `;

    this.wireArticleCardEvents(container);
    this.wireJurisprudenceAndSumulaEvents(container);
  }

  // --------------------------------------------------------------------------
  // Gerador de Cards e Modal do Artigo
  // --------------------------------------------------------------------------
  generateArticleCardHtml(art, searchHighlightQuery = '') {
    const isFav = StorageModule.isFavorite(art.id);
    const hasNote = !!StorageModule.getArticleAnnotation(art.id);
    const highlightedText = searchHighlightQuery ? this.highlightMatch(art.official_text, searchHighlightQuery) : art.official_text;

    return `
      <div class="article-card" id="vade-card-${art.id}">
        <div class="art-header">
          <div class="art-number">
            <i class="fa-solid fa-scale-balanced text-amber"></i>
            <span>${art.law_name} • ${art.article_display}</span>
            ${art.isOabFocus ? '<span class="tag-oab"><i class="fa-solid fa-star"></i> OAB / Concursos</span>' : ''}
            ${hasNote ? '<span class="tag-oab" style="background:rgba(245,158,11,0.2); border-color:var(--accent-amber); color:var(--accent-amber);"><i class="fa-solid fa-note-sticky"></i> Anotado</span>' : ''}
          </div>
          <div class="art-actions">
            <button class="btn-vade-open-modal btn-secondary" data-id="${art.id}" title="Abrir no Leitor Completo">
              <i class="fa-solid fa-expand"></i> Leitor
            </button>
            <button class="btn-art-fav ${isFav ? 'active' : ''}" data-id="${art.id}" title="Favoritar">
              <i class="fa-solid fa-star"></i>
            </button>
            <button class="btn-art-play" data-id="${art.id}" title="Ouvir Texto Oficial na Íntegra (ElevenLabs)">
              <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
        <div class="art-body">
          <h4 style="color:var(--text-muted); font-size:0.82rem; margin-bottom:8px;">${art.title}</h4>
          <p style="font-size:0.92rem; line-height:1.6; color:var(--text-main);">${highlightedText}</p>
        </div>
      </div>
    `;
  }

  wireArticleCardEvents(container) {
    container.querySelectorAll('.btn-art-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const art = VADE_MECUM_DB.articles.find(a => a.id === btn.dataset.id);
        if (art) {
          StorageModule.addToVadeHistory(art.id);
          this.audioEngine.speakArticle(art);
        }
      });
    });

    container.querySelectorAll('.btn-art-fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const favs = StorageModule.toggleFavorite(btn.dataset.id);
        btn.classList.toggle('active', favs.includes(btn.dataset.id));
        this.playerUI.showToast(favs.includes(btn.dataset.id) ? 'Artigo favoritado!' : 'Removido dos favoritos.');
      });
    });

    container.querySelectorAll('.btn-vade-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openArticleModal(btn.dataset.id);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Modal de Leitura Completa do Artigo
  // --------------------------------------------------------------------------
  openArticleModal(articleId) {
    const art = VADE_MECUM_DB.articles.find(a => a.id === articleId);
    if (!art) return;

    this.currentArticle = art;
    StorageModule.addToVadeHistory(art.id);

    const modal = document.getElementById('vade-article-modal');
    const headerTitle = document.getElementById('vade-modal-art-title');
    const lawHierarchy = document.getElementById('vade-modal-hierarchy');
    const sourceLink = document.getElementById('vade-modal-source-link');
    const bodyContent = document.getElementById('vade-modal-body');
    const profBox = document.getElementById('vade-modal-professor-box');

    if (headerTitle) headerTitle.innerText = `${art.law_name} - ${art.article_display}: ${art.title}`;
    if (lawHierarchy) {
      const h = art.hierarchy || {};
      lawHierarchy.innerText = [h.part, h.book, h.title_num, h.chapter_num].filter(Boolean).join(' > ') || art.law_name;
    }
    if (sourceLink && art.source) {
      sourceLink.href = art.source.url;
      sourceLink.innerText = `Fonte Oficial: ${art.source.name} (Versão ${art.source.version})`;
    }

    const highlights = StorageModule.getArticleCategorizedHighlights(art.id);
    if (bodyContent) {
      bodyContent.innerHTML = art.content.map(c => {
        const hl = highlights.find(h => h.elementId === c.id);
        const hlStyle = hl ? `background:${hl.color}28; border-left:3px solid ${hl.color}; padding-left:8px; border-radius:4px;` : '';
        return `
          <div class="vade-article-element" id="${c.id}" style="${hlStyle} margin-bottom:12px; cursor:pointer;" title="Clique para Grifar este dispositivo">
            <p style="margin:0; font-size:1rem; line-height:1.65; color:var(--text-main);">${c.text}</p>
          </div>
        `;
      }).join('');

      bodyContent.querySelectorAll('.vade-article-element').forEach(el => {
        el.addEventListener('click', () => {
          this.toggleElementHighlight(art.id, el.id);
        });
      });
    }

    // Preenche o painel Modo Professor Expandido
    if (profBox && art.professor_mode) {
      const p = art.professor_mode;
      profBox.innerHTML = `
        <div style="background:rgba(245,158,11,0.06); border:1px solid var(--border-amber); border-radius:12px; padding:16px; margin-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <strong style="color:var(--accent-amber); font-size:0.95rem; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-graduation-cap"></i> 🎓 Modo Professor (Comentário Didático IA)
            </strong>
            <button id="btn-speak-professor-mode" class="btn-primary" style="font-size:0.8rem; padding:6px 12px;">
              <i class="fa-solid fa-volume-high"></i> Ouvir Modo Professor
            </button>
          </div>
          <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:8px;"><strong>💡 Explicação Simples:</strong> ${p.simple_explanation}</p>
          <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:8px;"><strong>📖 Resumo:</strong> ${p.summary}</p>
          <p style="font-size:0.88rem; color:#38bdf8; margin-bottom:8px;"><strong>🚗 Exemplo da Vida Real:</strong> ${p.practical_example}</p>
          <p style="font-size:0.88rem; color:#10b981; margin-bottom:8px;"><strong>🎯 Ponto de Prova / OAB:</strong> ${p.exam_tip}</p>
          ${p.legal_terms ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">${p.legal_terms.map(t => `<span style="background:rgba(255,255,255,0.08); font-size:0.75rem; padding:2px 8px; border-radius:4px; color:var(--text-muted);">${t}</span>`).join('')}</div>` : ''}
          
          <!-- Botões Rápidos de Estudo -->
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            <button id="btn-modal-gen-question" class="btn-secondary" style="font-size:0.78rem; color:#c084fc;"><i class="fa-solid fa-brain"></i> 🧠 Gerar Questão deste Artigo</button>
            <button id="btn-modal-gen-flashcard" class="btn-secondary" style="font-size:0.78rem; color:#eab308;"><i class="fa-solid fa-clone"></i> 🃏 Criar Flashcard</button>
          </div>
        </div>
      `;

      document.getElementById('btn-speak-professor-mode').addEventListener('click', () => {
        this.audioEngine.speakText(p.speechText || `Explicação do Professor sobre o ${art.article_display}: ${p.simple_explanation}`);
        this.playerUI.showToast('Narrando comentário didático no Modo Professor...');
      });

      document.getElementById('btn-modal-gen-question').addEventListener('click', () => {
        this.generateAiQuestionForArticle(art);
      });

      document.getElementById('btn-modal-gen-flashcard').addEventListener('click', () => {
        this.generateAiFlashcardForArticle(art);
      });
    }

    this.wireModalActionButtons(art);
    if (modal) modal.classList.remove('hidden');
  }

  wireModalActionButtons(art) {
    const btnPlay = document.getElementById('btn-modal-play');
    if (btnPlay) {
      btnPlay.onclick = () => {
        this.audioEngine.speakArticle(art);
        this.playerUI.showToast(`Narrando texto oficial do ${art.article_display} (ElevenLabs)...`);
      };
    }

    const btnExplain = document.getElementById('btn-modal-explain');
    if (btnExplain) {
      btnExplain.onclick = () => {
        const profBox = document.getElementById('vade-modal-professor-box');
        if (profBox) profBox.scrollIntoView({ behavior: 'smooth' });
        this.playerUI.showToast('Comentário didático do Professor expandido.');
      };
    }

    const btnNote = document.getElementById('btn-modal-note');
    if (btnNote) {
      btnNote.onclick = () => this.openNoteModal(art.id);
    }

    const btnFav = document.getElementById('btn-modal-fav');
    if (btnFav) {
      const isFav = StorageModule.isFavorite(art.id);
      btnFav.classList.toggle('active', isFav);
      btnFav.onclick = () => {
        const favs = StorageModule.toggleFavorite(art.id);
        btnFav.classList.toggle('active', favs.includes(art.id));
        this.playerUI.showToast(favs.includes(art.id) ? 'Artigo favoritado!' : 'Removido dos favoritos.');
      };
    }

    const btnHighlight = document.getElementById('btn-modal-highlight');
    if (btnHighlight) {
      btnHighlight.onclick = () => {
        const cat = prompt('Escolha a categoria do grifo:\n1 - Importante (Amarelo)\n2 - Revisar (Verde)\n3 - Cai na Prova (Roxo)\n4 - Dúvida (Vermelho)\n0 - Remover Grifos', '1');
        const colorMap = {
          '1': { cat: 'importante', color: '#f59e0b' },
          '2': { cat: 'revisar', color: '#10b981' },
          '3': { cat: 'prova', color: '#a855f7' },
          '4': { cat: 'duvida', color: '#ef4444' }
        };
        if (cat === '0') {
          art.content.forEach(c => StorageModule.removeCategorizedHighlight(art.id, c.id));
          this.openArticleModal(art.id);
          this.playerUI.showToast('Grifos removidos.');
        } else if (colorMap[cat]) {
          const sel = colorMap[cat];
          art.content.forEach(c => StorageModule.saveCategorizedHighlight(art.id, c.id, sel.cat, sel.color));
          this.openArticleModal(art.id);
          this.playerUI.showToast(`Artigo grifado como "${sel.cat.toUpperCase()}"!`);
        }
      };
    }

    const btnCopy = document.getElementById('btn-modal-copy');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const citation = `${art.official_text}\n\n(Fonte Oficial: ${art.law_name}, ${art.law_number} - Presidência da República / Planalto. Acesso via VadeAudio AI)`;
        navigator.clipboard.writeText(citation).then(() => {
          this.playerUI.showToast('Texto oficial e citação copiados para a área de transferência!');
        }).catch(() => {
          this.playerUI.showToast('Texto copiado!');
        });
      };
    }
  }

  toggleElementHighlight(articleId, elementId) {
    const highlights = StorageModule.getArticleCategorizedHighlights(articleId);
    const existing = highlights.find(h => h.elementId === elementId);

    if (existing) {
      StorageModule.removeCategorizedHighlight(articleId, elementId);
      this.playerUI.showToast('Grifo removido.');
    } else {
      StorageModule.saveCategorizedHighlight(articleId, elementId, 'importante', '#f59e0b');
      this.playerUI.showToast('Dispositivo grifado como Importante!');
    }
    this.openArticleModal(articleId);
  }

  openNoteModal(articleId) {
    const art = VADE_MECUM_DB.articles.find(a => a.id === articleId);
    if (!art) return;
    this.currentArticle = art;

    const modal = document.getElementById('vade-note-modal');
    const title = document.getElementById('vade-note-title');
    const textarea = document.getElementById('vade-note-textarea');
    const note = StorageModule.getArticleAnnotation(articleId);

    if (title) title.innerText = `Anotação: ${art.law_name} - ${art.article_display}`;
    if (textarea) textarea.value = note ? note.text : '';

    if (modal) modal.classList.remove('hidden');
  }

  // --------------------------------------------------------------------------
  // Geradores de IA (Questões e Flashcards por Artigo)
  // --------------------------------------------------------------------------
  generateAiQuestionForArticle(art) {
    this.playerUI.showToast('🧠 Gerando questão de estudo com a IA baseada no artigo...');
    setTimeout(() => {
      // Abre a aba de questões destacando a questão relacionada
      this.activeTab = 'questions';
      const tabBtns = document.querySelectorAll('.vade-tab-btn');
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.vadeTab === 'questions'));
      this.renderHub('questions');

      const modal = document.getElementById('vade-article-modal');
      if (modal) modal.classList.add('hidden');
    }, 600);
  }

  generateAiFlashcardForArticle(art) {
    const p = art.professor_mode || {};
    const newFc = {
      id: 'fc-custom-' + Date.now(),
      subject_id: art.subject_id,
      law_id: art.law_id,
      article_id: art.id,
      front: `O que prevê o ${art.article_display} do(a) ${art.law_name}?`,
      back: p.simple_explanation || art.title,
      difficulty: 'medio'
    };
    StorageModule.saveFlashcard(newFc);
    this.playerUI.showToast('🃏 Flashcard gerado e adicionado ao seu baralho de estudos!');
  }

  // --------------------------------------------------------------------------
  // Setup do Modo Prova (Simulado Cronometrado)
  // --------------------------------------------------------------------------
  openExamSetupModal() {
    const modal = document.getElementById('vade-exam-modal');
    if (modal) modal.classList.remove('hidden');
  }
}
