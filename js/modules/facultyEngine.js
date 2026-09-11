/**
 * VadeAudio AI - Motor Acadêmico "Minha Faculdade" (Etapa 3)
 * Gestão de Semestres, Disciplinas, Grade Semanal, Provas com Contagem Regressiva,
 * Plano de Estudo Adaptativo, Checklist Diário, Modo Foco/Pomodoro, Professor IA e Notas.
 */

class FacultyEngine {
  constructor(audioEngine, playerUI, vadeEngine) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.activeFacultyTab = 'dashboard'; // 'dashboard' | 'schedule' | 'subjects' | 'assessments' | 'plans' | 'materials' | 'grades'
    
    // Focus Session Timer State
    this.focusTimerInterval = null;
    this.focusSecondsRemaining = 25 * 60;
    this.focusTotalDuration = 25 * 60;
    this.focusSubjectId = null;
    this.focusArticleId = null;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Abas da View Minha Faculdade
    const tabBtns = document.querySelectorAll('.faculty-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFacultyTab = btn.dataset.facTab;
        this.renderFacultyHub(this.activeFacultyTab);
      });
    });

    // 2. Botão Criar Disciplina
    const btnNewSubject = document.getElementById('btn-faculty-new-subject');
    if (btnNewSubject) {
      btnNewSubject.addEventListener('click', () => this.openSubjectModal());
    }

    // 3. Botão Criar Avaliação
    const btnNewAssessment = document.getElementById('btn-faculty-new-assessment');
    if (btnNewAssessment) {
      btnNewAssessment.addEventListener('click', () => this.openAssessmentModal());
    }

    // 4. Modal de Foco / Pomodoro
    const btnCloseFocus = document.getElementById('btn-close-focus-modal');
    const btnPauseFocus = document.getElementById('btn-focus-pause');
    const btnStopFocus = document.getElementById('btn-focus-stop');

    if (btnCloseFocus) {
      btnCloseFocus.addEventListener('click', () => this.closeFocusSession());
    }

    if (btnPauseFocus) {
      btnPauseFocus.addEventListener('click', () => this.toggleFocusTimer());
    }

    if (btnStopFocus) {
      btnStopFocus.addEventListener('click', () => this.finishFocusSession());
    }

    // 5. Modal do Professor IA da Disciplina
    const btnCloseProf = document.getElementById('btn-close-faculty-prof-modal');
    if (btnCloseProf) {
      btnCloseProf.addEventListener('click', () => {
        const m = document.getElementById('faculty-professor-modal');
        if (m) m.classList.add('hidden');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Hub Central de Navegação do Módulo Minha Faculdade
  // --------------------------------------------------------------------------
  renderFacultyHub(tab = 'dashboard') {
    const container = document.getElementById('faculty-content-area');
    if (!container) return;

    if (tab === 'dashboard') {
      this.renderDashboardView(container);
    } else if (tab === 'schedule') {
      this.renderScheduleView(container);
    } else if (tab === 'subjects') {
      this.renderSubjectsView(container);
    } else if (tab === 'assessments') {
      this.renderAssessmentsView(container);
    } else if (tab === 'plans') {
      this.renderStudyPlansView(container);
    } else if (tab === 'materials') {
      this.renderMaterialsView(container);
    } else if (tab === 'grades') {
      this.renderGradesView(container);
    }
  }

  // --------------------------------------------------------------------------
  // 1. Dashboard Acadêmico
  // --------------------------------------------------------------------------
  renderDashboardView(container) {
    const upcoming = StorageModule.getUpcomingAssessments();
    const nextExam = upcoming.length > 0 ? upcoming[0] : null;
    const subjects = StorageModule.getFacultySubjects();
    const plans = StorageModule.getStudyPlans();
    const stats = StorageModule.getStats();
    const subStats = StorageModule.getSubjectStats();

    // Calcula dias restantes para a próxima prova
    let daysLeftText = 'Sem provas agendadas';
    let nextExamSubject = null;
    if (nextExam) {
      nextExamSubject = subjects.find(s => s.id === nextExam.subjectId);
      const diffTime = new Date(nextExam.date) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysLeftText = diffDays === 0 ? '🚨 É HOJE!' : diffDays === 1 ? '⚠️ Faltam 1 dia' : `Faltam ${diffDays} dias`;
    }

    // Detector de Matéria Fraca (cruza taxa de acerto < 60%)
    let weakSubjectAlert = null;
    for (const sub of subjects) {
      // Mapeia para ID do subject_id
      const rawSub = VADE_MECUM_DB.subjects.find(s => sub.name.toLowerCase().includes(s.name.toLowerCase().replace('direito ', '')));
      if (rawSub && subStats[rawSub.id] && subStats[rawSub.id].total >= 3) {
        const rate = (subStats[rawSub.id].correct / subStats[rawSub.id].total) * 100;
        if (rate < 60) {
          weakSubjectAlert = {
            subject: sub.name,
            rate: Math.round(rate),
            message: `Sua taxa de acerto em questões de ${sub.name} está em ${Math.round(rate)}%. Recomendamos revisar antes da próxima prova!`
          };
          break;
        }
      }
    }

    // Coleta tarefas de hoje dos planos
    const todayStr = new Date().toISOString().split('T')[0];
    let todayTasks = [];
    plans.forEach(p => {
      if (p.tasks) {
        p.tasks.filter(t => t.date === todayStr || !t.completed).slice(0, 5).forEach(t => {
          todayTasks.push({ ...t, planId: p.id });
        });
      }
    });

    container.innerHTML = `
      <!-- Banner de Próxima Prova & Modo Foco -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:18px; margin-bottom:24px;">
        
        <!-- Card 1: Próxima Prova & Contagem Regressiva -->
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(18,22,32,0.95)); border:1px solid var(--border-amber); border-radius:16px; padding:22px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber); text-transform:uppercase; letter-spacing:0.5px;">
              <i class="fa-solid fa-hourglass-half"></i> Próxima Avaliação
            </span>
            <span class="badge-official" style="color:var(--accent-amber); background:rgba(245,158,11,0.2); border-color:var(--accent-amber); font-size:0.8rem; font-weight:700;">
              ${daysLeftText}
            </span>
          </div>

          ${nextExam ? `
            <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.25rem; margin-bottom:4px;">
              ${nextExam.name}
            </h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:12px;">
              <i class="fa-solid fa-graduation-cap" style="color:${nextExamSubject?.color || '#f59e0b'};"></i> ${nextExamSubject?.name || 'Disciplina'} • Data: <strong>${new Date(nextExam.date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
            </p>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;">
              ${(nextExam.contentArticles || []).map(artId => {
                const art = VADE_MECUM_DB.articles.find(a => a.id === artId);
                return `<span class="vade-art-chip" data-artid="${artId}" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-light); font-size:0.75rem; padding:3px 8px; border-radius:4px; color:var(--accent-amber); cursor:pointer;"><i class="fa-solid fa-book"></i> ${art ? art.article_display : artId}</span>`;
              }).join('')}
            </div>
            <button id="btn-dash-start-study" class="btn-primary" style="width:100%;">
              <i class="fa-solid fa-play"></i> ▶ Iniciar Sessão de Estudo (Modo Foco)
            </button>
          ` : `
            <p style="color:var(--text-muted); font-size:0.9rem; padding:10px 0;">Nenhuma avaliação cadastrada no momento.</p>
            <button class="btn-secondary" style="width:100%;" onclick="window.FacultyApp.openAssessmentModal()">
              <i class="fa-solid fa-plus"></i> Cadastrar Nova Prova
            </button>
          `}
        </div>

        <!-- Card 2: Resumo de Hoje & Métricas -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:12px;">
              <i class="fa-solid fa-chart-simple"></i> Meu Progresso Hoje
            </span>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Tempo Ouvido</span>
                <strong style="font-size:1.3rem; color:var(--accent-amber); font-family:var(--font-display);">${Math.round(stats.secondsListened / 60)} min</strong>
              </div>
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:12px;">
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Disciplinas Ativas</span>
                <strong style="font-size:1.3rem; color:#10b981; font-family:var(--font-display);">${subjects.length}</strong>
              </div>
            </div>
          </div>

          ${weakSubjectAlert ? `
            <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:10px 14px; margin-top:12px;">
              <strong style="color:#f87171; font-size:0.82rem;"><i class="fa-solid fa-triangle-exclamation"></i> Alerta: ${weakSubjectAlert.subject}</strong>
              <p style="font-size:0.75rem; color:var(--text-main); margin:2px 0 0 0;">${weakSubjectAlert.message}</p>
            </div>
          ` : `
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 14px; margin-top:12px;">
              <strong style="color:#10b981; font-size:0.82rem;"><i class="fa-solid fa-circle-check"></i> Desempenho Equilibrado</strong>
              <p style="font-size:0.75rem; color:var(--text-muted); margin:2px 0 0 0;">Seu ritmo de estudos está em dia!</p>
            </div>
          `}
        </div>
      </div>

      <!-- Seção Checklist de Tarefas de Hoje -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:16px; padding:22px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.1rem; margin:0;">
            <i class="fa-solid fa-list-check text-amber"></i> Checklist de Hoje (${todayTasks.filter(t => t.completed).length}/${todayTasks.length})
          </h3>
          <button id="btn-dash-create-plan" class="btn-secondary" style="font-size:0.78rem;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Novo Plano
          </button>
        </div>

        ${todayTasks.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${todayTasks.map(t => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; flex:1;">
                  <input type="checkbox" class="task-check" data-planid="${t.planId}" data-taskid="${t.id}" ${t.completed ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--accent-amber);">
                  <span style="font-size:0.88rem; color:${t.completed ? 'var(--text-muted)' : 'var(--text-main)'}; text-decoration:${t.completed ? 'line-through' : 'none'};">
                    ${t.label}
                  </span>
                </label>
                ${t.articleId ? `
                  <button class="btn-secondary btn-task-listen" data-artid="${t.articleId}" style="padding:4px 8px; font-size:0.75rem;" title="Ouvir Dispositivo">
                    <i class="fa-solid fa-volume-high"></i> Ouvir
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="color:var(--text-muted); font-size:0.88rem;">Você não possui tarefas pendentes para hoje. Clique em "Gerar Novo Plano" para organizar sua próxima prova!</p>
        `}
      </div>
    `;

    // Eventos do Dashboard
    container.querySelectorAll('.vade-art-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.vadeEngine.openArticleModal(chip.dataset.artid);
      });
    });

    container.querySelectorAll('.btn-task-listen').forEach(btn => {
      btn.addEventListener('click', () => {
        const art = VADE_MECUM_DB.articles.find(a => a.id === btn.dataset.artid);
        if (art) this.audioEngine.speakArticle(art);
      });
    });

    container.querySelectorAll('.task-check').forEach(chk => {
      chk.addEventListener('change', () => {
        StorageModule.togglePlanTask(chk.dataset.planid, chk.dataset.taskid);
        this.renderDashboardView(container);
      });
    });

    const btnStartStudy = document.getElementById('btn-dash-start-study');
    if (btnStartStudy && nextExam) {
      btnStartStudy.addEventListener('click', () => {
        this.openFocusSession(nextExam.subjectId, nextExam.contentArticles ? nextExam.contentArticles[0] : null);
      });
    }

    const btnCreatePlan = document.getElementById('btn-dash-create-plan');
    if (btnCreatePlan) {
      btnCreatePlan.addEventListener('click', () => this.openStudyPlanModal());
    }
  }

  // --------------------------------------------------------------------------
  // 2. Grade Semanal ("Minha Semana")
  // --------------------------------------------------------------------------
  renderScheduleView(container) {
    const subjects = StorageModule.getFacultySubjects();
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    container.innerHTML = `
      <div style="margin-bottom:18px;">
        <h3 style="font-size:1.15rem; color:var(--text-main); margin-bottom:4px;">
          <i class="fa-solid fa-calendar-days text-amber"></i> Grade Semanal de Aulas
        </h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Horários de aulas, salas e professores organizados por dia.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
        ${days.map(day => {
          const daySubjects = subjects.filter(s => (s.scheduleDays || []).includes(day));
          return `
            <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:16px;">
              <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1rem; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px; margin-bottom:12px;">
                ${day}
              </h4>
              ${daySubjects.length > 0 ? `
                <div style="display:flex; flex-direction:column; gap:10px;">
                  ${daySubjects.map(sub => `
                    <div style="background:rgba(255,255,255,0.02); border-left:3px solid ${sub.color}; border-radius:6px; padding:10px;">
                      <strong style="color:var(--text-main); font-size:0.88rem; display:block;">${sub.name}</strong>
                      <span style="color:var(--accent-amber); font-size:0.78rem; display:block; margin-top:2px;"><i class="fa-solid fa-clock"></i> ${sub.scheduleTime}</span>
                      <span style="color:var(--text-muted); font-size:0.75rem; display:block; margin-top:2px;"><i class="fa-solid fa-location-dot"></i> ${sub.room || 'Campus Principal'}</span>
                      <span style="color:var(--text-muted); font-size:0.75rem; display:block;"><i class="fa-solid fa-user-tie"></i> ${sub.professor || 'Prof. Titular'}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p style="color:var(--text-muted); font-size:0.78rem; font-style:italic;">Sem aulas agendadas.</p>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 3. Minhas Disciplinas
  // --------------------------------------------------------------------------
  renderSubjectsView(container) {
    const subjects = StorageModule.getFacultySubjects();
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-book-bookmark text-amber"></i> Disciplinas do Semestre (${subjects.length})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Matérias em curso vinculadas à legislação oficial.</p>
        </div>
        <button id="btn-add-subject-top" class="btn-primary">
          <i class="fa-solid fa-plus"></i> Nova Matéria
        </button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
        ${subjects.map(sub => `
          <div class="article-card" style="border-left:4px solid ${sub.color};">
            <div class="art-header">
              <div class="art-number">
                <span class="badge-official" style="background:${sub.color}22; color:${sub.color}; border-color:${sub.color};">${sub.code || 'MATÉRIA'}</span>
                <strong>${sub.name}</strong>
              </div>
            </div>
            <div class="art-body">
              <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:4px;"><i class="fa-solid fa-user-tie"></i> <strong>Professor:</strong> ${sub.professor || 'Não informado'}</p>
              <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:4px;"><i class="fa-solid fa-calendar"></i> <strong>Aulas:</strong> ${(sub.scheduleDays || []).join(', ')} (${sub.scheduleTime})</p>
              <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;"><i class="fa-solid fa-location-dot"></i> <strong>Local:</strong> ${sub.room || 'Campus'}</p>
              <p style="font-size:0.85rem; color:var(--text-main); line-height:1.5;">${sub.notes || ''}</p>

              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:14px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <button class="btn-secondary btn-sub-prof-ai" data-subid="${sub.id}" style="font-size:0.75rem; color:#c084fc;"><i class="fa-solid fa-robot"></i> Professor IA</button>
                <button class="btn-secondary btn-sub-focus" data-subid="${sub.id}" style="font-size:0.75rem; color:var(--accent-amber);"><i class="fa-solid fa-play"></i> Modo Foco</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('btn-add-subject-top').addEventListener('click', () => this.openSubjectModal());

    container.querySelectorAll('.btn-sub-prof-ai').forEach(b => {
      b.addEventListener('click', () => this.openProfessorAiModal(b.dataset.subid));
    });

    container.querySelectorAll('.btn-sub-focus').forEach(b => {
      b.addEventListener('click', () => this.openFocusSession(b.dataset.subid));
    });
  }

  // --------------------------------------------------------------------------
  // 4. Avaliações & Provas com Contagem Regressiva
  // --------------------------------------------------------------------------
  renderAssessmentsView(container) {
    const assessments = StorageModule.getAssessments();
    const subjects = StorageModule.getFacultySubjects();

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-pen-to-square text-amber"></i> Provas, Trabalhos & Avaliações (${assessments.length})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Acompanhamento de prazos, pesos e matérias cobradas.</p>
        </div>
        <button id="btn-add-assessment-top" class="btn-primary">
          <i class="fa-solid fa-plus"></i> Agendar Avaliação
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        ${assessments.map(ass => {
          const sub = subjects.find(s => s.id === ass.subjectId);
          const diffDays = Math.ceil((new Date(ass.date) - new Date()) / (1000 * 60 * 60 * 24));
          const countdownChip = diffDays < 0 ? 'Concluída' : diffDays === 0 ? '🚨 É HOJE!' : `Faltam ${diffDays} dias`;
          return `
            <div class="article-card">
              <div class="art-header">
                <div class="art-number">
                  <span class="badge-official" style="color:${sub?.color || '#f59e0b'}; background:${sub?.color || '#f59e0b'}22; border-color:${sub?.color || '#f59e0b'};">${ass.type}</span>
                  <strong>${ass.name}</strong>
                  <span style="font-size:0.75rem; color:var(--text-muted);">(${sub?.name || 'Matéria'})</span>
                </div>
                <div class="art-actions">
                  <span class="badge-official" style="font-weight:700; color:var(--accent-amber);">${countdownChip}</span>
                  <button class="btn-secondary btn-plan-exam" data-assid="${ass.id}" style="font-size:0.78rem; color:#10b981;"><i class="fa-solid fa-wand-magic-sparkles"></i> Criar Plano</button>
                  <button class="btn-secondary btn-rev-exam" data-assid="${ass.id}" style="font-size:0.78rem; color:#38bdf8;"><i class="fa-solid fa-headphones"></i> Revisão em Áudio</button>
                </div>
              </div>
              <div class="art-body">
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:6px;">
                  <i class="fa-solid fa-calendar-day"></i> <strong>Data da Prova:</strong> ${new Date(ass.date + 'T00:00:00').toLocaleDateString('pt-BR')} às ${ass.time || '19:00'} • Peso: ${ass.weight || 1.0}
                </p>
                <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:8px;">
                  <strong>Conteúdo Cobrado:</strong> ${ass.topics || 'Geral da matéria'}
                </p>

                ${(ass.contentArticles && ass.contentArticles.length > 0) ? `
                  <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                    ${ass.contentArticles.map(artId => {
                      const art = VADE_MECUM_DB.articles.find(a => a.id === artId);
                      return `<span class="vade-art-chip" data-artid="${artId}" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-light); font-size:0.75rem; padding:3px 8px; border-radius:4px; color:var(--accent-amber); cursor:pointer;"><i class="fa-solid fa-book"></i> ${art ? art.article_display : artId}</span>`;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-add-assessment-top').addEventListener('click', () => this.openAssessmentModal());

    container.querySelectorAll('.vade-art-chip').forEach(chip => {
      chip.addEventListener('click', () => this.vadeEngine.openArticleModal(chip.dataset.artid));
    });

    container.querySelectorAll('.btn-plan-exam').forEach(btn => {
      btn.addEventListener('click', () => this.openStudyPlanModal(btn.dataset.assid));
    });

    container.querySelectorAll('.btn-rev-exam').forEach(btn => {
      btn.addEventListener('click', () => this.generateExamEveRevision(btn.dataset.assid));
    });
  }

  // --------------------------------------------------------------------------
  // 5. Planos de Estudo Automáticos
  // --------------------------------------------------------------------------
  renderStudyPlansView(container) {
    const plans = StorageModule.getStudyPlans();
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-brain text-amber"></i> Cronogramas & Planos de Estudo (${plans.length})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Planejamento inteligente com distribuição balanceada de artigos e revisões.</p>
        </div>
        <button id="btn-create-plan-view" class="btn-primary">
          <i class="fa-solid fa-plus"></i> Novo Cronograma
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        ${plans.map(p => {
          const completedCount = p.tasks.filter(t => t.completed).length;
          const pct = Math.round((completedCount / p.tasks.length) * 100) || 0;
          return `
            <div class="article-card">
              <div class="art-header">
                <div class="art-number">
                  <span class="badge-official" style="color:#10b981; background:rgba(16,185,129,0.15); border-color:#10b981;">Plano Ativo</span>
                  <strong>${p.title}</strong>
                </div>
                <span style="font-size:0.85rem; color:var(--accent-amber); font-weight:700;">${pct}% Concluído (${completedCount}/${p.tasks.length})</span>
              </div>
              <div class="art-body">
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; margin-bottom:14px;">
                  <div style="width:${pct}%; height:100%; background:var(--accent-amber); border-radius:100px;"></div>
                </div>

                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${p.tasks.map(t => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:6px; font-size:0.85rem;">
                      <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" class="task-check" data-planid="${p.id}" data-taskid="${t.id}" ${t.completed ? 'checked' : ''} style="accent-color:var(--accent-amber);">
                        <span style="color:${t.completed ? 'var(--text-muted)' : 'var(--text-main)'}; text-decoration:${t.completed ? 'line-through' : 'none'};">
                          <strong>${new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}:</strong> ${t.label}
                        </span>
                      </label>
                      ${t.articleId ? `<button class="btn-task-listen btn-secondary" data-artid="${t.articleId}" style="padding:2px 8px; font-size:0.75rem;"><i class="fa-solid fa-volume-high"></i></button>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-create-plan-view').addEventListener('click', () => this.openStudyPlanModal());

    container.querySelectorAll('.task-check').forEach(chk => {
      chk.addEventListener('change', () => {
        StorageModule.togglePlanTask(chk.dataset.planid, chk.dataset.taskid);
        this.renderStudyPlansView(container);
      });
    });

    container.querySelectorAll('.btn-task-listen').forEach(b => {
      b.addEventListener('click', () => {
        const art = VADE_MECUM_DB.articles.find(a => a.id === b.dataset.artid);
        if (art) this.audioEngine.speakArticle(art);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. Materiais & Resumos de Aula
  // --------------------------------------------------------------------------
  renderMaterialsView(container) {
    const materials = StorageModule.getMaterials();
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-folder-open text-amber"></i> Materiais & Resumos de Aula (${materials.length})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Anotações organizadas e estruturadas pela IA.</p>
        </div>
        <button id="btn-add-material-view" class="btn-primary">
          <i class="fa-solid fa-plus"></i> Novo Resumo
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        ${materials.map(m => `
          <div class="article-card">
            <div class="art-header">
              <div class="art-number">
                <i class="fa-solid fa-file-lines text-amber"></i>
                <strong>${m.title}</strong>
              </div>
              <button class="btn-secondary btn-listen-mat" data-matid="${m.id}"><i class="fa-solid fa-volume-high"></i> Ouvir Resumo</button>
            </div>
            <div class="art-body">
              <p style="font-size:0.88rem; line-height:1.6; color:var(--text-main);">${m.content}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('btn-add-material-view').addEventListener('click', () => {
      const title = prompt('Título do Resumo / Anotação de Aula:');
      if (title && title.trim()) {
        const content = prompt('Cole ou digite o conteúdo do resumo:');
        if (content && content.trim()) {
          StorageModule.saveMaterial({
            id: 'mat-' + Date.now(),
            title: title.trim(),
            content: content.trim()
          });
          this.playerUI.showToast('Resumo de aula salvo com sucesso!');
          this.renderMaterialsView(container);
        }
      }
    });

    container.querySelectorAll('.btn-listen-mat').forEach(b => {
      b.addEventListener('click', () => {
        const m = StorageModule.getMaterials().find(item => item.id === b.dataset.matid);
        if (m) this.audioEngine.speakText(`Resumo de aula: ${m.title}. ${m.content}`);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. Notas e Metas
  // --------------------------------------------------------------------------
  renderGradesView(container) {
    const subjects = StorageModule.getFacultySubjects();
    const assessments = StorageModule.getAssessments();
    const goals = StorageModule.getGradeGoals();

    container.innerHTML = `
      <div style="margin-bottom:18px;">
        <h3 style="font-size:1.15rem; color:var(--text-main); margin-bottom:4px;">
          <i class="fa-solid fa-trophy text-amber"></i> Gestão de Notas & Meta de Média
        </h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Acompanhe suas notas e descubra quanto precisa tirar para atingir a meta (Meta Atual: <strong>${goals.targetAverage.toFixed(1)}</strong>).</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        ${subjects.map(sub => {
          const subAssessments = assessments.filter(a => a.subjectId === sub.id);
          const gradedAssessments = subAssessments.filter(a => a.gradeObtained !== null && !isNaN(a.gradeObtained));
          const currentAvg = gradedAssessments.length > 0 
            ? (gradedAssessments.reduce((acc, a) => acc + parseFloat(a.gradeObtained), 0) / gradedAssessments.length).toFixed(1)
            : '—';
          
          const statusColor = currentAvg >= goals.targetAverage ? '#10b981' : currentAvg !== '—' ? '#f59e0b' : 'var(--text-muted)';
          return `
            <div class="article-card">
              <div class="art-header">
                <div class="art-number">
                  <span class="badge-official" style="color:${sub.color}; background:${sub.color}22; border-color:${sub.color};">${sub.code || 'MATÉRIA'}</span>
                  <strong>${sub.name}</strong>
                </div>
                <div>
                  <span style="font-size:0.85rem; color:var(--text-muted);">Média Atual: </span>
                  <strong style="color:${statusColor}; font-size:1.1rem;">${currentAvg}</strong>
                </div>
              </div>
              <div class="art-body">
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                  ${subAssessments.map(a => `
                    <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; font-size:0.82rem;">
                      <span>${a.name}: </span>
                      <strong style="color:var(--accent-amber);">${a.gradeObtained !== null ? a.gradeObtained : 'Pendente'}</strong>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Modais de Cadastro & Funções Avançadas
  // --------------------------------------------------------------------------
  openSubjectModal() {
    const name = prompt('Nome da Nova Disciplina (ex: Direito Administrativo):');
    if (name && name.trim()) {
      const prof = prompt('Nome do Professor:');
      const time = prompt('Horário das aulas (ex: 19:00 - 20:40):', '19:00 - 20:40');
      const newSub = {
        id: 'fac-sub-' + Date.now(),
        name: name.trim(),
        professor: prof ? prof.trim() : '',
        color: '#f59e0b',
        scheduleDays: ['Segunda'],
        scheduleTime: time || '19:00 - 20:40',
        semesterId: 'sem-2026-2'
      };
      StorageModule.saveFacultySubject(newSub);
      this.playerUI.showToast('Disciplina cadastrada com sucesso!');
      this.renderFacultyHub(this.activeFacultyTab);
    }
  }

  openAssessmentModal() {
    const subjects = StorageModule.getFacultySubjects();
    if (subjects.length === 0) {
      alert('Cadastre uma disciplina primeiro.');
      return;
    }
    const name = prompt('Nome da Avaliação (ex: Prova P1 - Penal Especial):');
    if (name && name.trim()) {
      const date = prompt('Data da Prova (AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
      const newAss = {
        id: 'ass-' + Date.now(),
        subjectId: subjects[0].id,
        name: name.trim(),
        type: 'Prova',
        date: date || new Date().toISOString().split('T')[0],
        time: '19:00',
        contentArticles: ['cp-art121'],
        topics: 'Matéria cobrada'
      };
      StorageModule.saveAssessment(newAss);
      this.playerUI.showToast('Avaliação agendada com sucesso!');
      this.renderFacultyHub(this.activeFacultyTab);
    }
  }

  openStudyPlanModal(assessmentId = null) {
    const assessments = StorageModule.getAssessments();
    const ass = assessmentId ? assessments.find(a => a.id === assessmentId) : assessments[0];
    if (!ass) {
      alert('Nenhuma avaliação cadastrada.');
      return;
    }

    this.generateAutoStudyPlan(ass);
  }

  generateAutoStudyPlan(ass) {
    this.playerUI.showToast(`🧠 Gerando plano de estudo automático para "${ass.name}"...`);
    const articles = ass.contentArticles || ['cp-art121', 'cp-art25', 'cp-art1'];
    const today = new Date();
    
    const tasks = [];
    articles.forEach((artId, idx) => {
      const art = VADE_MECUM_DB.articles.find(a => a.id === artId);
      const d = new Date(today.getTime() + (idx * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      tasks.push({
        id: 'task-' + Date.now() + '-' + idx,
        date: d,
        type: 'read_article',
        articleId: artId,
        label: `Leitura e Áudio do ${art ? art.article_display + ' (' + art.law_name + ')' : artId}`,
        completed: false
      });
    });

    // Tarefas finais de fixação
    const revDate = new Date(today.getTime() + (articles.length * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    tasks.push({
      id: 'task-rev-' + Date.now(),
      date: revDate,
      type: 'questions',
      label: `Resolver 10 questões e revisar Flashcards de ${ass.name}`,
      completed: false
    });

    const newPlan = {
      id: 'plan-' + Date.now(),
      title: `Plano de Estudo: ${ass.name}`,
      assessmentId: ass.id,
      tasks
    };

    StorageModule.saveStudyPlan(newPlan);
    setTimeout(() => {
      this.playerUI.showToast('✅ Plano de estudo criado e adicionado ao seu Checklist!');
      this.activeFacultyTab = 'plans';
      this.renderFacultyHub('plans');
    }, 600);
  }

  // --------------------------------------------------------------------------
  // Modo Foco / Pomodoro de Estudo
  // --------------------------------------------------------------------------
  openFocusSession(subjectId = null, articleId = null) {
    this.focusSubjectId = subjectId;
    this.focusArticleId = articleId;
    this.focusSecondsRemaining = 25 * 60;
    this.focusTotalDuration = 25 * 60;

    const modal = document.getElementById('faculty-focus-modal');
    const timerTxt = document.getElementById('focus-timer-text');
    const artTitle = document.getElementById('focus-art-title');

    const sub = StorageModule.getFacultySubjects().find(s => s.id === subjectId);
    const art = VADE_MECUM_DB.articles.find(a => a.id === articleId);

    if (artTitle) {
      artTitle.innerText = `${sub ? sub.name : 'Sessão de Estudos'} • ${art ? art.article_display : 'Foco Total'}`;
    }

    this.updateFocusTimerDisplay();
    this.startFocusTimer();

    if (modal) modal.classList.remove('hidden');
    this.playerUI.showToast('🎯 Modo Foco ativado. Bons estudos!');
  }

  startFocusTimer() {
    clearInterval(this.focusTimerInterval);
    this.focusTimerInterval = setInterval(() => {
      if (this.focusSecondsRemaining > 0) {
        this.focusSecondsRemaining--;
        this.updateFocusTimerDisplay();
      } else {
        clearInterval(this.focusTimerInterval);
        this.finishFocusSession();
      }
    }, 1000);
  }

  toggleFocusTimer() {
    if (this.focusTimerInterval) {
      clearInterval(this.focusTimerInterval);
      this.focusTimerInterval = null;
      document.getElementById('btn-focus-pause').innerHTML = '<i class="fa-solid fa-play"></i> Continuar';
    } else {
      this.startFocusTimer();
      document.getElementById('btn-focus-pause').innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
    }
  }

  updateFocusTimerDisplay() {
    const m = Math.floor(this.focusSecondsRemaining / 60);
    const s = this.focusSecondsRemaining % 60;
    const txt = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    const el = document.getElementById('focus-timer-text');
    if (el) el.innerText = txt;
  }

  finishFocusSession() {
    clearInterval(this.focusTimerInterval);
    this.focusTimerInterval = null;
    const modal = document.getElementById('faculty-focus-modal');
    if (modal) modal.classList.add('hidden');

    const studiedMinutes = Math.round((this.focusTotalDuration - this.focusSecondsRemaining) / 60) || 1;
    StorageModule.addListenTime(studiedMinutes * 60);
    StorageModule.saveFacultySession({
      id: 'sess-' + Date.now(),
      subjectId: this.focusSubjectId,
      durationMinutes: studiedMinutes
    });

    this.playerUI.showToast(`🎉 Sessão concluída! ${studiedMinutes} minutos registrados no seu progresso.`);
    this.renderFacultyHub(this.activeFacultyTab);
  }

  closeFocusSession() {
    if (confirm('Deseja encerrar a sessão no Modo Foco?')) {
      clearInterval(this.focusTimerInterval);
      const modal = document.getElementById('faculty-focus-modal');
      if (modal) modal.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Professor IA da Disciplina
  // --------------------------------------------------------------------------
  openProfessorAiModal(subjectId) {
    const sub = StorageModule.getFacultySubjects().find(s => s.id === subjectId);
    const modal = document.getElementById('faculty-professor-modal');
    const title = document.getElementById('faculty-prof-title');
    const answerBox = document.getElementById('faculty-prof-answer');

    if (title && sub) title.innerText = `🤖 Professor IA - ${sub.name}`;
    if (answerBox) answerBox.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">Olá! Sou seu tutor de <strong>${sub ? sub.name : 'Direito'}</strong>. Como posso te ajudar hoje? Selecione um dos tópicos rápidos abaixo ou faça uma pergunta.</p>`;

    // Sugestões Rápidas
    const suggestions = [
      'Explique os pontos mais cobrados nesta matéria',
      'Faça uma questão estilo OAB sobre o conteúdo',
      'Explique como se eu nunca tivesse estudado Direito',
      'Quais as pegadinhas de prova mais comuns?'
    ];
    const sugContainer = document.getElementById('faculty-prof-suggestions');
    if (sugContainer) {
      sugContainer.innerHTML = suggestions.map(s => `
        <button class="btn-secondary btn-prof-sug" style="font-size:0.78rem; text-align:left;">${s}</button>
      `).join('');

      sugContainer.querySelectorAll('.btn-prof-sug').forEach(btn => {
        btn.onclick = () => {
          this.askProfessorAi(sub ? sub.name : 'Direito', btn.innerText);
        };
      });
    }

    if (modal) modal.classList.remove('hidden');
  }

  askProfessorAi(subjectName, query) {
    const answerBox = document.getElementById('faculty-prof-answer');
    if (!answerBox) return;

    answerBox.innerHTML = `<p style="color:var(--accent-amber);"><i class="fa-solid fa-spinner fa-spin"></i> O Professor IA está elaborando sua resposta...</p>`;

    setTimeout(() => {
      const response = `Explicação do Professor IA de ${subjectName} sobre "${query}":\n\nNesta disciplina, a chave é compreender a aplicação prática da lei aos casos concretos. Sempre relacione o texto legal aos precedentes do STF e STJ e atente-se às exceções doutrinárias mais cobradas em provas!`;
      answerBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-amber); border-radius:10px; padding:14px;">
          <p style="font-size:0.9rem; line-height:1.6; color:var(--text-main); margin:0;">${response}</p>
          <button id="btn-speak-prof-resp" class="btn-primary" style="margin-top:10px; font-size:0.8rem;"><i class="fa-solid fa-volume-high"></i> Ouvir com a Voz Marcos (ElevenLabs)</button>
        </div>
      `;

      document.getElementById('btn-speak-prof-resp')?.addEventListener('click', () => {
        this.audioEngine.speakText(response);
      });
    }, 600);
  }

  // --------------------------------------------------------------------------
  // Revisão de Véspera de Prova em Áudio
  // --------------------------------------------------------------------------
  generateExamEveRevision(assessmentId) {
    const ass = StorageModule.getAssessments().find(a => a.id === assessmentId);
    if (!ass) return;

    this.playerUI.showToast(`🎧 Gerando Revisão em Áudio para ${ass.name}...`);
    setTimeout(() => {
      const text = `Revisão rápida de véspera de prova para ${ass.name}. Conteúdo principal: ${ass.topics}. Lembre-se de revisar os artigos fundamentais e atentar-se às hipóteses de excludentes e prazos decadenciais. Boa prova!`;
      this.audioEngine.speakText(text);
      this.playerUI.showToast('Narrando revisão com a voz Marcos da ElevenLabs...');
    }, 500);
  }
}
