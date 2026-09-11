/**
 * VadeAudio AI - Motor do Professor, Turmas e Atividades Acadêmicas (Etapa 16)
 * Gerenciamento de turmas, publicação de materiais, listas de exercícios com IA supervisionada e métricas agregadas.
 */

class TeacherEngine {
  constructor(authService) {
    this.authService = authService;
    this.currentClassId = null;
    this.initDefaultClasses();
  }

  initDefaultClasses() {
    try {
      const stored = localStorage.getItem('vadeaudio_teacher_classes');
      if (!stored) {
        const initial = [
          {
            id: 'cls_penal_ufba_2026',
            name: 'Direito Penal II — Turma A',
            subject: 'Direito Penal',
            semester: '2026.2',
            institution: 'Universidade Federal da Bahia (UFBA)',
            inviteCode: 'PENAL-UFBA-2026',
            teacherId: 'usr_teacher_roberto_303',
            teacherName: 'Prof. Dr. Roberto Mendes',
            membersCount: 42,
            materialsCount: 6,
            assignmentsCount: 3,
            averageScore: 78
          },
          {
            id: 'cls_proc_penal_2026',
            name: 'Processo Penal I — Turma Matutina',
            subject: 'Processo Penal',
            semester: '2026.2',
            institution: 'Universidade Federal da Bahia (UFBA)',
            inviteCode: 'PROC-PENAL-2026',
            teacherId: 'usr_teacher_roberto_303',
            teacherName: 'Prof. Dr. Roberto Mendes',
            membersCount: 38,
            materialsCount: 4,
            assignmentsCount: 2,
            averageScore: 82
          }
        ];
        localStorage.setItem('vadeaudio_teacher_classes', JSON.stringify(initial));
      }
    } catch {}
  }

  getClasses() {
    try {
      return JSON.parse(localStorage.getItem('vadeaudio_teacher_classes')) || [];
    } catch {
      return [];
    }
  }

  saveClass(newClass) {
    const classes = this.getClasses();
    const existingIdx = classes.findIndex(c => c.id === newClass.id);
    if (existingIdx >= 0) {
      classes[existingIdx] = newClass;
    } else {
      classes.unshift(newClass);
    }
    localStorage.setItem('vadeaudio_teacher_classes', JSON.stringify(classes));
    return newClass;
  }

  createClass({ name, subject, semester, institution, description, inviteCode }) {
    if (!this.authService.isTeacher() && !this.authService.isAdmin()) {
      throw new Error('Apenas professores e coordenadores acadêmicos podem criar turmas.');
    }

    const classId = 'cls_' + Math.random().toString(36).substring(2, 9);
    const code = inviteCode ? inviteCode.trim().toUpperCase().replace(/\s+/g, '-') : `${subject.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClass = {
      id: classId,
      name: name.trim(),
      subject: subject.trim(),
      semester: semester || '2026.2',
      institution: institution || 'Instituição de Ensino Superior',
      description: description || '',
      inviteCode: code,
      teacherId: this.authService.getCurrentUser().id,
      teacherName: this.authService.getCurrentUser().name,
      createdAt: Date.now(),
      membersCount: 0,
      materialsCount: 0,
      assignmentsCount: 0,
      averageScore: 0
    };

    return this.saveClass(newClass);
  }

  // --------------------------------------------------------------------------
  // IA DO PROFESSOR: GERAÇÃO DE QUESTÕES COM REVISÃO HUMANA OBRIGATÓRIA
  // --------------------------------------------------------------------------
  async generateAiQuestionDraft({ topic, subject, difficulty = 'medium', articles = [] }) {
    // Simulação de IA com estrutura jurídica fundamentada
    const drafts = [
      {
        stem: `No que concerne aos crimes contra a pessoa no Código Penal brasileiro, em relação ao tema "${topic}", assinale a alternativa juridicamente correta:`,
        options: [
          `A prática da conduta descrita afasta a ilicitude quando praticada em estrito cumprimento do dever legal nos termos dos artigos aplicáveis.`,
          `Configura dolo eventual quando o agente, embora não queira diretamente o resultado, assume o risco de sua produção (Art. 18, I, in fine, do CP).`,
          `A tentativa é expressamente inadmissível em quaisquer circunstâncias desta modalidade típica.`,
          `A pena é reduzida de metade se o crime for cometido durante o repouso noturno independentemente de previsão expressa.`
        ],
        correctIndex: 1,
        explanation: `Fundamentação: Nos termos do Art. 18, I do Código Penal, diz-se o crime doloso quando o agente quis o resultado ou assumiu o risco de produzi-lo (dolo eventual).`,
        sourceArticles: articles.length > 0 ? articles : ['Art. 18 do Código Penal', 'Art. 121 do Código Penal'],
        difficulty,
        isAiGenerated: true,
        reviewedByTeacher: false
      }
    ];

    return drafts[0];
  }

  // --------------------------------------------------------------------------
  // RENDER DO PAINEL DO PROFESSOR (VIEW-TEACHER)
  // --------------------------------------------------------------------------
  renderTeacherDashboard() {
    const container = document.getElementById('teacher-classes-grid');
    const classes = this.getClasses();

    if (!container) return;

    if (classes.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; background:rgba(255,255,255,0.02); border:1px dashed var(--border-light); border-radius:14px; grid-column: 1 / -1;">
          <i class="fa-solid fa-chalkboard-user text-amber" style="font-size:2.5rem; margin-bottom:12px;"></i>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.2rem;">Nenhuma turma cadastrada ainda</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">Crie sua primeira turma para compartilhar materiais, artigos do Vade Mecum e listas de exercícios.</p>
          <button id="btn-empty-create-class" class="btn-primary"><i class="fa-solid fa-plus"></i> Criar Primeira Turma</button>
        </div>
      `;
      document.getElementById('btn-empty-create-class')?.addEventListener('click', () => {
        document.getElementById('btn-open-create-class-modal')?.click();
      });
      return;
    }

