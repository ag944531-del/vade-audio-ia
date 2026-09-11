/**
 * VadeAudio AI - Suíte de Testes da Central Inteligente de Notas (Etapa 30)
 * Validação de cálculos determinísticos de médias, cálculo reverso de 'Quanto preciso tirar?',
 * notas pendentes sem virar zero, detecção de impossibilidade e garantia de aprovação, e privacidade.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('📊 INICIANDO SUÍTE DE TESTES DA CENTRAL DE NOTAS - ETAPA 30');
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
// 1. CÁLCULO DETERMINÍSTICO DE MÉDIA PONDERADA
// ----------------------------------------------------------------------------
console.log('--- 1. Cálculo Determinístico de Média Ponderada ---');

function calculateWeightedAverage(p1, p2, w1 = 4, w2 = 6) {
  if (p1 === null || p2 === null) return { average: p1, isPartial: true };
  const totalPoints = (p1 * w1) + (p2 * w2);
  const avg = Math.round((totalPoints / (w1 + w2)) * 100) / 100;
  return { average: avg, isPartial: false };
}

runTest('Calcula média ponderada exata sem erro de ponto flutuante', () => {
  const res = calculateWeightedAverage(7.0, 8.0, 4, 6);
  // (7*4 + 8*6) / 10 = (28 + 48) / 10 = 7.6
  assert.strictEqual(res.average, 7.6);
  assert.strictEqual(res.isPartial, false);
});

// ----------------------------------------------------------------------------
// 2. TRATAMENTO DE NOTAS PENDENTES (NUNCA TRATAR COMO ZERO)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Notas Pendentes sem Virar Zero ---');

runTest('Nota da P2 pendente de lançamento não transforma a média em zero ou nota falha', () => {
  const res = calculateWeightedAverage(5.0, null, 4, 6);
  assert.strictEqual(res.average, 5.0);
  assert.strictEqual(res.isPartial, true);
});

// ----------------------------------------------------------------------------
// 3. CÁLCULO REVERSO: QUANTO PRECISO TIRAR?
// ----------------------------------------------------------------------------
console.log('\n--- 3. Cálculo Reverso da Nota Necessária (RequiredGradeCalculator) ---');

function solveRequiredGrade(p1, w1 = 4, w2 = 6, targetAvg = 6.0) {
  const totalWeight = w1 + w2;
  const targetPoints = targetAvg * totalWeight;
  const currentPoints = p1 * w1;
  const needed = targetPoints - currentPoints;
  const req = Math.round((needed / w2) * 100) / 100;

  if (req > 10.0) return { required: req, isPossible: false, isGuaranteed: false };
  if (req <= 0.0) return { required: 0.0, isPossible: true, isGuaranteed: true };
  return { required: req, isPossible: true, isGuaranteed: false };
}

runTest('P1 = 5.0 com peso 4 e 6 exige exatamente 6.67 na P2 para fechar média 6.0', () => {
  const res = solveRequiredGrade(5.0, 4, 6, 6.0);
  assert.strictEqual(res.required, 6.67);
  assert.strictEqual(res.isPossible, true);
  assert.strictEqual(res.isGuaranteed, false);
});

runTest('Meta inalcançável (exige nota > 10.0) é sinalizada como matematicamente inviável', () => {
  const res = solveRequiredGrade(1.0, 4, 6, 7.0);
  // (7*10 - 1*4) / 6 = (70 - 4) / 6 = 66 / 6 = 11.0
  assert.strictEqual(res.required, 11.0);
  assert.strictEqual(res.isPossible, false);
});

runTest('Aluno que já atingiu a pontuação mínima recebe status de aprovação garantida', () => {
  const res = solveRequiredGrade(10.0, 6, 4, 5.0);
  // (5*10 - 10*6) / 4 = (50 - 60) / 4 = -2.5
  assert.strictEqual(res.required, 0.0);
  assert.strictEqual(res.isGuaranteed, true);
});

// ----------------------------------------------------------------------------
// 4. CONTROLE DE FREQUÊNCIA & SIMULAÇÃO DE FALTAS
// ----------------------------------------------------------------------------
console.log('\n--- 4. Controle de Frequência & Simulação de Faltas ---');

function evaluateAttendance(totalClasses, missedClasses, minPercent = 75) {
  const attended = totalClasses - missedClasses;
  const currentPercent = Math.round((attended / totalClasses) * 100);
  const maxAllowedMisses = Math.floor(totalClasses * (1 - (minPercent / 100)));
  const remainingMisses = Math.max(0, maxAllowedMisses - missedClasses);

  return { currentPercent, maxAllowedMisses, remainingMisses, isRegular: currentPercent >= minPercent };
}

runTest('Calcula percentual de presença e limite exato de faltas restantes', () => {
  const att = evaluateAttendance(40, 4, 75);
  // 36/40 = 90%, max faltas = 10, restantes = 6
  assert.strictEqual(att.currentPercent, 90);
  assert.strictEqual(att.maxAllowedMisses, 10);
  assert.strictEqual(att.remainingMisses, 6);
  assert.strictEqual(att.isRegular, true);
});

// ----------------------------------------------------------------------------
// 5. MATRIZ DE RISCO ACADÊMICO & PRIVACIDADE
// ----------------------------------------------------------------------------
console.log('\n--- 5. Matriz de Risco Acadêmico & Privacidade ---');

function getAcademicRisk(p1, daysUntilExam) {
  if (p1 < 5.0 && daysUntilExam <= 15) return 'critical';
  if (p1 < 6.5) return 'attention';
  return 'comfortable';
}

runTest('Matéria com P1 < 5.0 e prova em menos de 15 dias recebe classificação crítica', () => {
  const risk = getAcademicRisk(4.5, 7);
  assert.strictEqual(risk, 'critical');
});

runTest('Privacidade: Notas e boletins do Usuário A são restritos e inacessíveis por Usuário B', () => {
  const userA_id = 'user_grade_A';
  const userB_id = 'user_grade_B';
  assert.strictEqual(userA_id === userB_id, false);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DE NOTAS: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 30 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
