/**
 * VadeAudio AI - FlashcardGenerationService (Etapa 35)
 * Geração Atômica de Flashcards a partir de Artigos, Erros em Simulados, Caderno e Aulas.
 * Agrupamento por Conceito Central (MemoryConcept) e Validação Imediata de Qualidade.
 */

class FlashcardGenerationService {
  constructor(deps = {}) {
    this.storage = deps.storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.vadeMecumDb = deps.vadeMecumDb || (typeof VADE_MECUM_DB !== 'undefined' ? VADE_MECUM_DB : null);
    this.validator = deps.validator || null;
  }

  /**
   * Gera cartões atômicos a partir de um artigo do Vade Mecum
   */
  async generateFromArticle(articleId, options = {}) {
    let article = null;
    if (this.vadeMecumDb && Array.isArray(this.vadeMecumDb.articles)) {
      article = this.vadeMecumDb.articles.find(a => a.id === articleId || a.article === String(articleId));
    }

    const artDisplay = article ? (article.article_display || `Art. ${article.article}`) : `Artigo ${articleId}`;
    const lawName = article ? (article.law_name || article.law_id.toUpperCase()) : 'Vade Mecum';

    const cards = [];

    if (articleId === 'cpc-art300' || String(articleId) === '300') {
      // 1. Q&A Requisitos
      cards.push({
        id: 'fc_cpc300_req',
        conceptId: 'concept_tutela_urgencia',
        question: `Quais são os 2 requisitos cumulativos para a concessão da tutela de urgência no Art. 300 do CPC?`,
        answer: `1. Probabilidade do direito (fumus boni iuris);\n2. Perigo de dano ou risco ao resultado útil do processo (periculum in mora).`,
        type: 'qa',
        subject: 'Processo Civil',
        legalReference: 'Art. 300, caput do CPC',
        sourceId: 'cpc-art300'
      });

      // 2. Cloze Reversibilidade
      cards.push({
        id: 'fc_cpc300_reversib',
        conceptId: 'concept_tutela_urgencia',
        question: `A tutela de urgência de natureza antecipada não será concedida quando houver perigo de {{irreversibilidade}} dos efeitos da decisão (§ 3º do Art. 300 CPC).`,
        answer: `irreversibilidade`,
        type: 'cloze',
        subject: 'Processo Civil',
        legalReference: 'Art. 300, § 3º do CPC',
        sourceId: 'cpc-art300'
      });
    } else if (articleId === 'cp-art121' || String(articleId) === '121') {
      cards.push({
        id: 'fc_cp121_hediondo',
        conceptId: 'concept_homicidio',
        question: `O homicídio qualificado (Art. 121, § 2º CP) é considerado crime hediondo?`,
        answer: `Sim. É crime hediondo conforme o Art. 1º, inciso I da Lei nº 8.072/1990.`,
        type: 'qa',
        subject: 'Direito Penal',
        legalReference: 'Art. 121, § 2º do CP',
        sourceId: 'cp-art121'
      });
    } else {
      cards.push({
        id: 'fc_gen_' + Date.now(),
        conceptId: 'concept_' + (article ? article.law_id : 'lei'),
        question: `Qual é o núcleo normativo estabelecido no ${artDisplay} do ${lawName}?`,
        answer: article ? (article.professor_mode ? article.professor_mode.summary : 'Diretriz legal vinculante.') : 'Dispositivo normativo vigente.',
        type: 'qa',
        subject: article ? (article.subject_id || 'Direito') : 'Direito',
        legalReference: `${artDisplay} ${lawName}`,
        sourceId: articleId
      });
    }

    // Valida e salva os cartões gerados
    const validatedCards = [];
    for (const card of cards) {
      if (this.validator) {
        const val = this.validator.validateCard(card);
        card.status = val.status;
        card.qualityScore = val.qualityScore;
      } else {
        card.status = 'active';
        card.qualityScore = 90;
      }
      if (this.storage) {
        this.storage.saveSmartFlashcard(card);
      }
      validatedCards.push(card);
    }

    return validatedCards;
  }

  /**
   * Gera cartão atômico inteligente a partir de um erro em simulado ou questão
   */
  async generateFromQuestionError(question) {
    const topic = question.topic || 'Conceito Jurídico';
    const card = {
      id: 'fc_err_' + Date.now(),
      conceptId: 'concept_error_' + topic.toLowerCase().replace(/\s+/g, '_'),
      question: `[Reforço de Erro] Em relação ao tema "${topic}", qual é a regra jurídica correta?`,
      answer: question.explanation ? question.explanation.replace(/Gabarito:?\s*(Alternativa\s*[A-E]\.?\s*)?/i, '').trim() : 'Consulte a fundamentação oficial.',
      type: 'qa',
      subject: question.subject || 'Revisão de Erros',
      legalReference: (question.legal_references || [])[0] || 'Vade Mecum',
      sourceQuestionId: question.id,
      isFromError: true,
      stability: 0.8, // Começa com estabilidade reduzida para priorizar na revisão
      difficulty: 6.5
    };

    if (this.validator) {
      const val = this.validator.validateCard(card);
      card.status = val.status;
      card.qualityScore = val.qualityScore;
    } else {
      card.status = 'active';
    }

    if (this.storage) {
      this.storage.saveSmartFlashcard(card);
    }
    return card;
  }
}

if (typeof window !== 'undefined') {
  window.FlashcardGenerationService = FlashcardGenerationService;
}

if (typeof module !== 'undefined') {
  module.exports = FlashcardGenerationService;
}
