/**
 * VadeAudio AI - DoctrineSearchService, DoctrineComparisonService & DoctrineRAGService (Etapa 37)
 * Motores de Pesquisa Doutrinária, Confronto entre Autores e RAG Grounded em Fontes Pessoais.
 */

class DoctrineSearchService {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  /**
   * Realiza busca híbrida e por frase exata na biblioteca e citações
   */
  search(query, filter = {}) {
    if (!this.storage) return { works: [], quotes: [] };

    const raw = (query || '').trim();
    const lower = raw.toLowerCase();
    const works = this.storage.getLibraryWorks(filter);
    const quotes = this.storage.getLibraryQuotes(filter);

    if (!raw) {
      return { works, quotes };
    }

    // Busca exata em citações
    const matchedQuotes = quotes.filter(q => {
      const full = `${q.text} ${q.author} ${q.workTitle} ${(q.tags || []).join(' ')}`.toLowerCase();
      return full.includes(lower);
    });

    // Busca em obras
    const matchedWorks = works.filter(w => {
      const full = `${w.title} ${w.author} ${w.area} ${w.publisher || ''}`.toLowerCase();
      return full.includes(lower);
    });

    return {
      works: matchedWorks,
      quotes: matchedQuotes
    };
  }
}

class DoctrineComparisonService {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  /**
   * Compara o entendimento de dois autores sobre um determinado tema
   */
  compareAuthors(authorA, authorB, topic) {
    if (!this.storage) {
      return { hasSufficientSources: false, message: 'Armazenamento indisponível.' };
    }

    const quotes = this.storage.getLibraryQuotes();
    const topicLower = (topic || '').toLowerCase();

    // Recupera trechos reais de cada autor relacionados ao tema
    const quotesA = quotes.filter(q => 
      (q.author || '').toLowerCase().includes(authorA.toLowerCase()) &&
      (!topic || q.text.toLowerCase().includes(topicLower) || (q.tags || []).some(t => t.toLowerCase().includes(topicLower)))
    );

    const quotesB = quotes.filter(q => 
      (q.author || '').toLowerCase().includes(authorB.toLowerCase()) &&
      (!topic || q.text.toLowerCase().includes(topicLower) || (q.tags || []).some(t => t.toLowerCase().includes(topicLower)))
    );

    if (quotesA.length === 0 || quotesB.length === 0) {
      return {
        hasSufficientSources: false,
        message: 'Não há material suficiente na sua biblioteca para comparar esses autores com segurança.',
        quotesA,
        quotesB
      };
    }

    return {
      hasSufficientSources: true,
      authorA,
      authorB,
      topic,
      quoteA: quotesA[0],
      quoteB: quotesB[0],
      synthesis: `Nos trechos cadastrados na sua biblioteca, **${authorA}** sustenta que: "${quotesA[0].text}" (p. ${quotesA[0].printedPage || 'n/d'}), enquanto **${authorB}** adota o posicionamento de que: "${quotesB[0].text}" (p. ${quotesB[0].printedPage || 'n/d'}).`,
      comparisonNote: 'Comparação doutrinária extraída estritamente das citações e obras salvas em sua biblioteca pessoal.'
    };
  }
}

class DoctrineRAGService {
  constructor(storage) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
  }

  /**
   * Responde dúvidas conceituais baseando-se estritamente nas obras e citações da biblioteca do aluno
   */
  askLibrary(questionText) {
    if (!this.storage) {
      return {
        answer: 'Não encontrei essa posição nas obras que você cadastrou.',
        hasSufficientSources: false,
        sources: []
      };
    }

    const searchService = new DoctrineSearchService(this.storage);
    const searchRes = searchService.search(questionText);

    if (!searchRes.quotes || searchRes.quotes.length === 0) {
      return {
        answer: 'Não encontrei essa posição nas obras que você cadastrou.',
        hasSufficientSources: false,
        sources: []
      };
    }

    const topQuote = searchRes.quotes[0];
    const answerText = `Conforme o entendimento de **${topQuote.author}** na obra *${topQuote.workTitle}* (p. ${topQuote.printedPage || 'n/d'}): "${topQuote.text}"`;

    return {
      answer: answerText,
      hasSufficientSources: true,
      sources: [topQuote]
    };
  }
}

if (typeof window !== 'undefined') {
  window.DoctrineSearchService = DoctrineSearchService;
  window.DoctrineComparisonService = DoctrineComparisonService;
  window.DoctrineRAGService = DoctrineRAGService;
}

if (typeof module !== 'undefined') {
  module.exports = { DoctrineSearchService, DoctrineComparisonService, DoctrineRAGService };
}
