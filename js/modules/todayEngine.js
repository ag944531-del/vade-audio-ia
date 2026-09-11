/**
 * VadeAudio AI - Motor da Tela "Hoje" & Central de Notificações (Etapa 12)
 * Assistente Diário Inteligente, Briefing Matinal em Áudio ElevenLabs (Marcos),
 * Gestão de Prioridades e Reorganização Flexível de Rotina.
 */

class TodayEngine {
  constructor(audioEngine, playerUI, dailyPlannerService, progressionService) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.dailyPlannerService = dailyPlannerService;
    this.progressionService = progressionService;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Botão Ouvir Meu Plano com ElevenLabs (Marcos)
    const btnListenPlan = document.getElementById('btn-listen-today-plan');
    if (btnListenPlan) {
      btnListenPlan.addEventListener('click', () => {
        const text = this.dailyPlannerService.generateBriefingAudioText();
        this.audioEngine.speakText(text);
        this.playerUI.showToast('🎧 Reproduzindo briefing do dia com a voz Marcos (ElevenLabs)...');
      });
    }

    // 2. Botão "O que estudar agora?"
    const btnWhatNow = document.getElementById('btn-what-to-study-now');
    if (btnWhatNow) {
      btnWhatNow.addEventListener('click', () => {
        const topTask = this.dailyPlannerService.getWhatToStudyNow();
        if (topTask) {
          this.playerUI.showToast(`🎯 Sugestão imediata: ${topTask.title} (${topTask.estimatedMinutes} min). Motivo: ${topTask.reason}`);
        } else {
          this.playerUI.showToast('🎉 Parabéns! Todas as tarefas prioritárias de hoje foram concluídas.');
        }
      });
    }

    // 3. Botão "Tenho 30 minutos"
    const btn30Min = document.getElementById('btn-mode-30min');
    if (btn30Min) {
      btn30Min.addEventListener('click', () => {
        const plan = this.dailyPlannerService.getThirtyMinutePlan(30);
        const titles = plan.map(p => `• ${p.title} (${p.estimatedMinutes}m)`).join('\n');
        alert(`⏱ Plano Rápido para 30 minutos:\n\n${titles}`);
      });
    }

    // 4. Botão "Tenho prova amanhã" (Emergência)
    const btnEmerg = document.getElementById('btn-mode-emergency');
    if (btnEmerg) {
      btnEmerg.addEventListener('click', () => {
        const emerg = this.dailyPlannerService.getEmergencyExamPlan('Direito Penal');
        const titles = emerg.map(e => `🚨 ${e.title} (${e.estimatedMinutes}m)`).join('\n');
        alert(`🔥 Modo Emergência: Prova Amanhã\n\n${titles}\n\nFoco estrito em questões erradas, artigos-chave e flashcards.`);
      });
    }

    // 5. Central de Notificações (Abrir/Fechar/Marcar Lidas)
    const btnOpenNotif = document.getElementById('btn-open-notifications');
    const notifModal = document.getElementById('notifications-modal');
    const btnCloseNotif = document.getElementById('btn-close-notifications-modal');
    const btnMarkAll = document.getElementById('btn-mark-all-read');

    if (btnOpenNotif && notifModal) {
      btnOpenNotif.addEventListener('click', () => {
        this.renderNotificationsDrawer();
        notifModal.classList.remove('hidden');
      });
    }

    if (btnCloseNotif && notifModal) {
      btnCloseNotif.addEventListener('click', () => {
        notifModal.classList.add('hidden');
      });
    }

