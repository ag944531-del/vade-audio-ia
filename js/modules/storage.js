/**
 * VadeAudio AI - Módulo de Armazenamento, Vade Mecum Digital e Gestão Acadêmica (Etapa 3)
 * Persistência completa de Semestres, Disciplinas, Grade Semanal, Avaliações,
 * Planos de Estudo Adaptativos, Sessões no Modo Foco, Materiais e Notas.
 */

const STORAGE_KEYS = {
  FAVORITES: 'vadeaudio_favorites',
  PLAYLISTS: 'vadeaudio_playlists',
  STATS: 'vadeaudio_stats',
  SETTINGS: 'vadeaudio_settings',
  DAILY_GOAL: 'vadeaudio_daily_goal',
  AUDIO_QUEUE: 'vadeaudio_audio_queue',
  BADGES: 'vadeaudio_badges',
  HIGHLIGHTS: 'vadeaudio_highlights',
  SRS_ITEMS: 'vadeaudio_srs_items',
  DOWNLOADS: 'vadeaudio_downloads',
  VADE_HISTORY: 'vadeaudio_vade_history',
  VADE_ANNOTATIONS: 'vadeaudio_vade_annotations',
  VADE_HIGHLIGHTS_CAT: 'vadeaudio_vade_highlights_cat',
  VADE_LAW_VERSIONS: 'vadeaudio_vade_law_versions',
  WRONG_QUESTIONS: 'vadeaudio_wrong_questions',
  CUSTOM_FLASHCARDS: 'vadeaudio_custom_flashcards',
  FAVORITES_EXPANDED: 'vadeaudio_favs_expanded',
  EXAM_SESSIONS: 'vadeaudio_exam_sessions',
  SUBJECT_STATS: 'vadeaudio_subject_stats',
  // Etapa 3 - Minha Faculdade
  FACULTY_SEMESTERS: 'vadeaudio_faculty_semesters',
  FACULTY_SUBJECTS: 'vadeaudio_faculty_subjects',
  FACULTY_ASSESSMENTS: 'vadeaudio_faculty_assessments',
  FACULTY_STUDY_PLANS: 'vadeaudio_faculty_study_plans',
  FACULTY_STUDY_SESSIONS: 'vadeaudio_faculty_study_sessions',
  FACULTY_MATERIALS: 'vadeaudio_faculty_materials',
  FACULTY_AVAILABILITY: 'vadeaudio_faculty_availability',
  FACULTY_GRADE_GOALS: 'vadeaudio_faculty_grade_goals',
  // Etapa 4 - Tutor Jurídico IA
  TUTOR_SESSIONS: 'vadeaudio_tutor_sessions',
  TUTOR_ORAL_EXAMS: 'vadeaudio_tutor_oral_exams',
  TUTOR_SAVED_RESPONSES: 'vadeaudio_tutor_saved_responses',
  TUTOR_SETTINGS: 'vadeaudio_tutor_settings',
  // Etapa 5 - Meus Materiais & RAG Docs
  USER_DOCUMENTS: 'vadeaudio_user_documents',
  DOCUMENT_PAGES: 'vadeaudio_doc_pages',
  DOCUMENT_CHUNKS: 'vadeaudio_doc_chunks',
  DOCUMENT_HIGHLIGHTS: 'vadeaudio_doc_highlights',
  DOCUMENT_AI_OUTPUTS: 'vadeaudio_doc_ai_outputs',
  // Etapa 6 - OAB & Concursos Jurídicos
  OAB_PROFILES: 'vadeaudio_oab_profiles',
  OAB_MOCK_ATTEMPTS: 'vadeaudio_oab_mock_attempts',
  OAB_ERROR_NOTEBOOK: 'vadeaudio_oab_error_notebook',
  OAB_VERTICAL_SYLLABUS: 'vadeaudio_oab_vertical_syllabus',
  OAB_2PHASE_ATTEMPTS: 'vadeaudio_oab_2phase_attempts',
  OAB_APPROVAL_PLANS: 'vadeaudio_oab_approval_plans',
  // Etapa 7 - Cérebro Jurídico (Unified RAG & Universal Search)
  BRAIN_SEARCH_HISTORY: 'vadeaudio_brain_search_history',
  BRAIN_SAVED_SEARCHES: 'vadeaudio_brain_saved_searches',
  BRAIN_COLLECTIONS: 'vadeaudio_brain_collections',
  BRAIN_SETTINGS: 'vadeaudio_brain_settings',
  // Etapa 8 - Sala de Aula Inteligente (Smart Classroom)
  CLASSROOM_LESSONS: 'vadeaudio_classroom_lessons',
  CLASSROOM_TRANSCRIPTS: 'vadeaudio_classroom_transcripts',
  CLASSROOM_MARKERS: 'vadeaudio_classroom_markers',
  CLASSROOM_NOTES: 'vadeaudio_classroom_notes',
  CLASSROOM_AI_OUTPUTS: 'vadeaudio_classroom_ai_outputs',
  // Etapa 9 - Pesquisa Jurídica & Trabalhos Acadêmicos
  RESEARCH_PROJECTS: 'vadeaudio_research_projects',
  RESEARCH_SOURCES: 'vadeaudio_research_sources',
  RESEARCH_FICHAMENTOS: 'vadeaudio_research_fichamentos',
  RESEARCH_SEMINARS: 'vadeaudio_research_seminars',
  RESEARCH_SETTINGS: 'vadeaudio_research_settings',
  // Etapa 10 - Laboratório de Prática Jurídica
  PRACTICE_CASES: 'vadeaudio_practice_cases',
  PRACTICE_SESSIONS: 'vadeaudio_practice_sessions',
  PRACTICE_DRAFTS: 'vadeaudio_practice_drafts',
  PRACTICE_ORAL_ARGUMENTS: 'vadeaudio_practice_oral_arguments',
  PRACTICE_ERROR_NOTEBOOK: 'vadeaudio_practice_error_notebook',
  PRACTICE_SKILLS_METRICS: 'vadeaudio_practice_skills_metrics',
  // Etapa 11 - Evolução Acadêmica (Progression & Gamification)
  PROGRESSION_PROFILE: 'vadeaudio_progression_profile',
  PROGRESSION_XP_HISTORY: 'vadeaudio_progression_xp_history',
  PROGRESSION_DAILY_GOALS: 'vadeaudio_progression_daily_goals',
  PROGRESSION_MISSIONS: 'vadeaudio_progression_missions',
  PROGRESSION_ACHIEVEMENTS: 'vadeaudio_progression_achievements',
  PROGRESSION_SETTINGS: 'vadeaudio_progression_settings',
  // Etapa 12 - Assistente Diário (Hoje / Smart Daily Planner)
  DAILY_PLANNER_TASKS: 'vadeaudio_daily_planner_tasks',
  DAILY_PLANNER_PREFERENCES: 'vadeaudio_daily_planner_preferences',
  NOTIFICATIONS_INBOX: 'vadeaudio_notifications_inbox',
  NOTIFICATIONS_SETTINGS: 'vadeaudio_notifications_settings',
  // Etapa 13 - VadeAudio Premium (Subscription, Entitlement & Usage)
  SUBSCRIPTION_DATA: 'vadeaudio_subscription_data',
  USAGE_RECORDS: 'vadeaudio_usage_records',
  FEATURE_FLAGS: 'vadeaudio_feature_flags',
  ADMIN_AUDIT_LOGS: 'vadeaudio_admin_audit_logs',
  PROCESSED_WEBHOOKS: 'vadeaudio_processed_webhooks',
  // Etapa 33 - Modo Leitura Inteligente (Smart Reading Experience)
  READING_PROGRESS: 'vadeaudio_reading_progress',
  READING_SESSIONS: 'vadeaudio_reading_sessions',
  READING_BOOKMARKS: 'vadeaudio_reading_bookmarks',
  READING_HIGHLIGHTS: 'vadeaudio_reading_highlights',
  READING_NOTES: 'vadeaudio_reading_notes',
  READING_GLOSSARY: 'vadeaudio_reading_glossary',
  READING_PREFERENCES: 'vadeaudio_reading_preferences',
  READING_ACTIVE_RECALL: 'vadeaudio_reading_active_recall',
  // Etapa 34 - Gerador Inteligente e Validador de Questões
  GENERATED_QUESTIONS: 'vadeaudio_generated_questions',
  QUESTION_VALIDATIONS: 'vadeaudio_question_validations',
  QUESTION_REPORTS: 'vadeaudio_question_reports',
  QUESTION_REVIEW_QUEUE: 'vadeaudio_question_review_queue',
  QUESTION_REVALIDATIONS: 'vadeaudio_question_revalidations',
  // Etapa 35 - Flashcards Jurídicos Inteligentes e Adaptativos (Smart Memory Engine)
  SMART_FLASHCARDS: 'vadeaudio_smart_flashcards',
  FLASHCARD_CONCEPTS: 'vadeaudio_flashcard_concepts',
  FLASHCARD_REVIEW_EVENTS: 'vadeaudio_flashcard_review_events',
  FLASHCARD_DECKS: 'vadeaudio_flashcard_decks',
  FLASHCARD_SETTINGS: 'vadeaudio_flashcard_settings',
  // Etapa 36 - Central de Jurisprudência Inteligente
  JURISPRUDENCE_SAVES: 'vadeaudio_jurisprudence_saves',
  JURISPRUDENCE_NOTES: 'vadeaudio_jurisprudence_notes',
  JURISPRUDENCE_COLLECTIONS: 'vadeaudio_jurisprudence_collections',
  JURISPRUDENCE_ALERTS: 'vadeaudio_jurisprudence_alerts',
  // Etapa 37 - Central de Doutrina & Biblioteca Jurídica Pessoal
  LIBRARY_WORKS: 'vadeaudio_library_works',
  LIBRARY_AUTHORS: 'vadeaudio_library_authors',
  LIBRARY_QUOTES: 'vadeaudio_library_quotes',
  LIBRARY_FICHAMENTOS: 'vadeaudio_library_fichamentos',
  LIBRARY_COLLECTIONS: 'vadeaudio_library_collections',
  // Etapa 38 - Central de Peças Jurídicas & Peticionamento Acadêmico
  LEGAL_PIECE_DRAFTS: 'vadeaudio_legal_piece_drafts',
  LEGAL_PIECE_EVALUATIONS: 'vadeaudio_legal_piece_evaluations',
  LEGAL_PIECE_TEMPLATES: 'vadeaudio_legal_piece_templates',
  LEGAL_PIECE_ERRORS: 'vadeaudio_legal_piece_errors',
  // Etapa 39 - Central de Prazos Processuais & Linha do Tempo Jurídica
  DEADLINE_CALCULATIONS: 'vadeaudio_deadline_calculations',
  DEADLINE_EXERCISES: 'vadeaudio_deadline_exercises',
  DEADLINE_ERRORS: 'vadeaudio_deadline_errors',
  PROCESS_TIMELINES: 'vadeaudio_process_timelines',
  // Etapa 40 - Central de Leis Comentadas & Estudo Artigo por Artigo
  ARTICLE_ANNOTATIONS: 'vadeaudio_article_annotations',
  ARTICLE_HIGHLIGHTS: 'vadeaudio_article_highlights',
  ARTICLE_STUDY_PROFILES: 'vadeaudio_article_study_profiles',
  // Etapa 41 - Central de Revisão Inteligente Pré-Prova
  EXAM_REVISION_PLANS: 'vadeaudio_exam_revision_plans',
  EXAM_REVISION_SESSIONS: 'vadeaudio_exam_revision_sessions',
  EXAM_REVISION_SNAPSHOTS: 'vadeaudio_exam_revision_snapshots',
  // Etapa 42 - Central de Trabalhos, TCC & Pesquisa Jurídica Avançada
  ACADEMIC_PROJECTS: 'vadeaudio_academic_projects',
  ACADEMIC_PROJECT_SOURCES: 'vadeaudio_academic_project_sources',
  ACADEMIC_PROJECT_VERSIONS: 'vadeaudio_academic_project_versions',
  // Etapa 43 - Central de Provas Discursivas & Respostas Jurídicas com IA
  DISCURSIVE_QUESTIONS: 'vadeaudio_discursive_questions',
  DISCURSIVE_ATTEMPTS: 'vadeaudio_discursive_attempts',
  DISCURSIVE_EVALUATIONS: 'vadeaudio_discursive_evaluations',
  // Etapa 45 - Salas de Estudo Colaborativas em Tempo Real
  STUDY_GROUPS: 'vadeaudio_study_groups',
  STUDY_ROOM_SESSIONS: 'vadeaudio_study_room_sessions',
  STUDY_ROOM_MESSAGES: 'vadeaudio_study_room_messages',
  STUDY_ROOM_WHITEBOARD_OPS: 'vadeaudio_study_room_whiteboard_ops',
  // Etapa 46 - Importador Inteligente de Plano de Ensino & Ementa Acadêmica
  ACADEMIC_PLAN_IMPORTS: 'vadeaudio_academic_plan_imports',
  ACADEMIC_PLAN_EXTRACTIONS: 'vadeaudio_academic_plan_extractions'
};

