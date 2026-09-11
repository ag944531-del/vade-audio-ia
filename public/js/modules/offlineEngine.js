/**
 * VadeAudio AI - Motor de Modo Offline & Biblioteca Jurídica Local (Etapa 21)
 * Armazenamento local de Vade Mecum, áudios e flashcards, OfflineOutbox com
 * idempotência, resolução de conflitos, gestão de storage, validação de entitlement e delta sync.
 */

class OfflineStorageEngine {
  constructor(authService) {
    this.authService = authService;
    this.storageLimitBytes = 1024 * 1024 * 1024; // 1 GB padrão
    this.offlineContentDb = this.loadOfflineContent();
    this.outboxDb = this.loadOutbox();
    this.syncState = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastSyncTimestamp: Date.now() - 3600000,
      syncStatus: 'idle', // 'idle' | 'syncing' | 'error'
      pendingOperationsCount: 0
    };

    this.initNetworkListeners();
  }

  initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.syncState.isOnline = true;
      this.notifyNetworkChange('online');
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.syncState.isOnline = false;
      this.notifyNetworkChange('offline');
    });
  }

  notifyNetworkChange(status) {
    const badge = document.getElementById('connection-status-badge');
    if (badge) {
      if (status === 'online') {
        badge.innerHTML = '<i class="fa-solid fa-cloud"></i> Online';
        badge.style.color = '#10b981';
        badge.style.borderColor = '#10b981';
      } else {
        badge.innerHTML = '<i class="fa-solid fa-cloud-slash"></i> Modo Offline';
        badge.style.color = '#ef4444';
        badge.style.borderColor = '#ef4444';
      }
    }
  }

  loadOfflineContent() {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      return JSON.parse(localStorage.getItem(`vadeaudio_offline_content_${userId}`)) || {
        laws: [
          { lawId: 'cp', lawName: 'Código Penal', versionId: 'v2026.1', sizeBytes: 45 * 1024 * 1024, downloadedAt: Date.now() - 86400000 * 3, checksum: 'sha256_cp_78a1bc' },
          { lawId: 'cf88', lawName: 'Constituição Federal', versionId: 'v2026.2', sizeBytes: 38 * 1024 * 1024, downloadedAt: Date.now() - 86400000 * 5, checksum: 'sha256_cf_99fa34' }
        ],
        audios: [
          { audioId: 'aud_art121_cp', title: 'Art. 121 CP Narrado (Marcos)', sizeBytes: 4.2 * 1024 * 1024, cachedAt: Date.now() - 86400000 },
          { audioId: 'aud_resumo_penal_p1', title: 'Resumo Teoria do Delito P1', sizeBytes: 18.5 * 1024 * 1024, cachedAt: Date.now() - 86400000 * 2 }
        ],
        flashcardDecks: [
          { deckId: 'deck_penal_geral', name: 'Penal - Parte Geral (100 cards)', cardCount: 100, sizeBytes: 1.2 * 1024 * 1024 }
        ],
        questions: [
          { packageId: 'pkg_oab_penal_50', title: '50 Questões OAB Penal', questionCount: 50, sizeBytes: 2.5 * 1024 * 1024 }
        ],
        materials: [
          { docId: 'doc_resumo_p1_processo', title: 'Resumo_Processo_Civil_P1.pdf', sizeBytes: 12.8 * 1024 * 1024 }
        ]
      };
    } catch {
      return { laws: [], audios: [], flashcardDecks: [], questions: [], materials: [] };
    }
  }

  saveOfflineContent() {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      localStorage.setItem(`vadeaudio_offline_content_${userId}`, JSON.stringify(this.offlineContentDb));
    } catch {}
  }

  loadOutbox() {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      return JSON.parse(localStorage.getItem(`vadeaudio_offline_outbox_${userId}`)) || [];
    } catch {
      return [];
    }
  }

  saveOutbox() {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      localStorage.setItem(`vadeaudio_offline_outbox_${userId}`, JSON.stringify(this.outboxDb));
    } catch {}
  }

  // --------------------------------------------------------------------------
  // 1. GESTÃO DE ARMAZENAMENTO & CAPACIDADE
  // --------------------------------------------------------------------------
  getStorageBreakdown() {
    let lawsBytes = this.offlineContentDb.laws.reduce((acc, l) => acc + (l.sizeBytes || 0), 0);
    let audiosBytes = this.offlineContentDb.audios.reduce((acc, a) => acc + (a.sizeBytes || 0), 0);
    let flashcardsBytes = this.offlineContentDb.flashcardDecks.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    let questionsBytes = this.offlineContentDb.questions.reduce((acc, q) => acc + (q.sizeBytes || 0), 0);
    let materialsBytes = this.offlineContentDb.materials.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);

    const totalUsedBytes = lawsBytes + audiosBytes + flashcardsBytes + questionsBytes + materialsBytes;
    const usagePercent = Math.min(100, Math.round((totalUsedBytes / this.storageLimitBytes) * 100));

    return {
      totalUsedBytes,
      totalUsedFormattedMB: (totalUsedBytes / (1024 * 1024)).toFixed(1),
      limitFormattedMB: (this.storageLimitBytes / (1024 * 1024)).toFixed(0),
      usagePercent,
      isNearLimit: usagePercent >= 85,
      categories: {
        laws: (lawsBytes / (1024 * 1024)).toFixed(1),
        audios: (audiosBytes / (1024 * 1024)).toFixed(1),
        flashcards: (flashcardsBytes / (1024 * 1024)).toFixed(1),
        questions: (questionsBytes / (1024 * 1024)).toFixed(1),
        materials: (materialsBytes / (1024 * 1024)).toFixed(1)
      }
    };
  }

  // --------------------------------------------------------------------------
  // 2. DOWNLOAD E VERSIONAMENTO DE LEIS
  // --------------------------------------------------------------------------
  downloadLawOffline(lawId, lawName, versionId = 'v2026.1', estimatedSizeMB = 45) {
    const existingIdx = this.offlineContentDb.laws.findIndex(l => l.lawId === lawId);
    const newLawRecord = {
      lawId,
      lawName,
      versionId,
      sizeBytes: estimatedSizeMB * 1024 * 1024,
      downloadedAt: Date.now(),
      checksum: `sha256_${lawId}_${Date.now().toString(36)}`
    };

    if (existingIdx >= 0) {
      this.offlineContentDb.laws[existingIdx] = newLawRecord;
    } else {
      this.offlineContentDb.laws.push(newLawRecord);
    }
    this.saveOfflineContent();
    return newLawRecord;
  }

  removeOfflineLaw(lawId) {
    this.offlineContentDb.laws = this.offlineContentDb.laws.filter(l => l.lawId !== lawId);
    this.saveOfflineContent();
  }

  isLawAvailableOffline(lawId) {
    return this.offlineContentDb.laws.some(l => l.lawId === lawId);
  }

  // --------------------------------------------------------------------------
  // 3. OFFLINE OUTBOX (FILA DE OPERAÇÕES COM IDEMPOTÊNCIA)
  // --------------------------------------------------------------------------
  queueOfflineOperation(type, entityId, payload) {
    const operation = {
      operationId: 'op_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      type, // 'review_flashcard' | 'answer_question' | 'save_note' | 'complete_task'
      entityId,
      payload,
      createdAt: Date.now(),
      retryCount: 0
    };

    this.outboxDb.push(operation);
    this.saveOutbox();
    this.syncState.pendingOperationsCount = this.outboxDb.length;
    return operation;
  }

  // --------------------------------------------------------------------------
  // 4. RESOLUÇÃO DE CONFLITOS (SEM PERDA SILENCIOSA DE DADOS)
  // --------------------------------------------------------------------------
  resolveConflict(localItem, serverItem) {
    if (!localItem || !serverItem) return localItem || serverItem;

    if (localItem.text === serverItem.text) return serverItem;

    // Estratégia de Merge com Preservação de Ambas as Versões
    return {
      ...serverItem,
      text: `${serverItem.text}\n\n--- [Versão Local Conflitante salva em ${new Date(localItem.updatedAt || Date.now()).toLocaleDateString()}] ---\n${localItem.text}`,
      hasConflictResolved: true
    };
  }

  // --------------------------------------------------------------------------
  // 5. VALIDAÇÃO DE ENTITLEMENT OFFLINE (TOLERÂNCIA DE 7 DIAS)
  // --------------------------------------------------------------------------
  validateOfflineEntitlement(user) {
    if (!user || user.role !== 'pro') {
      return { isAuthorized: true, isGracePeriodActive: false };
    }

    const lastVerified = user.lastOnlineEntitlementVerification || Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isExpired = (Date.now() - lastVerified) > sevenDaysMs;

    return {
      isAuthorized: !isExpired,
      isGracePeriodActive: !isExpired,
      daysRemaining: Math.max(0, Math.ceil((sevenDaysMs - (Date.now() - lastVerified)) / (24 * 60 * 60 * 1000)))
    };
  }

  // --------------------------------------------------------------------------
  // 6. SINCRONIZAÇÃO DELTA EM LOTE
  // --------------------------------------------------------------------------
  async triggerAutoSync() {
    if (!this.syncState.isOnline || this.outboxDb.length === 0) return { syncedCount: 0 };

    this.syncState.syncStatus = 'syncing';
    const operationsToSync = [...this.outboxDb];

    try {
      // Simulação da chamada POST /api/sync/batch com idempotência
      await new Promise(r => setTimeout(r, 600));

      // Esvazia outbox com sucesso
      this.outboxDb = [];
      this.saveOutbox();

      this.syncState.syncStatus = 'idle';
      this.syncState.lastSyncTimestamp = Date.now();
      this.syncState.pendingOperationsCount = 0;

      window.Toast?.success(`Sincronização concluída: ${operationsToSync.length} operações enviadas.`);
      return { success: true, syncedCount: operationsToSync.length };
    } catch (err) {
      this.syncState.syncStatus = 'error';
      return { success: false, error: err.message };
    }
  }

  // --------------------------------------------------------------------------
  // 7. MODO VIAGEM (DOWNLOAD EM LOTE)
  // --------------------------------------------------------------------------
  downloadTravelBundle() {
    this.downloadLawOffline('cp', 'Código Penal', 'v2026.1', 45);
    this.downloadLawOffline('cpc', 'Código de Processo Civil', 'v2026.1', 52);
    this.downloadLawOffline('cf88', 'Constituição Federal', 'v2026.2', 38);
    this.saveOfflineContent();
    return {
      bundleName: 'Pacote Essencial de Viagem',
      lawsCount: 3,
      flashcardsCount: 100,
      totalSizeMB: 135
    };
  }
}

window.OfflineStorageEngine = OfflineStorageEngine;
