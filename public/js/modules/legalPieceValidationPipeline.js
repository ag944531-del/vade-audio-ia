/**
 * VadeAudio AI - LegalPieceValidationPipeline & Procedural Analyzers (Etapa 38)
 * Pipeline de Validação Processual: Competência, Prazo, Estrutura, Fatos Críticos, Citações e Pedidos.
 */

class ProceduralDeadlineService {
  /**
   * Calcula o prazo processual aplicável de forma determinística
   */
  static calculateDeadline(pieceType, area = 'civil', startDate = null) {
    const type = (pieceType || '').toLowerCase();
    const isCivil = area === 'civil' || area === 'processo civil';
    const isTrabalhista = area === 'trabalhista' || area === 'processo do trabalho';
    const isPenal = area === 'penal' || area === 'processo penal';

    let days = 15;
    let isBusinessDays = true;
    let rule = 'Art. 219 do CPC (Contagem em dias úteis)';

    if (type.includes('embargos de declaração')) {
      days = 5;
      rule = 'Art. 1.023 do CPC (5 dias úteis)';
    } else if (isTrabalhista) {
      days = 8;
      isBusinessDays = true;
      rule = 'Art. 775 e Art. 895 da CLT (8 dias úteis)';
    } else if (isPenal) {
      if (type.includes('apelação')) days = 5;
      else if (type.includes('resposta à acusação')) days = 10;
      isBusinessDays = false;
      rule = 'Art. 798 do CPP (Contagem contínua e peremptória em dias corridos)';
    } else if (type.includes('agravo interno')) {
      days = 15;
      rule = 'Art. 1.021 do CPC (15 dias úteis)';
    }

    return {
      days,
      isBusinessDays,
      rule,
      summary: `${days} ${isBusinessDays ? 'dias úteis' : 'dias corridos'} (${rule})`
    };
  }
}

class LegalFactCoverageAnalyzer {
  /**
   * Analisa a cobertura de fatos críticos narrados na peça
   */
  static analyze(text, caseFacts = []) {
    const textLower = (text || '').toLowerCase();
    const criticalFacts = caseFacts.filter(f => f.importance === 'critical' || f.isCritical);
    const omittedCritical = [];
    const includedCritical = [];

    for (const fact of criticalFacts) {
      const factKeywords = (fact.keywords || fact.description.split(/\s+/).filter(w => w.length > 4));
      const hasFact = factKeywords.some(kw => textLower.includes(kw.toLowerCase()));

      if (hasFact) {
        includedCritical.push(fact);
      } else {
        omittedCritical.push(fact);
      }
    }

    const coverageRate = criticalFacts.length > 0 ? (includedCritical.length / criticalFacts.length) : 1.0;

    return {
      coverageRate: parseFloat(coverageRate.toFixed(2)),
      omittedCritical,
      includedCritical,
      hasOmissions: omittedCritical.length > 0
    };
  }
}

class LegalCitationValidator {
  /**
   * Valida referências a artigos de lei e súmulas citadas na peça
   */
  static validateCitations(text, expectedCitations = []) {
    const textClean = (text || '').toLowerCase();
    const invalidCitations = [];

    // Detecção de artigos obviamente inexistentes (ex: Art. 99999)
    const bogusArtMatch = textClean.match(/art(?:igo|\.)?\s*(99\d+|88\d{3}|77\d{3})/i);
    if (bogusArtMatch) {
      invalidCitations.push({
        citation: bogusArtMatch[0],
        issue: 'ARTIGO_INEXISTENTE_OU_ALUCINADO'
      });
    }

    return {
      hasInvalidCitations: invalidCitations.length > 0,
      invalidCitations
    };
  }
}

