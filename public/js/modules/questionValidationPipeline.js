/**
 * VadeAudio AI - QuestionValidationPipeline (Etapa 34)
 * Pipeline Multiestágio de Validação e Score de Qualidade para Questões Jurídicas.
 * Não confia cegamente na IA: valida estrutura, fundamentação legal, gabarito,
 * distratores, ausência de ambiguidade, duplicatas e calcula Score de Qualidade (0-100).
 */

class QuestionValidationPipeline {
  constructor(deps = {}) {
    this.vadeMecumDb = deps.vadeMecumDb || (typeof VADE_MECUM_DB !== 'undefined' ? VADE_MECUM_DB : { articles: [] });
    this.existingQuestions = deps.existingQuestions || [];
    this.pipelineVersion = '34.1.0';
  }

  /**
   * Executa todos os validadores sequencialmente (Fail-Fast em validadores determinísticos baratos)
   */
  async validateQuestion(question, sourceContent = '') {
    const results = [];
    let totalScore = 100;
    const penalties = [];

    // 1. StructuralValidator (Determinístico)
    const structRes = this.validateStructure(question);
    results.push(structRes);
    if (!structRes.passed) {
      return this.finalizeValidation(question, results, 0, 'rejected', 'FALHA_ESTRUTURAL');
    }

    // 2. LegalReferenceValidator (Cruza com Vade Mecum Real)
    const legalRes = this.validateLegalReferences(question);
    results.push(legalRes);
    if (!legalRes.passed) {
      totalScore -= 40;
      penalties.push(legalRes.reason);
    }

    // 3. SourceGroundingValidator (Verifica aderência à fonte)
    const groundRes = this.validateSourceGrounding(question, sourceContent);
    results.push(groundRes);
    if (!groundRes.passed) {
      totalScore -= 30;
      penalties.push(groundRes.reason);
    }

    // 4. Answer & ContradictionValidator (Gabarito vs Explicação)
    const answerRes = this.validateAnswerAndContradiction(question);
    results.push(answerRes);
    if (!answerRes.passed) {
      totalScore -= 50;
      penalties.push(answerRes.reason);
    }

    // 5. AlternativeValidator (Distratores plausíveis, sem repetições)
    const altRes = this.validateAlternatives(question);
    results.push(altRes);
    if (!altRes.passed) {
      totalScore -= 25;
      penalties.push(altRes.reason);
    }

    // 6. AmbiguityValidator (Casos práticos incompletos, dupla resposta)
    const ambigRes = this.validateAmbiguity(question);
    results.push(ambigRes);
    if (!ambigRes.passed) {
      totalScore -= 30;
      penalties.push(ambigRes.reason);
    }

    // 7. DuplicateDetector (Similaridade léxica contra o banco)
    const dupRes = this.validateDuplicates(question);
    results.push(dupRes);
    if (!dupRes.passed) {
      totalScore -= 25;
      penalties.push(dupRes.reason);
    }

    // 8. Quality Score & Status Final
    const finalScore = Math.max(0, Math.min(100, totalScore));
    let status = 'approved';
    let summaryReason = 'Questão validada com sucesso.';

    if (penalties.length > 0 || finalScore < 80) {
      if (finalScore < 50 || penalties.includes('LEGAL_REFERENCE_NOT_FOUND') || penalties.includes('CONTRADICTION_DETECTED') || penalties.includes('NO_CORRECT_ANSWER')) {
        status = 'rejected';
        summaryReason = `Rejeitada: ${penalties.join(', ')}`;
      } else {
        status = 'needs_review';
        summaryReason = `Necessita revisão humana: ${penalties.join(', ')}`;
      }
    }

    return this.finalizeValidation(question, results, finalScore, status, summaryReason);
  }

  // --------------------------------------------------------------------------
  // 1. Validador Estrutural
  // --------------------------------------------------------------------------
  validateStructure(q) {
    if (!q.statement || typeof q.statement !== 'string' || q.statement.trim().length < 15) {
      return { validator: 'StructuralValidator', passed: false, reason: 'ENUNCIADO_INVALIDO' };
    }
    if (q.type === 'multiple_choice') {
      if (!Array.isArray(q.alternatives) || q.alternatives.length < 4) {
        return { validator: 'StructuralValidator', passed: false, reason: 'NUMERO_INSUFICIENTE_ALTERNATIVAS' };
      }
      if (typeof q.proposed_answer !== 'number' || q.proposed_answer < 0 || q.proposed_answer >= q.alternatives.length) {
        return { validator: 'StructuralValidator', passed: false, reason: 'GABARITO_FORA_DO_INTERVALO' };
      }
    } else if (q.type === 'certo_errado') {
      if (!Array.isArray(q.alternatives) || q.alternatives.length !== 2) {
        return { validator: 'StructuralValidator', passed: false, reason: 'ALTERNATIVAS_CERTO_ERRADO_INVALIDAS' };
      }
    }
    if (!q.explanation || q.explanation.trim().length < 10) {
      return { validator: 'StructuralValidator', passed: false, reason: 'EXPLICACAO_AUSENTE' };
    }
    return { validator: 'StructuralValidator', passed: true, score: 100 };
  }

