/**
 * VadeAudio AI - SmartReadingSessionService (Etapa 33)
 * Orquestrador da Sessão de Leitura Inteligente: Seleção de Texto, Ações Contextuais de IA,
 * Detecção de Termos e Artigos Legais, Active Recall, TTS ElevenLabs com Follow-Along e Caderno Digital.
 */

class SmartReadingSessionService {
  constructor(deps = {}) {
    this.storage = deps.storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.progressService = deps.progressService || null;
    this.audioEngine = deps.audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);
    this.tutorEngine = deps.tutorEngine || (typeof window !== 'undefined' ? window.tutorEngine : null);
    this.notebookEngine = deps.notebookEngine || (typeof window !== 'undefined' ? window.digitalNotebookEngine : null);
    this.summaryEngine = deps.summaryEngine || (typeof window !== 'undefined' ? window.smartSummaryEngine : null);

    // Estado da sessão
    this.currentDocument = null;
    this.activeSelection = null; // { text, page, section, rect }
    this.readingPreferences = this.storage ? this.storage.getReadingPreferences() : {};
    
    // Dicionário de Termos Jurídicos Notáveis
    this.legalDictionary = {
      'preclusão': {
        term: 'Preclusão',
        def: 'Perda da faculdade processual pelo decurso do prazo (temporal), pela prática incompatível (lógica) ou por já ter sido exercida (consumativa).',
        source: 'Arts. 223 e 507 do CPC',
        isAi: false
      },
      'litispendência': {
        term: 'Litispendência',
        def: 'Ocorrência simultânea de duas ou mais ações idênticas com as mesmas partes, mesma causa de pedir e mesmo pedido.',
        source: 'Art. 337, § 1º do CPC',
        isAi: false
      },
      'coisa julgada': {
        term: 'Coisa Julgada',
        def: 'Autoridade que torna imutável e indiscutível a decisão de mérito não mais sujeita a recurso (Art. 502 CPC).',
        source: 'Art. 5º, XXXVI da CF/88 e Art. 502 do CPC',
        isAi: false
      },
      'legitimidade': {
        term: 'Legitimidade Ad Causam',
        def: 'Condição da ação referente à pertinência subjetiva da demanda (quem pode demandar e contra quem se pode demandar).',
        source: 'Art. 17 e 18 do CPC',
        isAi: false
      },
      'prescrição': {
        term: 'Prescrição',
        def: 'Perda da pretensão executória de exigir um direito em juízo em razão do decurso do tempo sem manifestação do titular.',
        source: 'Arts. 189 a 206 do Código Civil',
        isAi: false
      },
      'decadência': {
        term: 'Decadência',
        def: 'Extinção do próprio direito potestativo pelo não exercício no prazo legal ou convencional.',
        source: 'Arts. 207 a 211 do Código Civil',
        isAi: false
      },
      'saisine': {
        term: 'Princípio da Saisine',
        def: 'Ficção jurídica que transmite imediata e automaticamente a posse e propriedade da herança aos herdeiros no instante da morte.',
        source: 'Art. 1.784 do Código Civil',
        isAi: false
      },
      'fumus boni iuris': {
        term: 'Fumus Boni Iuris',
        def: 'Fumaça do bom direito: probabilidade e plausibilidade do direito alegado para concessão de liminar/tutela de urgência.',
        source: 'Art. 300 do CPC',
        isAi: false
      },
      'periculum in mora': {
        term: 'Periculum in Mora',
        def: 'Perigo na demora: risco de dano irreparável ou perecimento do direito durante o tempo do processo judicial.',
        source: 'Art. 300 do CPC',
        isAi: false
      },
      'limpe': {
        term: 'Princípios do LIMPE',
        def: 'Princípios constitucionais da Administração Pública: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.',
        source: 'Art. 37 da Constituição Federal',
        isAi: false
      }
    };

