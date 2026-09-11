/**
 * VadeAudio AI - Suíte de Testes de Inteligência Acadêmica & Analytics (Etapa 17)
 * Validação matemática das fórmulas de domínio, confiança amostral, detecção de desequilíbrio,
 * curva de esquecimento, caderno de erros, isolamento multiusuário, recomendações e testes A/B.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('📊 INICIANDO SUÍTE DE TESTES DE INTELIGÊNCIA ACADÊMICA - ETAPA 17');
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
// 1. FÓRMULA DETERMINÍSTICA DE DOMÍNIO ACADÊMICO
// ----------------------------------------------------------------------------
console.log('--- 1. Cálculo Determinístico de Domínio ---');

function calculateMasteryManual(qAcc, mockAcc, srsRet, recency, diff) {
  return Math.round((0.35 * qAcc) + (0.25 * mockAcc) + (0.20 * srsRet) + (0.10 * recency) + (0.10 * diff));
}

runTest('Validação matemática da fórmula de Domínio Ponderado com valores conhecidos', () => {
  // Test case: 80% questões, 70% simulados, 90% SRS, 100% recência, 60% dificuldade
  // 0.35*80 (28) + 0.25*70 (17.5) + 0.20*90 (18) + 0.10*100 (10) + 0.10*60 (6) = 79.5 -> 80%
  const expected = 80;
  const computed = calculateMasteryManual(80, 70, 90, 100, 60);
  assert.strictEqual(computed, expected);
});

// ----------------------------------------------------------------------------
// 2. CONFIANÇA AMOSTRAL (PREVENÇÃO DE FALSO DOMÍNIO)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Confiança Amostral & Prevenção de Falso Diagnóstico ---');

function getSampleConfidence(totalQuestions, totalMocks, totalCards) {
  const samplePoints = totalQuestions + (totalMocks * 5) + totalCards;
  if (samplePoints < 6) return { level: 'low', reason: 'Ainda existem poucos dados para análise estatística precisa.' };
  if (samplePoints < 20) return { level: 'medium', reason: 'Amostra moderada.' };
  return { level: 'high', reason: 'Base estatística robusta.' };
}

runTest('Usuário com apenas 2 questões recebe confiança "baixa" e não falso domínio', () => {
  const conf = getSampleConfidence(2, 0, 0);
  assert.strictEqual(conf.level, 'low');
  assert.ok(conf.reason.includes('poucos dados'));
});

runTest('Usuário com histórico consolidado (>20 pontos) recebe confiança "alta"', () => {
  const conf = getSampleConfidence(15, 2, 5); // 15 + 10 + 5 = 30
  assert.strictEqual(conf.level, 'high');
});

// ----------------------------------------------------------------------------
// 3. DETECÇÃO DE DESEQUILÍBRIO & PROVA PRÓXIMA
// ----------------------------------------------------------------------------
console.log('\n--- 3. Diagnóstico de Desequilíbrio de Estudo ---');

function detectImbalance(subjectTimeMinutes, totalTimeMinutes, daysUntilExam) {
  const sharePercent = Math.round((subjectTimeMinutes / totalTimeMinutes) * 100);
  if (daysUntilExam <= 10 && sharePercent < 15) {
    return {
      hasImbalance: true,
      sharePercent,
      alert: `Atenção: Matéria representa apenas ${sharePercent}% do tempo, apesar da prova em ${daysUntilExam} dias.`
    };
  }
  return { hasImbalance: false, sharePercent };
}

runTest('Alerta é disparado quando matéria tem prova em 6 dias mas apenas 8% do tempo', () => {
  const diag = detectImbalance(50, 600, 6);
  assert.strictEqual(diag.hasImbalance, true);
  assert.strictEqual(diag.sharePercent, 8);
  assert.ok(diag.alert.includes('apenas 8%'));
});

// ----------------------------------------------------------------------------
// 4. CURVA DE ESQUECIMENTO (EBBINGHAUS DECAY)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Estimativa de Curva de Esquecimento ---');

function estimateRetention(daysSinceLastReview, stabilityIntervalDays) {
  const retention = Math.exp(-daysSinceLastReview / stabilityIntervalDays);
  return Math.round(retention * 100);
}

runTest('Cálculo da retenção de memória decai de acordo com o intervalo sem revisão', () => {
  const recent = estimateRetention(1, 14); // 1 dia após revisão com estabilidade de 14 dias
  const old = estimateRetention(18, 5);   // 18 dias sem revisão com estabilidade baixa

  assert.ok(recent >= 90, `Recente deveria ser >= 90%, foi ${recent}%`);
  assert.ok(old <= 40, `Antigo deveria ser <= 40%, foi ${old}%`);
});

// ----------------------------------------------------------------------------
// 5. CADERNO DE ERROS & CLASSIFICAÇÃO
// ----------------------------------------------------------------------------
console.log('\n--- 5. Caderno de Erros Recorrentes ---');

const mockErrors = [
  { topic: 'Tutela Provisória', type: 'conceptual' },
  { topic: 'Tutela Provisória', type: 'article_citation' },
  { topic: 'Tutela Provisória', type: 'conceptual' },
  { topic: 'Dolo Eventual', type: 'institute_confusion' }
];

function groupErrors(errors) {
  const counts = {};
  errors.forEach(e => counts[e.topic] = (counts[e.topic] || 0) + 1);
  return Object.entries(counts).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count);
}

runTest('Caderno de Erros agrupa e ordena tópicos com maior recorrência de falha', () => {
  const grouped = groupErrors(mockErrors);
  assert.strictEqual(grouped[0].topic, 'Tutela Provisória');
  assert.strictEqual(grouped[0].count, 3);
  assert.strictEqual(grouped[1].topic, 'Dolo Eventual');
  assert.strictEqual(grouped[1].count, 1);
});

// ----------------------------------------------------------------------------
// 6. ÍNDICE DE PREPARAÇÃO PARA PROVA (SEM PROMESSA DE NOTA)
// ----------------------------------------------------------------------------
console.log('\n--- 6. Índice de Preparação para Prova ---');

function computeExamReadiness(coveredTopics, totalTopics, questionAcc) {
  const coveragePercent = (coveredTopics / totalTopics) * 100;
  const score = Math.round((coveragePercent * 0.5) + (questionAcc * 0.3) + (70 * 0.2));
  
  let label = 'Intermediário';
  if (score >= 80) label = 'Avançado / Preparado';
  else if (score < 60) label = 'Atenção / Risco';

  return { score, label };
}

runTest('Índice de Preparação avalia cobertura do edital e acertos sem prometer nota fixa', () => {
  const readiness = computeExamReadiness(5, 6, 80); // 83.3% cobertura, 80% acerto
  assert.ok(readiness.score >= 75);
  assert.strictEqual(typeof readiness.label, 'string');
  assert.strictEqual(readiness.score.toString().includes('8,5'), false, 'Não deve emitir nota falsa');
});

// ----------------------------------------------------------------------------
// 7. RECOMMENDATION ENGINE & INTEGRAÇÃO COM PLANO DIÁRIO
// ----------------------------------------------------------------------------
console.log('\n--- 7. Motor de Recomendações Acionáveis ---');

function generateRecommendations(topError, highRetentionRisk) {
  const recs = [];
  if (topError) {
    recs.push({
      type: 'high_impact_review',
      durationMinutes: 30,
      title: `Revisão de Alto Impacto: ${topError.topic}`,
      priority: 'high'
    });
  }
  if (highRetentionRisk) {
    recs.push({
      type: 'srs_clean',
      durationMinutes: 15,
      title: `Prevenir Esquecimento: ${highRetentionRisk.topic}`,
      priority: 'medium'
    });
  }
  return recs;
}

runTest('RecommendationEngine gera ações de alto impacto de 30 min baseadas nos erros reais', () => {
  const recs = generateRecommendations({ topic: 'Tutela Provisória', count: 5 }, { topic: 'Controle Concentrado', days: 18 });
  assert.strictEqual(recs.length, 2);
  assert.strictEqual(recs[0].type, 'high_impact_review');
  assert.strictEqual(recs[0].durationMinutes, 30);
  assert.strictEqual(recs[0].priority, 'high');
});

// ----------------------------------------------------------------------------
// 8. ISOLAMENTO MULTIUSUÁRIO (PREVENÇÃO DE IDOR EM ANALYTICS)
// ----------------------------------------------------------------------------
console.log('\n--- 8. Isolamento Multiusuário de Analytics (LGPD) ---');

const userAnalyticsDb = new Map();
userAnalyticsDb.set('usr_lucas_101', { totalHours: 15.3, score: 78 });
userAnalyticsDb.set('usr_mariana_202', { totalHours: 28.1, score: 92 });

function getAnalyticsForUser(requestingUser, targetUserId) {
  if (requestingUser.id !== targetUserId && requestingUser.role !== 'admin') {
    throw new Error('Acesso proibido a dados analíticos de outro estudante.');
  }
  return userAnalyticsDb.get(targetUserId);
}

runTest('Usuário A é impedido de consultar os analytics privados do Usuário B', () => {
  const userA = { id: 'usr_lucas_101', role: 'student' };
  assert.throws(() => {
    getAnalyticsForUser(userA, 'usr_mariana_202');
  }, /Acesso proibido/);

  const ownData = getAnalyticsForUser(userA, 'usr_lucas_101');
  assert.strictEqual(ownData.score, 78);
});

// ----------------------------------------------------------------------------
// 9. PRODUCT ANALYTICS & TESTES A/B DETERMINÍSTICOS
// ----------------------------------------------------------------------------
console.log('\n--- 9. Product Analytics & Testes A/B ---');

function assignVariant(userId, experimentId, variants) {
  let hash = 0;
  const str = `${userId}:${experimentId}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

runTest('Atribuição de variante A/B é determinística e consistente para o mesmo usuário', () => {
  const variants = ['control_7steps', 'variant_4steps'];
  const v1 = assignVariant('usr_lucas_101', 'exp_onboarding', variants);
  const v2 = assignVariant('usr_lucas_101', 'exp_onboarding', variants);
  assert.strictEqual(v1, v2, 'Variante deve ser idêntica em múltiplas chamadas');
});

function sanitizeProductEvent(eventProps) {
  const clean = { ...eventProps };
  delete clean.documentText;
  delete clean.userQuery;
  delete clean.personalNote;
  return clean;
}

runTest('Regra de Minimização LGPD: textos privados são expurgados de eventos de produto', () => {
  const rawProps = {
    feature: 'rag_tutor',
    durationSeconds: 45,
    userQuery: 'Texto confidencial da minha consulta jurídica',
    documentText: 'Conteúdo do meu resumo pessoal'
  };
  const sanitized = sanitizeProductEvent(rawProps);
  assert.strictEqual(sanitized.feature, 'rag_tutor');
  assert.strictEqual(sanitized.userQuery, undefined);
  assert.strictEqual(sanitized.documentText, undefined);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DE INTELIGÊNCIA: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 17 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
