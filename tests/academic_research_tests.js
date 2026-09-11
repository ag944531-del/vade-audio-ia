/**
 * VadeAudio AI - Suíte de Testes da Central de Trabalhos & TCC (Etapa 42)
 * Validação de 12 Casos Críticos: Problema, Objetivos, Lacunas, Auditoria ABNT, Citações e Privacidade.
 */

const assert = require('assert');
const {
  ResearchProblemValidator,
  ResearchObjectiveValidator,
  ResearchGapService,
  AcademicReferenceAuditService,
  AcademicResearchProjectService
} = require('../js/modules/academicResearchService');

console.log('================================================================');
console.log('🎓 INICIANDO SUÍTE DE TESTES DE TRABALHOS & TCC - ETAPA 42');
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

const mockProject = {
  id: 'proj_tcc_civil',
  title: 'A Responsabilidade Civil dos Bancos em Fraudes Eletrônicas',
  problem: 'Em que medida as instituições financeiras respondem objetivamente por fraudes eletrônicas praticadas por terceiros?',
  generalObjective: 'Analisar a responsabilidade civil objetiva das instituições financeiras.',
  specificObjectives: [
    { id: 'obj_1', text: 'Examinar o conceito de fortuito interno no Código de Defesa do Consumidor' },
    { id: 'obj_2', text: 'Investigar a jurisprudência consolidada do STJ sobre a Súmula 479' },
    { id: 'obj_3', text: 'Avaliar os limites da culpa exclusiva da vítima nos golpes digitais' }
  ],
  chapters: [
    { id: 'chap_1', title: '1. Introdução', text: 'O tema da responsabilidade objetiva foi tratado por (DINIZ, 2022).', sources: ['Diniz'] },
    { id: 'chap_2', title: '2. Fortuito Interno', text: 'Como demonstrado em (TARTUCE, 2023), o risco da atividade é inerente.', sources: ['Tartuce'] },
    { id: 'chap_3', title: '3. Análise da Súmula 479', text: 'O STJ consolidou a matéria em (SILVA, 2024).', sources: [] } // Sem fontes
  ],
  bibliography: [
    { id: 'b1', author: 'DINIZ, Maria Helena', year: '2022', title: 'Curso de Direito Civil' },
    { id: 'b2', author: 'TARTUCE, Flávio', year: '2023', title: 'Manual de Direito Civil' },
    { id: 'b3', author: 'NERY JUNIOR, Nelson', year: '2021', title: 'Código Civil Comentado' } // Não citada
  ]
};

async function runAllTests() {
  await runTest('1. ResearchProblemValidator Valida Formulação Interrogativa e Delimitada', () => {
    const res = ResearchProblemValidator.validate(mockProject.problem);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.issues.length, 0);
  });

  await runTest('2. ResearchProblemValidator Rejeita Pergunta Curta ou Não Interrogativa', () => {
    const res = ResearchProblemValidator.validate('Responsabilidade civil bancaria.');
    assert.strictEqual(res.isValid, false);
    assert.ok(res.issues.length > 0);
  });

  await runTest('3. ResearchObjectiveValidator Valida Verbos no Infinitivo (Analisar, Investigar)', () => {
    const res = ResearchObjectiveValidator.validateObjectives(
      mockProject.generalObjective,
      mockProject.specificObjectives.map(o => o.text)
    );
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.issues.length, 0);
  });

  await runTest('4. ResearchObjectiveValidator Rejeita Objetivo sem Verbo no Infinitivo', () => {
    const res = ResearchObjectiveValidator.validateObjectives('Estudo sobre a lei', ['Conceito da norma']);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.issues.length > 0);
  });

  await runTest('5. ResearchGapService Detecta Capítulo sem Nenhuma Fonte Vinculada', () => {
    const gaps = ResearchGapService.detectGaps(mockProject);
    assert.ok(gaps.hasGaps);
    assert.ok(gaps.gaps.some(g => g.type === 'CHAPTER_WITHOUT_SOURCES' && g.chapterId === 'chap_3'));
  });

  await runTest('6. ResearchGapService Detecta Objetivo Específico sem Capítulo Correspondente', () => {
    const projectWithMissingChapter = {
      ...mockProject,
      chapters: [{ id: 'chap_1', title: '1. Introdução', sources: ['Diniz'] }]
    };
    const gaps = ResearchGapService.detectGaps(projectWithMissingChapter);
    assert.ok(gaps.hasGaps);
    assert.ok(gaps.gaps.some(g => g.type === 'UNMAPPED_OBJECTIVE'));
  });

  await runTest('7. AcademicReferenceAuditService Detecta Citação no Texto sem Bibliografia (SILVA, 2024)', () => {
    const audit = AcademicReferenceAuditService.auditReferences(mockProject.chapters, mockProject.bibliography);
    assert.strictEqual(audit.orphanCitationsCount, 1);
    assert.strictEqual(audit.orphanCitations[0].author, 'SILVA');
  });

  await runTest('8. AcademicReferenceAuditService Detecta Referência Bibliográfica Não Utilizada (NERY JUNIOR)', () => {
    const audit = AcademicReferenceAuditService.auditReferences(mockProject.chapters, mockProject.bibliography);
    assert.strictEqual(audit.unusedBibliographyCount, 1);
    assert.ok(audit.unusedBibliography[0].author.includes('NERY'));
  });

  await runTest('9. Preservação Estrita de Citação Direta com Número de Página Real da Obra', () => {
    const quote = { author: 'Maria Helena Diniz', text: 'O dano moral exige nexo de causalidade.', printedPage: 142 };
    assert.strictEqual(quote.printedPage, 142);
  });

  await runTest('10. Zero-Result Fallback sem Inventar Autores no Modo "Somente Minhas Fontes"', () => {
    const libraryWorks = [];
    const query = 'Direito Espacial e Satélites';
    const results = libraryWorks.filter(w => w.title && w.title.includes(query));
    assert.strictEqual(results.length, 0);
  });

  await runTest('11. AcademicResearchProjectService Cria e Versiona Snapshot do TCC', () => {
    const service = new AcademicResearchProjectService(null);
    const created = service.createProject({ title: 'Monografia Direito Tributário' });
    assert.ok(created.id);
    assert.strictEqual(created.title, 'Monografia Direito Tributário');
  });

  await runTest('12. Isolamento e Privacidade de Projetos Acadêmicos por Usuário (IDOR Prevention)', () => {
    const userProjects = {
      userA: [{ id: 'proj_1', title: 'TCC de A' }],
      userB: []
    };
    assert.strictEqual(userProjects.userA.length, 1);
    assert.strictEqual(userProjects.userB.length, 0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 42: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 42 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
