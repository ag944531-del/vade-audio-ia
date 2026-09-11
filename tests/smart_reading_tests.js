/**
 * VadeAudio AI - Suíte de Testes do Modo Leitura Inteligente & Sessão Ativa (Etapa 33)
 * Validação de Progresso Real, Detecção de Artigos e Termos, Active Recall, Grifos e Retomada.
 */

const assert = require('assert');
const ReadingProgressService = require('../js/modules/readingProgressService');
const SmartReadingSessionService = require('../js/modules/smartReadingSessionService');

console.log('================================================================');
console.log('📖 INICIANDO SUÍTE DE TESTES DO MODO LEITURA INTELIGENTE - ETAPA 33');
console.log('================================================================\n');

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

// Mock StorageModule
const mockStorageData = {};
const mockStorage = {
  getDocumentReadingProgress(docId) {
    return mockStorageData[docId] || {
      docId,
      currentPage: 1,
      totalPages: 10,
      progressPercent: 0,
      verifiedPercent: 0,
      activeSeconds: 0,
      viewedPages: [1],
      lastReadAt: null
    };
  },
  saveDocumentReadingProgress(data) {
    mockStorageData[data.docId] = { ...data, lastReadAt: Date.now() };
    return data;
  },
  saveReadingSession(sess) {
    return sess;
  },
  getReadingGlossaryTerms() {
    return [
      { term: 'Preclusão', definition: 'Perda da faculdade processual.', source: 'CPC' },
      { term: 'Litispendência', definition: 'Ações idênticas em curso.', source: 'CPC' }
    ];
  },
  saveGlossaryTerm(term) {
    return term;
  },
  getReadingHighlights(docId) {
    return mockStorageData.highlights || [];
  },
  saveReadingHighlight(hl) {
    if (!mockStorageData.highlights) mockStorageData.highlights = [];
    mockStorageData.highlights.push(hl);
    return hl;
  },
  getReadingPreferences() {
    return { fontSize: 16, lineHeight: 1.6, highlightTerms: true };
  }
};

// ----------------------------------------------------------------------------
// 1. Testes do ReadingProgressService (Progresso Real e Retomada)
// ----------------------------------------------------------------------------

runTest('1. Inicialização de Sessão e Retomada de Página Anterior', () => {
  mockStorageData['doc_test_1'] = {
    docId: 'doc_test_1',
    currentPage: 7,
    totalPages: 20,
    progressPercent: 35,
    verifiedPercent: 30,
    activeSeconds: 600,
    viewedPages: [1, 2, 3, 4, 5, 6, 7],
    lastReadAt: Date.now() - 3600000
  };

  const progressService = new ReadingProgressService(mockStorage);
  const resume = progressService.checkResumePoint('doc_test_1');
  assert.strictEqual(resume.canResume, true, 'Deve identificar ponto de retomada');
  assert.strictEqual(resume.page, 7, 'Deve retomar da página 7');

  const session = progressService.startSession('doc_test_1', 20);
  assert.strictEqual(session.currentPage, 7, 'Sessão deve carregar na página 7');
  progressService.stopSession();
});

runTest('2. Medição Real de Leitura (Rolagem Rápida vs Permanência Ativa)', () => {
  const progressService = new ReadingProgressService(mockStorage);
  progressService.startSession('doc_test_scroll', 10, { forcePage: 1 });

  // Simula passar pelas páginas em menos de 2 segundos (rolagem rápida)
  progressService.goToPage(2);
  progressService.goToPage(3);
  progressService.goToPage(4);

  const fastProgress = progressService.calculateProgress();
  assert.strictEqual(fastProgress.viewedPagesCount, 4, 'Deve registrar 4 páginas visualizadas');
  assert.strictEqual(fastProgress.verifiedPercent, 0, 'Progresso verificado deve ser 0% sem permanência');

  // Simula permanência de 15 segundos na página 4
  progressService.pageActiveSeconds[4] = 15;
  const verifiedProgress = progressService.calculateProgress();
  assert.strictEqual(verifiedProgress.verifiedPagesCount, 1, 'Deve registrar 1 página com leitura verificada');
  assert.strictEqual(verifiedProgress.verifiedPercent, 10, 'Progresso verificado deve ser 10%');

  progressService.stopSession();
});

