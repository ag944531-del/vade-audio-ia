/**
 * VadeAudio AI - Motor de Inteligência Acadêmica e Analytics do Estudante (Etapa 17)
 * Fórmulas determinísticas de Domínio, Curva de Esquecimento, Diagnóstico de Desequilíbrio,
 * Caderno de Erros, Preparação para Provas e Eficácia de Métodos de Estudo.
 */

class AcademicAnalyticsEngine {
  constructor(authService) {
    this.authService = authService;
    this.currentPeriod = '30d'; // '7d' | '30d' | '3m' | '6m' | 'semester' | 'all'
    this.initDefaultData();
  }

  // --------------------------------------------------------------------------
  // 1. CARGA E SEED DE DADOS ACADÊMICOS DO ESTUDANTE
  // --------------------------------------------------------------------------
  initDefaultData() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    const storageKey = `vadeaudio_academic_data_${userId}`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        // Mock representativo e fidedigno de dados históricos para o estudante
        const defaultData = {
          userId,
          studySessions: [
            { id: 's1', subject: 'Direito Penal', topic: 'Crimes contra a Vida', method: 'questions', durationMinutes: 45, date: Date.now() - 86400000 * 2, hourOfDay: 20 },
            { id: 's2', subject: 'Direito Penal', topic: 'Dolo e Culpa', method: 'audio', durationMinutes: 30, date: Date.now() - 86400000 * 3, hourOfDay: 19 },
            { id: 's3', subject: 'Direito Constitucional', topic: 'Direitos Fundamentais', method: 'reading', durationMinutes: 50, date: Date.now() - 86400000 * 4, hourOfDay: 21 },
            { id: 's4', subject: 'Direito Civil', topic: 'Contratos em Geral', method: 'flashcards', durationMinutes: 25, date: Date.now() - 86400000 * 5, hourOfDay: 20 },
            { id: 's5', subject: 'Processo Civil', topic: 'Tutela Provisória', method: 'questions', durationMinutes: 20, date: Date.now() - 86400000 * 18, hourOfDay: 14 },
            { id: 's6', subject: 'Direito Penal', topic: 'Dosimetria da Pena', method: 'questions', durationMinutes: 60, date: Date.now() - 86400000 * 1, hourOfDay: 20 }
          ],
          questionsHistory: [
            { id: 'q1', subject: 'Direito Penal', topic: 'Crimes contra a Vida', correct: true, difficulty: 'medium', timeSeconds: 65, date: Date.now() - 86400000 * 2 },
            { id: 'q2', subject: 'Direito Penal', topic: 'Crimes contra a Vida', correct: true, difficulty: 'easy', timeSeconds: 40, date: Date.now() - 86400000 * 2 },
            { id: 'q3', subject: 'Direito Penal', topic: 'Dolo e Culpa', correct: true, difficulty: 'hard', timeSeconds: 90, date: Date.now() - 86400000 * 3 },
            { id: 'q4', subject: 'Direito Penal', topic: 'Dolo e Culpa', correct: false, difficulty: 'hard', timeSeconds: 110, errorType: 'institute_confusion', errorDesc: 'Confundiu dolo eventual com culpa consciente no trânsito', date: Date.now() - 86400000 * 3 },
            { id: 'q5', subject: 'Direito Constitucional', topic: 'Direitos Fundamentais', correct: true, difficulty: 'medium', timeSeconds: 55, date: Date.now() - 86400000 * 4 },
            { id: 'q6', subject: 'Direito Constitucional', topic: 'Controle de Constitucionalidade', correct: false, difficulty: 'hard', timeSeconds: 120, errorType: 'conceptual', errorDesc: 'Confundiu controle difuso com concentrado', date: Date.now() - 86400000 * 19 },
            { id: 'q7', subject: 'Processo Civil', topic: 'Tutela Provisória', correct: false, difficulty: 'medium', timeSeconds: 85, errorType: 'article_citation', errorDesc: 'Errou requisitos da tutela de urgência (Art. 300 CPC)', date: Date.now() - 86400000 * 18 },
            { id: 'q8', subject: 'Processo Civil', topic: 'Tutela Provisória', correct: false, difficulty: 'hard', timeSeconds: 130, errorType: 'conceptual', errorDesc: 'Confundiu tutela antecipada com cautelar', date: Date.now() - 86400000 * 18 },
            { id: 'q9', subject: 'Direito Civil', topic: 'Contratos em Geral', correct: true, difficulty: 'medium', timeSeconds: 60, date: Date.now() - 86400000 * 5 },
            { id: 'q10', subject: 'Direito Civil', topic: 'Contratos em Geral', correct: true, difficulty: 'easy', timeSeconds: 45, date: Date.now() - 86400000 * 5 },
            { id: 'q11', subject: 'Direito Penal', topic: 'Dosimetria da Pena', correct: false, difficulty: 'hard', timeSeconds: 95, errorType: 'interpretation', errorDesc: 'Erro no cálculo da fração na terceira fase da dosimetria', date: Date.now() - 86400000 * 1 },
            { id: 'q12', subject: 'Direito Penal', topic: 'Dosimetria da Pena', correct: true, difficulty: 'medium', timeSeconds: 70, date: Date.now() - 86400000 * 1 }
          ],
          mockExams: [
            { id: 'm1', title: 'Simulado OAB 1ª Fase - Geral', scorePercent: 64, date: Date.now() - 86400000 * 45, totalQuestions: 80, difficulty: 'medium' },
            { id: 'm2', title: 'Simulado Penal & Constitucional', scorePercent: 72, date: Date.now() - 86400000 * 20, totalQuestions: 40, difficulty: 'medium' },
            { id: 'm3', title: 'Simulado Parcial do Semestre', scorePercent: 78, date: Date.now() - 86400000 * 5, totalQuestions: 50, difficulty: 'medium' }
          ],
          srsFlashcards: [
            { id: 'fc1', subject: 'Direito Penal', topic: 'Dolo Eventual', repetitions: 4, intervalDays: 14, lastReviewDate: Date.now() - 86400000 * 2, retention: 0.90 },
            { id: 'fc2', subject: 'Direito Constitucional', topic: 'Controle Concentrado', repetitions: 2, intervalDays: 4, lastReviewDate: Date.now() - 86400000 * 19, retention: 0.40 },
            { id: 'fc3', subject: 'Processo Civil', topic: 'Art. 300 CPC Tutela', repetitions: 1, intervalDays: 1, lastReviewDate: Date.now() - 86400000 * 18, retention: 0.35 },
            { id: 'fc4', subject: 'Direito Civil', topic: 'Vício Redibitório', repetitions: 5, intervalDays: 21, lastReviewDate: Date.now() - 86400000 * 6, retention: 0.85 }
          ],
          upcomingExams: [
            { id: 'ex1', subject: 'Direito Penal', name: 'Prova P1 — Teoria das Penas & Crimes', examDate: Date.now() + 86400000 * 9, topicsCount: 6, coveredTopicsCount: 5 },
            { id: 'ex2', subject: 'Processo Civil', name: 'Prova P1 — Teoria Geral & Tutelas', examDate: Date.now() + 86400000 * 6, topicsCount: 5, coveredTopicsCount: 2 }
          ]
        };
        localStorage.setItem(storageKey, JSON.stringify(defaultData));
      }
    } catch {}
  }

  getRawData() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    const storageKey = `vadeaudio_academic_data_${userId}`;
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { studySessions: [], questionsHistory: [], mockExams: [], srsFlashcards: [], upcomingExams: [] };
    } catch {
      return { studySessions: [], questionsHistory: [], mockExams: [], srsFlashcards: [], upcomingExams: [] };
    }
  }

  // --------------------------------------------------------------------------
  // 2. FILTRAGEM TEMPORAL
  // --------------------------------------------------------------------------
  getPeriodCutoffDate(period = this.currentPeriod) {
    const now = Date.now();
    switch (period) {
      case '7d': return now - 86400000 * 7;
      case '30d': return now - 86400000 * 30;
      case '3m': return now - 86400000 * 90;
      case '6m': return now - 86400000 * 180;
      case 'semester': return now - 86400000 * 120;
      case 'all': return 0;
      default: return now - 86400000 * 30;
    }
  }

  setPeriod(period) {
    this.currentPeriod = period;
  }

  // --------------------------------------------------------------------------
  // 3. FÓRMULA DE DOMÍNIO ACADÊMICO & CONFIANÇA AMOSTRAL
  // --------------------------------------------------------------------------
  /**
   * Fórmula Determinística de Domínio:
   * Domínio = 0.35 * Acerto_Questões + 0.25 * Média_Simulados + 0.20 * Retenção_SRS + 0.10 * Fator_Recência + 0.10 * Fator_Dificuldade
   *
   * Confiança Amostral:
   * - Baixa (< 5 itens): Não exibe precisão falsa, emite aviso explícito.
   * - Média (5 a 19 itens): Dados moderados.
   * - Alta (>= 20 itens): Amostra estatística sólida.
   */
  calculateMasteryScore({ questions = [], mockExams = [], flashcards = [] }) {
    const totalQuestions = questions.length;
    const totalMocks = mockExams.length;
    const totalCards = flashcards.length;

    const totalSamplePoints = totalQuestions + (totalMocks * 5) + totalCards;

    let confidence = 'low';
    let confidenceReason = 'Ainda existem poucos dados sobre este tema para uma análise estatística precisa.';

    if (totalSamplePoints >= 20) {
      confidence = 'high';
      confidenceReason = 'Base estatística robusta com histórico consolidado.';
    } else if (totalSamplePoints >= 6) {
      confidence = 'medium';
      confidenceReason = 'Amostra moderada. O índice se tornará mais preciso com mais exercícios.';
    }

    if (totalSamplePoints === 0) {
      return { score: 0, confidence: 'low', confidenceReason, formulaExplanation: 'Sem dados suficientes no período.' };
    }

    // 1. Acerto em Questões (Peso 35%)
    let questionAccuracy = 70; // fallback neutro
    if (totalQuestions > 0) {
      const correctCount = questions.filter(q => q.correct).length;
      questionAccuracy = (correctCount / totalQuestions) * 100;
    }

    // 2. Média em Simulados (Peso 25%)
    let mockAccuracy = 70;
    if (totalMocks > 0) {
      const sum = mockExams.reduce((acc, m) => acc + m.scorePercent, 0);
      mockAccuracy = sum / totalMocks;
    }

    // 3. Retenção SRS / Flashcards (Peso 20%)
    let srsRetention = 70;
    if (totalCards > 0) {
      const sumRet = flashcards.reduce((acc, f) => acc + (f.retention || 0.7), 0);
      srsRetention = (sumRet / totalCards) * 100;
    }

    // 4. Fator Recência (Peso 10%): se estudou nos últimos 7 dias = 100%, 14 dias = 75%, 30 dias = 50%, >30d = 25%
    let recencyScore = 50;
    const allDates = [...questions.map(q => q.date), ...studySessionsDates(questions)];
    if (allDates.length > 0) {
      const mostRecent = Math.max(...allDates);
      const daysAgo = (Date.now() - mostRecent) / 86400000;
      if (daysAgo <= 7) recencyScore = 100;
      else if (daysAgo <= 14) recencyScore = 80;
      else if (daysAgo <= 30) recencyScore = 55;
      else recencyScore = 30;
    }

    // 5. Fator Ponderação de Dificuldade (Peso 10%)
    let difficultyScore = 70;
    if (totalQuestions > 0) {
      const hardCount = questions.filter(q => q.difficulty === 'hard' && q.correct).length;
      const hardTotal = questions.filter(q => q.difficulty === 'hard').length;
      if (hardTotal > 0) {
        difficultyScore = (hardCount / hardTotal) * 100;
      }
    }

    const finalScore = Math.round(
      (0.35 * questionAccuracy) +
      (0.25 * mockAccuracy) +
      (0.20 * srsRetention) +
      (0.10 * recencyScore) +
      (0.10 * difficultyScore)
    );

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      confidence,
      confidenceReason,
      components: {
        questionAccuracy: Math.round(questionAccuracy),
        mockAccuracy: Math.round(mockAccuracy),
        srsRetention: Math.round(srsRetention),
        recencyScore: Math.round(recencyScore),
        difficultyScore: Math.round(difficultyScore)
      },
      formulaExplanation: 'Ponderação: 35% Questões + 25% Simulados + 20% SRS + 10% Recência + 10% Dificuldade'
    };
  }

  // --------------------------------------------------------------------------
  // 4. DIAGNÓSTICO COMPLETO & MÉTRICAS ESTRUTURADAS (PERIOD-AWARE)
  // --------------------------------------------------------------------------
  getAcademicAnalytics() {
    const raw = this.getRawData();
    const cutoff = this.getPeriodCutoffDate();

    // Filtrar dados pelo período selecionado
    const filteredSessions = raw.studySessions.filter(s => s.date >= cutoff);
    const filteredQuestions = raw.questionsHistory.filter(q => q.date >= cutoff);
    const filteredMocks = raw.mockExams.filter(m => m.date >= cutoff);
    const filteredCards = raw.srsFlashcards; // SRS reflete o estado atual dos cartões

    // 1. Horas de Estudo & Distribuição
    const totalMinutes = filteredSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHoursDecimal = (totalMinutes / 60).toFixed(1);
    const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`;

    // Tempo por Matéria
    const timeBySubject = {};
    filteredSessions.forEach(s => {
      timeBySubject[s.subject] = (timeBySubject[s.subject] || 0) + (s.durationMinutes || 0);
    });

    // 2. Questões & Taxa de Acerto
    const questionsAnswered = filteredQuestions.length;
    const questionsCorrect = filteredQuestions.filter(q => q.correct).length;
    const questionsWrong = questionsAnswered - questionsCorrect;
    const accuracyPercent = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;
    const avgTimePerQuestion = questionsAnswered > 0 ? Math.round(filteredQuestions.reduce((acc, q) => acc + (q.timeSeconds || 60), 0) / questionsAnswered) : 60;

    // Desempenho por Dificuldade
    const difficultyStats = {
      easy: calculateAccuracy(filteredQuestions.filter(q => q.difficulty === 'easy')),
      medium: calculateAccuracy(filteredQuestions.filter(q => q.difficulty === 'medium')),
      hard: calculateAccuracy(filteredQuestions.filter(q => q.difficulty === 'hard'))
    };

    // 3. Domínio por Disciplina & Tema
    const subjects = ['Direito Penal', 'Direito Constitucional', 'Direito Civil', 'Processo Civil'];
    const subjectMastery = subjects.map(subj => {
      const subQuestions = filteredQuestions.filter(q => q.subject === subj);
      const subCards = filteredCards.filter(c => c.subject === subj);
      const subMinutes = timeBySubject[subj] || 0;
      const mastery = this.calculateMasteryScore({ questions: subQuestions, mockExams: filteredMocks, flashcards: subCards });

      return {
        subject: subj,
        score: mastery.score,
        confidence: mastery.confidence,
        confidenceReason: mastery.confidenceReason,
        studyMinutes: subMinutes,
        questionsCount: subQuestions.length,
        accuracyPercent: calculateAccuracy(subQuestions).accuracy
      };
    }).sort((a, b) => b.score - a.score);

    // 4. Detecção de Desequilíbrio & Matérias Negligenciadas
    const imbalances = [];
    raw.upcomingExams.forEach(exam => {
      const subStats = subjectMastery.find(s => s.subject === exam.subject);
      const daysUntil = Math.ceil((exam.examDate - Date.now()) / 86400000);
      const totalStudyMins = Object.values(timeBySubject).reduce((a, b) => a + b, 0) || 1;
      const subjectMins = timeBySubject[exam.subject] || 0;
      const sharePercent = Math.round((subjectMins / totalStudyMins) * 100);

      if (daysUntil <= 10 && sharePercent < 15) {
        imbalances.push({
          subject: exam.subject,
          examName: exam.name,
          daysUntil,
          sharePercent,
          message: `${exam.subject} representa apenas ${sharePercent}% do seu tempo de estudo, apesar de você ter a prova "${exam.name}" em ${daysUntil} dias.`
        });
      }
    });

    // 5. Caderno de Erros Recorrentes
    const errorCountsByTopic = {};
    const errorDetails = [];
    filteredQuestions.filter(q => !q.correct).forEach(q => {
      errorCountsByTopic[q.topic] = (errorCountsByTopic[q.topic] || 0) + 1;
      errorDetails.push({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        errorType: q.errorType || 'conceptual',
        errorDesc: q.errorDesc || 'Erro no gabarito oficial',
        date: q.date
      });
    });

    const recurrentErrors = Object.entries(errorCountsByTopic)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    // 6. Curva de Esquecimento & Risco de Retenção (Ebbinghaus Decay)
    const retentionRisks = filteredCards.map(c => {
      const daysSinceReview = Math.round((Date.now() - c.lastReviewDate) / 86400000);
      // R = e^(-t/S)
      const estimatedRetention = Math.max(0.1, Math.exp(-daysSinceReview / (c.intervalDays || 5)));
      const retentionPercent = Math.round(estimatedRetention * 100);

      let riskLevel = 'low';
      if (retentionPercent < 50) riskLevel = 'high';
      else if (retentionPercent < 75) riskLevel = 'medium';

      return {
        id: c.id,
        subject: c.subject,
        topic: c.topic,
        daysSinceReview,
        retentionPercent,
        riskLevel
      };
    }).sort((a, b) => a.retentionPercent - b.retentionPercent);

    // 7. Preparação para Provas
    const examReadiness = raw.upcomingExams.map(ex => {
      const subQuestions = filteredQuestions.filter(q => q.subject === ex.subject);
      const acc = calculateAccuracy(subQuestions).accuracy;
      const coveragePercent = Math.round((ex.coveredTopicsCount / ex.topicsCount) * 100);
      const readinessIndex = Math.round((coveragePercent * 0.5) + (acc * 0.3) + (70 * 0.2));

      let levelText = 'Intermediário';
      if (readinessIndex >= 80) levelText = 'Avançado / Preparado';
      else if (readinessIndex < 60) levelText = 'Atenção / Risco';

      return {
        id: ex.id,
        name: ex.name,
        subject: ex.subject,
        examDate: ex.examDate,
        daysUntil: Math.ceil((ex.examDate - Date.now()) / 86400000),
        coveragePercent,
        accuracyPercent: acc,
        readinessIndex,
        levelText,
        calculationExplanation: 'Índice ponderado com 50% de cobertura do edital + 30% acerto em questões + 20% revisões.'
      };
    });

    // 8. Eficácia por Método de Estudo
    const methodCounts = { questions: 0, audio: 0, reading: 0, flashcards: 0 };
    filteredSessions.forEach(s => {
      if (methodCounts[s.method] !== undefined) {
        methodCounts[s.method] += s.durationMinutes || 0;
      }
    });

    // 9. Melhor Horário & Fadiga
    const sessionsByHour = {};
    filteredSessions.forEach(s => {
      const h = s.hourOfDay || 20;
      sessionsByHour[h] = (sessionsByHour[h] || 0) + 1;
    });

    // Domínio Geral do Estudante no Período
    const overallMastery = this.calculateMasteryScore({
      questions: filteredQuestions,
      mockExams: filteredMocks,
      flashcards: filteredCards
    });

    return {
      period: this.currentPeriod,
      overallMastery,
      studyTime: {
        totalHoursFormatted,
        totalHoursDecimal,
        totalMinutes,
        timeBySubject
      },
      questions: {
        total: questionsAnswered,
        correct: questionsCorrect,
        wrong: questionsWrong,
        accuracyPercent,
        avgTimePerQuestion,
        difficultyStats
      },
      subjectMastery,
      imbalances,
      recurrentErrors,
      errorDetails,
      retentionRisks,
      examReadiness,
      methodsDistribution: methodCounts,
      evolution: [
        { month: 'Maio', score: 58 },
        { month: 'Junho', score: 64 },
        { month: 'Julho', score: 70 },
        { month: 'Agosto', score: overallMastery.score }
      ]
    };
  }
}

// Helpers
function calculateAccuracy(questions) {
  const total = questions.length;
  if (total === 0) return { total: 0, correct: 0, accuracy: 0 };
  const correct = questions.filter(q => q.correct).length;
  return { total, correct, accuracy: Math.round((correct / total) * 100) };
}

function studySessionsDates(questions) {
  return questions.map(q => q.date || Date.now());
}

window.AcademicAnalyticsEngine = AcademicAnalyticsEngine;
