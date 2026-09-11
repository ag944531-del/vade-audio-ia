/**
 * VadeAudio AI - ExamRevisionEngine & Adaptive Revision Services (Etapa 41)
 * Central de Revisão Inteligente Pré-Prova.
 * Estratégias Calibradas por Horizonte de Tempo (7 dias, 3 dias, Véspera 24h, 60 min, 15 min).
 */

class ExamRevisionContextBuilder {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  buildExamContext(exam) {
    if (!exam) return null;

    const topics = exam.topics || [
      { id: 'top_1', name: 'Dolo e Culpa', importance: 'high', mastery: 0.45, errorCount: 4 },
      { id: 'top_2', name: 'Erro de Tipo e de Proibição', importance: 'high', mastery: 0.35, errorCount: 6 },
      { id: 'top_3', name: 'Iter Criminis e Tentativa', importance: 'medium', mastery: 0.80, errorCount: 1 },
      { id: 'top_4', name: 'Concurso de Pessoas', importance: 'medium', mastery: 0.60, errorCount: 2 }
    ];

    return {
      examId: exam.id || 'exam_p1_penal',
      title: exam.title || 'P1 — Direito Penal II (Parte Geral)',
      discipline: exam.discipline || 'Direito Penal',
      examDate: exam.date || '2026-09-20',
      topics
    };
  }
}

class ExamRevisionPriorityEngine {
  /**
   * Calcula o score de prioridade de cada tópico de forma determinística
   */
  static rankTopics(topics = []) {
    return topics.map(t => {
      let score = 20; // base score
      const reasons = [];

      // Fator de Erros Proporcional
      const errorBonus = (t.errorCount || 0) * 8;
      score += errorBonus;
      if (t.errorCount >= 4) {
        reasons.push('RECURRENT_ERRORS (Tópico com múltiplos erros registrados)');
      } else if (t.errorCount > 0) {
        reasons.push('RECENT_ERRORS (Histórico de erros recentes)');
      }

      // Fator de Domínio Proporcional (Menor domínio = Maior urgência)
      const masteryPenalty = Math.round((1 - (t.mastery || 0)) * 50);
      score += masteryPenalty;
      if (t.mastery < 0.5) {
        reasons.push('LOW_MASTERY (Desempenho abaixo de 50%)');
      } else if (t.mastery >= 0.8) {
        reasons.push('HIGH_MASTERY (Tópico bem consolidado)');
      }

      // Fator de Importância
      if (t.importance === 'high') {
        score += 20;
        reasons.push('HIGH_IMPORTANCE (Ponto central no conteúdo da prova)');
      }

      const rawScore = score;

      return {
        ...t,
        rawScore,
        priorityScore: Math.max(0, Math.min(100, score)),
        reasonCodes: reasons
      };
    }).sort((a, b) => b.rawScore - a.rawScore);
  }
}

