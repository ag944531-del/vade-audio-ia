/**
 * VadeAudio AI - Motor do Caderno Digital Jurídico Inteligente (Etapa 25)
 * Organização unificada de aulas gravadas, transcrições, PDFs, Scanner, Vade Mecum,
 * jurisprudência, respostas do Tutor, mapas mentais, flashcards e questões.
 * Editor em blocos, slash commands, links internos [[Página]], RAG contextual e Active Recall.
 */

class DigitalNotebookEngine {
  constructor(authService, audioEngine, vadeEngine, tutorEngine, scannerEngine, mindMapEngine) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.scannerEngine = scannerEngine;
    this.mindMapEngine = mindMapEngine;

    this.notebooks = this.loadPresetNotebooks();
    this.activeNotebookId = this.notebooks[0].id;
    this.activeSectionId = this.notebooks[0].sections[0].id;
    this.activePageId = this.notebooks[0].sections[0].pages[0].id;
    this.inbox = [];
    this.saveState = 'saved'; // 'saving' | 'saved' | 'offline'
  }

  loadPresetNotebooks() {
    return [
      {
        id: 'nb_penal_2',
        title: 'Direito Penal II (2026/2)',
        subject: 'Direito Penal',
        semester: '2026/2',
        color: '#f59e0b',
        sections: [
          {
            id: 'sec_teoria_crime',
            title: 'Teoria do Crime & Excludentes',
            pages: [
              {
                id: 'page_aula_1',
                title: 'Aula 01 — Legítima Defesa e Requisitos',
                createdAt: Date.now() - 86400000 * 3,
                updatedAt: Date.now() - 3600000,
                examTag: 'P1 Penal',
                blocks: [
                  {
                    id: 'blk_1',
                    type: 'heading',
                    content: 'Conceito e Fundamentos da Legítima Defesa'
                  },
                  {
                    id: 'blk_2',
                    type: 'text',
                    content: 'A legítima defesa é uma excludente de ilicitude que autoriza o cidadão a repelir agressão injusta, atual ou iminente, a direito seu ou de outrem, usando moderadamente dos meios necessários.'
                  },
                  {
                    id: 'blk_3',
                    type: 'article_ref',
                    articleId: 'cp_art25',
                    lawCode: 'cp',
                    label: 'Art. 25 do Código Penal',
                    contentSnippet: 'Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.'
                  },
                  {
                    id: 'blk_4',
                    type: 'alert',
                    alertType: 'warning',
                    content: '⚠️ Ponto de Atenção: O excesso (doloso ou culposo) é punível nos termos do parágrafo único do art. 23 do CP.'
                  },
                  {
                    id: 'blk_5',
                    type: 'flashcard_ref',
                    flashcardId: 'fc_leg_def_1',
                    question: 'Quais são os 4 requisitos cumulativos da legítima defesa?',
                    answer: '1) Agressão injusta; 2) Atual ou iminente; 3) Defesa de direito próprio ou alheio; 4) Moderação dos meios necessários.'
                  }
                ]
              },
              {
                id: 'page_aula_2',
                title: 'Aula 02 — Estado de Necessidade vs Legítima Defesa',
                createdAt: Date.now() - 86400000 * 2,
                updatedAt: Date.now() - 7200000,
                examTag: 'P1 Penal',
                blocks: [
                  {
                    id: 'blk_201',
                    type: 'heading',
                    content: 'Distinção Dogmática'
                  },
                  {
                    id: 'blk_202',
                    type: 'text',
                    content: 'No estado de necessidade há conflito entre bens jurídicos legítimos. Veja também as anotações em [[Aula 01 — Legítima Defesa e Requisitos]].'
                  },
                  {
                    id: 'blk_203',
                    type: 'article_ref',
                    articleId: 'cp_art24',
                    lawCode: 'cp',
                    label: 'Art. 24 do Código Penal',
                    contentSnippet: 'Considera-se em estado de necessidade quem pratica o fato para salvar de perigo atual...'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'nb_proc_civil',
        title: 'Direito Processual Civil (2026/2)',
        subject: 'Processo Civil',
        semester: '2026/2',
        color: '#38bdf8',
        sections: [
          {
            id: 'sec_tutelas',
            title: 'Tutelas Provisórias',
            pages: [
              {
                id: 'page_tutela_urgencia',
                title: 'Tutela Provisória de Urgência (Art. 300 CPC)',
                createdAt: Date.now() - 86400000,
                updatedAt: Date.now(),
                examTag: 'P1 Processo Civil',
                blocks: [
                  {
                    id: 'blk_301',
                    type: 'heading',
                    content: 'Requisitos do Art. 300 do CPC'
                  },
                  {
                    id: 'blk_302',
                    type: 'article_ref',
                    articleId: 'cpc_art300',
                    lawCode: 'cpc',
                    label: 'Art. 300 CPC (Atualizado com Lei 15.123/2026)',
                    hasLegislativeUpdate: true,
                    contentSnippet: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 1. NAVEGAÇÃO E ACESSO A CADERNOS
  // --------------------------------------------------------------------------
  getActivePage() {
    const nb = this.notebooks.find(n => n.id === this.activeNotebookId);
    if (!nb) return null;
    for (const sec of nb.sections) {
      const page = sec.pages.find(p => p.id === this.activePageId);
      if (page) return page;
    }
    return nb.sections[0]?.pages[0] || null;
  }

  setActivePage(notebookId, sectionId, pageId) {
    this.activeNotebookId = notebookId;
    this.activeSectionId = sectionId;
    this.activePageId = pageId;
  }

  // --------------------------------------------------------------------------
  // 2. OPERAÇÕES EM BLOCOS & AUTOSAVE
  // --------------------------------------------------------------------------
  addBlock(pageId, type, initialContent = '') {
    const page = this.getActivePage();
    if (!page || page.id !== pageId) return null;

    const newBlock = {
      id: 'blk_' + Date.now().toString(36),
      type,
      content: initialContent,
      createdAt: Date.now()
    };

    page.blocks.push(newBlock);
    page.updatedAt = Date.now();
    this.triggerAutosave();
    return newBlock;
  }

  updateBlockContent(pageId, blockId, newContent) {
    const page = this.getActivePage();
    if (!page || page.id !== pageId) return false;

    const block = page.blocks.find(b => b.id === blockId);
    if (!block) return false;

    block.content = newContent;
    page.updatedAt = Date.now();
    this.triggerAutosave();
    return true;
  }

  removeBlock(pageId, blockId) {
    const page = this.getActivePage();
    if (!page || page.id !== pageId) return false;

    page.blocks = page.blocks.filter(b => b.id !== blockId);
    page.updatedAt = Date.now();
    this.triggerAutosave();
    return true;
  }

  triggerAutosave() {
    this.saveState = 'saving';
    // Persistência síncrona de segurança em cache local
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('vadeaudio_notebooks_backup', JSON.stringify(this.notebooks));
      } catch (e) {
        // storage overflow fallback
      }
    }
    setTimeout(() => {
      this.saveState = 'saved';
      const statusEl = document.getElementById('notebook-save-status');
      if (statusEl) statusEl.innerText = '✓ Salvo';
    }, 400);
  }

  // --------------------------------------------------------------------------
  // 3. LINKS INTERNOS [[PÁGINA]] & BACKLINKS
  // --------------------------------------------------------------------------
  getBacklinksForPage(pageTitle) {
    if (!pageTitle) return [];
    const backlinks = [];
    const targetTag = `[[${pageTitle.trim()}]]`;

    for (const nb of this.notebooks) {
      for (const sec of nb.sections) {
        for (const page of sec.pages) {
          if (page.title !== pageTitle) {
            const hasLink = page.blocks.some(b => b.content && b.content.includes(targetTag));
            if (hasLink) {
              backlinks.push({
                notebookTitle: nb.title,
                pageId: page.id,
                pageTitle: page.title
              });
            }
          }
        }
      }
    }
    return backlinks;
  }

  // --------------------------------------------------------------------------
  // 4. RAG: PERGUNTAR AO MEU CADERNO
  // --------------------------------------------------------------------------
  askNotebookRAG(query) {
    if (!query || query.trim().length === 0) {
      return { answer: 'Por favor, digite sua pergunta sobre as anotações do caderno.', citations: [] };
    }

    const qLower = query.toLowerCase();
    const matches = [];

    for (const nb of this.notebooks) {
      for (const sec of nb.sections) {
        for (const page of sec.pages) {
          for (const block of page.blocks) {
            const text = (block.content || block.contentSnippet || '').toLowerCase();
            if (text.includes(qLower) || (qLower.includes('legítima defesa') && text.includes('legítima defesa')) || (qLower.includes('tutela') && text.includes('urgência'))) {
              matches.push({
                notebook: nb.title,
                section: sec.title,
                page: page.title,
                snippet: block.content || block.contentSnippet
              });
            }
          }
        }
      }
    }

    if (matches.length === 0) {
      return {
        answer: 'Não encontrei nenhuma referência sobre este assunto nas anotações do seu caderno.',
        citations: []
      };
    }

    const topMatch = matches[0];
    return {
      answer: `Com base nas suas anotações em "${topMatch.page}": ${topMatch.snippet}`,
      citations: matches.slice(0, 3)
    };
  }

  // --------------------------------------------------------------------------
  // 5. CADERNO DA PROVA & MEUS ERROS
  // --------------------------------------------------------------------------
  assembleExamNotebook(examTag = 'P1 Penal') {
    const relevantPages = [];
    for (const nb of this.notebooks) {
      for (const sec of nb.sections) {
        for (const page of sec.pages) {
          if (page.examTag === examTag) {
            relevantPages.push(page);
          }
        }
      }
    }

    return {
      examTag,
      totalPages: relevantPages.length,
      pages: relevantPages,
      recurrentErrors: [
        { topic: 'Excesso Punível', count: 3, recommendation: 'Revisar Parágrafo Único do Art. 23 CP' },
        { topic: 'Legítima Defesa Real vs Putativa', count: 4, recommendation: 'Refazer flashcards de Teoria do Erro' }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // 6. ROTEIRO DE ÁUDIO DIDÁTICO (ELEVENLABS PROF. MARCOS)
  // --------------------------------------------------------------------------
  generateSpokenPageScript(page = this.getActivePage()) {
    if (!page) return null;

    let script = `Olá! Aqui é o Professor Marcos narrando a sua página de caderno sobre ${page.title}. `;
    
    for (const block of page.blocks) {
      if (block.type === 'heading') {
        script += `Tópico: ${block.content}. `;
      } else if (block.type === 'text') {
        script += `${block.content} `;
      } else if (block.type === 'article_ref') {
        script += `No ${block.label}: ${block.contentSnippet}. `;
      } else if (block.type === 'alert') {
        script += `Atenção: ${block.content}. `;
      }
    }

    script += `Fim da revisão desta página. Continue firme nos seus estudos!`;

    return {
      title: `Áudio do Caderno: ${page.title}`,
      voiceName: 'Prof. Dr. Marcos',
      voiceId: 'xHUwLsLfyqiYOIVTzLRW',
      speechScript: script
    };
  }
}

window.DigitalNotebookEngine = DigitalNotebookEngine;
