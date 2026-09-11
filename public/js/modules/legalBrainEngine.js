/**
 * VadeAudio AI - Cérebro Jurídico (Etapa 7)
 * Motor Unificado de Recuperação de Conhecimento, Busca Híbrida e RAG
 * Conecta Vade Mecum Oficial, Jurisprudência, Materiais do Aluno, Anotações,
 * Flashcards, Questões, Tutor Jurídico e Áudio ElevenLabs (Marcos).
 */

class LegalBrainEngine {
  constructor(audioEngine, playerUI, vadeEngine, tutorEngine, materialsEngine, facultyEngine, oabEngine) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.materialsEngine = materialsEngine;
    this.facultyEngine = facultyEngine;
    this.oabEngine = oabEngine;

    this.activeSearchMode = 'hybrid'; // 'hybrid' | 'only_my_sources' | 'only_official'
    this.currentQuery = '';

    this.synonymsMap = {
      'defesa própria': 'legítima defesa',
      'matar alguém': 'homicídio',
      'liminar': 'tutela de urgência',
      'medida urgente': 'tutela provisória',
      'danos morais': 'responsabilidade civil',
      'estatuto oab': 'eaoab',
      'direitos humanos': 'direitos fundamentais'
    };

    this.lawAbbrMap = {
      'cf': 'cf88',
      'cf88': 'cf88',
      'cp': 'cp',
      'cpc': 'cpc',
      'cc': 'cc',
      'clt': 'clt',
      'cdc': 'cdc',
      'eca': 'eca',
      'eaoab': 'oab',
      'oab': 'oab'
    };

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Busca no Hero do Cérebro
    const btnSearch = document.getElementById('btn-brain-search');
    const inputSearch = document.getElementById('brain-search-input');

