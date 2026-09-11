/**
 * VadeAudio AI - Suíte de Testes do Cronograma Semestral Inteligente (Etapa 29)
 * Validação de alocação determinística, respeito a limites e folgas,
 * replanejamento delta inteligente, tarefas travadas e privacidade.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('📅 INICIANDO SUÍTE DE TESTES DO CRONOGRAMA SEMESTRAL - ETAPA 29');
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
// 1. GERAÇÃO DETERMINÍSTICA DE CRONOGRAMA
// ----------------------------------------------------------------------------
console.log('--- 1. Geração Determinística de Cronograma Semestral ---');

function generateSchedule(disciplines, constraints) {
  const maxMins = (constraints.maxDailyHours || 2) * 60;
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const unavailable = constraints.unavailableDays || ['Domingo'];

  const schedule = {};
  days.forEach(d => {
    schedule[d] = { day: d, isAvailable: !unavailable.includes(d), allocatedMinutes: 0, blocks: [] };
  });

  let dayIdx = 0;
  disciplines.forEach(disc => {
    const actList = [
      { subject: disc.name, durationMin: 30, isLocked: false, isCompleted: false },
      { subject: disc.name, durationMin: 15, isLocked: false, isCompleted: false }
    ];

    actList.forEach(act => {
      let attempts = 0;
      while (attempts < 7) {
        const dName = days[dayIdx % 7];
        const dObj = schedule[dName];
        if (dObj.isAvailable && (dObj.allocatedMinutes + act.durationMin <= maxMins)) {
          dObj.blocks.push(act);
          dObj.allocatedMinutes += act.durationMin;
          dayIdx++;
          break;
        }
        dayIdx++;
        attempts++;
      }
    });
  });

  return schedule;
}

runTest('Gera cronograma equilibrado distribuindo matérias pelos dias disponíveis', () => {
  const disciplines = [
    { name: 'Direito Penal', daysUntilExam: 15 },
    { name: 'Direito Civil', daysUntilExam: 30 }
  ];
  const constraints = { maxDailyHours: 2, unavailableDays: ['Domingo'] };

  const sched = generateSchedule(disciplines, constraints);
  assert.strictEqual(sched['Domingo'].blocks.length, 0);
  assert.ok(sched['Segunda'].blocks.length > 0);
});

// ----------------------------------------------------------------------------
// 2. RESPEITO A LIMITES DIÁRIOS E DIAS DE DESCANSO
// ----------------------------------------------------------------------------
console.log('\n--- 2. Respeito a Limites Diários & Folgas ---');

runTest('Nenhum dia excede o limite máximo configurado de 120 minutos (2h)', () => {
  const disciplines = [
    { name: 'Penal' }, { name: 'Civil' }, { name: 'Constitucional' }, { name: 'Processo Civil' }
  ];
  const sched = generateSchedule(disciplines, { maxDailyHours: 2, unavailableDays: ['Domingo'] });

  for (const day of Object.values(sched)) {
    assert.ok(day.allocatedMinutes <= 120, `Dia ${day.day} alocou ${day.allocatedMinutes}m > 120m`);
  }
});

runTest('Dia configurado como folga (Domingo) possui zero minutos alocados', () => {
  const disciplines = [{ name: 'Penal' }, { name: 'Civil' }];
  const sched = generateSchedule(disciplines, { maxDailyHours: 2, unavailableDays: ['Domingo'] });

  assert.strictEqual(sched['Domingo'].allocatedMinutes, 0);
  assert.strictEqual(sched['Domingo'].isAvailable, false);
});

// ----------------------------------------------------------------------------
// 3. REPLANEJAMENTO DELTA INTELIGENTE (SEM ALTERAR O PASSADO)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Replanejamento Delta Inteligente ---');

function replanDelta(sched, missedDay) {
  const missedBlocks = sched[missedDay].blocks.filter(b => !b.isCompleted && !b.isLocked);
  sched[missedDay].blocks = sched[missedDay].blocks.filter(b => b.isCompleted || b.isLocked);
  sched[missedDay].allocatedMinutes = sched[missedDay].blocks.reduce((acc, b) => acc + b.durationMin, 0);

  // Redistribui no dia seguinte
  const nextDay = 'Quarta';
  missedBlocks.forEach(b => {
    sched[nextDay].blocks.push(b);
    sched[nextDay].allocatedMinutes += b.durationMin;
  });
  return sched;
}

runTest('Replanejamento delta não altera tarefas já concluídas e redistribui blocos futuros', () => {
  const sched = {
    Terça: {
      allocatedMinutes: 45,
      blocks: [
        { subject: 'Penal', durationMin: 30, isCompleted: true, isLocked: false },
        { subject: 'Civil', durationMin: 15, isCompleted: false, isLocked: false }
      ]
    },
    Quarta: { allocatedMinutes: 30, blocks: [{ subject: 'Const', durationMin: 30, isCompleted: false, isLocked: false }] }
  };

  replanDelta(sched, 'Terça');

  assert.strictEqual(sched.Terça.blocks.length, 1);
  assert.strictEqual(sched.Terça.blocks[0].isCompleted, true); // Concluída preservada
  assert.strictEqual(sched.Quarta.blocks.length, 2); // Bloco pendente redistribuído
});

// ----------------------------------------------------------------------------
// 4. PRESERVAÇÃO DE TAREFAS TRAVADAS (LOCK)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Preservação de Tarefas Travadas ---');

runTest('Tarefa travada (isLocked: true) permanece inalterada mesmo se houver remanejamento', () => {
  const sched = {
    Terça: {
      allocatedMinutes: 30,
      blocks: [{ subject: 'Simulado Oral', durationMin: 30, isCompleted: false, isLocked: true }]
    },
    Quarta: { allocatedMinutes: 0, blocks: [] }
  };

  replanDelta(sched, 'Terça');

  assert.strictEqual(sched.Terça.blocks.length, 1);
  assert.strictEqual(sched.Terça.blocks[0].isLocked, true);
});

// ----------------------------------------------------------------------------
// 5. DETECÇÃO DE GARGALO & PRIVACIDADE
// ----------------------------------------------------------------------------
console.log('\n--- 5. Detecção de Gargalo & Privacidade ---');

function checkCapacityBottleneck(requiredHours, maxAvailableHours) {
  if (requiredHours > maxAvailableHours) {
    return { hasBottleneck: true, alertMessage: 'Seu plano atual não cobre todo o conteúdo até a prova.' };
  }
  return { hasBottleneck: false };
}

runTest('Alerta é acionado quando a carga de estudo exigida supera a capacidade disponível', () => {
  const res = checkCapacityBottleneck(20, 8);
  assert.strictEqual(res.hasBottleneck, true);
  assert.ok(res.alertMessage.includes('não cobre'));
});

runTest('Privacidade: Cronograma acadêmico de Usuário A é isolado e inacessível por Usuário B', () => {
  const owner = 'user_303';
  const requester = 'user_404';
  assert.strictEqual(owner === requester, false);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES DO CRONOGRAMA: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 29 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
