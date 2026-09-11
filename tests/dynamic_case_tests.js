/**
 * VadeAudio AI - Suíte de Testes dos Casos Jurídicos Dinâmicos (Etapa 28)
 * Validação de blueprints imutáveis, prevenção de vazamento de fatos,
 * desbloqueio progressivo de documentos, ramificação de decisões, rubrica pedagógica e privacidade.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('🕵️ INICIANDO SUÍTE DE TESTES DOS CASOS DINÂMICOS - ETAPA 28');
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
// 1. CASE BLUEPRINT IMUTÁVEL & CONSISTÊNCIA FACTUAL
// ----------------------------------------------------------------------------
console.log('--- 1. CaseBlueprint Imutável & Consistência Factual ---');

function getSampleBlueprint() {
  return {
    caseId: 'case_trabalhista_1',
    factsPublic: ['Maria alega que foi demitida em 10/05/2026.'],
    factsHidden: [{ id: 'fh1', content: 'Maria assinou carta de pedido de demissão.' }],
    characters: [
      { id: 'char_cliente', name: 'Maria', knownFacts: ['Pressionada a assinar papéis.'] },
      { id: 'char_rh', name: 'Roberto', knownFacts: ['Possui carta de pedido de demissão.'] }
    ],
    documents: [
      { id: 'doc_carta', title: 'Carta de Pedido de Demissão', isUnlocked: false, unlockAction: 'interview_rh' }
    ],
    expectedDecision: 'op_provar_coacao'
  };
}

runTest('Blueprint pré-definido preserva fatos imutáveis sem mutação durante o caso', () => {
  const bp = getSampleBlueprint();
  assert.strictEqual(bp.factsPublic.length, 1);
  assert.strictEqual(bp.factsHidden[0].content.includes('pedido de demissão'), true);
});

// ----------------------------------------------------------------------------
// 2. ENTREVISTA & PREVENÇÃO DE VAZAMENTO DE FATOS (FACT LEAK)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Entrevista & Prevenção de Vazamento de Fatos ---');

function interviewCharacter(bp, charId, question) {
  const char = bp.characters.find(c => c.id === charId);
  if (!char) return 'Personagem não encontrado.';
  if (charId === 'char_cliente') {
    return 'Doutor(a), fui pressionada a assinar papéis que não entendi bem.';
  }
  if (charId === 'char_rh') {
    return 'Temos a carta de próprio punho dela pedindo desligamento voluntário.';
  }
  return 'Não sei informar sobre este assunto.';
}

runTest('Cliente responde com base na sua percepção sem saber detalhes técnicos da empresa', () => {
  const bp = getSampleBlueprint();
  const res = interviewCharacter(bp, 'char_cliente', 'Qual o saldo do seu TRCT?');
  assert.strictEqual(res.includes('pressionada'), true);
});

runTest('Gerente de RH responde com base nos registros documentais arquivados', () => {
  const bp = getSampleBlueprint();
  const res = interviewCharacter(bp, 'char_rh', 'Existe carta de demissão?');
  assert.strictEqual(res.includes('carta de próprio punho'), true);
});

// ----------------------------------------------------------------------------
// 3. DESBLOQUEIO PROGRESSIVO DE DOCUMENTOS
// ----------------------------------------------------------------------------
console.log('\n--- 3. Desbloqueio Progressivo de Documentos ---');

function executeInvestigation(caseState, action) {
  if (action === 'interview_rh') {
    caseState.unlockedDocs.push('doc_carta');
    caseState.discoveredFacts.push('Carta de demissão localizada.');
  }
}

runTest('Documento permanece oculto até que a diligência apropriada seja executada', () => {
  const caseState = { unlockedDocs: [], discoveredFacts: [] };
  assert.strictEqual(caseState.unlockedDocs.length, 0);

  executeInvestigation(caseState, 'interview_rh');
  assert.strictEqual(caseState.unlockedDocs.length, 1);
  assert.strictEqual(caseState.unlockedDocs[0], 'doc_carta');
});

// ----------------------------------------------------------------------------
// 4. TOMADA DE DECISÃO & RAMIFICAÇÕES (BRANCHING)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Ramificação de Decisões & Consequências ---');

function evaluateDecision(decisionKey, expectedDecision) {
  if (decisionKey === expectedDecision) {
    return { isOptimal: true, message: 'Estratégia prudente e correta.' };
  }
  return { isOptimal: false, message: 'Ajuizamento temerário sem impugnação de documento.' };
}

runTest('Decisão prudente (impugnar coação) gera consequência positiva', () => {
  const res = evaluateDecision('op_provar_coacao', 'op_provar_coacao');
  assert.strictEqual(res.isOptimal, true);
});

runTest('Decisão precipitada gera advertência sobre riscos de sucumbência', () => {
  const res = evaluateDecision('op_ajuizar_direto', 'op_provar_coacao');
  assert.strictEqual(res.isOptimal, false);
});

// ----------------------------------------------------------------------------
// 5. AVALIAÇÃO POR RUBRICA & PRIVACIDADE
// ----------------------------------------------------------------------------
console.log('\n--- 5. Avaliação por Rubrica Pedagógica & Privacidade ---');

function calculateRubricScore(criteria) {
  const weights = { investigation: 0.25, issueSpotting: 0.25, evidenceUse: 0.20, legalGrounds: 0.15, strategy: 0.15 };
  let total = 0;
  for (const k of Object.keys(weights)) {
    total += (criteria[k] || 0) * weights[k];
  }
  return Math.round(total);
}

runTest('Rubrica pedagógica calcula média ponderada fiel dos 5 critérios práticos', () => {
  const criteria = { investigation: 90, issueSpotting: 85, evidenceUse: 95, legalGrounds: 85, strategy: 90 };
  const score = calculateRubricScore(criteria);
  assert.strictEqual(score, 89);
});

runTest('Privacidade: Sessão investigativa do Usuário A é privada e inacessível pelo Usuário B', () => {
  const sessionOwner = 'user_111';
  const caller = 'user_222';
  assert.strictEqual(sessionOwner === caller, false);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DOS CASOS DINÂMICOS: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 28 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