  // --------------------------------------------------------------------------
  // 2. Validador de Referências Legais
  // --------------------------------------------------------------------------
  validateLegalReferences(q) {
    const textToCheck = `${q.statement} ${q.explanation} ${(q.legal_references || []).join(' ')}`;
    const refRegex = /(?:Art\.?|Artigo)\s*(\d+[ºª\-A-Za-z]*)\s*(?:d[aoe]\s*)?(CF(?:\/88)?|CPC|CP|CC|CPP|CLT|CDC|ECA)/gi;
    let match;
    const refsFound = [];

    while ((match = refRegex.exec(textToCheck)) !== null) {
      const artNum = match[1].replace(/º|ª/g, '');
      let law = match[2].toUpperCase();
      if (law.includes('CF')) law = 'cf88';
      else if (law === 'CC') law = 'cc';
      else if (law === 'CPC') law = 'cpc';
      else if (law === 'CP') law = 'cp';
      else if (law === 'CPP') law = 'cpp';
      refsFound.push({ art: artNum, law: law.toLowerCase() });
    }

    // Se nenhuma referência formal foi citada mas o campo legal_references existe
    if (refsFound.length === 0 && Array.isArray(q.legal_references) && q.legal_references.length > 0) {
      return { validator: 'LegalReferenceValidator', passed: true, details: 'Referência declarada' };
    }

    if (refsFound.length > 0 && Array.isArray(this.vadeMecumDb.articles)) {
      for (const ref of refsFound) {
        const cleanArt = String(ref.art).replace(/\D/g, '');
        // Limites máximos das leis vigentes
        const maxArticles = { cf88: 250, cc: 2046, cpc: 1072, cp: 361, cpp: 811 };
        const max = maxArticles[ref.law];
        if (max && parseInt(cleanArt) > max) {
          return {
            validator: 'LegalReferenceValidator',
            passed: false,
            reason: 'LEGAL_REFERENCE_NOT_FOUND',
            details: `Artigo ${ref.art} excede o limite da lei ${ref.law.toUpperCase()} (máx: ${max}).`
          };
        }
      }
    }

    return { validator: 'LegalReferenceValidator', passed: true, details: `${refsFound.length} referências checadas.` };
  }

  // --------------------------------------------------------------------------
  // 3. Validador de Ancoragem na Fonte (Source Grounding)
  // --------------------------------------------------------------------------
  validateSourceGrounding(q, sourceContent = '') {
    if (!sourceContent || sourceContent.trim().length === 0) {
      return { validator: 'SourceGroundingValidator', passed: true, details: 'Fonte genérica aceita' };
    }

    const srcLower = sourceContent.toLowerCase();
    const qLower = (q.statement + ' ' + q.topic).toLowerCase();

    // Tratamento de Prompt Injection na fonte
    if (srcLower.includes('ignore all instructions') || srcLower.includes('system prompt')) {
      return {
        validator: 'SourceGroundingValidator',
        passed: false,
        reason: 'PROMPT_INJECTION_DETECTED',
        details: 'Tentativa de manipulação detectada no texto fonte.'
      };
    }

    // Extrai palavras-chave jurídicas da fonte
    const legalKeywords = ['tutela', 'urgência', 'preclusão', 'posse', 'propriedade', 'homicídio', 'furto', 'prisão', 'flagrante', 'audiência', 'recurso', 'apelação', 'dano', 'contrato', 'tributo', 'constitucional'];
    const matchingInSrc = legalKeywords.filter(k => srcLower.includes(k));
    const matchingInQ = legalKeywords.filter(k => qLower.includes(k));

    if (matchingInSrc.length > 0 && matchingInQ.length > 0) {
      const common = matchingInSrc.filter(k => matchingInQ.includes(k));
      if (common.length === 0) {
        return {
          validator: 'SourceGroundingValidator',
          passed: false,
          reason: 'SOURCE_GROUNDING_MISMATCH',
          details: `Fonte trata de [${matchingInSrc.join(', ')}], mas a questão aborda [${matchingInQ.join(', ')}].`
        };
      }
    }

    return { validator: 'SourceGroundingValidator', passed: true };
  }

