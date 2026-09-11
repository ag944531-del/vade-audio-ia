/**
 * VadeAudio AI - SmartReadingEngine (Etapa 33)
 * Controlador de Interface do Modo Leitura Inteligente & Modo Foco:
 * Paginação, Menu Contextual, Popover de Artigos, Glossário Lateral, Active Recall e Customização Visual.
 */

class SmartReadingEngine {
  constructor(sessionService, progressService) {
    this.sessionService = sessionService || (typeof window !== 'undefined' ? window.smartReadingSessionService : null);
    this.progressService = progressService || (typeof window !== 'undefined' ? window.readingProgressService : null);

    // Estado da view
    this.currentDocument = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.pagesData = [];
    this.activeSideTab = 'tutor'; // 'tutor' | 'notes' | 'glossary' | 'recall'
    this.activeMode = 'text'; // 'text' | 'pdf'

    // Mock inicial de documento de estudo caso nenhum seja aberto
    this.defaultDocument = {
      id: 'doc_tutela_cpc_2026',
      title: 'Manual Prático de Tutelas Provisórias e Medidas Cautelares',
      author: 'Prof. Dr. Roberto Farias',
      totalPages: 12,
      pages: [
        {
          pageNumber: 1,
          title: 'Capítulo I — Teoria Geral das Tutelas Provisórias',
          content: `As tutelas provisórias representam um dos maiores avanços do Código de Processo Civil de 2015 (Lei nº 13.105/2015).\n\nFundamentadas na necessidade de combater o tempo deletério do processo e conferir efetividade imediata aos direitos, as tutelas provisórias dividem-se em Tutela de Urgência (antecipada ou cautelar) e Tutela da Evidência, conforme expressamente disciplinado no Art. 294 CPC.\n\nA concessão da medida de urgência depende da estrita demonstração cumulativa da probabilidade do direito (fumus boni iuris) e do perigo de dano ou risco ao resultado útil do processo (periculum in mora), nos termos do Art. 300 CPC.\n\nAdemais, vigora no sistema processual o princípio da não-surpresa, obstando que o magistrado decida sem prévia oportunidade de manifestação das partes, ressalvadas as liminares expressamente autorizadas.`
        },
        {
          pageNumber: 2,
          title: 'Capítulo II — Requisitos e Reversibilidade da Medida',
          content: `O parágrafo 3º do Art. 300 CPC estabelece uma limitação material imperativa: a tutela de urgência de natureza antecipada não será concedida quando houver perigo de irreversibilidade dos efeitos da decisão.\n\nA preclusão temporal e lógica impede a reiteração infundada de pedidos já apreciados pelo juízo, ressalvada a superveniência de fatos novos que alterem o quadro fático.\n\nNos casos de responsabilidade civil extracontratual disciplinados pelo Art. 186 CC e Art. 927 CC, a antecipação de alimentos provisionais ou custeio de tratamento médico de urgência constitui hipótese típica de incidência da tutela provisória.`
        },
        {
          pageNumber: 3,
          title: 'Capítulo III — Da Tutela da Evidência e Precedentes',
          content: `Diferentemente das medidas de urgência, a tutela da evidência prescinde da demonstração de perigo de dano ou risco ao resultado útil (Art. 311 CPC).\n\nSua concessão repousa na certeza e na evidência do direito, como nos casos em que as alegações de fato estiverem comprovadas documentalmente e houver tese firmada em julgamento de casos repetitivos pelo STJ ou em súmula vinculante do STF.\n\nA litispendência e a coisa julgada impedem a repropositura da mesma demanda, devendo o réu alegar tais matérias em preliminar de contestação sob pena de preclusão.`
        },
        {
          pageNumber: 4,
          title: 'Capítulo IV — Procedimento Cautelar Antecedente e Incidental',
          content: `A tutela provisória pode ser requerida em caráter antecedente ou incidental ao processo principal.\n\nQuando requerida em caráter antecedente, o autor limita-se ao requerimento da tutela e à indicação sumária do direito, devendo aditar a petição inicial no prazo de 15 dias após a efetivação da medida liminar.\n\nO não comparecimento do réu ou o descumprimento injustificado de ordem judicial autoriza o juiz a decretar medidas executivas coercitivas atípicas com amparo no Art. 139 do CPC.`
        },
        {
          pageNumber: 5,
          title: 'Capítulo V — Recorribilidade e Agravo de Instrumento',
          content: `As decisões interlocutórias que versarem sobre tutelas provisórias são impugnáveis de imediato mediante o Recurso de Agravo de Instrumento, conforme expressa disposição do Art. 1015 CPC.\n\nO tribunal apreciará o pedido de efeito suspensivo ou de antecipação da tutela recursal formulado pelo agravante, garantindo a rápida revisão de decisões lesivas.\n\nNo processo penal, analogamente, as medidas cautelares diversas da prisão previstas no Art. 319 CPP observam critérios de proporcionalidade e estrita necessidade.`
        }
      ]
    };

    this.bindEvents();
  }