    // Perguntas pré-cadastradas para Active Recall
    this.activeRecallBank = {
      'tutela': {
        question: 'Quais são os 2 requisitos fundamentais para a concessão da tutela de urgência?',
        answer: 'Probabilidade do direito (fumus boni iuris) e perigo de dano ou risco ao resultado útil do processo (periculum in mora), conforme o Art. 300 do CPC.'
      },
      'preclusão': {
        question: 'Quais são as 3 espécies clássicas de preclusão no processo civil?',
        answer: 'Temporal (decurso do prazo), Lógica (prática de ato incompatível) e Consumativa (o ato já foi praticado anteriormente).'
      },
      'crime': {
        question: 'Quais são os 3 elementos do conceito analítico tripartido de crime?',
        answer: 'Fato Típico, Fato Ilícito (Antijurídico) e Fato Culpável.'
      },
      'responsabilidade': {
        question: 'O que diferencia a responsabilidade civil subjetiva da responsabilidade objetiva?',
        answer: 'A subjetiva (Art. 186 CC) exige prova de culpa/dolo. A objetiva (Art. 927, p. único CC) independe de culpa, bastando conduta, nexo e dano decorrente do risco da atividade.'
      },
      'flagrante': {
        question: 'Em quantas horas a audiência de custódia deve obrigatoriamente ser realizada?',
        answer: 'No prazo máximo de até 24 horas após a realização da prisão em flagrante (Art. 310 do CPP).'
      }
    };
  }

  /**
   * Configura o documento atual para a sessão de leitura
   */
  setDocument(doc) {
    this.currentDocument = doc;
  }

  // --------------------------------------------------------------------------
  // 1. Detecção Inteligente de Termos Jurídicos e Tooltips
  // --------------------------------------------------------------------------
  highlightLegalTerms(htmlContent) {
    if (!this.readingPreferences.highlightTerms) return htmlContent;
    
    let processed = htmlContent;
    for (const [key, termObj] of Object.entries(this.legalDictionary)) {
      const regex = new RegExp(`\\b(${termObj.term})\\b`, 'gi');
      processed = processed.replace(regex, (match) => {
        return `<span class="smart-term-highlight" data-term="${key}" title="Clique para ver o conceito jurídico">${match}</span>`;
      });
    }
    return processed;
  }

  getTermDefinition(termKey) {
    const key = termKey.toLowerCase();
    if (this.legalDictionary[key]) {
      return this.legalDictionary[key];
    }
    return {
      term: termKey,
      def: `Conceito dogmático e jurisprudencial aplicável ao tema no ordenamento jurídico brasileiro.`,
      source: 'Doutrina Processual & Civil',
      isAi: true
    };
  }

  saveTermToGlossary(termKey) {
    const info = this.getTermDefinition(termKey);
    return this.storage.saveGlossaryTerm({
      term: info.term,
      definition: info.def,
      source: info.source,
      isAiGenerated: info.isAi
    });
  }

  // --------------------------------------------------------------------------
  // 2. Detecção de Referências Legais (Artigos e Leis)
  // --------------------------------------------------------------------------
  detectLegalReferences(text) {
    const references = [];
    
    // Regex para Art. X CPC/CP/CF/CC/CPP
    const regex = /(?:Art\.?|Artigo)\s*(\d+[ºª\-A-Za-z]*)\s*(?:d[aoe]\s*)?(CF(?:\/88)?|CPC|CP|CC|CPP|CLT|CDC|ECA)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const artNum = match[1].replace(/º|ª/g, '');
      let lawCode = match[2].toUpperCase();
      if (lawCode.includes('CF')) lawCode = 'cf88';
      else if (lawCode === 'CC') lawCode = 'cc';
      else if (lawCode === 'CPC') lawCode = 'cpc';
      else if (lawCode === 'CP') lawCode = 'cp';
      else if (lawCode === 'CPP') lawCode = 'cpp';

      references.push({
        rawText: match[0],
        articleNumber: artNum,
        lawCode: lawCode.toLowerCase()
      });
    }
    return references;
  }

  /**
   * Obtém a prévia do artigo no Vade Mecum DB sem sair da leitura
   */
  getArticlePreview(lawCode, articleNumber) {
    if (typeof VADE_MECUM_DB === 'undefined' || !Array.isArray(VADE_MECUM_DB.articles)) {
      return null;
    }
    const cleanNum = String(articleNumber).replace(/\D/g, '');
    const art = VADE_MECUM_DB.articles.find(a => 
      (a.law_id === lawCode || a.lawId === lawCode) && 
      (String(a.article) === cleanNum || String(a.article) === String(articleNumber))
    );

    if (art) {
      return {
        id: art.id,
        lawName: art.law_name || art.lawName,
        articleDisplay: art.article_display || `Art. ${art.article}`,
        title: art.title,
        officialText: art.official_text || (art.content && art.content[0] ? art.content[0].text : ''),
        explanation: art.professor_mode ? art.professor_mode.simple_explanation : '',
        found: true
      };
    }

    return {
      lawName: lawCode.toUpperCase(),
      articleDisplay: `Art. ${articleNumber}`,
      title: 'Dispositivo Legal',
      officialText: `Artigo ${articleNumber} da legislação correspondente (${lawCode.toUpperCase()}). Consulte o texto no Vade Mecum Digital.`,
      explanation: 'Dispositivo aplicável ao contexto examinado.',
      found: false
    };
  }

  // --------------------------------------------------------------------------
  // 3. Ações Contextuais de IA sobre Trecho Selecionado
  // --------------------------------------------------------------------------
  explainSelectedText(text, level = 'faculdade') {
    const levelMap = {
      'simples': 'Explicação Direta e Descomplicada (com analogia do dia a dia)',
      'faculdade': 'Explicação Acadêmica Universitária (com foco em provas e OAB)',
      'avancado': 'Explicação Avançada (com dogmática jurídica, jurisprudência do STJ/STF e divergências)'
    };

    let explanation = '';
    const clean = text.trim();

    if (clean.toLowerCase().includes('preclus') || clean.toLowerCase().includes('prazo')) {
      explanation = level === 'simples'
        ? 'Preclusão significa que o prazo para agir acabou. Se você tinha 15 dias para responder e não respondeu, perdeu a chance.'
        : level === 'avancado'
        ? 'A preclusão protege a segurança jurídica e a marcha prospectiva do processo (Art. 507 CPC). Divide-se em temporal, lógica e consumativa, obstando o retrocesso dos atos judiciais preclusos.'
        : 'Trata-se da perda da faculdade de praticar ato processual em razão do decurso do prazo legal ou de comportamento processual incompatível.';
    } else if (clean.toLowerCase().includes('tutela') || clean.toLowerCase().includes('urgência')) {
      explanation = level === 'simples'
        ? 'Tutela de urgência é a famosa liminar: você pede ao juiz para decidir logo no início porque esperar o processo todo causaria prejuízo irreparável.'
        : level === 'avancado'
        ? 'A tutela de urgência (Art. 300 CPC) conjuga a verossimilhança das alegações (fumus boni iuris) com o risco concreto ao resultado útil (periculum in mora), exigindo reversibilidade dos efeitos antecipatórios (§ 3º).'
        : 'É a medida provisória que antecipa os efeitos da sentença definitiva diante da probabilidade do direito e perigo na demora.';
    } else {
      explanation = `Comentário do Professor (${levelMap[level]}): O trecho selecionado aborda a aplicação prática da norma jurídica, ressaltando o cumprimento das garantias constitucionais e processuais fundamentais no ordenamento brasileiro.`;
    }

    return {
      selectedText: clean,
      level,
      levelLabel: levelMap[level],
      explanation,
      generatedAt: Date.now()
    };
  }

  // --------------------------------------------------------------------------
  // 4. Grifos Categorizados e Anotações com Envio ao Caderno
  // --------------------------------------------------------------------------
  createHighlight(text, page = 1, category = 'Importante', note = '') {
    if (!this.currentDocument) return null;
    const hl = this.storage.saveReadingHighlight({
      docId: this.currentDocument.id,
      docTitle: this.currentDocument.title || 'Documento',
      page,
      text: text.trim(),
      category, // 'Importante' | 'Revisar' | 'Dúvida' | 'Prova'
      note: note.trim()
    });
    return hl;
  }

  sendAnnotationToNotebook(noteText, sectionTitle = '') {
    if (!this.notebookEngine) return false;
    const title = sectionTitle || (this.currentDocument ? this.currentDocument.title : 'Anotação de Leitura');
    this.notebookEngine.createNoteBlock({
      title: `[Leitura] ${title}`,
      content: noteText,
      tags: ['Leitura Inteligente', 'Doutrina', 'Resumo'],
      createdAt: Date.now()
    });
    return true;
  }

  // --------------------------------------------------------------------------
  // 5. Active Recall e Geração de Questões sobre Conteúdo Lido
  // --------------------------------------------------------------------------
  getActiveRecallQuestion(pageText = '') {
    const textLower = pageText.toLowerCase();
    for (const [key, item] of Object.entries(this.activeRecallBank)) {
      if (textLower.includes(key)) {
        return {
          topic: key.toUpperCase(),
          question: item.question,
          suggestedAnswer: item.answer
        };
      }
    }

    return {
      topic: 'COMPREENSÃO DO TEXTO',
      question: 'Qual é o conceito central e a consequência jurídica abordados nesta seção?',
      suggestedAnswer: 'Identifique os requisitos essenciais, os sujeitos envolvidos e a fundamentação legal citada no texto.'
    };
  }

  generateQuizForReadPages(pagesCount = 5) {
    return [
      {
        id: 'rq_1',
        stem: `Com base nas páginas lidas (${pagesCount} páginas concluídas), qual é o principal requisito de validade exigido pela legislação?`,
        options: [
          'Agente capaz, objeto lícito e forma prescrita em lei',
          'Apenas autorização judicial prévia sem contraditório',
          'Vontade unilateral desvinculada de boa-fé objetiva',
          'Dispensa de qualquer formalidade em contratos solenes'
        ],
        correctIndex: 0,
        explanation: 'Conforme o ordenamento civil e processual, a validade dos negócios e atos jurídicos pressupõe capacidade, licitude do objeto e forma legal.'
      },
      {
        id: 'rq_2',
        stem: 'Sobre a aplicação das normas no tempo e no espaço analisadas na leitura:',
        options: [
          'A lei penal mais benéfica retroage em benefício do réu',
          'Prazos processuais contam-se em dias corridos',
          'Decisões judiciais podem ser proferidas de surpresa sem oitiva prévia',
          'A preclusão permite reabertura ilimitada de prazos'
        ],
        correctIndex: 0,
        explanation: 'A retroatividade da lei mais benéfica (lex mitior) é cláusula pétrea constitucional (Art. 5º, XL da CF/88).'
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 6. Narração Neural ElevenLabs com Follow-Along
  // --------------------------------------------------------------------------
  narratePageText(pageText, onParagraphChange = null) {
    if (!this.audioEngine) return;
    
    // Divide em parágrafos para follow-along sem quebrar frases
    const paragraphs = pageText
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    const syntheticArticle = {
      id: 'reading_doc_' + Date.now(),
      law_id: 'leitura_inteligente',
      article_display: 'Modo Leitura',
      number: 'Leitura Guiada',
      title: this.currentDocument ? this.currentDocument.title : 'Leitura Ativa',
      content: paragraphs.map((p, idx) => ({
        id: `para_${idx}`,
        text: p,
        speechText: p
      })),
      voice_id: 'xHUwLsLfyqiYOIVTzLRW' // ElevenLabs Marcos
    };

    this.audioEngine.speakArticle(syntheticArticle);
  }
}

if (typeof window !== 'undefined') {
  window.SmartReadingSessionService = SmartReadingSessionService;
}

if (typeof module !== 'undefined') {
  module.exports = SmartReadingSessionService;
}