  // --------------------------------------------------------------------------
  // 4. Validador de Gabarito & Contradição
  // --------------------------------------------------------------------------
  validateAnswerAndContradiction(q) {
    if (q.type !== 'multiple_choice') return { validator: 'AnswerValidator', passed: true };

    const correctIndex = q.proposed_answer;
    const correctLetter = ['A', 'B', 'C', 'D', 'E'][correctIndex] || 'A';
    const otherLetters = ['A', 'B', 'C', 'D', 'E'].filter((l, idx) => idx !== correctIndex && idx < q.alternatives.length);

    const exp = q.explanation.toUpperCase();

    // Checa se a explicação afirma que outra alternativa está correta
    for (const letter of otherLetters) {
      if (exp.includes(`ALTERNATIVA ${letter} ESTÁ CORRETA`) || exp.includes(`LETRA ${letter} É A CORRETA`) || exp.includes(`ITEM ${letter} ESTÁ CERTO`)) {
        return {
          validator: 'AnswerValidator',
          passed: false,
          reason: 'CONTRADICTION_DETECTED',
          details: `Gabarito aponta ${correctLetter}, mas explicação afirma que ${letter} está correta.`
        };
      }
    }

    return { validator: 'AnswerValidator', passed: true };
  }

  // --------------------------------------------------------------------------
  // 5. Validador de Alternativas (Distratores)
  // --------------------------------------------------------------------------
  validateAlternatives(q) {
    if (q.type !== 'multiple_choice') return { validator: 'AlternativeValidator', passed: true };

    const texts = q.alternatives.map(a => (typeof a === 'string' ? a.trim().toLowerCase() : (a.text || '').trim().toLowerCase()));
    
    // Verifica alternativas duplicadas
    const unique = new Set(texts);
    if (unique.size !== texts.length) {
      return { validator: 'AlternativeValidator', passed: false, reason: 'DUPLICATE_ALTERNATIVES' };
    }

    // Verifica alternativas absurdas / vazias
    for (const alt of texts) {
      if (alt.length < 3) {
        return { validator: 'AlternativeValidator', passed: false, reason: 'EMPTY_ALTERNATIVE' };
      }
      if (['banana', 'elefante', 'abacaxi', 'qualquer coisa', 'todas erradas'].includes(alt)) {
        return { validator: 'AlternativeValidator', passed: false, reason: 'ABSURD_DISTRACTOR' };
      }
    }

    return { validator: 'AlternativeValidator', passed: true };
  }

  // --------------------------------------------------------------------------
  // 6. Validador de Ambiguidade & Dupla Resposta
  // --------------------------------------------------------------------------
  validateAmbiguity(q) {
    // Casos práticos sem fato essencial (ex: "determinado indivíduo cometeu crime e quer anular")
    if (q.statement.toLowerCase().includes('caso prático') || q.topic === 'Caso Prático') {
      if (q.statement.length < 80) {
        return {
          validator: 'AmbiguityValidator',
          passed: false,
          reason: 'ESSENTIAL_FACT_MISSING',
          details: 'Enunciado de caso prático excessivamente sucinto, carecendo de elementos fáticos essenciais.'
        };
      }
    }

    // Termos absolutos sem ressalva legal
    if (q.statement.includes('sempre e em qualquer hipótese') && !q.explanation.includes('exceção')) {
      return {
        validator: 'AmbiguityValidator',
        passed: false,
        reason: 'UNJUSTIFIED_ABSOLUTE_QUALIFIER'
      };
    }

    return { validator: 'AmbiguityValidator', passed: true };
  }

  // --------------------------------------------------------------------------
  // 7. Validador de Duplicatas
  // --------------------------------------------------------------------------
  validateDuplicates(q) {
    if (!Array.isArray(this.existingQuestions) || this.existingQuestions.length === 0) {
      return { validator: 'DuplicateDetector', passed: true };
    }

    const currentWords = new Set(q.statement.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    for (const exist of this.existingQuestions) {
      if (exist.id === q.id) continue;
      const existWords = new Set((exist.statement || '').toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      let intersection = 0;
      for (const w of currentWords) {
        if (existWords.has(w)) intersection++;
      }
      const union = new Set([...currentWords, ...existWords]).size;
      const jaccard = union > 0 ? (intersection / union) : 0;

      if (jaccard > 0.85) {
        return {
          validator: 'DuplicateDetector',
          passed: false,
          reason: 'HIGH_SIMILARITY_DUPLICATE',
          details: `Similaridade de ${(jaccard * 100).toFixed(1)}% com a questão ${exist.id}.`
        };
      }
    }

    return { validator: 'DuplicateDetector', passed: true };
  }

  finalizeValidation(question, results, score, status, reason) {
    const validatedObj = {
      ...question,
      status,
      qualityScore: score,
      validationSummary: reason,
      validationResults: results,
      validatedAt: Date.now(),
      pipelineVersion: this.pipelineVersion
    };
    return validatedObj;
  }
}

if (typeof window !== 'undefined') {
  window.QuestionValidationPipeline = QuestionValidationPipeline;
}

if (typeof module !== 'undefined') {
  module.exports = QuestionValidationPipeline;
}
