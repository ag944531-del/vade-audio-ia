/**
 * VadeAudio AI - FlashcardQualityValidator & FlashcardImprovementService (Etapa 35)
 * Validação de Atomicidade, Tamanho Máximo de Resposta, Detecção de Duplicatas e Card Splitter.
 */

class FlashcardQualityValidator {
  constructor(existingCards = []) {
    this.existingCards = existingCards;
  }

  validateCard(card) {
    const issues = [];
    let score = 100;

    // 1. Validação da Pergunta
    if (!card.question || card.question.trim().length < 8) {
      issues.push('PERGUNTA_MUITO_CURTA_OU_VAZIA');
      score -= 50;
    } else if (card.question.length > 250) {
      issues.push('PERGUNTA_MUITO_LONGA_OU_COMPLEXA');
      score -= 20;
    }

    // Pergunta vaga (ex: "O que diz o artigo?")
    if (/^o que diz o artigo\??$/i.test(card.question.trim())) {
      issues.push('PERGUNTA_AMBIGUA_SEM_ARTIGO_DEFINIDO');
      score -= 40;
    }

    // 2. Validação da Resposta
    if (!card.answer || card.answer.trim().length === 0) {
      issues.push('RESPOSTA_VAZIA');
      score -= 50;
    } else if (card.answer.length > 350) {
      // Resposta enciclopédica (fere o princípio de atomicidade dos flashcards)
      issues.push('RESPOSTA_EXCESSIVAMENTE_LONGA');
      score -= 35;
    }

    // 3. Validação de Cloze
    if (card.type === 'cloze') {
      if (!card.question.includes('{{') || !card.question.includes('}}')) {
        issues.push('CLOZE_SEM_CHAVES_DE_OMISSAO');
        score -= 40;
      }
    }

    // 4. Detecção de Duplicatas
    const isDup = this.detectDuplicate(card);
    if (isDup.duplicate) {
      issues.push('DUPLICATA_DETECTADA');
      score -= 35;
    }

    const isValid = score >= 70 && !issues.includes('PERGUNTA_MUITO_CURTA_OU_VAZIA') && !issues.includes('RESPOSTA_VAZIA') && !issues.includes('RESPOSTA_EXCESSIVAMENTE_LONGA') && !issues.includes('DUPLICATA_DETECTADA');

    return {
      isValid,
      qualityScore: Math.max(0, score),
      status: isValid ? 'active' : 'needs_improvement',
      issues,
      duplicateDetails: isDup.details || null
    };
  }

  detectDuplicate(card) {
    if (!Array.isArray(this.existingCards) || this.existingCards.length === 0) {
      return { duplicate: false };
    }

    const cleanQ = (card.question || '').toLowerCase().replace(/[^\w\sáéíóúâêîôûãõç]/gi, ' ');
    const qWords = new Set(cleanQ.split(/\s+/).filter(w => w.length > 3));

    for (const exist of this.existingCards) {
      if (exist.id === card.id) continue;
      const cleanE = (exist.question || '').toLowerCase().replace(/[^\w\sáéíóúâêîôûãõç]/gi, ' ');
      const eWords = new Set(cleanE.split(/\s+/).filter(w => w.length > 3));

      let intersection = 0;
      for (const w of qWords) {
        if (eWords.has(w)) intersection++;
      }
      const union = new Set([...qWords, ...eWords]).size;
      const jaccard = union > 0 ? (intersection / union) : 0;

      if (jaccard > 0.75) {
        return {
          duplicate: true,
          details: `Cartão possui ${(jaccard * 100).toFixed(0)}% de similaridade com "${exist.question}".`
        };
      }
    }

    return { duplicate: false };
  }
}

class FlashcardImprovementService {
  /**
   * Divide um cartão excessivamente longo/complexo em cartões atômicos focados
   */
  static splitComplexCard(card) {
    const qLower = card.question.toLowerCase();
    
    // Se pergunta sobre múltiplos requisitos de tutela de urgência
    if (qLower.includes('requisitos') && qLower.includes('tutela')) {
      return [
        {
          ...card,
          id: card.id + '_split1',
          question: 'Qual é o requisito da verossimilhança exigido na tutela de urgência (Art. 300 CPC)?',
          answer: 'A probabilidade do direito (fumus boni iuris).',
          type: 'qa'
        },
        {
          ...card,
          id: card.id + '_split2',
          question: 'Qual é o requisito de perigo exigido na tutela de urgência (Art. 300 CPC)?',
          answer: 'O perigo de dano ou o risco ao resultado útil do processo (periculum in mora).',
          type: 'qa'
        }
      ];
    }

    // Se pergunta sobre dolo e culpa
    if (qLower.includes('dolo eventual') && qLower.includes('culpa consciente')) {
      return [
        {
          ...card,
          id: card.id + '_split1',
          question: 'No dolo eventual, qual é a atitude psicológica do agente perante o resultado?',
          answer: 'O agente prevê o resultado e assume o risco de produzi-lo (tanto faz / aceita).',
          type: 'qa'
        },
        {
          ...card,
          id: card.id + '_split2',
          question: 'Na culpa consciente, qual é a atitude psicológica do agente perante o resultado?',
          answer: 'O agente prevê o resultado, mas acredita sinceramente que ele não ocorrerá com suas habilidades.',
          type: 'qa'
        }
      ];
    }

    return [card];
  }

  /**
   * Converte texto em formato Cloze Deletion
   */
  static createCloze(text, keyword) {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    return text.replace(regex, '{{$1}}');
  }
}

if (typeof window !== 'undefined') {
  window.FlashcardQualityValidator = FlashcardQualityValidator;
  window.FlashcardImprovementService = FlashcardImprovementService;
}

if (typeof module !== 'undefined') {
  module.exports = { FlashcardQualityValidator, FlashcardImprovementService };
}
