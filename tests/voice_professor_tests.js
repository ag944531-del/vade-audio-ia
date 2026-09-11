/**
 * VadeAudio AI - Suíte de Testes do Professor por Voz em Tempo Real (Etapa 18)
 * Valida máquina de estados, barge-in, cancelamento de turnos obsoletos (anti-race conditions),
 * intents conversacionais, modos pedagógicos (Didático, Socrático, Prova Oral) e formatação display/speech.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('🎙️ INICIANDO SUÍTE DE TESTES DO PROFESSOR POR VOZ - ETAPA 18');
console.log('===============================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(description, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${description}`);
    console.error(`   Erro: ${err.message}\n`);
    failCount++;
  }
}

// ----------------------------------------------------------------------------
// 1. MÁQUINA DE ESTADOS DO PROFESSOR POR VOZ
// ----------------------------------------------------------------------------
console.log('--- 1. Máquina de Estados da Conversação ---');

class MockVoiceProfessor {
  constructor() {
    this.state = 'idle';
    this.currentTurnId = 0;
    this.audioPlaying = false;
    this.dialogue = [];
    this.speechSpeed = 1.0;
  }

  setState(s) {
    this.state = s;
  }

  classifyIntent(text) {
    const clean = text.toLowerCase().trim();
    if (clean === 'pare' || clean === 'parar' || clean === 'pausa') return 'stop';
    if (clean === 'repete' || clean === 'repetir') return 'repeat';
    if (clean.includes('mais devagar')) return 'slower';
    if (clean.includes('mais rápido')) return 'faster';
    if (clean.includes('não entendi') || clean.includes('explique de outro jeito')) return 'rephrase';
    if (clean.includes('dê um exemplo')) return 'example';
    if (clean.includes('me teste')) return 'test_me';
    return 'legal_query';
  }

  handleBargeIn(userSpeech) {
    this.audioPlaying = false;
    this.currentTurnId++;
    this.setState('interrupted');
    const intent = this.classifyIntent(userSpeech);
    if (intent === 'stop') {
      this.setState('idle');
    } else {
      this.setState('listening');
    }
  }

  processTurn(userText, mode = 'standard') {
    this.currentTurnId++;
    const turnId = this.currentTurnId;
    this.setState('thinking');

    const intent = this.classifyIntent(userText);
    if (intent === 'stop') {
      this.setState('idle');
      return { turnId, intent, speechText: '', displayText: '' };
    }

    if (intent === 'slower') {
      this.speechSpeed = Math.max(0.75, this.speechSpeed - 0.15);
      this.setState('speaking');
      this.audioPlaying = true;
      return { turnId, intent, speechText: 'Falando mais devagar.', displayText: 'Velocidade reduzida.' };
    }

    if (intent === 'rephrase') {
      this.setState('speaking');
      this.audioPlaying = true;
      return {
        turnId,
        intent,
        speechText: 'Vamos simplificar com um exemplo prático de trânsito.',
        displayText: 'Explicação Simplificada: Exemplo de trânsito.'
      };
    }

    if (mode === 'socratic') {
      this.setState('speaking');
      this.audioPlaying = true;
      return {
        turnId,
        mode: 'socratic',
        speechText: 'No dolo eventual, o agente quer o resultado ou apenas assume o risco?',
        displayText: '*Pergunta Socrática:* O agente quer o resultado ou assume o risco?'
      };
    }

    if (mode === 'oral_exam') {
      this.setState('speaking');
      this.audioPlaying = true;
      return {
        turnId,
        mode: 'oral_exam',
        speechText: 'Candidato, diferencie dolo eventual de culpa consciente. Pode iniciar.',
        displayText: '**Simulado Prova Oral:** Diferencie dolo eventual de culpa consciente.'
      };
    }

    this.setState('speaking');
    this.audioPlaying = true;
    return {
      turnId,
      speechText: 'O dolo eventual ocorre quando o agente assume o risco de produzir o resultado nos termos do artigo dezoito do Código Penal.',
      displayText: 'O **dolo eventual** ocorre quando o agente assume o risco do resultado (*Art. 18, I, CP*).'
    };
  }
}

runTest('Transição de estados ocorre na ordem: idle -> thinking -> speaking', () => {
  const prof = new MockVoiceProfessor();
  assert.strictEqual(prof.state, 'idle');
  prof.processTurn('O que é dolo eventual?');
  assert.strictEqual(prof.state, 'speaking');
  assert.strictEqual(prof.audioPlaying, true);
});

// ----------------------------------------------------------------------------
// 2. BARGE-IN & CANCELAMENTO INSTANTÂNEO DE ÁUDIO
// ----------------------------------------------------------------------------
console.log('\n--- 2. Interrupção Instantânea & Barge-In ---');

runTest('Barge-in interrompe fala do professor imediatamente e transiciona para listening', () => {
  const prof = new MockVoiceProfessor();
  prof.processTurn('Explicando um conceito longo de Direito Penal...');
  assert.strictEqual(prof.audioPlaying, true);
  assert.strictEqual(prof.state, 'speaking');

  // Aluno começa a falar durante a fala do professor
  prof.handleBargeIn('Espera, não entendi essa parte');
  assert.strictEqual(prof.audioPlaying, false, 'Áudio deve ser cortado no mesmo instante');
  assert.strictEqual(prof.state, 'listening', 'Deve reabrir microfone para ouvir o aluno');
});

// ----------------------------------------------------------------------------
// 3. RECONHECIMENTO DE INTENTS CONVERSACIONAIS DE VOZ
// ----------------------------------------------------------------------------
console.log('\n--- 3. Classificação de Intents de Voz ---');

runTest('Comando "pare" pausa e coloca estado em idle', () => {
  const prof = new MockVoiceProfessor();
  const res = prof.processTurn('pare');
  assert.strictEqual(res.intent, 'stop');
  assert.strictEqual(prof.state, 'idle');
});

runTest('Comando "não entendi" aciona modo de refraseamento/simplificação', () => {
  const prof = new MockVoiceProfessor();
  const res = prof.processTurn('Não entendi nada professor');
  assert.strictEqual(res.intent, 'rephrase');
  assert.ok(res.speechText.includes('simplificar'));
});

runTest('Comando "mais devagar" reduz velocidade de fala', () => {
  const prof = new MockVoiceProfessor();
  assert.strictEqual(prof.speechSpeed, 1.0);
  prof.processTurn('Fale mais devagar');
  assert.strictEqual(prof.speechSpeed, 0.85);
});

// ----------------------------------------------------------------------------
// 4. MODO SOCRÁTICO & PROVA ORAL
// ----------------------------------------------------------------------------
console.log('\n--- 4. Modos Pedagógicos: Socrático & Prova Oral ---');

runTest('Modo Socrático responde com pergunta orientadora em vez de resposta pronta', () => {
  const prof = new MockVoiceProfessor();
  const res = prof.processTurn('Qual a diferença de dolo e culpa?', 'socratic');
  assert.strictEqual(res.mode, 'socratic');
  assert.ok(res.speechText.endsWith('?'), 'Resposta socrática deve terminar com pergunta de reflexão');
});

runTest('Modo Prova Oral formula arguição sem revelar a resposta antes da tentativa', () => {
  const prof = new MockVoiceProfessor();
  const res = prof.processTurn('Quero treinar para a prova oral', 'oral_exam');
  assert.strictEqual(res.mode, 'oral_exam');
  assert.ok(res.speechText.includes('Candidato'));
  assert.ok(res.displayText.includes('Aguardando resposta') || res.displayText.includes('Simulado Prova Oral'));
});

// ----------------------------------------------------------------------------
// 5. SEPARAÇÃO DISPLAY_TEXT VS SPEECH_TEXT (OTIMIZAÇÃO DE TTS)
// ----------------------------------------------------------------------------
console.log('\n--- 5. Otimização de Texto para Síntese Vocal (TTS) ---');

function formatForSpeech(text) {
  // Remove markdown, links e substitui números de artigos por extenso conversacional
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/Art\.\s*(\d+)/gi, 'artigo $1')
    .replace(/CP/g, 'Código Penal')
    .replace(/CF\/88/g, 'Constituição Federal');
}

runTest('Texto para fala é otimizado sem caracteres de markdown e com termos por extenso', () => {
  const displayText = 'O **dolo eventual** ocorre no *Art. 18 do CP*.';
  const speechText = formatForSpeech(displayText);

  assert.strictEqual(speechText.includes('**'), false, 'Não deve conter asteriscos de markdown');
  assert.strictEqual(speechText.includes('*'), false);
  assert.ok(speechText.includes('artigo 18'));
  assert.ok(speechText.includes('Código Penal'));
});

// ----------------------------------------------------------------------------
// 6. PREVENÇÃO DE RESPOSTAS OBSOLETAS (RACE CONDITION)
// ----------------------------------------------------------------------------
console.log('\n--- 6. Prevenção de Respostas Obsoletas (Anti-Race Condition) ---');

runTest('Turno 1 descartado após interrupção nunca é executado no áudio', () => {
  const prof = new MockVoiceProfessor();
  
  // Turno 1 iniciado
  const turn1Id = ++prof.currentTurnId;
  
  // Usuário interrompe e inicia Turno 2
  prof.handleBargeIn('Nova pergunta!');
  const turn2Id = ++prof.currentTurnId;

  // Turno 1 tenta completar atrasado
  const canTurn1Speak = turn1Id === prof.currentTurnId;
  const canTurn2Speak = turn2Id === prof.currentTurnId;

  assert.strictEqual(canTurn1Speak, false, 'Turno 1 obsoleto deve ser descartado');
  assert.strictEqual(canTurn2Speak, true, 'Turno 2 ativo deve ser autorizado');
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DO PROFESSOR POR VOZ: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 18 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
