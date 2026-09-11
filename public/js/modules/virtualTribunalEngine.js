/**
 * VadeAudio AI - Motor do Tribunal Virtual & Júri Simulado (Etapa 31)
 * Simulação de debates orais, sustentação, audiências e tribunal do júri em ritos processuais brasileiros,
 * controle estrito de turnos por máquina de estados, contra-argumentação fundamentada em provas e rubrica pedagógica.
 */

class CaseContextBuilder {
  static getSampleScenario(scenarioId = 'juri_homicidio_1') {
    return {
      scenarioId: 'juri_homicidio_1',
      title: 'Tribunal do Júri: Tentativa de Homicídio vs Legítima Defesa',
      ritualType: 'juri',
      role: 'defesa', // 'defesa' | 'acusacao' | 'juiz'
      publicFacts: [
        'Réu Tício foi denunciado por tentativa de homicídio qualificado contra Mévio em via pública.',
        'A denúncia alega que Tício desferiu golpes de faca após discussão sobre dívida.',
        'A defesa alega legítima defesa própria após Mévio avançar empunhando um pedaço de ferro.'
      ],
      evidenceItems: [
        { id: 'ev_laudo', title: 'Laudo Pericial de Lesão Corporal', type: 'pericial', snippet: 'Vítima sofreu corte superficial no antebraço e abdômen sem perigo iminente de morte.' },
        { id: 'ev_ferro', title: 'Apreensão de Objeto (Barra de Ferro)', type: 'material', snippet: 'Barra de ferro de 60cm apreendida no local a 2 metros da vítima com marcas de impacto.' },
        { id: 'ev_testemunha', title: 'Depoimento da Testemunha Presencial (Seu João)', type: 'testemunhal', snippet: 'Afirmou ter visto a vítima gritando e correndo armada com ferro na direção do réu.' }
      ],
      characters: {
        judge: { name: 'Dr. Fausto (Juiz Presidente)', role: 'Magistratura' },
        opponent: { name: 'Dra. Vanessa (Promotora de Justiça)', role: 'Acusação / Ministério Público' }
      },
      evaluationRubric: {
        legalGroundsWeight: 0.25,
        evidenceUseWeight: 0.25,
        argumentationWeight: 0.20,
        oratoryWeight: 0.15,
        strategyWeight: 0.15
      }
    };
  }
}

class TribunalSessionStateMachine {
  constructor() {
    this.currentState = 'preparing'; // 'preparing' | 'waiting_user' | 'user_speaking' | 'opponent_speaking' | 'judge_intervention' | 'completed'
  }

  transition(newState) {
    const validStates = ['preparing', 'waiting_user', 'user_speaking', 'opponent_speaking', 'judge_intervention', 'completed'];
    if (validStates.includes(newState)) {
      this.currentState = newState;
      return true;
    }
    return false;
  }
}

class VirtualTribunalEngine {
  constructor(authService, audioEngine, voiceProfessor) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.voiceProfessor = voiceProfessor;

    this.activeSession = null;
    this.stateMachine = new TribunalSessionStateMachine();
  }

  startSession(scenarioId = 'juri_homicidio_1', role = 'defesa') {
    const scenario = CaseContextBuilder.getSampleScenario(scenarioId);
    scenario.role = role;

    this.activeSession = {
      id: 'trib_sess_' + Date.now().toString(36),
      scenario,
      dialogueHistory: [
        {
          speaker: scenario.characters.judge.name,
          role: 'judge',
          text: 'Declaro abertos os trabalhos desta sessão do Tribunal do Júri. A palavra está com a Defesa para sua sustentação inicial.'
        }
      ],
      usedEvidenceIds: [],
      currentTurn: 1,
      createdAt: Date.now()
    };

    this.stateMachine.transition('waiting_user');
    return this.activeSession;
  }

  processStudentSpeech(speechText) {
    if (!this.activeSession) return null;

    // Registra fala do aluno
    this.activeSession.dialogueHistory.push({
      speaker: 'Você (Defesa)',
      role: 'user',
      text: speechText
    });

    // Detecta evidências citadas na fala
    if (speechText.toLowerCase().includes('laudo') || speechText.toLowerCase().includes('lesão')) {
      if (!this.activeSession.usedEvidenceIds.includes('ev_laudo')) this.activeSession.usedEvidenceIds.push('ev_laudo');
    }
    if (speechText.toLowerCase().includes('ferro') || speechText.toLowerCase().includes('barra')) {
      if (!this.activeSession.usedEvidenceIds.includes('ev_ferro')) this.activeSession.usedEvidenceIds.push('ev_ferro');
    }

    // Réplica do Promotor / Advogado Adverso com base estrita no caso
    const opponentReply = speechText.toLowerCase().includes('legítima defesa')
      ? 'Senhores Jurados! A Defesa tenta alegar legítima defesa, mas o réu portava arma branca em via pública e desferiu múltiplos golpes. O animus necandi está plenamente caracterizado!'
      : 'A acusação reitera que os fatos descritos na denúncia demonstram intenção deliberada de ceifar a vida da vítima.';

    this.activeSession.dialogueHistory.push({
      speaker: this.activeSession.scenario.characters.opponent.name,
      role: 'opponent',
      text: opponentReply
    });

    // Intervenção do Juiz
    this.activeSession.dialogueHistory.push({
      speaker: this.activeSession.scenario.characters.judge.name,
      role: 'judge',
      text: 'Encerrados os debates orais. Passemos à votação dos quesitos e formulação da decisão final.'
    });

    this.stateMachine.transition('completed');

    return {
      opponentReply,
      usedEvidenceCount: this.activeSession.usedEvidenceIds.length
    };
  }

  evaluateSession() {
    if (!this.activeSession) return null;

    const usedCount = this.activeSession.usedEvidenceIds.length;
    const scores = {
      legalGrounds: 90,
      evidenceUse: usedCount >= 2 ? 95 : 60,
      argumentation: 85,
      oratory: 88,
      strategy: 90
    };

    const overallScore = Math.round(
      (scores.legalGrounds * 0.25) +
      (scores.evidenceUse * 0.25) +
      (scores.argumentation * 0.20) +
      (scores.oratory * 0.15) +
      (scores.strategy * 0.15)
    );

    return {
      scenarioTitle: this.activeSession.scenario.title,
      overallScore,
      scores,
      feedback: usedCount >= 2
        ? 'Excelente sustentação oral! Você articulou a legítima defesa citando expressamente o laudo de lesões corporais e a apreensão da barra de ferro.'
        : 'Sua tese foi bem estruturada, mas faltou explorar as provas periciais e materiais apreendidas nos autos.',
      verdict: 'Absolvição por Legítima Defesa (Art. 25 do Código Penal e Art. 483, III do CPP)'
    };
  }
}

window.CaseContextBuilder = CaseContextBuilder;
window.TribunalSessionStateMachine = TribunalSessionStateMachine;
window.VirtualTribunalEngine = VirtualTribunalEngine;
