/**
 * VadeAudio AI - SmartFlashcardEngine & ReviewPriorityEngine (Etapa 35)
 * Controlador de Interface do Sistema de Memória Espaçada Inteligente:
 * Filas Dinâmicas, Flip 3D, Cloze Interativo, Avaliação FSRS (1 a 4), Áudio ElevenLabs e Modo Prova (Cram).
 */

class FlashcardReviewPriorityEngine {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  /**
   * Constrói a fila priorizada de estudos para hoje
   */
  buildDailyQueue(options = {}) {
    if (!this.storage) return [];
    const allCards = this.storage.getSmartFlashcards();
    const now = Date.now();
    const isCramMode = !!options.isCramMode;

    if (isCramMode) {
      // Modo Prova: filtra por disciplina/deck específico ou todos os fracos
      if (options.subject) {
        return allCards.filter(c => c.subject === options.subject || (c.tags && c.tags.includes(options.subject)));
      }
      return allCards.slice(0, 30);
    }

    // Fila Normal: Vencidos primeiro, depois cartões com falhas (lapses), depois novos limitados
    const dueCards = allCards.filter(c => c.status === 'active' && (!c.due_at || c.due_at <= now));
    const newCards = allCards.filter(c => c.status === 'active' && (!c.reps || c.reps === 0) && (!c.due_at || c.due_at > now)).slice(0, options.newCardsLimit || 20);

    // Ordena vencidos por criticidade (menor estabilidade primeiro)
    dueCards.sort((a, b) => (a.stability || 1.0) - (b.stability || 1.0));

    return [...dueCards, ...newCards];
  }
}

