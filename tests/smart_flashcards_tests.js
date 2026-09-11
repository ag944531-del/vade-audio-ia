/**
 * VadeAudio AI - Suíte de Testes dos Flashcards Inteligentes & Scheduler FSRS (Etapa 35)
 * Validação de 12 Casos Críticos: FSRS, Lapses, Leech, Cram Mode, Cloze, Duplicatas e Sincronização.
 */

const assert = require('assert');
const SpacedRepetitionScheduler = require('../js/modules/spacedRepetitionScheduler');
const { FlashcardQualityValidator, FlashcardImprovementService } = require('../js/modules/flashcardQualityValidator');
const FlashcardGenerationService = require('../js/modules/flashcardGenerationService');

console.log('================================================================');
console.log('🃏 INICIANDO SUÍTE DE TESTES DOS FLASHCARDS INTELIGENTES - ETAPA 35');
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

const scheduler = new SpacedRepetitionScheduler();
const qualityValidator = new FlashcardQualityValidator();

async function runAllTests() {
  await runTest('1. Agendamento FSRS com Rating "Bom (3)" Gera Próximo Intervalo Válido', () => {
    const card = { id: 'fc_1', stability: 1.0, difficulty: 5.0, reps: 0, lapses: 0 };
    const res = scheduler.scheduleReview(card, 3);
    assert.ok(res.intervalDays >= 1, 'Intervalo deve ser de pelo menos 1 dia');
    assert.strictEqual(res.reps, 1);
  });

  await runTest('2. Agendamento FSRS com Rating "Esqueci (1)" Reseta Intervalo e Incrementa Lapse', () => {
    const card = { id: 'fc_2', stability: 10.0, difficulty: 4.0, reps: 3, lapses: 0 };
    const res = scheduler.scheduleReview(card, 1);
    assert.ok(res.intervalDays < 1, 'Intervalo deve ser curto após esquecimento');
    assert.strictEqual(res.lapses, 1);
  });

  await runTest('3. Ratings Consecutivos "Fácil (4)" Geram Crescimento Progressivo de Estabilidade', () => {
    let card = { id: 'fc_3', stability: 2.0, difficulty: 4.0, reps: 1, lapses: 0 };
    const res1 = scheduler.scheduleReview(card, 4);
    card = { ...card, ...res1 };
    const res2 = scheduler.scheduleReview(card, 4);
    assert.ok(res2.stability > res1.stability, 'Estabilidade deve crescer após acertos fáceis consecutivos');
  });

  await runTest('4. Detecção de Leech Card (Falhas Repetidas >= 4 Lapses)', () => {
    const card = { id: 'fc_leech', stability: 0.5, difficulty: 8.0, reps: 6, lapses: 3 };
    const res = scheduler.scheduleReview(card, 1); // 4º lapse
    assert.strictEqual(res.isLeech, true, 'Cartão com 4 lapses deve ser classificado como Leech');
  });

  await runTest('5. Modo Prova (Cram Mode) Não Altera a Curva de Estabilidade de Longo Prazo', () => {
    const card = { id: 'fc_cram', stability: 15.0, difficulty: 4.5, reps: 5, lapses: 0, due_at: 1700000000000 };
    const res = scheduler.scheduleReview(card, 1, { isCramMode: true });
    assert.strictEqual(res.isCramMode, true);
    assert.strictEqual(res.stability, 15.0, 'Estabilidade não deve ser reduzida no Cram Mode');
    assert.strictEqual(res.lapses, 0, 'Lapses de longo prazo não devem ser alterados no Cram Mode');
  });

  await runTest('6. Detecção de Cartão com Resposta Excessivamente Longa (> 350 caracteres)', () => {
    const badCard = {
      question: 'O que é responsabilidade civil?',
      answer: 'A responsabilidade civil no direito brasileiro decorre do preceito geral de não lesar a outrem (neminem laedere), disciplinado minuciosamente no Código Civil de 2002 nos artigos 186, 187 e 927. Ela se subdivide em contratual e extracontratual (aquiliana), exigindo a demonstração de conduta comissiva ou omissiva, nexo de causalidade direto e imediato e dano patrimonial ou extrapatrimonial sofrido pela vítima.'
    };
    const val = qualityValidator.validateCard(badCard);
    assert.strictEqual(val.issues.includes('RESPOSTA_EXCESSIVAMENTE_LONGA'), true);
    assert.strictEqual(val.status, 'needs_improvement');
  });

  await runTest('7. Detecção de Pergunta Ambigua Sem Artigo Definido', () => {
    const vagueCard = {
      question: 'O que diz o artigo?',
      answer: 'Diz que todos são iguais perante a lei.'
    };
    const val = qualityValidator.validateCard(vagueCard);
    assert.strictEqual(val.issues.includes('PERGUNTA_AMBIGUA_SEM_ARTIGO_DEFINIDO'), true);
  });

  await runTest('8. Detecção de Cartões Duplicados por Similaridade Semântica', () => {
    const existing = [
      { id: 'fc_exist_1', question: 'Quais são os requisitos da tutela de urgência no artigo 300 do CPC?' }
    ];
    const dupVal = new FlashcardQualityValidator(existing);
    const newCard = {
      id: 'fc_new_dup',
      question: 'Quais são os requisitos da tutela de urgência no artigo 300 do CPC brasileiro?',
      answer: 'Fumus boni iuris e periculum in mora.'
    };
    const val = dupVal.validateCard(newCard);
    assert.strictEqual(val.issues.includes('DUPLICATA_DETECTADA'), true);
  });

  await runTest('9. Card Splitter Divide Cartão Complexo em Cartões Atômicos Focados', () => {
    const complexCard = {
      id: 'fc_complex',
      question: 'Quais são todos os requisitos cumulativos da tutela de urgência no CPC?',
      answer: 'Probabilidade do direito e perigo na demora.'
    };
    const splitCards = FlashcardImprovementService.splitComplexCard(complexCard);
    assert.strictEqual(splitCards.length, 2, 'Deve dividir em 2 cartões atômicos');
    assert.ok(splitCards[0].question.includes('verossimilhança') || splitCards[0].question.includes('urgência'));
  });

  await runTest('10. Suporte a Cloze Deletion com Formato {{termo}}', () => {
    const rawText = 'A legítima defesa exige o uso moderado dos meios necessários contra agressão injusta.';
    const clozeQuestion = FlashcardImprovementService.createCloze(rawText, 'injusta');
    assert.ok(clozeQuestion.includes('{{injusta}}'), 'Deve envolver a palavra com chaves duplas');

    const card = { question: clozeQuestion, answer: 'injusta', type: 'cloze' };
    const val = qualityValidator.validateCard(card);
    assert.strictEqual(val.isValid, true, 'Cartão cloze bem estruturado deve ser válido');
  });

  await runTest('11. Geração de Flashcard a Partir de Erro em Simulado', async () => {
    const mockStorage = {
      saveSmartFlashcard(item) { return item; }
    };
    const genService = new FlashcardGenerationService({ storage: mockStorage, validator: qualityValidator });
    const questionMissed = {
      id: 'q_err_99',
      topic: 'Preclusão Consumativa',
      explanation: 'Gabarito: A preclusão consumativa impede novo ato após a prática anterior.',
      subject: 'Processo Civil'
    };

    const card = await genService.generateFromQuestionError(questionMissed);
    assert.strictEqual(card.isFromError, true);
    assert.ok(card.question.includes('Preclusão Consumativa'));
    assert.ok(card.stability <= 1.0, 'Cartão de erro deve iniciar com estabilidade prioritária');
  });

  await runTest('12. Reconstituição de Estado a partir de Event Sourcing Idempotente', () => {
    const initialCard = { id: 'fc_replay', stability: 1.0, difficulty: 5.0 };
    const events = [
      { eventId: 'ev_1', rating: 3, reviewedAt: 1000 },
      { eventId: 'ev_2', rating: 4, reviewedAt: 2000 },
      { eventId: 'ev_3', rating: 4, reviewedAt: 3000 }
    ];

    const recomputed = scheduler.recomputeCardState(initialCard, events);
    assert.strictEqual(recomputed.reps, 3);
    assert.ok(recomputed.stability > 1.0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 35: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 35 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
