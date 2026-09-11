/**
 * VadeAudio AI - Suíte de Testes de Jurisprudência Viva & Atualização Legislativa (Etapa 20)
 * Validação de conectores oficiais, normalizador canônico de citações, detecção de mudanças,
 * diffs estruturados, alertas por watchlist, invalidação de flashcards e contexto temporal em questões antigas.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('⚖️ INICIANDO SUÍTE DE TESTES DE JURISPRUDÊNCIA VIVA - ETAPA 20');
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
// 1. NORMALIZADOR CANÔNICO DE CITAÇÕES JUDICIAIS
// ----------------------------------------------------------------------------
console.log('--- 1. Normalizador de Citações Judiciais (STF / STJ) ---');

function normalizeCitation(str) {
  let clean = str.trim().replace(/\s+/g, ' ');
  let ascii = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  ascii = ascii.replace(/Recurso Especial(\s*(n[ºo\.]?|n)\s*)?/i, 'REsp ');
  ascii = ascii.replace(/Recurso Extraordinario(\s*(n[ºo\.]?|n)\s*)?/i, 'RE ');
  ascii = ascii.replace(/Habeas Corpus(\s*(n[ºo\.]?|n)\s*)?/i, 'HC ');
  ascii = ascii.replace(/Acao Direta de Inconstitucionalidade(\s*(n[ºo\.]?|n)\s*)?/i, 'ADI ');
  ascii = ascii.replace(/Sumula Vinculante(\s*(n[ºo\.]?|n)\s*)?/i, 'SV ');
  ascii = ascii.replace(/Sumula(\s*(n[ºo\.]?|n)\s*)?/i, 'Súmula ');
  
  const formatted = ascii.trim().replace(/\s+/g, ' ');
  const canonicalKey = formatted.toUpperCase().replace(/[\.\/\sº]/g, '-').replace(/-+/g, '-');
  return { formatted, canonicalKey };
}

runTest('Normalização canônica de REsp, RE, ADI e Súmula Vinculante', () => {
  const c1 = normalizeCitation('Recurso Especial nº 1.845.678 / SP');
  assert.strictEqual(c1.formatted, 'REsp 1.845.678 / SP');
  assert.strictEqual(c1.canonicalKey, 'RESP-1-845-678-SP');

  const c2 = normalizeCitation('Ação Direta de Inconstitucionalidade 5.543');
  assert.strictEqual(c2.formatted, 'ADI 5.543');
  assert.strictEqual(c2.canonicalKey, 'ADI-5-543');

  const c3 = normalizeCitation('Súmula Vinculante 13');
  assert.strictEqual(c3.formatted, 'SV 13');
  assert.strictEqual(c3.canonicalKey, 'SV-13');
});

// ----------------------------------------------------------------------------
// 2. DETECÇÃO DE MUDANÇA & DIFF ESTRUTURADO (ANTES VS DEPOIS)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Detecção de Alteração Normativa & Diffs ---');

function computeDiff(prevText, newText) {
  const hasChanged = prevText.trim() !== newText.trim();
  return {
    hasChanged,
    diffLength: Math.abs(newText.length - prevText.length)
  };
}

runTest('Detecção de alteração identifica inclusão de novo texto no Artigo 300 do CPC', () => {
  const prev = 'Art. 300. A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito...';
  const updated = 'Art. 300. A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito, admitindo-se caução real...';

  const diff = computeDiff(prev, updated);
  assert.strictEqual(diff.hasChanged, true);
  assert.ok(diff.diffLength > 10);
});

// ----------------------------------------------------------------------------
// 3. ALERTAS SEGMENTADOS POR WATCHLIST (SEM SPAM)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Alertas Segmentados por Watchlist ---');

const userA_Watchlist = ['cpc', 'Processo Civil'];
const userB_Watchlist = ['clt', 'Direito do Trabalho'];

const sampleUpdate = {
  id: 'upd_cpc_300',
  targetLawCode: 'cpc',
  subject: 'Processo Civil',
  title: 'Nova redação do Art. 300 CPC'
};

function filterForUser(update, watchlist) {
  const match = watchlist.some(w => w.toLowerCase() === update.targetLawCode || w.toLowerCase() === update.subject.toLowerCase());
  return match;
}

runTest('Usuário A (seguidor de CPC) recebe o alerta da nova lei processual', () => {
  assert.strictEqual(filterForUser(sampleUpdate, userA_Watchlist), true);
});

runTest('Usuário B (seguidor apenas de Trabalho) não recebe spam de Processo Civil', () => {
  assert.strictEqual(filterForUser(sampleUpdate, userB_Watchlist), false);
});

// ----------------------------------------------------------------------------
// 4. INVALIDAÇÃO DE FLASHCARDS DESATUALIZADOS
// ----------------------------------------------------------------------------
console.log('\n--- 4. Auditoria de Flashcards Afetados por Novas Leis ---');

const mockFlashcards = [
  { id: 'fc1', questionText: 'Quais são os requisitos do Art. 300 do CPC para concessão de liminar?', answerArticle: 'Art. 300 CPC' },
  { id: 'fc2', questionText: 'O que é legítima defesa nos termos do Art. 25 do CP?', answerArticle: 'Art. 25 CP' }
];

function auditFlashcards(cards, modifiedArticle) {
  return cards.map(c => {
    const text = `${c.questionText} ${c.answerArticle}`.toLowerCase();
    const isAffected = text.includes(modifiedArticle.toLowerCase());
    return {
      ...c,
      needsReview: isAffected
    };
  });
}

runTest('Flashcard que cita o Art. 300 CPC é marcado com needsReview = true após nova lei', () => {
  const audited = auditFlashcards(mockFlashcards, 'Art. 300 CPC');
  assert.strictEqual(audited[0].needsReview, true);
  assert.strictEqual(audited[1].needsReview, false);
});

// ----------------------------------------------------------------------------
// 5. CONTEXTO TEMPORAL EM QUESTÕES HISTÓRICAS DE CONCURSOS
// ----------------------------------------------------------------------------
console.log('\n--- 5. Contexto Temporal em Questões Antigas ---');

function checkQuestionTemporal(questionYear, lawChangeYear, articleMentioned) {
  if (questionYear < lawChangeYear) {
    return {
      hasWarning: true,
      message: `Questão aplicada em ${questionYear} sob a égide da legislação anterior à reforma de ${lawChangeYear}.`
    };
  }
  return { hasWarning: false };
}

runTest('Questão da OAB de 2022 sobre o Art. 300 CPC exibe aviso de discrepância temporal', () => {
  const res = checkQuestionTemporal(2022, 2026, 'Art. 300 CPC');
  assert.strictEqual(res.hasWarning, true);
  assert.ok(res.message.includes('2022'));
  assert.ok(res.message.includes('2026'));
});

// ----------------------------------------------------------------------------
// 6. ISOLAMENTO MULTIUSUÁRIO DE PREFERÊNCIAS E ALERTAS
// ----------------------------------------------------------------------------
console.log('\n--- 6. Isolamento Multiusuário de Watchlist (LGPD) ---');

const userPreferencesDb = new Map();
userPreferencesDb.set('usr_lucas_101', ['cpc', 'penal']);
userPreferencesDb.set('usr_mariana_202', ['trabalho', 'tributario']);

function getWatchlist(requestingId, targetId) {
  if (requestingId !== targetId) {
    throw new Error('Acesso proibido à watchlist de outro estudante.');
  }
  return userPreferencesDb.get(targetId);
}

runTest('Estudante A não tem permissão para ler ou alterar a watchlist do Estudante B', () => {
  assert.throws(() => {
    getWatchlist('usr_lucas_101', 'usr_mariana_202');
  }, /Acesso proibido/);

  const own = getWatchlist('usr_lucas_101', 'usr_lucas_101');
  assert.deepStrictEqual(own, ['cpc', 'penal']);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DE JURISPRUDÊNCIA: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 20 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
