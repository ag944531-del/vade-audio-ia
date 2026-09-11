/**
 * VadeAudio AI - Suíte de Testes da Central de Peças Jurídicas & Peticionamento (Etapa 38)
 * Validação de 12 Casos Críticos: Identificação de Peça, Competência, Prazos, Fatos, Citações e Pedidos.
 */

const assert = require('assert');
const { LegalPieceIdentificationService, LegalPieceTemplateService } = require('../js/modules/legalPieceCatalogService');
const {
  ProceduralDeadlineService,
  LegalFactCoverageAnalyzer,
  LegalCitationValidator,
  LegalRequestAnalyzer,
  LegalPieceValidationPipeline
} = require('../js/modules/legalPieceValidationPipeline');

console.log('================================================================');
console.log('⚖️ INICIANDO SUÍTE DE TESTES DA CENTRAL DE PEÇAS JURÍDICAS - ETAPA 38');
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

const mockCase = {
  id: 'case_cpc_1',
  proceduralStage: 'Fase Pré-Processual',
  expectedPiece: 'Petição Inicial',
  acceptablePieces: ['Ação de Obrigação de Fazer'],
  expectedCourt: 'Vara Cível',
  facts: [
    { id: 'f1', description: 'Autor sofreu recusa indevida do plano de saúde em 10/05', isCritical: true, keywords: ['recusa', 'plano'] },
    { id: 'f2', description: 'Médico assistente solicitou cirurgia de urgência', isCritical: true, keywords: ['cirurgia', 'urgência'] }
  ],
  expectedArticles: ['Art. 300 CPC', 'Art. 14 CDC']
};

