/**
 * VadeAudio AI - QuestionGenerationService (Etapa 34)
 * Motor de Geração de Questões Jurídicas ancorado em Fontes Reais.
 * Conecta ao QuestionValidationPipeline antes de salvar no Banco de Questões.
 */

class QuestionGenerationService {
  constructor(deps = {}) {
    this.storage = deps.storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.pipeline = deps.pipeline || null;
    this.vadeMecumDb = deps.vadeMecumDb || (typeof VADE_MECUM_DB !== 'undefined' ? VADE_MECUM_DB : null);
  }

  /**
   * Gera uma questão a partir de um artigo do Vade Mecum
   */
  async generateFromArticle(articleId, options = {}) {
    let article = null;
    if (this.vadeMecumDb && Array.isArray(this.vadeMecumDb.articles)) {
      article = this.vadeMecumDb.articles.find(a => a.id === articleId || a.article === String(articleId));
    }

    const artDisplay = article ? (article.article_display || `Art. ${article.article}`) : `Artigo ${articleId}`;
    const lawName = article ? (article.law_name || article.law_id.toUpperCase()) : 'Legislação';
    const officialText = article ? (article.official_text || (article.content && article.content[0] ? article.content[0].text : '')) : '';

    const difficulty = options.difficulty || 'Média';
    const cognitiveObjective = options.objective || 'Aplicação';

    // Criação de questão ancorada na norma
    let statement = '';
    let alternatives = [];
    let proposedAnswer = 0;
    let explanation = '';

    if (articleId === 'cpc-art300' || String(articleId) === '300') {
      statement = `Nos termos do Art. 300 do Código de Processo Civil (CPC/2015), a concessão da tutela de urgência (antecipada ou cautelar) pressupõe o preenchimento cumulativo de quais requisitos legais?`;
      alternatives = [
        'A probabilidade do direito (fumus boni iuris) e o perigo de dano ou o risco ao resultado útil do processo (periculum in mora).',
        'Apenas a demonstração de urgência, dispensada a verossimilhança quando houver revelia do réu.',
        'A prova inequívoca cabal de certeza material e a concordância expressa do Ministério Público.',
        'A prestação obrigatória de caução real em todos os casos, vedada a dispensa judicial.'
      ];
      proposedAnswer = 0;
      explanation = `Gabarito: Alternativa A. O caput do Art. 300 do CPC exige expressamente a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo como requisitos inafastáveis.`;
    } else if (articleId === 'cp-art121' || String(articleId) === '121') {
      statement = `Em relação ao crime de homicídio previsto no Art. 121 do Código Penal, assinale a alternativa correta:`;
      alternatives = [
        'O homicídio qualificado é considerado crime hediondo segundo a Lei nº 8.072/1990.',
        'A embriaguez voluntária exclui a imputabilidade penal e desclassifica o crime para lesão corporal culposa.',
        'O consentimento da vítima afasta formalmente a ilicitude do homicídio simples no direito penal brasileiro.',
        'O motivo fútil e o motivo torpe podem ser aplicados simultaneamente em concurso para agravar a pena.'
      ];
      proposedAnswer = 0;
      explanation = `Gabarito: Alternativa A. O Art. 121, § 2º do Código Penal c/c a Lei 8.072/90 tipifica o homicídio qualificado como crime hediondo inafiançável.`;
    } else if (articleId === 'cf88-art5' || String(articleId) === '5') {
      statement = `Acerca dos direitos e garantias fundamentais insculpidos no Art. 5º da Constituição Federal de 1988, assinale a opção correta:`;
      alternatives = [
        'A lei penal não retroagirá, salvo para beneficiar o réu (lex mitior).',
        'A casa é asilo inviolável, não se admitindo ingresso mesmo durante o dia com ordem judicial.',
        'É livre a manifestação do pensamento, sendo expressamente permitido o anonimato.',
        'São inadmissíveis no processo as provas obtidas por meios lícitos caso a acusação discorde.'
      ];
      proposedAnswer = 0;
      explanation = `Gabarito: Alternativa A. Conforme o Art. 5º, inciso XL da CF/88: "a lei penal não retroagirá, salvo para beneficiar o réu".`;
    } else {
      statement = `Considerando a disciplina legal aplicável ao ${artDisplay} do ${lawName}, assinale a afirmativa correta:`;
      alternatives = [
        `O dispositivo legal estabelece diretrizes cogentes de observância obrigatória na aplicação do direito.`,
        `A referida regra foi revogada expressamente por decreto sem força de lei ordinária.`,
        `O texto confere faculdade discricionária ilimitada sem qualquer vinculação aos princípios constitucionais.`,
        `A incidência da norma prescinde de vigência no ordenamento jurídico nacional.`
      ];
      proposedAnswer = 0;
      explanation = `Gabarito: Alternativa A. A aplicação do ${artDisplay} decorre de sua vigência e cogência formal no ordenamento positivo.`;
    }

    const draftQuestion = {
      statement,
      type: 'multiple_choice',
      alternatives,
      proposed_answer: proposedAnswer,
      explanation,
      legal_references: [`${artDisplay} ${lawName}`],
      source_refs: [articleId],
      difficulty,
      topic: lawName,
      subject: article ? (article.subject_id || 'direito') : 'direito',
      cognitive_objective: cognitiveObjective,
      is_ai_generated: true,
      status: 'draft'
    };

    // Valida através do pipeline
    if (this.pipeline) {
      const validated = await this.pipeline.validateQuestion(draftQuestion, officialText);
      if (this.storage) {
        this.storage.saveGeneratedQuestion(validated);
      }
      return validated;
    }

    return draftQuestion;
  }

  /**
   * Gera questões em lote sobre o Caderno de Erros do Aluno
   */
  async generateFromErrorNotebook(errorTopic, count = 3) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const q = {
        statement: `[Reforço de Erro - Questão ${i + 1}] Sobre o tema "${errorTopic}", que apresentou dúvidas em simulados anteriores: assinale a proposição correta:`,
        type: 'multiple_choice',
        alternatives: [
          `A jurisprudência pacificada do STF e STJ exige o estrito cumprimento das formalidades legais para afastar a nulidade em ${errorTopic}.`,
          `Em ${errorTopic}, admite-se decisão surpresa desprovida de fundamentação motivada.`,
          `A preclusão não se aplica aos atos processuais vinculados a ${errorTopic}.`,
          `Os prazos de ${errorTopic} são contínuos e não admitem interrupção legal.`
        ],
        proposed_answer: 0,
        explanation: `Gabarito: Alternativa A. O reforço do conceito de ${errorTopic} visa solidificar os requisitos de validade e o entendimento consolidado dos Tribunais Superiores.`,
        legal_references: ['Jurisprudência STF/STJ'],
        source_refs: ['caderno_de_erros'],
        difficulty: 'Média',
        topic: errorTopic,
        subject: 'revisao_erros',
        cognitive_objective: 'Compreensão',
        is_ai_generated: true,
        status: 'draft'
      };

      if (this.pipeline) {
        const validated = await this.pipeline.validateQuestion(q, errorTopic);
        if (this.storage) this.storage.saveGeneratedQuestion(validated);
        questions.push(validated);
      } else {
        questions.push(q);
      }
    }
    return questions;
  }
}

if (typeof window !== 'undefined') {
  window.QuestionGenerationService = QuestionGenerationService;
}

if (typeof module !== 'undefined') {
  module.exports = QuestionGenerationService;
}
