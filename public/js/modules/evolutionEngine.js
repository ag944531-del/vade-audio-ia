/**
 * VadeAudio AI - Motor da Evolução Acadêmica (Etapa 11)
 * Visual Sóbrio, Níveis por Disciplina, Domínio Estimado,
 * Missões Diárias Inteligentes, Conquistas e Calendário de Consistência.
 */

class EvolutionEngine {
  constructor(audioEngine, playerUI, progressionService) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.progressionService = progressionService;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // Seletor de Meta Diária
    const goalSelect = document.getElementById('evolution-daily-goal-select');
    if (goalSelect) {
      goalSelect.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 45;
        StorageModule.saveProgressionSettings({ dailyMinutesGoal: val });
        this.playerUI.showToast(`🎯 Meta diária ajustada para ${val} minutos!`);
        this.renderEvolutionView();
      });
    }

    // Botão de Missão de Recuperação de Matéria
    const btnRecoverSubject = document.getElementById('btn-recover-weak-subject');
    if (btnRecoverSubject) {
      btnRecoverSubject.addEventListener('click', () => {
        this.playerUI.showToast('🎯 Missão de recuperação de Processo Civil ativada!');
      });
    }
  }

  renderEvolutionView() {
    const profile = StorageModule.getProgressionProfile();
    const missions = StorageModule.getDailyMissions();
    const achievements = StorageModule.getUnlockedAchievements();
    const settings = StorageModule.getProgressionSettings();

    // 1. Header do Perfil Acadêmico
    const levelEl = document.getElementById('evolution-user-level');
    const xpCurrentEl = document.getElementById('evolution-xp-current');
    const xpNextEl = document.getElementById('evolution-xp-next');
    const xpBarEl = document.getElementById('evolution-xp-bar');
    const streakEl = document.getElementById('evolution-streak-days');
    const totalHoursEl = document.getElementById('evolution-total-hours');
    const questionsCountEl = document.getElementById('evolution-questions-count');
    const flashcardsCountEl = document.getElementById('evolution-flashcards-count');

    if (levelEl) levelEl.innerText = `Nível ${profile.level}`;
    if (xpCurrentEl) xpCurrentEl.innerText = `${profile.xp} XP`;
    if (xpNextEl) xpNextEl.innerText = `/ ${profile.nextLevelXp} XP`;
    if (streakEl) streakEl.innerText = `${profile.streakDays} dias`;
    if (totalHoursEl) totalHoursEl.innerText = `${(profile.totalMinutes / 60).toFixed(1)}h`;
    if (questionsCountEl) questionsCountEl.innerText = profile.questionsAnswered;
    if (flashcardsCountEl) flashcardsCountEl.innerText = profile.flashcardsReviewed;

    if (xpBarEl) {
      const prevLevelXp = 20 * Math.pow(Math.max(1, profile.level - 1), 2);
      const span = Math.max(1, profile.nextLevelXp - prevLevelXp);
      const prog = Math.max(0, Math.min(100, Math.round(((profile.xp - prevLevelXp) / span) * 100)));
      xpBarEl.style.width = `${prog}%`;
    }

    // 2. Missões de Hoje
    const missionsContainer = document.getElementById('evolution-missions-container');
    if (missionsContainer) {
      missionsContainer.innerHTML = missions.map(m => `
        <div style="background:rgba(255,255,255,0.02); border:1px solid ${m.completed ? '#10b981' : 'var(--border-light)'}; border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:0.9rem; color:${m.completed ? '#10b981' : 'var(--text-muted)'};">
                <i class="fa-solid ${m.completed ? 'fa-circle-check' : 'fa-circle'}"></i>
              </span>
              <strong style="font-size:0.88rem; color:${m.completed ? '#10b981' : 'var(--text-main)'}; text-decoration:${m.completed ? 'line-through' : 'none'};">
                ${m.title}
              </strong>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted); margin-left:24px;">Progresso: ${m.progress} / ${m.target}</span>
          </div>
          <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.72rem;">
            +${m.xp} XP
          </span>
        </div>
      `).join('');
    }

    // 3. Grid de Nível por Matéria & Domínio Estimado
    const subjectsContainer = document.getElementById('evolution-subjects-container');
    if (subjectsContainer) {
      const subjectMap = {
        penal: { name: 'Direito Penal', icon: 'fa-solid fa-gavel', color: '#ef4444' },
        civil: { name: 'Direito Civil', icon: 'fa-solid fa-scale-balanced', color: '#38bdf8' },
        constitucional: { name: 'Direito Constitucional', icon: 'fa-solid fa-landmark', color: '#f59e0b' },
        processo_civil: { name: 'Processo Civil', icon: 'fa-solid fa-file-signature', color: '#818cf8' },
        trabalho: { name: 'Direito do Trabalho', icon: 'fa-solid fa-briefcase', color: '#10b981' },
        tributario: { name: 'Direito Tributário', icon: 'fa-solid fa-receipt', color: '#34d399' }
      };

      subjectsContainer.innerHTML = Object.entries(profile.subjectLevels).map(([key, data]) => {
        const meta = subjectMap[key] || { name: key, icon: 'fa-solid fa-book', color: 'var(--accent-amber)' };
        return `
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <i class="${meta.icon}" style="color:${meta.color}; font-size:1.1rem;"></i>
                <strong style="font-size:0.9rem; color:var(--text-main);">${meta.name}</strong>
              </div>
              <span class="badge-official" style="color:${meta.color}; border-color:${meta.color}; font-size:0.75rem;">
                Nível ${data.level}
              </span>
            </div>

            <!-- Domínio Estimado (Desempenho) -->
            <div style="margin-top:8px;">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">
                <span>Domínio Estimado:</span>
                <strong style="color:${data.domainPercent >= 70 ? '#10b981' : data.domainPercent >= 60 ? '#f59e0b' : '#ef4444'};">${data.domainPercent}%</strong>
              </div>
              <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
                <div style="width:${data.domainPercent}%; height:100%; background:${data.domainPercent >= 70 ? '#10b981' : data.domainPercent >= 60 ? '#f59e0b' : '#ef4444'};"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Conquistas & Badges Acadêmicos
    const achievementsContainer = document.getElementById('evolution-achievements-container');
    if (achievementsContainer) {
      achievementsContainer.innerHTML = achievements.map(a => `
        <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-amber); border-radius:10px; padding:12px; text-align:center;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(245,158,11,0.1); border:1px solid var(--border-amber); display:flex; align-items:center; justify-content:center; margin:0 auto 8px auto; color:var(--accent-amber); font-size:1.1rem;">
            <i class="${a.icon}"></i>
          </div>
          <strong style="font-size:0.85rem; color:var(--text-main); display:block; margin-bottom:2px;">${a.title}</strong>
          <span style="font-size:0.72rem; color:var(--text-muted); line-height:1.3; display:block;">${a.desc}</span>
        </div>
      `).join('');
    }
  }
}
