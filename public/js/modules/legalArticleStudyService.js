/**
 * VadeAudio AI - LegalArticleStudyService, DiffService & RelationService (Etapa 40)
 * Agregador Multidisciplinar de Estudo Artigo por Artigo.
 * Proteção Estrita do Texto Oficial (⚖️ TEXTO OFICIAL) vs Conteúdos Derivados de IA (🤖 Explicação IA).
 */

class LegalArticleDiffService {
  /**
   * Compara de forma determinística duas versões textuais do mesmo artigo
   */
  static computeDiff(oldText = '', newText = '') {
    const oldWords = (oldText || '').trim().split(/\s+/);
    const newWords = (newText || '').trim().split(/\s+/);

    const additions = newWords.filter(w => !oldWords.includes(w));
    const deletions = oldWords.filter(w => !newWords.includes(w));
    const isIdentical = oldText.trim() === newText.trim();

    return {
      isIdentical,
      additionsCount: additions.length,
      deletionsCount: deletions.length,
      additions,
      deletions,
      summary: isIdentical 
        ? 'As redações são idênticas.'
        : `Identificadas ${additions.length} palavras inseridas e ${deletions.length} suprimidas na nova redação.`
    };
  }
}

class LegalArticleRelationService {
  /**
   * Retorna os artigos e dispositivos diretamente relacionados no ordenamento
   */
  static getRelatedArticles(articleId) {
    const idClean = (articleId || '').toLowerCase();
    const relations = {
      'cpc_art_300': [
        { id: 'cpc_art_303', label: 'Art. 303 CPC (Tutela Antecipada Antecedente)', type: 'procedimento' },
        { id: 'cpc_art_311', label: 'Art. 311 CPC (Tutela da Evidência)', type: 'contraposicao' }
      ],
      'cc_art_186': [
        { id: 'cc_art_927', label: 'Art. 927 CC (Dever de Indenizar e Responsabilidade Objetiva)', type: 'efeito_juridico' },
        { id: 'cdc_art_14', label: 'Art. 14 CDC (Responsabilidade do Fornecedor)', type: 'microssistema' }
      ],
      'cp_art_25': [
        { id: 'cp_art_23', label: 'Art. 23 CP (Excludentes de Ilicitude em Geral)', type: 'genero' },
        { id: 'cp_art_24', label: 'Art. 24 CP (Estado de Necessidade)', type: 'distincao' }
      ]
    };

    return relations[idClean] || [];
  }
}

class LegalArticleStudyService {
  constructor(storage, jurisprudenceDb) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.jurisprudenceDb = jurisprudenceDb || (typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : []);
  }

  /**
   * Constrói o dossiê completo de estudo artigo por artigo
   */
  buildStudyStation(article) {
    if (!article) return null;

    const articleId = article.id || `art_${article.number}`;
    const artNumber = article.number || '';
    const lawId = article.law_id || article.lawId || 'cpc';

    // 1. Jurisprudência do STF/STJ vinculada ao dispositivo
    const linkedJurisprudence = this.jurisprudenceDb.filter(j => 
      (j.relatedArticles || []).some(ra => ra.toLowerCase().includes(artNumber.toLowerCase()) || ra.toLowerCase().includes(lawId.toLowerCase()))
    );

    // 2. Doutrina pessoal da Biblioteca
    const libraryQuotes = this.storage ? this.storage.getLibraryQuotes() : [];
    const linkedQuotes = libraryQuotes.filter(q => 
      q.text.toLowerCase().includes(artNumber.toLowerCase()) || (q.tags || []).some(t => t.toLowerCase().includes(artNumber.toLowerCase()))
    );

    // 3. Questões relacionadas
    const generatedQuestions = this.storage ? (this.storage.getUserItem('vadeaudio_generated_questions', []) || []) : [];
    const linkedQuestions = generatedQuestions.filter(q => (q.legalBasis || '').includes(artNumber));

    // 4. Anotações pessoais
    const personalNotes = this.storage ? this.storage.getArticleAnnotations(articleId) : [];

    // 5. Explicações por Nível
    const explanations = {
      simples: `O **Art. ${artNumber}** estabelece a regra geral e os pressupostos básicos para aplicação deste instituto no direito brasileiro.`,
      faculdade: `Na dogmática jurídica, o **Art. ${artNumber}** estrutura os requisitos essenciais, os conceitos fundamentais e a técnica de subsunção aplicada aos casos concretos.`,
      oab: `Para o Exame da OAB, o **Art. ${artNumber}** costuma ser cobrado em questões práticas para fundamentação da peça ou distinção com institutos afins.`,
      concurso: `Em concursos públicos, atente-se à literalidade, às exceções expressas e aos precedentes qualificados do STJ e STF vinculados ao **Art. ${artNumber}**.`,
      avancado: `Análise sistemática e hermenêutica do **Art. ${artNumber}**, com diálogo das fontes, teorias doutrinárias divergentes e teses repetitivas superiores.`
    };

    return {
      article,
      officialText: article.text || (article.content ? article.content.map(c => c.text).join('\n') : 'Texto oficial indisponível.'),
      articleId,
      explanations,
      linkedJurisprudence,
      linkedQuotes,
      linkedQuestions,
      personalNotes,
      relatedArticles: LegalArticleRelationService.getRelatedArticles(articleId)
    };
  }
}

if (typeof window !== 'undefined') {
  window.LegalArticleDiffService = LegalArticleDiffService;
  window.LegalArticleRelationService = LegalArticleRelationService;
  window.LegalArticleStudyService = LegalArticleStudyService;
}

if (typeof module !== 'undefined') {
  module.exports = {
    LegalArticleDiffService,
    LegalArticleRelationService,
    LegalArticleStudyService
  };
}