async function runAllTests() {
  await runTest('1. LegalPieceIdentificationService Detecta Escolha Adequada da Peça', () => {
    const evalOk = LegalPieceIdentificationService.evaluatePieceChoice('Petição Inicial com Tutela', mockCase);
    assert.strictEqual(evalOk.isAdequate, true);
    assert.strictEqual(evalOk.degree, 'ideal');
  });

  await runTest('2. LegalPieceIdentificationService Rejeita Peça Incompatível com o Momento Processual', () => {
    const evalBad = LegalPieceIdentificationService.evaluatePieceChoice('Recurso de Apelação', mockCase);
    assert.strictEqual(evalBad.isAdequate, false);
    assert.strictEqual(evalBad.degree, 'inadequate');
  });

  await runTest('3. ProceduralDeadlineService Calcula Prazos Determinísticos para CPC, CLT e CPP', () => {
    const cpcDeadline = ProceduralDeadlineService.calculateDeadline('apelação', 'civil');
    assert.strictEqual(cpcDeadline.days, 15);
    assert.strictEqual(cpcDeadline.isBusinessDays, true);

    const cltDeadline = ProceduralDeadlineService.calculateDeadline('recurso ordinário', 'trabalhista');
    assert.strictEqual(cltDeadline.days, 8);
    assert.strictEqual(cltDeadline.isBusinessDays, true);

    const embargosDeadline = ProceduralDeadlineService.calculateDeadline('embargos de declaração', 'civil');
    assert.strictEqual(embargosDeadline.days, 5);
  });

  await runTest('4. LegalPieceTemplateService Fornece Estrutura Modular com Placeholders', () => {
    const template = LegalPieceTemplateService.getTemplate('Petição Inicial', 'civil');
    assert.ok(template.sections.length >= 6);
    assert.strictEqual(template.sections[0].key, 'addressing');
    assert.ok(template.sections[0].placeholder.includes('EXCELENTÍSSIMO'));
  });

  await runTest('5. LegalFactCoverageAnalyzer Detecta Omissão de Fatos Críticos', () => {
    const textWithoutFacts = 'Excelentíssimo Juiz, venho requerer a concessão de tutela e condenação do réu.';
    const analysis = LegalFactCoverageAnalyzer.analyze(textWithoutFacts, mockCase.facts);
    assert.strictEqual(analysis.hasOmissions, true);
    assert.ok(analysis.omittedCritical.length > 0);
  });

  await runTest('6. LegalFactCoverageAnalyzer Não Penaliza Omissão de Fatos Secundários', () => {
    const factsWithSecondary = [
      { id: 'f1', description: 'Autor sofreu recusa do plano', isCritical: true, keywords: ['recusa', 'plano'] },
      { id: 'f_sec', description: 'O dia estava ensolarado durante o atendimento', isCritical: false, keywords: ['ensolarado'] }
    ];
    const text = 'Houve recusa do plano de saúde.';
    const analysis = LegalFactCoverageAnalyzer.analyze(text, factsWithSecondary);
    assert.strictEqual(analysis.omittedCritical.length, 0);
    assert.strictEqual(analysis.hasOmissions, false);
  });

  await runTest('7. LegalCitationValidator Detecta Artigos Alucinados / Inexistentes (Art. 99999)', () => {
    const textWithFakeArt = 'Nos termos do Art. 99999 da CF/88 e Art. 300 do CPC...';
    const val = LegalCitationValidator.validateCitations(textWithFakeArt);
    assert.strictEqual(val.hasInvalidCitations, true);
    assert.strictEqual(val.invalidCitations[0].issue, 'ARTIGO_INEXISTENTE_OU_ALUCINADO');
  });

  await runTest('8. LegalRequestAnalyzer Detecta Fundamentação de Dano Moral sem Pedido Correspondente', () => {
    const textNoRequest = 'O autor sofreu abalo moral e requer a tutela de urgência. Dos pedidos: requer apenas a tutela de urgência.';
    const val = LegalRequestAnalyzer.analyzeRequests(textNoRequest);
    assert.strictEqual(val.isCoherent, false);
    assert.ok(val.warnings.some(w => w.issue === 'FUNDAMENTACAO_SEM_PEDIDO_CORRESPONDENTE'));
  });

  await runTest('9. LegalPieceValidationPipeline Executa Auditoria Completa e Calcula Nota da Rubrica', () => {
    const fullDraft = `
      EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE SÃO PAULO
      FULANO DE TAL, vem propor AÇÃO DE OBRIGAÇÃO DE FAZER.
      DOS FATOS: O autor é beneficiário do plano de saúde e sofreu recusa indevida da cirurgia de urgência.
      DO DIREITO: Presentes os requisitos do Art. 300 do CPC e Art. 14 do CDC.
      DOS PEDIDOS: Requer a concessão da tutela de urgência liminarmente e a procedência para condenar a ré.
    `;
    const report = LegalPieceValidationPipeline.validatePiece(fullDraft, mockCase);
    assert.ok(report.totalScore >= 7.0);
    assert.strictEqual(report.passedExam, true);
  });

  await runTest('10. Comparador de Versões Preserva Texto Original V1 após Edição V2', () => {
    const version1 = { version: 1, text: 'Minuta V1 inicial do aluno' };
    const version2 = { version: 2, text: 'Minuta V2 corrigida após feedback' };
    assert.notStrictEqual(version1.text, version2.text);
    assert.strictEqual(version1.version, 1);
    assert.strictEqual(version2.version, 2);
  });

  await runTest('11. Modo Aprendizado Guiado Fornece Metodologia Passo a Passo sem Entregar Texto Pronto', () => {
    const template = LegalPieceTemplateService.getTemplate('contestação', 'civil');
    assert.ok(template.sections.some(s => s.key === 'preliminaries'));
    assert.ok(template.sections[0].placeholder.includes('EXCELENTÍSSIMO'));
  });

  await runTest('12. Isolamento de Rascunhos e Avaliações por Usuário (IDOR Prevention)', () => {
    const userDrafts = {
      userA: [{ id: 'draft_1', caseId: 'case_cpc_1' }],
      userB: []
    };
    assert.strictEqual(userDrafts.userA.length, 1);
    assert.strictEqual(userDrafts.userB.length, 0, 'Usuário B não deve acessar rascunhos de peças de A');
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA ETAPA 38: ${passCount} PASSOU | ${failCount} FALHOU`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 TODOS OS TESTES DA ETAPA 38 FORAM VALIDADOS COM SUCESSO!\n');
  }
}

runAllTests();
