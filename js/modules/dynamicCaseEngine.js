/**
 * VadeAudio AI - Motor de Casos Jurídicos Dinâmicos (Etapa 28)
 * Simulação prática investigativa com fatos imutáveis, entrevistas a personagens,
 * desbloqueio progressivo de documentos, quadro de hipóteses, ramificações de decisão e rubrica pedagógica.
 */

class CaseBlueprint {
  static getPresetCase(caseId = 'case_trabalhista_1') {
    return {
      caseId: 'case_trabalhista_1',
      title: 'Demissão e Verbas Rescisórias Controversas',
      area: 'Direito do Trabalho',
      difficulty: 'Intermediário',
      factsPublic: [
        'A trabalhadora Maria procurou seu escritório afirmando que foi demitida em 10/05/2026 sem justa causa.',
        'Maria alega que não recebeu o aviso prévio indenizado nem a multa de 40% do FGTS.',
        'Ela trabalhou como assistente administrativa na Empresa Alfa por 3 anos.'
      ],
      factsHidden: [
        {
          id: 'fact_h_1',
          content: 'Houve pedido de demissão voluntário assinado por Maria com assistência sindical.',
          sourceCharacterId: 'char_rh',
          relatedDocId: 'doc_pedido_demissao'
        },
        {
          id: 'fact_h_2',
          content: 'O TRCT comprova quitação das verbas rescisórias proporcionais no valor de R$ 4.200,00.',
          sourceCharacterId: 'char_rh',
          relatedDocId: 'doc_trct'
        }
      ],
      characters: [
        {
          id: 'char_cliente',
          name: 'Dona Maria (Cliente)',
          role: 'Reclamante',
          personality: 'Emotiva e confusa quanto aos termos legais assinados.',
          knownFacts: [
            'Afirma que foi pressionada a assinar papéis no RH.',
            'Não se lembra com clareza se pediu demissão ou se foi dispensada.'
          ]
        },
        {
          id: 'char_rh',
          name: 'Sr. Roberto (Gerente de RH da Empresa)',
          role: 'Representante da Reclamada',
          personality: 'Formal, objetivo e munido de documentação arquivada.',
          knownFacts: [
            'Possui o termo de pedido de demissão assinado de próprio punho por Maria.',
            'Afirma que a empresa depositou o saldo rescisório dentro do prazo legal de 10 dias (Art. 477, § 6º da CLT).'
          ]
        }
      ],
      documents: [
        {
          id: 'doc_trct',
          title: 'Termo de Rescisão do Contrato de Trabalho (TRCT)',
          isUnlocked: false,
          unlockCondition: 'request_trct',
          contentSnippet: 'TRCT - Homologação de Rescisão: Modalidade Pedido de Demissão da Empregada. Valor líquido pago: R$ 4.200,00.',
          disclaimer: 'DOCUMENTO FICTÍCIO PARA TREINAMENTO.'
        },
        {
          id: 'doc_pedido_demissao',
          title: 'Carta Manuscrita de Pedido de Demissão',
          isUnlocked: false,
          unlockCondition: 'interview_rh',
          contentSnippet: 'Carta de próprio punho solicitando desligamento imediato por motivos pessoais.',
          disclaimer: 'DOCUMENTO FICTÍCIO PARA TREINAMENTO.'
        }
      ],
      contradictions: [
        {
          allegation: 'Fui demitida sem justa causa e sem receber nada.',
          realityDocumented: 'Carta de pedido de demissão e comprovante de pagamento de R$ 4.200,00.',
          solutionHint: 'Verificar se houve vício de consentimento (coação) ou se a tese correta é rescisão indireta.'
        }
      ],
      expectedDecision: 'op_notificar_ou_produzir_prova_coacao',
      evaluationRubric: {
        investigationWeight: 0.25,
        issueSpottingWeight: 0.25,
        evidenceUseWeight: 0.20,
        legalGroundsWeight: 0.15,
        strategyWeight: 0.15
      }
    };
  }
}

class DynamicCaseState {
  constructor(blueprint) {
    this.blueprint = blueprint;
    this.discoveredFacts = [...blueprint.factsPublic];
    this.unlockedDocuments = [];
    this.characterInterviews = {};
    this.studentHypotheses = [];
    this.decisionHistory = [];
    this.currentPhase = 'investigation'; // 'investigation' | 'analysis' | 'decision' | 'completed'
    this.hintsUsed = 0;
  }
}