    container.innerHTML = classes.map(c => `
      <div class="class-card" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; transition:all 0.2s; position:relative; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.7rem;"><i class="fa-solid fa-graduation-cap"></i> ${c.semester}</span>
          <span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:3px 8px; border-radius:6px; font-weight:700; color:var(--text-main); font-family:monospace; border:1px solid var(--border-amber);"><i class="fa-solid fa-key text-amber"></i> ${c.inviteCode}</span>
        </div>

        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.15rem; margin:4px 0 6px;">${c.name}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:14px;"><i class="fa-solid fa-building-columns"></i> ${c.institution}</p>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:rgba(0,0,0,0.2); border-radius:10px; padding:10px; margin-bottom:16px; text-align:center; font-size:0.75rem;">
          <div>
            <span style="color:var(--text-muted); display:block;">Alunos</span>
            <strong style="color:var(--text-main); font-size:0.95rem;">${c.membersCount}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); display:block;">Materiais</span>
            <strong style="color:var(--accent-amber); font-size:0.95rem;">${c.materialsCount}</strong>
          </div>
          <div>
            <span style="color:var(--text-muted); display:block;">Média</span>
            <strong style="color:#10b981; font-size:0.95rem;">${c.averageScore}%</strong>
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button class="btn-secondary btn-class-action" data-class-id="${c.id}" data-action="materials" style="flex:1; font-size:0.78rem; padding:8px 6px;"><i class="fa-solid fa-folder-plus"></i> Materiais</button>
          <button class="btn-secondary btn-class-action" data-class-id="${c.id}" data-action="questions" style="flex:1; font-size:0.78rem; padding:8px 6px;"><i class="fa-solid fa-list-check"></i> Listas</button>
          <button class="btn-primary btn-class-action" data-class-id="${c.id}" data-action="analytics" style="flex:1; font-size:0.78rem; padding:8px 6px;"><i class="fa-solid fa-chart-pie"></i> Métricas</button>
        </div>
      </div>
    `).join('');

    this.bindDashboardEvents();
  }

  bindDashboardEvents() {
    document.querySelectorAll('.btn-class-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const classId = btn.getAttribute('data-class-id');
        const action = btn.getAttribute('data-action');
        const targetClass = this.getClasses().find(c => c.id === classId);

        if (action === 'materials') {
          window.Toast.info(`Gerenciando materiais da turma: ${targetClass.name}`);
          document.getElementById('teacher-tab-materials')?.click();
        } else if (action === 'questions') {
          window.Toast.info(`Gerenciando listas de questões da turma: ${targetClass.name}`);
          document.getElementById('teacher-tab-assignments')?.click();
        } else if (action === 'analytics') {
          this.renderAggregatedAnalytics(targetClass);
        }
      });
    });
  }

  renderAggregatedAnalytics(targetClass) {
    const modal = document.getElementById('class-analytics-modal');
    const titleEl = document.getElementById('class-analytics-title');
    const contentEl = document.getElementById('class-analytics-content');

    if (titleEl) titleEl.innerText = `Resultados Agregados: ${targetClass.name}`;
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:18px;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:10px; padding:12px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Alunos Matriculados</span>
            <strong style="font-size:1.4rem; color:var(--text-main); font-family:var(--font-display);">${targetClass.membersCount}</strong>
          </div>
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:10px; padding:12px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Média Geral da Turma</span>
            <strong style="font-size:1.4rem; color:#10b981; font-family:var(--font-display);">${targetClass.averageScore}%</strong>
          </div>
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:10px; padding:12px; text-align:center;">
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Listas Realizadas</span>
            <strong style="font-size:1.4rem; color:var(--accent-amber); font-family:var(--font-display);">128 envios</strong>
          </div>
        </div>

        <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1rem; margin-bottom:10px;"><i class="fa-solid fa-triangle-exclamation text-amber"></i> Temas com Maior Índice de Dificuldade / Erro</h4>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--text-main); font-size:0.85rem;">Dosimetria da Pena & Concurso de Crimes</strong>
              <span style="display:block; font-size:0.72rem; color:var(--text-muted);">Art. 59 a 71 do Código Penal</span>
            </div>
            <span style="color:#ef4444; font-weight:700; font-size:0.9rem;">52% de Erro</span>
          </div>
          <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--text-main); font-size:0.85rem;">Dolo Eventual vs Culpa Consciente no Trânsito</strong>
              <span style="display:block; font-size:0.72rem; color:var(--text-muted);">Art. 18, I vs II do Código Penal</span>
            </div>
            <span style="color:var(--accent-amber); font-weight:700; font-size:0.9rem;">46% de Erro</span>
          </div>
        </div>

        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:12px; font-size:0.78rem; color:var(--text-muted);">
          <i class="fa-solid fa-user-shield text-green"></i> <strong>Privacidade Garantida (LGPD):</strong> Os dados são agregados de forma anônima. As notas e tentativas individuais de cada estudante permanecem estritamente confidenciais.
        </div>
      `;
    }

    modal?.classList.remove('hidden');
  }
}

window.TeacherEngine = TeacherEngine;