  bindEvents() {
    // Interações de seleção de texto
    document.addEventListener('selectionchange', () => this.handleTextSelection());
  }

  // --------------------------------------------------------------------------
  // Abertura do Modo Leitura Inteligente
  // --------------------------------------------------------------------------
  openDocument(documentData = null, targetPage = null) {
    const doc = documentData || this.defaultDocument;
    this.currentDocument = doc;
    this.pagesData = doc.pages || [
      { pageNumber: 1, title: doc.title, content: doc.content || 'Conteúdo do documento disponível para leitura ativa e estudo guiado.' }
    ];
    this.totalPages = doc.totalPages || this.pagesData.length;

    // Inicializa motor de sessão
    if (this.sessionService) {
      this.sessionService.setDocument(doc);
    }

    // Inicializa serviço de progresso e verifica retomada
    let resumePage = targetPage || 1;
    if (this.progressService) {
      const resumeInfo = this.progressService.checkResumePoint(doc.id);
      if (!targetPage && resumeInfo.canResume) {
        resumePage = resumeInfo.page;
      }
      this.progressService.startSession(doc.id, this.totalPages, { forcePage: resumePage });
    }

    this.currentPage = resumePage;
    this.renderReadingView();
  }

  // --------------------------------------------------------------------------
  // Renderização Principal do Modo Leitura & Modo Foco
  // --------------------------------------------------------------------------
  renderReadingView() {
    const container = document.getElementById('reading-mode-content-container');
    if (!container) return;

    const pageObj = this.pagesData.find(p => p.pageNumber === this.currentPage) || this.pagesData[0];
    const rawContent = pageObj ? pageObj.content : '';
    
    // Processa o texto inserindo destaque nos termos jurídicos e referências
    let processedHtml = rawContent.replace(/\n\n/g, '</p><p class="reading-paragraph">').replace(/\n/g, '<br>');
    processedHtml = `<p class="reading-paragraph">${processedHtml}</p>`;
    
    if (this.sessionService) {
      processedHtml = this.sessionService.highlightLegalTerms(processedHtml);
    }

    const progressData = this.progressService ? this.progressService.calculateProgress() : { progressPercent: 0, verifiedPercent: 0 };
    const prefs = this.sessionService ? this.sessionService.readingPreferences : { fontSize: 16, lineHeight: 1.6, theme: 'dark' };

    container.innerHTML = `
      <!-- Top Bar de Leitura Modo Foco -->
      <div class="reading-top-bar" style="display:flex; justify-content:space-between; align-items:center; padding:12px 18px; background:var(--bg-card); border-bottom:1px solid var(--border-light); border-radius:12px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <button id="btn-reading-exit" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" title="Sair do Modo Leitura">
            <i class="fa-solid fa-arrow-left"></i> Voltar
          </button>
          <div>
            <h3 style="font-family:var(--font-display); font-size:1.05rem; color:var(--text-main); margin:0;">${this.currentDocument.title}</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">${pageObj.title || `Página ${this.currentPage}`}</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <!-- Progresso -->
          <span class="badge-official" style="font-size:0.75rem; color:var(--accent-amber); border-color:var(--accent-amber);">
            Página ${this.currentPage} de ${this.totalPages} (${progressData.progressPercent}%)
          </span>

          <!-- Ouvir com ElevenLabs -->
          <button id="btn-reading-listen" class="btn-primary" style="padding:6px 14px; font-size:0.82rem;" title="Ouvir página com voz neural ElevenLabs (Marcos)">
            <i class="fa-solid fa-volume-high"></i> Ouvir Página
          </button>

          <!-- Marcador / Bookmark -->
          <button id="btn-reading-bookmark" class="btn-secondary" style="padding:6px 10px; font-size:0.82rem;" title="Marcar página">
            <i class="fa-solid fa-bookmark"></i>
          </button>

          <!-- Alternar Painel Lateral -->
          <button id="btn-toggle-reading-drawer" class="btn-secondary" style="padding:6px 10px; font-size:0.82rem;" title="Abrir Assistente de Estudo">
            <i class="fa-solid fa-wand-magic-sparkles text-amber"></i>
          </button>
        </div>
      </div>

      <!-- Layout Split: Documento Central + Gaveta Lateral de Estudo -->
      <div style="display:grid; grid-template-columns: minmax(0, 1fr) 360px; gap:20px; align-items:start;" id="reading-split-grid">
        
        <!-- Coluna 1: Conteúdo do Livro / Documento -->
        <div class="reading-document-card" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:32px 38px; min-height:550px; font-size:${prefs.fontSize}px; line-height:${prefs.lineHeight}; position:relative;">
          
          <!-- Banner de Retomada de Leitura -->
          ${this.currentPage > 1 ? `
            <div style="background:rgba(245,158,11,0.08); border:1px solid var(--border-amber); border-radius:8px; padding:8px 12px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;">
              <span><i class="fa-solid fa-clock-rotate-left text-amber"></i> Leitura retomada na <strong>Página ${this.currentPage}</strong></span>
              <button id="btn-reading-restart" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem;">Reiniciar do início</button>
            </div>
          ` : ''}

          <!-- Texto Formatado da Página -->
          <div id="reading-page-text-content" style="color:var(--text-main); font-family:var(--font-family); user-select:text;">
            ${processedHtml}
          </div>

          <!-- Barra Inferior de Paginação -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06);">
            <button id="btn-reading-prev-page" class="btn-secondary" ${this.currentPage <= 1 ? 'disabled style="opacity:0.4;"' : ''}>
              <i class="fa-solid fa-arrow-left"></i> Página Anterior
            </button>
            <span style="font-size:0.85rem; color:var(--text-muted);">
              Página <strong>${this.currentPage}</strong> de ${this.totalPages}
            </span>
            <button id="btn-reading-next-page" class="btn-primary">
              Próxima Página <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Coluna 2: Assistente Lateral de Estudo & Tutor -->
        <div id="reading-side-drawer" style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px; height:calc(100vh - 200px); position:sticky; top:20px; overflow-y:auto;">
          
          <!-- Abas da Gaveta -->
          <div style="display:flex; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
            <button class="chapter-btn reading-side-tab active" data-tab="tutor" style="font-size:0.75rem; padding:5px 8px;"><i class="fa-solid fa-robot"></i> Tutor</button>
            <button class="chapter-btn reading-side-tab" data-tab="notes" style="font-size:0.75rem; padding:5px 8px;"><i class="fa-solid fa-highlighter"></i> Grifos & Notas</button>
            <button class="chapter-btn reading-side-tab" data-tab="glossary" style="font-size:0.75rem; padding:5px 8px;"><i class="fa-solid fa-book-bookmark"></i> Glossário</button>
            <button class="chapter-btn reading-side-tab" data-tab="recall" style="font-size:0.75rem; padding:5px 8px;"><i class="fa-solid fa-brain"></i> Recall</button>
          </div>

          <!-- Conteúdo Dinâmico da Aba Lateral -->
          <div id="reading-side-tab-content" style="flex:1;">
            ${this.renderSideTabContent(this.activeSideTab)}
          </div>
        </div>
      </div>

      <!-- Menu Contextual Flutuante (Aparece ao Selecionar Texto) -->
      <div id="reading-selection-menu" class="hidden" style="position:fixed; background:#181d28; border:1px solid var(--border-amber); border-radius:10px; padding:6px; box-shadow:0 8px 30px rgba(0,0,0,0.7); z-index:99999; display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
        <button class="btn-secondary btn-action-explain" style="padding:4px 8px; font-size:0.75rem;" title="Explicar trecho com IA"><i class="fa-solid fa-robot text-amber"></i> Explicar</button>
        <button class="btn-secondary btn-action-summarize" style="padding:4px 8px; font-size:0.75rem;" title="Resumir seleção"><i class="fa-solid fa-file-lines"></i> Resumir</button>
        <button class="btn-secondary btn-action-speak" style="padding:4px 8px; font-size:0.75rem;" title="Ouvir seleção"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
        <button class="btn-secondary btn-action-highlight" data-cat="Importante" style="padding:4px 8px; font-size:0.75rem; color:#f59e0b;" title="Grifar Importante"><i class="fa-solid fa-highlighter"></i> Grifar</button>
        <button class="btn-secondary btn-action-note" style="padding:4px 8px; font-size:0.75rem;" title="Criar Anotação / Salvar no Caderno"><i class="fa-solid fa-note-sticky"></i> Anotar</button>
        <button class="btn-secondary btn-action-flashcard" style="padding:4px 8px; font-size:0.75rem;" title="Criar Flashcard"><i class="fa-solid fa-layer-group"></i> Flashcard</button>
      </div>

      <!-- Modal de Prévia Rápida de Artigo Citado (Legal Reference Preview) -->
      <div id="legal-ref-preview-modal" class="modal-backdrop hidden">
        <div class="modal-card" style="max-width:580px; width:92%; background:var(--bg-card); border:1px solid var(--border-amber); padding:22px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="law-code-tag" id="ref-modal-code">CPC</span>
              <strong id="ref-modal-art-title" style="font-size:1.1rem; color:var(--text-main);">Art. 300</strong>
            </div>
            <button id="btn-close-legal-ref-modal" class="btn-icon"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p id="ref-modal-text" style="font-size:0.9rem; line-height:1.5; color:var(--text-main); background:rgba(255,255,255,0.03); padding:14px; border-radius:8px; border:1px solid var(--border-light);"></p>
          <div id="ref-modal-explanation-box" style="margin-top:10px; background:rgba(245,158,11,0.06); border-left:3px solid var(--accent-amber); padding:10px 14px; border-radius:4px;">
            <strong style="color:var(--accent-amber); font-size:0.78rem;"><i class="fa-solid fa-chalkboard-user"></i> Dica do Professor:</strong>
            <p id="ref-modal-explanation" style="font-size:0.82rem; color:var(--text-main); margin:4px 0 0 0;"></p>
          </div>
        </div>
      </div>

      <!-- Modal de Conclusão / Resumo da Sessão de Leitura -->
      <div id="reading-session-summary-modal" class="modal-backdrop hidden">
        <div class="modal-card" style="max-width:500px; width:92%; background:var(--bg-card); text-align:center; padding:26px;">
          <div style="width:60px; height:60px; border-radius:50%; background:rgba(16,185,129,0.15); color:#10b981; font-size:1.8rem; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 style="font-family:var(--font-display); font-size:1.3rem; color:var(--text-main); margin-bottom:6px;">Sessão de Leitura Concluída!</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:18px;">Parabéns! Sua sessão foi computada na sua meta diária de estudos.</p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:left; margin-bottom:20px;">
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:10px 14px;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Páginas Lidas</span>
              <strong id="summary-pages-count" style="display:block; font-size:1.2rem; color:var(--accent-amber); font-family:var(--font-display);">0</strong>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:10px 14px;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Tempo Ativo</span>
              <strong id="summary-minutes-count" style="display:block; font-size:1.2rem; color:#38bdf8; font-family:var(--font-display);">0 min</strong>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:10px 14px;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Grifos Realizados</span>
              <strong id="summary-highlights-count" style="display:block; font-size:1.2rem; color:#10b981; font-family:var(--font-display);">0</strong>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:10px 14px;">
              <span style="font-size:0.75rem; color:var(--text-muted);">Active Recall</span>
              <strong id="summary-recall-count" style="display:block; font-size:1.2rem; color:#a855f7; font-family:var(--font-display);">100%</strong>
            </div>
          </div>

          <button id="btn-close-session-summary" class="btn-primary" style="width:100%;">
            <i class="fa-solid fa-arrow-left"></i> Retornar ao Hub
          </button>
        </div>
      </div>
    `;

    this.attachDomEvents();
  }

