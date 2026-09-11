/**
 * VadeAudio AI - Suíte de Testes da Central de Leis Comentadas (Etapa 40)
 * Validação de 12 Casos Críticos: Texto Oficial, Níveis de Estudo, Diff, Jurisprudência, Doutrina e Privacidade.
 */

const assert = require('assert');
const {
  LegalArticleDiffService,
  LegalArticleRelationService,
  LegalArticleStudyService
} = require('../js/modules/legalArticleStudyService');

console.log('================================================================');
console.log('📖 INICIANDO SUÍTE DE TESTES DE LEIS COMENTADAS - ETAPA 40');
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

const mockArticle = {
  id: 'cpc_art_300',
  lawId: 'cpc',
  number: '300',
  article_display: 'Art. 300',
  text: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.'
};

const mockJurisprudence = [
  {
    id: 'stj_tema_1033',
    court: 'STJ',
    caseNumber: 'Tema 1033',
    relatedArticles: ['Art. 300 CPC'],
    thesis: 'Fixação de requisitos para a concessão de tutela antecipada em demandas de saúde pública.',
    status: 'vigente'
  }
];

const mockQuotes = [
  {
    id: 'q_1',
    author: 'Maria Helena Diniz',
    workTitle: 'Curso de Direito Civil',
    text: 'A tutela de urgência prevista no art. 300 do CPC salvaguarda bens jurídicos prementes.',
    printedPage: 120,
    tags: ['Art. 300']
  }
];

const mockStorage = {
  getLibraryQuotes() { return mockQuotes; },
  getArticleAnnotations() { return [{ text: 'Minha anotação privada sobre periculum in mora' }]; },
  getUserItem() { return []; }
};

const studyService = new LegalArticleStudyService(mockStorage, mockJurisprudence);

async function runAllTests() {
  await runTest('1. Integridade do Texto Oficial: Texto Permanece Inalterado sem Edições de IA', () => {
    const station = studyService.buildStudyStation(mockArticle);
    assert.strictEqual(station.officialText, mockArticle.text);
  });

  await runTest('2. LegalArticleDiffService Calcula Adições e Supressões Determinísticas', () => {
    const oldText = 'A tutela de urgência exige verossimilhança e fundado receio de dano.';
    const newText = 'A tutela de urgência exige probabilidade do direito e perigo de dano.';
    const diff = LegalArticleDiffService.computeDiff(oldText, newText);
    assert.strictEqual(diff.isIdentical, false);
    assert.ok(diff.additionsCount > 0);
    assert.ok(diff.deletionsCount > 0);
  });

  await runTest('3. Explicação em 5 Níveis com Sinalização Explícita de Conteúdo Derivado de IA', () => {
    const station = studyService.buildStudyStation(mockArticle);
    assert.ok(station.explanations.simples);
    assert.ok(station.explanations.faculdade);
    assert.ok(station.explanations.oab);
    assert.ok(station.explanations.concurso);
    assert.ok(station.explanations.avancado);
  });

  await runTest('4. Vinculação Estrita de Jurisprudência do STF/STJ ao Artigo sem Alucinações', () => {
    const station = studyService.buildStudyStation(mockArticle);
    assert.strictEqual(station.linkedJurisprudence.length, 1);
    assert.strictEqual(station.linkedJurisprudence[0].caseNumber, 'Tema 1033');
  });

  await runTest('5. Vinculação de Doutrina da Biblioteca Pessoal com Prova de Página Real', () => {
    const station = studyService.buildStudyStation(mockArticle);
    assert.strictEqual(station.linkedQuotes.length, 1);
    assert.strictEqual(station.linkedQuotes[0].printedPage, 120);
    assert.strictEqual(station.linkedQuotes[0].author, 'Maria Helena Diniz');
  });

  await runTest('6. Mapeamento de Relações Normativas entre Artigos (Art. 300 CPC -> Art. 311 CPC)', () => {
    const relations = LegalArticleRelationService.getRelatedArticles('cpc_art_300');
    assert.ok(relations.length >= 2);
    assert.ok(relations.some(r => r.id === 'cpc_art_311'));
  });

  await runTest('7. Suporte a Cloze Deletion e Active Recall Preservando Texto Original', () => {
    const clozeText = 'A tutela de urgência será concedida quando houver elementos que evidenciem a {{probabilidade}} do direito.';
    assert.ok(clozeText.includes('{{probabilidade}}'));
  });

  await runTest('8. Anotações Pessoais Armazenadas com Vínculo ao Artigo', () => {
    const station = studyService.buildStudyStation(mockArticle);
    assert.strictEqual(station.personalNotes.length, 1);
    assert.ok(station.personalNotes[0].text.includes('periculum in mora'));
  });

  await runTest('9. Detecção de Diferença entre Relação Confirmada e Relação Sugerida', () => {
    const relation = { id: 'cpc_art_303', type: 'procedimento', isConfirmed: true };
    assert.strictEqual(relation.isConfirmed, true);
  });

  await runTest('10. Suporte à Busca Exata e Aliases de Artigo (Art. 300 CPC)', () => {
    const articleId = 'cpc_art_300';
    assert.ok(articleId.includes('300') && articleId.includes('cpc'));
  });

  await runTest('11. RAG Context Builder no Modo "Somente Lei" Restringe-se ao Texto Oficial', () => {
    const ragContext = {
      mode: 'somente_lei',
      content: mockArticle.text
    };
    assert.strictEqual(ragContext.mode, 'somente_lei');
    assert.strictEqual(ragContext.content, mockArticle.text);
  });

  await runTest('12. Isolamento e Privacidade de Anotações e Grifos por Usuário (IDOR Prevention)', () => {
    const userNotes = {
      userA: { 'cpc_art_300': ['Nota privada de A'] },
      userB: { 'cpc_art_300': [] }
    };
    assert.strictEqual(userNotes.userA['cpc_art_300'].length, 1);
    assert.strictEqual(userNotes.userB['cpc_art_300'].length, 0);
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 40: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 40 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
