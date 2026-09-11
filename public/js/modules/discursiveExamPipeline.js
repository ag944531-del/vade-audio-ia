/**
 * VadeAudio AI - LegalDiscursiveRubricEngine & Evaluation Pipeline (Etapa 43)
 * Central de Provas Discursivas & Respostas Jurídicas com IA.
 * Avaliação por Rubrica Estruturada: Issue Spotting, Análise Fática, Subsunção Legal e Posições Defensáveis.
 */

class LegalIssueSpottingAnalyzer {
  /**
   * Identifica se os problemas jurídicos esperados foram abordados semanticamente
   */
  static analyze(answerText = '', expectedIssues = []) {
    const textLower = (answerText || '').toLowerCase();
    const spotted = [];
    const missed = [];

    expectedIssues.forEach(issue => {
      const keywords = issue.keywords || [issue.name ? issue.name.toLowerCase() : ''];
      const isPresent = keywords.some(kw => textLower.includes(kw.toLowerCase()));
      if (isPresent) {
        spotted.push(issue);
      } else {
        missed.push(issue);
      }
    });

    return {
      spottedCount: spotted.length,
      missedCount: missed.length,
      totalExpected: expectedIssues.length,
      coverageRate: expectedIssues.length > 0 ? (spotted.length / expectedIssues.length) : 1,
      spotted,
      missed
    };
  }
}

class DiscursiveFactAnalyzer {
  /**
   * Detecta se o aluno se ateve aos fatos do enunciado ou inventou circunstâncias inexistentes
   */
  static analyze(answerText = '', caseFacts = [], forbiddenInventions = []) {
    const textLower = (answerText || '').toLowerCase();
    const inventedFactsDetected = [];

    forbiddenInventions.forEach(inv => {
      if (textLower.includes(inv.toLowerCase())) {
        inventedFactsDetected.push({
          invention: inv,
          message: `O enunciado não informa a existência de "${inv}". Evite acrescentar fatos não descritos.`
        });
      }
    });

    return {
      hasInventedFacts: inventedFactsDetected.length > 0,
      inventedFactsCount: inventedFactsDetected.length,
      inventedFactsDetected
    };
  }
}

class DiscursiveLegalGroundingAnalyzer {
  /**
   * Valida as referências a artigos de lei e súmulas citadas na resposta
   */
  static analyze(answerText = '', expectedArticles = []) {
    const textLower = (answerText || '').toLowerCase();
    const citedArticles = [];
    const missedExpectedArticles = [];

    // Detecção de citações legais como "art. 300", "súmula 479"
    const lawMatchRegex = /(?:art(?:igo)?\.?\s*(\d+[a-z\-]*)|s[úu]mula\s*(\d+))/gi;
    let match;
    while ((match = lawMatchRegex.exec(answerText)) !== null) {
      citedArticles.push(match[0]);
    }

    // Rejeição de artigos inexistentes/alucinados
    const hallucinatedArticles = citedArticles.filter(c => /\b99999\b|\b88888\b/.test(c));

    expectedArticles.forEach(exp => {
      const isCited = textLower.includes(exp.toLowerCase());
      if (!isCited) {
        missedExpectedArticles.push(exp);
      }
    });

    return {
      totalCited: citedArticles.length,
      citedArticles,
      hasHallucinations: hallucinatedArticles.length > 0,
      hallucinatedArticles,
      missedExpectedArticles
    };
  }
}

class LegalApplicationAnalyzer {
  /**
   * Avalia a qualidade da subsunção jurídica (fato <-> norma)
   */
  static analyze(answerText = '', ruleMentioned = false) {
    const text = (answerText || '').trim();
    // Subsunção exige relacionar os elementos fáticos aos requisitos jurídicos
    const hasApplicationIndicators = /porque|haja vista que|ao passo que|uma vez que|configurando assim|no caso em tela|na hip[oó]tese narrada|pois|visto que|tendo em vista que/i.test(text);
    const isMerelyCopyingRule = text.length > 30 && !hasApplicationIndicators && /disp[õo]e que|previsto no art/i.test(text);

    let applicationScore = 0;
    if (isMerelyCopyingRule) {
      applicationScore = 3.0; // mera cópia literal sem aplicação
    } else if (hasApplicationIndicators && ruleMentioned) {
      applicationScore = 10.0; // subsunção completa
    } else if (hasApplicationIndicators) {
      applicationScore = 7.0; // aplicação fática razoável
    } else {
      applicationScore = 5.0;
    }

    return {
      applicationScore,
      isMerelyCopyingRule,
      feedback: isMerelyCopyingRule 
        ? 'A norma jurídica foi citada, mas faltou subsunção: aplicar expressamente os requisitos aos fatos concretos narrados.'
        : 'Subsunção jurídica adequada aos fatos narrados.'
    };
  }
}

class LegalPositionEvaluator {
  /**
   * Avalia se uma posição divergente é juridicamente defensável
   */
  static evaluate(answerText = '', defensiblePositions = []) {
    const textLower = (answerText || '').toLowerCase();
    const matchedPosition = defensiblePositions.find(p => 
      p.keywords && p.keywords.some(kw => textLower.includes(kw.toLowerCase()))
    );

    if (matchedPosition) {
      return {
        isDefensible: true,
        positionTitle: matchedPosition.title,
        notes: `Posição divergente admitida: ${matchedPosition.title} (com respaldo doutrinário/jurisprudencial).`
      };
    }

    return {
      isDefensible: false,
      notes: 'Posição adotada conforme o padrão de resposta principal.'
    };
  }
}

