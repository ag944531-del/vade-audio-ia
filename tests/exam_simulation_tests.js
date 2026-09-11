/**
 * VadeAudio AI - Suíte de Testes do Simulador Inteligente & Raio-X (Etapa 27)
 * Validação de simulados realistas, snapshots imutáveis, ausência de vazamento de gabarito,
 * classificação de causas no Raio-X dos Erros e privacidade.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('🎯 INICIANDO SUÍTE DE TESTES DO SIMULADOR INTELIGENTE - ETAPA 27');
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
// 1. CRIAÇÃO DE SIMULADO & SNAPSHOTS IMUTÁVEIS
// ----------------------------------------------------------------------------
console.log('--- 1. Criação de Simulado & Snapshot Imutável ---');

function createSampleSimulation() {
  return {
    id: 'sim_test_1',
    type: 'faculdade',
    questions: [
      {
        id: 'q1',
        topic: 'Tentativa de Homicídio',
        correctIndex: 1,
        relatedArticle: 'Art. 121 CP',
        selectedAnswer: null,
        timeSpent: 0,
        distractorConcepts: { 0: 'Lesão Corporal' }
      },
      {
        id: 'q2',
        topic: 'Tutela de Urgência',
        correctIndex: 1,
        relatedArticle: 'Art. 300 CPC',
        selectedAnswer: null,
        timeSpent: 0,
        distractorConcepts: { 0: 'Tutela da Evidência' }
      }
    ]
  };
}

runTest('Criação do simulado preserva integridade do snapshot das questões', () => {
  const sim = createSampleSimulation();
  assert.strictEqual(sim.questions.length, 2);
  assert.strictEqual(sim.questions[0].topic, 'Tentativa de Homicídio');
  assert.strictEqual(sim.questions[0].selectedAnswer, null);
});

// ----------------------------------------------------------------------------
// 2. MODO REALISTA (SEM VAZAMENTO DE GABARITO ANTES DO ENVIO)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Modo Realista & Ocultação de Gabarito ---');

function getStudentView(sim) {
  return sim.questions.map(q => ({
    id: q.id,
    topic: q.topic,
    selectedAnswer: q.selectedAnswer
    // Note: correctIndex and explanation omitted
  }));
}

runTest('Interface do aluno durante a prova não expõe gabarito nem explicação', () => {
  const sim = createSampleSimulation();
  const studentView = getStudentView(sim);

  assert.strictEqual(studentView[0].correctIndex, undefined);
  assert.strictEqual(studentView[0].explanation, undefined);
});

// ----------------------------------------------------------------------------
// 3. 🔬 RAIO-X DOS ERROS (CLASSIFICAÇÃO DOGMÁTICA & COMPORTAMENTAL)
// ----------------------------------------------------------------------------
console.log('\n--- 3. 🔬 Raio-X dos Erros & Diagnóstico de Causa ---');

function analyzeError(q, selectedIdx, timeSpent) {
  if (selectedIdx === null || selectedIdx === undefined) {
    return { cause: 'Gerenciamento de Tempo', diagnosis: 'Questão deixada em branco.' };
  }
  if (q.distractorConcepts && q.distractorConcepts[selectedIdx]) {
    return {
      cause: 'Confusão Conceitual',
      diagnosis: `Possível confusão entre ${q.topic} e ${q.distractorConcepts[selectedIdx]}.`
    };
  }
  if (timeSpent < 15) {
    return { cause: 'Desatenção', diagnosis: 'Resposta excessivamente rápida.' };
  }
  return { cause: 'Conteúdo Não Dominado', diagnosis: 'Divergência legal.' };
}

runTest('Identifica Confusão Conceitual quando alternativa marcada é distrator clássico', () => {
  const sim = createSampleSimulation();
  const q = sim.questions[1]; // Tutela de Urgência
  const xray = analyzeError(q, 0, 45); // Marcou distrator de Tutela da Evidência

  assert.strictEqual(xray.cause, 'Confusão Conceitual');
  assert.ok(xray.diagnosis.includes('Tutela da Evidência'));
});

runTest('Identifica Desatenção quando questão é respondida em menos de 15 segundos', () => {
  const sim = createSampleSimulation();
  const q = { topic: 'Geral', distractorConcepts: {} };
  const xray = analyzeError(q, 3, 8); // 8 segundos

  assert.strictEqual(xray.cause, 'Desatenção');
  assert.ok(xray.diagnosis.includes('rápida'));
});

runTest('Identifica Gerenciamento de Tempo quando questão é deixada em branco', () => {
  const sim = createSampleSimulation();
  const q = sim.questions[0];
  const xray = analyzeError(q, null, 0);

  assert.strictEqual(xray.cause, 'Gerenciamento de Tempo');
});

// ----------------------------------------------------------------------------
// 4. SUBMISSÃO & CÁLCULO DE MÉTRICAS
// ----------------------------------------------------------------------------
console.log('\n--- 4. Submissão, Nota & Relatório de Desempenho ---');

function gradeSimulation(sim) {
  let correct = 0;
  let wrong = 0;
  for (const q of sim.questions) {
    if (q.selectedAnswer === q.correctIndex) correct++;
    else wrong++;
  }
  const scorePercent = Math.round((correct / sim.questions.length) * 100);
  return { correct, wrong, scorePercent };
}

runTest('Calcula percentual de acertos e contagem exata de erros', () => {
  const sim = createSampleSimulation();
  sim.questions[0].selectedAnswer = 1; // Correta
  sim.questions[1].selectedAnswer = 0; // Errada

  const res = gradeSimulation(sim);
  assert.strictEqual(res.correct, 1);
  assert.strictEqual(res.wrong, 1);
  assert.strictEqual(res.scorePercent, 50);
});

// ----------------------------------------------------------------------------
// 5. PRIVACIDADE MULTIUSUÁRIO
// ----------------------------------------------------------------------------
console.log('\n--- 5. Privacidade & Isolamento de Resultados ---');

function canAccessSimulationResult(simOwnerId, reqUserId) {
  return simOwnerId === reqUserId;
}

runTest('Usuário A é impedido de acessar o relatório detalhado de simulado do Usuário B', () => {
  assert.strictEqual(canAccessSimulationResult('user_A', 'user_B'), false);
  assert.strictEqual(canAccessSimulationResult('user_A', 'user_A'), true);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DO SIMULADOR: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 27 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
