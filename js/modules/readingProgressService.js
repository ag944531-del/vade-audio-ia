/**
 * VadeAudio AI - ReadingProgressService (Etapa 33)
 * Motor Inteligente de Progresso Real, Retomada e Métricas Não-Invasivas de Leitura Jurídica.
 */

class ReadingProgressService {
  constructor(storageModule) {
    this.storage = storageModule || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    
    // Estado da sessão ativa de leitura
    this.activeDocId = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.viewedPages = new Set([1]);
    this.pageStartTime = Date.now();
    this.pageActiveSeconds = {}; // { [page]: seconds }
    this.totalActiveSeconds = 0;
    this.lastInteractionTime = Date.now();
    this.isInactive = false;
    
    // Intervalo de batimento cardíaco da leitura (heartbeat)
    this.heartbeatTimer = null;
    this.minSecondsForVerifiedPage = 10; // mínimo de 10s ativo na página para considerar leitura real
    
    // Checkpoints & active recall intervals
    this.activeRecallCheckpoints = new Set();
    this.correctRecallCount = 0;
    this.totalRecallCount = 0;

    // Listeners
    this.listeners = [];
  }

  onProgressChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.warn('[ReadingProgressService] Listener error:', e); }
    });
  }

  /**
   * Inicia ou restaura a sessão de progresso de um documento
   */
  startSession(docId, totalPages = 1, options = {}) {
    this.stopSession(); // encerra sessão anterior se houver
    
    this.activeDocId = docId;
    this.totalPages = Math.max(1, totalPages);
    this.pageStartTime = Date.now();
    this.lastInteractionTime = Date.now();
    this.isInactive = false;

    // Carrega progresso salvo anterior
    const saved = this.storage.getDocumentReadingProgress(docId);
    this.currentPage = options.forcePage || saved.currentPage || 1;
    this.totalActiveSeconds = saved.activeSeconds || 0;
    this.viewedPages = new Set(saved.viewedPages || [this.currentPage]);
    this.pageActiveSeconds = {};
    
    // Inicia heartbeat não-invasivo a cada 2 segundos
    this.heartbeatTimer = setInterval(() => this.tick(), 2000);

    const progressData = this.calculateProgress();
    this.notifyListeners(progressData);
    return {
      resumed: !!saved.lastReadAt && saved.currentPage > 1,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      progressPercent: progressData.progressPercent,
      verifiedPercent: progressData.verifiedPercent
    };
  }

  /**
   * Registra interação do usuário (clique, grifo, nota, seleção, rolagem com permanência)
   */
  recordInteraction() {
    this.lastInteractionTime = Date.now();
    this.isInactive = false;
  }

  /**
   * Troca a página atual
   */
  goToPage(newPage) {
    if (newPage < 1 || newPage > this.totalPages || newPage === this.currentPage) return;
    
    // Acumula tempo da página anterior
    this.flushCurrentPageTime();
    
    this.currentPage = newPage;
    this.viewedPages.add(newPage);
    this.pageStartTime = Date.now();
    this.recordInteraction();

    const progressData = this.calculateProgress();
    this.persistProgress();
    this.notifyListeners(progressData);
  }

  /**
   * Acumula tempo gasto na página atual
   */
  flushCurrentPageTime() {
    const elapsed = Math.round((Date.now() - this.pageStartTime) / 1000);
    if (elapsed > 0 && !this.isInactive) {
      this.pageActiveSeconds[this.currentPage] = (this.pageActiveSeconds[this.currentPage] || 0) + elapsed;
      this.totalActiveSeconds += elapsed;
    }
    this.pageStartTime = Date.now();
  }

  /**
   * Heartbeat para medição de inatividade e progresso
   */
  tick() {
    // Se o usuário não interagir por mais de 90 segundos, pausa contagem de leitura
    const idleSeconds = Math.round((Date.now() - this.lastInteractionTime) / 1000);
    if (idleSeconds > 90) {
      this.isInactive = true;
      return;
    }

    this.isInactive = false;
    this.totalActiveSeconds += 2;
    this.pageActiveSeconds[this.currentPage] = (this.pageActiveSeconds[this.currentPage] || 0) + 2;

    // Persiste a cada 10 segundos
    if (this.totalActiveSeconds % 10 === 0) {
      this.persistProgress();
    }
  }

  /**
   * Calcula progresso real e compreensão verificada
   * Não considera rolagem rápida: exige tempo ativo mínimo por página
   */
  calculateProgress() {
    // Páginas com leitura verificada (tempo mínimo atingido)
    let verifiedPagesCount = 0;
    for (const page of this.viewedPages) {
      const sec = this.pageActiveSeconds[page] || 0;
      if (sec >= this.minSecondsForVerifiedPage) {
        verifiedPagesCount++;
      }
    }

    // Progresso bruto de navegação (páginas visualizadas)
    const progressPercent = Math.min(100, Math.round((this.viewedPages.size / this.totalPages) * 100));
    
    // Progresso verificado (leitura real com permanência)
    const verifiedPercent = Math.min(100, Math.round((verifiedPagesCount / this.totalPages) * 100));

    // Estimativa de tempo restante (baseado na média de 2 a 3 min por página)
    const avgSecPerPage = verifiedPagesCount > 0 ? (this.totalActiveSeconds / verifiedPagesCount) : 120;
    const remainingPages = Math.max(0, this.totalPages - this.viewedPages.size);
    const estimatedMinutesRemaining = Math.ceil((remainingPages * avgSecPerPage) / 60);

    return {
      docId: this.activeDocId,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      progressPercent,
      verifiedPercent,
      viewedPagesCount: this.viewedPages.size,
      verifiedPagesCount,
      totalActiveMinutes: Math.round(this.totalActiveSeconds / 60),
      estimatedMinutesRemaining,
      isCompleted: progressPercent >= 100 && verifiedPercent >= 70
    };
  }

  /**
   * Persiste o progresso no StorageModule
   */
  persistProgress() {
    if (!this.activeDocId) return;
    const data = this.calculateProgress();
    this.storage.saveDocumentReadingProgress({
      docId: this.activeDocId,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      progressPercent: data.progressPercent,
      verifiedPercent: data.verifiedPercent,
      activeSeconds: this.totalActiveSeconds,
      viewedPages: Array.from(this.viewedPages),
      completed: data.isCompleted
    });
  }

  /**
   * Encerra a sessão e salva o resumo da sessão de estudo
   */
  stopSession(extraStats = {}) {
    if (!this.activeDocId) return null;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.flushCurrentPageTime();
    this.persistProgress();

    const progress = this.calculateProgress();
    const sessionSummary = {
      docId: this.activeDocId,
      totalPages: this.totalPages,
      pagesReadCount: this.viewedPages.size,
      verifiedPagesCount: progress.verifiedPagesCount,
      activeMinutes: Math.round(this.totalActiveSeconds / 60),
      highlightsCount: extraStats.highlightsCount || 0,
      notesCount: extraStats.notesCount || 0,
      recallQuestionsCount: this.totalRecallCount,
      recallCorrectCount: this.correctRecallCount,
      completed: progress.isCompleted,
      timestamp: Date.now()
    };

    if (sessionSummary.activeMinutes > 0 || sessionSummary.pagesReadCount > 0) {
      this.storage.saveReadingSession(sessionSummary);
    }

    this.activeDocId = null;
    return sessionSummary;
  }

  /**
   * Verifica se há ponto de retomada anterior
   */
  checkResumePoint(docId) {
    const saved = this.storage.getDocumentReadingProgress(docId);
    if (saved && saved.currentPage && saved.currentPage > 1 && saved.lastReadAt) {
      return {
        canResume: true,
        page: saved.currentPage,
        totalPages: saved.totalPages || 1,
        progressPercent: saved.progressPercent || 0,
        lastReadDate: new Date(saved.lastReadAt).toLocaleDateString('pt-BR')
      };
    }
    return { canResume: false, page: 1, totalPages: 1, progressPercent: 0 };
  }
}

if (typeof window !== 'undefined') {
  window.ReadingProgressService = ReadingProgressService;
}

if (typeof module !== 'undefined') {
  module.exports = ReadingProgressService;
}