const StorageModule = {
  // --------------------------------------------------------------------------
  // Etapa 14: Escopo de Usuário & Validação de Ownership (IDOR Prevention)
  // --------------------------------------------------------------------------
  getCurrentUserId() {
    try {
      const u = JSON.parse(localStorage.getItem('vadeaudio_current_user'));
      if (u && u.id) return u.id;
    } catch {}
    return 'usr_student_lucas_101';
  },

  getUserScopedKey(baseKey, explicitUserId = null) {
    const uid = explicitUserId || this.getCurrentUserId();
    return uid ? `${baseKey}_${uid}` : baseKey;
  },

  getUserItem(baseKey, defaultValue = null) {
    try {
      const scopedKey = this.getUserScopedKey(baseKey);
      const val = localStorage.getItem(scopedKey);
      if (val !== null) return JSON.parse(val);
      // Fallback para chave base legada
      const legacyVal = localStorage.getItem(baseKey);
      if (legacyVal !== null) return JSON.parse(legacyVal);
    } catch (e) {
      console.warn('[Storage] Erro ao ler item com escopo:', e);
    }
    return defaultValue;
  },

  setUserItem(baseKey, value) {
    try {
      const scopedKey = this.getUserScopedKey(baseKey);
      localStorage.setItem(scopedKey, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] Erro ao salvar item com escopo:', e);
    }
  },

  verifyOwnership(resource, explicitUserId = null) {
    if (!resource) return false;
    const currentUid = explicitUserId || this.getCurrentUserId();
    // Se o recurso não tem userId definido ainda, assume que pertence ao usuário logado
    if (!resource.userId) return true;
    return resource.userId === currentUid;
  },

  // --------------------------------------------------------------------------
  // Favoritos Básicos & Expandidos
  // --------------------------------------------------------------------------
  getFavorites() {
    try {
      return this.getUserItem(STORAGE_KEYS.FAVORITES, []) || [];
    } catch {
      return [];
    }
  },

  toggleFavorite(articleId) {
    let favs = this.getFavorites();
    if (favs.includes(articleId)) {
      favs = favs.filter(id => id !== articleId);
    } else {
      favs.push(articleId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return favs;
  },

  isFavorite(articleId) {
    return this.getFavorites().includes(articleId);
  },

  getExpandedFavorites(type = null) {
    try {
      const favs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES_EXPANDED)) || [];
      return type ? favs.filter(f => f.type === type) : favs;
    } catch {
      return [];
    }
  },

  toggleExpandedFavorite(type, id, metadata = {}) {
    let favs = this.getExpandedFavorites();
    const existingIdx = favs.findIndex(f => f.type === type && f.id === id);
    if (existingIdx >= 0) {
      favs.splice(existingIdx, 1);
    } else {
      favs.push({
        type,
        id,
        metadata,
        createdAt: Date.now()
      });
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES_EXPANDED, JSON.stringify(favs));
    return favs;
  },

  isExpandedFavorite(type, id) {
    const favs = this.getExpandedFavorites();
    return favs.some(f => f.type === type && f.id === id);
  },

  // --------------------------------------------------------------------------
  // Playlists e Fila de Áudio
  // --------------------------------------------------------------------------
  getPlaylists() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS));
      return stored || VADE_MECUM_DB.defaultPlaylists;
    } catch {
      return VADE_MECUM_DB.defaultPlaylists;
    }
  },

  savePlaylist(playlist) {
    const playlists = this.getPlaylists();
    const existingIndex = playlists.findIndex(p => p.id === playlist.id);
    if (existingIndex >= 0) {
      playlists[existingIndex] = playlist;
    } else {
      playlists.push(playlist);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return playlists;
  },

  getDailyGoal() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_GOAL)) || 30;
    } catch {
      return 30;
    }
  },

  setDailyGoal(minutes) {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, minutes.toString());
    return minutes;
  },

  getAudioQueue() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIO_QUEUE)) || [];
    } catch {
      return [];
    }
  },

  saveAudioQueue(queue) {
    localStorage.setItem(STORAGE_KEYS.AUDIO_QUEUE, JSON.stringify(queue));
    return queue;
  },

  // --------------------------------------------------------------------------
  // Analytics & Progresso do Estudante
  // --------------------------------------------------------------------------
  getStats() {
    const defaults = {
      secondsListened: 0,
      articlesCompleted: 0,
      streakDays: 1,
      lastListenDate: new Date().toISOString().split('T')[0]
    };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || defaults;
    } catch {
      return defaults;
    }
  },

  addListenTime(seconds, rate = 1.0) {
    const stats = this.getStats();
    stats.secondsListened += Math.round(seconds);

    const today = new Date().toISOString().split('T')[0];
    if (stats.lastListenDate !== today) {
      const lastDate = new Date(stats.lastListenDate);
      const diffTime = Math.abs(new Date(today) - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
      stats.lastListenDate = today;
    }

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  },

  incrementArticlesCompleted() {
    const stats = this.getStats();
    stats.articlesCompleted += 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  },

  getSubjectStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECT_STATS)) || {};
    } catch {
      return {};
    }
  },

  recordSubjectAttempt(subjectId, isCorrect) {
    const all = this.getSubjectStats();
    if (!all[subjectId]) {
      all[subjectId] = { correct: 0, total: 0 };
    }
    all[subjectId].total += 1;
    if (isCorrect) all[subjectId].correct += 1;
    localStorage.setItem(STORAGE_KEYS.SUBJECT_STATS, JSON.stringify(all));
    return all[subjectId];
  },

  getSettings() {
    const defaults = { speed: 1.0, voiceURI: 'xHUwLsLfyqiYOIVTzLRW', sleepTimer: 0 };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveSettings(newSettings) {
    const settings = { ...this.getSettings(), ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  // --------------------------------------------------------------------------
  // Histórico, Anotações e Grifos do Vade Mecum
  // --------------------------------------------------------------------------
  getVadeHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VADE_HISTORY)) || [];
    } catch {
      return [];
    }
  },

  addToVadeHistory(articleId) {
    let history = this.getVadeHistory();
    history = history.filter(item => item.articleId !== articleId);
    history.unshift({
      articleId,
      timestamp: Date.now()
    });
    if (history.length > 30) history = history.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.VADE_HISTORY, JSON.stringify(history));
    return history;
  },

  clearVadeHistory() {
    localStorage.removeItem(STORAGE_KEYS.VADE_HISTORY);
    return [];
  },

  getAnnotations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VADE_ANNOTATIONS)) || {};
    } catch {
      return {};
    }
  },

  getArticleAnnotation(articleId) {
    const all = this.getAnnotations();
    return all[articleId] || null;
  },

  saveAnnotation(articleId, noteText) {
    const all = this.getAnnotations();
    if (!noteText || !noteText.trim()) {
      delete all[articleId];
    } else {
      all[articleId] = {
        text: noteText.trim(),
        updatedAt: Date.now()
      };
    }
    localStorage.setItem(STORAGE_KEYS.VADE_ANNOTATIONS, JSON.stringify(all));
    return all[articleId] || null;
  },

  deleteAnnotation(articleId) {
    const all = this.getAnnotations();
    delete all[articleId];
    localStorage.setItem(STORAGE_KEYS.VADE_ANNOTATIONS, JSON.stringify(all));
    return true;
  },

  getCategorizedHighlights() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VADE_HIGHLIGHTS_CAT)) || {};
    } catch {
      return {};
    }
  },

  getArticleCategorizedHighlights(articleId) {
    const all = this.getCategorizedHighlights();
    return all[articleId] || [];
  },

  saveCategorizedHighlight(articleId, elementId, category = 'importante', color = '#f59e0b') {
    const all = this.getCategorizedHighlights();
    if (!all[articleId]) all[articleId] = [];
    all[articleId] = all[articleId].filter(h => h.elementId !== elementId);
    all[articleId].push({
      elementId,
      category,
      color,
      createdAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.VADE_HIGHLIGHTS_CAT, JSON.stringify(all));
    return all[articleId];
  },

  removeCategorizedHighlight(articleId, elementId) {
    const all = this.getCategorizedHighlights();
    if (all[articleId]) {
      all[articleId] = all[articleId].filter(h => h.elementId !== elementId);
      localStorage.setItem(STORAGE_KEYS.VADE_HIGHLIGHTS_CAT, JSON.stringify(all));
    }
    return all[articleId] || [];
  },

  // --------------------------------------------------------------------------
  // Grifos Básicos de Artigo (Por Índice / Parágrafo)
  // --------------------------------------------------------------------------
  getHighlights() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS)) || {};
    } catch {
      return {};
    }
  },

  getArticleHighlights(articleId) {
    const all = this.getHighlights();
    return all[articleId] || [];
  },

  saveHighlight(articleId, index, color = 'yellow') {
    const all = this.getHighlights();
    if (!all[articleId]) all[articleId] = [];
    all[articleId] = all[articleId].filter(h => h.index !== index);
    all[articleId].push({
      index,
      color,
      createdAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
    return all[articleId];
  },

  removeHighlight(articleId, index) {
    const all = this.getHighlights();
    if (all[articleId]) {
      all[articleId] = all[articleId].filter(h => h.index !== index);
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(all));
    }
    return all[articleId] || [];
  },

  // --------------------------------------------------------------------------
  // Questões Erradas, Flashcards e Sessões de Simulado
  // --------------------------------------------------------------------------
  getWrongQuestions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS)) || [];
    } catch {
      return [];
    }
  },

  addWrongQuestion(questionId, selectedOptionIndex = null) {
    let list = this.getWrongQuestions();
    const existingIdx = list.findIndex(item => item.questionId === questionId);
    if (existingIdx >= 0) {
      list[existingIdx].errorCount = (list[existingIdx].errorCount || 1) + 1;
      list[existingIdx].lastErrorAt = Date.now();
      list[existingIdx].selectedOptionIndex = selectedOptionIndex;
    } else {
      list.push({
        questionId,
        selectedOptionIndex,
        errorCount: 1,
        lastErrorAt: Date.now()
      });
    }
    localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(list));
    return list;
  },

  removeWrongQuestion(questionId) {
    let list = this.getWrongQuestions();
    list = list.filter(item => item.questionId !== questionId);
    localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(list));
    return list;
  },

  clearWrongQuestions() {
    localStorage.removeItem(STORAGE_KEYS.WRONG_QUESTIONS);
    return [];
  },

  getCustomFlashcards() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_FLASHCARDS));
      return stored || VADE_MECUM_DB.flashcards;
    } catch {
      return VADE_MECUM_DB.flashcards;
    }
  },

  saveFlashcard(flashcard) {
    const list = this.getCustomFlashcards();
    const idx = list.findIndex(f => f.id === flashcard.id);
    const item = {
      ...flashcard,
      last_reviewed_at: Date.now(),
      next_review_at: Date.now() + (24 * 60 * 60 * 1000),
      correct_streak: 0,
      error_count: 0
    };
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, JSON.stringify(list));
    return list;
  },

  reviewFlashcard(fcId, rating = 'medio') {
    const list = this.getCustomFlashcards();
    const fc = list.find(f => f.id === fcId);
    if (!fc) return list;

    const intervalMap = {
      'facil': 3 * 24 * 60 * 60 * 1000,
      'medio': 1 * 24 * 60 * 60 * 1000,
      'dificil': 12 * 60 * 60 * 1000
    };

    fc.last_reviewed_at = Date.now();
    fc.next_review_at = Date.now() + (intervalMap[rating] || intervalMap['medio']);
    fc.difficulty = rating;

    if (rating === 'facil' || rating === 'medio') {
      fc.correct_streak = (fc.correct_streak || 0) + 1;
    } else {
      fc.error_count = (fc.error_count || 0) + 1;
      fc.correct_streak = 0;
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLASHCARDS, JSON.stringify(list));
    return list;
  },

  getExamSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS)) || [];
    } catch {
      return [];
    }
  },

  saveExamSession(sessionData) {
    const list = this.getExamSessions();
    list.unshift({
      ...sessionData,
      completedAt: Date.now()
    });
    if (list.length > 20) list.pop();
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(list));
    return list;
  },

  getSrsItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SRS_ITEMS)) || [];
    } catch {
      return [];
    }
  },

  addOrUpdateSrsItem(articleId, isSuccess = false) {
    let items = this.getSrsItems();
    const existingIdx = items.findIndex(item => item.articleId === articleId);
    const intervals = [1, 3, 7, 14, 30];

    const now = Date.now();
    if (existingIdx >= 0) {
      const item = items[existingIdx];
      if (isSuccess) {
        item.level = Math.min(item.level + 1, intervals.length - 1);
      } else {
        item.level = Math.max(0, item.level - 1);
      }
      const days = intervals[item.level];
      item.nextReviewDate = now + (days * 24 * 60 * 60 * 1000);
      item.lastReviewed = now;
      item.reviewCount = (item.reviewCount || 0) + 1;
    } else {
      const days = intervals[0];
      items.push({
        articleId,
        level: 0,
        nextReviewDate: now + (days * 24 * 60 * 60 * 1000),
        lastReviewed: now,
        reviewCount: 1
      });
    }
    localStorage.setItem(STORAGE_KEYS.SRS_ITEMS, JSON.stringify(items));
    return items;
  },

  getSrsDueItems() {
    const items = this.getSrsItems();
    const now = Date.now();
    return items.filter(i => i.nextReviewDate <= now);
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Semestres
  // --------------------------------------------------------------------------
  getSemesters() {
    const defaults = [
      {
        id: 'sem-2026-2',
        name: '2026/2',
        startDate: '2026-08-01',
        endDate: '2026-12-20',
        status: 'atual', // 'atual' | 'arquivado'
        createdAt: Date.now()
      }
    ];
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_SEMESTERS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  getActiveSemester() {
    const semesters = this.getSemesters();
    return semesters.find(s => s.status === 'atual') || semesters[0];
  },

  saveSemester(sem) {
    const list = this.getSemesters();
    const idx = list.findIndex(s => s.id === sem.id);
    if (idx >= 0) {
      list[idx] = sem;
    } else {
      list.push(sem);
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY_SEMESTERS, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Disciplinas Acadêmicas
  // --------------------------------------------------------------------------
  getFacultySubjects() {
    const defaults = [
      {
        id: 'fac-sub-penal2',
        name: 'Direito Penal II',
        code: 'PEN202',
        professor: 'Dr. Marcos Silva',
        color: '#ef4444',
        icon: 'fa-solid fa-gavel',
        scheduleDays: ['Segunda', 'Quarta'],
        scheduleTime: '19:00 - 20:40',
        room: 'Sala 304 - Bloco B',
        semesterId: 'sem-2026-2',
        hoursTotal: 72,
        lawIds: ['cp', 'cpp'],
        notes: 'Foco em Crimes Contra a Pessoa e Crimes Contra o Patrimônio.'
      },
      {
        id: 'fac-sub-const2',
        name: 'Direito Constitucional II',
        code: 'CON202',
        professor: 'Dra. Helena Barroso',
        color: '#f59e0b',
        icon: 'fa-solid fa-landmark',
        scheduleDays: ['Terça'],
        scheduleTime: '19:00 - 22:30',
        room: 'Auditório 2',
        semesterId: 'sem-2026-2',
        hoursTotal: 72,
        lawIds: ['cf88'],
        notes: 'Ações Constitucionais, Controle de Constitucionalidade e Direitos Fundamentais.'
      },
      {
        id: 'fac-sub-proc-civil',
        name: 'Processo Civil I',
        code: 'CPC101',
        professor: 'Dr. Roberto Farias',
        color: '#818cf8',
        icon: 'fa-solid fa-file-signature',
        scheduleDays: ['Quinta'],
        scheduleTime: '19:00 - 21:40',
        room: 'Sala 102',
        semesterId: 'sem-2026-2',
        hoursTotal: 72,
        lawIds: ['cpc'],
        notes: 'Tutelas Provisórias de Urgência, Petição Inicial e Resposta do Réu.'
      },
      {
        id: 'fac-sub-civil',
        name: 'Direito Civil III (Contratos e Resp. Civil)',
        code: 'CIV301',
        professor: 'Dra. Carla Mendes',
        color: '#38bdf8',
        icon: 'fa-solid fa-scale-balanced',
        scheduleDays: ['Sexta'],
        scheduleTime: '19:00 - 21:40',
        room: 'Sala 205',
        semesterId: 'sem-2026-2',
        hoursTotal: 72,
        lawIds: ['cc', 'cdc'],
        notes: 'Responsabilidade Civil Subjetiva e Objetiva, Teoria do Risco e Danos Morais.'
      }
    ];
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_SUBJECTS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  saveFacultySubject(subject) {
    const list = this.getFacultySubjects();
    const idx = list.findIndex(s => s.id === subject.id);
    if (idx >= 0) {
      list[idx] = subject;
    } else {
      list.push(subject);
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY_SUBJECTS, JSON.stringify(list));
    return list;
  },

  deleteFacultySubject(subjectId) {
    let list = this.getFacultySubjects();
    list = list.filter(s => s.id !== subjectId);
    localStorage.setItem(STORAGE_KEYS.FACULTY_SUBJECTS, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Avaliações & Provas
  // --------------------------------------------------------------------------
  getAssessments() {
    // Calcula datas dinâmicas a partir de hoje
    const now = new Date();
    const dateP1 = new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const dateP2 = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const dateP3 = new Date(now.getTime() + (42 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    const defaults = [
      {
        id: 'ass-penal-p1',
        subjectId: 'fac-sub-penal2',
        name: 'Prova P1 - Teoria do Crime & Homicídio',
        type: 'Prova',
        date: dateP1,
        time: '19:00',
        weight: 4.0,
        maxGrade: 10.0,
        gradeObtained: null,
        contentArticles: ['cp-art1', 'cp-art25', 'cp-art121'],
        topics: 'Princípio da Anterioridade, Legítima Defesa e Homicídio Simples/Qualificado',
        notes: 'Permitida consulta ao Vade Mecum seco (sem comentários).'
      },
      {
        id: 'ass-cpc-p1',
        subjectId: 'fac-sub-proc-civil',
        name: 'Prova P1 - Tutelas Provisórias',
        type: 'Prova',
        date: dateP2,
        time: '19:00',
        weight: 4.0,
        maxGrade: 10.0,
        gradeObtained: null,
        contentArticles: ['cpc-art300'],
        topics: 'Tutela de Urgência Antecipada e Cautelar, Fumus Boni Iuris e Periculum in Mora',
        notes: 'Estudar jurisprudência recente do STJ sobre tutela em saúde.'
      },
      {
        id: 'ass-const-trab',
        subjectId: 'fac-sub-const2',
        name: 'Seminário de Controle de Constitucionalidade',
        type: 'Seminário',
        date: dateP3,
        time: '20:00',
        weight: 2.0,
        maxGrade: 10.0,
        gradeObtained: null,
        contentArticles: ['cf-art5', 'cf-art37'],
        topics: 'Direitos Fundamentais e Responsabilidade Objetiva do Estado',
        notes: 'Apresentação em grupo de até 4 pessoas.'
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_ASSESSMENTS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  saveAssessment(assessment) {
    const list = this.getAssessments();
    const idx = list.findIndex(a => a.id === assessment.id);
    if (idx >= 0) {
      list[idx] = assessment;
    } else {
      list.push(assessment);
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY_ASSESSMENTS, JSON.stringify(list));
    return list;
  },

  deleteAssessment(assessmentId) {
    let list = this.getAssessments();
    list = list.filter(a => a.id !== assessmentId);
    localStorage.setItem(STORAGE_KEYS.FACULTY_ASSESSMENTS, JSON.stringify(list));
    return list;
  },

  getUpcomingAssessments() {
    const list = this.getAssessments();
    const today = new Date().toISOString().split('T')[0];
    return list
      .filter(a => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Planos de Estudo Automáticos
  // --------------------------------------------------------------------------
  getStudyPlans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_STUDY_PLANS)) || [];
    } catch {
      return [];
    }
  },

  saveStudyPlan(plan) {
    const list = this.getStudyPlans();
    const idx = list.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      list[idx] = plan;
    } else {
      list.unshift(plan);
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY_STUDY_PLANS, JSON.stringify(list));
    return list;
  },

  togglePlanTask(planId, taskId) {
    const plans = this.getStudyPlans();
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.tasks) {
      const task = plan.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : null;
        localStorage.setItem(STORAGE_KEYS.FACULTY_STUDY_PLANS, JSON.stringify(plans));
      }
    }
    return plans;
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Sessões no Modo Foco (Pomodoro)
  // --------------------------------------------------------------------------
  getFacultySessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_STUDY_SESSIONS)) || [];
    } catch {
      return [];
    }
  },

  saveFacultySession(session) {
    const list = this.getFacultySessions();
    list.unshift({
      ...session,
      completedAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.FACULTY_STUDY_SESSIONS, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Materiais & Resumos de Aula
  // --------------------------------------------------------------------------
  getMaterials(subjectId = null) {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_MATERIALS)) || [];
      return subjectId ? list.filter(m => m.subjectId === subjectId) : list;
    } catch {
      return [];
    }
  },

  saveMaterial(mat) {
    const list = this.getMaterials();
    const idx = list.findIndex(m => m.id === mat.id);
    if (idx >= 0) {
      list[idx] = mat;
    } else {
      list.unshift({
        ...mat,
        createdAt: Date.now()
      });
    }
    localStorage.setItem(STORAGE_KEYS.FACULTY_MATERIALS, JSON.stringify(list));
    return list;
  },

  deleteMaterial(matId) {
    let list = this.getMaterials();
    list = list.filter(m => m.id !== matId);
    localStorage.setItem(STORAGE_KEYS.FACULTY_MATERIALS, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: MINHA FACULDADE - Notas e Metas
  // --------------------------------------------------------------------------
  getGradeGoals() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTY_GRADE_GOALS)) || { targetAverage: 7.0, formula: 'media_aritmetica' };
    } catch {
      return { targetAverage: 7.0, formula: 'media_aritmetica' };
    }
  },

  saveGradeGoals(data) {
    localStorage.setItem(STORAGE_KEYS.FACULTY_GRADE_GOALS, JSON.stringify(data));
    return data;
  },

  // --------------------------------------------------------------------------
  // ETAPA 4: TUTOR JURÍDICO COM INTELIGÊNCIA ARTIFICIAL
  // --------------------------------------------------------------------------
  getTutorSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTOR_SESSIONS)) || [];
    } catch {
      return [];
    }
  },

  getActiveTutorSession(subjectId = 'penal', mode = 'professor_particular') {
    const sessions = this.getTutorSessions();
    const active = sessions.find(s => s.subjectId === subjectId && s.mode === mode);
    if (active) return active;

    const newSession = {
      id: 'tut-sess-' + Date.now(),
      subjectId,
      mode,
      level: 'intermediario',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.saveTutorSession(newSession);
    return newSession;
  },

  saveTutorSession(session) {
    const list = this.getTutorSessions();
    const idx = list.findIndex(s => s.id === session.id);
    session.updatedAt = Date.now();
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.unshift(session);
    }
    if (list.length > 30) list.pop();
    localStorage.setItem(STORAGE_KEYS.TUTOR_SESSIONS, JSON.stringify(list));
    return session;
  },

  deleteTutorSession(sessionId) {
    let list = this.getTutorSessions();
    list = list.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.TUTOR_SESSIONS, JSON.stringify(list));
    return list;
  },

  clearActiveSessionMessages(sessionId) {
    const list = this.getTutorSessions();
    const s = list.find(item => item.id === sessionId);
    if (s) {
      s.messages = [];
      s.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.TUTOR_SESSIONS, JSON.stringify(list));
    }
    return s;
  },

  getOralExams() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTOR_ORAL_EXAMS)) || [];
    } catch {
      return [];
    }
  },

  saveOralExam(examData) {
    const list = this.getOralExams();
    list.unshift({
      ...examData,
      completedAt: Date.now()
    });
    if (list.length > 20) list.pop();
    localStorage.setItem(STORAGE_KEYS.TUTOR_ORAL_EXAMS, JSON.stringify(list));
    return list;
  },

  getTutorSavedResponses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTOR_SAVED_RESPONSES)) || [];
    } catch {
      return [];
    }
  },

  saveTutorResponse(item) {
    const list = this.getTutorSavedResponses();
    list.unshift({
      ...item,
      id: 'saved-resp-' + Date.now(),
      savedAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.TUTOR_SAVED_RESPONSES, JSON.stringify(list));
    return list;
  },

  getTutorSettings() {
    const defaults = {
      defaultLevel: 'intermediario',
      defaultMode: 'professor_particular',
      autoAudio: false,
      voiceSpeed: 1.0
    };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUTOR_SETTINGS)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveTutorSettings(settings) {
    const current = this.getTutorSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.TUTOR_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // --------------------------------------------------------------------------
  // ETAPA 5: MEUS MATERIAIS & ESTUDO DE DOCUMENTOS (RAG / AI DOCS)
  // --------------------------------------------------------------------------
  getUserDocuments() {
    const defaults = [
      {
        id: 'doc-penal-apostila',
        name: 'Apostila — Direito Penal II (Crimes Contra a Pessoa).pdf',
        sizeFormatted: '2.4 MB',
        sizeBytes: 2516582,
        type: 'pdf',
        subjectId: 'penal',
        assessmentId: 'ass-penal-p1',
        professor: 'Dr. Marcos Silva',
        totalPages: 18,
        uploadedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
        status: 'pronto',
        topics: ['Homicídio Simples e Qualificado', 'Lesão Corporal', 'Crimes Contra a Honra']
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  getUserDocument(docId) {
    const list = this.getUserDocuments();
    return list.find(d => d.id === docId) || null;
  },

  saveUserDocument(doc) {
    const list = this.getUserDocuments();
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...doc, updatedAt: Date.now() };
    } else {
      list.unshift({ ...doc, uploadedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.USER_DOCUMENTS, JSON.stringify(list));
    return doc;
  },

  deleteUserDocument(docId) {
    let list = this.getUserDocuments();
    list = list.filter(d => d.id !== docId);
    localStorage.setItem(STORAGE_KEYS.USER_DOCUMENTS, JSON.stringify(list));

    // Remove derivados (páginas, chunks, destaques e saídas de IA)
    this.deleteDocumentPages(docId);
    this.deleteDocumentChunks(docId);
    this.deleteDocumentHighlights(docId);
    this.deleteDocumentAiOutputs(docId);
    return list;
  },

  getDocumentPages(docId) {
    const defaultPages = {
      'doc-penal-apostila': [
        {
          pageNumber: 1,
          text: 'APOSTILA DE DIREITO PENAL II\nProfessor Dr. Marcos Silva\n\nCapítulo I: Crimes Contra a Vida\n\n1. Do Homicídio (Art. 121 do Código Penal)\nO homicídio é a eliminação da vida humana praticada por outrem. Classifica-se em simples, privilegiado e qualificado.'
        },
        {
          pageNumber: 2,
          text: '2. Do Homicídio Qualificado (§ 2º do Art. 121 CP)\nAs qualificadoras dividem-se em subjetivas (motivo fútil, torpe) e objetivas (meio cruel, veneno, emboscada).\n\nAtenção para a prova: No homicídio qualificado-privilegiado, a qualificadora deve ser de ordem puramente objetiva.'
        },
        {
          pageNumber: 3,
          text: '3. Da Legítima Defesa e Excludentes (Art. 25 do CP)\nA legítima defesa exige agressão injusta, atual ou iminente, uso moderado dos meios necessários e animus defendendi.'
        }
      ]
    };

    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_PAGES)) || {};
      return all[docId] || defaultPages[docId] || [];
    } catch {
      return defaultPages[docId] || [];
    }
  },

  saveDocumentPages(docId, pages) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_PAGES)) || {};
    all[docId] = pages;
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_PAGES, JSON.stringify(all));
    return pages;
  },

  deleteDocumentPages(docId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_PAGES)) || {};
    delete all[docId];
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_PAGES, JSON.stringify(all));
  },

  getDocumentChunks(docId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_CHUNKS)) || {};
      return all[docId] || [];
    } catch {
      return [];
    }
  },

  saveDocumentChunks(docId, chunks) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_CHUNKS)) || {};
    all[docId] = chunks;
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_CHUNKS, JSON.stringify(all));
    return chunks;
  },

  deleteDocumentChunks(docId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_CHUNKS)) || {};
    delete all[docId];
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_CHUNKS, JSON.stringify(all));
  },

  getDocumentHighlights(docId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_HIGHLIGHTS)) || {};
      return all[docId] || [];
    } catch {
      return [];
    }
  },

  saveDocumentHighlight(docId, item) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_HIGHLIGHTS)) || {};
    if (!all[docId]) all[docId] = [];
    all[docId].push({ ...item, id: 'hl-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_HIGHLIGHTS, JSON.stringify(all));
    return all[docId];
  },

  deleteDocumentHighlights(docId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_HIGHLIGHTS)) || {};
    delete all[docId];
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_HIGHLIGHTS, JSON.stringify(all));
  },

  getDocumentAiOutputs(docId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_AI_OUTPUTS)) || {};
      return all[docId] || {};
    } catch {
      return {};
    }
  },

  saveDocumentAiOutput(docId, type, output) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_AI_OUTPUTS)) || {};
    if (!all[docId]) all[docId] = {};
    all[docId][type] = {
      content: output,
      generatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_AI_OUTPUTS, JSON.stringify(all));
    return all[docId][type];
  },

  deleteDocumentAiOutputs(docId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENT_AI_OUTPUTS)) || {};
    delete all[docId];
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_AI_OUTPUTS, JSON.stringify(all));
  },

  // --------------------------------------------------------------------------
  // ETAPA 6: OAB & CONCURSOS JURÍDICOS
  // --------------------------------------------------------------------------
  getOabProfile() {
    const defaults = {
      targetExam: 'oab_1fase', // 'oab_1fase' | 'oab_2fase' | 'concurso'
      targetCareer: 'Advocacia (OAB)',
      secondPhaseArea: 'penal',
      targetScorePercent: 70,
      examDate: '2026-11-15',
      weeklyHours: 14
    };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_PROFILES)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveOabProfile(profile) {
    const current = this.getOabProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.OAB_PROFILES, JSON.stringify(updated));
    return updated;
  },

  getOabMockAttempts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_MOCK_ATTEMPTS)) || [];
    } catch {
      return [];
    }
  },

  saveOabMockAttempt(attempt) {
    const list = this.getOabMockAttempts();
    list.unshift({
      ...attempt,
      id: 'oab-attempt-' + Date.now(),
      completedAt: Date.now()
    });
    if (list.length > 25) list.pop();
    localStorage.setItem(STORAGE_KEYS.OAB_MOCK_ATTEMPTS, JSON.stringify(list));
    return list;
  },

  getOabErrorNotebook() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_ERROR_NOTEBOOK)) || [];
    } catch {
      return [];
    }
  },

  saveOabError(errorItem) {
    let list = this.getOabErrorNotebook();
    const existingIdx = list.findIndex(e => e.questionId === errorItem.questionId);
    if (existingIdx >= 0) {
      list[existingIdx].errorCount = (list[existingIdx].errorCount || 1) + 1;
      list[existingIdx].reason = errorItem.reason || list[existingIdx].reason;
      list[existingIdx].lastErrorAt = Date.now();
    } else {
      list.unshift({
        ...errorItem,
        id: 'oab-err-' + Date.now(),
        errorCount: 1,
        reason: errorItem.reason || 'Não sabia', // 'Não sabia' | 'Confundi conceitos' | 'Falta de atenção' | 'Esqueci artigo' | 'Chutei'
        lastErrorAt: Date.now()
      });
    }
    localStorage.setItem(STORAGE_KEYS.OAB_ERROR_NOTEBOOK, JSON.stringify(list));
    return list;
  },

  removeOabError(questionId) {
    let list = this.getOabErrorNotebook();
    list = list.filter(e => e.questionId !== questionId);
    localStorage.setItem(STORAGE_KEYS.OAB_ERROR_NOTEBOOK, JSON.stringify(list));
    return list;
  },

  getVerticalSyllabus() {
    const defaults = [
      { id: 'syl-const-1', subjectId: 'constitucional', title: 'Direitos e Garantias Fundamentais (Art. 5º CF)', status: 'dominado' },
      { id: 'syl-const-2', subjectId: 'constitucional', title: 'Controle de Constitucionalidade (Concentrado e Difuso)', status: 'revisando' },
      { id: 'syl-const-3', subjectId: 'constitucional', title: 'Organização dos Poderes e Funções Essenciais à Justiça', status: 'estudando' },
      { id: 'syl-penal-1', subjectId: 'penal', title: 'Teoria do Crime e Excludentes de Ilicitude (Art. 25 CP)', status: 'dominado' },
      { id: 'syl-penal-2', subjectId: 'penal', title: 'Crimes Contra a Vida (Art. 121 CP)', status: 'revisando' },
      { id: 'syl-penal-3', subjectId: 'penal', title: 'Concurso de Pessoas e Aplicação da Pena', status: 'nao_iniciado' },
      { id: 'syl-cpc-1', subjectId: 'processo_civil', title: 'Tutelas Provisórias de Urgência e Evidência (Art. 300 CPC)', status: 'estudando' },
      { id: 'syl-cpc-2', subjectId: 'processo_civil', title: 'Recursos no CPC: Apelação e Agravo de Instrumento', status: 'nao_iniciado' },
      { id: 'syl-etica-1', subjectId: 'etica_oab', title: 'Prerrogativas do Advogado (Art. 7º EAOAB)', status: 'dominado' },
      { id: 'syl-etica-2', subjectId: 'etica_oab', title: 'Incompatibilidades, Impedimentos e Honorários', status: 'revisando' }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_VERTICAL_SYLLABUS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  updateSyllabusItemStatus(itemId, newStatus) {
    const list = this.getVerticalSyllabus();
    const item = list.find(i => i.id === itemId);
    if (item) {
      item.status = newStatus; // 'nao_iniciado' | 'estudando' | 'revisando' | 'dominado'
      localStorage.setItem(STORAGE_KEYS.OAB_VERTICAL_SYLLABUS, JSON.stringify(list));
    }
    return list;
  },

  get2PhaseAttempts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_2PHASE_ATTEMPTS)) || [];
    } catch {
      return [];
    }
  },

  save2PhaseAttempt(attempt) {
    const list = this.get2PhaseAttempts();
    list.unshift({
      ...attempt,
      id: 'oab2p-' + Date.now(),
      createdAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.OAB_2PHASE_ATTEMPTS, JSON.stringify(list));
    return list;
  },

  getOabApprovalPlans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OAB_APPROVAL_PLANS)) || [];
    } catch {
      return [];
    }
  },

  saveOabApprovalPlan(plan) {
    const list = this.getOabApprovalPlans();
    list.unshift({
      ...plan,
      id: 'plan-oab-' + Date.now(),
      createdAt: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.OAB_APPROVAL_PLANS, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 7: CÉREBRO JURÍDICO (UNIVERSAL SEARCH & UNIFIED RAG)
  // --------------------------------------------------------------------------
  getBrainSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAIN_SEARCH_HISTORY)) || [
        'Art. 121 CP',
        'Tutela de urgência',
        'Legítima defesa'
      ];
    } catch {
      return [];
    }
  },

  saveBrainSearchHistory(query) {
    if (!query || !query.trim()) return;
    let list = this.getBrainSearchHistory();
    list = list.filter(q => q.toLowerCase() !== query.toLowerCase());
    list.unshift(query.trim());
    if (list.length > 15) list.pop();
    localStorage.setItem(STORAGE_KEYS.BRAIN_SEARCH_HISTORY, JSON.stringify(list));
    return list;
  },

  clearBrainSearchHistory() {
    localStorage.setItem(STORAGE_KEYS.BRAIN_SEARCH_HISTORY, JSON.stringify([]));
  },

  getBrainSavedSearches() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAIN_SAVED_SEARCHES)) || [
        { id: 'save-1', query: 'Legítima defesa e excludentes', savedAt: Date.now() - 86400000 },
        { id: 'save-2', query: 'Tutela de urgência (Art. 300 CPC)', savedAt: Date.now() - 172800000 }
      ];
    } catch {
      return [];
    }
  },

  saveBrainSavedSearch(query) {
    const list = this.getBrainSavedSearches();
    const existing = list.find(s => s.query.toLowerCase() === query.toLowerCase());
    if (!existing) {
      list.unshift({
        id: 'saved-search-' + Date.now(),
        query,
        savedAt: Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.BRAIN_SAVED_SEARCHES, JSON.stringify(list));
    }
    return list;
  },

  deleteBrainSavedSearch(id) {
    let list = this.getBrainSavedSearches();
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRAIN_SAVED_SEARCHES, JSON.stringify(list));
    return list;
  },

  getBrainCollections() {
    const defaults = [
      {
        id: 'col-p1-penal',
        title: 'Coleção: Prova P1 de Direito Penal II',
        subjectId: 'penal',
        createdAt: Date.now() - 259200000,
        items: [
          { type: 'law', title: 'Art. 121 CP (Homicídio)', id: 'cp-art121' },
          { type: 'law', title: 'Art. 25 CP (Legítima Defesa)', id: 'cp-art25' },
          { type: 'material', title: 'Apostila — Direito Penal II.pdf (Páginas 1 a 3)', id: 'doc-penal-apostila' },
          { type: 'question', title: 'Questão OAB sobre Homicídio Qualificado', id: 'q-oab-penal-1' }
        ]
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAIN_COLLECTIONS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  saveBrainCollection(col) {
    const list = this.getBrainCollections();
    const idx = list.findIndex(c => c.id === col.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...col, updatedAt: Date.now() };
    } else {
      list.unshift({ ...col, id: 'col-' + Date.now(), createdAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.BRAIN_COLLECTIONS, JSON.stringify(list));
    return list;
  },

  deleteBrainCollection(id) {
    let list = this.getBrainCollections();
    list = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRAIN_COLLECTIONS, JSON.stringify(list));
    return list;
  },

  getBrainSettings() {
    const defaults = {
      searchMode: 'hybrid', // 'hybrid' | 'only_my_sources' | 'only_official'
      maxResults: 10,
      autoAudio: false
    };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAIN_SETTINGS)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveBrainSettings(settings) {
    const current = this.getBrainSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.BRAIN_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  getVadeAnnotations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VADE_ANNOTATIONS)) || {
        'cp-art25': 'Atenção aos requisitos da legítima defesa: moderação dos meios e agressão atual/iminente.'
      };
    } catch {
      return {};
    }
  },

  saveVadeAnnotation(artId, text) {
    const all = this.getVadeAnnotations();
    all[artId] = text;
    localStorage.setItem(STORAGE_KEYS.VADE_ANNOTATIONS, JSON.stringify(all));
    return all;
  },

  // --------------------------------------------------------------------------
  // ETAPA 8: SALA DE AULA INTELIGENTE (SMART CLASSROOM)
  // --------------------------------------------------------------------------
  getClassroomLessons() {
    const defaults = [
      {
        id: 'lesson-penal-homicidio',
        title: 'Aula 04 — Homicídio Qualificado e Excludentes',
        subjectId: 'penal',
        professor: 'Dr. Marcos Silva',
        durationFormatted: '42:15',
        durationSeconds: 2535,
        audioUrl: '', // Gravado/Enviado
        recordedAt: Date.now() - 172800000,
        status: 'pronto',
        examPointsCount: 3,
        topics: ['Homicídio Qualificado (§ 2º)', 'Compatibilidade com Privilégio', 'Legítima Defesa Real']
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_LESSONS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  getClassroomLesson(id) {
    const list = this.getClassroomLessons();
    return list.find(l => l.id === id) || null;
  },

  saveClassroomLesson(lesson) {
    const list = this.getClassroomLessons();
    const idx = list.findIndex(l => l.id === lesson.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...lesson, updatedAt: Date.now() };
    } else {
      list.unshift({ ...lesson, recordedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_LESSONS, JSON.stringify(list));
    return lesson;
  },

  deleteClassroomLesson(id) {
    let list = this.getClassroomLessons();
    list = list.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_LESSONS, JSON.stringify(list));

    // Remove derivados
    this.deleteLessonTranscripts(id);
    this.deleteLessonMarkers(id);
    this.deleteLessonNotes(id);
    this.deleteLessonAiOutputs(id);
    return list;
  },

  getLessonTranscripts(lessonId) {
    const defaultTranscripts = {
      'lesson-penal-homicidio': {
        raw_transcript: 'Boa noite turma. Hoje vamos analisar o Artigo 121 do Código Penal. Atenção redobrada porque isso sempre cai na prova: o homicídio qualificado-privilegiado exige qualificadora puramente objetiva. Meio insidioso ou cruel. Não confundam com motivo fútil ou torpe.',
        formatted_transcript: 'Boa noite, turma. Hoje vamos analisar o Artigo 121 do Código Penal.\n\nAtenção redobrada porque isso sempre cai na prova: o homicídio qualificado-privilegiado exige qualificadora puramente objetiva (como meio insidioso ou cruel). Não confundam com motivo fútil ou torpe.',
        segments: [
          {
            id: 'seg-1',
            startTime: 0,
            endTime: 18,
            timestampFormatted: '00:00',
            text: 'Boa noite, turma. Hoje vamos analisar o Artigo 121 do Código Penal.',
            isExamPoint: false,
            citedLaw: 'Art. 121 CP'
          },
          {
            id: 'seg-2',
            startTime: 19,
            endTime: 45,
            timestampFormatted: '00:19',
            text: 'Atenção redobrada porque isso sempre cai na prova: o homicídio qualificado-privilegiado exige qualificadora puramente objetiva.',
            isExamPoint: true,
            citedLaw: 'Art. 121, § 2º CP'
          },
          {
            id: 'seg-3',
            startTime: 46,
            endTime: 75,
            timestampFormatted: '00:46',
            text: 'Meio insidioso ou cruel. Não confundam com motivo fútil ou torpe que são de ordem subjetiva.',
            isExamPoint: false,
            citedLaw: null
          }
        ]
      }
    };

    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_TRANSCRIPTS)) || {};
      return all[lessonId] || defaultTranscripts[lessonId] || null;
    } catch {
      return defaultTranscripts[lessonId] || null;
    }
  },

  saveLessonTranscripts(lessonId, data) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_TRANSCRIPTS)) || {};
    all[lessonId] = data;
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_TRANSCRIPTS, JSON.stringify(all));
    return data;
  },

  deleteLessonTranscripts(lessonId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_TRANSCRIPTS)) || {};
    delete all[lessonId];
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_TRANSCRIPTS, JSON.stringify(all));
  },

  getLessonMarkers(lessonId) {
    const defaultMarkers = {
      'lesson-penal-homicidio': [
        { id: 'mk-1', timestamp: 19, timestampFormatted: '00:19', type: 'cai_na_prova', label: '🎯 Cai na Prova: Qualificadora objetiva no privilégio' }
      ]
    };

    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_MARKERS)) || {};
      return all[lessonId] || defaultMarkers[lessonId] || [];
    } catch {
      return defaultMarkers[lessonId] || [];
    }
  },

  saveLessonMarker(lessonId, marker) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_MARKERS)) || {};
    if (!all[lessonId]) all[lessonId] = [];
    all[lessonId].push({ ...marker, id: 'mk-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_MARKERS, JSON.stringify(all));
    return all[lessonId];
  },

  deleteLessonMarkers(lessonId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_MARKERS)) || {};
    delete all[lessonId];
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_MARKERS, JSON.stringify(all));
  },

  getLessonNotes(lessonId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_NOTES)) || {};
      return all[lessonId] || '';
    } catch {
      return '';
    }
  },

  saveLessonNotes(lessonId, notes) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_NOTES)) || {};
    all[lessonId] = notes;
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_NOTES, JSON.stringify(all));
    return notes;
  },

  deleteLessonNotes(lessonId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_NOTES)) || {};
    delete all[lessonId];
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_NOTES, JSON.stringify(all));
  },

  getLessonAiOutputs(lessonId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_AI_OUTPUTS)) || {};
      return all[lessonId] || {};
    } catch {
      return {};
    }
  },

  saveLessonAiOutput(lessonId, type, output) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_AI_OUTPUTS)) || {};
    if (!all[lessonId]) all[lessonId] = {};
    all[lessonId][type] = {
      content: output,
      generatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_AI_OUTPUTS, JSON.stringify(all));
    return all[lessonId][type];
  },

  deleteLessonAiOutputs(lessonId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSROOM_AI_OUTPUTS)) || {};
    delete all[lessonId];
    localStorage.setItem(STORAGE_KEYS.CLASSROOM_AI_OUTPUTS, JSON.stringify(all));
  },

  // --------------------------------------------------------------------------
  // ETAPA 9: PESQUISA JURÍDICA & TRABALHOS ACADÊMICOS
  // --------------------------------------------------------------------------
  getResearchProjects() {
    const defaults = [
      {
        id: 'proj-resp-ia',
        title: 'Responsabilidade Civil por Inteligência Artificial',
        type: 'artigo', // 'artigo' | 'tcc' | 'fichamento' | 'resumo' | 'seminario' | 'estudo_caso'
        subjectId: 'civil',
        professor: 'Dra. Helena Menezes',
        institution: 'Faculdade de Direito',
        dueDate: '2026-09-30',
        theme: 'Responsabilidade civil objetiva por decisões autônomas e algoritmos de IA',
        status: 'em_andamento',
        progress: 60,
        createdAt: Date.now() - 604800000,
        checklist: [
          { id: 'chk-1', text: 'Tema e problema de pesquisa definidos', done: true },
          { id: 'chk-2', text: 'Fontes e julgados coletados', done: true },
          { id: 'chk-3', text: 'Fichamentos de doutrina realizados', done: true },
          { id: 'chk-4', text: 'Introdução e contextualização', done: true },
          { id: 'chk-5', text: 'Desenvolvimento e antítese', done: false },
          { id: 'chk-6', text: 'Conclusão e referências ABNT', done: false },
          { id: 'chk-7', text: 'Revisão final de estilo', done: false }
        ],
        sections: [
          {
            id: 'sec-1',
            title: '1. Introdução e Problema de Pesquisa',
            content: 'A crescente autonomia dos sistemas de inteligência artificial suscita debates cruciais acerca da imputabilidade e do dever de indenizar no ordenamento jurídico brasileiro. O presente trabalho examina se a teoria do risco da atividade (Art. 927, parágrafo único, do Código Civil) é suficiente para amparar os danos decorrentes de decisões algorítmicas autônomas.'
          },
          {
            id: 'sec-2',
            title: '2. Fundamentos da Responsabilidade Civil no Código Civil',
            content: 'Nos termos dos Arts. 186 e 927 do Código Civil brasileiro, aquele que causar dano a outrem comete ato ilícito e fica obrigado a repará-lo. Na esfera das tecnologias autônomas, a caracterização da culpa torna-se complexa devido à opacidade decisória (black box), justificando a incidência da responsabilidade civil objetiva com esteio na teoria do risco criado.'
          }
        ]
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_PROJECTS));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  getResearchProject(id) {
    const list = this.getResearchProjects();
    return list.find(p => p.id === id) || null;
  },

  saveResearchProject(project) {
    const list = this.getResearchProjects();
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...project, updatedAt: Date.now() };
    } else {
      list.unshift({ ...project, createdAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.RESEARCH_PROJECTS, JSON.stringify(list));
    return project;
  },

  deleteResearchProject(id) {
    let list = this.getResearchProjects();
    list = list.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESEARCH_PROJECTS, JSON.stringify(list));

    // Remove fontes e fichamentos associados
    this.deleteProjectSources(id);
    this.deleteProjectFichamentos(id);
    return list;
  },

  getProjectSources(projId) {
    const defaultSources = {
      'proj-resp-ia': [
        {
          id: 'src-1',
          type: 'lei', // 'lei' | 'jurisprudencia' | 'livro' | 'artigo_pdf'
          title: 'Código Civil (Lei nº 10.406/2002)',
          author: 'BRASIL',
          year: '2002',
          lawArticle: 'Art. 927, Parágrafo Único',
          verified: true
        },
        {
          id: 'src-2',
          type: 'livro',
          title: 'Novo Curso de Direito Civil — Responsabilidade Civil',
          author: 'GAGLIANO, Pablo Stolze; PAMPLONA FILHO, Rodolfo',
          year: '2024',
          publisher: 'SaraivaJur',
          city: 'São Paulo',
          pages: '142-155',
          verified: true
        }
      ]
    };

    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_SOURCES)) || {};
      return all[projId] || defaultSources[projId] || [];
    } catch {
      return defaultSources[projId] || [];
    }
  },

  saveProjectSource(projId, source) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_SOURCES)) || {};
    if (!all[projId]) all[projId] = [];
    all[projId].push({ ...source, id: 'src-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.RESEARCH_SOURCES, JSON.stringify(all));
    return all[projId];
  },

  deleteProjectSources(projId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_SOURCES)) || {};
    delete all[projId];
    localStorage.setItem(STORAGE_KEYS.RESEARCH_SOURCES, JSON.stringify(all));
  },

  getProjectFichamentos(projId) {
    const defaultFichamentos = {
      'proj-resp-ia': [
        {
          id: 'fich-1',
          sourceTitle: 'Novo Curso de Direito Civil — Gagliano & Pamplona (2024)',
          theme: 'Teoria do Risco Criado',
          directQuote: 'Aquele que lucra com uma atividade potencialmente lesiva deve responder pelos riscos dela decorrentes, independentemente de demonstração de culpa.',
          page: '148',
          comment: 'Fundamento ideal para justificar a responsabilidade dos desenvolvedores e operadores de sistemas de IA.',
          createdAt: Date.now() - 360000000
        }
      ]
    };

    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_FICHAMENTOS)) || {};
      return all[projId] || defaultFichamentos[projId] || [];
    } catch {
      return defaultFichamentos[projId] || [];
    }
  },

  saveProjectFichamento(projId, fichamento) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_FICHAMENTOS)) || {};
    if (!all[projId]) all[projId] = [];
    all[projId].push({ ...fichamento, id: 'fich-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.RESEARCH_FICHAMENTOS, JSON.stringify(all));
    return all[projId];
  },

  deleteProjectFichamentos(projId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESEARCH_FICHAMENTOS)) || {};
    delete all[projId];
    localStorage.setItem(STORAGE_KEYS.RESEARCH_FICHAMENTOS, JSON.stringify(all));
  },

  // --------------------------------------------------------------------------
  // ETAPA 10: LABORATÓRIO DE PRÁTICA JURÍDICA
  // --------------------------------------------------------------------------
  getPracticeCases() {
    const defaults = [
      {
        id: 'case-civ-01',
        title: 'Vício Oculto em Veículo Automotor e Dano Moral',
        subjectId: 'civil',
        difficulty: 'iniciante', // 'iniciante' | 'intermediario' | 'avancado'
        category: 'Direito do Consumidor & Civil',
        disclaimer: 'Caso fictício gerado para fins exclusivos de treinamento acadêmico.',
        client: {
          name: 'Renato Albuquerque',
          age: 38,
          occupation: 'Comerciante',
          emotionalState: 'Indignado com a concessionária',
          initialStatement: 'Boa tarde, doutor. Comprei um carro seminovo há 40 dias e o motor fundiu completamente. A concessionária se recusa a consertar!',
          details: {
            purchaseDate: 'Há 40 dias',
            seller: 'AutoFácil Veículos Ltda.',
            contract: 'Sim, recibo de compra e venda',
            attempts: 'Tentou contato no SAC duas vezes, sem retorno',
            damage: 'R$ 18.000,00 de prejuízo no motor',
            goal: 'Quer a troca do motor ou cancelamento da compra com indenização'
          }
        },
        legalDiagnosis: {
          subject: 'Consumidor / Civil',
          competence: 'Vara Cível ou Juizado Especial Cível (JEC)',
          properAction: 'Ação de Obrigação de Fazer c/c Restituição de Valores e Indenização por Danos Morais',
          laws: ['Art. 18 do CDC', 'Art. 186 do Código Civil', 'Art. 927 do Código Civil'],
          pedidos: ['Substituição do produto ou devolução do valor', 'Indenização por dano moral']
        }
      },
      {
        id: 'case-pen-01',
        title: 'Alegação de Legítima Defesa em Lesão Corporal',
        subjectId: 'penal',
        difficulty: 'intermediario',
        category: 'Direito Penal & Processo Penal',
        disclaimer: 'Caso fictício gerado para fins exclusivos de treinamento acadêmico.',
        client: {
          name: 'Lucas Ferreira',
          age: 26,
          occupation: 'Auxiliar de Almoxarifado',
          emotionalState: 'Apreensivo com a intimação da delegacia',
          initialStatement: 'Doutor, fui intimado pela polícia por uma briga em uma lanchonete. Mas eu só me defendi porque o rapaz me atacou com uma garrafa quebrada!',
          details: {
            incidentDate: 'Há 15 dias',
            witnesses: 'O garçom presenciou o início da agressão injusta',
            evidence: 'Câmera de segurança externa da rua vizinha',
            damage: 'Escoriações leves no braço ao repelir o golpe',
            goal: 'Reconhecimento da excludente de ilicitude no inquérito policial'
          }
        },
        legalDiagnosis: {
          subject: 'Direito Penal',
          competence: 'Vara Criminal / Juizado Especial Criminal',
          properAction: 'Defesa Prévia / Resposta à Acusação com pedido de Absolvição Sumária (Art. 397, I do CPP)',
          laws: ['Art. 23, II do CP', 'Art. 25 do CP', 'Art. 397, I do CPP'],
          pedidos: ['Absolvição sumária por legítima defesa real']
        }
      }
    ];

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRACTICE_CASES));
      return (stored && stored.length > 0) ? stored : defaults;
    } catch {
      return defaults;
    }
  },

  getPracticeCase(id) {
    const list = this.getPracticeCases();
    return list.find(c => c.id === id) || null;
  },

  getPracticeSkillsMetrics() {
    const defaults = {
      entrevista: 84,
      identificacaoPeca: 78,
      fundamentacao: 72,
      oratoria: 80,
      analiseProva: 68
    };

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRACTICE_SKILLS_METRICS)) || defaults;
    } catch {
      return defaults;
    }
  },

  updatePracticeSkill(skillKey, newScore) {
    const current = this.getPracticeSkillsMetrics();
    current[skillKey] = Math.round((current[skillKey] + newScore) / 2);
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SKILLS_METRICS, JSON.stringify(current));
    return current;
  },

  getPracticeDrafts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRACTICE_DRAFTS)) || [];
    } catch {
      return [];
    }
  },

  savePracticeDraft(draft) {
    const list = this.getPracticeDrafts();
    list.unshift({ ...draft, id: 'draft-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.PRACTICE_DRAFTS, JSON.stringify(list));
    return draft;
  },

  getPracticeErrors() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRACTICE_ERROR_NOTEBOOK)) || [
        {
          id: 'err-1',
          caseTitle: 'Vício Oculto em Veículo',
          errorType: 'Competência',
          description: 'Endereçou a petição ao Juizado Criminal em vez de Vara Cível / JEC.',
          correction: 'Ações de consumo reparatórias competem às Varas Cíveis ou JEC.'
        }
      ];
    } catch {
      return [];
    }
  },

  savePracticeError(errorItem) {
    const list = this.getPracticeErrors();
    list.unshift({ ...errorItem, id: 'err-' + Date.now(), createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.PRACTICE_ERROR_NOTEBOOK, JSON.stringify(list));
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 11: EVOLUÇÃO ACADÊMICA (PROGRESSION & GAMIFICATION)
  // --------------------------------------------------------------------------
  getProgressionProfile() {
    const defaults = {
      level: 12,
      xp: 2840,
      nextLevelXp: 3200,
      streakDays: 8,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalMinutes: 1420,
      questionsAnswered: 340,
      flashcardsReviewed: 215,
      articlesRead: 88,
      mocksCompleted: 6,
      casesCompleted: 4,
      subjectLevels: {
        penal: { level: 8, xp: 820, domainPercent: 78 },
        civil: { level: 6, xp: 610, domainPercent: 72 },
        constitucional: { level: 7, xp: 740, domainPercent: 81 },
        processo_civil: { level: 4, xp: 390, domainPercent: 62 },
        trabalho: { level: 5, xp: 480, domainPercent: 70 },
        tributario: { level: 3, xp: 260, domainPercent: 58 }
      }
    };

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESSION_PROFILE)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveProgressionProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROGRESSION_PROFILE, JSON.stringify(profile));
    return profile;
  },

  getXpHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESSION_XP_HISTORY)) || [
        { id: 'xp-1', reason: 'Resolução de 10 Questões de Direito Penal', xp: 50, timestamp: Date.now() - 3600000 },
        { id: 'xp-2', reason: 'Sessão de Estudo Foco (45 minutos)', xp: 90, timestamp: Date.now() - 86400000 },
        { id: 'xp-3', reason: 'Atendimento Simulado no Laboratório', xp: 80, timestamp: Date.now() - 172800000 }
      ];
    } catch {
      return [];
    }
  },

  recordXpEvent(event) {
    const list = this.getXpHistory();
    list.unshift({ ...event, id: 'xp-' + Date.now(), timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEYS.PROGRESSION_XP_HISTORY, JSON.stringify(list.slice(0, 100))); // Limita a 100 eventos
    return list;
  },

  getDailyMissions() {
    const today = new Date().toISOString().split('T')[0];
    const defaults = {
      date: today,
      missions: [
        { id: 'mis-1', title: 'Estudar 30 minutos no Modo Foco', progress: 30, target: 30, completed: true, xp: 50 },
        { id: 'mis-2', title: 'Responder 10 questões de Direito Penal', progress: 8, target: 10, completed: false, xp: 40 },
        { id: 'mis-3', title: 'Revisar 15 flashcards pendentes', progress: 15, target: 15, completed: true, xp: 35 },
        { id: 'mis-4', title: '🎯 Recuperar Matéria: Fazer 5 questões de Processo Civil', progress: 2, target: 5, completed: false, xp: 45 }
      ]
    };

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESSION_MISSIONS));
      if (stored && stored.date === today) return stored.missions;
      return defaults.missions;
    } catch {
      return defaults.missions;
    }
  },

  saveDailyMissions(missions) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.PROGRESSION_MISSIONS, JSON.stringify({ date: today, missions }));
    return missions;
  },

  getUnlockedAchievements() {
    const defaults = [
      { id: 'ach-first-session', title: 'Primeiros Passos', desc: 'Concluiu a primeira sessão de estudo.', icon: 'fa-solid fa-flag', unlockedAt: Date.now() - 10000000 },
      { id: 'ach-10h', title: 'Dedicação Acadêmica', desc: 'Acumulou 10 horas de estudo real.', icon: 'fa-solid fa-clock', unlockedAt: Date.now() - 8000000 },
      { id: 'ach-100q', title: 'Centena de Questões', desc: 'Respondeu a 100 questões com aproveitamento.', icon: 'fa-solid fa-circle-check', unlockedAt: Date.now() - 5000000 },
      { id: 'ach-7days', title: 'Consistência Semanal', desc: 'Manteve 7 dias consecutivos de estudo ativo.', icon: 'fa-solid fa-fire', unlockedAt: Date.now() - 2000000 }
    ];

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESSION_ACHIEVEMENTS)) || defaults;
    } catch {
      return defaults;
    }
  },

  unlockAchievement(achievement) {
    const all = this.getUnlockedAchievements();
    if (!all.some(a => a.id === achievement.id)) {
      all.unshift({ ...achievement, unlockedAt: Date.now() });
      localStorage.setItem(STORAGE_KEYS.PROGRESSION_ACHIEVEMENTS, JSON.stringify(all));
    }
    return all;
  },

  getProgressionSettings() {
    const defaults = {
      isPrivate: false,
      dailyMinutesGoal: 45,
      weeklyHoursGoal: 8,
      participateLeague: true
    };
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESSION_SETTINGS)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveProgressionSettings(settings) {
    const current = this.getProgressionSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.PROGRESSION_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // --------------------------------------------------------------------------
  // ETAPA 12: ASSISTENTE DIÁRIO ("HOJE" / SMART DAILY PLANNER)
  // --------------------------------------------------------------------------
  getDailyPlanTasks() {
    const today = new Date().toISOString().split('T')[0];
    const defaults = {
      date: today,
      tasks: [
        {
          id: 'task-pen-01',
          subjectId: 'penal',
          subjectName: 'Direito Penal',
          title: 'Revisar Homicídio Qualificado & Privilegiado',
          type: 'study',
          priority: 'Alta',
          estimatedMinutes: 30,
          reason: 'Sua prova P1 de Penal está em 5 dias e é o tópico com maior incidência.',
          status: 'pending', // 'pending' | 'completed' | 'postponed'
          xpReward: 60
        },
        {
          id: 'task-cpc-01',
          subjectId: 'processo_civil',
          subjectName: 'Processo Civil',
          title: 'Resolver 10 questões de Tutela Provisória de Urgência',
          type: 'questions',
          priority: 'Alta',
          estimatedMinutes: 25,
          reason: 'Seu domínio recente neste tema é de 48% (matéria fraca a recuperar).',
          status: 'pending',
          xpReward: 50
        },
        {
          id: 'task-srs-01',
          subjectId: 'constitucional',
          subjectName: 'Direito Constitucional',
          title: 'Revisar 15 flashcards de Controle de Constitucionalidade',
          type: 'flashcards',
          priority: 'Média',
          estimatedMinutes: 15,
          reason: 'Ciclo de repetição espaçada atingiu o vencimento hoje.',
          status: 'completed',
          xpReward: 45
        },
        {
          id: 'task-vade-01',
          subjectId: 'civil',
          subjectName: 'Direito Civil',
          title: 'Leitura & Áudio dos Arts. 186 e 927 do Código Civil',
          type: 'article',
          priority: 'Baixa',
          estimatedMinutes: 15,
          reason: 'Fundamento basilar para o seu trabalho de Responsabilidade Civil.',
          status: 'pending',
          xpReward: 30
        }
      ]
    };

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_PLANNER_TASKS));
      if (stored && stored.date === today) return stored.tasks;
      return defaults.tasks;
    } catch {
      return defaults.tasks;
    }
  },

  saveDailyPlanTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.DAILY_PLANNER_TASKS, JSON.stringify({ date: today, tasks }));
    return tasks;
  },

  updateDailyTaskStatus(taskId, newStatus) {
    const tasks = this.getDailyPlanTasks();
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      target.status = newStatus;
      this.saveDailyPlanTasks(tasks);
    }
    return tasks;
  },

  getDailyPlannerPreferences() {
    const defaults = {
      availableMinutesDaily: 90,
      studyDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
      morningPriority: true,
      maxHoursPerDay: 2
    };

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_PLANNER_PREFERENCES)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveDailyPlannerPreferences(prefs) {
    const current = this.getDailyPlannerPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.DAILY_PLANNER_PREFERENCES, JSON.stringify(updated));
    return updated;
  },

  getNotificationsInbox() {
    const defaults = [
      {
        id: 'notif-1',
        category: 'exam',
        title: 'Próxima Prova em 5 dias',
        message: 'Prova P1 de Direito Penal se aproxima. O assistente priorizou revisões de homicídio.',
        timestamp: Date.now() - 3600000,
        isRead: false,
        actionLink: 'faculty'
      },
      {
        id: 'notif-2',
        category: 'srs',
        title: '15 Flashcards Vencidos',
        message: 'Você tem revisões espaçadas pendentes em Direito Constitucional.',
        timestamp: Date.now() - 14400000,
        isRead: false,
        actionLink: 'flashcards'
      },
      {
        id: 'notif-3',
        category: 'law',
        title: 'Norma Atualizada no Vade Mecum',
        message: 'Houve atualização na legislação penal recente acompanhada pelo sistema.',
        timestamp: Date.now() - 86400000,
        isRead: true,
        actionLink: 'vademecum'
      }
    ];

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_INBOX)) || defaults;
    } catch {
      return defaults;
    }
  },

  addNotification(notif) {
    const all = this.getNotificationsInbox();
    all.unshift({ ...notif, id: 'notif-' + Date.now(), timestamp: Date.now(), isRead: false });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_INBOX, JSON.stringify(all.slice(0, 50)));
    return all;
  },

  markNotificationRead(id) {
    const all = this.getNotificationsInbox();
    const target = all.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_INBOX, JSON.stringify(all));
    }
    return all;
  },

  markAllNotificationsRead() {
    const all = this.getNotificationsInbox();
    all.forEach(n => { n.isRead = true; });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_INBOX, JSON.stringify(all));
    return all;
  },

  // --------------------------------------------------------------------------
  // ETAPA 13: VADEAUDIO PREMIUM (SUBSCRIPTION, ENTITLEMENT & USAGE)
  // --------------------------------------------------------------------------
  getSubscriptionData() {
    const defaults = {
      planId: 'free', // 'free' | 'pro_monthly' | 'pro_yearly'
      status: 'active', // 'active' | 'trialing' | 'canceled' | 'past_due'
      currentPeriodEnd: Date.now() + 30 * 86400000,
      cancelAtPeriodEnd: false,
      isCourtesy: false,
      courtesyUntil: null
    };

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_DATA)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveSubscriptionData(sub) {
    const current = this.getSubscriptionData();
    const updated = { ...current, ...sub, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, JSON.stringify(updated));
    return updated;
  },

  getUsageRecords() {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const defaults = {
      cycleStart: startOfMonth,
      tutorMessagesUsed: 8,
      audioCharsUsed: 4200,
      transcriptionMinutesUsed: 6,
      documentsPagesUsed: 4
    };

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.USAGE_RECORDS));
      if (stored && stored.cycleStart === startOfMonth) return stored;
      return defaults;
    } catch {
      return defaults;
    }
  },

  saveUsageRecords(usage) {
    const current = this.getUsageRecords();
    const updated = { ...current, ...usage };
    localStorage.setItem(STORAGE_KEYS.USAGE_RECORDS, JSON.stringify(updated));
    return updated;
  },

  getFeatureFlags() {
    const defaults = {
      smart_classroom: true,
      legal_lab: true,
      neural_audio_enabled: true,
      ai_tutor_enabled: true,
      transcription_enabled: true
    };

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)) || defaults;
    } catch {
      return defaults;
    }
  },

  saveFeatureFlags(flags) {
    const current = this.getFeatureFlags();
    const updated = { ...current, ...flags };
    localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(updated));
    return updated;
  },

  getAdminAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_AUDIT_LOGS)) || [
        { id: 'log-1', admin: 'Sistema', action: 'Ativação inicial de planos', date: Date.now() - 86400000 }
      ];
    } catch {
      return [];
    }
  },

  saveAdminAuditLog(logItem) {
    const logs = this.getAdminAuditLogs();
    logs.unshift({ ...logItem, id: 'audit-' + Date.now(), date: Date.now() });
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
    return logs;
  },

  getProcessedWebhooks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROCESSED_WEBHOOKS)) || [];
    } catch {
      return [];
    }
  },

  markWebhookProcessed(webhookId) {
    const list = this.getProcessedWebhooks();
    if (!list.includes(webhookId)) {
      list.push(webhookId);
      localStorage.setItem(STORAGE_KEYS.PROCESSED_WEBHOOKS, JSON.stringify(list));
    }
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 33: MODO LEITURA INTELIGENTE (Smart Reading Session & Progress)
  // --------------------------------------------------------------------------
  getReadingProgressMap() {
    try {
      return this.getUserItem(STORAGE_KEYS.READING_PROGRESS, {}) || {};
    } catch {
      return {};
    }
  },

  getDocumentReadingProgress(docId) {
    const map = this.getReadingProgressMap();
    return map[docId] || {
      docId,
      currentPage: 1,
      totalPages: 1,
      progressPercent: 0,
      verifiedPercent: 0,
      activeSeconds: 0,
      viewedPages: [1],
      lastSection: '',
      lastReadAt: Date.now(),
      completed: false
    };
  },

  saveDocumentReadingProgress(progressObj) {
    const map = this.getReadingProgressMap();
    map[progressObj.docId] = {
      ...progressObj,
      lastReadAt: Date.now()
    };
    this.setUserItem(STORAGE_KEYS.READING_PROGRESS, map);
    return map[progressObj.docId];
  },

  getReadingSessions() {
    try {
      return this.getUserItem(STORAGE_KEYS.READING_SESSIONS, []) || [];
    } catch {
      return [];
    }
  },

  saveReadingSession(session) {
    const sessions = this.getReadingSessions();
    sessions.unshift({
      ...session,
      id: session.id || 'rsess_' + Date.now(),
      createdAt: session.createdAt || Date.now()
    });
    this.setUserItem(STORAGE_KEYS.READING_SESSIONS, sessions.slice(0, 100));
    return sessions;
  },

  getReadingBookmarks(docId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.READING_BOOKMARKS, []) || [];
      return docId ? all.filter(b => b.docId === docId) : all;
    } catch {
      return [];
    }
  },

  saveReadingBookmark(bookmark) {
    const all = this.getReadingBookmarks();
    const idx = all.findIndex(b => b.id === bookmark.id || (b.docId === bookmark.docId && b.page === bookmark.page));
    const item = {
      ...bookmark,
      id: bookmark.id || 'rbmk_' + Date.now(),
      createdAt: Date.now()
    };
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.unshift(item);
    }
    this.setUserItem(STORAGE_KEYS.READING_BOOKMARKS, all);
    return item;
  },

  removeReadingBookmark(bookmarkId) {
    let all = this.getReadingBookmarks();
    all = all.filter(b => b.id !== bookmarkId);
    this.setUserItem(STORAGE_KEYS.READING_BOOKMARKS, all);
    return all;
  },

  getReadingHighlights(docId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.READING_HIGHLIGHTS, []) || [];
      return docId ? all.filter(h => h.docId === docId) : all;
    } catch {
      return [];
    }
  },

  saveReadingHighlight(highlight) {
    const all = this.getReadingHighlights();
    const item = {
      ...highlight,
      id: highlight.id || 'rhl_' + Date.now(),
      category: highlight.category || 'Importante', // 'Importante' | 'Revisar' | 'Dúvida' | 'Prova'
      createdAt: Date.now()
    };
    all.push(item);
    this.setUserItem(STORAGE_KEYS.READING_HIGHLIGHTS, all);
    return item;
  },

  removeReadingHighlight(highlightId) {
    let all = this.getReadingHighlights();
    all = all.filter(h => h.id !== highlightId);
    this.setUserItem(STORAGE_KEYS.READING_HIGHLIGHTS, all);
    return all;
  },

  getReadingNotes(docId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.READING_NOTES, []) || [];
      return docId ? all.filter(n => n.docId === docId) : all;
    } catch {
      return [];
    }
  },

  saveReadingNote(note) {
    const all = this.getReadingNotes();
    const item = {
      ...note,
      id: note.id || 'rnote_' + Date.now(),
      createdAt: Date.now()
    };
    all.unshift(item);
    this.setUserItem(STORAGE_KEYS.READING_NOTES, all);
    return item;
  },

  getReadingGlossaryTerms() {
    try {
      return this.getUserItem(STORAGE_KEYS.READING_GLOSSARY, []) || [
        { id: 'glos_preclusao', term: 'Preclusão', definition: 'Perda do direito de praticar determinado ato processual pelo decurso do prazo, pela prática incompatível ou pelo fato de já tê-lo praticado.', source: 'Art. 223 e 507 CPC', isAiGenerated: false, savedAt: Date.now() },
        { id: 'glos_litispendencia', term: 'Litispendência', definition: 'Situação em que duas ações idênticas (mesmas partes, causa de pedir e pedido) tramitam simultaneamente perante a Justiça.', source: 'Art. 337, § 1º CPC', isAiGenerated: false, savedAt: Date.now() },
        { id: 'glos_saisine', term: 'Princípio da Saisine', definition: 'Regra jurídica pela qual a posse e propriedade da herança transmitem-se instantaneamente aos herdeiros no momento da morte do autor da herança.', source: 'Art. 1.784 Código Civil', isAiGenerated: false, savedAt: Date.now() },
        { id: 'glos_limpe', term: 'Princípios do LIMPE', definition: 'Princípios constitucionais expressos que regem a Administração Pública: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.', source: 'Art. 37, caput CF/88', isAiGenerated: false, savedAt: Date.now() }
      ];
    } catch {
      return [];
    }
  },

  saveGlossaryTerm(termObj) {
    const terms = this.getReadingGlossaryTerms();
    const idx = terms.findIndex(t => t.term.toLowerCase() === termObj.term.toLowerCase());
    const item = {
      ...termObj,
      id: termObj.id || 'glos_' + Date.now(),
      savedAt: Date.now()
    };
    if (idx >= 0) {
      terms[idx] = item;
    } else {
      terms.unshift(item);
    }
    this.setUserItem(STORAGE_KEYS.READING_GLOSSARY, terms);
    return item;
  },

  getReadingPreferences() {
    try {
      return this.getUserItem(STORAGE_KEYS.READING_PREFERENCES, {
        fontSize: 16, // px
        lineHeight: 1.6,
        theme: 'dark', // 'dark' | 'light' | 'sepia'
        marginWidth: 'normal', // 'compact' | 'normal' | 'wide'
        highlightTerms: true,
        activeRecallFrequency: 'normal', // 'low' | 'normal' | 'high' | 'off'
        autoScrollTts: true,
        ttsSpeed: 1.0,
        voiceId: 'xHUwLsLfyqiYOIVTzLRW' // ElevenLabs Marcos
      });
    } catch {
      return {
        fontSize: 16,
        lineHeight: 1.6,
        theme: 'dark',
        marginWidth: 'normal',
        highlightTerms: true,
        activeRecallFrequency: 'normal',
        autoScrollTts: true,
        ttsSpeed: 1.0,
        voiceId: 'xHUwLsLfyqiYOIVTzLRW'
      };
    }
  },

  saveReadingPreferences(prefs) {
    const current = this.getReadingPreferences();
    const updated = { ...current, ...prefs };
    this.setUserItem(STORAGE_KEYS.READING_PREFERENCES, updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // ETAPA 34: GERADOR INTELIGENTE E VALIDADOR DE QUESTÕES
  // --------------------------------------------------------------------------
  getGeneratedQuestions(filter = {}) {
    try {
      let list = this.getUserItem(STORAGE_KEYS.GENERATED_QUESTIONS, []) || [];
      if (filter.status) list = list.filter(q => q.status === filter.status);
      if (filter.subject) list = list.filter(q => q.subject === filter.subject);
      if (filter.sourceId) list = list.filter(q => q.source_refs && q.source_refs.includes(filter.sourceId));
      return list;
    } catch {
      return [];
    }
  },

  saveGeneratedQuestion(question) {
    const list = this.getGeneratedQuestions();
    const idx = list.findIndex(q => q.id === question.id);
    const item = {
      ...question,
      id: question.id || 'ai_q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      is_ai_generated: true,
      updatedAt: Date.now(),
      createdAt: question.createdAt || Date.now()
    };
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.setUserItem(STORAGE_KEYS.GENERATED_QUESTIONS, list);
    return item;
  },

  saveBatchGeneratedQuestions(questions) {
    const list = this.getGeneratedQuestions();
    const saved = [];
    questions.forEach(q => {
      const item = {
        ...q,
        id: q.id || 'ai_q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        is_ai_generated: true,
        updatedAt: Date.now(),
        createdAt: q.createdAt || Date.now()
      };
      list.unshift(item);
      saved.push(item);
    });
    this.setUserItem(STORAGE_KEYS.GENERATED_QUESTIONS, list);
    return saved;
  },

  getQuestionReviewQueue() {
    try {
      return this.getUserItem(STORAGE_KEYS.QUESTION_REVIEW_QUEUE, []) || [];
    } catch {
      return [];
    }
  },

  addToReviewQueue(item) {
    const queue = this.getQuestionReviewQueue();
    const idx = queue.findIndex(q => q.questionId === item.questionId);
    const queueItem = {
      ...item,
      id: item.id || 'rev_' + Date.now(),
      addedAt: Date.now()
    };
    if (idx >= 0) {
      queue[idx] = queueItem;
    } else {
      queue.unshift(queueItem);
    }
    this.setUserItem(STORAGE_KEYS.QUESTION_REVIEW_QUEUE, queue);
    return queueItem;
  },

  removeFromReviewQueue(questionId) {
    let queue = this.getQuestionReviewQueue();
    queue = queue.filter(q => q.questionId !== questionId);
    this.setUserItem(STORAGE_KEYS.QUESTION_REVIEW_QUEUE, queue);
    return queue;
  },

  getQuestionReports() {
    try {
      return this.getUserItem(STORAGE_KEYS.QUESTION_REPORTS, []) || [];
    } catch {
      return [];
    }
  },

  saveQuestionReport(report) {
    const reports = this.getQuestionReports();
    const newReport = {
      ...report,
      id: 'qrep_' + Date.now(),
      reportedAt: Date.now()
    };
    reports.unshift(newReport);
    this.setUserItem(STORAGE_KEYS.QUESTION_REPORTS, reports);

    // Se a questão acumular 3 ou mais reports, suspende automaticamente do banco de novos simulados
    const countForQ = reports.filter(r => r.questionId === report.questionId).length;
    if (countForQ >= 3) {
      const allQ = this.getGeneratedQuestions();
      const qItem = allQ.find(q => q.id === report.questionId);
      if (qItem) {
        qItem.status = 'needs_review';
        qItem.suspendedDueToReports = true;
        this.saveGeneratedQuestion(qItem);
      }
    }
    return newReport;
  },

  // --------------------------------------------------------------------------
  // ETAPA 35: FLASHCARDS JURÍDICOS INTELIGENTES & SCHEDULER ADAPTATIVO
  // --------------------------------------------------------------------------
  getSmartFlashcards(filter = {}) {
    try {
      let cards = this.getUserItem(STORAGE_KEYS.SMART_FLASHCARDS, []) || [];
      if (filter.subject) cards = cards.filter(c => c.subject === filter.subject);
      if (filter.deckId) cards = cards.filter(c => c.deckIds && c.deckIds.includes(filter.deckId));
      if (filter.status) cards = cards.filter(c => c.status === filter.status);
      if (filter.isDue) {
        const now = Date.now();
        cards = cards.filter(c => !c.due_at || c.due_at <= now);
      }
      return cards;
    } catch {
      return [];
    }
  },

  saveSmartFlashcard(card) {
    const list = this.getSmartFlashcards();
    const idx = list.findIndex(c => c.id === card.id);
    const item = {
      ...card,
      id: card.id || 'fc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: card.status || 'active', // 'active' | 'leech' | 'suspended' | 'archived'
      stability: card.stability !== undefined ? card.stability : 1.0, // FSRS S
      difficulty: card.difficulty !== undefined ? card.difficulty : 5.0, // FSRS D (1 a 10)
      reps: card.reps || 0,
      lapses: card.lapses || 0,
      due_at: card.due_at || Date.now(),
      last_reviewed_at: card.last_reviewed_at || null,
      updatedAt: Date.now(),
      createdAt: card.createdAt || Date.now()
    };
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    this.setUserItem(STORAGE_KEYS.SMART_FLASHCARDS, list);
    return item;
  },

  saveBatchSmartFlashcards(cards) {
    const list = this.getSmartFlashcards();
    const saved = [];
    cards.forEach(card => {
      const item = {
        ...card,
        id: card.id || 'fc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        status: card.status || 'active',
        stability: card.stability !== undefined ? card.stability : 1.0,
        difficulty: card.difficulty !== undefined ? card.difficulty : 5.0,
        reps: card.reps || 0,
        lapses: card.lapses || 0,
        due_at: card.due_at || Date.now(),
        updatedAt: Date.now(),
        createdAt: card.createdAt || Date.now()
      };
      list.unshift(item);
      saved.push(item);
    });
    this.setUserItem(STORAGE_KEYS.SMART_FLASHCARDS, list);
    return saved;
  },

  getFlashcardReviewEvents(cardId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.FLASHCARD_REVIEW_EVENTS, []) || [];
      return cardId ? all.filter(e => e.cardId === cardId) : all;
    } catch {
      return [];
    }
  },

  recordFlashcardReviewEvent(event) {
    const all = this.getFlashcardReviewEvents();
    // Idempotência: não duplica evento com mesmo eventId
    if (event.eventId && all.some(e => e.eventId === event.eventId)) {
      return event;
    }
    const item = {
      ...event,
      eventId: event.eventId || 'rev_ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      reviewedAt: event.reviewedAt || Date.now()
    };
    all.unshift(item);
    this.setUserItem(STORAGE_KEYS.FLASHCARD_REVIEW_EVENTS, all.slice(0, 500));
    return item;
  },

  getFlashcardDecks() {
    try {
      return this.getUserItem(STORAGE_KEYS.FLASHCARD_DECKS, []) || [
        { id: 'deck_oab_geral', title: 'Focus OAB & 1ª Fase', subject: 'Geral', color: '#f59e0b', cardCount: 0 },
        { id: 'deck_penal', title: 'Direito Penal & Teoria do Crime', subject: 'Penal', color: '#ef4444', cardCount: 0 },
        { id: 'deck_processo_civil', title: 'Processo Civil & Tutelas', subject: 'Processo Civil', color: '#38bdf8', cardCount: 0 },
        { id: 'deck_constitucional', title: 'Direito Constitucional & Garantias', subject: 'Constitucional', color: '#10b981', cardCount: 0 }
      ];
    } catch {
      return [];
    }
  },

  saveFlashcardDeck(deck) {
    const list = this.getFlashcardDecks();
    const idx = list.findIndex(d => d.id === deck.id);
    const item = {
      ...deck,
      id: deck.id || 'deck_' + Date.now(),
      createdAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    this.setUserItem(STORAGE_KEYS.FLASHCARD_DECKS, list);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 36: CENTRAL DE JURISPRUDÊNCIA INTELIGENTE
  // --------------------------------------------------------------------------
  getSavedJurisprudence() {
    try {
      return this.getUserItem(STORAGE_KEYS.JURISPRUDENCE_SAVES, []) || [];
    } catch {
      return [];
    }
  },

  toggleSaveJurisprudence(item) {
    const list = this.getSavedJurisprudence();
    const idx = list.findIndex(j => j.id === item.id);
    if (idx >= 0) {
      list.splice(idx, 1);
      this.setUserItem(STORAGE_KEYS.JURISPRUDENCE_SAVES, list);
      return { saved: false, id: item.id };
    } else {
      const savedItem = {
        ...item,
        savedAt: Date.now()
      };
      list.unshift(savedItem);
      this.setUserItem(STORAGE_KEYS.JURISPRUDENCE_SAVES, list);
      return { saved: true, item: savedItem };
    }
  },

  getJurisprudenceNotes(jurisprudenceId) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.JURISPRUDENCE_NOTES, {}) || {};
      return jurisprudenceId ? (all[jurisprudenceId] || '') : all;
    } catch {
      return '';
    }
  },

  saveJurisprudenceNote(jurisprudenceId, noteText) {
    const all = this.getUserItem(STORAGE_KEYS.JURISPRUDENCE_NOTES, {}) || {};
    all[jurisprudenceId] = noteText;
    this.setUserItem(STORAGE_KEYS.JURISPRUDENCE_NOTES, all);
    return noteText;
  },

  getFollowedJurisprudenceTopics() {
    try {
      return this.getUserItem(STORAGE_KEYS.JURISPRUDENCE_ALERTS, [
        'Responsabilidade Civil Bancária',
        'Tutela de Urgência no CPC',
        'Prisão Preventiva',
        'Direito do Consumidor e Distrato'
      ]) || [];
    } catch {
      return [];
    }
  },

  toggleFollowJurisprudenceTopic(topic) {
    const list = this.getFollowedJurisprudenceTopics();
    const idx = list.indexOf(topic);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(topic);
    }
    this.setUserItem(STORAGE_KEYS.JURISPRUDENCE_ALERTS, list);
    return list;
  },

  // --------------------------------------------------------------------------
  // ETAPA 37: CENTRAL DE DOUTRINA & BIBLIOTECA JURÍDICA PESSOAL
  // --------------------------------------------------------------------------
  getLibraryWorks(filter = {}) {
    try {
      let list = this.getUserItem(STORAGE_KEYS.LIBRARY_WORKS, []) || [
        {
          id: 'work_diniz_civil_1',
          title: 'Curso de Direito Civil Brasileiro: Teoria Geral do Direito Civil',
          author: 'Maria Helena Diniz',
          edition: '39ª ed.',
          publisher: 'Saraiva',
          year: '2023',
          city: 'São Paulo',
          area: 'Direito Civil',
          isbn: '978-8553612345',
          totalPages: 620,
          readingProgress: 45,
          chapters: [
            { id: 'chap_1', title: 'Capítulo I — Introdução ao Direito Civil e Fontes', startPage: 1, endPage: 45 },
            { id: 'chap_2', title: 'Capítulo II — Da Pessoa Natural e Capacidade', startPage: 46, endPage: 110 },
            { id: 'chap_3', title: 'Capítulo III — Dos Fatos Jurídicos e Prescrição', startPage: 111, endPage: 220 }
          ]
        },
        {
          id: 'work_tartuce_civil_1',
          title: 'Manual de Direito Civil: Volume Único',
          author: 'Flávio Tartuce',
          edition: '13ª ed.',
          publisher: 'Método',
          year: '2023',
          city: 'São Paulo',
          area: 'Direito Civil',
          isbn: '978-6559647890',
          totalPages: 1480,
          readingProgress: 60,
          chapters: [
            { id: 'chap_1', title: 'Capítulo 1 — Da Lei de Introdução e Fontes', startPage: 1, endPage: 80 },
            { id: 'chap_2', title: 'Capítulo 2 — Da Pessoa Natural e Direitos da Personalidade', startPage: 81, endPage: 170 },
            { id: 'chap_3', title: 'Capítulo 3 — Da Prescrição e Decadência', startPage: 171, endPage: 240 }
          ]
        },
        {
          id: 'work_goncalves_responsabilidade',
          title: 'Direito Civil Brasileiro: Responsabilidade Civil',
          author: 'Carlos Roberto Gonçalves',
          edition: '18ª ed.',
          publisher: 'Saraiva',
          year: '2023',
          city: 'São Paulo',
          area: 'Direito Civil',
          isbn: '978-8553698765',
          totalPages: 580,
          readingProgress: 30,
          chapters: [
            { id: 'chap_1', title: 'Capítulo I — Conceito e Evolução da Responsabilidade', startPage: 1, endPage: 60 },
            { id: 'chap_2', title: 'Capítulo II — Culpa e Dolo na Responsabilidade Subjetiva', startPage: 61, endPage: 130 },
            { id: 'chap_3', title: 'Capítulo III — A Teoria do Risco e a Responsabilidade Objetiva', startPage: 131, endPage: 210 }
          ]
        }
      ];
      if (filter.author) list = list.filter(w => (w.author || '').toLowerCase().includes(filter.author.toLowerCase()));
      if (filter.area) list = list.filter(w => w.area === filter.area);
      return list;
    } catch {
      return [];
    }
  },

  saveLibraryWork(work) {
    const list = this.getLibraryWorks();
    const idx = list.findIndex(w => w.id === work.id);
    const item = {
      ...work,
      id: work.id || 'work_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: work.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.LIBRARY_WORKS, list);
    return item;
  },

  getLibraryQuotes(filter = {}) {
    try {
      let quotes = this.getUserItem(STORAGE_KEYS.LIBRARY_QUOTES, []) || [
        {
          id: 'quote_1',
          workId: 'work_diniz_civil_1',
          workTitle: 'Curso de Direito Civil Brasileiro: Teoria Geral do Direito Civil',
          author: 'Maria Helena Diniz',
          text: 'A prescrição é a perda da pretensão de reparação do direito violado, em virtude da inércia do seu titular no decurso de certo lapso temporal fixado em lei.',
          printedPage: 115,
          chapterTitle: 'Capítulo III — Dos Fatos Jurídicos e Prescrição',
          isDirectQuote: true,
          isAiParaphrase: false,
          tags: ['Prescrição', 'Direito Civil', 'Teoria Geral'],
          createdAt: Date.now() - 86400000
        },
        {
          id: 'quote_2',
          workId: 'work_tartuce_civil_1',
          workTitle: 'Manual de Direito Civil: Volume Único',
          author: 'Flávio Tartuce',
          text: 'A responsabilidade civil objetiva independe da comprovação de dolo ou culpa do causador do dano, fundando-se exclusivamente na atividade de risco normalmente desenvolvida pelo agente.',
          printedPage: 195,
          chapterTitle: 'Capítulo 3 — Da Prescrição e Decadência',
          isDirectQuote: true,
          isAiParaphrase: false,
          tags: ['Responsabilidade Objetiva', 'Teoria do Risco'],
          createdAt: Date.now() - 43200000
        }
      ];
      if (filter.workId) quotes = quotes.filter(q => q.workId === filter.workId);
      if (filter.author) quotes = quotes.filter(q => (q.author || '').toLowerCase().includes(filter.author.toLowerCase()));
      if (filter.tag) quotes = quotes.filter(q => q.tags && q.tags.includes(filter.tag));
      return quotes;
    } catch {
      return [];
    }
  },

  saveLibraryQuote(quote) {
    const list = this.getLibraryQuotes();
    const idx = list.findIndex(q => q.id === quote.id);
    const item = {
      ...quote,
      id: quote.id || 'quote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: quote.createdAt || Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.LIBRARY_QUOTES, list);
    return item;
  },

  getLibraryFichamentos(workId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.LIBRARY_FICHAMENTOS, []) || [];
      return workId ? all.filter(f => f.workId === workId) : all;
    } catch {
      return [];
    }
  },

  saveLibraryFichamento(fichamento) {
    const list = this.getLibraryFichamentos();
    const idx = list.findIndex(f => f.id === fichamento.id);
    const item = {
      ...fichamento,
      id: fichamento.id || 'fich_' + Date.now(),
      createdAt: fichamento.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.LIBRARY_FICHAMENTOS, list);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 38: CENTRAL DE PEÇAS JURÍDICAS & PETICIONAMENTO ACADÊMICO
  // --------------------------------------------------------------------------
  getLegalPieceDrafts(filter = {}) {
    try {
      let list = this.getUserItem(STORAGE_KEYS.LEGAL_PIECE_DRAFTS, []) || [];
      if (filter.caseId) list = list.filter(d => d.caseId === filter.caseId);
      if (filter.pieceType) list = list.filter(d => d.pieceType === filter.pieceType);
      return list;
    } catch {
      return [];
    }
  },

  saveLegalPieceDraft(draft) {
    const list = this.getLegalPieceDrafts();
    const idx = list.findIndex(d => d.id === draft.id);
    const item = {
      ...draft,
      id: draft.id || 'draft_piece_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      version: draft.version || 1,
      updatedAt: Date.now(),
      createdAt: draft.createdAt || Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.LEGAL_PIECE_DRAFTS, list);
    return item;
  },

  saveLegalPieceEvaluation(evaluation) {
    const all = this.getUserItem(STORAGE_KEYS.LEGAL_PIECE_EVALUATIONS, []) || [];
    const item = {
      ...evaluation,
      id: 'eval_piece_' + Date.now(),
      evaluatedAt: Date.now()
    };
    all.unshift(item);
    this.setUserItem(STORAGE_KEYS.LEGAL_PIECE_EVALUATIONS, all.slice(0, 100));
    return item;
  },

  recordLegalPieceError(errorEntry) {
    const all = this.getUserItem(STORAGE_KEYS.LEGAL_PIECE_ERRORS, []) || [];
    all.unshift({
      ...errorEntry,
      id: 'err_piece_' + Date.now(),
      recordedAt: Date.now()
    });
    this.setUserItem(STORAGE_KEYS.LEGAL_PIECE_ERRORS, all.slice(0, 100));
  },

  // --------------------------------------------------------------------------
  // ETAPA 39: CENTRAL DE PRAZOS PROCESSUAIS & LINHA DO TEMPO JURÍDICA
  // --------------------------------------------------------------------------
  getDeadlineCalculations() {
    try {
      return this.getUserItem(STORAGE_KEYS.DEADLINE_CALCULATIONS, []) || [];
    } catch {
      return [];
    }
  },

  saveDeadlineCalculation(calc) {
    const list = this.getDeadlineCalculations();
    const item = {
      ...calc,
      id: calc.id || 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      calculatedAt: Date.now()
    };
    list.unshift(item);
    this.setUserItem(STORAGE_KEYS.DEADLINE_CALCULATIONS, list.slice(0, 100));
    return item;
  },

  recordDeadlineError(errorEntry) {
    const all = this.getUserItem(STORAGE_KEYS.DEADLINE_ERRORS, []) || [];
    all.unshift({
      ...errorEntry,
      id: 'err_dl_' + Date.now(),
      recordedAt: Date.now()
    });
    this.setUserItem(STORAGE_KEYS.DEADLINE_ERRORS, all.slice(0, 100));
  },

  getProcessTimelines() {
    try {
      return this.getUserItem(STORAGE_KEYS.PROCESS_TIMELINES, []) || [];
    } catch {
      return [];
    }
  },

  saveProcessTimeline(timeline) {
    const list = this.getProcessTimelines();
    const idx = list.findIndex(t => t.id === timeline.id);
    const item = {
      ...timeline,
      id: timeline.id || 'tl_' + Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.PROCESS_TIMELINES, list);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 40: CENTRAL DE LEIS COMENTADAS & ESTUDO ARTIGO POR ARTIGO
  // --------------------------------------------------------------------------
  getArticleAnnotations(articleId = null) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.ARTICLE_ANNOTATIONS, {}) || {};
      return articleId ? (all[articleId] || []) : all;
    } catch {
      return articleId ? [] : {};
    }
  },

  saveArticleAnnotation(articleId, annotation) {
    const all = this.getUserItem(STORAGE_KEYS.ARTICLE_ANNOTATIONS, {}) || {};
    if (!all[articleId]) all[articleId] = [];
    const item = {
      ...annotation,
      id: annotation.id || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: annotation.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    all[articleId].unshift(item);
    this.setUserItem(STORAGE_KEYS.ARTICLE_ANNOTATIONS, all);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 41: CENTRAL DE REVISÃO INTELIGENTE PRÉ-PROVA
  // --------------------------------------------------------------------------
  getExamRevisionPlans(examId = null) {
    try {
      let all = this.getUserItem(STORAGE_KEYS.EXAM_REVISION_PLANS, []) || [];
      return examId ? all.filter(p => p.examId === examId) : all;
    } catch {
      return [];
    }
  },

  saveExamRevisionPlan(plan) {
    const list = this.getExamRevisionPlans();
    const idx = list.findIndex(p => p.id === plan.id);
    const item = {
      ...plan,
      id: plan.id || 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: plan.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.EXAM_REVISION_PLANS, list);
    return item;
  },

  saveExamRevisionSession(session) {
    const list = this.getUserItem(STORAGE_KEYS.EXAM_REVISION_SESSIONS, []) || [];
    const item = {
      ...session,
      id: 'rev_sess_' + Date.now(),
      completedAt: Date.now()
    };
    this.setUserItem(STORAGE_KEYS.EXAM_REVISION_SESSIONS, list.slice(0, 100));
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 42: CENTRAL DE TRABALHOS, TCC & PESQUISA JURÍDICA AVANÇADA
  // --------------------------------------------------------------------------
  getAcademicProjects() {
    try {
      return this.getUserItem(STORAGE_KEYS.ACADEMIC_PROJECTS, []) || [];
    } catch {
      return [];
    }
  },

  saveAcademicProject(project) {
    const list = this.getAcademicProjects();
    const idx = list.findIndex(p => p.id === project.id);
    const item = {
      ...project,
      id: project.id || 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: project.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.ACADEMIC_PROJECTS, list);
    return item;
  },

  saveProjectVersionSnapshot(projectId, versionData) {
    const all = this.getUserItem(STORAGE_KEYS.ACADEMIC_PROJECT_VERSIONS, {}) || {};
    if (!all[projectId]) all[projectId] = [];
    const item = {
      ...versionData,
      id: 'ver_' + Date.now(),
      timestamp: Date.now()
    };
    all[projectId].unshift(item);
    this.setUserItem(STORAGE_KEYS.ACADEMIC_PROJECT_VERSIONS, all);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 43: CENTRAL DE PROVAS DISCURSIVAS & RESPOSTAS JURÍDICAS COM IA
  // --------------------------------------------------------------------------
  getDiscursiveAttempts(questionId = null) {
    try {
      let all = this.getUserItem(STORAGE_KEYS.DISCURSIVE_ATTEMPTS, []) || [];
      return questionId ? all.filter(a => a.questionId === questionId) : all;
    } catch {
      return [];
    }
  },

  saveDiscursiveAttempt(attempt) {
    const list = this.getDiscursiveAttempts();
    const item = {
      ...attempt,
      id: attempt.id || 'disc_att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: attempt.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    list.unshift(item);
    this.setUserItem(STORAGE_KEYS.DISCURSIVE_ATTEMPTS, list);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 45: SALAS DE ESTUDO COLABORATIVAS EM TEMPO REAL
  // --------------------------------------------------------------------------
  getStudyRooms() {
    try {
      return this.getUserItem(STORAGE_KEYS.STUDY_ROOM_SESSIONS, []) || [];
    } catch {
      return [];
    }
  },

  saveStudyRoom(room) {
    const list = this.getStudyRooms();
    const idx = list.findIndex(r => r.id === room.id);
    const item = {
      ...room,
      id: room.id || 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: room.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.STUDY_ROOM_SESSIONS, list);
    return item;
  },

  getStudyRoomMessages(roomId) {
    try {
      const all = this.getUserItem(STORAGE_KEYS.STUDY_ROOM_MESSAGES, {}) || {};
      return all[roomId] || [];
    } catch {
      return [];
    }
  },

  saveStudyRoomMessage(roomId, message) {
    const all = this.getUserItem(STORAGE_KEYS.STUDY_ROOM_MESSAGES, {}) || {};
    if (!all[roomId]) all[roomId] = [];
    const item = {
      ...message,
      id: message.id || 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: message.timestamp || Date.now()
    };
    all[roomId].push(item);
    this.setUserItem(STORAGE_KEYS.STUDY_ROOM_MESSAGES, all);
    return item;
  },

  // --------------------------------------------------------------------------
  // ETAPA 46: IMPORTADOR INTELIGENTE DE PLANO DE ENSINO & EMENTA ACADÊMICA
  // --------------------------------------------------------------------------
  getAcademicPlanImports() {
    try {
      return this.getUserItem(STORAGE_KEYS.ACADEMIC_PLAN_IMPORTS, []) || [];
    } catch {
      return [];
    }
  },

  saveAcademicPlanImport(planImport) {
    const list = this.getAcademicPlanImports();
    const idx = list.findIndex(p => p.id === planImport.id);
    const item = {
      ...planImport,
      id: planImport.id || 'plan_imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: planImport.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    this.setUserItem(STORAGE_KEYS.ACADEMIC_PLAN_IMPORTS, list);
    return item;
  }
};
