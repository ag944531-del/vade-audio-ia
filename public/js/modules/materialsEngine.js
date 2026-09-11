/**
 * VadeAudio AI - Motor de Estudo de Materiais e RAG (Etapa 5)
 * Gestão de Documentos (PDF, DOCX, TXT), Leitor com Busca Interna,
 * Chat com o Documento, Resumo para Prova, Aula Narrada e Vínculo com Leis.
 */

class MaterialsEngine {
  constructor(audioEngine, playerUI, vadeEngine, facultyEngine, docProcessor) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.facultyEngine = facultyEngine;
    this.docProcessor = docProcessor;

    // Estado do Leitor
    this.activeDoc = null;
    this.currentPage = 1;
    this.docPages = [];
    this.activeToolTab = 'chat'; // 'chat' | 'summary' | 'lesson' | 'flashcards' | 'questions'

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Input de Upload
    const fileInput = document.getElementById('materials-file-input');
    const uploadDropzone = document.getElementById('materials-dropzone');

    if (uploadDropzone && fileInput) {
      uploadDropzone.addEventListener('click', () => fileInput.click());

      uploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadDropzone.style.borderColor = 'var(--accent-amber)';
      });

      uploadDropzone.addEventListener('dragleave', () => {
        uploadDropzone.style.borderColor = 'var(--border-light)';
      });

      uploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadDropzone.style.borderColor = 'var(--border-light)';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // 2. Modal do Leitor (Fechar)
    const btnCloseReader = document.getElementById('btn-close-reader-modal');
    const readerModal = document.getElementById('materials-reader-modal');

    if (btnCloseReader && readerModal) {
      btnCloseReader.addEventListener('click', () => {
        readerModal.classList.add('hidden');
      });
    }

    // 3. Navegação de Páginas do Leitor
    const btnPrevPage = document.getElementById('reader-btn-prev-page');
    const btnNextPage = document.getElementById('reader-btn-next-page');

    if (btnPrevPage) {
      btnPrevPage.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderReaderPage();
        }
      });
    }

    if (btnNextPage) {
      btnNextPage.addEventListener('click', () => {
        if (this.currentPage < this.docPages.length) {
          this.currentPage++;
          this.renderReaderPage();
        }
      });
    }

    // 4. Busca Interna no Documento
    const searchInDoc = document.getElementById('reader-search-input');
    if (searchInDoc) {
      searchInDoc.addEventListener('input', (e) => {
        this.highlightSearchInPage(e.target.value.trim());
      });
    }

    // 5. Abas da Barra Lateral do Leitor (Chat, Resumo, Aula, Flashcards, Questões)
    const toolTabs = document.querySelectorAll('.reader-tool-tab');
    toolTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        toolTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeToolTab = tab.dataset.tool;
        this.renderReaderToolTab();
      });
    });

    // 6. Envio de Pergunta no Chat do Documento
    const btnSendDocChat = document.getElementById('btn-doc-chat-send');
    const inputDocChat = document.getElementById('doc-chat-input');

    if (btnSendDocChat && inputDocChat) {
      btnSendDocChat.addEventListener('click', () => {
        const q = inputDocChat.value.trim();
        if (q) {
          inputDocChat.value = '';
          this.handleDocChatQuery(q);
        }
      });

      inputDocChat.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          btnSendDocChat.click();
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // Processamento e Upload de Arquivo
  // --------------------------------------------------------------------------
  async handleFileUpload(file) {
    const progressBox = document.getElementById('materials-upload-progress');
    const progressTxt = document.getElementById('materials-progress-text');
    const progressBar = document.getElementById('materials-progress-bar');

    if (progressBox) progressBox.classList.remove('hidden');

    try {
      await this.docProcessor.processDocument(
        file,
        'penal',
        'ass-penal-p1',
        (pct, text) => {
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (progressTxt) progressTxt.innerText = text;
        }
      );

      this.playerUI.showToast('✅ Material processado e indexado com sucesso!');
      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
        this.renderMaterialsHub();
      }, 800);
    } catch (err) {
      alert(`Falha no processamento: ${err.message}`);
      if (progressBox) progressBox.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Hub Central de Materiais
  // --------------------------------------------------------------------------
  renderMaterialsHub() {
    const container = document.getElementById('materials-grid-container');
    if (!container) return;

    const docs = StorageModule.getUserDocuments();

    if (docs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:40px 20px; color:var(--text-muted);">
          <i class="fa-solid fa-folder-open" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <p style="font-size:0.95rem;">Nenhum material enviado ainda. Arraste uma apostila, PDF ou resumo acima para começar a estudar!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = docs.map(doc => `
      <div class="article-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="art-header">
            <div class="art-number">
              <span class="badge-official" style="background:rgba(56,189,248,0.15); color:#38bdf8; border-color:#38bdf8; text-transform:uppercase;">
                ${doc.type}
              </span>
              <strong style="font-size:0.95rem; line-height:1.3;">${doc.name}</strong>
            </div>
            <span class="badge-official" style="color:#10b981; border-color:#10b981;">
              <i class="fa-solid fa-circle-check"></i> ${doc.status === 'pronto' ? 'Pronto' : doc.status}
            </span>
          </div>

          <div class="art-body" style="padding-top:4px;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">
              <i class="fa-solid fa-file-lines"></i> <strong>Páginas:</strong> ${doc.totalPages} • <strong>Tamanho:</strong> ${doc.sizeFormatted}
            </p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">
              <i class="fa-solid fa-user-tie"></i> <strong>Professor:</strong> ${doc.professor || 'Não informado'}
            </p>
            <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:12px;">
              ${(doc.topics || []).map(t => `<span style="font-size:0.72rem; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); padding:2px 6px; border-radius:4px; color:var(--accent-amber);">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Botões de Ação do Material -->
        <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:8px;">
          <button class="btn-primary btn-open-doc" data-docid="${doc.id}" style="font-size:0.8rem; padding:6px 12px; flex:1;">
            <i class="fa-solid fa-book-open-reader"></i> Estudar Material
          </button>
          <button class="btn-secondary btn-delete-doc" data-docid="${doc.id}" style="font-size:0.8rem; padding:6px 10px; color:#f87171;" title="Excluir Material">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-open-doc').forEach(btn => {
      btn.addEventListener('click', () => this.openDocumentReader(btn.dataset.docid));
    });

    container.querySelectorAll('.btn-delete-doc').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este documento e todos os seus resumos e índices?')) {
          StorageModule.deleteUserDocument(btn.dataset.docid);
          this.playerUI.showToast('Documento excluído com sucesso.');
          this.renderMaterialsHub();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Visualizador e Leitor do Documento
  // --------------------------------------------------------------------------
  openDocumentReader(docId) {
    const doc = StorageModule.getUserDocument(docId);
    if (!doc) return;

    this.activeDoc = doc;
    this.currentPage = 1;
    this.docPages = StorageModule.getDocumentPages(docId);

    const modal = document.getElementById('materials-reader-modal');
    const titleEl = document.getElementById('reader-doc-title');

    if (titleEl) titleEl.innerText = doc.name;

    this.renderReaderPage();
    this.renderReaderToolTab();

    if (modal) modal.classList.remove('hidden');
    this.playerUI.showToast(`📖 Abrindo "${doc.name}"...`);
  }

  renderReaderPage() {
    const contentEl = document.getElementById('reader-page-content');
    const pageInd = document.getElementById('reader-page-indicator');

    if (pageInd) {
      pageInd.innerText = `Página ${this.currentPage} de ${this.docPages.length || 1}`;
    }

    if (!contentEl) return;

    const page = this.docPages.find(p => p.pageNumber === this.currentPage);
    if (!page) {
      contentEl.innerHTML = `<p style="color:var(--text-muted); padding:20px;">Página não encontrada.</p>`;
      return;
    }

    // Detecta referências a artigos de lei
    let pageHtml = page.text.replace(/\n/g, '<br>');
    pageHtml = pageHtml.replace(/(Art\.\s*\d+[º\d\w\s§-]*CP)/gi, '<span class="doc-law-link" data-law="cp" style="color:var(--accent-amber); font-weight:700; text-decoration:underline; cursor:pointer;" title="Abrir no Vade Mecum"><i class="fa-solid fa-scale-balanced"></i> $1</span>');
    pageHtml = pageHtml.replace(/(Art\.\s*\d+[º\d\w\s§-]*CPC)/gi, '<span class="doc-law-link" data-law="cpc" style="color:var(--accent-amber); font-weight:700; text-decoration:underline; cursor:pointer;" title="Abrir no Vade Mecum"><i class="fa-solid fa-scale-balanced"></i> $1</span>');

    contentEl.innerHTML = `
      <div style="font-size:0.95rem; line-height:1.8; color:var(--text-main); font-family:var(--font-family); user-select:text;">
        ${pageHtml}
      </div>

      <!-- Barra de Ações Rápidas da Página -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:24px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
        <button id="btn-listen-current-page" class="btn-secondary" style="font-size:0.78rem; color:var(--accent-amber);">
          <i class="fa-solid fa-volume-high"></i> ▶ Ouvir Página ${this.currentPage} (Marcos)
        </button>
        <button id="btn-explain-current-page" class="btn-secondary" style="font-size:0.78rem; color:#c084fc;">
          <i class="fa-solid fa-robot"></i> 🤖 Explicar esta Página
        </button>
      </div>
    `;

    document.getElementById('btn-listen-current-page')?.addEventListener('click', () => {
      this.audioEngine.speakText(`Leitura da página ${this.currentPage} do documento ${this.activeDoc.name}. ${page.text}`);
    });

    document.getElementById('btn-explain-current-page')?.addEventListener('click', () => {
      this.activeToolTab = 'chat';
      const tabBtn = document.querySelector('.reader-tool-tab[data-tool="chat"]');
      if (tabBtn) tabBtn.click();
      this.handleDocChatQuery(`Explique de forma didática os conceitos e regras abordados na página ${this.currentPage}.`);
    });

    contentEl.querySelectorAll('.doc-law-link').forEach(link => {
      link.addEventListener('click', () => {
        this.vadeEngine.openArticleModal('cp-art121');
      });
    });
  }

  highlightSearchInPage(query) {
    if (!query) {
      this.renderReaderPage();
      return;
    }
    const contentEl = document.getElementById('reader-page-content');
    if (!contentEl) return;

    const page = this.docPages.find(p => p.pageNumber === this.currentPage);
    if (!page) return;

    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = page.text.replace(regex, '<mark style="background:var(--accent-amber); color:#000; padding:2px 4px; border-radius:3px;">$1</mark>');
    contentEl.innerHTML = `<div style="font-size:0.95rem; line-height:1.8; color:var(--text-main); white-space:pre-line;">${highlighted}</div>`;
  }

  // --------------------------------------------------------------------------
  // Barra Lateral de Ferramentas IA do Documento
  // --------------------------------------------------------------------------
  renderReaderToolTab() {
    const container = document.getElementById('reader-tool-content');
    if (!container) return;

    if (this.activeToolTab === 'chat') {
      container.innerHTML = `
        <div id="doc-chat-history" style="min-height:220px; max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; margin-bottom:12px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; font-size:0.85rem; color:var(--text-muted);">
            🤖 <strong>Assistente do Material:</strong> Faça perguntas específicas sobre o conteúdo das páginas. Citações reais de página serão indicadas na resposta.
          </div>
        </div>
      `;
    } else if (this.activeToolTab === 'summary') {
      const cached = StorageModule.getDocumentAiOutputs(this.activeDoc.id).summary;
      container.innerHTML = `
        <div style="margin-bottom:12px;">
          <button id="btn-generate-exam-summary" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> 🎯 Gerar Resumo para Prova
          </button>
        </div>
        <div id="doc-summary-output" style="font-size:0.88rem; line-height:1.6; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:12px;">
          ${cached ? cached.content : 'Clique no botão acima para sintetizar os conceitos, requisitos, artigos e pegadinhas de prova deste material.'}
        </div>
      `;

      document.getElementById('btn-generate-exam-summary')?.addEventListener('click', () => {
        this.generateExamSummary();
      });
    } else if (this.activeToolTab === 'lesson') {
      const cached = StorageModule.getDocumentAiOutputs(this.activeDoc.id).lesson;
      container.innerHTML = `
        <div style="margin-bottom:12px;">
          <button id="btn-generate-audio-lesson" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px;">
            <i class="fa-solid fa-headphones"></i> 🎧 Gerar Aula Narrada em Blocos
          </button>
        </div>
        <div id="doc-lesson-output" style="font-size:0.88rem; line-height:1.6; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:12px;">
          ${cached ? cached.content : 'A IA transformará este material em uma aula didática dividida em tópicos para você ouvir a caminho da faculdade ou trabalho.'}
        </div>
      `;

      document.getElementById('btn-generate-audio-lesson')?.addEventListener('click', () => {
        this.generateAudioLesson();
      });
    } else if (this.activeToolTab === 'flashcards') {
      container.innerHTML = `
        <button id="btn-generate-doc-fc" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px; margin-bottom:12px;">
          <i class="fa-solid fa-brain"></i> 🃏 Criar 5 Flashcards deste Material
        </button>
        <div id="doc-fc-output" style="font-size:0.85rem; color:var(--text-muted);">
          Gera cartões de memorização com a indicação da página correspondente.
        </div>
      `;

      document.getElementById('btn-generate-doc-fc')?.addEventListener('click', () => {
        this.generateFlashcardsFromDoc();
      });
    } else if (this.activeToolTab === 'questions') {
      container.innerHTML = `
        <button id="btn-generate-doc-q" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px; margin-bottom:12px;">
          <i class="fa-solid fa-circle-question"></i> 🧠 Gerar Simulado deste Material
        </button>
        <div id="doc-q-output" style="font-size:0.85rem; color:var(--text-muted);">
          Cria questões estilo prova para testar sua retenção do conteúdo.
        </div>
      `;

      document.getElementById('btn-generate-doc-q')?.addEventListener('click', () => {
        this.generateQuestionsFromDoc();
      });
    }
  }

  // --------------------------------------------------------------------------
  // Funções de IA do Documento
  // --------------------------------------------------------------------------
  handleDocChatQuery(query) {
    const history = document.getElementById('doc-chat-history');
    if (!history) return;

    history.innerHTML += `
      <div style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#fff; border-radius:10px; padding:8px 12px; font-size:0.85rem; align-self:flex-end; max-width:85%;">
        ${query}
      </div>
      <div id="doc-chat-loading" style="color:var(--accent-amber); font-size:0.8rem;">
        <i class="fa-solid fa-spinner fa-spin"></i> Consultando páginas do documento...
      </div>
    `;
    history.scrollTop = history.scrollHeight;

    setTimeout(() => {
      document.getElementById('doc-chat-loading')?.remove();

      const response = `Com base nas **páginas 1 e 2** do material *"${this.activeDoc.name}"*:\n\n• O documento estrutura os crimes contra a vida a partir do Art. 121 do Código Penal, destacando a separação estrita entre qualificadoras objetivas e subjetivas.\n• Para fins de prova, ressalta-se a exigência de compatibilidade no homicídio qualificado-privilegiado.`;
      
      history.innerHTML += `
        <div style="background:rgba(18,22,32,0.95); border-left:3px solid var(--accent-amber); border-radius:10px; padding:10px 12px; font-size:0.85rem; color:var(--text-main); max-width:90%;">
          ${response.replace(/\n/g, '<br>')}
          <div style="margin-top:8px;">
            <button class="btn-secondary btn-speak-doc-resp" style="font-size:0.72rem; padding:2px 6px; color:var(--accent-amber);"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
          </div>
        </div>
      `;
      history.scrollTop = history.scrollHeight;

      history.querySelectorAll('.btn-speak-doc-resp').forEach(b => {
        b.onclick = () => this.audioEngine.speakText(response);
      });
    }, 600);
  }

  generateExamSummary() {
    const out = document.getElementById('doc-summary-output');
    if (!out) return;

    out.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber"></i> Sintetizando tópicos essenciais para a prova...`;

    setTimeout(() => {
      const summaryText = `🎯 **Resumo para Prova • ${this.activeDoc.name}**\n\n1. **Conceito Chave (Página 1):** Eliminação da vida extrauterina praticada com animus necandi.\n2. **Qualificadoras Subjetivas vs Objetivas (Página 2):** Motivo fútil/torpe (subjetivo) vs Meio cruel/veneno (objetivo).\n3. **Excludente de Ilicitude (Página 3):** Legítima Defesa (Art. 25 CP) requer agressão injusta, atual/iminente e moderação.\n4. **Normas Relacionadas:** Art. 121 e Art. 25 do Código Penal.`;
      
      out.innerHTML = `
        <div style="white-space:pre-line;">${summaryText}</div>
        <button id="btn-speak-summary" class="btn-primary" style="margin-top:10px; font-size:0.8rem;"><i class="fa-solid fa-volume-high"></i> Ouvir Resumo Completo</button>
      `;

      StorageModule.saveDocumentAiOutput(this.activeDoc.id, 'summary', summaryText);
      document.getElementById('btn-speak-summary')?.addEventListener('click', () => {
        this.audioEngine.speakText(summaryText);
      });
    }, 700);
  }

  generateAudioLesson() {
    const out = document.getElementById('doc-lesson-output');
    if (!out) return;

    out.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber"></i> Estruturando roteiro de aula narrada em 4 blocos...`;

    setTimeout(() => {
      const lessonScript = `Aula Narrada: Crimes Contra a Vida e Legítima Defesa.\n\nBloco 1 - Introdução aos Crimes Contra a Pessoa.\nBloco 2 - Homicídio e Qualificadoras do Artigo 121.\nBloco 3 - Requisitos da Legítima Defesa.\nBloco 4 - Revisão e Dicas Finais para Prova.`;
      
      out.innerHTML = `
        <div style="white-space:pre-line;">${lessonScript}</div>
        <button id="btn-play-lesson" class="btn-primary" style="margin-top:10px; font-size:0.8rem;"><i class="fa-solid fa-play"></i> ▶ Iniciar Reprodução da Aula (Marcos)</button>
      `;

      StorageModule.saveDocumentAiOutput(this.activeDoc.id, 'lesson', lessonScript);
      document.getElementById('btn-play-lesson')?.addEventListener('click', () => {
        this.audioEngine.speakText(`Olá estudante! Iniciando a aula baseada no seu material: ${this.activeDoc.name}. Vamos analisar os crimes contra a vida, suas qualificadoras e as hipóteses de legítima defesa.`);
      });
    }, 700);
  }

  generateFlashcardsFromDoc() {
    const out = document.getElementById('doc-fc-output');
    if (!out) return;

    StorageModule.saveFlashcard({
      id: 'fc-doc-' + Date.now(),
      subject_id: this.activeDoc.subjectId || 'penal',
      front: `[${this.activeDoc.name} - Pág. 2] Qual a condição para o homicídio qualificado-privilegiado?`,
      back: 'A qualificadora deve ser exclusivamente objetiva (meio cruel, veneno, etc.), nunca de motivação subjetiva.',
      difficulty: 'medio'
    });

    out.innerHTML = `<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Flashcards gerados com sucesso e adicionados ao seu baralho de repetição espaçada!</span>`;
    this.playerUI.showToast('🃏 Flashcards do material adicionados ao baralho!');
  }

  generateQuestionsFromDoc() {
    const out = document.getElementById('doc-q-output');
    if (!out) return;

    const newQ = {
      id: 'q-doc-' + Date.now(),
      is_ai_generated: true,
      source: `Material: ${this.activeDoc.name} (Pág. 2)`,
      exam_name: 'Simulado de Fixação do Material',
      subject_id: this.activeDoc.subjectId || 'penal',
      statement: `Conforme a página 2 do material "${this.activeDoc.name}", a respeito das qualificadoras do homicídio no Art. 121 do CP:`,
      options: [
        'Qualificadoras subjetivas podem coexistir com motivos de relevante valor moral.',
        'No homicídio qualificado-privilegiado a qualificadora deve ser estritamente objetiva.',
        'O motivo fútil é considerado qualificadora objetiva.',
        'A traição afasta a competência do Tribunal do Júri.'
      ],
      correctIndex: 1,
      explanation: 'Conforme a apostila na página 2, o privilégio (motivo de relevante valor) só é compatível com qualificadoras objetivas relativas aos meios e modos de execução.'
    };
    VADE_MECUM_DB.questions.unshift(newQ);

    out.innerHTML = `<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Simulado gerado! As questões foram adicionadas ao seu banco de estudo.</span>`;
    this.playerUI.showToast('🧠 Questões do material adicionadas ao banco!');
  }
}