class SmartFlashcardEngine {
  constructor(scheduler, generationService, priorityEngine, audioEngine) {
    this.scheduler = scheduler || (typeof window !== 'undefined' ? window.spacedRepetitionScheduler : null);
    this.generationService = generationService || (typeof window !== 'undefined' ? window.flashcardGenerationService : null);
    this.priorityEngine = priorityEngine || new FlashcardReviewPriorityEngine(typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.activeQueue = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.isCramMode = false;
    this.activeDeckTab = 'due'; // 'due' | 'all' | 'errors' | 'cram'
  }

  renderFlashcardsView() {
    const container = document.getElementById('flashcards-content-container') || document.getElementById('view-flashcards');
    if (!container) return;

    this.activeQueue = this.priorityEngine.buildDailyQueue({ isCramMode: this.isCramMode });
    const currentCard = this.activeQueue[this.currentIndex] || null;

    // Se o banco estiver totalmente vazio, inicializa com cartões modelo
    if (this.activeQueue.length === 0 && this.generationService && this.generationService.storage) {
      const all = this.generationService.storage.getSmartFlashcards();
      if (all.length === 0) {
        this.generationService.generateFromArticle('cpc-art300');
        this.generationService.generateFromArticle('cp-art121');
        this.activeQueue = this.priorityEngine.buildDailyQueue();
      }
    }

    container.innerHTML = `
      <!-- Header do Módulo de Flashcards -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #10b981, #059669); color:#000; font-weight:700;">ETAPA 35</span>
            <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-brain"></i> Algoritmo FSRS de Memória Jurídica</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-layer-group text-amber"></i> Flashcards Jurídicos Inteligentes & Adaptativos
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Revisão espaçada personalizada para retenção permanente de artigos e conceitos da OAB.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <button id="btn-toggle-cram-mode" class="chapter-btn ${this.isCramMode ? 'active' : ''}" style="padding:7px 12px; font-size:0.8rem; background:${this.isCramMode ? '#ef4444' : 'rgba(255,255,255,0.05)'}; color:${this.isCramMode ? '#fff' : 'inherit'}; border-color:${this.isCramMode ? '#ef4444' : 'var(--border-light)'};">
            <i class="fa-solid fa-fire"></i> Modo Prova (Cram)
          </button>
          <button id="btn-quick-create-fc" class="btn-primary" style="padding:7px 14px; font-size:0.82rem;">
            <i class="fa-solid fa-plus"></i> Novo Flashcard
          </button>
        </div>
      </div>

      <!-- Área de Estudo Ativo -->
      <div style="max-width:680px; margin:0 auto;">
        ${this.renderCardInterface(currentCard)}
      </div>
    `;

    this.attachDomEvents();
  }

  renderCardInterface(card) {
    if (!card) {
      return `
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:48px 24px; text-align:center; color:var(--text-muted);">
          <div style="width:68px; height:68px; border-radius:50%; background:rgba(16,185,129,0.15); color:#10b981; font-size:2rem; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 style="font-family:var(--font-display); font-size:1.25rem; color:var(--text-main); margin-bottom:6px;">Tudo revisado por hoje!</h3>
          <p style="font-size:0.85rem; max-width:400px; margin:0 auto 20px;">Você concluiu todos os flashcards previstos pelo algoritmo FSRS para o seu ciclo de memória.</p>
          <button id="btn-restart-review-deck" class="btn-secondary" style="padding:8px 18px; font-size:0.82rem;">
            <i class="fa-solid fa-rotate-left"></i> Revisar Mais Cartões
          </button>
        </div>
      `;
    }

    const intervals = this.scheduler ? this.scheduler.previewNextIntervals(card) : { again: '< 10m', hard: '1d', good: '3d', easy: '7d' };
    
    // Processa renderização de Cloze Deletion
    let questionRender = card.question;
    if (card.type === 'cloze') {
      if (this.isFlipped) {
        questionRender = questionRender.replace(/\{\{(.*?)\}\}/g, '<strong style="color:#10b981; text-decoration:underline;">$1</strong>');
      } else {
        questionRender = questionRender.replace(/\{\{(.*?)\}\}/g, '<span style="background:rgba(245,158,11,0.25); border-bottom:2px dashed var(--accent-amber); padding:2px 8px; border-radius:4px; color:var(--accent-amber); font-weight:700;">[ ... ]</span>');
      }
    }

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:0.8rem; color:var(--text-muted);">
        <span>Cartão <strong>${this.currentIndex + 1}</strong> de ${this.activeQueue.length}</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="badge-official" style="font-size:0.7rem; color:var(--accent-amber); border-color:var(--accent-amber);">${card.subject || 'Geral'}</span>
          <button id="btn-fc-listen" class="btn-icon" title="Ouvir com áudio neural ElevenLabs (Marcos)"><i class="fa-solid fa-volume-high"></i></button>
        </div>
      </div>

      <!-- Card Central Interativo -->
      <div id="smart-flashcard-card" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:36px 30px; min-height:280px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.3); transition:all 0.2s ease;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-weight:700; display:block; margin-bottom:12px;">
            ${this.isFlipped ? '<i class="fa-solid fa-circle-info text-amber"></i> Resposta Oficial' : '<i class="fa-solid fa-circle-question text-amber"></i> Pergunta'}
          </span>
          <p style="font-size:1.05rem; line-height:1.5; color:var(--text-main); font-weight:600; margin:0;">
            ${this.isFlipped ? (card.type === 'cloze' ? questionRender : card.answer) : questionRender}
          </p>
        </div>

        ${this.isFlipped && card.legalReference ? `
          <div style="margin-top:20px; padding:10px 14px; background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); border-radius:4px; font-size:0.78rem; color:var(--text-main);">
            <strong style="color:var(--accent-amber);"><i class="fa-solid fa-book-bookmark"></i> Fonte:</strong> ${card.legalReference}
          </div>
        ` : ''}

        ${!this.isFlipped ? `
          <div style="text-align:center; color:var(--text-muted); font-size:0.78rem; margin-top:28px;">
            <i class="fa-solid fa-hand-pointer text-amber"></i> Toque para virar o cartão
          </div>
        ` : ''}
      </div>

      <!-- Barra de Ações & Classificação FSRS (1 a 4) -->
      ${this.isFlipped ? `
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:18px;" id="fsrs-rating-buttons">
          <button class="btn-secondary btn-rate-fc" data-rating="1" style="border-color:#ef4444; color:#ef4444; padding:10px 6px; text-align:center; font-size:0.8rem;">
            <strong style="display:block;">Esqueci</strong>
            <span style="font-size:0.7rem; opacity:0.8;">${intervals.again}</span>
          </button>
          <button class="btn-secondary btn-rate-fc" data-rating="2" style="border-color:#f97316; color:#f97316; padding:10px 6px; text-align:center; font-size:0.8rem;">
            <strong style="display:block;">Difícil</strong>
            <span style="font-size:0.7rem; opacity:0.8;">${intervals.hard}</span>
          </button>
          <button class="btn-secondary btn-rate-fc" data-rating="3" style="border-color:#38bdf8; color:#38bdf8; padding:10px 6px; text-align:center; font-size:0.8rem;">
            <strong style="display:block;">Bom</strong>
            <span style="font-size:0.7rem; opacity:0.8;">${intervals.good}</span>
          </button>
          <button class="btn-secondary btn-rate-fc" data-rating="4" style="border-color:#10b981; color:#10b981; padding:10px 6px; text-align:center; font-size:0.8rem;">
            <strong style="display:block;">Fácil</strong>
            <span style="font-size:0.7rem; opacity:0.8;">${intervals.easy}</span>
          </button>
        </div>
      ` : ''}
    `;
  }

  attachDomEvents() {
    // Flip do Cartão
    document.getElementById('smart-flashcard-card')?.addEventListener('click', () => {
      this.isFlipped = !this.isFlipped;
      this.renderFlashcardsView();
    });

    // Toggle Modo Prova (Cram Mode)
    document.getElementById('btn-toggle-cram-mode')?.addEventListener('click', () => {
      this.isCramMode = !this.isCramMode;
      this.currentIndex = 0;
      this.isFlipped = false;
      this.renderFlashcardsView();
      window.Toast?.info(this.isCramMode ? '🔥 Modo Prova Ativado: Revisão intensiva sem alterar o agendamento normal de longo prazo.' : 'Modo Normal FSRS reativado.');
    });

    // Narração com ElevenLabs
    document.getElementById('btn-fc-listen')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentCard = this.activeQueue[this.currentIndex];
      if (currentCard && this.audioEngine) {
        const text = this.isFlipped ? `Resposta: ${currentCard.answer}` : `Pergunta: ${currentCard.question}`;
        this.audioEngine.speakArticle({
          id: 'fc_audio_' + Date.now(),
          article_display: 'Flashcard em Áudio',
          number: 'Revisão Espaçada',
          title: currentCard.subject || 'Flashcard Jurídico',
          content: [{ text, speechText: text }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW' // ElevenLabs Marcos
        });
      }
    });

    // Ratings FSRS (1 a 4)
    document.querySelectorAll('.btn-rate-fc').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        const currentCard = this.activeQueue[this.currentIndex];
        
        if (currentCard && this.scheduler) {
          const scheduleResult = this.scheduler.scheduleReview(currentCard, rating, { isCramMode: this.isCramMode });
          if (this.generationService && this.generationService.storage) {
            this.generationService.storage.saveSmartFlashcard({ ...currentCard, ...scheduleResult });
            this.generationService.storage.recordFlashcardReviewEvent({
              cardId: currentCard.id,
              rating,
              isCramMode: this.isCramMode,
              reviewedAt: Date.now()
            });
          }
        }

        this.currentIndex++;
        this.isFlipped = false;
        this.renderFlashcardsView();
      });
    });

    // Criar Novo Cartão Rápido
    document.getElementById('btn-quick-create-fc')?.addEventListener('click', () => {
      const q = prompt('Digite a Pergunta do Flashcard (seja claro e direto):', 'Quais são os requisitos do Art. 300 CPC?');
      if (q) {
        const a = prompt('Digite a Resposta Curta / Objetiva:', 'Probabilidade do direito e perigo na demora.');
        if (a && this.generationService && this.generationService.storage) {
          this.generationService.storage.saveSmartFlashcard({
            question: q.trim(),
            answer: a.trim(),
            type: 'qa',
            subject: 'Personalizado'
          });
          window.Toast?.success('Flashcard criado com sucesso!');
          this.renderFlashcardsView();
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.FlashcardReviewPriorityEngine = FlashcardReviewPriorityEngine;
  window.SmartFlashcardEngine = SmartFlashcardEngine;
}

if (typeof module !== 'undefined') {
  module.exports = { FlashcardReviewPriorityEngine, SmartFlashcardEngine };
}
