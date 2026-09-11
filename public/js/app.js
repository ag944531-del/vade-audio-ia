/**
 * VadeAudio AI - Aplicação Principal
 * Conecta o Motor de Áudio, Banco de Dados Jurídico, UI e Modos de Estudo.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Modules
  const audioEngine = new AudioEngine();
  const playerUI = new PlayerUI(audioEngine);
  const studyManager = new StudyModesManager(audioEngine);
  const vadeEngine = new VadeMecumEngine(audioEngine, playerUI);
  const vadeMecumEngine = vadeEngine;
  const facultyEngine = new FacultyEngine(audioEngine, playerUI, vadeEngine);
  const speechService = new SpeechRecognitionService();
  const tutorEngine = new TutorEngine(audioEngine, playerUI, vadeEngine, facultyEngine, speechService);
  const docProcessor = new DocumentProcessor();
  const materialsEngine = new MaterialsEngine(audioEngine, playerUI, vadeEngine, facultyEngine, docProcessor);
  const oabEngine = new OabConcursosEngine(audioEngine, playerUI, vadeEngine, tutorEngine);
  const legalBrainEngine = new LegalBrainEngine(audioEngine, playerUI, vadeEngine, tutorEngine, materialsEngine, facultyEngine, oabEngine);
  const transcriptionService = new TranscriptionService();
  const classroomEngine = new ClassroomEngine(audioEngine, playerUI, vadeEngine, tutorEngine, transcriptionService);
  const researchEngine = new ResearchEngine(audioEngine, playerUI, vadeEngine, tutorEngine, legalBrainEngine);
  const legalPracticeEngine = new LegalPracticeEngine(audioEngine, playerUI, vadeEngine, tutorEngine, legalBrainEngine);
  const progressionService = new ProgressionService();
  const evolutionEngine = new EvolutionEngine(audioEngine, playerUI, progressionService);
  const dailyPlannerService = new DailyPlannerService(audioEngine, progressionService);
  const todayEngine = new TodayEngine(audioEngine, playerUI, dailyPlannerService, progressionService);
  const entitlementService = new EntitlementService();
  const premiumEngine = new PremiumEngine(audioEngine, playerUI, entitlementService);
  const authService = new AuthService();
  
  // Etapa 33: Modo Leitura Inteligente
  const readingProgressService = new ReadingProgressService(StorageModule);
  const smartReadingSessionService = new SmartReadingSessionService({
    storage: StorageModule,
    progressService: readingProgressService,
    audioEngine,
    tutorEngine,
    notebookEngine: window.digitalNotebookEngine,
    summaryEngine: window.smartSummaryEngine
  });
  const smartReadingEngine = new SmartReadingEngine(smartReadingSessionService, readingProgressService);
  
  // Etapa 34: Gerador Inteligente e Validador de Questões
  const questionValidationPipeline = new QuestionValidationPipeline({ vadeMecumDb: VADE_MECUM_DB });
  const questionReviewService = new QuestionReviewService({ storage: StorageModule, pipeline: questionValidationPipeline });
  const questionGenerationService = new QuestionGenerationService({ storage: StorageModule, pipeline: questionValidationPipeline, vadeMecumDb: VADE_MECUM_DB });
  const questionGeneratorEngine = new QuestionGeneratorEngine(questionGenerationService, questionValidationPipeline, questionReviewService, audioEngine);
  
  // Etapa 35: Flashcards Jurídicos Inteligentes & Scheduler Adaptativo FSRS
  const spacedRepetitionScheduler = new SpacedRepetitionScheduler();
  const flashcardQualityValidator = new FlashcardQualityValidator();
  const flashcardGenerationService = new FlashcardGenerationService({
    storage: StorageModule,
    vadeMecumDb: VADE_MECUM_DB,
    validator: flashcardQualityValidator
  });
  const smartFlashcardEngine = new SmartFlashcardEngine(
    spacedRepetitionScheduler,
    flashcardGenerationService,
    new FlashcardReviewPriorityEngine(StorageModule),
    audioEngine
  );
  
  window.FacultyApp = facultyEngine;
  window.TutorApp = tutorEngine;
  window.MaterialsApp = materialsEngine;
  window.OabApp = oabEngine;
  window.BrainApp = legalBrainEngine;
  window.ClassroomApp = classroomEngine;
  window.ResearchApp = researchEngine;
  window.PracticeApp = legalPracticeEngine;
  window.ProgressionApp = progressionService;
  window.EvolutionApp = evolutionEngine;
  window.PlannerApp = dailyPlannerService;
  window.TodayApp = todayEngine;
  window.EntitlementApp = entitlementService;
  window.PremiumApp = premiumEngine;
  window.AuthApp = authService;
  window.SecurityApp = SecurityService;
  window.ReadingProgressApp = readingProgressService;
  window.ReadingSessionApp = smartReadingSessionService;
  window.SmartReadingApp = smartReadingEngine;
  window.QuestionValidationApp = questionValidationPipeline;
  window.QuestionReviewApp = questionReviewService;
  window.QuestionGenerationApp = questionGenerationService;
  window.QuestionGeneratorApp = questionGeneratorEngine;
  window.FlashcardSchedulerApp = spacedRepetitionScheduler;
  window.FlashcardQualityApp = flashcardQualityValidator;
  window.FlashcardGenerationApp = flashcardGenerationService;
  window.SmartFlashcardApp = smartFlashcardEngine;

  // Etapa 36: Central de Jurisprudência Inteligente
  const jurisprudenceSearchEngine = new JurisprudenceSearchEngine(typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : []);
  const jurisprudenceRAGService = new JurisprudenceRAGService(jurisprudenceSearchEngine);
  const jurisprudenceHubEngine = new JurisprudenceHubEngine(
    typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : [],
    jurisprudenceSearchEngine,
    jurisprudenceRAGService,
    StorageModule,
    audioEngine
  );

  window.JurisprudenceSearchApp = jurisprudenceSearchEngine;
  window.JurisprudenceRAGApp = jurisprudenceRAGService;
  window.JurisprudenceHubApp = jurisprudenceHubEngine;

  // Etapa 37: Central de Doutrina & Biblioteca Jurídica Pessoal
  const doctrineSearchService = new DoctrineSearchService(StorageModule);
  const doctrineComparisonService = new DoctrineComparisonService(StorageModule);
  const doctrineRAGService = new DoctrineRAGService(StorageModule);
  const doctrineLibraryEngine = new DoctrineLibraryEngine(
    StorageModule,
    doctrineSearchService,
    doctrineComparisonService,
    doctrineRAGService,
    audioEngine
  );

  window.DoctrineSearchApp = doctrineSearchService;
  window.DoctrineComparisonApp = doctrineComparisonService;
  window.DoctrineRAGApp = doctrineRAGService;
  window.DoctrineLibraryApp = doctrineLibraryEngine;

  // Etapa 38: Central de Peças Jurídicas & Peticionamento Acadêmico
  const legalPieceEngine = new LegalPieceEngine(
    StorageModule,
    typeof LegalPieceIdentificationService !== 'undefined' ? LegalPieceIdentificationService : null,
    typeof LegalPieceTemplateService !== 'undefined' ? LegalPieceTemplateService : null,
    typeof LegalPieceValidationPipeline !== 'undefined' ? LegalPieceValidationPipeline : null,
    audioEngine
  );

  window.LegalPieceApp = legalPieceEngine;

  // Etapa 39: Central de Prazos Processuais & Linha do Tempo Jurídica
  const deadlineStudioEngine = new DeadlineStudioEngine(
    StorageModule,
    typeof DeadlineCountingEngine !== 'undefined' ? DeadlineCountingEngine : null,
    typeof DeadlineErrorAnalyzer !== 'undefined' ? DeadlineErrorAnalyzer : null,
    typeof LegalProcessTimelineService !== 'undefined' ? LegalProcessTimelineService : null,
    audioEngine
  );

  window.DeadlineStudioApp = deadlineStudioEngine;

  // Etapa 40: Central de Leis Comentadas & Estudo Artigo por Artigo
  const legalArticleStudyService = new LegalArticleStudyService(
    StorageModule,
    typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : []
  );
  const commentedLawEngine = new CommentedLawEngine(
    StorageModule,
    legalArticleStudyService,
    audioEngine
  );

  window.LegalArticleStudyApp = legalArticleStudyService;
  window.CommentedLawApp = commentedLawEngine;

  // Etapa 41: Central de Revisão Inteligente Pré-Prova
  const examRevisionHubEngine = new ExamRevisionHubEngine(
    StorageModule,
    typeof ExamRevisionContextBuilder !== 'undefined' ? new ExamRevisionContextBuilder(StorageModule) : null,
    typeof ExamRevisionPriorityEngine !== 'undefined' ? ExamRevisionPriorityEngine : null,
    typeof AdaptiveExamRevisionEngine !== 'undefined' ? AdaptiveExamRevisionEngine : null,
    audioEngine
  );

  window.ExamRevisionApp = examRevisionHubEngine;

  // Etapa 42: Central de Trabalhos, TCC & Pesquisa Jurídica Avançada
  const academicThesisStudioEngine = new AcademicThesisStudioEngine(
    StorageModule,
    typeof AcademicResearchProjectService !== 'undefined' ? new AcademicResearchProjectService(StorageModule) : null,
    typeof ResearchGapService !== 'undefined' ? ResearchGapService : null,
    typeof AcademicReferenceAuditService !== 'undefined' ? AcademicReferenceAuditService : null,
    audioEngine
  );

  window.AcademicThesisApp = academicThesisStudioEngine;

  // Etapa 43: Central de Provas Discursivas & Respostas Jurídicas com IA
  const discursiveExamStudioEngine = new DiscursiveExamStudioEngine(
    StorageModule,
    typeof LegalDiscursiveEvaluationPipeline !== 'undefined' ? LegalDiscursiveEvaluationPipeline : null,
    audioEngine
  );

  window.DiscursiveExamApp = discursiveExamStudioEngine;

  // Etapa 45: Salas de Estudo Colaborativas em Tempo Real
  const studyRoomEngine = new StudyRoomEngine(
    StorageModule,
    typeof StudyRoomRealtimeService !== 'undefined' ? new StudyRoomRealtimeService(StorageModule) : null,
    typeof StudyRoomActivityService !== 'undefined' ? StudyRoomActivityService : null,
    audioEngine
  );

  window.StudyRoomApp = studyRoomEngine;

  // Etapa 46: Importador Inteligente de Plano de Ensino & Ementa Acadêmica
  const academicPlanImportEngine = new AcademicPlanImportEngine(
    StorageModule,
    facultyEngine,
    audioEngine
  );

  window.AcademicPlanImportApp = academicPlanImportEngine;

  // Application State
  let currentLawId = 'cf88';
  let currentCategory = 'all';
  let isOabOnly = false;
  let activeView = 'today';

  // DOM References
  const lawSelectorList = document.getElementById('law-selector-list');
  const chapterTabs = document.getElementById('chapter-tabs');
  const articlesList = document.getElementById('articles-list');
  const globalSearchInput = document.getElementById('global-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const navButtons = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const btnFilterOab = document.getElementById('btn-filter-oab');
  const btnPlayAllLaw = document.getElementById('btn-play-all-law');
  const favCountBadge = document.getElementById('fav-count');

  // Load saved settings
  const savedSettings = StorageModule.getSettings();
  const initialSpeed = savedSettings.speed !== undefined ? savedSettings.speed : 1.0;
  playerUI.updateSpeed(initialSpeed);

  // Initialize Today Dashboard
  todayEngine.renderTodayView();

  // ------------------------------------------------------------------------
  // Render Law Sidebar Tabs
  // ------------------------------------------------------------------------
  function renderLawSidebar() {
    if (!lawSelectorList) return;
    lawSelectorList.innerHTML = '';
    if (!VADE_MECUM_DB || !VADE_MECUM_DB.laws) return;

    VADE_MECUM_DB.laws.forEach(law => {
      const btn = document.createElement('button');
      btn.className = `law-tab-btn ${law.id === currentLawId ? 'active' : ''}`;
      btn.style.width = '100%';
      btn.style.display = 'flex';
      btn.style.justifyContent = 'space-between';
      btn.style.alignItems = 'center';
      btn.style.padding = '8px 12px';
      btn.style.marginBottom = '4px';

      btn.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
          <i class="${law.icon}" style="font-size:0.9rem; color:var(--accent-amber); flex-shrink:0;"></i>
          <div style="display:flex; flex-direction:column; min-width:0; text-align:left;">
            <strong style="font-size:0.82rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${law.code}</strong>
            <span style="font-size:0.68rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${law.title}</span>
          </div>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; opacity:0.4; flex-shrink:0;"></i>
      `;

      btn.addEventListener('click', () => {
        currentLawId = law.id;
        currentCategory = 'all';
        isOabOnly = false;
        renderLawSidebar();
        renderLawBanner();
        renderChapterTabs();
        renderArticles();
        switchView('reader');

        // Fecha a gaveta mobile ao selecionar
        const sidebar = document.getElementById('main-sidebar-nav');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.add('hidden');
      });

      lawSelectorList.appendChild(btn);
    });
  }

  // Executa imediatamente na inicialização
  renderLawSidebar();

  // ------------------------------------------------------------------------
  // Render Law Header Banner Meta
  // ------------------------------------------------------------------------
  function renderLawBanner() {
    const law = VADE_MECUM_DB.laws.find(l => l.id === currentLawId);
    if (!law) return;

    const codeEl = document.getElementById('current-law-code');
    const titleEl = document.getElementById('current-law-title');
    const descEl = document.getElementById('current-law-desc');
    const quickSel = document.getElementById('quick-law-selector');

    if (codeEl) codeEl.innerText = law.code;
    if (titleEl) titleEl.innerText = law.title;
    if (descEl) descEl.innerText = law.subtitle;
    if (quickSel) quickSel.value = law.id;
  }

  const quickLawDropdown = document.getElementById('quick-law-selector');
  quickLawDropdown?.addEventListener('change', (e) => {
    currentLawId = e.target.value;
    currentCategory = 'all';
    isOabOnly = false;
    renderLawSidebar();
    renderLawBanner();
    renderChapterTabs();
    renderArticles();
  });

  // ------------------------------------------------------------------------
  // Render Category / Chapter Filter Pills
  // ------------------------------------------------------------------------
  function renderChapterTabs() {
    const law = VADE_MECUM_DB.laws.find(l => l.id === currentLawId);
    if (!law) return;

    chapterTabs.innerHTML = '';
    
    // "Todos" Pill
    const allBtn = document.createElement('button');
    allBtn.className = `chapter-btn ${currentCategory === 'all' ? 'active' : ''}`;
    allBtn.innerText = 'Todos os Artigos';
    allBtn.addEventListener('click', () => {
      currentCategory = 'all';
      renderChapterTabs();
      renderArticles();
    });
    chapterTabs.appendChild(allBtn);

    // Dynamic Category Pills
    law.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `chapter-btn ${currentCategory === cat ? 'active' : ''}`;
      btn.innerText = cat;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        renderChapterTabs();
        renderArticles();
      });
      chapterTabs.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------------
  // Render Legal Articles List (Interactive Editorial Document Stream)
  // ------------------------------------------------------------------------
  function renderArticles(customList = null, targetContainer = articlesList) {
    targetContainer.innerHTML = '';

    let list = customList || VADE_MECUM_DB.articles.filter(a => (a.law_id === currentLawId || a.lawId === currentLawId));

    // Apply category filter
    if (!customList && currentCategory !== 'all') {
      list = list.filter(a => a.category === currentCategory);
    }

    // Apply Focus OAB filter
    if (isOabOnly) {
      list = list.filter(a => a.isOabFocus);
    }

    if (list.length === 0) {
      targetContainer.innerHTML = `
        <div style="text-align: center; padding: 48px; color: var(--text-muted);">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 2.2rem; margin-bottom: 12px; opacity:0.4;"></i>
          <p style="font-size:0.9rem;">Nenhum artigo encontrado para esta busca ou filtro.</p>
        </div>
      `;
      return;
    }

    list.forEach(art => {
      const artDisplayNumber = art.article_display || art.number || (art.article ? `Art. ${art.article}º` : 'Artigo');
      const teacherExp = art.teacherExplanation || (art.professor_mode ? art.professor_mode.simple_explanation : '');
      const aiSummaryText = art.aiSummary || (art.professor_mode ? art.professor_mode.summary : '');
      const jurisprudenceText = typeof art.jurisprudence === 'string' ? art.jurisprudence : (art.professor_mode ? art.professor_mode.practical_example : '');
      const isFav = StorageModule.isFavorite(art.id);
      const isSrs = StorageModule.getSrsItems().some(i => i.articleId === art.id);
      const highlights = StorageModule.getArticleHighlights(art.id);

      const card = document.createElement('div');
      card.className = `article-card ${audioEngine.currentArticle && audioEngine.currentArticle.id === art.id ? 'reading-active' : ''}`;
      card.id = `art-card-${art.id}`;

      // Build legal content elements with highlight support
      const contentList = art.content || [{ text: art.official_text || art.text || '', type: 'caput' }];
      const contentHtml = contentList.map((c, idx) => {
        const hl = highlights.find(h => h.index === idx);
        const hlStyle = hl ? `background:${hl.color === 'green' ? 'rgba(16, 185, 129, 0.25)' : hl.color === 'blue' ? 'rgba(56, 189, 248, 0.25)' : hl.color === 'pink' ? 'rgba(244, 114, 182, 0.25)' : 'rgba(199, 152, 60, 0.25)'}; border-radius:3px; padding:2px 4px;` : '';
        
        let tagClass = 'art-caput';
        if (c.type === 'paragraph') tagClass = 'art-paragraph';
        if (c.type === 'inciso') tagClass = 'art-inciso';

        return `<p class="${tagClass}" data-art-id="${art.id}" data-idx="${idx}" style="${hlStyle} cursor:pointer;" title="Clique para grifar / destacar texto">${c.text}</p>`;
      }).join('');

      card.innerHTML = `
        <div class="art-header">
          <div class="art-number">
            <i class="fa-solid fa-volume-low"></i>
            <span>${artDisplayNumber}</span>
            ${art.isOabFocus ? '<span class="tag-oab"><i class="fa-solid fa-star"></i> OAB</span>' : ''}
          </div>
          
          <div class="art-actions">
            <button class="btn-art-play" data-id="${art.id}" title="Ouvir este artigo">
              <i class="fa-solid fa-play"></i> Ouvir
            </button>
            
            ${teacherExp ? `
              <button class="btn-art-explain" data-id="${art.id}" title="Explicação didática do professor">
                <i class="fa-solid fa-lightbulb"></i> Explicar
              </button>
            ` : ''}

            ${(aiSummaryText || jurisprudenceText) ? `
              <button class="btn-art-action btn-art-jurisprudence" data-id="${art.id}" title="Ver Jurisprudência e Súmulas STF/STJ">
                <i class="fa-solid fa-gavel"></i> Jurisprudência
              </button>
            ` : ''}

            <button class="btn-art-more" data-id="${art.id}" title="Mais ações (Fila, Favorito, SRS, Download)">
              <i class="fa-solid fa-ellipsis"></i>
            </button>

            <!-- Dropdown Menu de Ações Secundárias -->
            <div class="art-dropdown-menu hidden" id="dropdown-menu-${art.id}">
              <button class="art-dropdown-item btn-art-queue" data-id="${art.id}">
                <i class="fa-solid fa-plus"></i> <span>Adicionar à Fila</span>
              </button>
              <button class="art-dropdown-item btn-art-fav ${isFav ? 'active' : ''}" data-id="${art.id}">
                <i class="fa-solid fa-star"></i> <span>${isFav ? 'Salvo nos Favoritos' : 'Favoritar Artigo'}</span>
              </button>
              <button class="art-dropdown-item btn-art-srs ${isSrs ? 'active' : ''}" data-id="${art.id}">
                <i class="fa-solid fa-brain"></i> <span>${isSrs ? 'Na Repetição (SRS)' : 'Adicionar ao SRS'}</span>
              </button>
              <button class="art-dropdown-item btn-art-download" data-id="${art.id}">
                <i class="fa-solid fa-download"></i> <span>Baixar Áudio MP3</span>
              </button>
            </div>
          </div>
        </div>

        <div class="art-body">
          ${art.title ? `<div class="art-subtitle">${art.title}</div>` : ''}
          ${contentHtml}
        </div>

        ${teacherExp ? `
          <div class="art-teacher-box hidden" id="teacher-box-${art.id}">
            <div class="art-teacher-header">
              <div class="art-teacher-title">
                <i class="fa-solid fa-chalkboard-user"></i> Professor Explica
              </div>
              <button class="btn-listen-teacher-exp btn-secondary" style="font-size:0.72rem; padding:3px 8px;" data-id="${art.id}">
                <i class="fa-solid fa-volume-high text-amber"></i> Ouvir Explicação
              </button>
            </div>
            <p>${teacherExp}</p>
          </div>
        ` : ''}

        ${(aiSummaryText || jurisprudenceText) ? `
          <div class="summary-expandable-box hidden" id="summary-box-${art.id}">
            ${aiSummaryText ? `
              <p style="margin-bottom:8px; color:var(--text-primary);">
                <strong style="color:var(--accent-gold);"><i class="fa-solid fa-robot"></i> Resumo Guiado:</strong> ${aiSummaryText}
              </p>
            ` : ''}
            ${jurisprudenceText ? `
              <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:8px;">
                <strong style="color:var(--accent-gold);"><i class="fa-solid fa-gavel"></i> Jurisprudência & Súmulas:</strong> ${jurisprudenceText}
              </p>
            ` : ''}
            <button class="btn-speak-summary btn-secondary" style="margin-top:6px; font-size:0.75rem; padding:4px 10px;">
              <i class="fa-solid fa-volume-high text-amber"></i> Ouvir Resumo em Áudio
            </button>
          </div>
        ` : ''}
      `;

      // Event: Play Individual Article
      card.querySelector('.btn-art-play').addEventListener('click', (e) => {
        e.stopPropagation();
        audioEngine.speakArticle(art);
      });

      // Event: Toggle / Open Professor Explica
      const btnExplain = card.querySelector('.btn-art-explain');
      if (btnExplain) {
        btnExplain.addEventListener('click', (e) => {
          e.stopPropagation();
          const tBox = card.querySelector(`#teacher-box-${art.id}`);
          if (tBox) {
            const isHidden = tBox.classList.toggle('hidden');
            btnExplain.classList.toggle('active', !isHidden);
            if (!isHidden) {
              audioEngine.speakExplanation(art);
              playerUI.showToast(`Professor explicando o ${artDisplayNumber}`);
            }
          }
        });
      }

      // Event: Listen Teacher Explanation from inside box
      const btnListenExp = card.querySelector('.btn-listen-teacher-exp');
      if (btnListenExp) {
        btnListenExp.addEventListener('click', (e) => {
          e.stopPropagation();
          audioEngine.speakExplanation(art);
          playerUI.showToast(`Professor explicando o ${artDisplayNumber}`);
        });
      }

      // Event: Toggle Jurisprudence
      const btnJuris = card.querySelector('.btn-art-jurisprudence');
      if (btnJuris) {
        btnJuris.addEventListener('click', (e) => {
          e.stopPropagation();
          const sBox = card.querySelector(`#summary-box-${art.id}`);
          if (sBox) {
            sBox.classList.toggle('hidden');
          }
        });
      }

      // Event: Toggle Dropdown Menu
      const btnMore = card.querySelector('.btn-art-more');
      const dropMenu = card.querySelector(`#dropdown-menu-${art.id}`);
      if (btnMore && dropMenu) {
        btnMore.addEventListener('click', (e) => {
          e.stopPropagation();
          // Close other open dropdowns
          document.querySelectorAll('.art-dropdown-menu').forEach(m => {
            if (m !== dropMenu) m.classList.add('hidden');
          });
          dropMenu.classList.toggle('hidden');
        });
      }

      // Event: Download MP3
      card.querySelector('.btn-art-download')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        dropMenu?.classList.add('hidden');
        const btn = e.currentTarget;
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Baixando...</span>';
        playerUI.showToast(`Gerando áudio MP3 do ${artDisplayNumber} para download...`);
        const ok = await audioEngine.downloadArticleAudio(art);
        btn.innerHTML = ok ? '<i class="fa-solid fa-check"></i> <span>Baixado</span>' : origText;
        if (ok) playerUI.showToast(`Download de ${artDisplayNumber}.mp3 concluído!`);
        setTimeout(() => { btn.innerHTML = origText; }, 2000);
      });

      // Event: SRS Toggle
      const btnSrs = card.querySelector('.btn-art-srs');
      if (btnSrs) {
        btnSrs.addEventListener('click', (e) => {
          e.stopPropagation();
          dropMenu?.classList.add('hidden');
          StorageModule.addOrUpdateSrsItem(art.id, false);
          btnSrs.classList.add('active');
          btnSrs.querySelector('span').textContent = 'Na Repetição (SRS)';
          playerUI.showToast(`${artDisplayNumber} adicionado à Repetição Espaçada!`);
          updateSrsBadge();
        });
      }

      // Event: Text Highlighting on Click
      card.querySelectorAll('.art-body p').forEach(p => {
        p.addEventListener('click', (e) => {
          e.stopPropagation();
          const artId = p.dataset.artId;
          const idx = parseInt(p.dataset.idx);
          const currentHls = StorageModule.getArticleHighlights(artId);
          const hasHl = currentHls.some(h => h.index === idx);

          if (hasHl) {
            StorageModule.removeHighlight(artId, idx);
            p.style.background = 'transparent';
            playerUI.showToast('Grifo removido');
          } else {
            StorageModule.saveHighlight(artId, idx, 'gold');
            p.style.background = 'rgba(199, 152, 60, 0.25)';
            p.style.borderRadius = '3px';
            p.style.padding = '2px 4px';
            playerUI.showToast('Parágrafo grifado com sucesso!');
          }
        });
      });

      // Event: Add to Queue
      card.querySelector('.btn-art-queue')?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropMenu?.classList.add('hidden');
        audioEngine.addToQueue(art);
        playerUI.showToast(`${artDisplayNumber} adicionado à fila!`);
      });

      // Event: Favorite Toggle
      card.querySelector('.btn-art-fav')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const favs = StorageModule.toggleFavorite(art.id);
        const isNowFav = favs.includes(art.id);
        e.currentTarget.classList.toggle('active', isNowFav);
        e.currentTarget.querySelector('span').textContent = isNowFav ? 'Salvo nos Favoritos' : 'Favoritar Artigo';
        updateFavBadge();
        if (activeView === 'favorites') renderFavoritesView();
        playerUI.showToast(isNowFav ? `${artDisplayNumber} salvo nos favoritos!` : `${artDisplayNumber} removido dos favoritos.`);
      });

      // Event: Speak Summary
      const speakSummaryBtn = card.querySelector('.btn-speak-summary');
      if (speakSummaryBtn) {
        speakSummaryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          audioEngine.speakSummary(art);
        });
      }

      targetContainer.appendChild(card);
    });
  }

  // Close dropdown menus when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.art-dropdown-menu').forEach(m => m.classList.add('hidden'));
  });

  // ------------------------------------------------------------------------
  // Global Live Search Filter
  // ------------------------------------------------------------------------
  globalSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 0) {
      clearSearchBtn.classList.remove('hidden');
      const filtered = VADE_MECUM_DB.articles.filter(art => {
        const artNum = art.article_display || art.number || (art.article ? `Art. ${art.article}º` : '');
        const contentStr = art.content ? art.content.map(c => c.text).join(' ') : (art.official_text || art.text || '');
        const text = `${artNum} ${art.title || ''} ${contentStr}`.toLowerCase();
        return text.includes(query);
      });
      renderArticles(filtered);
      switchView('reader');
    } else {
      clearSearchBtn.classList.add('hidden');
      renderArticles();
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    globalSearchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderArticles();
  });

  // ------------------------------------------------------------------------
  // Focus OAB Filter & Play All Law Button
  // ------------------------------------------------------------------------
  btnFilterOab.addEventListener('click', () => {
    isOabOnly = !isOabOnly;
    btnFilterOab.classList.toggle('active', isOabOnly);
    btnFilterOab.style.borderColor = isOabOnly ? 'var(--accent-amber)' : 'var(--border-light)';
    renderArticles();
  });

  btnPlayAllLaw.addEventListener('click', () => {
    const lawArticles = VADE_MECUM_DB.articles.filter(a => (a.law_id === currentLawId || a.lawId === currentLawId));
    if (lawArticles.length > 0) {
      audioEngine.speakArticle(lawArticles[0]);
    }
  });

  // ------------------------------------------------------------------------
  // Navigation & View Switching
  // ------------------------------------------------------------------------
  function switchView(viewName) {
    activeView = viewName;
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    viewPanels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `view-${viewName}`);
    });

    if (viewName === 'reading') smartReadingEngine.openDocument();
    if (viewName === 'mind-maps') renderMindMapUI(mindMapEngine.activeMap || mindMapEngine.mapsDb[0]);
    if (viewName === 'question-generator') questionGeneratorEngine.renderView();
    if (viewName === 'jurisprudence') jurisprudenceHubEngine.renderHub();
    if (viewName === 'doctrine-library') doctrineLibraryEngine.renderLibraryView();
    if (viewName === 'legal-pieces') legalPieceEngine.renderStudio();
    if (viewName === 'deadlines') deadlineStudioEngine.renderStudio();
    if (viewName === 'commented-laws') commentedLawEngine.renderStation();
    if (viewName === 'exam-revision') examRevisionHubEngine.renderHub();
    if (viewName === 'academic-research') academicThesisStudioEngine.renderStudio();
    if (viewName === 'discursive-exams') discursiveExamStudioEngine.renderStudio();
    if (viewName === 'study-rooms') studyRoomEngine.renderStudio();
    if (viewName === 'academic-plan-import') academicPlanImportEngine.renderStudio();
    if (viewName === 'today') todayEngine.renderTodayView();
    if (viewName === 'plans') premiumEngine.renderPlansView();
    if (viewName === 'brain') legalBrainEngine.executeUnifiedSearch('Legítima defesa');
    if (viewName === 'classroom') classroomEngine.renderClassroomHub();
    if (viewName === 'research') researchEngine.renderResearchHub();
    if (viewName === 'practice') legalPracticeEngine.renderPracticeHub();
    if (viewName === 'evolution') evolutionEngine.renderEvolutionView();
    if (viewName === 'oab') oabEngine.renderOabHub(oabEngine.activeOabTab);
    if (viewName === 'tutor') tutorEngine.renderTutorView();
    if (viewName === 'materials') materialsEngine.renderMaterialsHub();
    if (viewName === 'faculty') facultyEngine.renderFacultyHub(facultyEngine.activeFacultyTab);
    if (viewName === 'vademecum') vadeEngine.renderHub(vadeEngine.activeTab);
    if (viewName === 'playlists') studyManager.renderPlaylistsView();
    if (viewName === 'flashcards') smartFlashcardEngine.renderFlashcardsView();
    if (viewName === 'favorites') renderFavoritesView();
    if (viewName === 'srs') studyManager.renderSrsView();
    if (viewName === 'analytics') studyManager.renderAnalyticsView();
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  function renderFavoritesView() {
    const favIds = StorageModule.getFavorites();
    const favArticles = VADE_MECUM_DB.articles.filter(a => favIds.includes(a.id));
    const favContainer = document.getElementById('favorites-list');
    renderArticles(favArticles, favContainer);
  }

  function updateFavBadge() {
    if (favCountBadge) {
      favCountBadge.innerText = StorageModule.getFavorites().length;
    }
  }

  function updateSrsBadge() {
    const srsDue = StorageModule.getSrsDueItems().length;
    const badge = document.getElementById('srs-count');
    if (badge) {
      badge.innerText = srsDue;
      badge.classList.toggle('hidden', srsDue === 0);
    }
  }

  // Play Favorites Button
  document.getElementById('btn-play-favorites')?.addEventListener('click', () => {
    const favIds = StorageModule.getFavorites();
    const favArticles = VADE_MECUM_DB.articles.filter(a => favIds.includes(a.id));
    if (favArticles.length > 0) {
      audioEngine.speakArticle(favArticles[0]);
    } else {
      alert('Você ainda não salvou nenhum artigo nos favoritos.');
    }
  });

  // ------------------------------------------------------------------------
  // Keyboard Shortcuts (Space bar Play/Pause)
  // ------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      audioEngine.togglePlayPause();
    }
  });

  // Expose App helper for Prev/Next navigation
  window.VadeAudioApp = {
    audioEngine,
    playerUI,
    studyManager,
    vadeEngine,
    facultyEngine,
    tutorEngine,
    speechService,
    materialsEngine,
    docProcessor,
    oabEngine,
    legalBrainEngine,
    classroomEngine,
    transcriptionService,
    researchEngine,
    legalPracticeEngine,
    progressionService,
    evolutionEngine,
    dailyPlannerService,
    todayEngine,
    entitlementService,
    premiumEngine,
    authService,
    securityService: SecurityService,
    playPrevArticle() {
      const activeLaw = (audioEngine.currentArticle && (audioEngine.currentArticle.law_id || audioEngine.currentArticle.lawId)) || currentLawId;
      const list = VADE_MECUM_DB.articles.filter(a => (a.law_id === activeLaw || a.lawId === activeLaw));
      if (list.length === 0) return;
      if (!audioEngine.currentArticle) {
        audioEngine.speakArticle(list[0]);
        return;
      }
      const idx = list.findIndex(a => a.id === audioEngine.currentArticle.id || String(a.article) === String(audioEngine.currentArticle.article));
      if (idx > 0) {
        const prevArt = list[idx - 1];
        audioEngine.speakArticle(prevArt);
        const card = document.querySelector(`.article-card[data-id="${prevArt.id}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.Toast?.info('Você já está no primeiro artigo deste capítulo/lei.');
      }
    },
    playNextArticle() {
      const activeLaw = (audioEngine.currentArticle && (audioEngine.currentArticle.law_id || audioEngine.currentArticle.lawId)) || currentLawId;
      const list = VADE_MECUM_DB.articles.filter(a => (a.law_id === activeLaw || a.lawId === activeLaw));
      if (list.length === 0) return;
      if (!audioEngine.currentArticle) {
        audioEngine.speakArticle(list[0]);
        return;
      }
      const idx = list.findIndex(a => a.id === audioEngine.currentArticle.id || String(a.article) === String(audioEngine.currentArticle.article));
      if (idx >= 0 && idx < list.length - 1) {
        const nextArt = list[idx + 1];
        audioEngine.speakArticle(nextArt);
        const card = document.querySelector(`.article-card[data-id="${nextArt.id}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (idx >= list.length - 1) {
        window.Toast?.info('Você chegou ao último artigo desta lei/capítulo.');
      }
    }
  };

  // ------------------------------------------------------------------------
  // ETAPA 14: INTEGRAÇÃO DE SEGURANÇA, AUTH, LGPD & PRIVACIDADE
  // ------------------------------------------------------------------------

  // 1. Atualizar Header com Dados do Usuário
  function updateUserHeaderUI(user) {
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const sessionInfoEl = document.getElementById('auth-current-session-info');

    if (!user) {
      if (nameEl) nameEl.innerText = 'Entrar / Cadastro';
      if (roleEl) roleEl.innerText = '🔒 Desconectado';
      if (sessionInfoEl) sessionInfoEl.innerText = 'Não conectado';
      return;
    }

    if (nameEl) nameEl.innerText = user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1] || '');
    if (sessionInfoEl) sessionInfoEl.innerText = `Conectado como: ${user.name} (${user.email})`;

    if (roleEl) {
      if (user.role === 'admin') {
        roleEl.innerHTML = '<span style="color:#ef4444;"><i class="fa-solid fa-shield"></i> Admin</span>';
      } else if (user.plan === 'pro_monthly' || user.plan === 'pro_yearly') {
        roleEl.innerHTML = '<span style="color:var(--accent-amber);"><i class="fa-solid fa-crown"></i> Assinante Pro</span>';
      } else {
        roleEl.innerHTML = '<span style="color:#38bdf8;"><i class="fa-solid fa-graduation-cap"></i> Aluno Gratuito</span>';
      }
    }
  }

  authService.onAuthChange(user => {
    updateUserHeaderUI(user);
    if (!user) {
      authModal?.classList.remove('hidden');
      if (btnCloseAuthModal) btnCloseAuthModal.style.display = 'none';
    } else {
      if (btnCloseAuthModal) btnCloseAuthModal.style.display = 'block';
    }
  });

  // 2. Modais de Auth & Perfil
  const authModal = document.getElementById('auth-modal');
  const btnUserProfile = document.getElementById('btn-user-profile');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');

  // Controle de Abas do Modal de Auth (Entrar / Cadastrar / Demo)
  const tabBtnLogin = document.getElementById('tab-btn-auth-login');
  const tabBtnRegister = document.getElementById('tab-btn-auth-register');
  const tabBtnDemo = document.getElementById('tab-btn-auth-demo');
  const panelLogin = document.getElementById('auth-tab-panel-login');
  const panelRegister = document.getElementById('auth-tab-panel-register');
  const panelDemo = document.getElementById('auth-tab-panel-demo');

  function switchAuthTab(tab) {
    [tabBtnLogin, tabBtnRegister, tabBtnDemo].forEach(btn => {
      if (btn) {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-muted)';
      }
    });
    [panelLogin, panelRegister, panelDemo].forEach(p => p?.classList.add('hidden'));

    if (tab === 'login') {
      tabBtnLogin?.classList.add('active');
      if (tabBtnLogin) {
        tabBtnLogin.style.background = 'var(--bg-surface-elevated)';
        tabBtnLogin.style.color = 'var(--text-main)';
      }
      panelLogin?.classList.remove('hidden');
    } else if (tab === 'register') {
      tabBtnRegister?.classList.add('active');
      if (tabBtnRegister) {
        tabBtnRegister.style.background = 'var(--bg-surface-elevated)';
        tabBtnRegister.style.color = 'var(--text-main)';
      }
      panelRegister?.classList.remove('hidden');
    } else if (tab === 'demo') {
      tabBtnDemo?.classList.add('active');
      if (tabBtnDemo) {
        tabBtnDemo.style.background = 'var(--bg-surface-elevated)';
        tabBtnDemo.style.color = 'var(--text-main)';
      }
      panelDemo?.classList.remove('hidden');
    }
  }

  tabBtnLogin?.addEventListener('click', () => switchAuthTab('login'));
  tabBtnRegister?.addEventListener('click', () => switchAuthTab('register'));
  tabBtnDemo?.addEventListener('click', () => switchAuthTab('demo'));

  btnUserProfile?.addEventListener('click', () => {
    authModal?.classList.remove('hidden');
  });

  btnCloseAuthModal?.addEventListener('click', () => {
    if (authService.isAuthenticated()) {
      authModal?.classList.add('hidden');
    } else {
      alert('Por favor, faça login, crie sua conta ou selecione um perfil demo para continuar.');
    }
  });

  // Verificação no Início: Se não autenticado, abre a tela de Login/Cadastro
  if (!authService.isAuthenticated()) {
    authModal?.classList.remove('hidden');
    if (btnCloseAuthModal) btnCloseAuthModal.style.display = 'none';
  } else {
    updateUserHeaderUI(authService.getCurrentUser());
  }

  // Alternador Rápido de Contas Demo (Lucas, Mariana, Renata Admin)
  document.querySelectorAll('.btn-demo-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.getAttribute('data-user-id');
      const newUser = authService.switchDemoUser(uid);
      if (newUser) {
        authModal?.classList.add('hidden');
        alert(`Bem-vindo, ${newUser.name}!\n\nConectado como: ${newUser.role.toUpperCase()}`);
        window.location.reload();
      }
    });
  });

  // Login Submit
  document.getElementById('btn-auth-submit-login')?.addEventListener('click', async () => {
    const email = document.getElementById('auth-input-email')?.value.trim();
    const password = document.getElementById('auth-input-password')?.value;
    if (!email || !password) {
      alert('Por favor, preencha email e senha.');
      return;
    }
    try {
      await authService.login(email, password);
      authModal?.classList.add('hidden');
      alert(`Login realizado com sucesso! Bem-vindo de volta.`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Falha no login.');
    }
  });

  // Cadastro Submit
  document.getElementById('btn-auth-submit-register')?.addEventListener('click', async () => {
    const name = document.getElementById('reg-input-name')?.value.trim();
    const email = document.getElementById('reg-input-email')?.value.trim();
    const password = document.getElementById('reg-input-password')?.value;
    const focus = document.getElementById('reg-select-focus')?.value;

    if (!name || !email || !password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (password.length < 6) {
      alert('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    try {
      const res = await authService.register(name, email, password);
      authModal?.classList.add('hidden');
      alert(`Conta criada com sucesso! Bem-vindo ao VadeAudio AI, ${name}!`);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Erro ao criar conta.');
    }
  });

  document.getElementById('btn-auth-forgot-password')?.addEventListener('click', async () => {
    const email = prompt('Digite seu email cadastrado para receber o link temporário de redefinição de senha (válido por 15 minutos):');
    if (email) {
      const res = await authService.forgotPassword(email);
      alert(res.message);
    }
  });

  document.getElementById('btn-auth-logout')?.addEventListener('click', () => {
    if (confirm('Deseja realmente encerrar sua sessão?')) {
      authService.logout();
      alert('Sessão encerrada com sucesso.');
      window.location.reload();
    }
  });

  // 3. Central de Privacidade & LGPD Modal
  const privacyHubModal = document.getElementById('privacy-hub-modal');
  const btnOpenPrivacyHub = document.getElementById('btn-open-privacy-hub');
  const btnClosePrivacyHub = document.getElementById('btn-close-privacy-hub-modal');

  function renderActiveSessions() {
    const container = document.getElementById('active-sessions-list');
    if (!container) return;
    const sessions = authService.getActiveSessions();
    container.innerHTML = sessions.map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:10px; font-size:0.8rem;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong>${s.device}</strong>
            ${s.isCurrent ? '<span class="badge-new" style="background:#10b981; color:#fff; font-size:0.65rem;">Sessão Atual</span>' : ''}
          </div>
          <span style="color:var(--text-muted); font-size:0.72rem; display:block;">IP: ${s.ip} • Atividade: ${new Date(s.lastActive).toLocaleDateString()} ${new Date(s.lastActive).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        ${!s.isCurrent ? `<button class="btn-secondary btn-revoke-session" data-sess-id="${s.sessionId}" style="font-size:0.7rem; color:#ef4444; padding:4px 8px;"><i class="fa-solid fa-xmark"></i> Encerrar</button>` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.btn-revoke-session').forEach(b => {
      b.addEventListener('click', () => {
        const sid = b.getAttribute('data-sess-id');
        authService.revokeSession(sid);
        renderActiveSessions();
      });
    });
  }

  btnOpenPrivacyHub?.addEventListener('click', () => {
    renderActiveSessions();
    // Carregar consentimentos
    const c = SecurityService.getConsents();
    if (document.getElementById('consent-mic')) document.getElementById('consent-mic').checked = !!c.microphoneRecording;
    if (document.getElementById('consent-push')) document.getElementById('consent-push').checked = !!c.pushNotifications;
    if (document.getElementById('consent-analytics')) document.getElementById('consent-analytics').checked = !!c.anonymousAnalytics;
    
    privacyHubModal?.classList.remove('hidden');
  });

  btnClosePrivacyHub?.addEventListener('click', () => {
    privacyHubModal?.classList.add('hidden');
  });

  document.getElementById('btn-revoke-all-sessions')?.addEventListener('click', () => {
    if (confirm('Deseja encerrar todas as outras sessões ativas em outros dispositivos?')) {
      authService.revokeAllOtherSessions();
      renderActiveSessions();
      alert('Todas as outras sessões foram desconectadas.');
    }
  });

  // Salvar consentimentos
  ['consent-mic', 'consent-push', 'consent-analytics'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      SecurityService.saveConsents({
        microphoneRecording: document.getElementById('consent-mic')?.checked,
        pushNotifications: document.getElementById('consent-push')?.checked,
        anonymousAnalytics: document.getElementById('consent-analytics')?.checked
      });
    });
  });

  // 4. Exportar Dados do Estudante (LGPD Art. 18)
  document.getElementById('btn-export-my-data')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-my-data');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparando Arquivo...';
    try {
      await SecurityService.exportStudentData(authService.getCurrentUser());
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Exportação Concluída!';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-download"></i> Baixar Meus Dados (LGPD)';
      }, 3000);
    } catch (e) {
      alert('Erro ao exportar dados.');
      btn.innerHTML = '<i class="fa-solid fa-download"></i> Baixar Meus Dados (LGPD)';
    }
  });

  // 5. Excluir Conta Definitivamente (LGPD)
  const deleteAccountModal = document.getElementById('delete-account-confirm-modal');
  const inputDeletePhrase = document.getElementById('input-confirm-delete-phrase');
  const btnConfirmDeleteExec = document.getElementById('btn-confirm-delete-account-execute');

  document.getElementById('btn-open-delete-account-modal')?.addEventListener('click', () => {
    if (inputDeletePhrase) inputDeletePhrase.value = '';
    if (btnConfirmDeleteExec) btnConfirmDeleteExec.disabled = true;
    deleteAccountModal?.classList.remove('hidden');
  });

  document.getElementById('btn-cancel-delete-account')?.addEventListener('click', () => {
    deleteAccountModal?.classList.add('hidden');
  });

  inputDeletePhrase?.addEventListener('input', (e) => {
    if (btnConfirmDeleteExec) {
      btnConfirmDeleteExec.disabled = e.target.value.trim().toUpperCase() !== 'EXCLUIR';
    }
  });

  btnConfirmDeleteExec?.addEventListener('click', async () => {
    btnConfirmDeleteExec.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Apagando Tudo...';
    btnConfirmDeleteExec.disabled = true;
    await SecurityService.deleteStudentAccountCascade(authService.getCurrentUser());
    alert('Sua conta e todos os seus dados acadêmicos foram permanentemente apagados dos nossos servidores.');
    window.location.reload();
  });

  // 6. Painel de Administração & Métricas & Incidentes
  const adminModal = document.getElementById('admin-dashboard-modal');
  const btnOpenAdminDash = document.getElementById('btn-open-admin-dash');
  const btnCloseAdminModal = document.getElementById('btn-close-admin-modal');

  btnOpenAdminDash?.addEventListener('click', async () => {
    if (!authService.isAdmin()) {
      alert('🔒 ACESSO RESTRITO: Apenas administradores e a coordenação acadêmica podem acessar esta área.\n\nPara testar as funções de administração, selecione o usuário "Dra. Renata (Coordenação Admin)" no menu de perfil.');
      return;
    }

    adminModal?.classList.remove('hidden');

    // Carregar incidentes reais do backend
    try {
      const res = await fetch('/api/admin/incidents', {
        headers: { 'Authorization': `Bearer ${authService.getCurrentUser().token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const incContainer = document.getElementById('admin-incidents-container');
        if (incContainer) {
          if (data.incidents && data.incidents.length > 0) {
            incContainer.innerHTML = data.incidents.map(i => `
              <div style="margin-bottom:4px; color:#f59e0b;">
                <strong>[${i.type}]</strong> (${i.service}) ${i.details} - <em>${new Date(i.timestamp).toLocaleTimeString()}</em>
              </div>
            `).join('');
          } else {
            incContainer.innerHTML = '<div style="color:#10b981;">[OK] Todos os serviços (ElevenLabs, STT, Auth, Database, Storage) operando com 100% de integridade e 0 incidentes.</div>';
          }
        }
      }
    } catch (e) {}
  });

  btnCloseAdminModal?.addEventListener('click', () => {
    adminModal?.classList.add('hidden');
  });

  // Backup Manual
  document.getElementById('btn-admin-generate-backup')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { 'Authorization': `Bearer ${authService.getCurrentUser().token}` }
      });
      if (!res.ok) throw new Error('Falha ao gerar backup.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vadeaudio_backup_snapshot_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Snapshot de backup do banco e usuários gerado com sucesso!');
    } catch (e) {
      alert('Falha ao gerar backup: ' + e.message);
    }
  });

  // Toggle Modo Manutenção
  let maintenanceState = false;
  document.getElementById('btn-admin-toggle-maintenance')?.addEventListener('click', async () => {
    maintenanceState = !maintenanceState;
    try {
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getCurrentUser().token}`
        },
        body: JSON.stringify({ enabled: maintenanceState })
      });
      alert(`Modo Manutenção agora está: ${maintenanceState ? 'ATIVADO' : 'DESATIVADO'}`);
    } catch (e) {
      alert('Modo Manutenção alterado.');
    }
  });

  // 7. Modais de Termos de Uso, Privacidade e Cookies
  const termsModal = document.getElementById('terms-modal');
  const privacyPolicyModal = document.getElementById('privacy-policy-modal');
  const cookiePolicyModal = document.getElementById('cookie-policy-modal');

  document.getElementById('link-open-terms')?.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-terms-modal')?.addEventListener('click', () => {
    termsModal?.classList.add('hidden');
  });

  document.getElementById('link-open-privacy')?.addEventListener('click', (e) => {
    e.preventDefault();
    privacyPolicyModal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-privacy-policy-modal')?.addEventListener('click', () => {
    privacyPolicyModal?.classList.add('hidden');
  });

  document.getElementById('link-open-cookies')?.addEventListener('click', (e) => {
    e.preventDefault();
    cookiePolicyModal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-cookie-policy-modal')?.addEventListener('click', () => {
    cookiePolicyModal?.classList.add('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 15: ONBOARDING, COMMAND PALETTE, LANDING, FEEDBACK & MOBILE
  // ------------------------------------------------------------------------

  // 1. Motor de Onboarding
  const onboardingEngine = new OnboardingEngine(audioEngine);
  window.onboardingEngine = onboardingEngine;

  document.getElementById('btn-onboard-prev')?.addEventListener('click', () => onboardingEngine.prevStep());
  document.getElementById('btn-onboard-next')?.addEventListener('click', () => onboardingEngine.nextStep());
  document.getElementById('btn-skip-onboarding')?.addEventListener('click', () => {
    onboardingEngine.closeOnboarding();
    window.Toast.info('Você pulou o onboarding inicial. Acesse a aba Faculdade quando desejar personalizar.');
  });

  // Se for o primeiro acesso do usuário, abrir onboarding
  if (!onboardingEngine.isCompleted()) {
    setTimeout(() => {
      onboardingEngine.startOnboarding();
    }, 600);
  }

  // 2. Command Palette (Ctrl+K / Cmd+K)
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdInput = document.getElementById('cmd-palette-input');
  const cmdResults = document.getElementById('cmd-palette-results');

  const cmdCommands = [
    { title: 'Art. 5º da CF/88 — Direitos e Garantias Fundamentais', category: 'Constituição Federal', action: () => { switchLaw('cf88'); document.querySelector('[data-view=reader]')?.click(); } },
    { title: 'Art. 121 do CP — Homicídio Simples e Qualificado', category: 'Código Penal', action: () => { switchLaw('cp'); document.querySelector('[data-view=reader]')?.click(); } },
    { title: 'Art. 319 do CPC — Requisitos da Petição Inicial', category: 'Processo Civil', action: () => { switchLaw('cpc'); document.querySelector('[data-view=reader]')?.click(); } },
    { title: 'Perguntar ao Tutor Jurídico IA', category: 'Tutor IA', action: () => { document.querySelector('[data-view=tutor]')?.click(); } },
    { title: 'Iniciar Simulado & Flashcards de Áudio', category: 'Simulado', action: () => { document.querySelector('[data-view=flashcards]')?.click(); } },
    { title: 'Abrir Minha Grade da Faculdade', category: 'Faculdade', action: () => { document.querySelector('[data-view=faculty]')?.click(); } },
    { title: 'Verificar Minhas Metas de Hoje', category: 'Hoje', action: () => { document.querySelector('[data-view=today]')?.click(); } },
    { title: 'Explorar Cérebro Jurídico (RAG)', category: 'Pesquisa', action: () => { document.querySelector('[data-view=brain]')?.click(); } },
    { title: 'Central de Privacidade & LGPD', category: 'Segurança', action: () => { document.getElementById('btn-open-privacy-hub')?.click(); } }
  ];

  function renderCmdResults(query = '') {
    if (!cmdResults) return;
    const q = query.toLowerCase().trim();
    const filtered = q ? cmdCommands.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) : cmdCommands;

    if (filtered.length === 0) {
      cmdResults.innerHTML = '<div style="padding:14px; text-align:center; color:var(--text-muted); font-size:0.85rem;">Nenhum comando ou artigo encontrado. Tente buscar por "CF", "Penal", "Tutor" ou "Flashcards".</div>';
      return;
    }

    cmdResults.innerHTML = filtered.map((c, i) => `
      <div class="cmd-result-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
        <div>
          <strong style="display:block; font-size:0.85rem;">${c.title}</strong>
          <span style="font-size:0.72rem; color:var(--accent-amber);">${c.category}</span>
        </div>
        <i class="fa-solid fa-arrow-turn-down" style="font-size:0.75rem; opacity:0.4;"></i>
      </div>
    `).join('');

    cmdResults.querySelectorAll('.cmd-result-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        filtered[idx].action();
        cmdModal?.classList.add('hidden');
      });
    });
  }

  function openCommandPalette() {
    cmdModal?.classList.remove('hidden');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    renderCmdResults();
  }

  document.getElementById('btn-cmd-palette-hint')?.addEventListener('click', openCommandPalette);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal?.classList.contains('hidden')) {
        openCommandPalette();
      } else {
        cmdModal?.classList.add('hidden');
      }
    } else if (e.key === 'Escape' && !cmdModal?.classList.contains('hidden')) {
      cmdModal?.classList.add('hidden');
    }
  });

  cmdInput?.addEventListener('input', (e) => {
    renderCmdResults(e.target.value);
  });

  // 3. Landing Page Modal
  const landingModal = document.getElementById('landing-modal');
  document.getElementById('btn-open-landing')?.addEventListener('click', () => {
    landingModal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-landing-modal')?.addEventListener('click', () => {
    landingModal?.classList.add('hidden');
  });
  document.getElementById('btn-landing-cta')?.addEventListener('click', () => {
    landingModal?.classList.add('hidden');
    onboardingEngine.startOnboarding();
  });
  document.getElementById('btn-landing-play-audio')?.addEventListener('click', () => {
    const demoArt = VADE_MECUM_DB.articles[0];
    audioEngine.speakArticle(demoArt);
    window.Toast.success('Reproduzindo demonstração com voz neural ElevenLabs (Marcos).');
  });

  // 4. Central de Ajuda, Suporte & Feedback
  const helpModal = document.getElementById('help-feedback-modal');
  const btnOpenHelp = document.getElementById('btn-open-help');
  const btnOpenHelpSide = document.getElementById('btn-open-help-side');
  const btnCloseHelp = document.getElementById('btn-close-help-modal');

  const openHelpModal = () => helpModal?.classList.remove('hidden');
  btnOpenHelp?.addEventListener('click', openHelpModal);
  btnOpenHelpSide?.addEventListener('click', openHelpModal);
  btnCloseHelp?.addEventListener('click', () => helpModal?.classList.add('hidden'));

  document.getElementById('btn-submit-feedback')?.addEventListener('click', () => {
    const details = document.getElementById('feedback-details')?.value.trim();
    if (!details) {
      window.Toast.warning('Por favor, descreva sua mensagem antes de enviar.');
      return;
    }
    const type = document.getElementById('feedback-type')?.value;
    window.Toast.success('Obrigado pelo seu feedback! Nossa equipe acadêmica analisará com prioridade.');
    if (document.getElementById('feedback-details')) document.getElementById('feedback-details').value = '';
    helpModal?.classList.add('hidden');
  });

  // 5. Mobile Bottom Navigation
  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (view) {
        document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        studyManager.switchView(view);
      } else if (btn.id === 'btn-mobile-more-menu') {
        openCommandPalette();
      }
    });
  });

  // 6. Global Mini Player Synchronization
  const miniPlayer = document.getElementById('global-mini-player');
  const miniPlayerArt = document.getElementById('mini-player-art');
  const miniPlayerLaw = document.getElementById('mini-player-law');
  const miniBtnPlay = document.getElementById('mini-btn-play');
  const miniBtnClose = document.getElementById('mini-btn-close');

  audioEngine.onPlaybackChange((state) => {
    if (!miniPlayer) return;
    if (state.isPlaying && state.article) {
      miniPlayer.classList.remove('hidden');
      if (miniPlayerArt) miniPlayerArt.innerText = state.article.number;
      if (miniPlayerLaw) miniPlayerLaw.innerText = state.article.heading;
      if (miniBtnPlay) miniBtnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      if (miniBtnPlay) miniBtnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  });

  miniBtnPlay?.addEventListener('click', () => {
    audioEngine.togglePlayPause();
  });

  miniBtnClose?.addEventListener('click', () => {
    miniPlayer?.classList.add('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 16: PROFESSORES, TURMAS, INSTITUIÇÕES & REFERRAL
  // ------------------------------------------------------------------------
  const teacherEngine = new TeacherEngine(authService);
  const institutionEngine = new InstitutionEngine(authService);
  window.teacherEngine = teacherEngine;
  window.institutionEngine = institutionEngine;

  // 1. Painel do Professor
  const createClassModal = document.getElementById('create-class-modal');
  const btnOpenCreateClass = document.getElementById('btn-open-create-class-modal');
  const btnCloseCreateClass = document.getElementById('btn-close-create-class-modal');

  btnOpenCreateClass?.addEventListener('click', () => {
    if (!authService.isTeacher() && !authService.isAdmin()) {
      window.Toast.warning('🔒 ACESSO RESTRITO: Apenas professores podem criar turmas. Use o perfil "Prof. Dr. Roberto" no menu da conta.');
      return;
    }
    createClassModal?.classList.remove('hidden');
  });

  btnCloseCreateClass?.addEventListener('click', () => {
    createClassModal?.classList.add('hidden');
  });

  document.getElementById('btn-submit-create-class')?.addEventListener('click', () => {
    const name = document.getElementById('input-class-name')?.value.trim();
    const subject = document.getElementById('input-class-subject')?.value.trim();
    const semester = document.getElementById('input-class-semester')?.value.trim();
    const institution = document.getElementById('input-class-institution')?.value.trim();
    const inviteCode = document.getElementById('input-class-invite-code')?.value.trim();

    if (!name || !subject) {
      window.Toast.warning('Por favor, preencha o nome da turma e a disciplina.');
      return;
    }

    try {
      const created = teacherEngine.createClass({ name, subject, semester, institution, inviteCode });
      createClassModal?.classList.add('hidden');
      window.Toast.success(`Turma "${created.name}" criada com sucesso! Código: ${created.inviteCode}`);
      teacherEngine.renderTeacherDashboard();
    } catch (e) {
      window.Toast.error(e.message);
    }
  });

  // 2. Entrar na Turma (Aluno)
  const joinClassModal = document.getElementById('join-class-modal');
  const btnOpenJoinClassNav = document.getElementById('btn-open-join-class-nav');
  const btnCloseJoinClass = document.getElementById('btn-close-join-class-modal');

  btnOpenJoinClassNav?.addEventListener('click', () => {
    joinClassModal?.classList.remove('hidden');
  });

  btnCloseJoinClass?.addEventListener('click', () => {
    joinClassModal?.classList.add('hidden');
  });

  document.getElementById('btn-submit-join-class')?.addEventListener('click', () => {
    const code = document.getElementById('input-join-class-code')?.value.trim();
    if (!code) {
      window.Toast.warning('Digite o código de convite fornecido pelo professor.');
      return;
    }

    const classes = teacherEngine.getClasses();
    const target = classes.find(c => c.inviteCode.toUpperCase() === code.toUpperCase());

    if (target) {
      target.membersCount = (target.membersCount || 0) + 1;
      teacherEngine.saveClass(target);
      joinClassModal?.classList.add('hidden');
      window.Toast.success(`Matrícula confirmada na turma: ${target.name} (${target.institution})`);
    } else {
      window.Toast.error('Código de turma não encontrado. Verifique com seu professor.');
    }
  });

  // 3. Modais Institucional, Referral e Analytics
  const institutionModal = document.getElementById('institution-modal');
  const btnOpenInstitutionNav = document.getElementById('btn-open-institution-nav');
  const btnCloseInstitution = document.getElementById('btn-close-institution-modal');

  btnOpenInstitutionNav?.addEventListener('click', () => institutionModal?.classList.remove('hidden'));
  btnCloseInstitution?.addEventListener('click', () => institutionModal?.classList.add('hidden'));

  const referralModal = document.getElementById('referral-modal');
  const btnOpenReferralNav = document.getElementById('btn-open-referral-nav');
  const btnCloseReferral = document.getElementById('btn-close-referral-modal');
  const referralCodeDisplay = document.getElementById('referral-my-code');

  btnOpenReferralNav?.addEventListener('click', () => {
    const data = institutionEngine.getReferralData();
    if (referralCodeDisplay) referralCodeDisplay.innerText = data.referralCode;
    referralModal?.classList.remove('hidden');
  });
  btnCloseReferral?.addEventListener('click', () => referralModal?.classList.add('hidden'));

  document.getElementById('btn-copy-referral-code')?.addEventListener('click', () => {
    const code = referralCodeDisplay?.innerText || 'VADE-2026';
    navigator.clipboard?.writeText(code);
    window.Toast.success('Código de indicação copiado para a área de transferência!');
  });

  document.getElementById('btn-submit-claim-referral')?.addEventListener('click', () => {
    const input = document.getElementById('input-claim-referral');
    try {
      const res = institutionEngine.claimInviteCode(input?.value);
      window.Toast.success(res.message);
      if (input) input.value = '';
    } catch (e) {
      window.Toast.error(e.message);
    }
  });

  document.getElementById('btn-close-class-analytics-modal')?.addEventListener('click', () => {
    document.getElementById('class-analytics-modal')?.classList.add('hidden');
  });

  // Assistente IA do Professor
  document.getElementById('btn-teacher-ai-assistant')?.addEventListener('click', async () => {
    window.Toast.info('Gerando rascunho de questão com o Assistente IA...');
    const draft = await teacherEngine.generateAiQuestionDraft({
      topic: 'Homicídio Qualificado e Motivo Torpe',
      subject: 'Direito Penal'
    });
    alert(`🤖 RASCUNHO GERADO PELA IA (REVISÃO OBRIGATÓRIA):\n\nENUNCIADO:\n${draft.stem}\n\nRESPOSTA CORRETA:\n${draft.options[draft.correctIndex]}\n\nFUNDAMENTAÇÃO:\n${draft.explanation}\n\nStatus: Rascunho pronto para edição e publicação pelo professor.`);
  });

  // ------------------------------------------------------------------------
  // ETAPA 17: INTELIGÊNCIA ACADÊMICA & PRODUCT ANALYTICS
  // ------------------------------------------------------------------------
  const academicAnalyticsEngine = new AcademicAnalyticsEngine(authService);
  const academicInsightService = new AcademicInsightService(academicAnalyticsEngine);
  const recommendationEngine = new RecommendationEngine(academicAnalyticsEngine, academicInsightService);
  const productAnalyticsService = new ProductAnalyticsService(authService);
  const experimentService = new ExperimentService(authService);

  window.academicAnalyticsEngine = academicAnalyticsEngine;
  window.academicInsightService = academicInsightService;
  window.recommendationEngine = recommendationEngine;
  window.productAnalyticsService = productAnalyticsService;
  window.experimentService = experimentService;

  function renderAcademicIntelView() {
    const analytics = academicAnalyticsEngine.getAcademicAnalytics();
    const insights = academicInsightService.generateDeterministicInsights();

    // 1. KPI Cards
    const masteryEl = document.getElementById('intel-kpi-mastery');
    const confEl = document.getElementById('intel-kpi-confidence');
    const hoursEl = document.getElementById('intel-kpi-hours');
    const accEl = document.getElementById('intel-kpi-accuracy');
    const qCountEl = document.getElementById('intel-kpi-questions');
    const examNameEl = document.getElementById('intel-kpi-exam-name');
    const examStatusEl = document.getElementById('intel-kpi-exam-status');

    if (masteryEl) masteryEl.innerText = `${analytics.overallMastery.score}%`;
    if (confEl) {
      confEl.innerText = analytics.overallMastery.confidence === 'high' ? 'ALTA CONFIANÇA' : (analytics.overallMastery.confidence === 'medium' ? 'MÉDIA CONFIANÇA' : 'BAIXA AMOSTRA');
      confEl.style.color = analytics.overallMastery.confidence === 'high' ? '#10b981' : (analytics.overallMastery.confidence === 'medium' ? 'var(--accent-amber)' : '#ef4444');
    }
    if (hoursEl) hoursEl.innerText = analytics.studyTime.totalHoursFormatted;
    if (accEl) accEl.innerText = `${analytics.questions.accuracyPercent}%`;
    if (qCountEl) qCountEl.innerText = `${analytics.questions.total} questões resolvidas`;

    const topExam = analytics.examReadiness && analytics.examReadiness[0];
    if (topExam) {
      if (examNameEl) examNameEl.innerText = topExam.name;
      if (examStatusEl) examStatusEl.innerText = `Em ${topExam.daysUntil} dias — ${topExam.levelText}`;
    }

    // 2. Insights List
    const insightsListEl = document.getElementById('intel-insights-list');
    if (insightsListEl) {
      if (insights.length === 0) {
        insightsListEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted);">Continue estudando para desbloquear diagnósticos personalizados da IA.</div>';
      } else {
        insightsListEl.innerHTML = insights.map(i => `
          <div style="background:rgba(255,255,255,0.02); border-left:3px solid ${i.color}; border-radius:0 8px 8px 0; padding:10px 14px; font-size:0.82rem;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <i class="fa-solid ${i.icon}" style="color:${i.color};"></i>
              <strong style="color:var(--text-main);">${i.title}</strong>
              <span class="badge-new" style="font-size:0.65rem; margin-left:auto;">${i.category}</span>
            </div>
            <p style="color:var(--text-muted); margin:0; line-height:1.4;">${i.description}</p>
          </div>
        `).join('');
      }
    }

    // 3. Domínio por Disciplina (Barras)
    const subjectsBarsEl = document.getElementById('intel-subjects-bars');
    if (subjectsBarsEl) {
      subjectsBarsEl.innerHTML = analytics.subjectMastery.map(s => `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; margin-bottom:4px;">
            <span style="color:var(--text-main); font-weight:600;">${s.subject}</span>
            <span style="color:${s.score >= 70 ? '#10b981' : (s.score >= 55 ? 'var(--accent-amber)' : '#ef4444')}; font-weight:700;">${s.score}%</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:6px; overflow:hidden;">
            <div style="width:${s.score}%; height:100%; background:${s.score >= 70 ? '#10b981' : (s.score >= 55 ? 'var(--accent-amber)' : '#ef4444')}; border-radius:6px;"></div>
          </div>
        </div>
      `).join('');
    }

    // 4. Evolução
    const evolutionChartEl = document.getElementById('intel-evolution-chart');
    if (evolutionChartEl) {
      evolutionChartEl.innerHTML = (analytics.evolution || []).map(e => `
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-main);">${e.score}%</span>
          <div style="width:24px; height:${e.score}px; background:linear-gradient(to top, var(--accent-amber), #10b981); border-radius:4px 4px 0 0;"></div>
          <span style="font-size:0.7rem; color:var(--text-muted);">${e.month}</span>
        </div>
      `).join('');
    }

    // 5. Caderno de Erros
    const errorsListEl = document.getElementById('intel-errors-list');
    if (errorsListEl) {
      if (analytics.recurrentErrors.length === 0) {
        errorsListEl.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted);">Nenhum erro crítico registrado recentemente. Excelente!</span>';
      } else {
        errorsListEl.innerHTML = analytics.recurrentErrors.map(e => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:8px 12px; font-size:0.8rem;">
            <span style="color:var(--text-main); font-weight:600;">${e.topic}</span>
            <span style="color:#ef4444; font-weight:700; font-size:0.75rem; background:rgba(239,68,68,0.15); padding:2px 6px; border-radius:4px;">${e.count} erros</span>
          </div>
        `).join('');
      }
    }

    // 6. Risco de Esquecimento (SRS)
    const retentionListEl = document.getElementById('intel-retention-list');
    if (retentionListEl) {
      retentionListEl.innerHTML = (analytics.retentionRisks || []).slice(0, 3).map(r => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; font-size:0.8rem;">
          <div>
            <strong style="color:var(--text-main); font-size:0.82rem; display:block;">${r.topic}</strong>
            <span style="font-size:0.7rem; color:var(--text-muted);">Sem revisão há ${r.daysSinceReview} dias</span>
          </div>
          <span style="color:${r.riskLevel === 'high' ? '#ef4444' : 'var(--accent-amber)'}; font-weight:700; font-size:0.85rem;">${r.retentionPercent}%</span>
        </div>
      `).join('');
    }
  }

  // Filtros de Período
  document.querySelectorAll('.btn-period-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-period-filter').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.style.fontWeight = 'normal';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--accent-amber)';
      btn.style.color = '#000';
      btn.style.fontWeight = '700';

      const period = btn.getAttribute('data-period');
      academicAnalyticsEngine.setPeriod(period);
      renderAcademicIntelView();
      window.Toast.info(`Diagnóstico recalculado para o período: ${btn.innerText}`);
    });
  });

  // Botão Como foi calculado
  document.getElementById('btn-open-formula-modal')?.addEventListener('click', () => {
    alert(`📊 FÓRMULA DE DOMÍNIO ACADÊMICO (VADEAUDIO AI):\n\nDomínio = (0.35 × Acerto em Questões) + (0.25 × Simulados) + (0.20 × Retenção SRS) + (0.10 × Fator Recência) + (0.10 × Ponderação Dificuldade)\n\n• Confiança Amostral: calculada com base no volume estatístico de dados.\n• Sem alucinações de IA: cálculos 100% matemáticos e auditáveis.`);
  });

  // Botão Revisão de Alto Impacto
  document.getElementById('btn-start-high-impact-review')?.addEventListener('click', () => {
    productAnalyticsService.trackEvent('high_impact_review_started', { source: 'academic_intel_view' });
    window.Toast.success('Iniciando Revisão de Alto Impacto: Tutela Provisória (Art. 300 CPC)');
    document.querySelector('[data-view=flashcards]')?.click();
  });

  // ------------------------------------------------------------------------
  // ETAPA 18: PROFESSOR PARTICULAR POR VOZ EM TEMPO REAL
  // ------------------------------------------------------------------------
  const voiceProfessorEngine = new VoiceProfessorEngine(authService, audioEngine, tutorEngine, legalBrainEngine);
  window.voiceProfessorEngine = voiceProfessorEngine;

  const tabTutorChat = document.getElementById('tab-tutor-chat');
  const tabTutorVoice = document.getElementById('tab-tutor-voice');
  const tutorChatContainer = document.getElementById('tutor-chat-mode-container');
  const tutorVoiceContainer = document.getElementById('tutor-voice-realtime-container');

  tabTutorChat?.addEventListener('click', () => {
    tabTutorChat.classList.add('active');
    tabTutorVoice?.classList.remove('active');
    tutorChatContainer?.classList.remove('hidden');
    tutorVoiceContainer?.classList.add('hidden');
  });

  tabTutorVoice?.addEventListener('click', () => {
    tabTutorVoice.classList.add('active');
    tabTutorChat?.classList.remove('active');
    tutorVoiceContainer?.classList.remove('hidden');
    tutorChatContainer?.classList.add('hidden');
  });

  const btnToggleVoiceSession = document.getElementById('btn-toggle-voice-session');
  const btnVoiceInterrupt = document.getElementById('btn-voice-interrupt');
  const btnVoicePushToTalk = document.getElementById('btn-voice-push-to-talk');
  const btnVoiceMute = document.getElementById('btn-voice-mute');
  const voiceProfModeSelect = document.getElementById('voice-prof-mode-select');
  const voiceSpeedSelect = document.getElementById('voice-speed-select');
  const voiceProfStateBadge = document.getElementById('voice-prof-state-badge');
  const voiceProfAvatarWave = document.getElementById('voice-prof-avatar-wave');
  const voiceDialogueStream = document.getElementById('voice-dialogue-stream');

  let isVoiceSessionActive = false;

  btnToggleVoiceSession?.addEventListener('click', () => {
    if (!isVoiceSessionActive) {
      isVoiceSessionActive = true;
      btnToggleVoiceSession.innerHTML = '<i class="fa-solid fa-stop"></i> Encerrar Sessão de Voz';
      btnToggleVoiceSession.style.background = '#ef4444';
      btnToggleVoiceSession.style.borderColor = '#ef4444';

      const subject = document.getElementById('tutor-select-subject')?.value || 'Direito Penal';
      const mode = voiceProfModeSelect?.value || 'standard';

      voiceProfessorEngine.startSession({ subject, mode });
      window.Toast.success('Sessão de voz iniciada com o Prof. Marcos (ElevenLabs)');
    } else {
      isVoiceSessionActive = false;
      const summary = voiceProfessorEngine.endSession();
      btnToggleVoiceSession.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar Conversa por Voz';
      btnToggleVoiceSession.style.background = 'var(--accent-amber)';
      btnToggleVoiceSession.style.borderColor = 'var(--border-amber)';
      window.Toast.info(`Sessão finalizada: ${summary.durationMinutes} min estudados, ${summary.questionsCount} perguntas dialogadas.`);
    }
  });

  btnVoiceInterrupt?.addEventListener('click', () => {
    voiceProfessorEngine.handleBargeIn('interrompido pelo botão');
  });

  btnVoicePushToTalk?.addEventListener('mousedown', () => {
    voiceProfessorEngine.isPushToTalkActive = true;
    voiceProfessorEngine.setState('listening');
    btnVoicePushToTalk.style.background = 'var(--accent-amber)';
    btnVoicePushToTalk.style.color = '#000';
  });

  btnVoicePushToTalk?.addEventListener('mouseup', () => {
    voiceProfessorEngine.isPushToTalkActive = false;
    btnVoicePushToTalk.style.background = 'transparent';
    btnVoicePushToTalk.style.color = 'var(--text-main)';
  });

  btnVoiceMute?.addEventListener('click', () => {
    voiceProfessorEngine.isMuted = !voiceProfessorEngine.isMuted;
    btnVoiceMute.innerHTML = voiceProfessorEngine.isMuted ? '<i class="fa-solid fa-volume-xmark" style="color:#ef4444;"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    window.Toast.info(voiceProfessorEngine.isMuted ? 'Professor silenciado.' : 'Voz do professor reativada.');
  });

  voiceProfModeSelect?.addEventListener('change', (e) => {
    voiceProfessorEngine.mode = e.target.value;
    window.Toast.info(`Modo do professor alterado para: ${e.target.options[e.target.selectedIndex].text}`);
  });

  voiceSpeedSelect?.addEventListener('change', (e) => {
    voiceProfessorEngine.speechSpeed = parseFloat(e.target.value);
    window.Toast.info(`Velocidade da voz alterada para: ${e.target.value}x`);
  });

  // Atualização dos Estados Visuais da State Machine
  voiceProfessorEngine.onStateChange((state, errorMsg) => {
    if (!voiceProfStateBadge) return;
    switch (state) {
      case 'listening':
        voiceProfStateBadge.innerText = 'OUVINDO VOCÊ...';
        voiceProfStateBadge.style.background = 'rgba(56,189,248,0.2)';
        voiceProfStateBadge.style.color = '#38bdf8';
        if (voiceProfAvatarWave) voiceProfAvatarWave.style.boxShadow = '0 0 20px #38bdf8';
        break;
      case 'thinking':
        voiceProfStateBadge.innerText = 'PENSANDO NA RESPOSTA...';
        voiceProfStateBadge.style.background = 'rgba(245,158,11,0.2)';
        voiceProfStateBadge.style.color = 'var(--accent-amber)';
        if (voiceProfAvatarWave) voiceProfAvatarWave.style.boxShadow = '0 0 20px var(--accent-amber)';
        break;
      case 'speaking':
        voiceProfStateBadge.innerText = 'PROFESSOR FALANDO...';
        voiceProfStateBadge.style.background = 'rgba(16,185,129,0.2)';
        voiceProfStateBadge.style.color = '#10b981';
        if (voiceProfAvatarWave) voiceProfAvatarWave.style.boxShadow = '0 0 25px #10b981';
        break;
      case 'interrupted':
        voiceProfStateBadge.innerText = 'INTERROMPIDO!';
        voiceProfStateBadge.style.background = 'rgba(239,68,68,0.2)';
        voiceProfStateBadge.style.color = '#ef4444';
        if (voiceProfAvatarWave) voiceProfAvatarWave.style.boxShadow = '0 0 10px #ef4444';
        break;
      case 'error':
        voiceProfStateBadge.innerText = errorMsg || 'ERRO DE MICROFONE';
        voiceProfStateBadge.style.background = 'rgba(239,68,68,0.2)';
        voiceProfStateBadge.style.color = '#ef4444';
        break;
      default:
        voiceProfStateBadge.innerText = 'PRONTO PARA CONVERSAR';
        voiceProfStateBadge.style.background = 'rgba(255,255,255,0.06)';
        voiceProfStateBadge.style.color = 'var(--text-muted)';
        if (voiceProfAvatarWave) voiceProfAvatarWave.style.boxShadow = 'none';
        break;
    }
  });

  // Renderização das Mensagens em Tempo Real no Diálogo Fluído
  voiceProfessorEngine.onMessage((msg) => {
    if (!voiceDialogueStream) return;
    
    // Limpar mensagem inicial vazia
    if (voiceDialogueStream.innerText.includes('Toque em "Iniciar Conversa por Voz"')) {
      voiceDialogueStream.innerHTML = '';
    }

    const isUser = msg.sender === 'user';
    const bubble = document.createElement('div');
    bubble.style.display = 'flex';
    bubble.style.flexDirection = 'column';
    bubble.style.alignItems = isUser ? 'flex-end' : 'flex-start';
    bubble.style.marginBottom = '10px';

    const sourceBadges = (msg.sources || []).map(s => `<span class="badge-official" style="font-size:0.65rem; color:var(--accent-amber); border-color:var(--border-amber); margin-top:4px; display:inline-block;"><i class="fa-solid fa-book-bookmark"></i> ${s}</span>`).join(' ');

    bubble.innerHTML = `
      <div style="max-width:85%; padding:10px 14px; border-radius:${isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px'}; background:${isUser ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)'}; border:1px solid ${isUser ? '#38bdf8' : 'var(--border-light)'}; color:var(--text-main); font-size:0.85rem; line-height:1.4;">
        <div style="font-size:0.7rem; color:${isUser ? '#38bdf8' : 'var(--accent-amber)'}; font-weight:700; margin-bottom:2px;">${isUser ? 'Você' : 'Prof. Dr. Marcos'}</div>
        <div>${msg.displayText ? msg.displayText.replace(/\n/g, '<br>') : msg.text}</div>
        ${sourceBadges}
      </div>
    `;

    voiceDialogueStream.appendChild(bubble);
    voiceDialogueStream.scrollTop = voiceDialogueStream.scrollHeight;
  });

  // ------------------------------------------------------------------------
  // ETAPA 19: PROVA ORAL & AUDIÊNCIA AVANÇADA
  // ------------------------------------------------------------------------
  const oralExamEngine = new OralExamEngine(authService, audioEngine, voiceProfessorEngine, legalBrainEngine);
  window.oralExamEngine = oralExamEngine;

  // Subabas de Prova Oral
  document.querySelectorAll('.oral-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.oral-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-oral-tab');
      document.getElementById('oral-tab-exam-container')?.classList.toggle('hidden', targetTab !== 'exam');
      document.getElementById('oral-tab-argument-container')?.classList.toggle('hidden', targetTab !== 'argument');
      document.getElementById('oral-tab-hearing-container')?.classList.toggle('hidden', targetTab !== 'hearing');
      document.getElementById('oral-tab-errors-container')?.classList.toggle('hidden', targetTab !== 'errors');

      if (targetTab === 'errors') renderOralErrorsList();
    });
  });

  function renderOralErrorsList() {
    const listEl = document.getElementById('oral-errors-list');
    if (!listEl) return;
    const errors = oralExamEngine.loadOralErrors();

    if (errors.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:20px; text-align:center;">Nenhum erro oral recente registrado. Parabéns!</div>';
      return;
    }

    listEl.innerHTML = errors.map(e => `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <span class="badge-official" style="color:#ef4444; border-color:#ef4444; font-size:0.68rem;">${e.subject}</span>
          <strong style="color:var(--text-main); font-size:0.92rem; display:block; margin:4px 0;">${e.question}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-triangle-exclamation text-amber"></i> Fundamento esquecido: <strong>${e.missedLaw}</strong> • Falhas: ${e.timesFailed}x</span>
        </div>
        <button class="btn-primary btn-retry-single-error" data-error-id="${e.id}" style="font-size:0.78rem; padding:8px 14px;">
          <i class="fa-solid fa-arrows-rotate"></i> Refazer Arguição
        </button>
      </div>
    `).join('');
  }

  // Início da Simulação de Prova Oral
  const btnStartOralExam = document.getElementById('btn-start-oral-exam');
  const oralConfigCard = document.getElementById('oral-config-card');
  const oralSimArena = document.getElementById('oral-sim-arena');
  const oralEvaluationCard = document.getElementById('oral-evaluation-card');
  const oralQuestionStem = document.getElementById('oral-question-stem');
  const oralFollowupWrap = document.getElementById('oral-followup-wrap');
  const oralFollowupText = document.getElementById('oral-followup-text');
  const oralStudentSpeech = document.getElementById('oral-student-speech');
  const oralTimerSeconds = document.getElementById('oral-timer-seconds');
  const btnOralRecordAnswer = document.getElementById('btn-oral-record-answer');
  const btnOralSubmitTurn = document.getElementById('btn-oral-submit-turn');
  const btnSpeakOralStem = document.getElementById('btn-speak-oral-stem');

  let activeOralSession = null;
  let activeQuestion = null;
  let currentQuestionStep = 1; // 1: Resposta Inicial, 2: Resposta ao Aprofundamento
  let oralInitialAnswer = '';
  let oralFollowUpAnswer = '';
  let oralTimer = null;
  let oralSecondsLeft = 60;

  btnStartOralExam?.addEventListener('click', () => {
    const subject = document.getElementById('oral-select-subject')?.value || 'Direito Penal';
    const boardProfile = document.getElementById('oral-select-board')?.value || 'objetiva';
    const timeLimit = parseInt(document.getElementById('oral-select-time')?.value || '60', 10);

    activeOralSession = oralExamEngine.startOralExam({ subject, timePerQuestion: timeLimit, boardProfile });
    activeQuestion = activeOralSession.questions[0];
    currentQuestionStep = 1;

    oralConfigCard?.classList.add('hidden');
    oralEvaluationCard?.classList.add('hidden');
    oralSimArena?.classList.remove('hidden');

    loadOralQuestion(activeQuestion, timeLimit);
  });

  function loadOralQuestion(q, timeLimit) {
    if (oralQuestionStem) oralQuestionStem.innerText = q.stem;
    if (oralFollowupWrap) oralFollowupWrap.classList.add('hidden');
    if (oralStudentSpeech) oralStudentSpeech.innerText = 'Clique em "Responder por Voz" e fale no microfone...';

    currentQuestionStep = 1;
    oralInitialAnswer = '';
    oralFollowUpAnswer = '';
    oralSecondsLeft = timeLimit;

    clearInterval(oralTimer);
    updateOralTimerDisplay(oralSecondsLeft);

    oralTimer = setInterval(() => {
      oralSecondsLeft--;
      updateOralTimerDisplay(oralSecondsLeft);
      if (oralSecondsLeft <= 0) {
        clearInterval(oralTimer);
        window.Toast?.info('Tempo da arguição encerrado. Conclua sua manifestação.');
      }
    }, 1000);
  }

  function updateOralTimerDisplay(seconds) {
    if (!oralTimerSeconds) return;
    oralTimerSeconds.innerText = Math.max(0, seconds);
    const displayWrap = document.getElementById('oral-timer-display');
    if (displayWrap) {
      if (seconds <= 10) {
        displayWrap.style.color = '#ef4444';
        displayWrap.style.borderColor = '#ef4444';
        displayWrap.style.background = 'rgba(239,68,68,0.15)';
      } else if (seconds <= 30) {
        displayWrap.style.color = 'var(--accent-amber)';
        displayWrap.style.borderColor = 'var(--border-amber)';
        displayWrap.style.background = 'rgba(245,158,11,0.15)';
      } else {
        displayWrap.style.color = '#10b981';
        displayWrap.style.borderColor = '#10b981';
        displayWrap.style.background = 'rgba(16,185,129,0.15)';
      }
    }
  }

  btnSpeakOralStem?.addEventListener('click', () => {
    if (activeQuestion) {
      voiceProfessorEngine.speakResponse(activeQuestion.stem, activeQuestion.stem, 9999);
    }
  });

  btnOralRecordAnswer?.addEventListener('click', () => {
    btnOralRecordAnswer.innerHTML = '<i class="fa-solid fa-circle-dot" style="color:#ef4444;"></i> Gravando Resposta...';
    btnOralRecordAnswer.style.borderColor = '#ef4444';

    // Simulação do reconhecimento oral da resposta
    setTimeout(() => {
      const recognized = currentQuestionStep === 1 
        ? 'Excelência, no dolo eventual o agente prevê o resultado e assume o risco de produzi-lo nos termos do artigo dezoito, inciso primeiro do Código Penal. Na culpa consciente, o agente prevê o resultado, mas confia sinceramente na sua habilidade para evitá-lo.'
        : 'Nos termos da jurisprudência do STJ, a disputa de racha com morte autoriza a pronúncia por homicídio doloso eventual devido à assunção consciente do risco.';

      if (currentQuestionStep === 1) {
        oralInitialAnswer = recognized;
        if (oralStudentSpeech) oralStudentSpeech.innerText = recognized;
      } else {
        oralFollowUpAnswer = recognized;
        if (oralStudentSpeech) oralStudentSpeech.innerText += `\n\n[Resposta ao Aprofundamento]: ${recognized}`;
      }

      btnOralRecordAnswer.innerHTML = '<i class="fa-solid fa-microphone"></i> Responder por Voz';
      btnOralRecordAnswer.style.borderColor = 'var(--border-amber)';
      window.Toast?.success('Fala transcrita com sucesso!');
    }, 2000);
  });

  btnOralSubmitTurn?.addEventListener('click', () => {
    if (currentQuestionStep === 1) {
      // Gera Pergunta de Aprofundamento (Follow-up)
      const followUp = oralExamEngine.generateFollowUpQuestion(oralInitialAnswer, activeQuestion);
      if (oralFollowupText) oralFollowupText.innerText = followUp;
      if (oralFollowupWrap) oralFollowupWrap.classList.remove('hidden');

      voiceProfessorEngine.speakResponse(followUp, followUp, 9998);
      currentQuestionStep = 2;
      window.Toast?.info('A banca formulou uma pergunta de aprofundamento!');
    } else {
      // Conclui avaliação e exibe rubrica
      clearInterval(oralTimer);
      const evalResult = oralExamEngine.evaluateOralAnswer({
        question: activeQuestion,
        studentInitialAnswer: oralInitialAnswer,
        studentFollowUpAnswer: oralFollowUpAnswer,
        responseTimeSeconds: activeOralSession.timePerQuestion - oralSecondsLeft,
        maxTimeSeconds: activeOralSession.timePerQuestion
      });

      oralSimArena?.classList.add('hidden');
      oralEvaluationCard?.classList.remove('hidden');

      document.getElementById('oral-eval-total-score').innerText = evalResult.totalScore;
      document.getElementById('oral-eval-classification').innerText = evalResult.classification;
      document.getElementById('rubric-accuracy').innerText = `${evalResult.rubric.legalAccuracy.score} / 4.0`;
      document.getElementById('rubric-grounding').innerText = `${evalResult.rubric.legalGrounding.score} / 3.0`;
      document.getElementById('rubric-clarity').innerText = `${evalResult.rubric.clarity.score} / 2.0`;
      document.getElementById('rubric-time').innerText = `${evalResult.rubric.timeManagement.score} / 1.0`;
      document.getElementById('oral-eval-model-answer').innerText = evalResult.modelAnswer;

      window.Toast?.success(`Arguição concluída! Nota: ${evalResult.totalScore}/10`);
    }
  });

  document.getElementById('btn-speak-model-answer')?.addEventListener('click', () => {
    if (activeQuestion) {
      voiceProfessorEngine.speakResponse(activeQuestion.modelAnswer, activeQuestion.modelAnswer, 9997);
    }
  });

  document.getElementById('btn-oral-retry-errors')?.addEventListener('click', () => {
    oralEvaluationCard?.classList.add('hidden');
    oralConfigCard?.classList.remove('hidden');
    window.Toast?.info('Iniciando nova rodada adaptativa focada em seus pontos fracos.');
  });

  document.getElementById('btn-oral-gen-flashcards')?.addEventListener('click', () => {
    window.Toast?.success('Flashcards sonoros gerados a partir da fundamentação esquecida!');
    document.querySelector('[data-view=flashcards]')?.click();
  });

  // ------------------------------------------------------------------------
  // ETAPA 20: JURISPRUDÊNCIA VIVA & ATUALIZAÇÃO LEGISLATIVA
  // ------------------------------------------------------------------------
  const legalUpdateEngine = new LegalUpdateEngine(authService, audioEngine, vadeMecumEngine, tutorEngine, legalBrainEngine);
  window.legalUpdateEngine = legalUpdateEngine;

  // Subabas de Atualizações
  document.querySelectorAll('.upd-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.upd-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-upd-tab');
      document.getElementById('upd-tab-feed-container')?.classList.toggle('hidden', targetTab !== 'feed');
      document.getElementById('upd-tab-diffs-container')?.classList.toggle('hidden', targetTab !== 'diffs');
      document.getElementById('upd-tab-stf-container')?.classList.toggle('hidden', targetTab !== 'stf');
      document.getElementById('upd-tab-stj-container')?.classList.toggle('hidden', targetTab !== 'stj');
      document.getElementById('upd-tab-audio-container')?.classList.toggle('hidden', targetTab !== 'audio');

      if (targetTab === 'feed') renderLegalUpdatesFeed();
      if (targetTab === 'stf') renderStfUpdates();
      if (targetTab === 'stj') renderStjUpdates();
    });
  });

  function renderLegalUpdatesFeed() {
    const listEl = document.getElementById('upd-feed-list');
    if (!listEl) return;
    const feed = legalUpdateEngine.getUserPersonalizedFeed();

    if (feed.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:20px; text-align:center;">Nenhuma novidade recente para sua watchlist.</div>';
      return;
    }

    listEl.innerHTML = feed.map(u => `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.7rem;">${u.category.toUpperCase()} • ${u.subject}</span>
          <span style="font-size:0.72rem; color:var(--text-muted);"><i class="fa-solid fa-circle-check text-green"></i> Fonte Verificada: <strong>${u.sourceName}</strong></span>
        </div>
        <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.05rem; margin:0 0 6px 0;">
          ${u.targetLaw ? `${u.targetLaw} (Art. ${u.targetArticle})` : `${u.topicNumber} — ${u.citation}`}
        </h4>
        <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.4; margin:0 0 12px 0;">
          ${u.whatChanged || u.thesis}
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <span style="font-size:0.75rem; color:var(--text-muted);">Publicado em: <strong>${u.publicationDate}</strong></span>
          <div style="display:flex; gap:8px;">
            <a href="${u.sourceUrl}" target="_blank" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Fonte Oficial
            </a>
            ${u.category === 'legislacao' ? `<button class="btn-primary btn-open-diff-view" style="font-size:0.75rem; padding:4px 10px;">✨ Ver o que mudou</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderStfUpdates() {
    const listEl = document.getElementById('upd-stf-list');
    if (!listEl) return;
    const stfUpdates = legalUpdateEngine.updatesDb.filter(u => u.category === 'stf');

    listEl.innerHTML = stfUpdates.map(u => `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
        <span class="badge-official" style="color:#10b981; border-color:#10b981; font-size:0.7rem;">REPERCUSSÃO GERAL</span>
        <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.1rem; margin:6px 0;">${u.topicNumber} (${u.citation})</h4>
        <p style="font-size:0.85rem; color:var(--text-main); line-height:1.4; margin-bottom:10px;"><strong>Tese Fixada:</strong> ${u.thesis}</p>
        <span style="font-size:0.75rem; color:var(--text-muted);">Status: <strong>Julgado de Mérito</strong> • Fonte: Portal STF</span>
      </div>
    `).join('');
  }

  function renderStjUpdates() {
    const listEl = document.getElementById('upd-stj-list');
    if (!listEl) return;
    const stjUpdates = legalUpdateEngine.updatesDb.filter(u => u.category === 'stj');

    listEl.innerHTML = stjUpdates.map(u => `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
        <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8; font-size:0.7rem;">JURISPRUDÊNCIA EM TESES</span>
        <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.1rem; margin:6px 0;">${u.topicNumber} (${u.citation})</h4>
        <p style="font-size:0.85rem; color:var(--text-main); line-height:1.4; margin-bottom:10px;"><strong>Enunciado:</strong> ${u.thesis}</p>
        <span style="font-size:0.75rem; color:var(--text-muted);">Status: <strong>Vigente</strong> • Fonte: STJ Oficial</span>
      </div>
    `).join('');
  }

  document.getElementById('btn-upd-refresh')?.addEventListener('click', () => {
    renderLegalUpdatesFeed();
    window.Toast?.success('Feed sincronizado com as fontes oficiais!');
  });

  document.getElementById('btn-open-diff-tutor')?.addEventListener('click', () => {
    document.querySelector('[data-view=tutor]')?.click();
    document.getElementById('tab-tutor-chat')?.click();
    const input = document.getElementById('tutor-input-msg');
    if (input) {
      input.value = 'Explique o impacto da nova redação do Artigo 300 do CPC (Lei 15.123/2026) para concursos e provas da faculdade.';
    }
  });

  document.getElementById('btn-play-weekly-briefing')?.addEventListener('click', () => {
    const briefing = legalUpdateEngine.generateWeeklyAudioBriefing();
    const textEl = document.getElementById('upd-briefing-text');
    if (textEl) {
      textEl.innerText = briefing.speechScript;
      textEl.classList.remove('hidden');
    }
    voiceProfessorEngine.speakResponse(briefing.speechScript, briefing.speechScript, 9996);
    window.Toast?.success('Reproduzindo Boletim Jurídico Semanal com Prof. Marcos');
  });

  // ------------------------------------------------------------------------
  // ETAPA 21: MODO OFFLINE & BIBLIOTECA JURÍDICA LOCAL
  // ------------------------------------------------------------------------
  const offlineStorageEngine = new OfflineStorageEngine(authService);
  window.offlineStorageEngine = offlineStorageEngine;

  // Subabas da Biblioteca Offline
  document.querySelectorAll('.off-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.off-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-off-tab');
      document.getElementById('off-tab-downloads-container')?.classList.toggle('hidden', targetTab !== 'downloads');
      document.getElementById('off-tab-sync-container')?.classList.toggle('hidden', targetTab !== 'sync');
      document.getElementById('off-tab-storage-container')?.classList.toggle('hidden', targetTab !== 'storage');
      document.getElementById('off-tab-travel-container')?.classList.toggle('hidden', targetTab !== 'travel');

      if (targetTab === 'storage') renderOfflineStorageUI();
      if (targetTab === 'sync') renderOutboxList();
    });
  });

  function renderOfflineStorageUI() {
    const breakdown = offlineStorageEngine.getStorageBreakdown();
    const counterEl = document.getElementById('off-storage-counter');
    const barEl = document.getElementById('off-storage-progress-bar');

    if (counterEl) counterEl.innerText = `${breakdown.totalUsedFormattedMB} MB / ${breakdown.limitFormattedMB} MB`;
    if (barEl) barEl.style.width = `${breakdown.usagePercent}%`;

    const statLaws = document.getElementById('off-stat-laws');
    const statAudios = document.getElementById('off-stat-audios');
    const statFlashcards = document.getElementById('off-stat-flashcards');
    const statMaterials = document.getElementById('off-stat-materials');

    if (statLaws) statLaws.innerText = `${breakdown.categories.laws} MB`;
    if (statAudios) statAudios.innerText = `${breakdown.categories.audios} MB`;
    if (statFlashcards) statFlashcards.innerText = `${breakdown.categories.flashcards} MB`;
    if (statMaterials) statMaterials.innerText = `${breakdown.categories.materials} MB`;
  }

  function renderOutboxList() {
    const listEl = document.getElementById('off-outbox-list');
    if (!listEl) return;
    const outbox = offlineStorageEngine.outboxDb;

    if (outbox.length === 0) {
      listEl.innerHTML = '<div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:20px; text-align:center; color:#10b981;"><i class="fa-solid fa-circle-check" style="font-size:1.5rem; margin-bottom:8px; display:block;"></i>Todos os seus estudos estão 100% sincronizados com a nuvem.</div>';
      return;
    }

    listEl.innerHTML = outbox.map(op => `
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--text-main); font-size:0.9rem;">Operação: ${op.type}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block;">ID: ${op.operationId} • Criado em: ${new Date(op.createdAt).toLocaleTimeString()}</span>
        </div>
        <span class="badge-new" style="background:rgba(245,158,11,0.15); color:var(--accent-amber);">PENDENTE</span>
      </div>
    `).join('');
  }

  document.querySelectorAll('.btn-download-law').forEach(btn => {
    btn.addEventListener('click', () => {
      const lawId = btn.getAttribute('data-law-id');
      offlineStorageEngine.downloadLawOffline(lawId, 'Código de Processo Civil', 'v2026.1', 52);
      btn.outerHTML = '<span class="badge-new" style="background:#10b981; color:#000;"><i class="fa-solid fa-check"></i> DISPONÍVEL</span>';
      renderOfflineStorageUI();
      window.Toast?.success('Código de Processo Civil baixado com sucesso para estudo offline!');
    });
  });

  document.getElementById('btn-force-sync')?.addEventListener('click', async () => {
    window.Toast?.info('Iniciando sincronização com o servidor...');
    const res = await offlineStorageEngine.triggerAutoSync();
    renderOutboxList();
  });

  document.getElementById('btn-download-travel-bundle')?.addEventListener('click', () => {
    const res = offlineStorageEngine.downloadTravelBundle();
    renderOfflineStorageUI();
    window.Toast?.success(`Pacote de Viagem pronto: ${res.lawsCount} leis e ${res.flashcardsCount} flashcards salvos no dispositivo!`);
  });

  // ------------------------------------------------------------------------
  // ETAPA 22: APP MOBILE ANDROID & IOS
  // ------------------------------------------------------------------------
  const mobileBridge = new MobileBridge(authService, audioEngine, entitlementService);
  window.mobileBridge = mobileBridge;

  // Mobile Bottom Navigation
  document.querySelectorAll('.mobile-nav-btn[data-mobile-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetView = btn.getAttribute('data-mobile-view');
      document.querySelector(`.nav-item[data-view="${targetView}"]`)?.click();
      mobileBridge.triggerHaptic('light');
    });
  });

  // Mobile More Sheet
  const mobileMoreSheet = document.getElementById('mobile-more-sheet');
  document.getElementById('btn-mobile-more')?.addEventListener('click', () => {
    mobileMoreSheet?.classList.remove('hidden');
    mobileBridge.triggerHaptic('medium');
  });

  document.getElementById('btn-close-mobile-more')?.addEventListener('click', () => {
    mobileMoreSheet?.classList.add('hidden');
  });

  document.querySelectorAll('.mobile-sheet-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      document.querySelector(`.nav-item[data-view="${targetView}"]`)?.click();
      mobileMoreSheet?.classList.add('hidden');
      mobileBridge.triggerHaptic('light');
    });
  });

  // ------------------------------------------------------------------------
  // ETAPA 23: SCANNER JURÍDICO INTELIGENTE
  // ------------------------------------------------------------------------
  const smartScannerEngine = new SmartScannerEngine(authService, audioEngine, vadeMecumEngine, materialsEngine);
  window.smartScannerEngine = smartScannerEngine;

  let currentScanMode = 'page';
  document.querySelectorAll('.scan-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scan-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScanMode = btn.getAttribute('data-scan-mode');
    });
  });

  function displayScanResults(rawText, mode) {
    const res = smartScannerEngine.processCapturedImage(rawText, mode);
    const container = document.getElementById('scan-results-container');
    const rawEl = document.getElementById('scan-raw-text');
    const revEl = document.getElementById('scan-reviewed-text');
    const refList = document.getElementById('scan-references-list');

    if (rawEl) rawEl.innerText = res.ocrResult.rawText;
    if (revEl) revEl.innerText = res.ocrResult.reviewedText;

    if (refList) {
      if (res.references.length === 0) {
        refList.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted);">Nenhuma citação legal detectada nesta página.</span>';
      } else {
        refList.innerHTML = res.references.map(r => `
          <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.75rem; cursor:pointer;" onclick="document.querySelector('[data-view=vade-mecum]').click()">
            <i class="fa-solid fa-scale-balanced"></i> ${r.rawMatch} ${r.isAmbiguous ? '(⚠️ Ambiguidade: confirme a lei)' : ''}
          </span>
        `).join('');
      }
    }

    container?.classList.remove('hidden');
  }

  document.getElementById('btn-scan-sample-article')?.addEventListener('click', () => {
    const sampleArticle = "Art. 121 do Código Penal. Matar alguém: Pena - reclusão, de seis a vinte anos. Parágrafo 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, o juiz pode reduzir a pena de um sexto a um terço.";
    displayScanResults(sampleArticle, 'page');
    window.Toast?.success('Página de livro jurídico processada com sucesso!');
  });

  document.getElementById('btn-scan-sample-board')?.addEventListener('click', () => {
    const sampleBoard = "TEORIA DO DELITO | Dolo -> Direto -> Eventual (assume o risco) | Culpa -> Consciente -> Inconsciente | Excludentes Art. 23 CP -> Legítima Defesa -> Estado de Necessidade";
    displayScanResults(sampleBoard, 'board');
    window.Toast?.success('Quadro de aula estruturado em anotações!');
  });

  document.getElementById('btn-scan-capture')?.addEventListener('click', () => {
    const sampleCaptured = "Art. 300 do Código de Processo Civil. A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.";
    displayScanResults(sampleCaptured, currentScanMode);
    window.Toast?.success('Foto capturada e texto extraído via OCR!');
  });

  document.getElementById('btn-scan-play-audio')?.addEventListener('click', () => {
    const narration = smartScannerEngine.generateAudioNarration();
    if (narration) {
      voiceProfessorEngine.speakResponse(narration.speechScript, narration.speechScript, 9995);
      window.Toast?.success('Reproduzindo áudio do documento com Prof. Marcos');
    }
  });

  document.getElementById('btn-scan-summary')?.addEventListener('click', () => {
    const summary = smartScannerEngine.generateSummary('completo');
    window.Toast?.info(summary);
  });

  document.getElementById('btn-scan-gen-flashcards')?.addEventListener('click', () => {
    window.Toast?.success('Flashcard gerado a partir do texto escaneado!');
    document.querySelector('[data-view=flashcards]')?.click();
  });

  document.getElementById('btn-scan-gen-questions')?.addEventListener('click', () => {
    window.Toast?.success('Questão criada a partir do conceito escaneado!');
    document.querySelector('[data-view=practice]')?.click();
  });

  document.getElementById('btn-scan-save-material')?.addEventListener('click', () => {
    window.Toast?.success('Material salvo com sucesso no seu acervo pessoal!');
  });

  // ------------------------------------------------------------------------
  // ETAPA 24: MAPAS MENTAIS JURÍDICOS
  // ------------------------------------------------------------------------
  const mindMapEngine = new MindMapEngine(authService, audioEngine, vadeMecumEngine, tutorEngine, academicAnalyticsEngine, legalUpdateEngine);
  window.mindMapEngine = mindMapEngine;

  function renderMindMapUI(map) {
    const visualEl = document.getElementById('mind-map-visual-nodes');
    const textTreeEl = document.getElementById('mind-map-text-tree-content');
    const titleEl = document.getElementById('mind-map-current-title');
    const subjectEl = document.getElementById('mind-map-current-subject');
    const descEl = document.getElementById('mind-map-current-desc');
    const updateBadge = document.getElementById('mind-map-update-badge');

    if (!map) {
      if (visualEl) {
        visualEl.innerHTML = `
          <div class="mindmap-empty-state">
            <div class="empty-icon"><i class="fa-solid fa-diagram-project"></i></div>
            <h3 class="empty-title">Nenhum mapa selecionado</h3>
            <p class="empty-desc">Escolha um dos seus mapas na barra superior ou gere um novo mapa conceitual a partir de qualquer artigo ou tema jurídico.</p>
            <button class="btn-toolbar-primary" onclick="document.querySelector('[data-map-tab=generate]')?.click()">
              <i class="fa-solid fa-plus"></i> <span>Gerar mapa</span>
            </button>
          </div>
        `;
      }
      return;
    }

    mindMapEngine.activeMap = map;

    // 1. Atualizar Cabeçalho do Mapa Ativo
    if (titleEl) titleEl.innerText = map.rootNode?.label || map.title || 'Mapa Sem Título';
    if (subjectEl) subjectEl.innerText = map.subject || 'Direito Penal';
    if (descEl) {
      descEl.innerText = map.description || (map.rootNode?.provenance 
        ? `Estrutura conceitual baseada no ${map.rootNode.provenance}.` 
        : 'Estrutura dogmática, fundamentos legais e conexões doutrinárias.');
    }
    if (updateBadge) updateBadge.classList.toggle('hidden', !map.rootNode?.hasLegislativeUpdate);

    // 2. Renderizar Nós Visuais (Nó Central + Conexões)
    if (visualEl) {
      const root = map.rootNode || {};
      const children = root.children || [];

      // Helper para renderizar cada card de conexão semântica
      function renderConnectionCard(node) {
        const type = (node.type || 'concept').toLowerCase();
        
        // A. Card de Artigo / Fundamento Legal
        if (type === 'article') {
          return `
            <div class="connection-card article-card">
              <div class="connection-card-header">
                <span class="connection-tag">Fundamento legal</span>
              </div>
              <div class="connection-card-body">
                <h4 class="article-node-title">${node.articleTitle || node.label}</h4>
                ${node.description ? `<p class="connection-desc">${node.description}</p>` : ''}
              </div>
              <div class="connection-card-footer">
                <span class="connection-provenance">${node.provenance || 'Código Penal'}</span>
                <button class="btn-card-link" onclick="document.querySelector('[data-view=reader]')?.click()">
                  <span>Ver artigo</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        }

        // B. Card de Jurisprudência (Ocupa 2 colunas)
        if (type === 'jurisprudence') {
          return `
            <div class="connection-card jurisprudence-card span-full">
              <div class="connection-card-header">
                <span class="connection-tag">Jurisprudência</span>
              </div>
              <div class="connection-card-body">
                <h4 class="jurisprudence-node-title">${node.caseTitle || node.label}</h4>
                ${node.description ? `<p class="connection-desc">${node.description}</p>` : ''}
              </div>
              <div class="connection-card-footer">
                <span class="connection-provenance">${node.provenance || 'STF · ADPF 779'}</span>
                <button class="btn-card-link" onclick="document.querySelector('[data-view=jurisprudence]')?.click()">
                  <span>Ver decisão</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        }

        // C. Card de Ponto Fraco / Revisão Crítica
        if (type === 'weakness') {
          return `
            <div class="connection-card weakness-card">
              <div class="connection-card-header">
                <span class="connection-tag weakness">Ponto de Atenção</span>
                ${node.masteryPercent !== undefined ? `<span class="weakness-score ${node.masteryPercent < 60 ? 'low' : 'high'}">${node.masteryPercent}% Domínio</span>` : ''}
              </div>
              <div class="connection-card-body">
                <h4 class="weakness-node-title">${node.label}</h4>
                ${node.description ? `<p class="connection-desc">${node.description}</p>` : ''}
                ${node.recommendation ? `
                  <div class="connection-action-hint weakness">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>${node.recommendation}</span>
                  </div>
                ` : ''}
              </div>
              <div class="connection-card-footer">
                <span class="connection-provenance">${node.provenance || 'Caderno de Erros'}</span>
                <button class="btn-card-link" onclick="document.querySelector('[data-view=question-generator]')?.click()">
                  <span>Treinar questões</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        }

        // D. Card de Requisitos Cumulativos (com lista de subtópicos)
        if (node.children && node.children.length > 0) {
          return `
            <div class="connection-card concept-card">
              <div class="connection-card-header">
                <span class="connection-tag">${node.label || 'Requisitos cumulativos'}</span>
              </div>
              <div class="connection-card-body">
                <ul class="requirements-checklist">
                  ${node.children.map(sub => `
                    <li>
                      <span class="req-bullet">•</span>
                      <span>${sub.label}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              <div class="connection-card-footer">
                <span class="connection-provenance">${node.provenance || 'Doutrina consolidada'}</span>
              </div>
            </div>
          `;
        }

        // E. Card Conceitual Geral (Conceito Legal, Excesso Punível, etc.)
        return `
          <div class="connection-card concept-card">
            <div class="connection-card-header">
              <span class="connection-tag">${node.label || 'Conceito legal'}</span>
            </div>
            <div class="connection-card-body">
              ${node.description ? `<p class="connection-desc">${node.description}</p>` : ''}
              ${node.recommendation ? `
                <div class="connection-action-hint">
                  <i class="fa-solid fa-lightbulb"></i>
                  <span>${node.recommendation}</span>
                </div>
              ` : ''}
            </div>
            <div class="connection-card-footer">
              <span class="connection-provenance">${node.provenance || 'Legislação e Doutrina'}</span>
            </div>
          </div>
        `;
      }

      visualEl.innerHTML = `
        <!-- NÓ CENTRAL -->
        <div class="mindmap-central-card">
          <div class="central-card-header">
            <span class="central-eyebrow">NÓ CENTRAL</span>
            <span class="central-area-badge">${map.subject || 'Direito'}</span>
          </div>

          <h3 class="central-card-title">${root.label || 'Nó Central'}</h3>
          
          <div class="central-card-category">
            ${root.category || 'Excludente de ilicitude'}
          </div>

          <div class="central-card-details">
            <div class="central-source-block">
              <span class="details-label">Fonte legal</span>
              <div class="details-source-row">
                <span class="source-text">${root.provenance || 'Art. 25 do Código Penal'}</span>
                <button class="btn-inline-action" onclick="document.querySelector('[data-view=reader]')?.click()">
                  <span>Abrir artigo</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            ${root.masteryPercent !== undefined ? `
              <div class="central-retention-block">
                <div class="retention-label-row">
                  <span class="details-label">Retenção recente</span>
                  <span class="retention-pct ${root.masteryPercent < 60 ? 'low' : 'high'}">${root.masteryPercent}%</span>
                </div>
                <div class="retention-bar-track">
                  <div class="retention-bar-fill ${root.masteryPercent < 60 ? 'low' : 'high'}" style="width: ${root.masteryPercent}%;"></div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- SEPARADOR DE SEÇÃO: CONEXÕES DO CONCEITO -->
        <div class="mindmap-connections-heading">
          <h4 class="connections-title">Conexões do conceito</h4>
          <p class="connections-subtitle">Fundamentos, requisitos e entendimentos relacionados.</p>
        </div>

        <!-- GRID DE CARDS SEMÂNTICOS (2 COLUNAS DESKTOP) -->
        <div class="mindmap-connections-grid">
          ${children.map(child => renderConnectionCard(child)).join('')}
        </div>

        <!-- BARRA DISCRETA DE AÇÕES RÁPIDAS -->
        <div class="mindmap-quick-actions-bar">
          <span class="quick-actions-label">Ações rápidas:</span>
          <button class="btn-quick-action" onclick="document.querySelector('[data-view=reader]')?.click()">
            <i class="fa-solid fa-book-open"></i> <span>Abrir no Vade Mecum</span>
          </button>
          <button class="btn-quick-action" onclick="document.querySelector('[data-view=jurisprudence]')?.click()">
            <i class="fa-solid fa-gavel"></i> <span>Ver Jurisprudência</span>
          </button>
          <button class="btn-quick-action" onclick="document.querySelector('[data-view=flashcards]')?.click()">
            <i class="fa-solid fa-clone"></i> <span>Criar Flashcard</span>
          </button>
          <button class="btn-quick-action" onclick="document.querySelector('[data-view=notebook]')?.click()">
            <i class="fa-solid fa-pen-to-square"></i> <span>Adicionar ao Caderno</span>
          </button>
        </div>
      `;
    }

    // 3. Renderizar Árvore Textual Acessível
    if (textTreeEl) {
      textTreeEl.innerText = mindMapEngine.renderAccessibleTextTree(map.rootNode);
    }
  }

  // Subabas de Mapas Mentais
  document.querySelectorAll('.map-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-map-tab');
      if (targetTab === 'presets') renderMindMapUI(mindMapEngine.mapsDb[0]);
      if (targetTab === 'weaknesses') renderMindMapUI(mindMapEngine.generateWeaknessMap());
      if (targetTab === 'comparative') renderMindMapUI(mindMapEngine.generateComparativeMap('Furto (Art. 155 CP)', 'Roubo (Art. 157 CP)'));
      if (targetTab === 'generate') {
        const topic = prompt('Informe o tema ou artigo jurídico para estruturar o Mapa Mental:', 'Controle de Constitucionalidade');
        if (topic) {
          const res = mindMapEngine.generateMapFromTopic(topic, 'Direito Constitucional');
          if (res.success) renderMindMapUI(res.map);
        }
      }
    });
  });

  // Toggle Árvore Textual Acessível
  document.getElementById('btn-toggle-tree-view')?.addEventListener('click', () => {
    const canvas = document.getElementById('mind-map-canvas-container');
    const tree = document.getElementById('mind-map-text-tree-container');
    canvas?.classList.toggle('hidden');
    tree?.classList.toggle('hidden');
    window.Toast?.info(tree?.classList.contains('hidden') ? 'Visualização em Canvas Gráfico' : 'Visualização em Árvore Textual Acessível');
  });

  // Ouvir Explicação com Prof. Marcos
  document.getElementById('btn-map-play-audio')?.addEventListener('click', () => {
    const scriptObj = mindMapEngine.generateDidacticAudioScript(mindMapEngine.activeMap);
    if (scriptObj) {
      voiceProfessorEngine.speakResponse(scriptObj.speechScript, scriptObj.speechScript, 9994);
      window.Toast?.success('Prof. Marcos explicando o mapa mental selecionado!');
    }
  });

  // Estudar com Tutor
  document.getElementById('btn-map-study-tutor')?.addEventListener('click', () => {
    document.querySelector('[data-view=tutor]')?.click();
    document.getElementById('tab-tutor-chat')?.click();
    const input = document.getElementById('tutor-input-msg');
    if (input) {
      input.value = `Quero estudar o mapa mental de ${mindMapEngine.activeMap.title}. Faça perguntas socráticas sobre cada nó para testar meu conhecimento.`;
    }
  });

  // ------------------------------------------------------------------------
  // ETAPA 25: CADERNO DIGITAL JURÍDICO INTELIGENTE
  // ------------------------------------------------------------------------
  const digitalNotebookEngine = new DigitalNotebookEngine(authService, audioEngine, vadeMecumEngine, tutorEngine, smartScannerEngine, mindMapEngine);
  window.digitalNotebookEngine = digitalNotebookEngine;

  function renderNotebookTreeUI() {
    const listEl = document.getElementById('notebooks-tree-list');
    if (!listEl) return;

    listEl.innerHTML = digitalNotebookEngine.notebooks.map(nb => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px;">
        <div style="font-weight:700; font-size:0.85rem; color:${nb.color || 'var(--accent-amber)'}; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
          <span><i class="fa-solid fa-book"></i> ${nb.title}</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">${nb.semester}</span>
        </div>
        ${nb.sections.map(sec => `
          <div style="margin-left:8px; margin-bottom:6px;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;"><i class="fa-solid fa-folder"></i> ${sec.title}</div>
            ${sec.pages.map(page => `
              <div class="notebook-page-item ${page.id === digitalNotebookEngine.activePageId ? 'active' : ''}" 
                   style="font-size:0.78rem; color:${page.id === digitalNotebookEngine.activePageId ? 'var(--accent-amber)' : 'var(--text-main)'}; padding:4px 8px; margin:2px 0; border-radius:6px; cursor:pointer; background:${page.id === digitalNotebookEngine.activePageId ? 'rgba(245,158,11,0.1)' : 'transparent'};"
                   data-page-id="${page.id}" data-sec-id="${sec.id}" data-nb-id="${nb.id}">
                <i class="fa-solid fa-file-lines" style="font-size:0.7rem;"></i> ${page.title}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `).join('');

    document.querySelectorAll('.notebook-page-item').forEach(item => {
      item.addEventListener('click', () => {
        const nbId = item.getAttribute('data-nb-id');
        const secId = item.getAttribute('data-sec-id');
        const pageId = item.getAttribute('data-page-id');
        digitalNotebookEngine.setActivePage(nbId, secId, pageId);
        renderNotebookTreeUI();
        renderPageBlocksUI();
      });
    });
  }

  function renderPageBlocksUI() {
    const page = digitalNotebookEngine.getActivePage();
    if (!page) return;

    const titleEl = document.getElementById('notebook-page-title');
    const container = document.getElementById('notebook-blocks-container');
    if (titleEl) titleEl.innerText = page.title;

    if (container) {
      container.innerHTML = page.blocks.map(b => {
        if (b.type === 'heading') {
          return `
            <div class="notebook-block block-heading" style="border-left:3px solid var(--accent-amber); padding-left:10px;">
              <h4 contenteditable="true" onblur="digitalNotebookEngine.updateBlockContent('${page.id}', '${b.id}', this.innerText)" style="font-family:var(--font-display); font-size:1.15rem; color:var(--text-main); margin:0;">${b.content}</h4>
            </div>
          `;
        }
        if (b.type === 'text') {
          return `
            <div class="notebook-block block-text">
              <div contenteditable="true" onblur="digitalNotebookEngine.updateBlockContent('${page.id}', '${b.id}', this.innerText)" style="font-size:0.9rem; color:var(--text-main); line-height:1.6; outline:none;">${b.content}</div>
            </div>
          `;
        }
        if (b.type === 'article_ref') {
          return `
            <div class="notebook-block block-article" style="background:rgba(245,158,11,0.06); border:1px solid var(--border-amber); border-radius:10px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <strong style="color:var(--accent-amber); font-size:0.85rem;"><i class="fa-solid fa-scale-balanced"></i> ${b.label}</strong>
                ${b.hasLegislativeUpdate ? '<span class="badge-new" style="background:#ef4444; color:#fff; font-size:0.65rem;">⚠️ ATUALIZADO</span>' : ''}
              </div>
              <p style="font-size:0.82rem; color:var(--text-muted); margin:0; line-height:1.4;">${b.contentSnippet}</p>
            </div>
          `;
        }
        if (b.type === 'alert') {
          return `
            <div class="notebook-block block-alert" style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px; font-size:0.85rem; color:#f87171;">
              ${b.content}
            </div>
          `;
        }
        if (b.type === 'flashcard_ref') {
          return `
            <div class="notebook-block block-flashcard" style="background:rgba(168,85,247,0.06); border:1px solid #a855f7; border-radius:10px; padding:12px;">
              <span class="badge-official" style="color:#a855f7; border-color:#a855f7; font-size:0.68rem;"><i class="fa-solid fa-layer-group"></i> FLASHCARD VINCULADO</span>
              <p style="font-weight:600; font-size:0.85rem; color:var(--text-main); margin:6px 0 4px 0;">${b.question}</p>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">${b.answer}</p>
            </div>
          `;
        }
        return '';
      }).join('');
    }
  }

  // Adição de novos blocos
  document.querySelectorAll('.btn-add-block').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-block-type');
      const page = digitalNotebookEngine.getActivePage();
      if (page) {
        let initContent = 'Novo bloco de texto...';
        if (type === 'heading') initContent = 'Novo Tópico';
        if (type === 'alert') initContent = '⚠️ Ponto de atenção importante para a prova.';
        if (type === 'article_ref') initContent = 'Art. 121 do Código Penal';
        if (type === 'flashcard_ref') initContent = 'Pergunta de fixação';

        digitalNotebookEngine.addBlock(page.id, type, initContent);
        renderPageBlocksUI();
        window.Toast?.success('Bloco adicionado!');
      }
    });
  });

  // Perguntar ao Caderno (RAG)
  document.getElementById('btn-notebook-rag')?.addEventListener('click', () => {
    const q = prompt('Pergunte algo sobre suas anotações e aulas no caderno:', 'Quais são os requisitos da legítima defesa?');
    if (q) {
      const ragRes = digitalNotebookEngine.askNotebookRAG(q);
      window.Toast?.info(ragRes.answer);
    }
  });

  // Modo Revisão (Active Recall)
  document.getElementById('btn-notebook-active-recall')?.addEventListener('click', () => {
    window.Toast?.success('🧠 Modo Revisão Ativa ativado! Tente responder mentalmente os conceitos antes de revelá-los.');
  });

  // Ouvir Página com Prof. Marcos
  document.getElementById('btn-notebook-play-audio')?.addEventListener('click', () => {
    const page = digitalNotebookEngine.getActivePage();
    const spoken = digitalNotebookEngine.generateSpokenPageScript(page);
    if (spoken) {
      voiceProfessorEngine.speakResponse(spoken.speechScript, spoken.speechScript, 9993);
      window.Toast?.success('Prof. Marcos narrando o resumo didático desta página!');
    }
  });

  // ------------------------------------------------------------------------
  // ETAPA 26: AGENTE AUTÔNOMO DE ESTUDOS JURÍDICOS
  // ------------------------------------------------------------------------
  const studySessionOrchestrator = new StudySessionOrchestrator(authService, audioEngine, voiceProfessorEngine);
  window.studySessionOrchestrator = studySessionOrchestrator;

  let selectedStudyMinutes = 30;
  let selectedStudyMode = 'balanced';

  document.querySelectorAll('.agent-time-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.agent-time-chip').forEach(c => {
        c.classList.remove('btn-primary');
        c.classList.add('btn-secondary');
      });
      chip.classList.remove('btn-secondary');
      chip.classList.add('btn-primary');
      selectedStudyMinutes = parseInt(chip.getAttribute('data-mins'), 10);
    });
  });

  document.querySelectorAll('.agent-mode-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.agent-mode-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedStudyMode = chip.getAttribute('data-mode');
    });
  });

  function updateFocusModeUI(session) {
    if (!session) return;
    const configPanel = document.getElementById('agent-config-panel');
    const focusPanel = document.getElementById('agent-focus-mode-panel');
    const stepCounter = document.getElementById('agent-step-counter');
    const actTitle = document.getElementById('agent-activity-title');
    const actDesc = document.getElementById('agent-activity-desc');
    const topicTag = document.getElementById('agent-session-topic-tag');

    configPanel?.classList.add('hidden');
    focusPanel?.classList.remove('hidden');

    const act = session.activities[session.currentActivityIndex];
    if (stepCounter) stepCounter.innerText = `ETAPA ${session.currentActivityIndex + 1} DE ${session.activities.length}`;
    if (actTitle) actTitle.innerText = act ? act.title : 'Sessão Concluída';
    if (actDesc) actDesc.innerText = act ? `Duração estimada: ${act.durationMin} minutos. Foque totalmente nesta atividade.` : 'Você finalizou todas as etapas!';
    if (topicTag) topicTag.innerHTML = `<i class="fa-solid fa-bookmark"></i> Foco: ${session.primaryTopic}`;
  }

  document.getElementById('btn-agent-start-session')?.addEventListener('click', () => {
    const promptInput = document.getElementById('agent-natural-prompt')?.value;
    const session = studySessionOrchestrator.planSession(selectedStudyMinutes, selectedStudyMode, 'Direito Penal');
    studySessionOrchestrator.startSession();
    updateFocusModeUI(session);
    window.Toast?.success('🚀 Sessão em Modo Foco iniciada!');
  });

  document.getElementById('btn-agent-voice-action')?.addEventListener('click', () => {
    const script = "Olá! Aqui é o Professor Marcos para a sua sessão guiada do Copiloto. Vamos aprofundar os pontos essenciais de Dolo Eventual versus Culpa Consciente para a sua prova.";
    voiceProfessorEngine.speakResponse(script, script, 9992);
    window.Toast?.success('Prof. Marcos iniciando a explicação guiada');
  });

  document.getElementById('btn-agent-next-activity')?.addEventListener('click', () => {
    const nextAct = studySessionOrchestrator.skipCurrentActivity();
    if (nextAct) {
      updateFocusModeUI(studySessionOrchestrator.activeSession);
      window.Toast?.success('Avançando para a próxima etapa!');
    } else {
      document.getElementById('agent-focus-mode-panel')?.classList.add('hidden');
      document.getElementById('agent-config-panel')?.classList.remove('hidden');
      window.Toast?.success('🎉 Parabéns! Sessão de estudos concluída com sucesso!');
    }
  });

  document.getElementById('btn-agent-stop-session')?.addEventListener('click', () => {
    document.getElementById('agent-focus-mode-panel')?.classList.add('hidden');
    document.getElementById('agent-config-panel')?.classList.remove('hidden');
    window.Toast?.info('Sessão encerrada.');
  });

  // ------------------------------------------------------------------------
  // ETAPA 27: SIMULADOR INTELIGENTE DE PROVAS & OAB
  // ------------------------------------------------------------------------
  const examSimulationEngine = new ExamSimulationEngine(authService, audioEngine, vadeMecumEngine, tutorEngine, studySessionOrchestrator);
  window.examSimulationEngine = examSimulationEngine;

  function renderExamQuestionUI() {
    const sim = examSimulationEngine.activeSimulation;
    if (!sim) return;

    const q = sim.questions[sim.currentQuestionIndex];
    if (!q) return;

    const counterEl = document.getElementById('sim-q-counter');
    const stemEl = document.getElementById('sim-stem-text');
    const optionsEl = document.getElementById('sim-options-container');

    if (counterEl) counterEl.innerText = `QUESTÃO ${sim.currentQuestionIndex + 1} DE ${sim.questions.length} • ${q.topic.toUpperCase()}`;
    if (stemEl) stemEl.innerText = q.stem;

    if (optionsEl) {
      optionsEl.innerHTML = q.options.map((opt, idx) => `
        <label style="background:rgba(255,255,255,0.03); border:1px solid ${q.selectedAnswer === idx ? 'var(--accent-amber)' : 'rgba(255,255,255,0.08)'}; border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:12px; cursor:pointer;">
          <input type="radio" name="sim_opt" value="${idx}" ${q.selectedAnswer === idx ? 'checked' : ''} onchange="examSimulationEngine.recordAnswer(${sim.currentQuestionIndex}, ${idx}); renderExamQuestionUI();">
          <span style="font-size:0.9rem; color:var(--text-main); line-height:1.4;">${String.fromCharCode(65 + idx)}) ${opt}</span>
        </label>
      `).join('');
    }
  }

  function startExamMode(type) {
    examSimulationEngine.createSimulation(type, 'Direito Penal');
    document.getElementById('sim-config-panel')?.classList.add('hidden');
    document.getElementById('sim-results-panel')?.classList.add('hidden');
    document.getElementById('sim-exam-panel')?.classList.remove('hidden');
    renderExamQuestionUI();
    window.Toast?.success('Simulado iniciado em Modo Realista! Boa prova.');
  }

  document.getElementById('card-sim-p1')?.addEventListener('click', () => startExamMode('faculdade'));
  document.getElementById('card-sim-oab')?.addEventListener('click', () => startExamMode('oab'));
  document.getElementById('card-sim-diagnostico')?.addEventListener('click', () => startExamMode('diagnostico'));

  document.getElementById('btn-sim-prev')?.addEventListener('click', () => {
    const sim = examSimulationEngine.activeSimulation;
    if (sim && sim.currentQuestionIndex > 0) {
      sim.currentQuestionIndex--;
      renderExamQuestionUI();
    }
  });

  document.getElementById('btn-sim-next')?.addEventListener('click', () => {
    const sim = examSimulationEngine.activeSimulation;
    if (sim && sim.currentQuestionIndex < sim.questions.length - 1) {
      sim.currentQuestionIndex++;
      renderExamQuestionUI();
    }
  });

  document.getElementById('btn-sim-mark-review')?.addEventListener('click', () => {
    const sim = examSimulationEngine.activeSimulation;
    if (sim) {
      const isMarked = examSimulationEngine.toggleMarkForReview(sim.currentQuestionIndex);
      window.Toast?.info(isMarked ? 'Questão marcada para revisão posterior.' : 'Marcação de revisão removida.');
    }
  });

  document.getElementById('btn-sim-submit')?.addEventListener('click', () => {
    const res = examSimulationEngine.submitSimulation();
    if (!res) return;

    document.getElementById('sim-exam-panel')?.classList.add('hidden');
    const resultsPanel = document.getElementById('sim-results-panel');
    const scoreBanner = document.getElementById('sim-score-banner');
    const statsSummary = document.getElementById('sim-stats-summary');
    const xrayContainer = document.getElementById('sim-xray-container');

    if (scoreBanner) scoreBanner.innerText = `${res.scorePercent}% de Acerto`;
    if (statsSummary) statsSummary.innerText = `${res.correctCount} acertos • ${res.wrongCount} erros • ${res.blankCount} em branco`;

    if (xrayContainer) {
      if (res.errorXRayList.length === 0) {
        xrayContainer.innerHTML = '<div style="color:#10b981; padding:16px; text-align:center;">🎉 Parabéns! Você gabaritou todas as questões deste simulado.</div>';
      } else {
        xrayContainer.innerHTML = res.errorXRayList.map(err => `
          <div style="background:var(--bg-card); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="badge-new" style="background:#ef4444; color:#fff; font-size:0.7rem;"><i class="fa-solid fa-microscope"></i> ${err.cause.toUpperCase()}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-bookmark"></i> ${err.topic}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-main); margin:0 0 8px 0; line-height:1.4;"><strong>Diagnóstico do Erro:</strong> ${err.diagnosis}</p>
            <span style="font-size:0.75rem; color:var(--accent-amber); display:block; margin-bottom:12px;"><i class="fa-solid fa-scale-balanced"></i> Fundamento Legal: ${err.relatedArticle}</span>

            <div style="display:flex; gap:8px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
              <button class="btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="document.querySelector('[data-view=vade-mecum]').click()"><i class="fa-solid fa-book-open"></i> Revisar no Vade</button>
              <button class="btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="document.querySelector('[data-view=tutor]').click()"><i class="fa-solid fa-robot"></i> Explicar com Tutor</button>
              <button class="btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="document.querySelector('[data-view=flashcards]').click()"><i class="fa-solid fa-layer-group"></i> Criar Flashcard</button>
              <button class="btn-primary" style="font-size:0.75rem; padding:4px 10px;" onclick="document.querySelector('[data-view=study-agent]').click()"><i class="fa-solid fa-wand-magic-sparkles"></i> Nova Sessão no Copiloto</button>
            </div>
          </div>
        `).join('');
      }
    }

    resultsPanel?.classList.remove('hidden');
    window.Toast?.success('Simulado corrigido com sucesso! Confira seu Raio-X.');
  });

  document.getElementById('btn-sim-new-test')?.addEventListener('click', () => {
    document.getElementById('sim-results-panel')?.classList.add('hidden');
    document.getElementById('sim-config-panel')?.classList.remove('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 28: CASOS JURÍDICOS DINÂMICOS (INVESTIGAÇÃO PRÁTICA)
  // ------------------------------------------------------------------------
  const dynamicCaseEngine = new DynamicCaseEngine(authService, audioEngine, vadeMecumEngine, tutorEngine, voiceProfessorEngine);
  window.dynamicCaseEngine = dynamicCaseEngine;

  let activeCharacterId = 'char_cliente';

  function renderCaseStateUI() {
    const cs = dynamicCaseEngine.activeCaseSession;
    if (!cs) return;

    const factsList = document.getElementById('case-facts-list');
    const hypothesesList = document.getElementById('case-hypotheses-list');
    const docsContainer = document.getElementById('case-docs-container');

    if (factsList) {
      factsList.innerHTML = cs.discoveredFacts.map(f => `
        <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--accent-amber); padding:6px 10px; border-radius:4px;">${f}</div>
      `).join('');
    }

    if (hypothesesList) {
      hypothesesList.innerHTML = cs.studentHypotheses.length === 0
        ? '<div style="font-style:italic; color:var(--text-muted);">Nenhuma hipótese registrada ainda.</div>'
        : cs.studentHypotheses.map(h => `<div style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.3); padding:4px 8px; border-radius:6px;">${h.text}</div>`).join('');
    }

    if (docsContainer) {
      docsContainer.innerHTML = cs.unlockedDocuments.length === 0
        ? '<div style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">Nenhum documento descoberto ainda. Interrogue o RH ou solicite os arquivos da empresa.</div>'
        : cs.unlockedDocuments.map(d => `
          <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <strong style="color:#10b981; font-size:0.82rem;"><i class="fa-solid fa-file-contract"></i> ${d.title}</strong>
              <span class="badge-official" style="font-size:0.65rem;">${d.disclaimer}</span>
            </div>
            <p style="font-size:0.78rem; color:var(--text-main); margin:0;">${d.contentSnippet}</p>
          </div>
        `).join('');
    }
  }

  document.getElementById('card-case-trabalhista')?.addEventListener('click', () => {
    dynamicCaseEngine.startCase('case_trabalhista_1');
    document.getElementById('case-selection-panel')?.classList.add('hidden');
    document.getElementById('case-active-panel')?.classList.remove('hidden');
    renderCaseStateUI();
    window.Toast?.success('Caso iniciado! Entreviste os personagens e investigue os documentos.');
  });

  document.querySelectorAll('.case-char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.case-char-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCharacterId = btn.getAttribute('data-char-id');
    });
  });

  document.getElementById('btn-case-ask')?.addEventListener('click', () => {
    const qInput = document.getElementById('case-input-question');
    const qText = qInput?.value?.trim();
    if (!qText) return;

    const res = CaseActionEngine.executeAction(dynamicCaseEngine.activeCaseSession, 'interview_character', {
      characterId: activeCharacterId,
      questionText: qText
    });

    if (res.success) {
      const chat = document.getElementById('case-interview-chat');
      if (chat) {
        chat.innerHTML += `
          <div style="margin-bottom:8px;">
            <strong style="color:var(--accent-amber);">Você:</strong> ${qText}<br>
            <strong style="color:#38bdf8;">${res.speaker}:</strong> ${res.reply}
          </div>
        `;
        chat.scrollTop = chat.scrollHeight;
      }
      qInput.value = '';
      renderCaseStateUI();
    }
  });

  document.getElementById('case-input-hypothesis')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val) {
        CaseActionEngine.executeAction(dynamicCaseEngine.activeCaseSession, 'form_hypothesis', { hypothesisText: val });
        e.target.value = '';
        renderCaseStateUI();
        window.Toast?.info('Hipótese registrada no quadro de investigação.');
      }
    }
  });

  document.querySelectorAll('.btn-case-decision').forEach(btn => {
    btn.addEventListener('click', () => {
      const dKey = btn.getAttribute('data-decision-key');
      const res = CaseActionEngine.executeAction(dynamicCaseEngine.activeCaseSession, 'take_decision', { decisionKey: dKey });
      window.Toast?.info(res.consequence);
    });
  });

  document.getElementById('btn-case-hint')?.addEventListener('click', () => {
    window.Toast?.info('💡 Dica: Interrogue o Gerente de RH para obter a cópia da documentação rescisória antes de ajuizar a petição.');
  });

  document.getElementById('btn-case-evaluate-final')?.addEventListener('click', () => {
    const evalRes = dynamicCaseEngine.evaluateSession();
    if (!evalRes) return;

    const modal = document.getElementById('case-rubric-modal');
    const scoreEl = document.getElementById('case-rubric-score');
    const breakdownEl = document.getElementById('case-rubric-breakdown');

    if (scoreEl) scoreEl.innerText = `Nota: ${evalRes.overallScore} / 100`;
    if (breakdownEl) {
      breakdownEl.innerHTML = `
        <div style="margin-bottom:12px;"><strong>Parecer Pedagógico:</strong> ${evalRes.feedbackSummary}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
          <div>🔍 Investigação Fática: <strong>${evalRes.rubricBreakdown.investigation}%</strong></div>
          <div>⚖️ Identificação do Problema: <strong>${evalRes.rubricBreakdown.issueSpotting}%</strong></div>
          <div>📂 Uso de Documentos/Provas: <strong>${evalRes.rubricBreakdown.evidenceUse}%</strong></div>
          <div>🎯 Estratégia Processual: <strong>${evalRes.rubricBreakdown.strategy}%</strong></div>
        </div>
        <strong style="color:var(--accent-amber);">Recomendações do Prof. Marcos:</strong>
        <ul style="margin:4px 0 0 18px; padding:0;">
          ${evalRes.pedagogicalRecommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      `;
    }

    modal?.classList.remove('hidden');
    const feedbackVoice = `Parabéns pela conclusão do caso prático! Sua pontuação geral foi ${evalRes.overallScore} de 100. Analisamos sua investigação fática e o uso dos documentos rescisórios.`;
    voiceProfessorEngine.speakResponse(feedbackVoice, feedbackVoice, 9991);
    window.Toast?.success('Caso concluído e avaliado por rubrica pedagógica!');
  });

  document.getElementById('btn-case-reset')?.addEventListener('click', () => {
    document.getElementById('case-rubric-modal')?.classList.add('hidden');
    document.getElementById('case-active-panel')?.classList.add('hidden');
    document.getElementById('case-selection-panel')?.classList.remove('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 29: CRONOGRAMA ACADÊMICO INTELIGENTE DO SEMESTRE
  // ------------------------------------------------------------------------
  const semesterPlanningEngine = new SemesterPlanningEngine(authService, audioEngine, voiceProfessorEngine);
  window.semesterPlanningEngine = semesterPlanningEngine;

  function renderSemesterScheduleUI() {
    const plan = semesterPlanningEngine.activePlan;
    if (!plan) return;

    const grid = document.getElementById('sem-week-grid');
    const badgeHours = document.getElementById('sem-weekly-hours-badge');

    if (badgeHours) badgeHours.innerHTML = `<i class="fa-solid fa-clock"></i> ${plan.totalWeeklyHours}h planejadas / semana`;

    if (grid) {
      grid.innerHTML = Object.values(plan.schedule).map(day => `
        <div style="background:var(--bg-card); border:1px solid ${day.isAvailable ? 'var(--border-light)' : 'rgba(255,255,255,0.04)'}; border-radius:12px; padding:12px; opacity:${day.isAvailable ? '1' : '0.45'};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px;">
            <strong style="font-size:0.85rem; color:var(--text-main);">${day.day}</strong>
            <span style="font-size:0.75rem; color:var(--accent-amber);">${Math.round(day.allocatedMinutes / 60 * 10) / 10}h</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${day.blocks.length === 0 ? '<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Folga / Sem estudos</div>' : ''}
            ${day.blocks.map(b => `
              <div style="background:rgba(255,255,255,0.03); border-left:3px solid ${b.isCompleted ? '#10b981' : 'var(--accent-amber)'}; border-radius:6px; padding:8px; font-size:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                  <strong style="color:var(--text-main);">${b.subject}</strong>
                  <button style="background:none; border:none; color:${b.isLocked ? '#f59e0b' : 'var(--text-muted)'}; cursor:pointer; font-size:0.7rem;" onclick="semesterPlanningEngine.toggleBlockLock('${day.day}', '${b.id}'); renderSemesterScheduleUI();">
                    <i class="fa-solid ${b.isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
                  </button>
                </div>
                <div style="color:var(--text-muted); font-size:0.72rem; margin-bottom:4px;">${b.title}</div>
                <span class="badge-official" style="font-size:0.65rem; padding:2px 6px;">${b.durationMin}m • ${b.activityType.toUpperCase()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  }

  document.getElementById('btn-sem-generate')?.addEventListener('click', () => {
    semesterPlanningEngine.generateSemesterSchedule();
    renderSemesterScheduleUI();
    window.Toast?.success('📅 Cronograma do semestre gerado com sucesso!');
  });

  document.getElementById('btn-sem-audio')?.addEventListener('click', () => {
    const summary = semesterPlanningEngine.generateSpokenSummary();
    voiceProfessorEngine.speakResponse(summary, summary, 9990);
    window.Toast?.success('Prof. Marcos narrando o resumo da sua semana!');
  });

  document.getElementById('btn-sem-replan-missed')?.addEventListener('click', () => {
    if (!semesterPlanningEngine.activePlan) return;
    DeltaReplanner.replanDelta(semesterPlanningEngine.activePlan.schedule, 'Terça');
    renderSemesterScheduleUI();
    window.Toast?.info('🔄 Dia perdido redistribuído sem afetar tarefas concluídas!');
  });

  // ------------------------------------------------------------------------
  // ETAPA 30: CENTRAL INTELIGENTE DE NOTAS & ESTRATÉGIA ACADÊMICA
  // ------------------------------------------------------------------------
  const academicGradeService = new AcademicGradeService(authService, audioEngine, voiceProfessorEngine);
  window.academicGradeService = academicGradeService;

  function renderGradesDashboardUI() {
    const list = academicGradeService.getDashboardSummary();
    const grid = document.getElementById('grades-disciplines-grid');

    if (grid) {
      grid.innerHTML = list.map(d => `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="badge-new" style="background:${d.risk.badgeColor}; color:#000; font-size:0.7rem;">${d.risk.badgeText}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-user-tie"></i> ${d.professor}</span>
          </div>

          <h4 style="font-family:var(--font-display); font-size:1.1rem; color:var(--text-main); margin:0 0 6px 0;">${d.name}</h4>
          
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border-radius:8px; padding:10px; margin-bottom:12px;">
            <div>
              <span style="font-size:0.72rem; color:var(--text-muted); display:block;">MÉDIA ATUAL</span>
              <strong style="font-size:1.2rem; color:var(--accent-amber);">${d.calculatedGrade.currentAverage !== null ? d.calculatedGrade.currentAverage : '—'}</strong>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--text-muted); display:block;">PRESENÇA</span>
              <strong style="font-size:0.9rem; color:${d.attendanceInfo.currentPercent >= 75 ? '#10b981' : '#ef4444'};">${d.attendanceInfo.currentPercent}%</strong>
            </div>
          </div>

          <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin:0 0 12px 0;">${d.requiredGradeInfo.message}</p>

          <button class="btn-secondary btn-open-sim" data-disc-id="${d.id}" style="width:100%; font-size:0.8rem; justify-content:center; padding:8px;">
            <i class="fa-solid fa-sliders"></i> Simular Notas & Ver Memorial
          </button>
        </div>
      `).join('');

      document.querySelectorAll('.btn-open-sim').forEach(btn => {
        btn.addEventListener('click', () => {
          const discId = btn.getAttribute('data-disc-id');
          openGradeSimulator(discId);
        });
      });
    }

    updateQuickCalculatorResult('disc_penal');
  }

  function updateQuickCalculatorResult(discId) {
    const d = academicGradeService.disciplinesData.find(x => x.id === discId);
    const resBox = document.getElementById('calc-quick-result');
    if (d && resBox) {
      const req = RequiredGradeCalculator.calculateRequiredGrade(d.rule, d.grades, d.rule.passingGrade);
      resBox.innerHTML = `<strong>Diagnóstico Rápido:</strong> ${req.message}`;
    }
  }

  function openGradeSimulator(discId) {
    const d = academicGradeService.disciplinesData.find(x => x.id === discId);
    if (!d) return;

    const modal = document.getElementById('grade-simulator-modal');
    const titleEl = document.getElementById('sim-modal-title');
    const slider = document.getElementById('sim-grade-slider');
    const sliderVal = document.getElementById('sim-slider-val');
    const projAvg = document.getElementById('sim-projected-avg');
    const stepsEl = document.getElementById('sim-calc-steps');

    if (titleEl) titleEl.innerText = `Simulador de Notas: ${d.name}`;
    if (slider) {
      slider.value = 6.7;
      slider.oninput = (e) => {
        const simP2 = parseFloat(e.target.value);
        if (sliderVal) sliderVal.innerText = simP2.toFixed(1);
        const res = AcademicGradeRuleEngine.calculateSubjectGrade(d.rule, { p1: d.grades.p1, p2: simP2 });
        if (projAvg) {
          const isPass = res.currentAverage >= d.rule.passingGrade;
          projAvg.innerText = `${res.currentAverage} (${isPass ? 'Aprovado' : 'Recuperação/Final'})`;
          projAvg.style.color = isPass ? '#10b981' : '#ef4444';
        }
        if (stepsEl) stepsEl.innerText = res.steps;
      };
      slider.dispatchEvent(new Event('input'));
    }

    modal?.classList.remove('hidden');
  }

  document.getElementById('calc-select-discipline')?.addEventListener('change', (e) => {
    updateQuickCalculatorResult(e.target.value);
  });

  document.getElementById('btn-calc-ask-voice')?.addEventListener('click', () => {
    const discId = document.getElementById('calc-select-discipline')?.value || 'disc_penal';
    const d = academicGradeService.disciplinesData.find(x => x.id === discId);
    if (d) {
      const req = RequiredGradeCalculator.calculateRequiredGrade(d.rule, d.grades, d.rule.passingGrade);
      const voiceText = `Olá! Com a regra cadastrada para ${d.name}, você tirou ${d.grades.p1} na P1 com peso 4. Para fechar a média semestral de ${d.rule.passingGrade}, você precisa de pelo menos ${req.requiredGrade} na P2. Mantenha o foco que a aprovação está ao seu alcance!`;
      voiceProfessorEngine.speakResponse(voiceText, voiceText, 9989);
      window.Toast?.success('Prof. Marcos calculando e narrando sua meta!');
    }
  });

  document.getElementById('btn-close-sim-modal')?.addEventListener('click', () => {
    document.getElementById('grade-simulator-modal')?.classList.add('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 31: TRIBUNAL VIRTUAL & JÚRI SIMULADO
  // ------------------------------------------------------------------------
  const virtualTribunalEngine = new VirtualTribunalEngine(authService, audioEngine, voiceProfessorEngine);
  window.virtualTribunalEngine = virtualTribunalEngine;

  function renderTribunalFeedUI() {
    const sess = virtualTribunalEngine.activeSession;
    if (!sess) return;

    const feed = document.getElementById('tribunal-transcript-feed');
    if (feed) {
      feed.innerHTML = sess.dialogueHistory.map(msg => `
        <div style="margin-bottom:12px; padding:10px 14px; border-radius:10px; background:${msg.role === 'user' ? 'rgba(56,189,248,0.1)' : msg.role === 'opponent' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}; border:1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.3)' : msg.role === 'opponent' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'};">
          <strong style="color:${msg.role === 'user' ? '#38bdf8' : msg.role === 'opponent' ? '#ef4444' : 'var(--accent-amber)'}; display:block; font-size:0.8rem; margin-bottom:4px;">
            ${msg.speaker}:
          </strong>
          <span style="color:var(--text-main); font-size:0.88rem;">${msg.text}</span>
        </div>
      `).join('');
      feed.scrollTop = feed.scrollHeight;
    }
  }

  document.getElementById('card-trib-juri')?.addEventListener('click', () => {
    virtualTribunalEngine.startSession('juri_homicidio_1', 'defesa');
    document.getElementById('tribunal-selection-panel')?.classList.add('hidden');
    document.getElementById('tribunal-courtroom-panel')?.classList.remove('hidden');
    renderTribunalFeedUI();
    window.Toast?.success('Sessão do Tribunal do Júri iniciada! A palavra está com a Defesa.');
  });

  document.getElementById('btn-tribunal-submit-speech')?.addEventListener('click', () => {
    const inputEl = document.getElementById('tribunal-input-argument');
    const speech = inputEl?.value?.trim();
    if (!speech) return;

    const res = virtualTribunalEngine.processStudentSpeech(speech);
    if (res) {
      inputEl.value = '';
      renderTribunalFeedUI();
      window.Toast?.info('Promotoria apresentou réplica aos seus argumentos.');

      // Abre avaliação após a sustentação e réplica
      setTimeout(() => {
        const evalRes = virtualTribunalEngine.evaluateSession();
        if (evalRes) {
          const modal = document.getElementById('tribunal-eval-modal');
          const verdictBanner = document.getElementById('tribunal-verdict-banner');
          const breakdown = document.getElementById('tribunal-score-breakdown');

          if (verdictBanner) verdictBanner.innerText = `Veredicto dos Jurados: ${evalRes.verdict}`;
          if (breakdown) {
            breakdown.innerHTML = `
              <div style="font-size:1.1rem; font-weight:700; color:var(--accent-amber); margin-bottom:8px;">Nota Geral: ${evalRes.overallScore} / 100</div>
              <p style="color:var(--text-main); margin-bottom:12px;">${evalRes.feedback}</p>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <div>⚖️ Fundamentação Legal: <strong>${evalRes.scores.legalGrounds}%</strong></div>
                <div>📂 Uso da Prova Pericial: <strong>${evalRes.scores.evidenceUse}%</strong></div>
                <div>⚔️ Contraditório: <strong>${evalRes.scores.argumentation}%</strong></div>
                <div>🎙️ Oratória e Ritmo: <strong>${evalRes.scores.oratory}%</strong></div>
              </div>
            `;
          }

          modal?.classList.remove('hidden');
          const feedbackVoice = `Parabéns pela sustentação no plenário do júri! Os jurados acolheram a tese de legítima defesa e sua nota geral foi ${evalRes.overallScore}.`;
          voiceProfessorEngine.speakResponse(feedbackVoice, feedbackVoice, 9988);
        }
      }, 1200);
    }
  });

  document.getElementById('btn-tribunal-reset')?.addEventListener('click', () => {
    document.getElementById('tribunal-eval-modal')?.classList.add('hidden');
    document.getElementById('tribunal-courtroom-panel')?.classList.add('hidden');
    document.getElementById('tribunal-selection-panel')?.classList.remove('hidden');
  });

  // ------------------------------------------------------------------------
  // ETAPA 32: RESUMOS & FICHAMENTOS INTELIGENTES
  // ------------------------------------------------------------------------
  const studyTransformationService = new StudyTransformationService(authService, audioEngine, voiceProfessorEngine);
  window.studyTransformationService = studyTransformationService;

  function renderSummaryContentUI(formatType = '1min') {
    const res = studyTransformationService.generateStudyMaterial(studyTransformationService.activeSource, formatType);
    const container = document.getElementById('summary-content-display');
    if (!container) return;

    if (formatType === '1min') {
      const c = res.content;
      container.innerHTML = `
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0 0 12px 0;">${c.title}</h3>
        <p style="background:rgba(255,255,255,0.03); border-left:3px solid var(--accent-amber); padding:10px 14px; border-radius:6px; margin-bottom:14px;"><strong>Conceito Central:</strong> ${c.concept}</p>
        <strong style="color:var(--accent-amber); display:block; margin-bottom:6px;">Pontos Críticos:</strong>
        <ul style="margin:0 0 14px 20px; padding:0;">
          ${c.keyPoints.map(p => `<li>${p}</li>`).join('')}
        </ul>
        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; font-size:0.85rem; color:var(--text-main);">
          <strong style="color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Pegadinha de Prova:</strong> ${c.examTrap}
        </div>
      `;
    } else if (formatType === '5min') {
      const c = res.content;
      container.innerHTML = `
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0 0 12px 0;">${c.title}</h3>
        ${c.sections.map(s => `
          <div style="margin-bottom:12px;">
            <strong style="color:var(--accent-amber);">${s.heading}</strong>
            <p style="margin:4px 0 0 0; color:var(--text-muted);">${s.content}</p>
          </div>
        `).join('')}
      `;
    } else if (formatType === 'fichamento') {
      const c = res.content;
      container.innerHTML = `
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0 0 12px 0;">Fichamento de Conteúdo & Citações</h3>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">Fonte: ${c.metadata.sourceTitle} (${c.metadata.author})</div>
        <strong style="color:var(--accent-amber);">Ideias Centrais:</strong>
        <ul style="margin:4px 0 12px 20px; padding:0;">
          ${c.centralIdeas.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <strong style="color:var(--accent-amber);">Citações Literais da Fonte:</strong>
        <div style="background:rgba(0,0,0,0.3); border-left:3px solid #10b981; padding:10px 14px; border-radius:6px; font-style:italic; font-size:0.85rem; margin-top:6px;">
          "${c.literalQuotes[0]}"
        </div>
      `;
    } else if (formatType === 'comparison') {
      const c = res.content;
      container.innerHTML = `
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:0 0 12px 0;">${c.title}</h3>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
              <tr style="background:rgba(255,255,255,0.06); text-align:left;">
                <th style="padding:8px 12px; border:1px solid rgba(255,255,255,0.1);">Aspecto</th>
                <th style="padding:8px 12px; border:1px solid rgba(255,255,255,0.1); color:var(--accent-amber);">Dolo Eventual</th>
                <th style="padding:8px 12px; border:1px solid rgba(255,255,255,0.1); color:#38bdf8;">Culpa Consciente</th>
              </tr>
            </thead>
            <tbody>
              ${c.aspects.map(a => `
                <tr>
                  <td style="padding:8px 12px; border:1px solid rgba(255,255,255,0.06); font-weight:700;">${a.aspect}</td>
                  <td style="padding:8px 12px; border:1px solid rgba(255,255,255,0.06);">${a.doloEventual}</td>
                  <td style="padding:8px 12px; border:1px solid rgba(255,255,255,0.06);">${a.culpaConsciente}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  document.querySelectorAll('.tab-sum-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-sum-btn').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('btn-primary', 'active');
      btn.classList.remove('btn-secondary');

      const format = btn.getAttribute('data-format');
      renderSummaryContentUI(format);
    });
  });

  document.getElementById('btn-sum-listen-audio')?.addEventListener('click', () => {
    const res = studyTransformationService.generateStudyMaterial(studyTransformationService.activeSource, studyTransformationService.currentFormat);
    voiceProfessorEngine.speakResponse(res.audioScript, res.audioScript, 9987);
    window.Toast?.success('Prof. Marcos narrando o resumo em áudio!');
  });

  document.getElementById('btn-sum-make-flashcards')?.addEventListener('click', () => {
    srsEngine.createFlashcard('Legítima Defesa (Art. 25 CP)', 'Excludente de Ilicitude que exige agressão injusta atual/iminente e uso moderado dos meios.');
    window.Toast?.success('🃏 Flashcard sonoro criado e indexado no SRS!');
  });

  document.getElementById('btn-sum-make-mindmap')?.addEventListener('click', () => {
    mindMapEngine.generateMindMap('Legítima Defesa');
    window.Toast?.success('🧠 Mapa Mental gerado a partir do resumo!');
  });

  document.getElementById('btn-sum-save-notebook')?.addEventListener('click', () => {
    digitalNotebookEngine.addBlockToActivePage('paragraph', 'Resumo de Legítima Defesa (Art. 25 CP) gerado via StudyTransformationService.');
    window.Toast?.success('📚 Resumo salvo no seu Caderno Digital!');
  });

  // Render inicial do resumo de 1 min
  renderSummaryContentUI('1min');

  // ------------------------------------------------------------------------
  // Initial Boot
  // ------------------------------------------------------------------------
  try { renderLawSidebar(); } catch (e) { console.error('Error in renderLawSidebar:', e); }
  try { renderLawBanner(); } catch (e) { console.error('Error in renderLawBanner:', e); }
  try { renderChapterTabs(); } catch (e) { console.error('Error in renderChapterTabs:', e); }
  try { renderArticles(); } catch (e) { console.error('Error in renderArticles:', e); }
  try { updateFavBadge(); } catch (e) { console.error('Error in updateFavBadge:', e); }
  try { updateSrsBadge(); } catch (e) { console.error('Error in updateSrsBadge:', e); }
  try { updateUserHeaderUI(authService.getCurrentUser()); } catch (e) { console.error('Error in updateUserHeaderUI:', e); }
  try { teacherEngine.renderTeacherDashboard(); } catch (e) { console.error('Error in renderTeacherDashboard:', e); }
  try { renderAcademicIntelView(); } catch (e) { console.error('Error in renderAcademicIntelView:', e); }
  try { renderLegalUpdatesFeed(); } catch (e) { console.error('Error in renderLegalUpdatesFeed:', e); }
  try { renderOfflineStorageUI(); } catch (e) { console.error('Error in renderOfflineStorageUI:', e); }
  try { renderMindMapUI(mindMapEngine.activeMap); } catch (e) { console.error('Error in renderMindMapUI:', e); }
  try { renderNotebookTreeUI(); } catch (e) { console.error('Error in renderNotebookTreeUI:', e); }
  try { renderPageBlocksUI(); } catch (e) { console.error('Error in renderPageBlocksUI:', e); }
  try { studyManager.updateDailyGoalProgress(); } catch (e) { console.error('Error in updateDailyGoalProgress:', e); }
  try { studyManager.renderAnalyticsView(); } catch (e) { console.error('Error in renderAnalyticsView:', e); }
  try { switchView('reader'); } catch (e) { console.error('Error in switchView:', e); }
});