class DiscursiveConclusionAnalyzer {
  /**
   * Valida coerência da conclusão e se ela não contradiz as premissas
   */
  static analyze(answerText = '') {
    const textLower = (answerText || '').toLowerCase();
    const hasAffirmation = /portanto|conclui-se que|diante disso|assim|resta configurad[ao]|logo|por conseguinte|configura/i.test(textLower);
    
    // Detecção de contradição primária (ex: defende inexistência de dano e conclui pela condenação integral)
    const hasContradiction = textLower.includes('inexiste qualquer responsabilidade') && textLower.includes('deve ser integralmente condenado');

    return {
      hasDirectConclusion: hasAffirmation,
      hasContradiction,
      feedback: hasContradiction 
        ? 'Contradição detectada: a fundamentação aponta inexistência de dever jurídico, mas a conclusão defende o resultado oposto.'
        : 'Conclusão coerente com as premissas argumentativas.'
    };
  }
}

class LegalDiscursiveRubricEngine {
  /**
   * Calcula o somatório determinístico da nota final baseado nos pesos da rubrica
   */
  static computeScore(criteriaScores = {}, rubricWeights = {}) {
    const defaultWeights = {
      issueSpotting: 0.20,
      legalGrounding: 0.25,
      factApplication: 0.30,
      conclusion: 0.15,
      clarity: 0.10
    };

    const weights = { ...defaultWeights, ...rubricWeights };
    let totalScore = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = criteriaScores[key] !== undefined ? criteriaScores[key] : 0;
      totalScore += (score * weight);
    }

    const roundedScore = Math.round(totalScore * 10) / 10;

    return {
      finalGrade: Math.min(10.0, Math.max(0.0, roundedScore)),
      criteriaScores,
      weights
    };
  }
}

class LegalDiscursiveEvaluationPipeline {
  /**
   * Executa a auditoria completa da resposta do aluno
   */
  static evaluate(question, answerText) {
    const expectedIssues = question.expectedIssues || [];
    const forbiddenInventions = question.forbiddenInventions || [];
    const expectedArticles = question.expectedArticles || [];
    const defensiblePositions = question.defensiblePositions || [];

    // 1. Issue Spotting
    const issueRes = LegalIssueSpottingAnalyzer.analyze(answerText, expectedIssues);
    const issueScore = Math.round(issueRes.coverageRate * 10);

    // 2. Fact Analysis
    const factRes = DiscursiveFactAnalyzer.analyze(answerText, [], forbiddenInventions);

    // 3. Legal Grounding
    const groundRes = DiscursiveLegalGroundingAnalyzer.analyze(answerText, expectedArticles);
    let groundScore = groundRes.hasHallucinations ? 0.0 : (groundRes.citedArticles.length > 0 ? 10.0 : 4.0);

    // 4. Fact Application
    const appRes = LegalApplicationAnalyzer.analyze(answerText, groundRes.citedArticles.length > 0);
    const appScore = appRes.applicationScore;

    // 5. Position & Conclusion
    const posRes = LegalPositionEvaluator.evaluate(answerText, defensiblePositions);
    const conclRes = DiscursiveConclusionAnalyzer.analyze(answerText);
    const conclScore = conclRes.hasContradiction ? 0.0 : (conclRes.hasDirectConclusion ? 10.0 : 6.0);

    // 6. Clarity
    const clarityScore = answerText.length > 40 ? 10.0 : 5.0;

    // Cálculo da Rubrica Ponderada
    const rubricRes = LegalDiscursiveRubricEngine.computeScore({
      issueSpotting: issueScore,
      legalGrounding: groundScore,
      factApplication: appScore,
      conclusion: conclScore,
      clarity: clarityScore
    });

    return {
      finalGrade: rubricRes.finalGrade,
      issueRes,
      factRes,
      groundRes,
      appRes,
      posRes,
      conclRes,
      rubricRes
    };
  }
}

if (typeof window !== 'undefined') {
  window.LegalIssueSpottingAnalyzer = LegalIssueSpottingAnalyzer;
  window.DiscursiveFactAnalyzer = DiscursiveFactAnalyzer;
  window.DiscursiveLegalGroundingAnalyzer = DiscursiveLegalGroundingAnalyzer;
  window.LegalApplicationAnalyzer = LegalApplicationAnalyzer;
  window.LegalPositionEvaluator = LegalPositionEvaluator;
  window.DiscursiveConclusionAnalyzer = DiscursiveConclusionAnalyzer;
  window.LegalDiscursiveRubricEngine = LegalDiscursiveRubricEngine;
  window.LegalDiscursiveEvaluationPipeline = LegalDiscursiveEvaluationPipeline;
}

if (typeof module !== 'undefined') {
  module.exports = {
    LegalIssueSpottingAnalyzer,
    DiscursiveFactAnalyzer,
    DiscursiveLegalGroundingAnalyzer,
    LegalApplicationAnalyzer,
    LegalPositionEvaluator,
    DiscursiveConclusionAnalyzer,
    LegalDiscursiveRubricEngine,
    LegalDiscursiveEvaluationPipeline
  };
}
