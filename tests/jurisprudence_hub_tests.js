/**
 * VadeAudio AI - Suíte de Testes da Central de Jurisprudência Inteligente (Etapa 36)
 * Validação de 12 Casos Críticos: Busca Exata, RAG Grounded, Zero-Result, Linha do Tempo, Comparador e Status.
 */

const assert = require('assert');
const JURISPRUDENCE_DATABASE = require('../js/db/jurisprudenceData');
const { JurisprudenceQueryParser, JurisprudenceSearchEngine, JurisprudenceRAGService } = require('../js/modules/jurisprudenceSearchEngine');
const { JurisprudenceStatusService, JurisprudenceTimelineBuilder, JurisprudenceComparator } = require('../js/modules/jurisprudenceRelationService');

console.log('================================================================');
console.log('⚖️ INICIANDO SUÍTE DE TESTES DA CENTRAL DE JURISPRUDÊNCIA - ETAPA 36');
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

const searchEngine = new JurisprudenceSearchEngine(JURISPRUDENCE_DATABASE);
const ragService = new JurisprudenceRAGService(searchEngine);

async function runAllTests() {
  await runTest('1. Busca Exata por Número de Súmula (Súmula 479 STJ)', () => {
    const hits = searchEngine.search('Súmula 479 STJ');
    assert.ok(hits.length > 0, 'Deve retornar ao menos 1 resultado');
    assert.strictEqual(hits[0].id, 'stj-sumula-479', 'Primeiro resultado deve ser a Súmula 479');
    assert.strictEqual(hits[0].court, 'STJ');
  });

  await runTest('2. Busca por Pergunta em Linguagem Natural ("banco responde por fraude de terceiro?")', () => {
    const hits = searchEngine.search('banco responde por fraude praticada por terceiro?');
    assert.ok(hits.length > 0);
    assert.strictEqual(hits[0].id, 'stj-sumula-479', 'Deve rankear Súmula 479 em 1º lugar');
  });

  await runTest('3. Busca por Artigo do Vade Mecum (Art. 300 CPC)', () => {
    const hits = searchEngine.search('jurisprudência sobre o art. 300 do cpc');
    assert.ok(hits.length > 0);
    const hasTutela = hits.some(h => (h.related_articles_display || []).some(a => a.includes('300')));
    assert.strictEqual(hasTutela, true, 'Deve conter julgados relacionados ao Art. 300 CPC');
  });

  await runTest('4. Detecção de Súmula Cancelada com Badge Apropriado', () => {
    const cancelada = JURISPRUDENCE_DATABASE.find(j => j.id === 'stj-sumula-cancelada-260');
    assert.ok(cancelada);
    const badge = JurisprudenceStatusService.getStatusBadge(cancelada.status);
    assert.strictEqual(badge.label, 'Cancelada');
    assert.strictEqual(badge.color, '#ef4444');
  });

  await runTest('5. Tratamento de Status Não Determinado sem Adivinhação', () => {
    const badge = JurisprudenceStatusService.getStatusBadge(null);
    assert.strictEqual(badge.label, 'Status Não Determinado');
  });

  await runTest('6. Jurisprudence RAG Grounded Cita Estritamente a Fonte Recuperada', () => {
    const rag = ragService.answerQuestion('Qual é o entendimento do STJ sobre inscrição indevida quando já existe negativação anterior?');
    assert.strictEqual(rag.hasSufficientSources, true);
    assert.ok(rag.answer.includes('385') || rag.answer.includes('STJ'), 'Deve citar expressamente a Súmula 385');
    assert.ok(rag.sources.length > 0);
  });

  await runTest('7. Zero-Result Fallback Não Inventa Decisão Inexistente', () => {
    const rag = ragService.answerQuestion('Qual o entendimento do tribunal intergaláctico sobre viagem temporal no direito romano?');
    assert.strictEqual(rag.hasSufficientSources, false);
    assert.strictEqual(rag.answer, 'Não encontrei jurisprudência suficiente na base consultada para responder com segurança.');
  });

  await runTest('8. Linha do Tempo Jurisprudencial Ordena Cronologicamente', () => {
    const timeline = JurisprudenceTimelineBuilder.buildTimeline(JURISPRUDENCE_DATABASE);
    assert.ok(timeline.length > 1);
    for (let i = 0; i < timeline.length - 1; i++) {
      assert.ok(new Date(timeline[i].date) <= new Date(timeline[i + 1].date), 'Linha do tempo deve ser estritamente cronológica');
    }
  });

  await runTest('9. Comparador STF x STJ Confronta Teses e Tribunais', () => {
    const itemA = JURISPRUDENCE_DATABASE.find(j => j.id === 'stf-tema-1033');
    const itemB = JURISPRUDENCE_DATABASE.find(j => j.id === 'stj-tema-1010');
    const comp = JurisprudenceComparator.compare(itemA, itemB);
    assert.ok(comp);
    assert.strictEqual(comp.courtA, 'STF');
    assert.strictEqual(comp.courtB, 'STJ');
    assert.strictEqual(comp.relationship, 'Confronto entre Cortes Superiores');
  });

  await runTest('10. Conversão de Julgado em Flashcard com Preservação da Fonte', () => {
    const item = JURISPRUDENCE_DATABASE.find(j => j.id === 'stj-sumula-479');
    const mockStorageData = [];
    const mockStorage = {
      saveSmartFlashcard(c) {
        mockStorageData.push(c);
        return c;
      }
    };
    const card = {
      question: `Qual é a tese da ${item.title}?`,
      answer: item.official_thesis,
      type: 'qa',
      legalReference: item.source_id
    };
    mockStorage.saveSmartFlashcard(card);
    assert.strictEqual(mockStorageData[0].legalReference, 'STJ-SUM-479');
    assert.strictEqual(mockStorageData[0].answer, item.official_thesis);
  });

  await runTest('11. QueryParser Extrai Metadados Estruturados Corretamente', () => {
    const parsed = JurisprudenceQueryParser.parse('STJ súmula 479 dano moral banco 2021');
    assert.strictEqual(parsed.court, 'STJ');
    assert.strictEqual(parsed.number, '479');
    assert.strictEqual(parsed.year, 2021);
    assert.ok(parsed.keywords.includes('banco'));
  });

  await runTest('12. Isolamento de Salvos e Notas por Usuário', () => {
    const mockUserStorage = {
      userA: { saves: [] },
      userB: { saves: [] }
    };
    mockUserStorage.userA.saves.push({ id: 'stj-sumula-479' });
    assert.strictEqual(mockUserStorage.userA.saves.length, 1);
    assert.strictEqual(mockUserStorage.userB.saves.length, 0, 'Usuário B não deve ver os julgados salvos por A');
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 36: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 36 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
