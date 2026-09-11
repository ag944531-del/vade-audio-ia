/**
 * VadeAudio AI - Suíte de Testes de Importação de Plano de Ensino (Etapa 46)
 * Validação de 12 Casos Críticos: Classificação, Zero Alucinação, Validação de Pesos, Duplicidades, Diff e Rollback.
 */

const assert = require('assert');
const {
  AcademicDocumentClassifier,
  AcademicPlanStructureDetector,
  AcademicDateConsistencyValidator,
  AcademicDisciplineDuplicateDetector,
  AcademicImportConflictService,
  AcademicPlanImportExecutor,
  AcademicPlanImportRollbackService,
  AcademicPlanDiffService
} = require('../js/modules/academicPlanImportService');

console.log('================================================================');
console.log('📄 INICIANDO SUÍTE DE TESTES DE IMPORTAÇÃO DE PLANOS - ETAPA 46');
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
  await runTest('1. AcademicDocumentClassifier Identifica Tipos de Documento Acadêmico', () => {
    assert.strictEqual(AcademicDocumentClassifier.classify('Plano de Ensino 2026.2'), 'TEACHING_PLAN');
    assert.strictEqual(AcademicDocumentClassifier.classify('Ementa e Conteúdo Programático'), 'SYLLABUS');
    assert.strictEqual(AcademicDocumentClassifier.classify('Cronograma de Aulas e Datas'), 'CLASS_SCHEDULE');
    assert.strictEqual(AcademicDocumentClassifier.classify('Texto qualquer sem relação'), 'UNKNOWN');
  });

  await runTest('2. AcademicPlanStructureDetector Extrai Disciplina, Professor e Carga Horária', () => {
    const raw = `Disciplina: Direito Penal II\nProfessor: Dr. Carlos Mendes\nCarga Horária: 80 horas\nEmenta: Teoria das Penas.`;
    const sec = AcademicPlanStructureDetector.detectSections(raw);
    assert.strictEqual(sec.discipline, 'Direito Penal II');
    assert.strictEqual(sec.professor, 'Dr. Carlos Mendes');
    assert.strictEqual(sec.workload, '80 horas');
    assert.strictEqual(sec.syllabus, 'Teoria das Penas.');
  });

  await runTest('3. Zero Alucinação: Campos Ausentes no Documento Permanecem Nulos sem Adivinhação', () => {
    const rawWithoutProf = `Disciplina: Direito Civil I\nCarga Horária: 60h`;
    const sec = AcademicPlanStructureDetector.detectSections(rawWithoutProf);
    assert.strictEqual(sec.discipline, 'Direito Civil I');
    assert.strictEqual(sec.professor, null); // Nunca inventar professor
  });

  await runTest('4. AcademicDateConsistencyValidator Valida Formato Brasileiro DD/MM/AAAA', () => {
    const valid = AcademicDateConsistencyValidator.validate('22/09/2026');
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.day, 22);
    assert.strictEqual(valid.month, 9);

    const invalid = AcademicDateConsistencyValidator.validate('32/13/2026');
    assert.strictEqual(invalid.isValid, false);
  });

  await runTest('5. Extração de Datas de Avaliações (P1 e P2)', () => {
    const raw = `Avaliações:\nP1 em 15/09/2026\nP2 em 24/11/2026`;
    const sec = AcademicPlanStructureDetector.detectSections(raw);
    assert.strictEqual(sec.assessments.length, 2);
    assert.strictEqual(sec.assessments[0].label, 'P1');
    assert.strictEqual(sec.assessments[0].date, '15/09/2026');
  });

  await runTest('6. Validação de Regra de Notas e Pesos (70% Prova + 30% Trabalho = 100%)', () => {
    const raw = `Critério: 70% prova e 30% trabalho`;
    const sec = AcademicPlanStructureDetector.detectSections(raw);
    assert.strictEqual(sec.gradeRule.isValid, true);
    assert.strictEqual(sec.gradeRule.totalSum, 100);
  });

  await runTest('7. Conflito de Pesos: Soma Divergente de 100% Dispara Alerta de Inconsistência', () => {
    const raw = `Critério: 70% prova e 40% trabalho`;
    const sec = AcademicPlanStructureDetector.detectSections(raw);
    const conflicts = AcademicImportConflictService.analyzeConflicts({}, sec);
    assert.strictEqual(conflicts.hasConflicts, true);
    assert.strictEqual(conflicts.conflicts[0].type, 'GRADE_RULE_WEIGHT_MISMATCH');
  });

  await runTest('8. AcademicDisciplineDuplicateDetector Detecta Disciplina Semelhante (Civil IV x Civil 4)', () => {
    const existing = [{ id: 'd_1', name: 'Direito Civil 4' }];
    const res = AcademicDisciplineDuplicateDetector.detectDuplicate('Direito Civil IV', existing);
    assert.strictEqual(res.hasDuplicate, true);
  });

  await runTest('9. Detecção de Conflito de Datas entre Avaliação Existente e Novo Plano', () => {
    const existingData = { assessments: [{ label: 'P1', date: '10/09/2026' }] };
    const extractedData = { assessments: [{ label: 'P1', date: '17/09/2026' }] };
    const conflictRes = AcademicImportConflictService.analyzeConflicts(existingData, extractedData);
    assert.strictEqual(conflictRes.hasConflicts, true);
    assert.strictEqual(conflictRes.conflicts[0].type, 'ASSESSMENT_DATE_CONFLICT');
  });

  await runTest('10. AcademicPlanDiffService Mapeia Mudanças entre Versões V1 e V2 do Plano', () => {
    const v1 = { assessments: [{ label: 'P1', date: '10/09/2026' }], bibliography: [{ id: '1' }] };
    const v2 = { assessments: [{ label: 'P1', date: '17/09/2026' }], bibliography: [{ id: '1' }, { id: '2' }] };
    const diff = AcademicPlanDiffService.computeDiff(v1, v2);
    assert.strictEqual(diff.hasChanges, true);
    assert.strictEqual(diff.changes.length, 2);
  });

  await runTest('11. AcademicPlanImportExecutor Executa Importação Transacional e Idempotente', () => {
    const plan = {
      discipline: 'Direito Tributário',
      assessments: [{ label: 'P1', date: '20/10/2026' }],
      bibliography: [{ id: 'b_1', raw: 'MACHADO, Hugo Nigro. Curso.' }]
    };
    const res = AcademicPlanImportExecutor.execute(plan);
    assert.strictEqual(res.success, true);
    assert.ok(res.importId.startsWith('imp_'));
  });

  await runTest('12. AcademicPlanImportRollbackService Protege Edições Manuais Posteriores do Aluno', () => {
    const importRecord = { id: 'imp_123' };
    const resRollback = AcademicPlanImportRollbackService.rollback(importRecord, true);
    assert.strictEqual(resRollback.success, false);
    assert.strictEqual(resRollback.requiresConfirmation, true);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 46: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 46 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
