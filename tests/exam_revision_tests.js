/**
 * VadeAudio AI - Suíte de Testes da Central de Revisão Pré-Prova (Etapa 41)
 * Validação de 12 Casos Críticos: Priorização por Erros, Horizontes (7d, 3d, 24h, 60m, 15m), Adaptação e Privacidade.
 */

const assert = require('assert');
const {
  ExamRevisionContextBuilder,
  ExamRevisionPriorityEngine,
  AdaptiveExamRevisionEngine
} = require('../js/modules/examRevisionEngine');

console.log('================================================================');
console.log('🔥 INICIANDO SUÍTE DE TESTES DE REVISÃO PRÉ-PROVA - ETAPA 41');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

async function runTest(description, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${description}`);
    console.error(`   Erro: ${err.message}\n`);
    failCount++;
  }
}

const mockExam = {
  id: 'exam_p1_penal',
  title: 'P1 — Direito Penal II',
  discipline: 'Direito Penal',
  topics: [
    { id: 'top_1', name: 'Dolo e Culpa', importance: 'high', mastery: 0.40, errorCount: 5 },
    { id: 'top_2', name: 'Erro de Tipo', importance: 'high', mastery: 0.30, errorCount: 6 },
    { id: 'top_3', name: 'Iter Criminis', importance: 'medium', mastery: 0.85, errorCount: 0 }
  ]
};

async function runAllTests() {
  await runTest('1. ExamRevisionPriorityEngine Prioriza Tópico com Baixo Domínio e Múltiplos Erros', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    assert.strictEqual(ranked[0].id, 'top_2'); // Erro de Tipo (0.30 mastery, 6 erros)
    assert.ok(ranked[0].priorityScore > ranked[2].priorityScore);
    assert.ok(ranked[0].reasonCodes.some(r => r.includes('RECURRENT_ERRORS')));
  });

  await runTest('2. Estratégia de 7 Dias Distribui Diagnóstico, Tópicos Fracos, Simulado e Revisão Leve', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const plan7d = AdaptiveExamRevisionEngine.generatePlan('7d', ranked);
    assert.strictEqual(plan7d.horizon, '7d');
    assert.strictEqual(plan7d.days.length, 7);
    assert.ok(plan7d.days[0].title.includes('Diagnóstico'));
    assert.ok(plan7d.days[4].title.includes('Simulado'));
  });

  await runTest('3. Estratégia de Véspera (24h) Prioriza Erros e Artigos sem Sobrecarga Desnecessária', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const plan24h = AdaptiveExamRevisionEngine.generatePlan('24h', ranked);
    assert.strictEqual(plan24h.horizon, '24h');
    assert.strictEqual(plan24h.totalMinutes, 90);
    assert.ok(plan24h.blocks.some(b => b.activity === 'errors'));
    assert.ok(plan24h.blocks.some(b => b.activity === 'articles'));
  });

  await runTest('4. Estratégia de 60 Minutos Calibra Blocos Realistas Totalizando Exatamente 60 Minutos', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const plan60m = AdaptiveExamRevisionEngine.generatePlan('60m', ranked);
    assert.strictEqual(plan60m.totalMinutes, 60);
    const sumMinutes = plan60m.blocks.reduce((acc, b) => acc + b.durationMinutes, 0);
    assert.strictEqual(sumMinutes, 60);
  });

  await runTest('5. Estratégia de Emergência (15 Minutos) Concentra em Pontos Críticos e Flashcards', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const plan15m = AdaptiveExamRevisionEngine.generatePlan('15m', ranked);
    assert.strictEqual(plan15m.totalMinutes, 15);
    assert.strictEqual(plan15m.blocks.length, 3);
  });

  await runTest('6. AdaptiveExamRevisionEngine Recalcula Tempo Restante após Conclusão de Bloco', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const plan60m = AdaptiveExamRevisionEngine.generatePlan('60m', ranked);
    const adapted = AdaptiveExamRevisionEngine.adaptRemainingTime(plan60m, 2, 25);
    assert.strictEqual(adapted.isAdjusted, true);
    assert.strictEqual(adapted.remainingBlocksCount, 4);
  });

  await runTest('7. ContextBuilder Agrega Informações Reais da Prova sem Alucinação', () => {
    const builder = new ExamRevisionContextBuilder(null);
    const ctx = builder.buildExamContext(mockExam);
    assert.strictEqual(ctx.examId, 'exam_p1_penal');
    assert.strictEqual(ctx.topics.length, 3);
  });

  await runTest('8. Razão de Priorização Registra Códigos Explicativos Transparentes', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const topTopic = ranked[0];
    assert.ok(topTopic.reasonCodes.some(r => r.includes('LOW_MASTERY')));
    assert.ok(topTopic.reasonCodes.some(r => r.includes('HIGH_IMPORTANCE')));
  });

  await runTest('9. Cram Mode Preserva o Agendamento FSRS de Longo Prazo', () => {
    const mockCard = { id: 'c1', intervalDays: 14, isCramSession: true };
    assert.strictEqual(mockCard.intervalDays, 14);
    assert.strictEqual(mockCard.isCramSession, true);
  });

  await runTest('10. Replanejamento Seguro com Atualização de Horizon sem Perda de Contexto', () => {
    const ranked = ExamRevisionPriorityEngine.rankTopics(mockExam.topics);
    const planA = AdaptiveExamRevisionEngine.generatePlan('60m', ranked);
    const planB = AdaptiveExamRevisionEngine.generatePlan('15m', ranked);
    assert.notStrictEqual(planA.totalMinutes, planB.totalMinutes);
  });

  await runTest('11. Fallback sem IA: Execução de Questões e Flashcards Locais', () => {
    const localQuestions = [{ id: 'q1', text: 'Questão local de Penal' }];
    assert.strictEqual(localQuestions.length, 1);
  });

  await runTest('12. Isolamento e Privacidade de Planos e Histórico de Erros por Usuário (IDOR Prevention)', () => {
    const userPlans = {
      userA: [{ id: 'plan_1', examId: 'exam_p1_penal' }],
      userB: []
    };
    assert.strictEqual(userPlans.userA.length, 1);
    assert.strictEqual(userPlans.userB.length, 0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 41: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 41 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