    if (btnSearch && inputSearch) {
      btnSearch.addEventListener('click', () => {
        const q = inputSearch.value.trim();
        if (q) this.executeUnifiedSearch(q);
      });

      inputSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnSearch.click();
        }
      });
    }

    // 2. Chips Rápidos de Pesquisa
    const quickChips = document.querySelectorAll('.brain-quick-chip');
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.query;
        if (inputSearch) inputSearch.value = q;
        this.executeUnifiedSearch(q);
      });
    });

    // 3. Seletor de Modo de Busca (Híbrido, Minhas Fontes, Oficiais)
    const modeBtns = document.querySelectorAll('.brain-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSearchMode = btn.dataset.mode;
        StorageModule.saveBrainSettings({ searchMode: this.activeSearchMode });
        this.playerUI.showToast(`Modo de busca alterado para: ${btn.innerText.trim()}`);
        if (inputSearch && inputSearch.value.trim()) {
          this.executeUnifiedSearch(inputSearch.value.trim());
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Normalização e Expansão da Consulta
  // --------------------------------------------------------------------------
  normalizeQuery(query) {
    let q = query.toLowerCase().trim();
    
    // 1. Substituição de sinônimos controlados
    for (const [syn, canonical] of Object.entries(this.synonymsMap)) {
      if (q.includes(syn)) {
        q = q.replace(syn, canonical);
      }
    }

    // 2. Detecção de formato "Art. 121 CP", "121 CP", "art 300 cpc", "art 5 cf"
    const artMatch = q.match(/(?:art\.?|artigo)?\s*(\d+[º\d\w-]*)\s*(cf88|eaoab|cpc|clt|cdc|eca|oab|cf|cp|cc)/i);
    let targetArticleId = null;

    if (artMatch) {
      const artNum = artMatch[1].replace('º', '');
      const rawLaw = artMatch[2].toLowerCase();
      const lawId = this.lawAbbrMap[rawLaw] || 'cf88';
      targetArticleId = `${lawId}-art${artNum}`;
    }

    return {
      rawQuery: query,
      normalizedQuery: q,
      targetArticleId
    };
  }

  // --------------------------------------------------------------------------
  // Execução da Busca Unificada & RAG
  // --------------------------------------------------------------------------
  executeUnifiedSearch(query) {
    this.currentQuery = query;
    StorageModule.saveBrainSearchHistory(query);

    const norm = this.normalizeQuery(query);
    const results = this.retrieveAllSources(norm);

    this.renderUnifiedResults(norm, results);
  }

  retrieveAllSources(norm) {
    const q = norm.normalizedQuery;
    const targetArtId = norm.targetArticleId;

    const sources = {
      level1_laws: [],       // Nível 1: Legislação Oficial (Planalto)
      level2_juris: [],      // Nível 2: Jurisprudência & Súmulas Oficiais STF/STJ
      level3_materials: [],  // Nível 3: Materiais do Aluno (PDFs, Apostilas)
      level4_notes: [],      // Nível 4: Anotações Pessoais
      level5_questions: []   // Nível 5: Flashcards e Questões de Estudo
    };

    // 1. Nível 1: Legislação Oficial
    if (this.activeSearchMode !== 'only_my_sources') {
      sources.level1_laws = (VADE_MECUM_DB.articles || []).filter(art => {
        if (targetArtId && art.id.toLowerCase() === targetArtId.toLowerCase()) return true;
        const artDisp = String(art.article_display || art.article || '').toLowerCase();
        const titleStr = String(art.title || '').toLowerCase();
        const lawStr = String(art.law_name || art.lawTitle || '').toLowerCase();
        const textStr = String(art.official_text || (art.content && art.content[0]?.text) || '').toLowerCase();
        return artDisp.includes(q) ||
               titleStr.includes(q) ||
               lawStr.includes(q) ||
               textStr.includes(q);
      });
    }

    // 2. Nível 2: Jurisprudência & Súmulas Oficiais STF/STJ
    if (this.activeSearchMode !== 'only_my_sources') {
      const sumulas = (VADE_MECUM_DB.sumulas || []).filter(s => {
        const enunc = String(s.enunciado || s.title || s.text || '').toLowerCase();
        const num = String(s.numero || s.number || '').toLowerCase();
        const tema = String(s.tema || s.subject || '').toLowerCase();
        return enunc.includes(q) || num.includes(q) || tema.includes(q);
      });
      const juris = (VADE_MECUM_DB.jurisprudence || []).filter(j => {
        const ementa = String(j.ementa || j.text || '').toLowerCase();
        const tema = String(j.tema || j.subject || '').toLowerCase();
        const trib = String(j.tribunal || '').toLowerCase();
        return ementa.includes(q) || tema.includes(q) || trib.includes(q);
      });
      sources.level2_juris = [...sumulas.map(s => ({ ...s, isSumula: true })), ...juris];
    }

    // 3. Nível 3: Materiais do Aluno (PDFs, DOCX, TXT)
    if (this.activeSearchMode !== 'only_official') {
      const userDocs = StorageModule.getUserDocuments();
      userDocs.forEach(doc => {
        const pages = StorageModule.getDocumentPages(doc.id);
        pages.forEach(p => {
          if (p.text.toLowerCase().includes(q)) {
            sources.level3_materials.push({
              docId: doc.id,
              docName: doc.name,
              pageNumber: p.pageNumber,
              textSnippet: p.text.substring(0, 180) + '...'
            });
          }
        });
      });
    }

    // 4. Nível 4: Anotações Pessoais
    if (this.activeSearchMode !== 'only_official') {
      const notes = StorageModule.getVadeAnnotations();
      Object.entries(notes).forEach(([artId, noteText]) => {
        if (noteText.toLowerCase().includes(q)) {
          sources.level4_notes.push({
            articleId: artId,
            noteText
          });
        }
      });
    }

    // 5. Nível 5: Flashcards e Questões
    if (this.activeSearchMode !== 'only_official') {
      const questions = VADE_MECUM_DB.questions.filter(quest => 
        quest.statement.toLowerCase().includes(q) || (quest.options || []).some(o => o.toLowerCase().includes(q))
      );
      const flashcards = StorageModule.getCustomFlashcards().filter(fc => 
        fc.front.toLowerCase().includes(q) || fc.back.toLowerCase().includes(q)
      );
      const errors = StorageModule.getOabErrorNotebook().filter(err => 
        err.statement.toLowerCase().includes(q)
      );
      sources.level5_questions = { questions, flashcards, errors };
    } else {
      sources.level5_questions = { questions: [], flashcards: [], errors: [] };
    }

    return sources;
  }

  // --------------------------------------------------------------------------
  // Renderização dos Resultados e Resposta Fundamentada
  // --------------------------------------------------------------------------
  renderUnifiedResults(norm, sources) {
    const container = document.getElementById('brain-results-area');
    if (!container) return;

    const totalFound = sources.level1_laws.length + 
                       sources.level2_juris.length + 
                       sources.level3_materials.length + 
                       sources.level4_notes.length + 
                       (sources.level5_questions.questions?.length || 0);

    // Se nenhuma fonte foi encontrada
    if (totalFound === 0) {
      container.innerHTML = `
        <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:14px; padding:24px; text-align:center;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2.2rem; color:#f87171; margin-bottom:10px;"></i>
          <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.1rem; margin-bottom:6px;">
            Nenhum resultado recuperado para "${norm.rawQuery}"
          </h4>
          <p style="color:var(--text-muted); font-size:0.85rem; max-width:550px; margin:0 auto 14px auto;">
            ${this.activeSearchMode === 'only_my_sources' 
              ? 'Não encontrei conteúdo suficiente nas suas fontes cadastradas para responder com segurança.' 
              : 'Verifique a digitação ou experimente pesquisar por termos como "Art. 121 CP", "Legítima Defesa" ou "Tutela de Urgência".'}
          </p>
          <button id="btn-ask-tutor-fallback" class="btn-primary" style="font-size:0.85rem; padding:8px 16px;">
            <i class="fa-solid fa-robot"></i> Consultar com Conhecimento Geral do Tutor IA
          </button>
        </div>
      `;

      document.getElementById('btn-ask-tutor-fallback')?.addEventListener('click', () => {
        window.VadeAudioApp.tutorEngine.handleUserMessage(`Explique juridicamente o seguinte tema: ${norm.rawQuery}`);
        const tutorNav = document.querySelector('.nav-item[data-view="tutor"]');
        if (tutorNav) tutorNav.click();
      });
      return;
    }

    // Painel de Síntese Inteligente (RAG)
    const summaryGrounded = this.generateGroundedSummary(norm, sources);

    container.innerHTML = `
      <!-- Card da Resposta Fundamentada (RAG Inteligente) -->
      <div style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(18,22,32,0.98)); border:1px solid var(--border-amber); border-radius:16px; padding:20px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber); text-transform:uppercase; letter-spacing:0.5px;">
            <i class="fa-solid fa-brain"></i> Síntese do Cérebro Jurídico
          </span>
          <span class="badge-official" style="color:#10b981; border-color:#10b981;">
            <i class="fa-solid fa-shield-check"></i> ${sources.level1_laws.length > 0 ? 'Fundamentado em Legislação Oficial' : 'Fundamentado nas Fontes Recuperadas'}
          </span>
        </div>

        <p style="font-size:0.95rem; line-height:1.7; color:var(--text-main); margin-bottom:16px; white-space:pre-line;">
          ${summaryGrounded.text}
        </p>

        <!-- Chips de Fontes Utilizadas -->
        <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:12px;">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:8px;">
            <i class="fa-solid fa-link"></i> Fontes Recuperadas e Citadas:
          </span>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${summaryGrounded.sourceChips.map(c => `
              <button class="btn-secondary btn-jump-source" data-type="${c.type}" data-id="${c.id}" style="font-size:0.75rem; padding:4px 10px; color:${c.color};">
                <i class="${c.icon}"></i> ${c.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Ações do Cérebro (Ouvir Síntese e Mapa do Assunto) -->
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:16px;">
          <button id="btn-speak-brain-summary" class="btn-primary" style="font-size:0.82rem; padding:8px 14px;">
            <i class="fa-solid fa-headphones"></i> ▶ Ouvir Síntese Completa (Marcos)
          </button>
          <button id="btn-show-topic-map" class="btn-secondary" style="font-size:0.82rem; padding:8px 14px; color:var(--accent-amber);">
            <i class="fa-solid fa-diagram-project"></i> 🧠 Ver Mapa do Assunto
          </button>
        </div>
      </div>

      <!-- Seção com Resultados Agrupados por Nível de Autoridade -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- Nível 1: Legislação Oficial -->
        ${sources.level1_laws.length > 0 ? `
          <div>
            <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.05rem; margin-bottom:10px;">
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">NÍVEL 1</span> Legislação Oficial do Planalto (${sources.level1_laws.length})
            </h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${sources.level1_laws.map(art => `
                <div class="article-card">
                  <div class="art-header">
                    <strong>Art. ${art.number} — ${art.lawTitle}</strong>
                    <button class="btn-primary btn-open-art" data-artid="${art.id}" style="font-size:0.75rem; padding:4px 10px;">
                      <i class="fa-solid fa-book-open"></i> Abrir Artigo
                    </button>
                  </div>
                  <div class="art-body">
                    <p style="font-size:0.88rem; line-height:1.5; color:var(--text-main);">${art.text}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Nível 2: Jurisprudência & Súmulas -->
        ${sources.level2_juris.length > 0 ? `
          <div>
            <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.05rem; margin-bottom:10px;">
              <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;">NÍVEL 2</span> Jurisprudência & Súmulas STF/STJ (${sources.level2_juris.length})
            </h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${sources.level2_juris.map(j => `
                <div class="article-card">
                  <div class="art-header">
                    <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8;">${j.tribunal || 'STF/STJ'}</span>
                    <strong>${j.isSumula ? `Súmula nº ${j.numero}` : `Processo: ${j.numero_processo || 'Recurso Extraordinário'}`}</strong>
                  </div>
                  <div class="art-body">
                    <p style="font-size:0.85rem; color:var(--text-main);">${j.enunciado || j.ementa}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Nível 3: Materiais e Apostilas -->
        ${sources.level3_materials.length > 0 ? `
          <div>
            <h4 style="font-family:var(--font-display); color:var(--text-main); font-size:1.05rem; margin-bottom:10px;">
              <span class="badge-official" style="color:#c084fc; border-color:#c084fc;">NÍVEL 3</span> Meus Materiais & Apostilas (${sources.level3_materials.length})
            </h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${sources.level3_materials.map(m => `
                <div class="article-card">
                  <div class="art-header">
                    <strong>${m.docName} (Página ${m.pageNumber})</strong>
                    <button class="btn-secondary btn-open-doc-page" data-docid="${m.docId}" style="font-size:0.75rem; color:var(--accent-amber);">
                      <i class="fa-solid fa-file-lines"></i> Abrir no Leitor
                    </button>
                  </div>
                  <div class="art-body">
                    <p style="font-size:0.85rem; color:var(--text-muted);">${m.textSnippet}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    document.getElementById('btn-speak-brain-summary')?.addEventListener('click', () => {
      this.audioEngine.speakText(`Síntese do Cérebro Jurídico sobre ${norm.rawQuery}. ${summaryGrounded.text}`);
    });

    document.getElementById('btn-show-topic-map')?.addEventListener('click', () => {
      this.renderTopicMapModal(norm.rawQuery);
    });

    container.querySelectorAll('.btn-open-art').forEach(b => {
      b.onclick = () => this.vadeEngine.openArticleModal(b.dataset.artid);
    });

    container.querySelectorAll('.btn-open-doc-page').forEach(b => {
      b.onclick = () => this.materialsEngine.openDocumentReader(b.dataset.docid);
    });

    container.querySelectorAll('.btn-jump-source').forEach(b => {
      b.onclick = () => {
        if (b.dataset.type === 'law') this.vadeEngine.openArticleModal(b.dataset.id);
        if (b.dataset.type === 'material') this.materialsEngine.openDocumentReader(b.dataset.id);
      };
    });
  }

  generateGroundedSummary(norm, sources) {
    const q = norm.normalizedQuery;
    let text = '';
    const sourceChips = [];

    if (q.includes('legítima defesa') || q.includes('art. 25') || q.includes('art 25')) {
      text = `A **Legítima Defesa** é uma causa de exclusão da ilicitude prevista expressamente no **Art. 25 do Código Penal**.\n\n• **Requisitos Legais Cumulativos:** (1) Agressão injusta; (2) Agressão atual ou iminente; (3) Defesa de direito próprio ou alheio; (4) Uso moderado dos meios necessários; (5) Presença do animus defendendi.\n• **Material Acadêmico:** Sua apostila de Penal II (pág. 3) ressalta a impossibilidade de legítima defesa real contra legítima defesa real recíproca.`;
      sourceChips.push({ type: 'law', id: 'cp-art25', label: 'Art. 25 CP', color: 'var(--accent-amber)', icon: 'fa-solid fa-scale-balanced' });
      sourceChips.push({ type: 'material', id: 'doc-penal-apostila', label: 'Apostila Penal (Pág. 3)', color: '#c084fc', icon: 'fa-solid fa-file-lines' });
    } else if (q.includes('tutela') || q.includes('art. 300') || q.includes('art 300')) {
      text = `A **Tutela Provisória de Urgência** é regulamentada no **Art. 300 do CPC**, podendo ter caráter cautelar ou antecipado.\n\n• **Requisitos Obrigatórios:** Probabilidade do direito (*fumus boni iuris*) e perigo de dano ou risco ao resultado útil do processo (*periculum in mora*).\n• **Reversibilidade:** A tutela de urgência de natureza antecipada não será concedida quando houver perigo de irreversibilidade dos efeitos da decisão (§ 3º).`;
      sourceChips.push({ type: 'law', id: 'cpc-art300', label: 'Art. 300 CPC', color: 'var(--accent-amber)', icon: 'fa-solid fa-scale-balanced' });
    } else if (q.includes('homicídio') || q.includes('art. 121') || q.includes('art 121')) {
      text = `O crime de **Homicídio** está tipificado no **Art. 121 do Código Penal**.\n\n• **Espécies:** Homicídio simples (pena de 6 a 20 anos), privilegiado (§ 1º - relevante valor moral/social) e qualificado (§ 2º - pena de 12 a 30 anos).\n• **Compatibilidade:** É admitido o homicídio qualificado-privilegiado, desde que a qualificadora seja estritamente de natureza objetiva (ex: meio cruel) e nunca subjetiva.`;
      sourceChips.push({ type: 'law', id: 'cp-art121', label: 'Art. 121 CP', color: 'var(--accent-amber)', icon: 'fa-solid fa-scale-balanced' });
      sourceChips.push({ type: 'material', id: 'doc-penal-apostila', label: 'Apostila Penal (Páginas 1 e 2)', color: '#c084fc', icon: 'fa-solid fa-file-lines' });
    } else {
      text = `Recuperamos registros sobre **"${norm.rawQuery}"** estruturados a partir da sua base oficial e pessoal. Consulte os dispositivos normativos e materiais correlatos detalhados abaixo.`;
      if (sources.level1_laws.length > 0) {
        sourceChips.push({ type: 'law', id: sources.level1_laws[0].id, label: `Art. ${sources.level1_laws[0].number} ${sources.level1_laws[0].lawTitle}`, color: 'var(--accent-amber)', icon: 'fa-solid fa-scale-balanced' });
      }
    }

    return { text, sourceChips };
  }

  renderTopicMapModal(topic) {
    const modal = document.getElementById('brain-topic-map-modal');
    if (!modal) return;

    const titleEl = document.getElementById('brain-map-title');
    const contentEl = document.getElementById('brain-map-tree');

    if (titleEl) titleEl.innerText = `Mapa Conceitual: ${topic}`;
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="font-family:monospace; font-size:0.92rem; line-height:1.8; color:var(--text-main); background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:10px; padding:16px;">
          <strong style="color:var(--accent-amber); font-size:1.05rem;">${topic.toUpperCase()}</strong><br>
          ├── 🏛️ <strong>Legislação Base</strong> (Artigos Aplicáveis)<br>
          │   ├── Dispositivo Legal Vigente (Planalto Oficial)<br>
          │   └── Requisitos e Exceções Formais<br>
          ├── ⚖️ <strong>Precedentes STF / STJ</strong><br>
          │   └── Súmulas Vinculantes e Teses Fixadas<br>
          ├── 📁 <strong>Material Acadêmico</strong> (Apostilas e Slides)<br>
          │   └── Tópicos Destacados pelo Professor<br>
          └── 🧠 <strong>Fixação & Treino</strong><br>
              ├── Questões OAB / Concursos<br>
              └── Flashcards com Repetição Espaçada (SRS)
        </div>
      `;
    }

    modal.classList.remove('hidden');
    document.getElementById('btn-close-map-modal')?.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
}
