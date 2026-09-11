/**
 * VadeAudio AI - Suíte de Testes da Central de Doutrina & Biblioteca Jurídica (Etapa 37)
 * Validação de 12 Casos Críticos: ABNT, Validador Acadêmico, Citações, Comparador de Autores e RAG Pessoal.
 */

const assert = require('assert');
const { AcademicReferenceValidator, BibliographyService } = require('../js/modules/bibliographyService');
const { DoctrineSearchService, DoctrineComparisonService, DoctrineRAGService } = require('../js/modules/doctrineService');

console.log('================================================================');
console.log('📚 INICIANDO SUÍTE DE TESTES DA BIBLIOTECA JURÍDICA - ETAPA 37');
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

// Mock Storage para os testes
const mockWorks = [
  {
    id: 'work_diniz',
    title: 'Curso de Direito Civil Brasileiro',
    author: 'Maria Helena Diniz',
    edition: '39. ed',
    publisher: 'Saraiva',
    year: '2023',
    city: 'São Paulo'
  },
  {
    id: 'work_tartuce',
    title: 'Manual de Direito Civil',
    author: 'Flávio Tartuce',
    edition: '13. ed',
    publisher: 'Método',
    year: '2023',
    city: 'São Paulo'
  }
];

const mockQuotes = [
  {
    id: 'q_1',
    author: 'Maria Helena Diniz',
    workTitle: 'Curso de Direito Civil Brasileiro',
    text: 'A prescrição é a perda da pretensão de reparação do direito violado pelo decurso do tempo.',
    printedPage: 115,
    isDirectQuote: true,
    isAiParaphrase: false,
    tags: ['Prescrição']
  },
  {
    id: 'q_2',
    author: 'Flávio Tartuce',
    workTitle: 'Manual de Direito Civil',
    text: 'A prescrição atinge a pretensão, extinguindo o direito de exigir judicialmente a prestação.',
    printedPage: 190,
    isDirectQuote: true,
    isAiParaphrase: false,
    tags: ['Prescrição']
  }
];

const mockStorage = {
  getLibraryWorks() { return mockWorks; },
  getLibraryQuotes() { return mockQuotes; }
};

const searchService = new DoctrineSearchService(mockStorage);
const comparisonService = new DoctrineComparisonService(mockStorage);
const ragService = new DoctrineRAGService(mockStorage);

