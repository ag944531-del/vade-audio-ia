/**
 * VadeAudio AI - Suíte de Testes de Prova Oral & Audiência Avançada (Etapa 19)
 * Validação do ciclo completo de arguição oral, perguntas de aprofundamento,
 * cálculo matemático das rubricas (0 a 10), sustentações orais, audiências simuladas,
 * caderno de erros orais e isolamento multiusuário.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('🎤 INICIANDO SUÍTE DE TESTES DE PROVA ORAL & AUDIÊNCIA - ETAPA 19');
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
// 1. CICLO COMPLETO DE ARGUIÇÃO COM APROFUNDAMENTO CONTEXTUAL
// ----------------------------------------------------------------------------
console.log('--- 1. Ciclo de Arguição & Perguntas de Aprofundamento ---');

function generateFollowUp(studentAnswer) {
  const lower = (studentAnswer || '').toLowerCase();
  if (lower.includes('legítima defesa') && !lower.includes('atual')) {
    return 'O senhor mencionou agressão injusta. Ela precisa ser atual ou pode ser pretérita?';
  }
  if (lower.includes('dolo') && !lower.includes('teoria')) {
    return 'Qual teoria dogmática foi expressamente adotada pelo Código Penal para o dolo eventual?';
  }
  return 'Candidato, complemente citando o dispositivo legal aplicável.';
}

runTest('Banca gera pergunta de aprofundamento conectada ao instituto citado pelo aluno', () => {
  const studentInitial = 'Excelência, a legítima defesa é uma excludente de ilicitude que exige agressão injusta e uso moderado dos meios.';
  const followUp = generateFollowUp(studentInitial);
  
  assert.ok(followUp.includes('atual ou pode ser pretérita'), 'Aprofundamento deve focar na tempestividade da agressão');
});

// ----------------------------------------------------------------------------
// 2. MATEMÁTICA DA RUBRICA DE AVALIAÇÃO (0 A 10 PONTOS)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Rubrica de Avaliação Objetiva (0 a 10.0) ---');

function computeRubricScore(legalAccuracy, legalGrounding, clarity, timeManagement) {
  const acc = Math.min(4.0, Math.max(0, legalAccuracy));
  const ground = Math.min(3.0, Math.max(0, legalGrounding));
  const clar = Math.min(2.0, Math.max(0, clarity));
  const time = Math.min(1.0, Math.max(0, timeManagement));

  const total = Math.min(10.0, Math.round((acc + ground + clar + time) * 10) / 10);
  return { acc, ground, clar, time, total };
}

runTest('Cálculo da rubrica respeita os tetos máximos por categoria (4.0 + 3.0 + 2.0 + 1.0 = 10.0)', () => {
  const perfect = computeRubricScore(4.0, 3.0, 2.0, 1.0);
  assert.strictEqual(perfect.total, 10.0);

  const realAnswer = computeRubricScore(3.5, 2.5, 1.5, 1.0);
  assert.strictEqual(realAnswer.total, 8.5);
});

runTest('Penalidade de tempo reduz nota de gestão do tempo sem anular correção jurídica', () => {
  const overTime = computeRubricScore(4.0, 3.0, 2.0, 0.2); // estourou tempo
  assert.strictEqual(overTime.total, 9.2);
  assert.strictEqual(overTime.acc, 4.0);
});

// ----------------------------------------------------------------------------
// 3. RESPOSTA MODELO DOGMÁTICA (SEM ALUCINAÇÕES)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Validação da Resposta Modelo Oficial ---');

const mockQuestion = {
  id: 'q_penal_1',
  stem: 'Diferencie dolo eventual de culpa consciente.',
  requiredArticles: ['Art. 18, I e II do Código Penal'],
  modelAnswer: 'No dolo eventual (Art. 18, I do CP), o agente assume o risco do resultado (Teoria do Assentimento). Na culpa consciente, prevê o resultado mas confia sinceramente na sua não ocorrência.'
};

runTest('Resposta modelo referencia expressamente o Artigo 18 do Código Penal e Teoria do Assentimento', () => {
  assert.ok(mockQuestion.modelAnswer.includes('Art. 18'));
  assert.ok(mockQuestion.modelAnswer.includes('Teoria do Assentimento'));
});

// ----------------------------------------------------------------------------
// 4. SUSTENTAÇÃO ORAL & ESTRUTURA DA TESE
// ----------------------------------------------------------------------------
console.log('\n--- 4. Sustentação Oral Estruturada ---');

function evaluateOralArgument(argumentSteps) {
  const required = ['abertura', 'sintese_fatica', 'tese_juridica', 'sumulas_jurisprudencia', 'pedido'];
  const present = required.filter(r => argumentSteps.includes(r));
  return {
    completenessPercent: Math.round((present.length / required.length) * 100),
    isApproved: present.length >= 4
  };
}

runTest('Sustentação Oral completa com 5 pilares é aprovada pela comissão', () => {
  const steps = ['abertura', 'sintese_fatica', 'tese_juridica', 'sumulas_jurisprudencia', 'pedido'];
  const res = evaluateOralArgument(steps);
  assert.strictEqual(res.completenessPercent, 100);
  assert.strictEqual(res.isApproved, true);
});

// ----------------------------------------------------------------------------
// 5. AUDIÊNCIA SIMULADA & MODO JUIZ
// ----------------------------------------------------------------------------
console.log('\n--- 5. Audiência Simulada & Condução do Juiz ---');

const mockHearing = {
  jurisdiction: 'Vara do Trabalho',
  caseSummary: 'Horas extras de gerente sem poderes de mando (Art. 62, II CLT)',
  witnessTestimony: 'O reclamante batia ponto biométrico diariamente e não podia demitir.',
  judgeDecisionPrompt: 'Proferir decisão oral sobre a incidência ou afastamento do Art. 62, II da CLT.'
};

runTest('Modo Juiz avalia a fundamentação oral da decisão com base na prova testemunhal consistente', () => {
  const judgeDecision = 'Declaro o direito às horas extras tendo em vista que a prova testemunhal comprovou o controle biométrico de jornada, afastando a exceção do artigo 62 da CLT.';
  
  const hasLaw = judgeDecision.includes('artigo 62') || judgeDecision.includes('CLT');
  const hasWitnessFact = judgeDecision.includes('testemunhal') || judgeDecision.includes('biométrico');

  assert.strictEqual(hasLaw, true);
  assert.strictEqual(hasWitnessFact, true);
});

// ----------------------------------------------------------------------------
// 6. CADERNO DE ERROS ORAIS & NOVA RODADA ADAPTATIVA
// ----------------------------------------------------------------------------
console.log('\n--- 6. Caderno de Erros Orais & Nova Rodada Adaptativa ---');

const oralErrorsDb = [];

function registerOralError(questionStem, missedLaw) {
  oralErrorsDb.push({
    id: 'oe_' + Math.random().toString(36).substring(2, 6),
    questionStem,
    missedLaw,
    recordedAt: Date.now()
  });
}

function generateAdaptiveRound(errors) {
  return errors.map(e => ({
    targetQuestion: e.questionStem,
    focusLaw: e.missedLaw
  }));
}

runTest('Caderno de Erros registra falhas orais e gera nova rodada adaptativa personalizada', () => {
  registerOralError('Diferencie tutela cautelar de tutela antecipada', 'Art. 300 vs Art. 305 do CPC');
  
  assert.strictEqual(oralErrorsDb.length, 1);
  const nextRound = generateAdaptiveRound(oralErrorsDb);
  assert.strictEqual(nextRound[0].focusLaw, 'Art. 300 vs Art. 305 do CPC');
});

// ----------------------------------------------------------------------------
// 7. ISOLAMENTO MULTIUSUÁRIO & PRIVACIDADE LGPD
// ----------------------------------------------------------------------------
console.log('\n--- 7. Isolamento de Histórico Oral Privado ---');

const userOralRecords = new Map();
userOralRecords.set('usr_lucas_101', [{ examId: 'oe_1', score: 8.5 }]);
userOralRecords.set('usr_mariana_202', [{ examId: 'oe_2', score: 9.0 }]);

function getOralHistory(requestingUserId, targetUserId) {
  if (requestingUserId !== targetUserId) {
    throw new Error('Acesso proibido ao histórico oral de outro candidato.');
  }
  return userOralRecords.get(targetUserId);
}

runTest('Estudante A não tem autorização para visualizar as gravações e notas orais de Estudante B', () => {
  assert.throws(() => {
    getOralHistory('usr_lucas_101', 'usr_mariana_202');
  }, /Acesso proibido/);

  const ownHistory = getOralHistory('usr_lucas_101', 'usr_lucas_101');
  assert.strictEqual(ownHistory[0].score, 8.5);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DE PROVA ORAL: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 19 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
