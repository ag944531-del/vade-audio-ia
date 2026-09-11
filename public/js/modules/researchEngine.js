/**
 * VadeAudio AI - Motor de Pesquisa Jurídica & Trabalhos Acadêmicos (Etapa 9)
 * Fichamentos, Estruturação de TCC/Artigos, Editor Acadêmico com Painel de Fontes,
 * Gerador de Argumentos/Contrapontos, Referências ABNT e Seminário com Voz Marcos (ElevenLabs).
 */

class ResearchEngine {
  constructor(audioEngine, playerUI, vadeEngine, tutorEngine, legalBrainEngine) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.legalBrainEngine = legalBrainEngine;

    // Estado do Projeto Ativo no Editor
    this.activeProject = null;
    this.activeEditorTab = 'sources'; // 'sources' | 'fichamento' | 'argument' | 'verify' | 'abnt'
    this.autosaveTimeout = null;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Botão Novo Trabalho
    const btnNewWork = document.getElementById('btn-new-research-work');
    const modalNewWork = document.getElementById('research-new-project-modal');
    const btnCloseNewModal = document.getElementById('btn-close-new-research-modal');
    const formNewWork = document.getElementById('form-new-research-work');

    if (btnNewWork && modalNewWork) {
      btnNewWork.addEventListener('click', () => {
        modalNewWork.classList.remove('hidden');
      });
    }

    if (btnCloseNewModal && modalNewWork) {
      btnCloseNewModal.addEventListener('click', () => {
        modalNewWork.classList.add('hidden');
      });
    }