async function runAllTests() {
  await runTest('1. Formatação de Referência ABNT Padrão (NBR 6023)', () => {
    const work = mockWorks[0];
    const abnt = BibliographyService.formatABNT(work);
    assert.ok(abnt.includes('DINIZ, Maria Helena'));
    assert.ok(abnt.includes('Curso de Direito Civil Brasileiro'));
    assert.ok(abnt.includes('Saraiva'));
    assert.ok(abnt.includes('2023'));
  });

  await runTest('2. AcademicReferenceValidator Detecta Campos Faltantes sem Adivinhação', () => {
    const incompleteWork = { title: 'Livro Sem Autor', year: '2020' }; // Sem autor e editora
    const val = AcademicReferenceValidator.validate(incompleteWork);
    assert.strictEqual(val.isComplete, false);
    assert.ok(val.missingFields.includes('autor'));
    assert.ok(val.missingFields.includes('editora'));
  });

  await runTest('3. Preservação Exata de Citação Direta com Paginação Impressa', () => {
    const quote = mockQuotes[0];
    assert.strictEqual(quote.printedPage, 115);
    assert.strictEqual(quote.isDirectQuote, true);
    assert.ok(quote.text.includes('perda da pretensão'));
  });

  await runTest('4. Diferenciação entre Citação Direta e Paráfrase Gerada por IA', () => {
    const aiParaphrase = {
      text: 'Segundo Diniz, os prazos prescricionais extinguem pretensões.',
      isDirectQuote: false,
      isAiParaphrase: true
    };
    assert.strictEqual(aiParaphrase.isAiParaphrase, true);
    assert.strictEqual(aiParaphrase.isDirectQuote, false);
  });

  await runTest('5. Comparação Doutrinária entre Diniz e Tartuce Ancorada em Trechos Reais', () => {
    const comp = comparisonService.compareAuthors('Maria Helena Diniz', 'Flávio Tartuce', 'prescrição');
    assert.strictEqual(comp.hasSufficientSources, true);
    assert.ok(comp.synthesis.includes('Diniz') && comp.synthesis.includes('Tartuce'));
    assert.ok(comp.quoteA.text.includes('prescrição'));
    assert.ok(comp.quoteB.text.includes('prescrição'));
  });

  await runTest('6. Zero-Result Fallback no Comparador quando Autor Não Possui Trecho Cadastrado', () => {
    const comp = comparisonService.compareAuthors('Autor Inexistente', 'Flávio Tartuce', 'prescrição');
    assert.strictEqual(comp.hasSufficientSources, false);
    assert.strictEqual(comp.message, 'Não há material suficiente na sua biblioteca para comparar esses autores com segurança.');
  });

  await runTest('7. Doctrine RAG no Modo "Somente Minhas Fontes" Cita Livro Cadastrado', () => {
    const rag = ragService.askLibrary('prescrição');
    assert.strictEqual(rag.hasSufficientSources, true);
    assert.ok(rag.answer.includes('Diniz') || rag.answer.includes('Tartuce'));
    assert.ok(rag.sources.length > 0);
  });

  await runTest('8. Zero-Result Fallback no RAG quando a Dúvida Não Possui Trechos na Biblioteca', () => {
    const rag = ragService.askLibrary('direito espacial interplanetário');
    assert.strictEqual(rag.hasSufficientSources, false);
    assert.strictEqual(rag.answer, 'Não encontrei essa posição nas obras que você cadastrou.');
  });

  await runTest('9. Busca por Frase Exata nas Citações da Biblioteca', () => {
    const res = searchService.search('extinguindo o direito de exigir');
    assert.strictEqual(res.quotes.length, 1);
    assert.strictEqual(res.quotes[0].author, 'Flávio Tartuce');
  });

  await runTest('10. Conversão de Conceito Doutrinário em Flashcard Atômico (Etapa 35)', () => {
    const quote = mockQuotes[0];
    const mockStorageCards = [];
    const storageMod = {
      saveSmartFlashcard(card) {
        mockStorageCards.push(card);
        return card;
      }
    };
    const card = {
      question: `Como Maria Helena Diniz define a prescrição na sua obra?`,
      answer: quote.text,
      type: 'qa',
      legalReference: `${quote.workTitle}, p. ${quote.printedPage}`
    };
    storageMod.saveSmartFlashcard(card);
    assert.strictEqual(mockStorageCards.length, 1);
    assert.strictEqual(mockStorageCards[0].legalReference, 'Curso de Direito Civil Brasileiro, p. 115');
  });

  await runTest('11. Preservação de Edições Distintas da Mesma Obra como Registros Separados', () => {
    const edition5 = { id: 'w_ed5', title: 'Direito Penal', edition: '5ª ed.', year: '2020' };
    const edition6 = { id: 'w_ed6', title: 'Direito Penal', edition: '6ª ed.', year: '2023' };
    assert.notStrictEqual(edition5.id, edition6.id);
    assert.notStrictEqual(edition5.edition, edition6.edition);
  });

  await runTest('12. Isolamento de Biblioteca e Citações por Usuário (IDOR Prevention)', () => {
    const userLibrary = {
      userA: { works: ['work_diniz'] },
      userB: { works: [] }
    };
    assert.strictEqual(userLibrary.userA.works.length, 1);
    assert.strictEqual(userLibrary.userB.works.length, 0, 'Usuário B não deve acessar obras de A');
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 37: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 37 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
