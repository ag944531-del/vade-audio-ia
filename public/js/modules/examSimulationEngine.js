/**
 * VadeAudio AI - Motor do Simulador Inteligente de Provas & OAB (Etapa 27)
 * Geração de simulados cronometrados em ambiente realista, correção imutável
 * e diagnóstico aprofundado com '🔬 Raio-X dos Erros' (classificação dogmática e comportamental).
 */

class ErrorXRayAnalyzer {
  static analyzeError(question, selectedAnswerIndex, timeSpentSeconds, userConfidence = 'medium') {
    const isFast = timeSpentSeconds < 15;
    let cause = 'Conteúdo Não Dominado';
    let diagnosis = 'A resposta indicada diverge dos preceitos legais e jurisprudenciais vigentes.';

    if (question.distractorConcepts && question.distractorConcepts[selectedAnswerIndex]) {
      cause = 'Confusão Conceitual';
      diagnosis = `Possível confusão dogmática entre ${question.topic} e ${question.distractorConcepts[selectedAnswerIndex]}.`;
    } else if (isFast) {
      cause = 'Desatenção';
      diagnosis = 'A questão foi respondida em menos de 15 segundos, sugerindo leitura rápida ou descuido com termos como "exceto" ou "incorreta".';
    } else if (question.requiresInterpretation) {
      cause = 'Interpretação';
      diagnosis = 'O caso concreto demandava subsunção específica que não foi identificada na alternativa escolhida.';
    }

    return {
      cause,
      diagnosis,
      topic: question.topic || 'Direito',
      relatedArticle: question.relatedArticle || 'Artigo de Lei',
      correctIndex: question.correctIndex,
      selectedAnswerIndex,
      timeSpentSeconds,
      actions: {
        reviewLawUrl: question.articleId || 'vade-mecum',
        tutorPrompt: `Me explique por que errei a questão sobre ${question.topic} e qual a distinção correta.`,
        flashcardSuggestion: {
          question: `Qual a regra aplicável a ${question.topic}?`,
          answer: question.explanation || 'Conforme legislação oficial vigente.'
        }
      }
    };
  }
}

class ExamSimulationEngine {
  constructor(authService, audioEngine, vadeEngine, tutorEngine, studyAgentEngine) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.studyAgentEngine = studyAgentEngine;