// ----------------------------------------------------------------------------
// 2. Testes do SmartReadingSessionService (Termos, Artigos e IA)
// ----------------------------------------------------------------------------

runTest('3. Detecção de Termos Jurídicos e Inserção de Tooltips', () => {
  const sessionService = new SmartReadingSessionService({ storage: mockStorage });
  const rawText = 'O réu sofreu preclusão e foi configurada litispendência.';
  const highlighted = sessionService.highlightLegalTerms(rawText);

  assert.ok(highlighted.includes('class="smart-term-highlight"'), 'Deve envolver termos com span de destaque');
  assert.ok(highlighted.includes('data-term="preclusão"'), 'Deve conter atributo do termo preclusão');
});

runTest('4. Detecção de Referências Legais (Art. 300 CPC, Art. 5º CF/88)', () => {
  const sessionService = new SmartReadingSessionService({ storage: mockStorage });
  const sample = 'Com amparo no Art. 300 CPC e no Art. 5º CF/88, requer-se a medida.';
  const refs = sessionService.detectLegalReferences(sample);

  assert.strictEqual(refs.length, 2, 'Deve detectar 2 referências legais');
  assert.strictEqual(refs[0].articleNumber, '300');
  assert.strictEqual(refs[0].lawCode, 'cpc');
  assert.strictEqual(refs[1].articleNumber, '5');
  assert.strictEqual(refs[1].lawCode, 'cf88');
});

runTest('5. Ações Contextuais de IA: Explicar Trecho nos 3 Níveis', () => {
  const sessionService = new SmartReadingSessionService({ storage: mockStorage });
  const snippet = 'Ocorre a preclusão consumativa quando o ato já foi praticado.';

  const simpleExp = sessionService.explainSelectedText(snippet, 'simples');
  const advExp = sessionService.explainSelectedText(snippet, 'avancado');

  assert.ok(simpleExp.explanation.length > 10, 'Deve gerar explicação simples');
  assert.ok(advExp.explanation.includes('507 CPC') || advExp.explanation.includes('preclusão'), 'Explicação avançada deve citar fundamentação');
});

runTest('6. Active Recall Inteligente & Geração de Questões', () => {
  const sessionService = new SmartReadingSessionService({ storage: mockStorage });
  const pageText = 'A tutela de urgência antecipada exige fumus boni iuris e periculum in mora.';
  const recall = sessionService.getActiveRecallQuestion(pageText);

  assert.ok(recall.question.includes('tutela de urgência'), 'Pergunta de recall deve focar no tema tutela');
  assert.ok(recall.suggestedAnswer.includes('Art. 300'), 'Resposta sugerida deve conter o dispositivo legal');

  const quiz = sessionService.generateQuizForReadPages(5);
  assert.strictEqual(quiz.length, 2, 'Deve gerar 2 questões contextualizadas');
  assert.strictEqual(typeof quiz[0].correctIndex, 'number');
});

runTest('7. Grifos Categorizados e Exportação para Caderno Digital', () => {
  let notebookExported = false;
  const mockNotebook = {
    createNoteBlock(data) {
      if (data.title && data.content) notebookExported = true;
    }
  };

  const sessionService = new SmartReadingSessionService({
    storage: mockStorage,
    notebookEngine: mockNotebook
  });
  sessionService.setDocument({ id: 'doc_proc_civil', title: 'Processo Civil Aplicado' });

  const hl = sessionService.createHighlight('Tutela de urgência não pode ser irreversível.', 2, 'Prova', 'Cai sempre na 1ª fase');
  assert.strictEqual(hl.category, 'Prova', 'Grifo deve ter categoria Prova');

  const res = sessionService.sendAnnotationToNotebook('Tutela de urgência não pode ser irreversível.', 'Art. 300, § 3º');
  assert.strictEqual(res, true, 'Deve exportar anotação com sucesso');
  assert.strictEqual(notebookExported, true, 'Caderno Digital deve receber o bloco');
});

console.log('\n================================================================');
console.log(`📊 RESULTADO FINAL DA ETAPA 33: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES DA ETAPA 33 FORAM VALIDADOS COM SUCESSO!\n');
}