class CaseActionEngine {
  static executeAction(caseState, actionType, payload = {}) {
    const blueprint = caseState.blueprint;

    if (actionType === 'interview_character') {
      const charId = payload.characterId;
      const question = payload.questionText || '';
      const char = blueprint.characters.find(c => c.id === charId);

      if (!char) return { success: false, response: 'Personagem não encontrado.' };

      let reply = '';
      if (charId === 'char_cliente') {
        reply = 'Doutor(a), no dia da reunião eles me colocaram numa sala e disseram que seria melhor eu assinar a carta para sair amigavelmente. Não sei se isso anula o que assinei...';
        if (!caseState.discoveredFacts.includes('Cliente alega possível coação na assinatura da carta.')) {
          caseState.discoveredFacts.push('Cliente alega possível coação na assinatura da carta.');
        }
      } else if (charId === 'char_rh') {
        reply = 'Doutor(a), temos em nossos arquivos a carta manuscrita e o TRCT assinado. Cumprimos estritamente o Art. 477 da CLT.';
        // Desbloqueia documentos relacionados
        const trct = blueprint.documents.find(d => d.id === 'doc_trct');
        const carta = blueprint.documents.find(d => d.id === 'doc_pedido_demissao');
        if (trct && !caseState.unlockedDocuments.includes(trct)) caseState.unlockedDocuments.push(trct);
        if (carta && !caseState.unlockedDocuments.includes(carta)) caseState.unlockedDocuments.push(carta);

        if (!caseState.discoveredFacts.includes(blueprint.factsHidden[0].content)) {
          caseState.discoveredFacts.push(blueprint.factsHidden[0].content);
        }
      }

      if (!caseState.characterInterviews[charId]) caseState.characterInterviews[charId] = [];
      caseState.characterInterviews[charId].push({ question, reply });

      return { success: true, speaker: char.name, reply, newlyUnlockedDocs: caseState.unlockedDocuments.length };
    }

    if (actionType === 'form_hypothesis') {
      const hyp = payload.hypothesisText;
      caseState.studentHypotheses.push({ text: hyp, timestamp: Date.now() });
      return { success: true, hypothesisCount: caseState.studentHypotheses.length };
    }

    if (actionType === 'take_decision') {
      const decisionKey = payload.decisionKey;
      caseState.decisionHistory.push({ decisionKey, timestamp: Date.now() });
      caseState.currentPhase = 'completed';

      let isOptimal = decisionKey === blueprint.expectedDecision;
      let consequence = isOptimal
        ? 'Excelente estratégia! Você investigou a coação antes de ajuizar uma ação temerária com pedido indevido de aviso prévio.'
        : 'Atenção: Ajuizar a ação alegando dispensa imotivada sem impugnar a carta de demissão atrairia condenação em honorários sucumbenciais (Art. 791-A CLT).';

      return { success: true, isOptimal, consequence };
    }

    return { success: false, response: 'Ação não reconhecida.' };
  }
}

class DynamicCaseEngine {
  constructor(authService, audioEngine, vadeEngine, tutorEngine, voiceProfessor) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.voiceProfessor = voiceProfessor;
    this.activeCaseSession = null;
  }

  startCase(caseId = 'case_trabalhista_1') {
    const bp = CaseBlueprint.getPresetCase(caseId);
    this.activeCaseSession = new DynamicCaseState(bp);
    return this.activeCaseSession;
  }

  evaluateSession(caseState = this.activeCaseSession) {
    if (!caseState) return null;

    const bp = caseState.blueprint;
    const hasInterviewedRh = !!caseState.characterInterviews['char_rh'];
    const hasDiscoveredCarta = caseState.unlockedDocuments.some(d => d.id === 'doc_pedido_demissao');
    const hasOptimalDecision = caseState.decisionHistory.some(d => d.decisionKey === bp.expectedDecision);

    const scores = {
      investigation: hasInterviewedRh ? 90 : 40,
      issueSpotting: hasDiscoveredCarta ? 85 : 50,
      evidenceUse: caseState.unlockedDocuments.length >= 2 ? 95 : 60,
      legalGrounds: 85,
      strategy: hasOptimalDecision ? 90 : 55
    };

    const overallScore = Math.round(
      (scores.investigation * bp.evaluationRubric.investigationWeight) +
      (scores.issueSpotting * bp.evaluationRubric.issueSpottingWeight) +
      (scores.evidenceUse * bp.evaluationRubric.evidenceUseWeight) +
      (scores.legalGrounds * bp.evaluationRubric.legalGroundsWeight) +
      (scores.strategy * bp.evaluationRubric.strategyWeight)
    );

    return {
      caseId: bp.caseId,
      title: bp.title,
      overallScore,
      rubricBreakdown: scores,
      feedbackSummary: hasOptimalDecision
        ? 'Desempenho excelente! Você investigou a fundo a versão do RH, obteve os documentos e adotou a estratégia prudente de impugnar o vício de consentimento.'
        : 'Você concluiu o caso, mas ajuizou medida sem antes analisar a carta de demissão em posse da empresa.',
      pedagogicalRecommendations: [
        'Revisar vício de consentimento no negócio jurídico (Art. 151 do Código Civil)',
        'Estudar Art. 477 da CLT no Vade Mecum',
        'Refazer flashcards de Ônus da Prova no Processo do Trabalho'
      ]
    };
  }
}

window.CaseBlueprint = CaseBlueprint;
window.DynamicCaseState = DynamicCaseState;
window.CaseActionEngine = CaseActionEngine;
window.DynamicCaseEngine = DynamicCaseEngine;
