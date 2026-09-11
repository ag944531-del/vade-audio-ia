/**
 * VadeAudio AI - Motor de Onboarding & Primeiro Acesso (Etapa 15)
 * Fluxo de acolhimento em 7 passos rápidos para configurar o perfil de estudo e gerar valor imediato.
 */

class OnboardingEngine {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.currentStep = 1;
    this.totalSteps = 7;
    this.userData = {
      objective: 'faculdade',
      semester: 4,
      subjects: ['Direito Penal', 'Direito Civil', 'Direito Constitucional'],
      upcomingExam: {
        subject: 'Direito Penal',
        date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
        topics: 'Art. 121 a 129 do CP (Crimes contra a Vida)'
      },
      studyPreferences: ['audio', 'flashcards', 'questions'],
      voiceDemoPlayed: false
    };
  }

  isCompleted() {
    try {
      return localStorage.getItem('vadeaudio_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  }

  setCompleted(val = true) {
    try {
      localStorage.setItem('vadeaudio_onboarding_completed', val ? 'true' : 'false');
    } catch {}
  }

  startOnboarding() {
    this.currentStep = 1;
    const modal = document.getElementById('onboarding-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderCurrentStep();
    }
  }

  closeOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.classList.add('hidden');
    this.setCompleted(true);
  }

  renderCurrentStep() {
    const container = document.getElementById('onboarding-step-container');
    const progressBar = document.getElementById('onboarding-progress-bar');
    const stepNumber = document.getElementById('onboarding-step-number');

    if (stepNumber) stepNumber.innerText = `Passo ${this.currentStep} de ${this.totalSteps}`;
    if (progressBar) progressBar.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;

    if (!container) return;

    switch (this.currentStep) {
      case 1:
        container.innerHTML = this.renderStep1Objective();
        this.bindStep1Events();
        break;
      case 2:
        container.innerHTML = this.renderStep2Semester();
        this.bindStep2Events();
        break;
      case 3:
        container.innerHTML = this.renderStep3Subjects();
        this.bindStep3Events();
        break;
      case 4:
        container.innerHTML = this.renderStep4Exam();
        this.bindStep4Events();
        break;
      case 5:
        container.innerHTML = this.renderStep5Preferences();
        this.bindStep5Events();
        break;
      case 6:
        container.innerHTML = this.renderStep6VoiceDemo();
        this.bindStep6Events();
        break;
      case 7:
        container.innerHTML = this.renderStep7InitialPlan();
        this.bindStep7Events();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // PASSO 1: OBJETIVO PRINCIPAL
  // --------------------------------------------------------------------------
  renderStep1Objective() {
    const options = [
      { id: 'faculdade', icon: 'fa-graduation-cap', title: 'Graduação em Direito', desc: 'Acompanhar semestres, provas e matérias da faculdade' },
      { id: 'oab_1fase', icon: 'fa-scale-balanced', title: 'OAB 1ª Fase', desc: 'Simulados oficiais, questões comentadas e súmulas' },
      { id: 'oab_2fase', icon: 'fa-gavel', title: 'OAB 2ª Fase & Prática', desc: 'Elaboração de peças, fundamentação e sustentação oral' },
      { id: 'concursos', icon: 'fa-landmark', title: 'Concursos Públicos', desc: 'Memorização de lei seca e informativos dos tribunais' },
      { id: 'organizacao', icon: 'fa-bullseye', title: 'Organização de Estudos', desc: 'Planejamento adaptativo, rotina e revisões espaçadas' }
    ];

    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-compass"></i> BOAS-VINDAS AO VADEAUDIO AI</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Qual é seu principal foco no momento?</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Personalizaremos suas recomendações diárias e trilhas de áudio.</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
        ${options.map(opt => `
          <button class="btn-onboarding-choice ${this.userData.objective === opt.id ? 'active' : ''}" data-value="${opt.id}" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid ${this.userData.objective === opt.id ? 'var(--accent-amber)' : 'var(--border-light)'}; color:var(--text-main); text-align:left; cursor:pointer; transition:all 0.2s;">
            <i class="fa-solid ${opt.icon}" style="font-size:1.3rem; color:var(--accent-amber); width:28px;"></i>
            <div style="flex:1;">
              <strong style="display:block; font-size:0.9rem;">${opt.title}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${opt.desc}</span>
            </div>
            ${this.userData.objective === opt.id ? '<i class="fa-solid fa-circle-check text-amber"></i>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  bindStep1Events() {
    document.querySelectorAll('.btn-onboarding-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        this.userData.objective = btn.getAttribute('data-value');
        this.renderCurrentStep();
      });
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 2: SEMESTRE ATUAL
  // --------------------------------------------------------------------------
  renderStep2Semester() {
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-calendar-days"></i> ETAPA ACADÊMICA</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Em qual semestre você está?</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Isso ajusta a profundidade das explicações do Tutor Jurídico.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-bottom:16px;">
        ${semesters.map(s => `
          <button class="btn-semester-choice ${this.userData.semester === s ? 'active' : ''}" data-sem="${s}" style="padding:14px 8px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid ${this.userData.semester === s ? 'var(--accent-amber)' : 'var(--border-light)'}; color:var(--text-main); font-weight:700; font-size:1rem; cursor:pointer;">
            ${s}º Sem
          </button>
        `).join('')}
      </div>

      <button class="btn-semester-choice ${this.userData.semester === 'graduated' ? 'active' : ''}" data-sem="graduated" style="width:100%; padding:10px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid ${this.userData.semester === 'graduated' ? 'var(--accent-amber)' : 'var(--border-light)'}; color:var(--text-main); font-size:0.85rem; cursor:pointer; margin-bottom:10px;">
        🎓 Já concluí a graduação / Bacharel em Direito
      </button>
    `;
  }

  bindStep2Events() {
    document.querySelectorAll('.btn-semester-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-sem');
        this.userData.semester = val === 'graduated' ? 'graduated' : parseInt(val);
        this.renderCurrentStep();
      });
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 3: DISCIPLINAS DO SEMESTRE
  // --------------------------------------------------------------------------
  renderStep3Subjects() {
    const popularSubjects = [
      'Direito Penal', 'Direito Civil', 'Direito Constitucional',
      'Processo Civil', 'Processo Penal', 'Direito Administrativo',
      'Direito do Trabalho', 'Direito Tributário', 'Direito Empresarial',
      'Direito do Consumidor', 'Ética Profissional (OAB)'
    ];

    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-book-open"></i> GRADE DE MATÉRIAS</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Selecione suas matérias atuais</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Clique para ativar ou desativar as disciplinas do seu plano de estudo.</p>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
        ${popularSubjects.map(sub => {
          const isSelected = this.userData.subjects.includes(sub);
          return `
            <button class="btn-subject-tag ${isSelected ? 'active' : ''}" data-sub="${sub}" style="padding:8px 14px; border-radius:20px; font-size:0.82rem; background:${isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${isSelected ? 'var(--accent-amber)' : 'var(--border-light)'}; color:${isSelected ? 'var(--accent-amber)' : 'var(--text-main)'}; cursor:pointer;">
              ${isSelected ? '<i class="fa-solid fa-check"></i> ' : ''}${sub}
            </button>
          `;
        }).join('')}
      </div>

      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <input type="text" id="input-new-onboard-sub" placeholder="Adicionar outra disciplina (ex: Direito Ambiental)..." style="flex:1; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
        <button id="btn-add-custom-sub" class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;"><i class="fa-solid fa-plus"></i> Adicionar</button>
      </div>
    `;
  }

  bindStep3Events() {
    document.querySelectorAll('.btn-subject-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub');
        if (this.userData.subjects.includes(sub)) {
          if (this.userData.subjects.length > 1) {
            this.userData.subjects = this.userData.subjects.filter(s => s !== sub);
          } else {
            window.Toast.warning('Mantenha pelo menos uma disciplina selecionada.');
          }
        } else {
          this.userData.subjects.push(sub);
        }
        this.renderCurrentStep();
      });
    });

    document.getElementById('btn-add-custom-sub')?.addEventListener('click', () => {
      const input = document.getElementById('input-new-onboard-sub');
      if (input && input.value.trim()) {
        const newSub = input.value.trim();
        if (!this.userData.subjects.includes(newSub)) {
          this.userData.subjects.push(newSub);
          this.renderCurrentStep();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 4: PRÓXIMA PROVA
  // --------------------------------------------------------------------------
  renderStep4Exam() {
    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:#ef4444; border-color:#ef4444;"><i class="fa-solid fa-stopwatch"></i> ALERTA DE AVALIAÇÃO</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Você tem alguma prova próxima?</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Montaremos um ciclo de revisão prioritário para sua aprovação.</p>
      </div>

      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
        <div>
          <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Disciplina da Prova:</label>
          <select id="onboard-exam-sub" style="width:100%; padding:9px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); color:var(--text-main); font-size:0.85rem;">
            ${this.userData.subjects.map(s => `<option value="${s}" ${this.userData.upcomingExam.subject === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Data Prevista:</label>
            <input type="date" id="onboard-exam-date" value="${this.userData.upcomingExam.date}" style="width:100%; padding:8px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Conteúdo / Artigos:</label>
            <input type="text" id="onboard-exam-topics" value="${this.userData.upcomingExam.topics}" placeholder="ex: Homicídio e Lesão Corporal" style="width:100%; padding:8px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); color:var(--text-main); font-size:0.82rem;">
          </div>
        </div>
      </div>
    `;
  }

  bindStep4Events() {
    const subEl = document.getElementById('onboard-exam-sub');
    const dateEl = document.getElementById('onboard-exam-date');
    const topEl = document.getElementById('onboard-exam-topics');

    if (subEl) subEl.addEventListener('change', (e) => this.userData.upcomingExam.subject = e.target.value);
    if (dateEl) dateEl.addEventListener('change', (e) => this.userData.upcomingExam.date = e.target.value);
    if (topEl) topEl.addEventListener('input', (e) => this.userData.upcomingExam.topics = e.target.value);
  }

  // --------------------------------------------------------------------------
  // PASSO 5: PREFERÊNCIAS DE ESTUDO
  // --------------------------------------------------------------------------
  renderStep5Preferences() {
    const methods = [
      { id: 'audio', icon: 'fa-headphones', title: 'Áudio Neural no Trânsito & Academia', desc: 'Ouvir artigos narrados e resumos enquanto se desloca' },
      { id: 'questions', icon: 'fa-list-check', title: 'Resolução de Questões & Simulados', desc: 'Treinar questões da OAB e concursos com gabarito comentado' },
      { id: 'flashcards', icon: 'fa-brain', title: 'Flashcards & Repetição Espaçada', desc: 'Memorizar prazos, competências e exceções de lei seca' },
      { id: 'cases', icon: 'fa-briefcase', title: 'Casos Práticos & Sustentação Oral', desc: 'Simulação de audiências e peticionamento com IA' }
    ];

    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-sliders"></i> ESTILO DE APRENDIZADO</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Como você mais gosta de estudar?</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Pode selecionar várias opções que combinam com seu dia a dia.</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
        ${methods.map(m => {
          const isChecked = this.userData.studyPreferences.includes(m.id);
          return `
            <label style="display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid ${isChecked ? 'var(--accent-amber)' : 'var(--border-light)'}; color:var(--text-main); cursor:pointer;">
              <input type="checkbox" class="check-pref-input" data-id="${m.id}" ${isChecked ? 'checked' : ''} style="accent-color:var(--accent-amber); width:18px; height:18px;">
              <i class="fa-solid ${m.icon}" style="font-size:1.2rem; color:var(--accent-amber); width:24px;"></i>
              <div style="flex:1;">
                <strong style="display:block; font-size:0.88rem;">${m.title}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${m.desc}</span>
              </div>
            </label>
          `;
        }).join('')}
      </div>
    `;
  }

  bindStep5Events() {
    document.querySelectorAll('.check-pref-input').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        if (chk.checked) {
          if (!this.userData.studyPreferences.includes(id)) this.userData.studyPreferences.push(id);
        } else {
          this.userData.studyPreferences = this.userData.studyPreferences.filter(x => x !== id);
        }
        this.renderCurrentStep();
      });
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 6: DEMONSTRAÇÃO DA NARRAÇÃO NEURAL ELEVENLABS
  // --------------------------------------------------------------------------
  renderStep6VoiceDemo() {
    return `
      <div style="text-align:center; margin-bottom:16px;">
        <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);"><i class="fa-solid fa-volume-high"></i> NARRAÇÃO NEURAL ELEVENLABS</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:6px;">Conheça a voz do seu Professor de Direito</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Cadência natural, pausada e com ênfase didática em artigos jurídicos.</p>
      </div>

      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-amber); border-radius:12px; padding:18px; text-align:center; margin-bottom:16px;">
        <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, var(--accent-amber), #b45309); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; box-shadow:0 0 20px rgba(245,158,11,0.4);">
          <i class="fa-solid fa-microphone-lines" style="font-size:1.6rem; color:#000;"></i>
        </div>

        <strong style="display:block; font-size:1.05rem; color:var(--text-main); margin-bottom:4px;">Prof. Marcos (Neural PT-BR)</strong>
        <span style="font-size:0.78rem; color:var(--accent-amber); display:block; margin-bottom:12px;">Voz Padrão de Direito Constitucional & Penal</span>

        <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:14px; font-style:italic; background:rgba(0,0,0,0.25); padding:10px; border-radius:8px;">
          "Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade e à igualdade."
        </p>

        <button id="btn-play-voice-demo" class="btn-primary" style="font-size:0.9rem; padding:10px 22px;">
          <i class="fa-solid fa-play"></i> Ouvir Demonstração Neural
        </button>
      </div>
    `;
  }

  bindStep6Events() {
    document.getElementById('btn-play-voice-demo')?.addEventListener('click', () => {
      const demoArticle = {
        id: 'cf88_art_5',
        lawId: 'cf88',
        number: 'Art. 5º',
        heading: 'Art. 5º - Dos Direitos e Garantias Fundamentais',
        text: 'Artigo 5º da Constituição Federal: Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.'
      };
      this.audioEngine.speakArticle(demoArticle);
      window.Toast.success('Reproduzindo demonstração com narração neural de alta definição.');
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 7: PRIMEIRO PLANO GERADO COM SUCESSO
  // --------------------------------------------------------------------------
  renderStep7InitialPlan() {
    return `
      <div style="text-align:center; margin-bottom:16px;">
        <div style="width:55px; height:55px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; font-size:1.6rem; box-shadow:0 0 20px rgba(16,185,129,0.4);">
          <i class="fa-solid fa-check"></i>
        </div>
        <span class="badge-official" style="color:#10b981; border-color:#10b981;">TUDO PRONTO!</span>
        <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.35rem; margin-top:4px;">Seu Primeiro Plano de Estudo foi Gerado!</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Veja o que preparamos com base nas suas metas:</p>
      </div>

      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:12px; padding:14px; margin-bottom:16px; font-size:0.85rem; line-height:1.6;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px; margin-bottom:8px;">
          <span style="color:var(--text-muted);">Meta Principal:</span>
          <strong style="color:var(--accent-amber);">${this.userData.objective.toUpperCase()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px; margin-bottom:8px;">
          <span style="color:var(--text-muted);">Disciplinas Ativas:</span>
          <strong>${this.userData.subjects.length} matérias</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:6px; margin-bottom:8px;">
          <span style="color:var(--text-muted);">Próxima Prova:</span>
          <strong style="color:#ef4444;">${this.userData.upcomingExam.subject} (${new Date(this.userData.upcomingExam.date).toLocaleDateString()})</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-muted);">Sugestão de Hoje:</span>
          <strong style="color:#10b981;">Ouvir Art. 121 CP + 5 Flashcards</strong>
        </div>
      </div>
    `;
  }

  bindStep7Events() {
    // Salvar plano inicial no banco de dados local
    try {
      // 1. Salvar disciplinas
      this.userData.subjects.forEach(sub => {
        StorageModule.saveFacultySubject({
          id: 'sub_' + Math.random().toString(36).substring(2, 7),
          name: sub,
          professor: 'Docente Titular',
          credits: 4,
          semesterId: 'sem_atual',
          color: '#f59e0b'
        });
      });

      // 2. Salvar prova
      if (this.userData.upcomingExam.subject) {
        StorageModule.saveFacultyAssessment({
          id: 'exam_onboard_1',
          subjectId: 'sub_penal',
          subjectName: this.userData.upcomingExam.subject,
          title: `Prova de ${this.userData.upcomingExam.subject}`,
          type: 'p1',
          date: this.userData.upcomingExam.date,
          weight: 10,
          syllabus: this.userData.upcomingExam.topics,
          status: 'upcoming'
        });
      }
    } catch (e) {
      console.warn('[Onboarding] Falha ao persistir dados iniciais:', e);
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.renderCurrentStep();
    } else {
      this.closeOnboarding();
      window.Toast.success('Bem-vindo ao VadeAudio AI! Seu plano inicial está ativo na aba Hoje.');
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderCurrentStep();
    }
  }
}

window.OnboardingEngine = OnboardingEngine;
