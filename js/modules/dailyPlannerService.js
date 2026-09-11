/**
 * VadeAudio AI - Serviço Central do Assistente Diário (Etapa 12)
 * Motor de Priorização Analítica, Geração Realista do Plano do Dia,
 * Modos Rápidos ('O que estudar agora?', 'Tenho 30 min', 'Prova Amanhã') e Áudio ElevenLabs.
 */

class DailyPlannerService {
  constructor(audioEngine, progressionService) {
    this.audioEngine = audioEngine;
    this.progressionService = progressionService;
  }

  // --------------------------------------------------------------------------
  // Algoritmo de Priorização Analítica de Tarefas
  // --------------------------------------------------------------------------
  calculateTaskPriorityScore(taskParams = {}) {
    // Parâmetros:
    // daysUntilExam (1..30)
    // domainPercent (0..100)
    // isSrsOverdue (boolean)
    // subjectWeight (1..5)
    const days = taskParams.daysUntilExam !== undefined ? Math.max(1, taskParams.daysUntilExam) : 30;
    const proximityScore = Math.max(0, 100 - (days * 3.3)); // 1 dia = ~97, 30 dias = 0
    const domainDeficit = 100 - (taskParams.domainPercent || 70); // menor domínio = maior prioridade
    const srsScore = taskParams.isSrsOverdue ? 90 : 20;
    const weightScore = (taskParams.subjectWeight || 3) * 20;

    // Fórmula: (Proximidade * 0.35) + (Déficit * 0.25) + (SRS * 0.20) + (Peso * 0.20)
    const finalScore = (proximityScore * 0.35) + (domainDeficit * 0.25) + (srsScore * 0.20) + (weightScore * 0.20);
    return Math.round(finalScore);
  }

  // --------------------------------------------------------------------------
  // Modos de Estudo Rápido & Emergência
  // --------------------------------------------------------------------------
  getWhatToStudyNow() {
    const tasks = StorageModule.getDailyPlanTasks();
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) return null;

    // Retorna a tarefa pendente de maior prioridade
    const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
    pending.sort((a, b) => (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1));
    return pending[0];
  }

  getThirtyMinutePlan(targetMinutes = 30) {
    const tasks = StorageModule.getDailyPlanTasks();
    const pending = tasks.filter(t => t.status === 'pending');
    let accumulated = 0;
    const selected = [];

    for (const t of pending) {
      if (accumulated + t.estimatedMinutes <= targetMinutes + 5) {
        selected.push(t);
        accumulated += t.estimatedMinutes;
      }
    }
    return selected.length > 0 ? selected : [pending[0]];
  }

  getEmergencyExamPlan(subjectName = 'Direito Penal') {
    return [
      {
        id: 'emerg-1',
        title: `Revisar Caderno de Questões Erradas de ${subjectName}`,
        estimatedMinutes: 20,
        type: 'questions',
        reason: 'Recuperação imediata dos pontos de maior incidência e vulnerabilidade.'
      },
      {
        id: 'emerg-2',
        title: `Leitura Rápida dos Artigos Fundamentais no Vade Mecum`,
        estimatedMinutes: 15,
        type: 'vademecum',
        reason: 'Fixação literal dos tipos penais e regras processuais essenciais.'
      },
      {
        id: 'emerg-3',
        title: `Flashcards de Retenção Rápida`,
        estimatedMinutes: 10,
        type: 'flashcards',
        reason: 'Consolidação de conceitos e prazos chave.'
      }
    ];
  }

  // --------------------------------------------------------------------------
  // Gerador de Texto do Briefing Matinal para Áudio ElevenLabs (Marcos)
  // --------------------------------------------------------------------------
  generateBriefingAudioText() {
    const tasks = StorageModule.getDailyPlanTasks();
    const pending = tasks.filter(t => t.status === 'pending');
    const high = pending.filter(t => t.priority === 'Alta');

    if (high.length > 0) {
      return `Bom dia! Hoje seu plano de estudos conta com ${pending.length} atividades prioritárias. Seu foco principal é ${high[0].title}, da disciplina ${high[0].subjectName}, com ${high[0].estimatedMinutes} minutos planejados. Motivo: ${high[0].reason} Bons estudos!`;
    }
    return `Olá! Seu plano de hoje está bem equilibrado com ${pending.length} atividades de fixação e revisão. Comece pela primeira tarefa do seu cronograma para manter sua sequência ativa.`;
  }
}
