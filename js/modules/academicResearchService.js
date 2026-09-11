/**
 * VadeAudio AI - AcademicResearchService & Validators (Etapa 42)
 * Central de Trabalhos, TCC & Pesquisa Jurídica Avançada.
 * Integridade de Autoria, Validação de Matriz de Pesquisa, Auditoria de Citações ABNT e Rastreabilidade.
 */

class ResearchProblemValidator {
  /**
   * Valida a formulação do problema de pesquisa
   */
  static validate(problemText = '') {
    const text = (problemText || '').trim();
    const issues = [];

    if (!text.endsWith('?')) {
      issues.push('O problema de pesquisa deve ser formulado como uma pergunta interrogativa.');
    }

    if (text.length < 25) {
      issues.push('O problema está excessivamente sucinto ou genérico; delimite o objeto material e temporal.');
    }

    const isConclusionPrebaked = /portanto|provando que|devendo|comprovado que/i.test(text);
    if (isConclusionPrebaked) {
      issues.push('O problema parece conter uma resposta ou julgamento pré-concebido em sua redação.');
    }

    return {
      isValid: issues.length === 0,
      score: issues.length === 0 ? 100 : Math.max(20, 100 - (issues.length * 30)),
      issues,
      suggestion: issues.length === 0 
        ? 'Problema bem delimitado e investigável.' 
        : 'Reestruture o problema como uma pergunta aberta e delimitada.'
    };
  }
}

class ResearchObjectiveValidator {
  /**
   * Valida verbos no infinitivo e coerência dos objetivos com o problema
   */
  static validateObjectives(generalObjective = '', specificObjectives = []) {
    const issues = [];
    const validVerbs = /^(analisar|investigar|examinar|identificar|compreender|avaliar|demonstrar|comparar|verificar|estudar)/i;

    if (!validVerbs.test((generalObjective || '').trim())) {
      issues.push('O objetivo geral deve iniciar com um verbo no infinitivo adequado (ex: Analisar, Investigar, Examinar).');
    }

    if (!specificObjectives || specificObjectives.length < 2) {
      issues.push('Recomenda-se definir ao menos 3 objetivos específicos para estruturar os capítulos.');
    }

    specificObjectives.forEach((obj, idx) => {
      if (!validVerbs.test((obj || '').trim())) {
        issues.push(`Objetivo específico #${idx + 1} deve iniciar com verbo no infinitivo.`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

class ResearchGapService {
  /**
   * Detecta lacunas estruturais (capítulos sem fontes, objetivos sem capítulo)
   */
  static detectGaps(project) {
    if (!project) return { gaps: [] };

    const gaps = [];
    const chapters = project.chapters || [];
    const specificObjectives = project.specificObjectives || [];

    // 1. Capítulos sem fontes vinculadas
    chapters.forEach(chap => {
      if (!chap.sources || chap.sources.length === 0) {
        gaps.push({
          type: 'CHAPTER_WITHOUT_SOURCES',
          chapterId: chap.id,
          title: chap.title,
          message: `O capítulo "${chap.title}" não possui nenhuma fonte bibliográfica vinculada.`
        });
      }
    });

    // 2. Objetivos específicos sem capítulo correspondente
    specificObjectives.forEach((obj, idx) => {
      const isCovered = chapters.some(c => (c.objectiveId === obj.id || (c.title && c.title.toLowerCase().includes(obj.text ? obj.text.toLowerCase().slice(0, 15) : ''))));
      if (!isCovered && chapters.length > 0) {
        gaps.push({
          type: 'UNMAPPED_OBJECTIVE',
          objectiveIndex: idx + 1,
          message: `O objetivo específico #${idx + 1} não possui capítulo correspondente na estrutura do sumário.`
        });
      }
    });

    return {
      hasGaps: gaps.length > 0,
      totalGaps: gaps.length,
      gaps
    };
  }
}

class AcademicReferenceAuditService {
  /**
   * Cruza as citações presentes no texto dos capítulos com a bibliografia final (ABNT NBR 6023)
   */
  static auditReferences(chapters = [], bibliography = []) {
    const citationsInText = [];
    const orphanCitations = [];
    const unusedBibliography = [];

    // Extrai citações do tipo (SILVA, 2023) ou (DINIZ, 2022, p. 140)
    const citationRegex = /\(([A-ZÁÉÍÓÚÂÊÔÃÕÇ]+),\s*(\d{4})(?:,\s*p\.\s*\d+)?\)/g;

    chapters.forEach(chap => {
      let match;
      const text = chap.text || '';
      while ((match = citationRegex.exec(text)) !== null) {
        citationsInText.push({
          author: match[1],
          year: match[2],
          chapterTitle: chap.title
        });
      }
    });

    // Verifica se toda citação no texto tem entrada na bibliografia
    citationsInText.forEach(cit => {
      const found = bibliography.some(b => 
        (b.author || '').toUpperCase().includes(cit.author) && (b.year || '').toString() === cit.year
      );
      if (!found) {
        orphanCitations.push(cit);
      }
    });

    // Verifica se há bibliografia cadastrada nunca citada no texto
    bibliography.forEach(b => {
      const isCited = citationsInText.some(cit => 
        (b.author || '').toUpperCase().includes(cit.author) && (b.year || '').toString() === cit.year
      );
      if (!isCited) {
        unusedBibliography.push(b);
      }
    });

    return {
      totalCitationsInText: citationsInText.length,
      orphanCitationsCount: orphanCitations.length,
      orphanCitations,
      unusedBibliographyCount: unusedBibliography.length,
      unusedBibliography,
      isClean: orphanCitations.length === 0 && unusedBibliography.length === 0
    };
  }
}

class AcademicResearchProjectService {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  createProject(data) {
    const project = {
      id: 'proj_' + Date.now(),
      title: data.title || 'Novo Projeto Acadêmico',
      course: data.course || 'Direito',
      type: data.type || 'TCC',
      theme: data.theme || '',
      problem: data.problem || '',
      hypothesis: data.hypothesis || '',
      generalObjective: data.generalObjective || '',
      specificObjectives: data.specificObjectives || [],
      methodology: data.methodology || 'Pesquisa bibliográfica e documental',
      deadline: data.deadline || '',
      chapters: data.chapters || [
        { id: 'chap_1', title: '1. Introdução', text: '', sources: [] },
        { id: 'chap_2', title: '2. Fundamentação Teórica', text: '', sources: [] },
        { id: 'chap_3', title: '3. Análise Jurisprudencial', text: '', sources: [] },
        { id: 'chap_4', title: '4. Conclusão', text: '', sources: [] }
      ],
      bibliography: data.bibliography || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (this.storage) {
      return this.storage.saveAcademicProject(project);
    }
    return project;
  }
}

if (typeof window !== 'undefined') {
  window.ResearchProblemValidator = ResearchProblemValidator;
  window.ResearchObjectiveValidator = ResearchObjectiveValidator;
  window.ResearchGapService = ResearchGapService;
  window.AcademicReferenceAuditService = AcademicReferenceAuditService;
  window.AcademicResearchProjectService = AcademicResearchProjectService;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ResearchProblemValidator,
    ResearchObjectiveValidator,
    ResearchGapService,
    AcademicReferenceAuditService,
    AcademicResearchProjectService
  };
}
