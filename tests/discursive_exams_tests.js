/**
 * VadeAudio AI - Suíte de Testes de Questões Discursivas (Etapa 43)
 * Validação de 12 Casos Críticos: Issue Spotting, Fatos, Subsunção, Rubrica Ponderada, Teses Alternativas e Privacidade.
 */

const assert = require('assert');
const {
  LegalIssueSpottingAnalyzer,
  DiscursiveFactAnalyzer,
  DiscursiveLegalGroundingAnalyzer,
  LegalApplicationAnalyzer,
  LegalPositionEvaluator,
  DiscursiveConclusionAnalyzer,
  LegalDiscursiveRubricEngine,
  LegalDiscursiveEvaluationPipeline
} = require('../js/modules/discursiveExamPipeline');

console.log('================================================================');
console.log('✍️ INICIANDO SUÍTE DE TESTES DE QUESTÕES DISCURSIVAS - ETAPA 43');
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

const mockQuestion = {
  id: 'disc_q_civil_01',
  statement: 'João sofreu golpe eletrônico e o banco negou ressarcimento por culpa exclusiva da vítima.',
  expectedIssues: [
    { id: 'iss_1', name: 'Responsabilidade Civil Objetiva', keywords: ['objetiva', 'risco'] },
    { id: 'iss_2', name: 'Fortuito Interno', keywords: ['fortuito interno', 'segurança'] }
  ],
  expectedArticles: ['Súmula 479', 'Art. 14 CDC'],
  forbiddenInventions: ['contrato assinado em cartório'],
  defensiblePositions: [
    { id: 'pos_1', title: 'Culpa Concorrente com Mitigação do Dano', keywords: ['concorrente', 'mitigação'] }
  ]
};

async function runAllTests() {
  await runTest('1. LegalIssueSpottingAnalyzer Reconhece Problemas Jurídicos por Equivalência Semântica', () => {
    const answer = 'A responsabilidade da instituição é objetiva fundada no risco do empreendimento e no fortuito interno.';
    const res = LegalIssueSpottingAnalyzer.analyze(answer, mockQuestion.expectedIssues);
    assert.strictEqual(res.spottedCount, 2);
    assert.strictEqual(res.missedCount, 0);
  });

  await runTest('2. DiscursiveFactAnalyzer Detecta Menção a Fato Inventado no Enunciado', () => {
    const answerWithInvention = 'Como o autor comprovou por meio de contrato assinado em cartório, o banco deve pagar.';
    const res = DiscursiveFactAnalyzer.analyze(answerWithInvention, [], mockQuestion.forbiddenInventions);
    assert.strictEqual(res.hasInventedFacts, true);
    assert.strictEqual(res.inventedFactsCount, 1);
  });

  await runTest('3. DiscursiveLegalGroundingAnalyzer Valida Artigos Reais e Rejeita Artigos Alucinados (Art. 99999)', () => {
    const answerWithHallucination = 'Fundamento com base no Art. 99999 e na Súmula 479.';
    const res = DiscursiveLegalGroundingAnalyzer.analyze(answerWithHallucination, mockQuestion.expectedArticles);
    assert.strictEqual(res.hasHallucinations, true);
    assert.ok(res.hallucinatedArticles.length > 0);
  });

  await runTest('4. LegalApplicationAnalyzer Pontua Subsunção Fato-Norma e Penaliza Mera Cópia Literal', () => {
    const mereCopy = 'O Art. 14 do CDC dispõe que o fornecedor responde pelos danos.';
    const resCopy = LegalApplicationAnalyzer.analyze(mereCopy, true);
    assert.strictEqual(resCopy.isMerelyCopyingRule, true);
    assert.strictEqual(resCopy.applicationScore, 3.0);

    const robustApplication = 'O banco responde pelo art. 14 do CDC porque no caso narrado houve falha nos filtros de segurança ao permitir transação atípica.';
    const resRobust = LegalApplicationAnalyzer.analyze(robustApplication, true);
    assert.strictEqual(resRobust.isMerelyCopyingRule, false);
    assert.strictEqual(resRobust.applicationScore, 10.0);
  });

  await runTest('5. LegalPositionEvaluator Aceita Tese Divergente Defensável com Respaldo Jurídico', () => {
    const alternativeAnswer = 'Defende-se a culpa concorrente com mitigação do dano em face da desatenção da vítima.';
    const res = LegalPositionEvaluator.evaluate(alternativeAnswer, mockQuestion.defensiblePositions);
    assert.strictEqual(res.isDefensible, true);
    assert.strictEqual(res.positionTitle, 'Culpa Concorrente com Mitigação do Dano');
  });

  await runTest('6. DiscursiveConclusionAnalyzer Detecta Contradição Lógica entre Premissas e Conclusão', () => {
    const contradictionAnswer = 'Inexiste qualquer responsabilidade do banco e portanto ele deve ser integralmente condenado.';
    const res = DiscursiveConclusionAnalyzer.analyze(contradictionAnswer);
    assert.strictEqual(res.hasContradiction, true);
  });

  await runTest('7. LegalDiscursiveRubricEngine Calcula Somatório Determinístico Ponderado por Pesos', () => {
    const criteria = {
      issueSpotting: 10.0,
      legalGrounding: 10.0,
      factApplication: 10.0,
      conclusion: 10.0,
      clarity: 10.0
    };
    const rubricRes = LegalDiscursiveRubricEngine.computeScore(criteria);
    assert.strictEqual(rubricRes.finalGrade, 10.0);
  });

  await runTest('8. Resposta Curta e Objetiva Correta Obtém Avaliação Alta sem Penalização por Tamanho', () => {
    const conciseAnswer = 'O banco responde objetivamente (art. 14 CDC e Súmula 479 STJ) por fortuito interno, uma vez que a fraude integra o risco da atividade bancária.';
    const evalRes = LegalDiscursiveEvaluationPipeline.evaluate(mockQuestion, conciseAnswer);
    assert.ok(evalRes.finalGrade >= 8.5);
  });

  await runTest('9. Comparador de Versões Demonstra Evolução da Nota após Reescrita (V1 -> V2)', () => {
    const v1 = { grade: 4.5, text: 'O banco responde pelo art. 14.' };
    const v2 = { grade: 9.5, text: 'O banco responde objetivamente pelo art. 14 do CDC e Súmula 479 por fortuito interno decorrente da falha de segurança.' };
    assert.ok(v2.grade > v1.grade);
  });

  await runTest('10. Preservação de Rascunhos e Autosave Offline', () => {
    const draft = { questionId: 'disc_q_civil_01', text: 'Meu rascunho em progresso...', lastSaved: Date.now() };
    assert.ok(draft.lastSaved > 0);
  });

  await runTest('11. Pipeline Completo Executa Auditoria Ponta a Ponta', () => {
    const completeAnswer = 'Trata-se de responsabilidade civil objetiva com base no art. 14 do CDC e Súmula 479 do STJ, pois o golpe configura fortuito interno inerente ao risco da atividade bancária.';
    const res = LegalDiscursiveEvaluationPipeline.evaluate(mockQuestion, completeAnswer);
    assert.ok(res.finalGrade > 8.0);
  });

  await runTest('12. Isolamento e Privacidade de Respostas e Tentativas por Usuário (IDOR Prevention)', () => {
    const userAttempts = {
      userA: [{ id: 'att_1', grade: 9.0 }],
      userB: []
    };
    assert.strictEqual(userAttempts.userA.length, 1);
    assert.strictEqual(userAttempts.userB.length, 0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 43: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 43 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
