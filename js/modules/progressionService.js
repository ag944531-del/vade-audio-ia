/**
 * VadeAudio AI - Serviço Central de Progressão Acadêmica (Etapa 11)
 * Motor de XP Verificável, Proteção Anti-Farm, Níveis por Disciplina,
 * Domínio Estimado, Sequência (Streak), Metas e Conquistas.
 */

class ProgressionService {
  constructor() {
    this.antiFarmCooldowns = new Map(); // Cooldowns por entidade/ação
    this.processedIdempotencyKeys = new Set(); // Chaves já processadas

    // Tabela de Regras de XP Base
    this.xpRules = {
      study_session_minute: 2,     // 2 XP por minuto real de estudo focado
      question_answered_correct: 5,// 5 XP por questão acertada
      question_answered_wrong: 2,  // 2 XP por aprendizado no erro
      flashcard_reviewed: 3,       // 3 XP por flashcard revisado
      mock_exam_completed: 120,    // 120 XP por simulado OAB/Concurso completo
      article_read: 10,            // 10 XP por artigo lido/ouvido
      practice_case_completed: 80  // 80 XP por caso prático concluído no laboratório
    };
  }

  // --------------------------------------------------------------------------
  // Processamento Central de Eventos de Estudo
  // --------------------------------------------------------------------------
  recordStudyEvent(eventType, payload = {}) {
    const idempotencyKey = payload.idempotencyKey || `${eventType}-${payload.entityId || Date.now()}`;

    // 1. Verificação Anti-Farm: Idempotência
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      return { success: false, reason: 'Evento duplicado ou já processado anteriormente.' };
    }

    // 2. Verificação Anti-Farm: Cooldown por entidade (ex: abrir o mesmo artigo repetidamente em < 10s)
    const cooldownKey = `${eventType}-${payload.entityId || 'general'}`;
    const lastTimestamp = this.antiFarmCooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    if (now - lastTimestamp < 5000) { // 5 segundos de cooldown mínimo
      return { success: false, reason: 'Ação realizada rápido demais (anti-farm).' };
    }
    this.antiFarmCooldowns.set(cooldownKey, now);
    this.processedIdempotencyKeys.add(idempotencyKey);

    // 3. Cálculo do Ganho de XP
    let xpGained = 0;
    let eventReason = 'Atividade de estudo';

    if (eventType === 'study_session_completed') {
      const minutes = Math.max(1, Math.min(180, Math.round(payload.minutes || 0)));
      if (minutes < 2) return { success: false, reason: 'Sessão muito curta para conceder XP.' };
      xpGained = minutes * this.xpRules.study_session_minute;
      eventReason = `Sessão de Foco (${minutes} min)`;
    } else if (eventType === 'question_answered') {
      xpGained = payload.isCorrect ? this.xpRules.question_answered_correct : this.xpRules.question_answered_wrong;
      eventReason = `Questão respondida (${payload.subjectId || 'Geral'})`;
    } else if (eventType === 'flashcard_reviewed') {
      xpGained = this.xpRules.flashcard_reviewed;
      eventReason = `Flashcard revisado (${payload.subjectId || 'Geral'})`;
    } else if (eventType === 'mock_exam_completed') {
      xpGained = this.xpRules.mock_exam_completed;
      eventReason = `Simulado concluído (${payload.score || 0} pts)`;
    } else if (eventType === 'article_completed') {
      xpGained = this.xpRules.article_read;
      eventReason = `Artigo estudado (${payload.articleTitle || 'Vade Mecum'})`;
    } else if (eventType === 'practice_case_completed') {
      xpGained = this.xpRules.practice_case_completed;
      eventReason = `Caso Prático concluído (${payload.caseTitle || 'Laboratório'})`;
    }

    if (xpGained <= 0) return { success: false, reason: 'Nenhum XP atribuído para esta ação.' };

    // 4. Atualiza Perfil, Níveis e Domínio no Storage
    const profile = StorageModule.getProgressionProfile();
    profile.xp += xpGained;

    // Atualiza contadores globais
    if (eventType === 'study_session_completed') profile.totalMinutes += payload.minutes || 0;
    if (eventType === 'question_answered') profile.questionsAnswered++;
    if (eventType === 'flashcard_reviewed') profile.flashcardsReviewed++;
    if (eventType === 'article_completed') profile.articlesRead++;
    if (eventType === 'mock_exam_completed') profile.mocksCompleted++;
    if (eventType === 'practice_case_completed') profile.casesCompleted++;

