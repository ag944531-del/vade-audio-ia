/**
 * VadeAudio AI - Motor de Insights Acadêmicos & Recomendações Acionáveis (Etapa 17)
 * Transforma métricas analíticas em diagnósticos claros e ações prioritárias para o plano diário.
 */

class AcademicInsightService {
  constructor(analyticsEngine) {
    this.analyticsEngine = analyticsEngine;
  }

  generateDeterministicInsights() {
    const analytics = this.analyticsEngine.getAcademicAnalytics();
    const insights = [];

    // 1. Insight de Evolução Positiva
    if (analytics.evolution && analytics.evolution.length >= 2) {
      const first = analytics.evolution[0].score;
      const last = analytics.evolution[analytics.evolution.length - 1].score;
      const diff = last - first;
      if (diff > 0) {
        insights.push({
          type: 'positive_evolution',
          category: 'Evolução',
          icon: 'fa-arrow-trend-up',
          color: '#10b981',
          title: 'Evolução Consistente no Semestre',
          description: `Seu domínio geral avançou ${diff} pontos percentuais (de ${first}% para ${last}%) nos últimos meses com prática ativa.`,
          groundedMetric: { diff, first, last }
        });
      }
    }

    // 2. Insight de Risco de Esquecimento (Curva Ebbinghaus)
    const highRisks = (analytics.retentionRisks || []).filter(r => r.riskLevel === 'high');
    if (highRisks.length > 0) {
      const topRisk = highRisks[0];
      insights.push({
        type: 'forgetting_risk',
        category: 'Retenção & SRS',
        icon: 'fa-triangle-exclamation',
        color: '#ef4444',
        title: 'Alerta de Retenção e Esquecimento',
        description: `Você está há ${topRisk.daysSinceReview} dias sem revisar "${topRisk.topic}" (${topRisk.subject}). Retenção estimada em apenas ${topRisk.retentionPercent}%.`,
        groundedMetric: { topic: topRisk.topic, days: topRisk.daysSinceReview, retention: topRisk.retentionPercent }
      });
    }

    // 3. Insight de Desequilíbrio & Prova Próxima
    if (analytics.imbalances && analytics.imbalances.length > 0) {
      const topImbalance = analytics.imbalances[0];
      insights.push({
        type: 'study_imbalance',
        category: 'Desequilíbrio de Tempo',
        icon: 'fa-scale-unbalanced',
        color: 'var(--accent-amber)',
        title: 'Atenção ao Cronograma de Prova',
        description: topImbalance.message,
        groundedMetric: topImbalance
      });
    }

    // 4. Insight de Erros Recorrentes
    if (analytics.recurrentErrors && analytics.recurrentErrors.length > 0) {
      const topError = analytics.recurrentErrors[0];
      insights.push({
        type: 'recurrent_error',
        category: 'Caderno de Erros',
        icon: 'fa-bullseye',
        color: '#f59e0b',
        title: 'Foco Necessário em Tema Crítico',
        description: `Identificamos ${topError.count} erros recentes em "${topError.topic}". Recomendamos uma sessão de fixação direcionada.`,
        groundedMetric: topError
      });
    }

    return insights;
  }
}

class RecommendationEngine {
  constructor(analyticsEngine, insightService) {
    this.analyticsEngine = analyticsEngine;
    this.insightService = insightService;
    this.dismissedActions = new Set();
  }

  generateActionablePlan() {
    const analytics = this.analyticsEngine.getAcademicAnalytics();
    const recommendations = [];

    // Recomendação 1: Revisão de Alto Impacto (30 minutos)
    const criticalError = (analytics.recurrentErrors || [])[0];
    if (criticalError && !this.dismissedActions.has(`rev_${criticalError.topic}`)) {
      recommendations.push({
        id: `rec_error_${criticalError.topic.replace(/\s+/g, '_')}`,
        title: `Revisão de Alto Impacto (30 min): ${criticalError.topic}`,
        subject: 'Direito Processual / Penal',
        estimatedMinutes: 30,
        priority: 'high',
        type: 'high_impact_review',
        badge: 'ALTO IMPACTO',
        reason: `${criticalError.count} erros recentes registrados no Caderno de Erros`,
        actionType: 'start_quiz',
        articlesToReview: ['Art. 300 do CPC', 'Art. 18 do Código Penal']
      });
    }

    // Recomendação 2: Limpar Flashcards Vencidos
    const highRiskSrs = (analytics.retentionRisks || []).filter(r => r.riskLevel === 'high');
    if (highRiskSrs.length > 0 && !this.dismissedActions.has('rec_srs_clean')) {
      recommendations.push({
        id: 'rec_srs_clean',
        title: `Prevenir Esquecimento: ${highRiskSrs.length} tópicos em risco`,
        subject: highRiskSrs[0].subject,
        estimatedMinutes: 15,
        priority: 'medium',
        type: 'srs_retention',
        badge: 'SRS',
        reason: `Última revisão há mais de ${highRiskSrs[0].daysSinceReview} dias`,
        actionType: 'open_flashcards'
      });
    }

    // Recomendação 3: Preparação da Prova Próxima
    const nextExam = (analytics.examReadiness || [])[0];
    if (nextExam && !this.dismissedActions.has(`rec_exam_${nextExam.id}`)) {
      recommendations.push({
        id: `rec_exam_${nextExam.id}`,
        title: `Simulado Focado: ${nextExam.name}`,
        subject: nextExam.subject,
        estimatedMinutes: 40,
        priority: 'high',
        type: 'exam_prep',
        badge: 'PROVA',
        reason: `Prova em ${nextExam.daysUntil} dias — Preparação atual: ${nextExam.levelText}`,
        actionType: 'start_exam'
      });
    }

    return recommendations;
  }

  dismissRecommendation(id) {
    this.dismissedActions.add(id);
  }
}

window.AcademicInsightService = AcademicInsightService;
window.RecommendationEngine = RecommendationEngine;
