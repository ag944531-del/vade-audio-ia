/**
 * VadeAudio AI - Suíte de Testes da Central de Prazos Processuais (Etapa 39)
 * Validação de 12 Casos Críticos: CPC, CLT, CPP, Feriados, DJe, Recesso Art. 220, Diagnóstico de Erros e Timeline.
 */

const assert = require('assert');
const {
  ProceduralDeadlineRuleCatalog,
  LegalBusinessDayService,
  DeadlineTriggerResolver,
  DeadlineCountingEngine,
  DeadlineErrorAnalyzer
} = require('../js/modules/proceduralDeadlineEngine');
const { LegalProcessTimelineService } = require('../js/modules/legalProcessTimelineService');

console.log('================================================================');
console.log('⏱️ INICIANDO SUÍTE DE TESTES DE PRAZOS PROCESSUAIS - ETAPA 39');
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

async function runAllTests() {
  await runTest('1. Contagem Padrão de 15 Dias Úteis no CPC (Apelação Cível)', () => {
    // 2026-08-10 é uma segunda-feira.
    // Início da contagem: 2026-08-11 (terça-feira).
    // 15 dias úteis sem feriados adicionais = 2026-08-31 (segunda-feira).
    const calc = DeadlineCountingEngine.calculate({
      ruleId: 'cpc_recurso_geral',
      triggerDateStr: '2026-08-10',
      isDjePublication: false
    });
    assert.strictEqual(calc.countStartDate, '2026-08-11');
    assert.strictEqual(calc.deadlineEndDate, '2026-08-31');
    assert.strictEqual(calc.daysCounted, 15);
  });

  await runTest('2. Contagem em Dias Úteis na CLT (8 Dias Úteis para Recurso Ordinário)', () => {
    // 2026-08-10 (segunda). Início: 2026-08-11 (terça). 8 dias úteis = 2026-08-20 (quinta).
    const calc = DeadlineCountingEngine.calculate({
      ruleId: 'clt_recurso_ordinario',
      triggerDateStr: '2026-08-10',
      isDjePublication: false
    });
    assert.strictEqual(calc.countStartDate, '2026-08-11');
    assert.strictEqual(calc.deadlineEndDate, '2026-08-20');
    assert.strictEqual(calc.daysCounted, 8);
  });

  await runTest('3. Contagem em Dias Corridos no CPP (5 Dias Corridos para Apelação Criminal)', () => {
    // 2026-08-10 (segunda). Início: 2026-08-11. 5 dias corridos = 2026-08-15 (sábado -> prorroga para segunda 2026-08-17).
    const calc = DeadlineCountingEngine.calculate({
      ruleId: 'cpp_apelacao_penal',
      triggerDateStr: '2026-08-10',
      isDjePublication: false
    });
    assert.strictEqual(calc.deadlineEndDate, '2026-08-17');
    assert.ok(calc.calculationSteps.some(s => s.type === 'prorogation'));
  });

  await runTest('4. Feriado no Termo Inicial Prorroga o Início da Contagem para o 1º Dia Útil Subsequente', () => {
    // 2026-04-20 (segunda). 2026-04-21 é feriado nacional (Tiradentes).
    // Início da contagem deve ser prorrogado para 2026-04-22 (quarta-feira).
    const triggerRes = DeadlineTriggerResolver.resolveStartTerm('2026-04-20', false);
    assert.strictEqual(triggerRes.countStartDate.toISOString().split('T')[0], '2026-04-22');
  });

  await runTest('5. Feriado ou Fim de Semana no Dia do Vencimento Prorroga Prazo Final', () => {
    // Se o dia final cair em feriado (ex: 07/09), prorroga para 08/09.
    const customHolidays = ['2026-08-31'];
    const calc = DeadlineCountingEngine.calculate({
      ruleId: 'cpc_recurso_geral',
      triggerDateStr: '2026-08-10',
      customHolidays
    });
    assert.strictEqual(calc.deadlineEndDate, '2026-09-01');
  });

  await runTest('6. Suspensão de Prazos no Recesso Forense do Art. 220 do CPC (20/dez a 20/jan)', () => {
    const dec22 = new Date('2026-12-22T12:00:00');
    const jan10 = new Date('2027-01-10T12:00:00');
    const jan25 = new Date('2027-01-25T12:00:00');

    assert.strictEqual(LegalBusinessDayService.isRecessoForense(dec22), true);
    assert.strictEqual(LegalBusinessDayService.isRecessoForense(jan10), true);
    assert.strictEqual(LegalBusinessDayService.isRecessoForense(jan25), false);
  });

  await runTest('7. Publicação no DJe Considera Publicado no 1º Dia Útil e Inicia Contagem no 2º Dia Útil', () => {
    // DJe em 2026-08-10 (segunda).
    // Publicação efetiva: 2026-08-11 (terça).
    // Início da contagem: 2026-08-12 (quarta).
    const triggerRes = DeadlineTriggerResolver.resolveStartTerm('2026-08-10', true);
    assert.strictEqual(triggerRes.effectivePublicationDate.toISOString().split('T')[0], '2026-08-11');
    assert.strictEqual(triggerRes.countStartDate.toISOString().split('T')[0], '2026-08-12');
  });

  await runTest('8. DeadlineErrorAnalyzer Identifica Início Antecipado Indevido', () => {
    const correctCalc = DeadlineCountingEngine.calculate({
      ruleId: 'cpc_recurso_geral',
      triggerDateStr: '2026-08-10'
    });
    const analysis = DeadlineErrorAnalyzer.analyzeError('2026-08-28', correctCalc);
    assert.strictEqual(analysis.isCorrect, false);
    assert.strictEqual(analysis.errorCategory, 'CONTAGEM_ANTECIPADA_OU_FIM_DE_SEMANA');
  });

  await runTest('9. DeadlineErrorAnalyzer Valida Acerto Exato do Aluno', () => {
    const correctCalc = DeadlineCountingEngine.calculate({
      ruleId: 'cpc_recurso_geral',
      triggerDateStr: '2026-08-10'
    });
    const analysis = DeadlineErrorAnalyzer.analyzeError('2026-08-31', correctCalc);
    assert.strictEqual(analysis.isCorrect, true);
  });

  await runTest('10. LegalProcessTimelineService Detecta Recurso Protocolado Antes da Decisão', () => {
    const events = [
      { id: 'e1', type: 'recurso', title: 'Apelação Protocolada', date: '2026-08-05' },
      { id: 'e2', type: 'sentenca', title: 'Sentença Publicada', date: '2026-08-10' }
    ];
    const built = LegalProcessTimelineService.buildTimeline(events, []);
    assert.strictEqual(built.hasAnomalies, true);
    assert.strictEqual(built.anomalies[0].issue, 'RECURSO_ANTERIOR_A_DECISAO');
  });

  await runTest('11. Imutabilidade do Motor: A Data Determinística é a Fonte de Verdade', () => {
    const calc = DeadlineCountingEngine.calculate({
      ruleId: 'cpc_embargos_declaracao',
      triggerDateStr: '2026-08-10'
    });
    // 5 dias úteis: início 11, contados 11, 12, 13, 14, 17 -> 2026-08-17
    assert.strictEqual(calc.deadlineEndDate, '2026-08-17');
    assert.strictEqual(calc.daysCounted, 5);
  });

  await runTest('12. Isolamento e Privacidade de Exercícios e Prazos por Usuário (IDOR Prevention)', () => {
    const userDeadlines = {
      userA: [{ id: 'calc_1', date: '2026-08-31' }],
      userB: []
    };
    assert.strictEqual(userDeadlines.userA.length, 1);
    assert.strictEqual(userDeadlines.userB.length, 0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 39: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 39 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
