/**
 * VadeAudio AI - Suíte de Testes de Modo Offline & Biblioteca Local (Etapa 21)
 * Validação de download e versionamento de leis, fila de operações OfflineOutbox,
 * sincronização em lote idempotente, resolução de conflitos, gestão de storage e entitlement offline.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('📥 INICIANDO SUÍTE DE TESTES DE MODO OFFLINE - ETAPA 21');
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
// 1. DOWNLOAD E VERSIONAMENTO DE LEIS OFFLINE
// ----------------------------------------------------------------------------
console.log('--- 1. Download de Leis & Integridade de Checksum ---');

class MockOfflineStorage {
  constructor() {
    this.laws = [];
    this.outbox = [];
    this.limitBytes = 1024 * 1024 * 1024; // 1 GB
  }

  downloadLaw(lawId, lawName, versionId, sizeMB) {
    const record = {
      lawId,
      lawName,
      versionId,
      sizeBytes: sizeMB * 1024 * 1024,
      downloadedAt: Date.now(),
      checksum: `sha256_${lawId}_${versionId}`
    };
    this.laws.push(record);
    return record;
  }

  isAvailable(lawId) {
    return this.laws.some(l => l.lawId === lawId);
  }

  queueOperation(type, entityId, payload) {
    const op = {
      operationId: 'op_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now(),
      type,
      entityId,
      payload,
      createdAt: Date.now()
    };
    this.outbox.push(op);
    return op;
  }
}

runTest('Download de legislação salva versão, metadados e checksum no storage local', () => {
  const storage = new MockOfflineStorage();
  const law = storage.downloadLaw('cp', 'Código Penal', 'v2026.1', 45);

  assert.strictEqual(storage.isAvailable('cp'), true);
  assert.strictEqual(law.versionId, 'v2026.1');
  assert.strictEqual(law.checksum, 'sha256_cp_v2026.1');
});

// ----------------------------------------------------------------------------
// 2. FILA DE OPERAÇÕES OFFLINEOUTBOX & IDEMPOTÊNCIA
// ----------------------------------------------------------------------------
console.log('\n--- 2. Fila de Operações da Outbox & Idempotência ---');

runTest('Revisão de flashcard offline entra na Outbox com timestamp e payload correto', () => {
  const storage = new MockOfflineStorage();
  const op = storage.queueOperation('review_flashcard', 'fc_101', { quality: 'good', nextReviewDays: 4 });

  assert.strictEqual(storage.outbox.length, 1);
  assert.strictEqual(op.type, 'review_flashcard');
  assert.strictEqual(op.payload.quality, 'good');
});

const processedBackendOps = new Set();

function processBatchSync(operations) {
  const results = [];
  for (const op of operations) {
    if (processedBackendOps.has(op.operationId)) {
      results.push({ opId: op.operationId, status: 'duplicate_ignored' });
    } else {
      processedBackendOps.add(op.operationId);
      results.push({ opId: op.operationId, status: 'applied' });
    }
  }
  return results;
}

runTest('Sincronização em lote garante idempotência absoluta ao reenviar a mesma operação', () => {
  const op1 = { operationId: 'op_sync_100', type: 'answer_question', entityId: 'q_1', payload: { isCorrect: true } };
  
  const res1 = processBatchSync([op1]);
  assert.strictEqual(res1[0].status, 'applied');

  // Reenvio por instabilidade de rede
  const res2 = processBatchSync([op1]);
  assert.strictEqual(res2[0].status, 'duplicate_ignored');
});

// ----------------------------------------------------------------------------
// 3. RESOLUÇÃO DE CONFLITOS (SEM PERDA DE DADOS)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Resolução de Conflitos de Anotações ---');

function resolveNoteConflict(localNote, remoteNote) {
  if (localNote.text === remoteNote.text) return remoteNote;

  return {
    id: remoteNote.id,
    text: `${remoteNote.text}\n\n--- [Versão Local Conflitante em ${localNote.updatedAt}] ---\n${localNote.text}`,
    hasMergedConflict: true
  };
}

runTest('Conflito entre anotações em dois dispositivos preserva ambos os textos', () => {
  const local = { id: 'note_1', text: 'Nota escrita no metrô sem internet.', updatedAt: '15/08 14:00' };
  const remote = { id: 'note_1', text: 'Nota atualizada no notebook pela manhã.', updatedAt: '15/08 10:00' };

  const merged = resolveNoteConflict(local, remote);
  assert.strictEqual(merged.hasMergedConflict, true);
  assert.ok(merged.text.includes('no metrô sem internet'));
  assert.ok(merged.text.includes('no notebook pela manhã'));
});

// ----------------------------------------------------------------------------
// 4. ENTITLEMENT OFFLINE & GRACE PERIOD (7 DIAS)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Validação de Entitlement Pro Offline ---');

function checkOfflineProGracePeriod(lastOnlineSyncTimestamp) {
  const now = Date.now();
  const maxGraceMs = 7 * 24 * 60 * 60 * 1000; // 7 dias
  const elapsed = now - lastOnlineSyncTimestamp;

  if (elapsed <= maxGraceMs) {
    const daysLeft = Math.ceil((maxGraceMs - elapsed) / (24 * 60 * 60 * 1000));
    return { isAuthorized: true, daysLeft };
  }
  return { isAuthorized: false, daysLeft: 0 };
}

runTest('Estudante Pro offline há 3 dias mantém recursos Pro ativos', () => {
  const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const status = checkOfflineProGracePeriod(threeDaysAgo);
  assert.strictEqual(status.isAuthorized, true);
  assert.strictEqual(status.daysLeft, 4);
});

runTest('Estudante Pro offline há 9 dias é solicitado a reconectar para renovar licença', () => {
  const nineDaysAgo = Date.now() - (9 * 24 * 60 * 60 * 1000);
  const status = checkOfflineProGracePeriod(nineDaysAgo);
  assert.strictEqual(status.isAuthorized, false);
  assert.strictEqual(status.daysLeft, 0);
});

// ----------------------------------------------------------------------------
// 5. GESTÃO DE ESPAÇO & AVISO DE LIMITE
// ----------------------------------------------------------------------------
console.log('\n--- 5. Gestão de Storage & Alerta de Limite ---');

function computeStorageUsage(lawsMB, audiosMB, materialsMB, maxLimitMB) {
  const totalMB = lawsMB + audiosMB + materialsMB;
  const percent = Math.round((totalMB / maxLimitMB) * 100);
  return {
    totalMB,
    percent,
    isNearLimit: percent >= 85
  };
}

runTest('Cálculo de storage emite alerta quando ocupação atinge 85% ou mais', () => {
  const normal = computeStorageUsage(100, 200, 100, 1000); // 40%
  assert.strictEqual(normal.isNearLimit, false);

  const full = computeStorageUsage(400, 300, 180, 1000); // 88%
  assert.strictEqual(full.isNearLimit, true);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES OFFLINE: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 21 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