    this.activeSimulation = null;
    this.pastSimulations = [];
  }

  getPresetQuestions(type = 'faculdade') {
    return [
      {
        id: 'q_sim_1',
        stem: 'Tício, com intenção de matar Mévio, desfere um golpe de faca em seu abdômen. Mévio é socorrido a tempo e sobrevive sem sequelas permanentes. Diante do caso concreto e do Código Penal, assinale a correta:',
        options: [
          'Tício responderá por lesão corporal leve consumada.',
          'Tício responderá por homicídio tentado (Art. 121 c/c Art. 14, II do CP).',
          'A conduta é atípica por ausência de resultado morte.',
          'Houve desistência voluntária com isenção total de pena.'
        ],
        correctIndex: 1,
        topic: 'Tentativa de Homicídio',
        relatedArticle: 'Art. 121 c/c Art. 14, II do Código Penal',
        articleId: 'cp_art121',
        isOfficial: true,
        source: 'Exame OAB / Magistratura',
        explanation: 'Havendo animus necandi e não se consumando o delito por circunstâncias alheias à vontade do agente, configura-se tentativa de homicídio.',
        distractorConcepts: { 0: 'Lesão Corporal sem Animus Necandi', 3: 'Desistência Voluntária (Art. 15 CP)' }
      },
      {
        id: 'q_sim_2',
        stem: 'Nos termos do Código de Processo Civil, a tutela de urgência será concedida quando houver elementos que evidenciem:',
        options: [
          'Apenas a probabilidade do direito, independentemente do perigo de dano.',
          'A probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.',
          'A concordância expressa de ambas as partes do litígio.',
          'A existência prévia de sentença condenatória transitada em julgado.'
        ],
        correctIndex: 1,
        topic: 'Tutela Provisória de Urgência',
        relatedArticle: 'Art. 300 do Código de Processo Civil',
        articleId: 'cpc_art300',
        isOfficial: true,
        source: 'VadeAudio Banco Oficial',
        explanation: 'O Art. 300 do CPC estabelece expressamente os requisitos cumulativos do fumus boni iuris e periculum in mora.',
        distractorConcepts: { 0: 'Tutela da Evidência (Art. 311 CPC)' }
      },
      {
        id: 'q_sim_3',
        stem: 'Sobre as excludentes de ilicitude no Direito Penal brasileiro, é correto afirmar:',
        options: [
          'A legítima defesa autoriza o uso imoderado dos meios disponíveis.',
          'Não há crime quando o agente pratica o fato em estado de necessidade, legítima defesa, estrito cumprimento de dever legal ou exercício regular de direito.',
          'O excesso culposo ou doloso nunca é punível na legítima defesa.',
          'O consentimento do ofendido é excludente expressa e irrestrita em qualquer hipótese.'
        ],
        correctIndex: 1,
        topic: 'Excludentes de Ilicitude',
        relatedArticle: 'Art. 23 e 25 do Código Penal',
        articleId: 'cp_art23',
        isOfficial: true,
        source: 'Banca Examinadora',
        explanation: 'O Art. 23 do CP elenca o rol clássico das excludentes de ilicitude.',
        distractorConcepts: { 2: 'Excesso Punível (Art. 23, Parágrafo Único CP)' }
      }
    ];
  }

  createSimulation(type = 'faculdade', targetSubject = 'Direito Penal', options = {}) {
    const rawQuestions = this.getPresetQuestions(type);
    
    // Snapshot imutável das questões no momento do início do simulado
    const questionSnapshots = rawQuestions.map((q, idx) => ({
      index: idx,
      id: q.id,
      stem: q.stem,
      options: [...q.options],
      correctIndex: q.correctIndex,
      topic: q.topic,
      relatedArticle: q.relatedArticle,
      articleId: q.articleId,
      isOfficial: q.isOfficial,
      source: q.source,
      explanation: q.explanation,
      distractorConcepts: q.distractorConcepts || {},
      selectedAnswer: null,
      timeSpentSeconds: 0,
      isMarkedForReview: false
    }));

    this.activeSimulation = {
      id: 'sim_' + Date.now().toString(36),
      type,
      targetSubject,
      totalQuestions: questionSnapshots.length,
      timeLimitMinutes: options.timeLimitMinutes || (questionSnapshots.length * 3),
      remainingSeconds: (options.timeLimitMinutes || (questionSnapshots.length * 3)) * 60,
      currentQuestionIndex: 0,
      questions: questionSnapshots,
      state: 'in_progress', // 'in_progress' | 'completed'
      createdAt: Date.now()
    };

    return this.activeSimulation;
  }

  recordAnswer(questionIndex, selectedIndex, timeSpent = 15) {
    if (!this.activeSimulation || this.activeSimulation.state !== 'in_progress') return false;
    const q = this.activeSimulation.questions[questionIndex];
    if (!q) return false;

    q.selectedAnswer = selectedIndex;
    q.timeSpentSeconds = (q.timeSpentSeconds || 0) + timeSpent;
    return true;
  }

  toggleMarkForReview(questionIndex) {
    if (!this.activeSimulation) return false;
    const q = this.activeSimulation.questions[questionIndex];
    if (q) {
      q.isMarkedForReview = !q.isMarkedForReview;
      return q.isMarkedForReview;
    }
    return false;
  }

  submitSimulation() {
    if (!this.activeSimulation) return null;

    let correctCount = 0;
    let blankCount = 0;
    const errorXRayList = [];

    for (const q of this.activeSimulation.questions) {
      if (q.selectedAnswer === null || q.selectedAnswer === undefined) {
        blankCount++;
        errorXRayList.push({
          questionIndex: q.index,
          topic: q.topic,
          cause: 'Gerenciamento de Tempo',
          diagnosis: 'A questão foi deixada em branco (não respondida).',
          relatedArticle: q.relatedArticle
        });
      } else if (q.selectedAnswer === q.correctIndex) {
        correctCount++;
      } else {
        const xray = ErrorXRayAnalyzer.analyzeError(q, q.selectedAnswer, q.timeSpentSeconds || 20);
        xray.questionIndex = q.index;
        errorXRayList.push(xray);
      }
    }

    const total = this.activeSimulation.questions.length;
    const scorePercent = Math.round((correctCount / total) * 100);

    const result = {
      simulationId: this.activeSimulation.id,
      type: this.activeSimulation.type,
      totalQuestions: total,
      correctCount,
      wrongCount: total - correctCount - blankCount,
      blankCount,
      scorePercent,
      errorXRayList,
      completedAt: Date.now()
    };

    this.activeSimulation.state = 'completed';
    this.activeSimulation.result = result;
    this.pastSimulations.push(this.activeSimulation);

    return result;
  }
}

window.ErrorXRayAnalyzer = ErrorXRayAnalyzer;
window.ExamSimulationEngine = ExamSimulationEngine;