    // Recalcula Nível Geral
    profile.level = this.calculateLevel(profile.xp);
    profile.nextLevelXp = this.calculateNextLevelXp(profile.level);

    // Atualiza Nível por Matéria e Domínio Estimado
    if (payload.subjectId && profile.subjectLevels[payload.subjectId]) {
      const sub = profile.subjectLevels[payload.subjectId];
      sub.xp += xpGained;
      sub.level = Math.max(1, Math.floor(Math.sqrt(sub.xp / 15)));
      
      // Fórmula de Domínio Estimado: (Taxa de Acertos * 0.6) + (Retenção SRS * 0.25) + (Fator Recência * 0.15)
      if (payload.accuracy !== undefined) {
        sub.domainPercent = Math.min(99, Math.round((sub.domainPercent * 0.7) + (payload.accuracy * 0.3)));
      }
    }

    // 5. Atualiza Sequência de Estudos (Streak)
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastActiveDate === yesterday) {
        profile.streakDays++;
      } else if (profile.lastActiveDate < yesterday) {
        profile.streakDays = 1; // Reinicia streak se houver hiato > 1 dia
      }
      profile.lastActiveDate = today;
    }

    StorageModule.saveProgressionProfile(profile);
    StorageModule.recordXpEvent({ reason: eventReason, xp: xpGained, eventType, subjectId: payload.subjectId });

    // 6. Atualiza Missões Diárias
    this.updateDailyMissions(eventType, payload);

    // 7. Verifica Desbloqueio de Conquistas
    this.checkAchievements(profile);

    return {
      success: true,
      xpGained,
      currentLevel: profile.level,
      totalXp: profile.xp,
      streakDays: profile.streakDays
    };
  }

  // --------------------------------------------------------------------------
  // Fórmulas Matemáticas de Progressão
  // --------------------------------------------------------------------------
  calculateLevel(totalXp) {
    // Escala suave: Level = sqrt(XP / 20) + 1
    return Math.max(1, Math.floor(Math.sqrt(totalXp / 20)) + 1);
  }

  calculateNextLevelXp(level) {
    // XP necessário para o próximo nível = 20 * Level^2
    return 20 * Math.pow(level, 2);
  }

  // --------------------------------------------------------------------------
  // Atualizador de Missões e Conquistas
  // --------------------------------------------------------------------------
  updateDailyMissions(eventType, payload) {
    const missions = StorageModule.getDailyMissions();
    let updated = false;

    missions.forEach(m => {
      if (eventType === 'study_session_completed' && m.id === 'mis-1' && !m.completed) {
        m.progress += payload.minutes || 0;
        if (m.progress >= m.target) { m.completed = true; m.progress = m.target; }
        updated = true;
      }
      if (eventType === 'question_answered' && m.id === 'mis-2' && !m.completed) {
        m.progress++;
        if (m.progress >= m.target) { m.completed = true; m.progress = m.target; }
        updated = true;
      }
      if (eventType === 'flashcard_reviewed' && m.id === 'mis-3' && !m.completed) {
        m.progress++;
        if (m.progress >= m.target) { m.completed = true; m.progress = m.target; }
        updated = true;
      }
    });

    if (updated) StorageModule.saveDailyMissions(missions);
  }

  checkAchievements(profile) {
    if (profile.totalMinutes >= 600) {
      StorageModule.unlockAchievement({ id: 'ach-10h', title: 'Dedicação Acadêmica', desc: 'Acumulou 10 horas de estudo real.', icon: 'fa-solid fa-clock' });
    }
    if (profile.questionsAnswered >= 100) {
      StorageModule.unlockAchievement({ id: 'ach-100q', title: 'Centena de Questões', desc: 'Respondeu a 100 questões com aproveitamento.', icon: 'fa-solid fa-circle-check' });
    }
    if (profile.streakDays >= 7) {
      StorageModule.unlockAchievement({ id: 'ach-7days', title: 'Consistência Semanal', desc: 'Manteve 7 dias consecutivos de estudo ativo.', icon: 'fa-solid fa-fire' });
    }
  }
}
