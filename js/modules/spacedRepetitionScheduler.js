/**
 * VadeAudio AI - SpacedRepetitionScheduler (Etapa 35)
 * Motor Matemático de Repetição Espaçada Adaptativa baseado no Algoritmo FSRS.
 * Gerencia Estabilidade (S), Dificuldade (D), Retenção (R), Lapses, Modo Prova (Cram) e Idempotência.
 */

class SpacedRepetitionScheduler {
  constructor(options = {}) {
    this.requestRetention = options.requestRetention || 0.9; // Meta de 90% de retenção
    this.maximumInterval = options.maximumInterval || 365; // Máximo 365 dias
    this.algorithmVersion = 'fsrs-v4.5-law';
    
    // Pesos FSRS calibrados para memorização jurídica
    this.w = [
      0.4, 0.6, 2.4, 5.8, // S0 inicial para [Again, Hard, Good, Easy]
      4.93, 0.94, 0.86, 0.01, // Dificuldade
      1.49, 0.14, 0.94, // Estabilidade para Good
      2.18, 0.05, 0.34, 1.26, // Estabilidade após Lapse
      0.29, 2.61 // Modificadores Hard / Easy
    ];
  }

  /**
   * Calcula o próximo estado e intervalo a partir do rating do aluno (1=Esqueci, 2=Difícil, 3=Bom, 4=Fácil)
   */
  scheduleReview(card, rating, options = {}) {
    const isCramMode = !!options.isCramMode;
    const now = options.now || Date.now();

    // No modo Cram / Revisão da Prova: registra a tentativa mas NÃO corrompe a curva de longo prazo
    if (isCramMode) {
      return {
        cardId: card.id,
        isCramMode: true,
        rating,
        stability: card.stability || 1.0,
        difficulty: card.difficulty || 5.0,
        reps: (card.reps || 0) + 1,
        lapses: card.lapses || 0,
        intervalDays: 0,
        due_at: card.due_at || now,
        isLeech: (card.lapses || 0) >= 4,
        nextIntervalDisplay: 'Modo Prova (Sem alteração no agendamento)'
      };
    }

    const currentS = card.stability !== undefined ? card.stability : 1.0;
    const currentD = card.difficulty !== undefined ? card.difficulty : 5.0;
    const reps = card.reps || 0;
    let lapses = card.lapses || 0;

    let newS = currentS;
    let newD = currentD;
    let intervalDays = 1;

    if (reps === 0) {
      // Primeiro review do cartão (Iniciação S0 e D0)
      newS = this.w[rating - 1] || 1.0;
      newD = Math.min(10, Math.max(1, this.w[4] - (rating - 3) * this.w[5]));
    } else {
      // Atualização de Dificuldade (D)
      newD = Math.min(10, Math.max(1, currentD - this.w[6] * (rating - 3)));

      if (rating === 1) {
        // Lapse: Aluno esqueceu
        lapses++;
        newS = Math.max(0.1, this.w[11] * Math.pow(newD, -this.w[12]) * (Math.pow(currentS + 1, this.w[13]) - 1) * Math.exp(this.w[14] * (1 - this.requestRetention)));
        intervalDays = 0.05; // ~1 hora ou revisão imediata no dia
      } else if (rating === 2) {
        // Hard: Lembrou com grande esforço
        newS = currentS * (1 + Math.exp(this.w[8]) * (11 - newD) * Math.pow(currentS, -this.w[9]) * (Math.exp(this.w[10] * (1 - this.requestRetention)) - 1) * this.w[15]);
      } else if (rating === 3) {
        // Good: Lembrou com facilidade normal
        newS = currentS * (1 + Math.exp(this.w[8]) * (11 - newD) * Math.pow(currentS, -this.w[9]) * (Math.exp(this.w[10] * (1 - this.requestRetention)) - 1));
      } else if (rating === 4) {
        // Easy: Lembrou instantaneamente
        newS = currentS * (1 + Math.exp(this.w[8]) * (11 - newD) * Math.pow(currentS, -this.w[9]) * (Math.exp(this.w[10] * (1 - this.requestRetention)) - 1) * this.w[16]);
      }
    }

    // Calcula intervalo com base na estabilidade S e meta de retenção
    if (rating > 1) {
      const factor = (9 / (1 - this.requestRetention)) - 9;
      intervalDays = Math.min(this.maximumInterval, Math.max(1, Math.round(newS * factor * 0.1)));
    }

    const due_at = now + Math.round(intervalDays * 86400000);
    const isLeech = lapses >= 4;

    return {
      cardId: card.id,
      rating,
      stability: parseFloat(newS.toFixed(2)),
      difficulty: parseFloat(newD.toFixed(2)),
      reps: reps + 1,
      lapses,
      intervalDays,
      due_at,
      last_reviewed_at: now,
      isLeech,
      algorithmVersion: this.algorithmVersion,
      nextIntervalDisplay: this.formatInterval(intervalDays)
    };
  }

  /**
   * Formata intervalo legível para os botões de rating
   */
  formatInterval(days) {
    if (days < 0.1) return '< 10m';
    if (days < 1) return '< 1d';
    if (days === 1) return '1 dia';
    if (days < 30) return `${days} dias`;
    const months = Math.round(days / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  /**
   * Estima os próximos intervalos para os 4 botões na interface
   */
  previewNextIntervals(card) {
    return {
      again: this.formatInterval(this.scheduleReview(card, 1).intervalDays),
      hard: this.formatInterval(this.scheduleReview(card, 2).intervalDays),
      good: this.formatInterval(this.scheduleReview(card, 3).intervalDays),
      easy: this.formatInterval(this.scheduleReview(card, 4).intervalDays)
    };
  }

  /**
   * Recompõe o estado de um cartão a partir da lista cronológica de eventos (Event Sourcing)
   */
  recomputeCardState(initialCard, reviewEvents = []) {
    // Ordena por reviewedAt
    const sorted = [...reviewEvents].sort((a, b) => a.reviewedAt - b.reviewedAt);
    let state = { ...initialCard, reps: 0, lapses: 0, stability: 1.0, difficulty: 5.0 };

    for (const ev of sorted) {
      const next = this.scheduleReview(state, ev.rating, { isCramMode: ev.isCramMode, now: ev.reviewedAt });
      state = { ...state, ...next };
    }

    return state;
  }
}

if (typeof window !== 'undefined') {
  window.SpacedRepetitionScheduler = SpacedRepetitionScheduler;
}

if (typeof module !== 'undefined') {
  module.exports = SpacedRepetitionScheduler;
}
