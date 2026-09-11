/**
 * VadeAudio AI - Motor de Prova Oral, Arguição, Sustentação e Audiência Simulada (Etapa 19)
 * Simulações orais realistas com bancas examinadoras, perguntas de aprofundamento contextual,
 * rubricas de avaliação estruturadas (0 a 10), respostas modelo e audiências brasileiras com papéis (Advogado, Promotor, Juiz).
 */

class OralExamEngine {
  constructor(authService, audioEngine, voiceProfessorEngine, legalBrainEngine) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.voiceProfessorEngine = voiceProfessorEngine;
    this.legalBrainEngine = legalBrainEngine;

    this.currentSession = null;
    this.currentQuestionIndex = 0;
    this.timerInterval = null;
    this.remainingSeconds = 60;
    this.isRecording = false;

    this.oralErrorsDb = this.loadOralErrors();
    this.sessionHistory = this.loadHistory();
  }

  loadOralErrors() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      return JSON.parse(localStorage.getItem(`vadeaudio_oral_errors_${userId}`)) || [
        { id: 'oe1', subject: 'Direito Penal', topic: 'Dolo Eventual vs Culpa Consciente', missedLaw: 'Art. 18, I vs II do CP', question: 'Diferencie dolo eventual de culpa consciente no trânsito.', timesFailed: 3, lastFailed: Date.now() - 86400000 * 2 },
        { id: 'oe2', subject: 'Processo Civil', topic: 'Requisitos da Tutela de Urgência', missedLaw: 'Art. 300 do CPC', question: 'Quais são os requisitos cumulativos para concessão da tutela provisória de urgência?', timesFailed: 2, lastFailed: Date.now() - 86400000 * 4 }
      ];
    } catch {
      return [];
    }
  }

  saveOralErrors() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      localStorage.setItem(`vadeaudio_oral_errors_${userId}`, JSON.stringify(this.oralErrorsDb));
    } catch {}
  }

  loadHistory() {
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      return JSON.parse(localStorage.getItem(`vadeaudio_oral_history_${userId}`)) || [];
    } catch {
      return [];
    }
  }

  saveHistory(sessionRecord) {
    this.sessionHistory.unshift(sessionRecord);
    const user = this.authService.getCurrentUser();
    const userId = user ? user.id : 'usr_student_lucas_101';
    try {
      localStorage.setItem(`vadeaudio_oral_history_${userId}`, JSON.stringify(this.sessionHistory));
    } catch {}
  }

  // --------------------------------------------------------------------------
  // 1. INÍCIO E CONFIGURAÇÃO DA PROVA ORAL
  // --------------------------------------------------------------------------
  startOralExam({
    subject = 'Direito Penal',
    topic = 'Teoria das Penas & Crimes contra a Vida',
    level = 'intermediario', // 'iniciante' | 'intermediario' | 'avancado'
    questionsCount = 3,
    timePerQuestion = 60,
    examMode = 'realista', // 'realista' (feedback no final) | 'treino' (feedback imediato)
    boardProfile = 'objetiva' // 'didatica' | 'objetiva' | 'rigorosa' | 'socratic'
  }) {
    const questionsBank = this.getQuestionsForSubject(subject, topic, level);

    this.currentSession = {
      id: 'oses_' + Math.random().toString(36).substring(2, 9),
      subject,
      topic,
      level,
      questionsCount: Math.min(questionsCount, questionsBank.length),
      timePerQuestion,
      examMode,
      boardProfile,
      questions: questionsBank.slice(0, questionsCount),
      answers: [],
      evaluations: [],
      status: 'in_progress',
      startedAt: Date.now()
    };

    this.currentQuestionIndex = 0;
    return this.currentSession;
  }

  getQuestionsForSubject(subject, topic, level) {
    return [
      {
        id: 'q_penal_1',
        subject: 'Direito Penal',
        stem: 'Candidato, considerando o Código Penal brasileiro, diferencie dolo eventual de culpa consciente, indicando a teoria adotada pela nossa legislação.',
        followUpPrompt: 'E no caso de racha em via pública urbana com vítima fatal, qual é o posicionamento predominante dos Tribunais Superiores?',
        requiredArticles: ['Art. 18, I e II do Código Penal'],
        requiredKeywords: ['assentimento', 'assume o risco', 'previsão', 'confiança sincera'],
        modelAnswer: 'No dolo eventual (Art. 18, I, segunda parte, CP - Teoria do Assentimento), o agente prevê o resultado e assume o risco de sua produção ("pouco me importa"). Na culpa consciente, o agente também prevê o resultado, mas acredita sinceramente que suas habilidades evitarão a consumação. No racha urbano com morte, o STF e o STJ admitem a pronúncia por homicídio doloso eventual a depender das circunstâncias fáticas.'
      },
      {
        id: 'q_penal_2',
        subject: 'Direito Penal',
        stem: 'Candidato, quais são os requisitos cumulativos para a caracterização da legítima defesa no ordenamento jurídico pátrio?',
        followUpPrompt: 'Essa agressão injusta pode ser passada ou deve ser necessariamente atual ou iminente?',
        requiredArticles: ['Art. 25 do Código Penal'],
        requiredKeywords: ['agressão injusta', 'atual ou iminente', 'meios necessários', 'moderação', 'direito próprio ou alheio'],
        modelAnswer: 'A legítima defesa (Art. 25 do CP) exige: 1) agressão injusta; 2) atual ou iminente; 3) proteção a direito próprio ou de terceiro; 4) uso moderado dos meios necessários; 5) animus defendendi. A agressão não pode ser passada (o que caracterizaria vingança) nem futura/remota.'
      },
      {
        id: 'q_cpc_1',
        subject: 'Processo Civil',
        stem: 'Candidato, disserte sobre os requisitos indispensáveis para a concessão da tutela provisória de urgência de natureza antecipada.',
        followUpPrompt: 'Existe algum requisito negativo que impeça expressamente a concessão da tutela de urgência antecipada?',
        requiredArticles: ['Art. 300 do Código de Processo Civil'],
        requiredKeywords: ['probabilidade do direito', 'perigo de dano', 'risco ao resultado útil', 'reversibilidade'],
        modelAnswer: 'Nos termos do Art. 300 do CPC, a tutela de urgência antecipada exige: 1) probabilidade do direito (fumus boni iuris); 2) perigo de dano ou risco ao resultado útil do processo (periculum in mora). O requisito negativo expresso no §3º é a reversibilidade dos efeitos da decisão liminar.'
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 2. GERAÇÃO DE PERGUNTA DE APROFUNDAMENTO CONTEXTUAL
  // --------------------------------------------------------------------------
  generateFollowUpQuestion(studentAnswer, currentQuestion) {
    const cleanAnswer = (studentAnswer || '').toLowerCase();
    
    if (cleanAnswer.includes('agressão') && !cleanAnswer.includes('atual')) {
      return 'O senhor mencionou agressão injusta. Ela precisa ser atual ou pode ser uma agressão pretérita?';
    }
    if (cleanAnswer.includes('dolo') && !cleanAnswer.includes('teoria')) {
      return 'Qual teoria doutrinária foi expressamente adotada pelo legislador no artigo dezoito para o dolo eventual?';
    }
    if (cleanAnswer.includes('tutela') && !cleanAnswer.includes('reversibilidade')) {
      return 'E quanto à irreversibilidade da medida liminar? O juiz pode conceder a tutela se ela for irreversível?';
    }

    return currentQuestion.followUpPrompt || 'Candidato, complemente citando o dispositivo legal aplicável.';
  }

  // --------------------------------------------------------------------------
  // 3. RUBRICA DE AVALIAÇÃO OBJETIVA (0 A 10 PONTOS)
  // --------------------------------------------------------------------------
  evaluateOralAnswer({ question, studentInitialAnswer, studentFollowUpAnswer, responseTimeSeconds, maxTimeSeconds }) {
    const combinedAnswer = `${studentInitialAnswer || ''} ${studentFollowUpAnswer || ''}`.toLowerCase();

    // 1. Correção Jurídica (0 a 4.0 pontos)
    let legalAccuracy = 3.5;
    if (combinedAnswer.length < 20) legalAccuracy = 1.0;
    if (combinedAnswer.includes('não sei') || combinedAnswer.includes('desculpe')) legalAccuracy = 0.5;

    // 2. Fundamentação Legal e Doutrinária (0 a 3.0 pontos)
    let legalGrounding = 1.0;
    const hasArticleMention = question.requiredArticles.some(art => combinedAnswer.includes(art.toLowerCase().split(' ')[1]) || combinedAnswer.includes('artigo'));
    if (hasArticleMention) legalGrounding += 1.5;

    const matchedKeywords = question.requiredKeywords.filter(kw => combinedAnswer.includes(kw.toLowerCase()));
    legalGrounding += (matchedKeywords.length / question.requiredKeywords.length) * 0.5;
    legalGrounding = Math.min(3.0, Math.round(legalGrounding * 10) / 10);

    // 3. Clareza & Coerência (0 a 2.0 pontos)
    let clarity = 1.8;
    if (combinedAnswer.length > 500) clarity = 1.2; // prolixo

    // 4. Objetividade & Gestão do Tempo (0 a 1.0 ponto)
    let timeManagement = 1.0;
    if (responseTimeSeconds > maxTimeSeconds) {
      timeManagement = Math.max(0.2, 1.0 - ((responseTimeSeconds - maxTimeSeconds) / 20));
    }
    timeManagement = Math.round(timeManagement * 10) / 10;

    const totalScore = Math.min(10.0, Math.round((legalAccuracy + legalGrounding + clarity + timeManagement) * 10) / 10);

    let classification = 'Aprovado com Excelência';
    if (totalScore < 6.0) classification = 'Reprovado / Revisão Necessária';
    else if (totalScore < 7.5) classification = 'Aprovado com Ressalvas';

    const evaluation = {
      questionId: question.id,
      questionStem: question.stem,
      studentInitialAnswer,
      studentFollowUpAnswer,
      rubric: {
        legalAccuracy: { score: legalAccuracy, max: 4.0, label: 'Correção Jurídica' },
        legalGrounding: { score: legalGrounding, max: 3.0, label: 'Fundamentação Legal' },
        clarity: { score: clarity, max: 2.0, label: 'Clareza & Coerência' },
        timeManagement: { score: timeManagement, max: 1.0, label: 'Objetividade & Tempo' }
      },
      totalScore,
      classification,
      spokenFeedback: `Candidato, sua nota nesta arguição foi ${totalScore} de dez. ${legalGrounding >= 2.5 ? 'Excelente fundamentação legal.' : 'Atenção: faltou citar expressamente os artigos aplicáveis.'}`,
      missedPoints: legalGrounding < 2.5 ? question.requiredArticles : [],
      modelAnswer: question.modelAnswer
    };

    if (totalScore < 6.5) {
      this.recordOralError(question, evaluation);
    }

    return evaluation;
  }

  recordOralError(question, evaluation) {
    const existing = this.oralErrorsDb.find(e => e.question === question.stem);
    if (existing) {
      existing.timesFailed++;
      existing.lastFailed = Date.now();
    } else {
      this.oralErrorsDb.push({
        id: 'oe_' + Math.random().toString(36).substring(2, 7),
        subject: question.subject,
        topic: 'Fundamentação e Conceito',
        missedLaw: question.requiredArticles.join(', '),
        question: question.stem,
        timesFailed: 1,
        lastFailed: Date.now()
      });
    }
    this.saveOralErrors();
  }

  // --------------------------------------------------------------------------
  // 4. SUSTENTAÇÃO ORAL
  // --------------------------------------------------------------------------
  getOralArgumentCases() {
    return [
      {
        id: 'arg_hc_trafico',
        title: 'Habeas Corpus — Tráfico Privilegiado & Regime Aberto',
        court: 'Tribunal de Justiça / STJ',
        summary: 'Paciente primário, de bons antecedentes, sem vínculo com organização criminosa, preso com 30g de maconha. O juízo singular negou o tráfico privilegiado com base na gravidade abstrata do delito.',
        legalThesis: 'Aplicação obrigatória do Art. 33, § 4º da Lei 11.343/06 e fixação de regime inicial aberto com substituição por PRD (Súmulas 718/719 STF).',
        maxMinutes: 5,
        requiredSteps: ['Abertura Formal', 'Síntese Fática', 'Demonstração dos Requisitos', 'Fundamentação nas Súmulas', 'Pedido de Concessão da Ordem']
      },
      {
        id: 'arg_apel_consumidor',
        title: 'Apelação Cível — Inscrição Indevida em Cadastro de Inadimplentes',
        court: 'Tribunal de Justiça Estadual',
        summary: 'Autor teve seu nome negativado por dívida inexistente de cartão de crédito que nunca contratou. O juízo de 1º grau julgou improcedente por ausência de prova do dano moral.',
        legalThesis: 'Dano moral in re ipsa decorrente da inscrição indevida nos órgãos de proteção ao crédito (Súmula 385/STJ e Art. 14 do CDC).',
        maxMinutes: 5,
        requiredSteps: ['Saudação à Câmara', 'Resumo da Falha na Prestação do Serviço', 'Dano Moral In Re Ipsa', 'Fixação do Quantum Indenizatório', 'Pedido de Provimento']
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 5. AUDIÊNCIA SIMULADA BRASILEIRA (COM MODO JUIZ)
  // --------------------------------------------------------------------------
  getMockHearings() {
    return [
      {
        id: 'hear_trabalhista_1',
        title: 'Audiência de Instrução Trabalhista — Horas Extras & Cargo de Confiança',
        jurisdiction: 'Vara do Trabalho de Salvador/BA',
        roles: ['advogado_reclamante', 'advogado_reclamada', 'juiz_trabalhista'],
        parties: {
          judge: 'Dr. Valter Santos (Juiz do Trabalho)',
          reclamante: 'Carlos Souza (Gerente Operacional)',
          reclamada: 'Supermercado Central Ltda.',
          testemunha1: 'Marcos Lima (Encarregado de Estoque - confirma ausência de poder de mando)'
        },
        caseFacts: 'O reclamante recebia gratificação de função mas não tinha subordinados nem poder para admitir/demitir (Art. 62, II da CLT). Requer horas extras além da 8ª diária.',
        witnessFacts: 'A testemunha Marcos afirma com firmeza: "O Carlos batia ponto no cartão biométrico e não podia liberar funcionários mais cedo sem autorização do diretor".'
      }
    ];
  }
}

window.OralExamEngine = OralExamEngine;
