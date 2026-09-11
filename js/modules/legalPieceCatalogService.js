/**
 * VadeAudio AI - LegalPieceCatalogService & LegalPieceIdentificationService (Etapa 38)
 * Identificação Pedagógica da Medida Cabível e Catálogo de Estruturas Processuais.
 */

class LegalPieceIdentificationService {
  /**
   * Avalia a adequação da peça escolhida pelo aluno para o caso prático
   */
  static evaluatePieceChoice(chosenPiece, caseContext) {
    const chosenClean = (chosenPiece || '').trim().toLowerCase();
    const expected = (caseContext.expectedPiece || '').toLowerCase();
    const alternatives = (caseContext.acceptablePieces || []).map(p => p.toLowerCase());

    const isExact = chosenClean.includes(expected) || expected.includes(chosenClean);
    const isAlternative = alternatives.some(alt => chosenClean.includes(alt) || alt.includes(chosenClean));

    if (isExact) {
      return {
        isAdequate: true,
        degree: 'ideal',
        message: `Excelente identificação! A **${caseContext.expectedPiece}** é a medida processual técnica e precisa para esta fase.`,
        feedback: caseContext.pieceChoiceRationale || 'Peça cabível conforme a fase processual e os provimentos buscados.'
      };
    }

    if (isAlternative) {
      return {
        isAdequate: true,
        degree: 'acceptable',
        message: `A medida **${chosenPiece}** é juridicamente defensável, embora a opção prioritária no espelho seja **${caseContext.expectedPiece}**.`,
        feedback: 'Alternativa plausível na prática forense.'
      };
    }

    return {
      isAdequate: false,
      degree: 'inadequate',
      message: `A peça **${chosenPiece}** é inadequada para o momento processual.`,
      feedback: `Nesta fase processual (${caseContext.proceduralStage || 'fase atual'}), a medida correta era a interposição/apresentação de **${caseContext.expectedPiece}**.`
    };
  }
}

class LegalPieceTemplateService {
  /**
   * Retorna a estrutura modular com placeholders para a peça selecionada
   */
  static getTemplate(pieceType, area = 'civil') {
    const type = (pieceType || '').toLowerCase();

    if (type.includes('inicial') || type.includes('petição inicial')) {
      return {
        type: 'petição_inicial',
        area: 'civil',
        title: 'Petição Inicial (Art. 319 CPC)',
        sections: [
          { key: 'addressing', name: 'Endereçamento / Competência', placeholder: 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE [COMARCA/UF]' },
          { key: 'qualification', name: 'Qualificação das Partes', placeholder: '[NOME DO AUTOR], [nacionalidade], [estado civil], [profissão], portador do RG nº [RG] e inscrito no CPF sob o nº [CPF fictício], residente e domiciliado em [endereço], por seu advogado infra-assinado...' },
          { key: 'facts', name: 'Dos Fatos', placeholder: 'Narrar cronologicamente os fatos essenciais e incontroversos do caso prático...' },
          { key: 'law_and_tutela', name: 'Do Direito e da Tutela de Urgência (se houver)', placeholder: 'Demonstrar os fundamentos jurídicos, os artigos de lei aplicáveis (ex: Art. 300 CPC) e a jurisprudência consolidada...' },
          { key: 'requests', name: 'Dos Pedidos', placeholder: 'Diante do exposto, requer a Vossa Excelência:\na) A concessão da tutela de urgência...\nb) A citação do Réu...\nc) A procedência total dos pedidos para condenar o Réu a...\nd) A condenação em custas e honorários sucumbenciais.' },
          { key: 'evidence', name: 'Das Provas', placeholder: 'Protesta provar o alegado por todos os meios de prova em direito admitidos...' },
          { key: 'case_value', name: 'Do Valor da Causa', placeholder: 'Dá-se à causa o valor de R$ [VALOR DA CAUSA].' },
          { key: 'closing', name: 'Fechamento', placeholder: 'Nestes termos,\nPede deferimento.\n[Local e Data]\n[Advogado / OAB]' }
        ]
      };
    }

    if (type.includes('contestação')) {
      return {
        type: 'contestação',
        area: 'civil',
        title: 'Contestação (Art. 335 CPC)',
        sections: [
          { key: 'addressing', name: 'Endereçamento', placeholder: 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE [COMARCA/UF]' },
          { key: 'preliminaries', name: 'Das Preliminares (Art. 337 CPC)', placeholder: 'Antes de adentrar ao mérito, cumpre suscitar a preliminar de...' },
          { key: 'merit', name: 'Do Mérito / Impugnação Específica', placeholder: 'Quanto ao mérito, os pedidos do Autor não merecem prosperar, haja vista que...' },
          { key: 'requests', name: 'Dos Pedidos', placeholder: 'Requer o acolhimento das preliminares ou, no mérito, a total improcedência dos pedidos formulados na inicial...' },
          { key: 'closing', name: 'Fechamento', placeholder: 'Nestes termos, pede deferimento.\n[Local e Data]\n[Advogado / OAB]' }
        ]
      };
    }

    if (type.includes('apelação')) {
      return {
        type: 'apelação',
        area: 'civil',
        title: 'Recurso de Apelação (Art. 1.009 CPC)',
        sections: [
          { key: 'interposition', name: 'Folha de Interposição', placeholder: 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL...\n[NOME DO APELANTE], vem interpor RECURSO DE APELAÇÃO...' },
          { key: 'reasons', name: 'Razões Recursais', placeholder: 'EGRÉGIO TRIBUNAL DE JUSTIÇA\nCOLENDA CÂMARA...\nI - Da Tempestividade e do Preparo\nII - Dos Fatos\nIII - Das Razões de Reforma...' },
          { key: 'requests', name: 'Dos Pedidos Recursais', placeholder: 'Requer o conhecimento e o provimento do presente recurso para reformar a r. sentença...' }
        ]
      };
    }

    // Template genérico
    return {
      type: 'peça_generica',
      area,
      title: pieceType || 'Peça Processual',
      sections: [
        { key: 'addressing', name: 'Endereçamento', placeholder: 'EXCELENTÍSSIMO SENHOR DOUTOR...' },
        { key: 'body', name: 'Desenvolvimento e Fundamentos', placeholder: 'Fatos, fundamentos jurídicos e argumentação processual...' },
        { key: 'requests', name: 'Dos Pedidos', placeholder: 'Termos em que requer...' }
      ]
    };
  }
}

if (typeof window !== 'undefined') {
  window.LegalPieceIdentificationService = LegalPieceIdentificationService;
  window.LegalPieceTemplateService = LegalPieceTemplateService;
}

if (typeof module !== 'undefined') {
  module.exports = { LegalPieceIdentificationService, LegalPieceTemplateService };
}