    if (btnMarkAll) {
      btnMarkAll.addEventListener('click', () => {
        StorageModule.markAllNotificationsRead();
        this.renderNotificationsDrawer();
        this.updateNotificationBadge();
        this.playerUI.showToast('✅ Todas as notificações foram marcadas como lidas.');
      });
    }
  }

  renderTodayView() {
    const tasks = StorageModule.getDailyPlanTasks();
    const prefs = StorageModule.getDailyPlannerPreferences();

    // 1. Saudação Contextual
    const greetingEl = document.getElementById('today-greeting');
    const dateEl = document.getElementById('today-current-date');
    const timePlannedEl = document.getElementById('today-time-planned');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    if (greetingEl) greetingEl.innerText = `${greeting}, Acadêmico(a)!`;

    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    if (dateEl) dateEl.innerText = now.toLocaleDateString('pt-BR', options);

    const pending = tasks.filter(t => t.status === 'pending');
    const totalMin = pending.reduce((acc, t) => acc + t.estimatedMinutes, 0);
    if (timePlannedEl) timePlannedEl.innerText = `${totalMin} min planejados (de ${prefs.availableMinutesDaily} min disponíveis)`;

    // 2. Renderiza Lista de Tarefas de Hoje
    const container = document.getElementById('today-tasks-container');
    if (container) {
      container.innerHTML = tasks.map(t => {
        const isDone = t.status === 'completed';
        const priorityColor = t.priority === 'Alta' ? '#ef4444' : t.priority === 'Média' ? '#f59e0b' : '#38bdf8';

        return `
          <div style="background:rgba(255,255,255,0.02); border:1px solid ${isDone ? '#10b981' : 'var(--border-light)'}; border-radius:12px; padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:flex-start; gap:12px; flex:1; min-width:240px;">
              <button class="btn-toggle-task" data-taskid="${t.id}" style="background:none; border:none; color:${isDone ? '#10b981' : 'var(--text-muted)'}; font-size:1.2rem; cursor:pointer; padding:0; margin-top:2px;">
                <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle'}"></i>
              </button>
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <span class="badge-official" style="color:${priorityColor}; border-color:${priorityColor}; font-size:0.7rem; font-weight:700;">
                    ${t.priority.toUpperCase()}
                  </span>
                  <strong style="font-size:0.92rem; color:${isDone ? '#10b981' : 'var(--text-main)'}; text-decoration:${isDone ? 'line-through' : 'none'};">
                    ${t.title}
                  </strong>
                </div>
                <span style="font-size:0.78rem; color:var(--text-muted); display:block; margin-bottom:4px;">
                  <i class="fa-solid fa-clock"></i> ${t.estimatedMinutes} min • <strong>${t.subjectName}</strong>
                </span>
                <span style="font-size:0.75rem; color:var(--accent-amber); font-style:italic;">
                  💡 Por que estudar: ${t.reason}
                </span>
              </div>
            </div>

            <div style="display:flex; gap:6px;">
              ${!isDone ? `
                <button class="btn-primary btn-start-task" data-type="${t.type}" style="font-size:0.78rem; padding:6px 12px;">
                  <i class="fa-solid fa-play"></i> Começar
                </button>
                <button class="btn-secondary btn-postpone-task" data-taskid="${t.id}" style="font-size:0.78rem; padding:6px 10px; color:var(--text-muted);" title="Adiar para amanhã">
                  <i class="fa-solid fa-clock-rotate-left"></i> Adiar
                </button>
              ` : `
                <span style="color:#10b981; font-size:0.8rem; font-weight:700;"><i class="fa-solid fa-check-double"></i> Concluído (+${t.xpReward} XP)</span>
              `}
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-toggle-task').forEach(b => {
        b.addEventListener('click', () => {
          const taskId = b.dataset.taskid;
          const current = tasks.find(t => t.id === taskId);
          const newStatus = current.status === 'completed' ? 'pending' : 'completed';
          StorageModule.updateDailyTaskStatus(taskId, newStatus);
          if (newStatus === 'completed') {
            this.progressionService.recordStudyEvent('study_session_completed', {
              minutes: current.estimatedMinutes,
              idempotencyKey: `task-done-${taskId}-${Date.now()}`
            });
            this.playerUI.showToast(`🎉 Tarefa concluída! +${current.xpReward} XP creditados.`);
          }
          this.renderTodayView();
        });
      });

      container.querySelectorAll('.btn-postpone-task').forEach(b => {
        b.addEventListener('click', () => {
          const taskId = b.dataset.taskid;
          StorageModule.updateDailyTaskStatus(taskId, 'postponed');
          this.playerUI.showToast('🗓 Tarefa adiada para amanhã sem impacto na sua sequência.');
          this.renderTodayView();
        });
      });

      container.querySelectorAll('.btn-start-task').forEach(b => {
        b.addEventListener('click', () => {
          const type = b.dataset.type;
          if (type === 'questions') window.VadeAudioApp?.switchView?.('oab');
          else if (type === 'flashcards') window.VadeAudioApp?.switchView?.('flashcards');
          else window.VadeAudioApp?.switchView?.('vademecum');
        });
      });
    }

    this.updateNotificationBadge();
  }

  renderNotificationsDrawer() {
    const list = StorageModule.getNotificationsInbox();
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:20px;">Nenhuma notificação no momento.</p>`;
      return;
    }

    container.innerHTML = list.map(n => `
      <div style="background:rgba(255,255,255,${n.isRead ? '0.01' : '0.04'}); border-left:3px solid ${n.isRead ? 'var(--border-light)' : 'var(--accent-amber)'}; border-radius:8px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:0.88rem; color:${n.isRead ? 'var(--text-muted)' : 'var(--text-main)'};">${n.title}</strong>
          <span style="font-size:0.72rem; color:var(--text-muted);">${new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p style="font-size:0.82rem; color:var(--text-main); margin-bottom:6px; line-height:1.4;">${n.message}</p>
        <button class="btn-secondary btn-notif-action" data-notifid="${n.id}" data-link="${n.actionLink}" style="font-size:0.75rem; padding:4px 8px; color:var(--accent-amber);">
          <i class="fa-solid fa-arrow-right"></i> Acessar
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-notif-action').forEach(b => {
      b.addEventListener('click', () => {
        const notifId = b.dataset.notifid;
        const link = b.dataset.link;
        StorageModule.markNotificationRead(notifId);
        document.getElementById('notifications-modal')?.classList.add('hidden');
        if (link && window.VadeAudioApp?.switchView) {
          window.VadeAudioApp.switchView(link);
        }
      });
    });
  }

  updateNotificationBadge() {
    const list = StorageModule.getNotificationsInbox();
    const unread = list.filter(n => !n.isRead).length;
    const badge = document.getElementById('notifications-unread-count');
    if (badge) {
      badge.innerText = unread;
      badge.style.display = unread > 0 ? 'inline-block' : 'none';
    }
  }
}