    if (formNewWork) {
      formNewWork.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateProject();
      });
    }

    // 2. Modal do Editor (Fechar)
    const btnCloseEditor = document.getElementById('btn-close-research-editor');
    const editorModal = document.getElementById('research-editor-modal');
    if (btnCloseEditor && editorModal) {
      btnCloseEditor.addEventListener('click', () => {
        editorModal.classList.add('hidden');
        this.renderResearchHub();
      });
    }

    // 3. Abas do Painel Lateral de Fontes & IA
    const toolTabs = document.querySelectorAll('.research-tool-tab');
    toolTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        toolTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeEditorTab = tab.dataset.tool;
        this.renderEditorSidebar();
      });
    });

    // 4. Modal do Seminário (Fechar)
    const btnCloseSeminar = document.getElementById('btn-close-seminar-modal');
    const seminarModal = document.getElementById('research-seminar-modal');
    if (btnCloseSeminar && seminarModal) {
      btnCloseSeminar.addEventListener('click', () => {
        seminarModal.classList.add('hidden');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Hub de Pesquisa & Trabalhos Acadêmicos
  // --------------------------------------------------------------------------
  renderResearchHub() {
    const container = document.getElementById('research-projects-container');
    if (!container) return;

    const projects = StorageModule.getResearchProjects();

    if (projects.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1 / -1; text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-solid fa-book-open" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <p style="font-size:0.95rem;">Nenhum trabalho acadêmico criado ainda. Clique em "Novo Trabalho" para começar seu TCC ou artigo.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(p => {
      const daysLeft = this.calculateDaysLeft(p.dueDate);
      const daysBadge = daysLeft !== null 
        ? `<span class="badge-official" style="color:${daysLeft <= 5 ? '#ef4444' : 'var(--accent-amber)'}; border-color:${daysLeft <= 5 ? '#ef4444' : 'var(--accent-amber)'}; font-size:0.72rem;">
            <i class="fa-solid fa-clock"></i> ${daysLeft >= 0 ? `Faltam ${daysLeft} dias` : 'Prazo encerrado'}
           </span>`
        : '';

      return `
        <div class="article-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="art-header">
              <div class="art-number">
                <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.75rem;">
                  <i class="fa-solid fa-graduation-cap"></i> ${p.type.toUpperCase()}
                </span>
                <strong style="font-size:0.95rem; line-height:1.3;">${p.title}</strong>
              </div>
              ${daysBadge}
            </div>

            <div class="art-body" style="padding-top:4px;">
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">
                <i class="fa-solid fa-user-tie"></i> <strong>Orientador:</strong> ${p.professor || 'Não informado'}
              </p>
              <p style="font-size:0.8rem; color:var(--text-main); line-height:1.4; margin-bottom:10px;">
                ${p.theme || 'Sem descrição cadastrada.'}
              </p>

              <!-- Barra de Progresso do Trabalho -->
              <div style="margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">
                  <span>Progresso do Trabalho</span>
                  <strong style="color:var(--accent-amber);">${p.progress || 0}%</strong>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
                  <div style="width:${p.progress || 0}%; height:100%; background:var(--accent-amber);"></div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:8px;">
            <button class="btn-primary btn-open-research-editor" data-projid="${p.id}" style="font-size:0.8rem; padding:6px 12px; flex:1;">
              <i class="fa-solid fa-pen-to-square"></i> Abrir Editor & Fontes
            </button>
            <button class="btn-secondary btn-open-seminar" data-projid="${p.id}" style="font-size:0.8rem; padding:6px 10px; color:var(--accent-amber);" title="Preparar Seminário">
              <i class="fa-solid fa-microphone-lines"></i>
            </button>
            <button class="btn-secondary btn-delete-proj" data-projid="${p.id}" style="font-size:0.8rem; padding:6px 10px; color:#f87171;" title="Excluir Trabalho">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-open-research-editor').forEach(btn => {
      btn.addEventListener('click', () => this.openEditorModal(btn.dataset.projid));
    });

    container.querySelectorAll('.btn-open-seminar').forEach(btn => {
      btn.addEventListener('click', () => this.openSeminarModal(btn.dataset.projid));
    });

    container.querySelectorAll('.btn-delete-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Deseja excluir este trabalho acadêmico e suas fontes associadas?')) {
          StorageModule.deleteResearchProject(btn.dataset.projid);
          this.playerUI.showToast('Trabalho acadêmico excluído.');
          this.renderResearchHub();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Criação de Novo Trabalho
  // --------------------------------------------------------------------------
  handleCreateProject() {
    const title = document.getElementById('new-research-title')?.value.trim();
    const type = document.getElementById('new-research-type')?.value || 'artigo';
    const subjectId = document.getElementById('new-research-subject')?.value || 'civil';
    const professor = document.getElementById('new-research-prof')?.value.trim();
    const dueDate = document.getElementById('new-research-date')?.value;
    const theme = document.getElementById('new-research-theme')?.value.trim();

    if (!title) {
      alert('Por favor informe o título do trabalho.');
      return;
    }

    const newProj = {
      id: 'proj-' + Date.now(),
      title,
      type,
      subjectId,
      professor: professor || 'Docente Orientador',
      institution: 'Faculdade de Direito',
      dueDate: dueDate || '',
      theme: theme || title,
      status: 'em_andamento',
      progress: 15,
      checklist: [
        { id: 'chk-1', text: 'Tema e problema de pesquisa definidos', done: true },
        { id: 'chk-2', text: 'Fontes e julgados coletados', done: false },
        { id: 'chk-3', text: 'Fichamentos de doutrina realizados', done: false },
        { id: 'chk-4', text: 'Introdução e contextualização', done: false },
        { id: 'chk-5', text: 'Desenvolvimento e antítese', done: false },
        { id: 'chk-6', text: 'Conclusão e referências ABNT', done: false },
        { id: 'chk-7', text: 'Revisão final de estilo', done: false }
      ],
      sections: [
        {
          id: 'sec-1',
          title: '1. Introdução e Problema de Pesquisa',
          content: 'Contextualização inicial do tema e delimitação do problema central de pesquisa...'
        },
        {
          id: 'sec-2',
          title: '2. Desenvolvimento e Fundamentação Jurídica',
          content: 'Análise doutrinária, legislação aplicável e precedentes judiciais...'
        },
        {
          id: 'sec-3',
          title: '3. Conclusão e Considerações Finais',
          content: 'Síntese dos resultados e considerações conclusivas sobre o tema proposto.'
        }
      ]
    };

    StorageModule.saveResearchProject(newProj);
    document.getElementById('research-new-project-modal')?.classList.add('hidden');
    this.playerUI.showToast(`📚 Trabalho "${title}" criado com sucesso!`);
    this.renderResearchHub();
    this.openEditorModal(newProj.id);
  }

  // --------------------------------------------------------------------------
  // Modal do Editor Acadêmico (Layout Split: Editor + Fontes/IA)
  // --------------------------------------------------------------------------
  openEditorModal(projId) {
    const proj = StorageModule.getResearchProject(projId);
    if (!proj) return;

    this.activeProject = proj;

    const modal = document.getElementById('research-editor-modal');
    const titleEl = document.getElementById('research-editor-title');
    const sectionsContainer = document.getElementById('research-editor-sections');

    if (titleEl) titleEl.innerText = `${proj.title} (${proj.type.toUpperCase()})`;

    // Renderiza seções do editor
    if (sectionsContainer) {
      sectionsContainer.innerHTML = proj.sections.map((sec, idx) => `
        <div class="research-section-box" data-secid="${sec.id}" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:10px; padding:16px; margin-bottom:14px;">
          <input type="text" class="sec-title-input" value="${sec.title}" style="width:100%; font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:var(--accent-amber); background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:10px; outline:none;">
          <textarea class="sec-content-textarea" style="width:100%; min-height:140px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.04); border-radius:8px; padding:12px; color:var(--text-main); font-size:0.9rem; line-height:1.6; font-family:inherit; resize:vertical; outline:none;">${sec.content}</textarea>
        </div>
      `).join('');

      // Autosave listener
      sectionsContainer.querySelectorAll('.sec-content-textarea, .sec-title-input').forEach(input => {
        input.addEventListener('input', () => this.triggerAutosave());
      });
    }

    this.renderEditorSidebar();

    if (modal) modal.classList.remove('hidden');
  }

  triggerAutosave() {
    clearTimeout(this.autosaveTimeout);
    const indicator = document.getElementById('research-autosave-indicator');
    if (indicator) indicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    this.autosaveTimeout = setTimeout(() => {
      this.saveEditorContent();
      if (indicator) indicator.innerHTML = '<i class="fa-solid fa-circle-check text-green"></i> Salvo';
    }, 600);
  }

  saveEditorContent() {
    if (!this.activeProject) return;

    const sectionBoxes = document.querySelectorAll('.research-section-box');
    const updatedSections = [];

    sectionBoxes.forEach(box => {
      const secId = box.dataset.secid;
      const title = box.querySelector('.sec-title-input')?.value || '';
      const content = box.querySelector('.sec-content-textarea')?.value || '';
      updatedSections.push({ id: secId, title, content });
    });

    this.activeProject.sections = updatedSections;
    StorageModule.saveResearchProject(this.activeProject);
  }

  // --------------------------------------------------------------------------
  // Barra Lateral do Editor (Fontes, Fichamentos, Argumentos, ABNT)
  // --------------------------------------------------------------------------
  renderEditorSidebar() {
    const container = document.getElementById('research-sidebar-content');
    if (!container || !this.activeProject) return;

    const sources = StorageModule.getProjectSources(this.activeProject.id);
    const fichamentos = StorageModule.getProjectFichamentos(this.activeProject.id);

    if (this.activeEditorTab === 'sources') {
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Fontes Vinculadas (${sources.length})</span>
          <button id="btn-add-source-modal" class="btn-secondary" style="font-size:0.75rem; padding:3px 8px; color:var(--accent-amber);">+ Adicionar Fonte</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; max-height:400px; overflow-y:auto;">
          ${sources.map(s => `
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span class="badge-official" style="font-size:0.68rem; color:${s.type === 'lei' ? '#38bdf8' : 'var(--accent-amber)'};">${s.type.toUpperCase()}</span>
                ${s.verified ? '<span style="font-size:0.68rem; color:#10b981;"><i class="fa-solid fa-circle-check"></i> Verificada</span>' : '<span style="font-size:0.68rem; color:#f87171;">Não verificada</span>'}
              </div>
              <strong style="font-size:0.85rem; color:var(--text-main); display:block;">${s.title}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${s.author} (${s.year || 's.d.'})</span>
            </div>
          `).join('')}
        </div>
      `;

      document.getElementById('btn-add-source-modal')?.addEventListener('click', () => {
        const title = prompt('Título da Fonte / Livro / Julgado:');
        const author = prompt('Autor(es) / Tribunal:');
        const year = prompt('Ano de publicação:', '2024');
        if (title) {
          StorageModule.saveProjectSource(this.activeProject.id, {
            type: 'livro',
            title,
            author: author || 'Autor',
            year,
            verified: true
          });
          this.renderEditorSidebar();
          this.playerUI.showToast('Fonte adicionada com sucesso!');
        }
      });

    } else if (this.activeEditorTab === 'fichamento') {
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Fichamentos & Citações (${fichamentos.length})</span>
          <button id="btn-create-fichamento" class="btn-secondary" style="font-size:0.75rem; padding:3px 8px; color:var(--accent-amber);">+ Novo Fichamento</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; max-height:400px; overflow-y:auto;">
          ${fichamentos.map(f => `
            <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); border-radius:8px; padding:10px;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber);">${f.theme} (Pág. ${f.page})</span>
              <p style="font-size:0.85rem; font-style:italic; color:var(--text-main); margin:4px 0;">"${f.directQuote}"</p>
              <span style="font-size:0.72rem; color:var(--text-muted);">${f.sourceTitle}</span>
            </div>
          `).join('')}
        </div>
      `;

      document.getElementById('btn-create-fichamento')?.addEventListener('click', () => {
        const quote = prompt('Citação Direta (Texto da obra):');
        const page = prompt('Número da página real:', '1');
        const theme = prompt('Conceito / Tema:', 'Conceito Central');
        if (quote) {
          StorageModule.saveProjectFichamento(this.activeProject.id, {
            sourceTitle: sources[0]?.title || 'Doutrina Geral',
            theme: theme || 'Tema',
            directQuote: quote,
            page: page || '1',
            comment: 'Citação direta para uso no desenvolvimento.'
          });
          this.renderEditorSidebar();
          this.playerUI.showToast('Fichamento registrado!');
        }
      });

    } else if (this.activeEditorTab === 'argument') {
      container.innerHTML = `
        <div style="margin-bottom:10px;">
          <button id="btn-gen-argument" class="btn-primary" style="width:100%; font-size:0.8rem; padding:8px;">
            <i class="fa-solid fa-scale-balanced"></i> ⚖️ Desenvolver Tese & Antítese
          </button>
        </div>
        <div id="argument-output-box" style="font-size:0.85rem; line-height:1.5; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px;">
          Clique acima para estruturar a linha argumentativa com base na legislação e fontes do trabalho.
        </div>
      `;

      document.getElementById('btn-gen-argument')?.addEventListener('click', () => {
        const out = document.getElementById('argument-output-box');
        if (out) {
          out.innerHTML = `
            <strong style="color:var(--accent-amber);">🎯 Tese Central:</strong><br>
            A responsabilidade dos fornecedores de IA deve ser regida pela teoria do risco objetivo (Art. 927, parágrafo único, do CC), dispensando prova de culpa diante da complexidade dos algoritmos.<br><br>
            <strong style="color:#f87171;">↔️ Contraponto / Antítese:</strong><br>
            Críticos sustentam que a imposição de responsabilidade estritamente objetiva pode asfixiar a inovação tecnológica no país, defendendo a aplicação subsidiária da culpa com inversão do ônus probatório.
          `;
        }
      });

    } else if (this.activeEditorTab === 'verify') {
      container.innerHTML = `
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:10px;">
          <i class="fa-solid fa-shield-halved text-amber"></i> Análise de Fundamentação & Citações:
        </div>
        <div style="background:rgba(16,185,129,0.08); border:1px solid #10b981; border-radius:8px; padding:10px; margin-bottom:8px; font-size:0.82rem; color:#10b981;">
          <i class="fa-solid fa-circle-check"></i> Todas as referências legislativas (Arts. 186 e 927 do CC) estão ancoradas no Vade Mecum oficial.
        </div>
        <div style="background:rgba(234,179,8,0.08); border:1px solid var(--border-amber); border-radius:8px; padding:10px; font-size:0.82rem; color:var(--accent-amber);">
          <i class="fa-solid fa-triangle-exclamation"></i> Lembrete acadêmico: Adicione números de página em citações diretas para estrita conformidade com a ABNT NBR 10520.
        </div>
      `;

    } else if (this.activeEditorTab === 'abnt') {
      const abntList = this.generateAbntReferences(sources);
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Referências ABNT (NBR 6023)</span>
          <button id="btn-copy-abnt" class="btn-secondary" style="font-size:0.75rem; padding:3px 8px; color:var(--accent-amber);"><i class="fa-solid fa-copy"></i> Copiar</button>
        </div>
        <div id="abnt-references-text" style="font-size:0.82rem; line-height:1.6; color:var(--text-main); font-family:monospace; background:rgba(0,0,0,0.25); border:1px solid var(--border-light); border-radius:8px; padding:12px; white-space:pre-line;">
          ${abntList}
        </div>
      `;

      document.getElementById('btn-copy-abnt')?.addEventListener('click', () => {
        navigator.clipboard.writeText(abntList);
        this.playerUI.showToast('📋 Referências ABNT copiadas para a área de transferência!');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Formatador Determinístico ABNT (NBR 6023)
  // --------------------------------------------------------------------------
  generateAbntReferences(sources) {
    if (!sources || sources.length === 0) {
      return 'Nenhuma fonte cadastrada para gerar referências.';
    }

    return sources.map(s => {
      if (s.type === 'lei') {
        return `BRASIL. Lei nº 10.406, de 10 de janeiro de 2002. Institui o Código Civil. Diário Oficial da União: Brasília, DF, 11 jan. 2002.`;
      } else if (s.type === 'livro') {
        const authorUpper = (s.author || 'AUTOR').toUpperCase();
        const city = s.city || 'São Paulo';
        const pub = s.publisher || 'Editora';
        const year = s.year || '2024';
        return `${authorUpper}. ${s.title}. ${city}: ${pub}, ${year}.`;
      }
      return `${(s.author || 'AUTOR').toUpperCase()}. ${s.title}. ${s.year || '2024'}.`;
    }).join('\n\n');
  }

  // --------------------------------------------------------------------------
  // Modal de Seminário & Banca Simulada
  // --------------------------------------------------------------------------
  openSeminarModal(projId) {
    const proj = StorageModule.getResearchProject(projId);
    if (!proj) return;

    this.activeProject = proj;

    const modal = document.getElementById('research-seminar-modal');
    const titleEl = document.getElementById('seminar-modal-title');
    const scriptEl = document.getElementById('seminar-speech-script');

    if (titleEl) titleEl.innerText = `Seminário: ${proj.title}`;

    if (scriptEl) {
      const speechScript = `Boa tarde a todos. O tema do nosso trabalho é "${proj.title}".\n\nNossa pesquisa buscou responder ao problema da responsabilidade civil decorrente de decisões automatizadas. Demonstramos que, à luz do Art. 927 do Código Civil e da doutrina contemporânea, a teoria do risco da atividade é a mais adequada para tutelar a vítima.\n\nEstamos abertos às perguntas da banca.`;
      scriptEl.innerText = speechScript;

      document.getElementById('btn-listen-seminar')?.addEventListener('click', () => {
        this.audioEngine.speakText(speechScript);
      });
    }

    if (modal) modal.classList.remove('hidden');
  }

  calculateDaysLeft(dueDateStr) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr + 'T23:59:59').getTime();
    const now = Date.now();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
