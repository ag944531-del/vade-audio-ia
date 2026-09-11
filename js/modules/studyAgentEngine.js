/**
 * VadeAudio AI - Motor do Agente Autônomo de Estudos Jurídicos (Etapa 26)
 * Copiloto acadêmico que analisa exames, fraquezas, erros e flashcards para orquestrar
 * e conduzir sessões de estudo inteligentes em Modo Foco com adaptação em tempo real.
 */

class StudyPriorityEngine {
  static calculateTopicScore(topic) {
    // Pesos da fórmula de priorização:
    // W_exam = 0.40, W_mastery = 0.30, W_errors = 0.20, W_srs = 0.10
    const daysUntilExam = topic.daysUntilExam !== undefined ? topic.daysUntilExam : 30;
    const examUrgency = Math.max(0, 10 - daysUntilExam) * 10; // 0 a 100
    const masteryDeficit = 100 - (topic.masteryPercent !== undefined ? topic.masteryPercent : 70); // 0 a 100
    const errorScore = Math.min(100, (topic.recentErrorsCount || 0) * 20); // 0 a 100
    const srsScore = Math.min(100, (topic.dueCardsCount || 0) * 10); // 0 a 100

    const finalScore = (0.40 * examUrgency) + (0.30 * masteryDeficit) + (0.20 * errorScore) + (0.10 * srsScore);
    return Math.round(finalScore);
  }

  static selectTopPriorityTopics(topicsList) {
    if (!topicsList || topicsList.length === 0) return [];
    return [...topicsList].sort((a, b) => this.calculateTopicScore(b) - this.calculateTopicScore(a));
  }
}

class StudyContextBuilder {
  static buildContext(authService, academicAnalytics, examManager) {
    return {
      upcomingExam: { name: 'P1 Penal', subject: 'Direito Penal', daysRemaining: 3 },
      weakTopics: [
        { name: 'Dolo Eventual vs Culpa Consciente', subject: 'Direito Penal', masteryPercent: 43, recentErrorsCount: 5, daysUntilExam: 3, dueCardsCount: 8 },
        { name: 'Legítima Defesa', subject: 'Direito Penal', masteryPercent: 82, recentErrorsCount: 1, daysUntilExam: 3, dueCardsCount: 2 },
        { name: 'Tutela Provisória de Urgência', subject: 'Processo Civil', masteryPercent: 48, recentErrorsCount: 6, daysUntilExam: 12, dueCardsCount: 5 }
      ],
      userPreferences: { preferredMode: 'balanced', targetMinutes: 30 }
    };
  }
}

class AdaptiveStudyEngine {
  static evaluateStepPerformance(stepType, scorePercent) {
    if (scorePercent >= 80) {
      return {
        action: 'advance',
        message: 'Excelente domínio demonstrado! Avançando para o próximo tópico sem repetições desnecessárias.'
      };
    } else if (scorePercent <= 40) {
      return {
        action: 'remediate',
        message: 'Identificamos algumas dúvidas conceituais. Vamos fazer uma breve revisão de 3 minutos com o Professor Marcos antes de novas questões.'
      };
    }
    return {
      action: 'continue',
      message: 'Bom ritmo de estudo! Prosseguindo conforme o planejado.'
    };
  }
}

class StudySessionOrchestrator {
  constructor(authService, audioEngine, voiceProfessor) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.voiceProfessor = voiceProfessor;
    this.activeSession = null;
    this.timerInterval = null;
  }

  planSession(availableMinutes = 30, mode = 'balanced', targetSubject = 'Direito Penal') {
    const context = StudyContextBuilder.buildContext();
    const sortedTopics = StudyPriorityEngine.selectTopPriorityTopics(context.weakTopics);
    const primaryTopic = sortedTopics[0] || { name: 'Revisão Geral', subject: targetSubject };

    const activities = [];
    const totalMins = Math.min(120, Math.max(10, availableMinutes));

    if (totalMins <= 15) {
      activities.push({ id: 'act_1', title: `Flashcards Vencidos — ${primaryTopic.name}`, durationMin: 4, type: 'flashcards' });
      activities.push({ id: 'act_2', title: `3 Questões Foco — ${primaryTopic.name}`, durationMin: 8, type: 'quiz' });
      activities.push({ id: 'act_3', title: 'Correção Rápida de Erros', durationMin: 3, type: 'error_correction' });
    } else if (totalMins <= 35) {
      activities.push({ id: 'act_1', title: `Revisão Inicial — ${primaryTopic.name}`, durationMin: 5, type: 'review' });
      activities.push({ id: 'act_2', title: `Explicação com Prof. Marcos — Fundamentos`, durationMin: 8, type: 'voice_lesson' });
      activities.push({ id: 'act_3', title: `5 Questões de Fixação`, durationMin: 10, type: 'quiz' });
      activities.push({ id: 'act_4', title: `Flashcards de Fixação`, durationMin: 4, type: 'flashcards' });
      activities.push({ id: 'act_5', title: 'Resumo e Pontos Críticos', durationMin: 3, type: 'summary' });
    } else {
      activities.push({ id: 'act_1', title: `Diagnóstico & Flashcards — ${primaryTopic.name}`, durationMin: 8, type: 'flashcards' });
      activities.push({ id: 'act_2', title: `Aula Guiada com Prof. Marcos`, durationMin: 12, type: 'voice_lesson' });
      activities.push({ id: 'act_3', title: `Bateria de 10 Questões Reais`, durationMin: 15, type: 'quiz' });
      activities.push({ id: 'act_4', title: `Correção Detalhada com Vade Mecum`, durationMin: 6, type: 'review' });
      activities.push({ id: 'act_5', title: 'Síntese Final para a Prova', durationMin: 4, type: 'summary' });
    }

    this.activeSession = {
      id: 'sess_' + Date.now().toString(36),
      mode,
      targetSubject,
      primaryTopic: primaryTopic.name,
      totalMinutes: totalMins,
      remainingSeconds: totalMins * 60,
      activities,
      currentActivityIndex: 0,
      state: 'planned',
      stats: { questionsAnswered: 0, correctAnswers: 0, cardsReviewed: 0 },
      createdAt: Date.now()
    };

    return this.activeSession;
  }

  startSession() {
    if (!this.activeSession) return false;
    this.activeSession.state = 'active';
    return true;
  }

  skipCurrentActivity() {
    if (!this.activeSession) return null;
    if (this.activeSession.currentActivityIndex < this.activeSession.activities.length - 1) {
      this.activeSession.currentActivityIndex++;
      return this.activeSession.activities[this.activeSession.currentActivityIndex];
    }
    this.activeSession.state = 'completed';
    return null;
  }
}

window.StudyPriorityEngine = StudyPriorityEngine;
window.StudyContextBuilder = StudyContextBuilder;
window.AdaptiveStudyEngine = AdaptiveStudyEngine;
window.StudySessionOrchestrator = StudySessionOrchestrator;
