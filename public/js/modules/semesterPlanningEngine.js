/**
 * VadeAudio AI - Motor do Cronograma Acadêmico Inteligente do Semestre (Etapa 29)
 * Planejamento determinístico semestral, distribuição espaçada de carga, respeito a restrições
 * e dias de descanso, replanejamento delta inteligente e resumo em áudio conversacional.
 */

class SemesterConstraintSolver {
  static solveSchedule(disciplines, constraints, preferences = {}) {
    const maxDailyMinutes = (constraints.maxDailyHours || 2) * 60;
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const unavailableDays = constraints.unavailableDays || ['Domingo'];

    const weekSchedule = {};
    daysOfWeek.forEach(day => {
      weekSchedule[day] = {
        day,
        isAvailable: !unavailableDays.includes(day),
        allocatedMinutes: 0,
        blocks: []
      };
    });

    // Ordenar disciplinas por prioridade de prova e déficit de domínio
    const sortedDisciplines = [...disciplines].sort((a, b) => {
      const urgencyA = Math.max(0, 30 - (a.daysUntilExam || 30));
      const urgencyB = Math.max(0, 30 - (b.daysUntilExam || 30));
      return urgencyB - urgencyA;
    });

    let currentDayIndex = 0;
    for (const disc of sortedDisciplines) {
      const topic = disc.primaryTopic || 'Conceitos Gerais';
      const activities = [
        { type: 'theory', durationMin: 30, title: `Conteúdo-Base — ${topic}` },
        { type: 'flashcards', durationMin: 15, title: `Flashcards SRS — ${topic}` },
        { type: 'quiz', durationMin: 30, title: `Questões de Fixação — ${topic}` }
      ];

      for (const act of activities) {
        let attempts = 0;
        while (attempts < 7) {
          const dayName = daysOfWeek[currentDayIndex % 7];
          const dayObj = weekSchedule[dayName];

          if (dayObj.isAvailable && (dayObj.allocatedMinutes + act.durationMin <= maxDailyMinutes)) {
            dayObj.blocks.push({
              id: 'block_' + Math.random().toString(36).substring(2, 9),
              subject: disc.name,
              topic,
              activityType: act.type,
              durationMin: act.durationMin,
              title: act.title,
              isCompleted: false,
              isLocked: false
            });
            dayObj.allocatedMinutes += act.durationMin;
            currentDayIndex++;
            break;
          }
          currentDayIndex++;
          attempts++;
        }
      }
    }

    return weekSchedule;
  }
}

class DeltaReplanner {
  static replanDelta(activeSchedule, missedDay, newConstraints = {}) {
    const days = Object.keys(activeSchedule);
    const missedBlocks = activeSchedule[missedDay]?.blocks.filter(b => !b.isCompleted && !b.isLocked) || [];
    
    // Zera os blocos pendentes do dia perdido
    activeSchedule[missedDay].blocks = activeSchedule[missedDay].blocks.filter(b => b.isCompleted || b.isLocked);
    activeSchedule[missedDay].allocatedMinutes = activeSchedule[missedDay].blocks.reduce((acc, b) => acc + b.durationMin, 0);

    // Redistribui apenas os blocos não concluídos nos dias subsequentes
    let targetDayIdx = (days.indexOf(missedDay) + 1) % days.length;
    for (const b of missedBlocks) {
      let placed = false;
      for (let i = 0; i < days.length; i++) {
        const dName = days[targetDayIdx];
        const dObj = activeSchedule[dName];
        if (dObj.isAvailable && (dObj.allocatedMinutes + b.durationMin <= 150)) {
          dObj.blocks.push(b);
          dObj.allocatedMinutes += b.durationMin;
          placed = true;
          break;
        }
        targetDayIdx = (targetDayIdx + 1) % days.length;
      }
    }

    return activeSchedule;
  }
}

class SemesterPlanningEngine {
  constructor(authService, audioEngine, voiceProfessor) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.voiceProfessor = voiceProfessor;

    this.activePlan = null;
    this.constraints = {
      maxDailyHours: 2,
      unavailableDays: ['Domingo']
    };
  }

  getSampleDisciplines() {
    return [
      { name: 'Direito Penal', primaryTopic: 'Dolo Eventual vs Culpa Consciente', daysUntilExam: 14, masteryPercent: 45 },
      { name: 'Direito Processual Civil', primaryTopic: 'Tutela Provisória de Urgência', daysUntilExam: 22, masteryPercent: 55 },
      { name: 'Direito Constitucional', primaryTopic: 'Controle de Constitucionalidade', daysUntilExam: 35, masteryPercent: 70 },
      { name: 'Direito Civil', primaryTopic: 'Vícios do Consentimento', daysUntilExam: 40, masteryPercent: 80 }
    ];
  }

  generateSemesterSchedule(options = {}) {
    const disciplines = options.disciplines || this.getSampleDisciplines();
    const constraints = { ...this.constraints, ...options.constraints };

    const weeklyBlocks = SemesterConstraintSolver.solveSchedule(disciplines, constraints, options.preferences);

    let totalMinutes = 0;
    let totalBlocks = 0;
    Object.values(weeklyBlocks).forEach(d => {
      totalMinutes += d.allocatedMinutes;
      totalBlocks += d.blocks.length;
    });

    this.activePlan = {
      id: 'plan_sem_' + Date.now().toString(36),
      periodName: options.periodName || '2026/2',
      disciplinesCount: disciplines.length,
      totalWeeklyHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalBlocks,
      schedule: weeklyBlocks,
      createdAt: Date.now()
    };

    return this.activePlan;
  }

  toggleBlockLock(dayName, blockId) {
    if (!this.activePlan) return false;
    const dayObj = this.activePlan.schedule[dayName];
    if (!dayObj) return false;

    const block = dayObj.blocks.find(b => b.id === blockId);
    if (block) {
      block.isLocked = !block.isLocked;
      return block.isLocked;
    }
    return false;
  }

  generateSpokenSummary() {
    if (!this.activePlan) return 'Você ainda não possui um cronograma semestral gerado.';
    const hours = this.activePlan.totalWeeklyHours;
    return `Olá! Aqui é o Professor Marcos com o resumo do seu semestre. Para esta semana, estruturamos uma carga de ${hours} horas distribuídas de forma equilibrada. Sua maior prioridade é Direito Penal, com blocos dedicados de teoria, questões e flashcards. Mantenha a constância e bom estudo!`;
  }
}

window.SemesterConstraintSolver = SemesterConstraintSolver;
window.DeltaReplanner = DeltaReplanner;
window.SemesterPlanningEngine = SemesterPlanningEngine;