  // --------------------------------------------------------------------------
  // Conteúdo das Abas do Painel Lateral
  // --------------------------------------------------------------------------
  renderSideTabContent(tab) {
    if (tab === 'tutor') {
      return `
        <div style="display:flex; flex-direction:column; height:100%;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; margin-bottom:10px;">
            <strong style="font-size:0.8rem; color:var(--accent-amber);"><i class="fa-solid fa-robot"></i> Tutor no Documento</strong>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:2px 0 0 0;">Selecione qualquer trecho da página ou digite sua dúvida jurídica sobre o texto.</p>
          </div>
          <div id="reading-tutor-dialog" style="flex:1; min-height:180px; overflow-y:auto; font-size:0.82rem; line-height:1.4; color:var(--text-main); padding:6px;">
            <p style="color:var(--text-muted); font-style:italic;">Nenhum trecho selecionado no momento. Experimente selecionar um parágrafo ao lado para ver a explicação.</p>
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <input type="text" id="input-reading-tutor" placeholder="Dúvida sobre a página..." style="flex:1; padding:7px 10px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-light); color:var(--text-main); font-size:0.78rem;">
            <button id="btn-send-reading-tutor" class="btn-primary" style="padding:7px 12px; font-size:0.8rem;"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      `;
    } else if (tab === 'notes') {
      const highlights = this.sessionService && this.sessionService.storage ? this.sessionService.storage.getReadingHighlights(this.currentDocument?.id) : [];
      return `
        <div>
          <strong style="font-size:0.8rem; color:var(--text-main); display:block; margin-bottom:8px;">Grifos e Anotações (${highlights.length})</strong>
          ${highlights.length === 0 ? `
            <p style="font-size:0.75rem; color:var(--text-muted);">Você ainda não fez grifos nesta obra. Selecione um trecho e clique em "Grifar" ou "Anotar".</p>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${highlights.map(h => `
                <div style="background:rgba(255,255,255,0.02); border-left:3px solid var(--accent-amber); padding:8px 10px; border-radius:6px; font-size:0.78rem;">
                  <span style="color:var(--accent-amber); font-size:0.7rem; font-weight:700;">Página ${h.page} • ${h.category}</span>
                  <p style="margin:4px 0; color:var(--text-main);">"${h.text}"</p>
                  ${h.note ? `<p style="color:var(--text-muted); font-size:0.72rem; margin:0;"><i class="fa-solid fa-comment"></i> ${h.note}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    } else if (tab === 'glossary') {
      const terms = this.sessionService && this.sessionService.storage ? this.sessionService.storage.getReadingGlossaryTerms() : [];
      return `
        <div>
          <strong style="font-size:0.8rem; color:var(--text-main); display:block; margin-bottom:8px;">Meu Glossário Jurídico</strong>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${terms.map(t => `
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); padding:8px 10px; border-radius:6px;">
                <strong style="font-size:0.8rem; color:var(--accent-amber); display:block;">${t.term}</strong>
                <p style="font-size:0.75rem; color:var(--text-main); margin:2px 0 4px 0;">${t.definition}</p>
                <span style="font-size:0.68rem; color:var(--text-muted);"><i class="fa-solid fa-book"></i> ${t.source}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tab === 'recall') {
      const pageObj = this.pagesData.find(p => p.pageNumber === this.currentPage);
      const recall = this.sessionService ? this.sessionService.getActiveRecallQuestion(pageObj ? pageObj.content : '') : null;
      return `
        <div>
          <div style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; margin-bottom:10px;">
            <strong style="font-size:0.8rem; color:#c084fc;"><i class="fa-solid fa-brain"></i> Active Recall da Página ${this.currentPage}</strong>
            <p style="font-size:0.75rem; color:var(--text-main); margin:4px 0 0 0;">${recall?.question || 'Qual é o conceito central desta página?'}</p>
          </div>
          <div id="recall-answer-box" class="hidden" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); border-radius:8px; padding:10px; font-size:0.78rem; color:var(--text-main); margin-bottom:10px;">
            <strong style="color:#10b981; display:block; margin-bottom:4px;"><i class="fa-solid fa-check"></i> Resposta Recomendada:</strong>
            ${recall?.suggestedAnswer || ''}
          </div>
          <button id="btn-reveal-recall-answer" class="btn-primary" style="width:100%; font-size:0.8rem; padding:8px;">
            <i class="fa-solid fa-eye"></i> Revelar Resposta
          </button>
        </div>
      `;
    }
    return '';
  }

  // --------------------------------------------------------------------------
  // Eventos de DOM e Interatividade
  // --------------------------------------------------------------------------
  attachDomEvents() {
    // Paginação
    document.getElementById('btn-reading-next-page')?.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        if (this.progressService) this.progressService.goToPage(this.currentPage + 1);
        this.currentPage++;
        this.renderReadingView();
      }
    });

    document.getElementById('btn-reading-prev-page')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        if (this.progressService) this.progressService.goToPage(this.currentPage - 1);
        this.currentPage--;
        this.renderReadingView();
      }
    });

    // Narração ElevenLabs
    document.getElementById('btn-reading-listen')?.addEventListener('click', () => {
      const pageObj = this.pagesData.find(p => p.pageNumber === this.currentPage);
      if (pageObj && this.sessionService) {
        this.sessionService.narratePageText(pageObj.content);
        window.Toast?.success('Reproduzindo página com voz neural ElevenLabs (Marcos).');
      }
    });

    // Abas laterais
    document.querySelectorAll('.reading-side-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reading-side-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSideTab = btn.dataset.tab;
        const tabContainer = document.getElementById('reading-side-tab-content');
        if (tabContainer) tabContainer.innerHTML = this.renderSideTabContent(this.activeSideTab);
        this.attachSideTabEvents();
      });
    });

    // Clique em termos destacados
    document.querySelectorAll('.smart-term-highlight').forEach(el => {
      el.addEventListener('click', (e) => {
        const termKey = el.dataset.term;
        const defObj = this.sessionService ? this.sessionService.getTermDefinition(termKey) : null;
        if (defObj) {
          window.Toast?.info(`📚 ${defObj.term}: ${defObj.def}`);
        }
      });
    });

    // Detecção e clique em referências legais no texto
    const textContentEl = document.getElementById('reading-page-text-content');
    if (textContentEl && this.sessionService) {
      const rawText = textContentEl.innerText;
      const refs = this.sessionService.detectLegalReferences(rawText);
      // Se encontrar artigos como Art. 300 CPC, vincula evento
      refs.forEach(ref => {
        textContentEl.innerHTML = textContentEl.innerHTML.replace(new RegExp(ref.rawText, 'g'), `<a href="#" class="legal-ref-link" data-law="${ref.lawCode}" data-art="${ref.articleNumber}" style="color:var(--accent-amber); font-weight:700; text-decoration:underline;">${ref.rawText}</a>`);
      });

      document.querySelectorAll('.legal-ref-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const law = link.dataset.law;
          const art = link.dataset.art;
          const preview = this.sessionService.getArticlePreview(law, art);
          if (preview) {
            this.openLegalRefModal(preview);
          }
        });
      });
    }

    // Botão Sair do Modo Leitura
    document.getElementById('btn-reading-exit')?.addEventListener('click', () => {
      const summary = this.progressService ? this.progressService.stopSession() : null;
      if (summary) {
        this.showSessionSummaryModal(summary);
      } else {
        window.VadeAudioApp?.switchView('vademecum');
      }
    });

    this.attachSideTabEvents();
  }

  attachSideTabEvents() {
    // Revelar resposta do recall
    document.getElementById('btn-reveal-recall-answer')?.addEventListener('click', () => {
      document.getElementById('recall-answer-box')?.classList.remove('hidden');
    });

    // Chat rápido com o Tutor
    document.getElementById('btn-send-reading-tutor')?.addEventListener('click', () => {
      const input = document.getElementById('input-reading-tutor');
      const text = input?.value.trim();
      if (!text) return;
      
      const dialog = document.getElementById('reading-tutor-dialog');
      if (dialog) {
        dialog.innerHTML += `<div style="margin:6px 0; color:var(--accent-amber);"><strong>Você:</strong> ${text}</div>`;
        dialog.innerHTML += `<div style="margin:6px 0; color:var(--text-main);"><strong>Tutor IA:</strong> Analisando o trecho da página ${this.currentPage}... A aplicação jurídica desse ponto decorre da necessidade de harmonizar a celeridade com as garantias fundamentais do contraditório.</div>`;
        dialog.scrollTop = dialog.scrollHeight;
      }
      if (input) input.value = '';
    });
  }

  openLegalRefModal(preview) {
    const modal = document.getElementById('legal-ref-preview-modal');
    if (!modal) return;
    document.getElementById('ref-modal-code').innerText = preview.lawName;
    document.getElementById('ref-modal-art-title').innerText = preview.articleDisplay;
    document.getElementById('ref-modal-text').innerText = preview.officialText;
    document.getElementById('ref-modal-explanation').innerText = preview.explanation || 'Dispositivo legal oficial do Vade Mecum Digital.';
    modal.classList.remove('hidden');

    document.getElementById('btn-close-legal-ref-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  showSessionSummaryModal(summary) {
    const modal = document.getElementById('reading-session-summary-modal');
    if (!modal) return;
    document.getElementById('summary-pages-count').innerText = summary.pagesReadCount || 1;
    document.getElementById('summary-minutes-count').innerText = `${summary.activeMinutes || 1} min`;
    document.getElementById('summary-highlights-count').innerText = summary.highlightsCount || 0;
    document.getElementById('summary-recall-count').innerText = `${summary.recallCorrectCount || 100}%`;
    modal.classList.remove('hidden');

    document.getElementById('btn-close-session-summary')?.addEventListener('click', () => {
      modal.classList.add('hidden');
      window.VadeAudioApp?.switchView('vademecum');
    });
  }

  // --------------------------------------------------------------------------
  // Gestão de Seleção de Texto e Menu Contextual Flutuante
  // --------------------------------------------------------------------------
  handleTextSelection() {
    const selection = window.getSelection();
    const menu = document.getElementById('reading-selection-menu');
    if (!menu) return;

    if (!selection || selection.isCollapsed || selection.toString().trim().length < 3) {
      menu.classList.add('hidden');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const selectedText = selection.toString().trim();

    // Posiciona o menu logo acima do texto selecionado
    menu.style.top = `${Math.max(10, rect.top - 46 + window.scrollY)}px`;
    menu.style.left = `${Math.max(10, rect.left + (rect.width / 2) - 150)}px`;
    menu.classList.remove('hidden');

    // Ação: Explicar Trecho com Tutor
    menu.querySelector('.btn-action-explain').onclick = () => {
      const exp = this.sessionService ? this.sessionService.explainSelectedText(selectedText, 'faculdade') : null;
      const dialog = document.getElementById('reading-tutor-dialog');
      if (dialog && exp) {
        dialog.innerHTML += `<div style="margin:6px 0; color:var(--accent-amber);"><strong>Trecho selecionado:</strong> "${selectedText.slice(0, 60)}..."</div>`;
        dialog.innerHTML += `<div style="margin:6px 0; color:var(--text-main);"><strong>Tutor (${exp.levelLabel}):</strong> ${exp.explanation}</div>`;
        dialog.scrollTop = dialog.scrollHeight;
      }
      menu.classList.add('hidden');
      window.Toast?.success('Explicação do professor gerada no painel lateral.');
    };

    // Ação: Grifar Trecho
    menu.querySelector('.btn-action-highlight').onclick = () => {
      if (this.sessionService) {
        this.sessionService.createHighlight(selectedText, this.currentPage, 'Importante');
        window.Toast?.success('Trecho grifado e salvo com sucesso.');
      }
      menu.classList.add('hidden');
    };

    // Ação: Ouvir Seleção
    menu.querySelector('.btn-action-speak').onclick = () => {
      if (this.sessionService) {
        this.sessionService.narratePageText(selectedText);
      }
      menu.classList.add('hidden');
    };

    // Ação: Anotar e Enviar ao Caderno
    menu.querySelector('.btn-action-note').onclick = () => {
      const note = prompt('Adicionar anotação para o Caderno Digital:', 'Importante para a prova: ');
      if (note && this.sessionService) {
        this.sessionService.createHighlight(selectedText, this.currentPage, 'Revisar', note);
        this.sessionService.sendAnnotationToNotebook(`"${selectedText}"\n\nNota: ${note}`);
        window.Toast?.success('Anotação vinculada e exportada para o Caderno Digital.');
      }
      menu.classList.add('hidden');
    };
  }
}

if (typeof window !== 'undefined') {
  window.SmartReadingEngine = SmartReadingEngine;
}

if (typeof module !== 'undefined') {
  module.exports = SmartReadingEngine;
}