class AdaptiveExamRevisionEngine {
  /**
   * Gera o plano de blocos calibrado estritamente para o tempo disponível
   */
  static generatePlan(horizon, rankedTopics = [], totalMinutes = 60) {
    const horizonType = (horizon || '60m').toLowerCase();
    const topWeakTopics = rankedTopics.slice(0, 3);

    // 1. Estratégia de 7 Dias (Plano Multiday Equilibrado)
    if (horizonType === '7d' || horizonType === '7_dias') {
      return {
        strategy: '7_DAYS_BALANCED',
        horizon: '7d',
        totalMinutes: 420, // 60 min por dia
        days: [
          { day: 1, title: 'Dia 1: Diagnóstico e Mapeamento de Lacunas', durationMinutes: 60 },
          { day: 2, title: `Dia 2: Foco no Tópico Mais Crítico (${topWeakTopics[0]?.name || 'Tópico 1'})`, durationMinutes: 60 },
          { day: 3, title: `Dia 3: Aprofundamento (${topWeakTopics[1]?.name || 'Tópico 2'}) e Questões`, durationMinutes: 60 },
          { day: 4, title: 'Dia 4: Treino de Questões e Artigos de Lei Comentados', durationMinutes: 60 },
          { day: 5, title: 'Dia 5: Simulado Completo Cronometrado', durationMinutes: 60 },
          { day: 6, title: 'Dia 6: Raio-X de Erros do Simulado e Flashcards', durationMinutes: 60 },
          { day: 7, title: 'Dia 7: Revisão Leve, Áudio e Descanso Mental', durationMinutes: 60 }
        ]
      };
    }

    // 2. Estratégia de Véspera (24 Horas)
    if (horizonType === '24h' || horizonType === 'vespera') {
      return {
        strategy: 'EVE_OF_EXAM_CONSOLIDATION',
        horizon: '24h',
        totalMinutes: 90,
        blocks: [
          { order: 1, title: 'Raio-X de Erros Recorrentes', activity: 'errors', durationMinutes: 25, reason: 'Fixação de pontos de falha prévia' },
          { order: 2, title: 'Artigos Essenciais e Letra da Lei', activity: 'articles', durationMinutes: 20, reason: 'Literalidade dos dispositivos' },
          { order: 3, title: 'Flashcards de Alta Prioridade (Cram Mode)', activity: 'flashcards', durationMinutes: 25, reason: 'Active recall dos conceitos' },
          { order: 4, title: 'Revisão Oral com Professor Marcos (Áudio)', activity: 'audio', durationMinutes: 20, reason: 'Fixação passiva e consolidação' }
        ]
      };
    }

    // 3. Estratégia de Emergência (15 Minutos)
    if (horizonType === '15m' || horizonType === '15_min') {
      return {
        strategy: 'EMERGENCY_LAST_MINUTE',
        horizon: '15m',
        totalMinutes: 15,
        blocks: [
          { order: 1, title: 'Pontos Críticos dos Tópicos Mais Fracos', activity: 'summary', durationMinutes: 5 },
          { order: 2, title: 'Flashcards de Conceitos Vitais', activity: 'flashcards', durationMinutes: 5 },
          { order: 3, title: 'Erros Recorrentes Rápidos', activity: 'errors', durationMinutes: 5 }
        ]
      };
    }

    // 4. Estratégia Padrão (60 Minutos Ultra-Focado)
    return {
      strategy: 'ULTRA_FOCUSED_60_MIN',
      horizon: '60m',
      totalMinutes: 60,
      blocks: [
        { order: 1, title: 'Mapa Geral do Conteúdo', activity: 'map', durationMinutes: 10 },
        { order: 2, title: `Revisão dos Tópicos Mais Fracos (${topWeakTopics[0]?.name || 'Tópico 1'})`, activity: 'weak_topics', durationMinutes: 15 },
        { order: 3, title: 'Bateria de Questões Práticas', activity: 'questions', durationMinutes: 15 },
        { order: 4, title: 'Correção e Raio-X dos Erros', activity: 'errors', durationMinutes: 10 },
        { order: 5, title: 'Active Recall com Flashcards', activity: 'flashcards', durationMinutes: 7 },
        { order: 6, title: 'Resumo e Fechamento em Áudio', activity: 'summary', durationMinutes: 3 }
      ]
    };
  }

  /**
   * Recalcula o plano restante se um bloco atrasar ou for pulado
   */
  static adaptRemainingTime(plan, completedBlockOrder, timeSpentMinutes) {
    const remainingBlocks = (plan.blocks || []).filter(b => b.order > completedBlockOrder);
    const plannedRemainingMinutes = remainingBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);

    return {
      remainingBlocksCount: remainingBlocks.length,
      plannedRemainingMinutes,
      isAdjusted: true,
      message: `Agenda recalculada: restam ${remainingBlocks.length} blocos totalizando ${plannedRemainingMinutes} minutos.`
    };
  }
}

if (typeof window !== 'undefined') {
  window.ExamRevisionContextBuilder = ExamRevisionContextBuilder;
  window.ExamRevisionPriorityEngine = ExamRevisionPriorityEngine;
  window.AdaptiveExamRevisionEngine = AdaptiveExamRevisionEngine;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ExamRevisionContextBuilder,
    ExamRevisionPriorityEngine,
    AdaptiveExamRevisionEngine
  };
}