class LegalRequestAnalyzer {
  /**
   * Verifica a correspondência entre os fundamentos invocados e os pedidos finais formulados
   */
  static analyzeRequests(text) {
    const textLower = (text || '').toLowerCase();
    const warnings = [];

    const hasDanoMoralTese = textLower.includes('dano moral') || textLower.includes('danos morais') || textLower.includes('abalo moral') || textLower.includes('indenização moral');
    const hasDanoMoralPedido = textLower.includes('condenar') && (textLower.includes('indenização') || textLower.includes('reparação') || textLower.includes('danos morais') || textLower.includes('dano moral'));

    if (hasDanoMoralTese && !hasDanoMoralPedido) {
      warnings.push({
        topic: 'Dano Moral',
        issue: 'FUNDAMENTACAO_SEM_PEDIDO_CORRESPONDENTE',
        message: 'A petição fundamenta a ocorrência de dano moral, porém não formula expressamente o pedido condenatório correspondente na seção de pedidos.'
      });
    }

    const hasTutelaTese = textLower.includes('tutela de urgência') || textLower.includes('art. 300') || textLower.includes('artigo 300');
    const hasTutelaPedido = textLower.includes('concessão da tutela') || textLower.includes('conceder a tutela') || textLower.includes('liminarmente');

    if (hasTutelaTese && !hasTutelaPedido) {
      warnings.push({
        topic: 'Tutela de Urgência',
        issue: 'TUTELA_SEM_PEDIDO_LIMINAR',
        message: 'A tese de tutela de urgência foi desenvolvida no mérito, mas não consta pedido expresso de concessão liminar.'
      });
    }

    return {
      isCoherent: warnings.length === 0,
      warnings
    };
  }
}

class LegalPieceValidationPipeline {
  /**
   * Executa a auditoria completa da peça jurídica do aluno
   */
  static validatePiece(draftText, caseContext = {}) {
    const text = draftText || '';
    const textLower = text.toLowerCase();

    // 1. Validação de Endereçamento / Competência
    let jurisdictionScore = 100;
    const jurisdictionIssues = [];
    if (!textLower.includes('excelentíssimo') && !textLower.includes('juiz') && !textLower.includes('tribunal')) {
      jurisdictionScore = 0;
      jurisdictionIssues.push('Endereçamento ou indicação de juízo ausente.');
    } else if (caseContext.expectedCourt && !textLower.includes(caseContext.expectedCourt.toLowerCase())) {
      jurisdictionScore = 40;
      jurisdictionIssues.push(`Endereçamento incompatível com o juízo competente (${caseContext.expectedCourt}).`);
    }

    // 2. Análise de Fatos Críticos
    const factAnalysis = LegalFactCoverageAnalyzer.analyze(text, caseContext.facts || []);

    // 3. Validação de Citações e Artigos
    const citationAnalysis = LegalCitationValidator.validateCitations(text, caseContext.expectedArticles || []);

    // 4. Coerência dos Pedidos
    const requestAnalysis = LegalRequestAnalyzer.analyzeRequests(text);

    // 5. Cálculo da Rubrica de Correção (Nota de 0 a 10)
    let totalScore = 10.0;
    if (jurisdictionScore < 100) totalScore -= 1.5;
    if (factAnalysis.hasOmissions) totalScore -= (factAnalysis.omittedCritical.length * 1.5);
    if (citationAnalysis.hasInvalidCitations) totalScore -= 2.0;
    if (!requestAnalysis.isCoherent) totalScore -= (requestAnalysis.warnings.length * 1.5);
    if (text.length < 200) totalScore -= 3.0;

    totalScore = Math.max(0, Math.min(10, parseFloat(totalScore.toFixed(1))));

    return {
      totalScore,
      passedExam: totalScore >= 6.0,
      rubric: {
        jurisdiction: { score: jurisdictionScore >= 70 ? 2.0 : 0.5, max: 2.0, issues: jurisdictionIssues },
        factsCoverage: { score: factAnalysis.coverageRate * 2.0, max: 2.0, omitted: factAnalysis.omittedCritical },
        citations: { score: citationAnalysis.hasInvalidCitations ? 0.5 : 2.5, max: 2.5, issues: citationAnalysis.invalidCitations },
        requests: { score: requestAnalysis.isCoherent ? 2.5 : 1.0, max: 2.5, warnings: requestAnalysis.warnings },
        writingTechnique: { score: text.length > 300 ? 1.0 : 0.5, max: 1.0 }
      },
      diagnostic: {
        jurisdictionIssues,
        factOmissions: factAnalysis.omittedCritical,
        invalidCitations: citationAnalysis.invalidCitations,
        requestWarnings: requestAnalysis.warnings
      }
    };
  }
}

if (typeof window !== 'undefined') {
  window.ProceduralDeadlineService = ProceduralDeadlineService;
  window.LegalFactCoverageAnalyzer = LegalFactCoverageAnalyzer;
  window.LegalCitationValidator = LegalCitationValidator;
  window.LegalRequestAnalyzer = LegalRequestAnalyzer;
  window.LegalPieceValidationPipeline = LegalPieceValidationPipeline;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ProceduralDeadlineService,
    LegalFactCoverageAnalyzer,
    LegalCitationValidator,
    LegalRequestAnalyzer,
    LegalPieceValidationPipeline
  };
}
