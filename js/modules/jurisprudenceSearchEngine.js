/**
 * VadeAudio AI - JurisprudenceQueryParser & JurisprudenceSearchEngine (Etapa 36)
 * Parser de Consultas Jurídicas, Busca Híbrida (Lexical + Semântica) e Jurisprudence RAG Grounded.
 */

class JurisprudenceQueryParser {
  static parse(query) {
    const raw = (query || '').trim();
    const lower = raw.toLowerCase();

    const parsed = {
      rawQuery: raw,
      court: null, // 'STF' | 'STJ'
      type: null, // 'súmula' | 'súmula_vinculante' | 'tema' | 'repetitivo' | 'repercussão_geral'
      number: null,
      article: null,
      law: null,
      keywords: [],
      year: null
    };

    // 1. Extração de Tribunal
    if (/\bstf\b/i.test(lower)) parsed.court = 'STF';
    else if (/\bstj\b/i.test(lower)) parsed.court = 'STJ';

    // 2. Extração de Súmula ou Súmula Vinculante
    const svMatch = lower.match(/s[úu]mula vinculante\s*(?:n[ºo\.]?\s*)?(\d+)/i);
    if (svMatch) {
      parsed.type = 'súmula_vinculante';
      parsed.number = svMatch[1];
      parsed.court = 'STF';
    } else {
      const sumulaMatch = lower.match(/s[úu]mula\s*(?:n[ºo\.]?\s*)?(\d+)/i);
      if (sumulaMatch) {
        parsed.type = 'súmula';
        parsed.number = sumulaMatch[1];
      }
    }

    // 3. Extração de Tema
    const temaMatch = lower.match(/tema\s*(?:n[ºo\.]?\s*)?(\d+)/i);
    if (temaMatch) {
      parsed.type = 'tema';
      parsed.number = temaMatch[1];
    }

    // 4. Extração de Artigo Legal (ex: Art. 300 CPC, Art. 186 CC)
    const artMatch = lower.match(/art(?:igo|\.)?\s*(\d+)(?:\s*(?:do\s*)?(cpc|cc|cp|cpp|cf|clt|cdc))?/i);
    if (artMatch) {
      parsed.article = artMatch[1];
      if (artMatch[2]) parsed.law = artMatch[2].toLowerCase();
    }

    // 5. Extração de Ano
    const yearMatch = lower.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      parsed.year = parseInt(yearMatch[1]);
    }

    // 6. Keywords conceituais limpas
    const clean = lower
      .replace(/\b(stf|stj|s[úu]mula|vinculante|tema|artigo|art|do|da|de|em|para|com|sobre|n[ºo\.]?|\d+)\b/gi, ' ')
      .replace(/[^\w\sáéíóúâêîôûãõç]/gi, ' ')
      .trim();
    parsed.keywords = clean.split(/\s+/).filter(w => w.length > 2);

    return parsed;
  }
}

class JurisprudenceSearchEngine {
  constructor(database = null) {
    this.database = database || (typeof JURISPRUDENCE_DATABASE !== 'undefined' ? JURISPRUDENCE_DATABASE : []);
  }

  /**
   * Executa busca híbrida (Correspondência exata + Rankeamento semântico)
   */
  search(query, filter = {}) {
    if (!query || query.trim() === '') {
      return this.database;
    }

    const parsed = JurisprudenceQueryParser.parse(query);
    const results = [];

    for (const item of this.database) {
      let score = 0;
      const reasons = [];

      // Filtros explícitos do usuário
      if (filter.court && item.court !== filter.court) continue;
      if (filter.type && item.type !== filter.type) continue;
      if (filter.status && item.status !== filter.status) continue;

      // 1. Correspondência Exata de Súmula ou Tema
      if (parsed.number && item.number) {
        const itemNumClean = item.number.replace(/[^\d]/g, '');
        if (itemNumClean === parsed.number) {
          score += 100;
          reasons.push('EXACT_NUMBER_MATCH');
        }
      }

      // 2. Correspondência de Tribunal
      if (parsed.court && item.court === parsed.court) {
        score += 20;
        reasons.push('COURT_MATCH');
      }

      // 3. Correspondência de Artigo Relacionado (ex: Art. 300 CPC)
      if (parsed.article) {
        const hasArt = (item.related_articles_display || []).some(a => a.toLowerCase().includes(parsed.article));
        if (hasArt) {
          score += 50;
          reasons.push('LEGAL_PROVISION_MATCH');
        }
      }

      // 4. Correspondência Semântica por Palavras-Chave
      const fullContent = `${item.title} ${item.topic} ${item.official_thesis} ${item.official_text} ${item.official_summary || ''}`.toLowerCase();
      
      // Stop words jurídicas genéricas não devem pontuar sozinhas
      const genericWords = new Set(['direito', 'tribunal', 'sobre', 'qual', 'entendimento', 'como', 'quando', 'onde', 'qual']);

      let matchedWords = 0;
      for (const kw of parsed.keywords) {
        if (genericWords.has(kw)) continue;
        if (fullContent.includes(kw)) {
          matchedWords++;
          score += 20;
        }
      }
      if (matchedWords > 0) {
        reasons.push('SEMANTIC_TOPIC_MATCH');
      }

      // 5. Precedente Qualificado / Súmula Vinculante
      if (item.is_qualified_precedent && score > 0) {
        score += 10;
        reasons.push('QUALIFIED_PRECEDENT');
      }

      if (score >= 20) {
        results.push({
          item,
          score,
          reasons
        });
      }
    }

    // Ordenação decrescente de pontuação
    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.item);
  }
}

class JurisprudenceRAGService {
  constructor(searchEngine) {
    this.searchEngine = searchEngine || new JurisprudenceSearchEngine();
  }

  /**
   * Responde a uma pergunta jurídica em linguagem natural ancorada estritamente nas fontes encontradas
   */
  answerQuestion(questionText) {
    const hits = this.searchEngine.search(questionText);

    if (!hits || hits.length === 0) {
      return {
        answer: 'Não encontrei jurisprudência suficiente na base consultada para responder com segurança.',
        hasSufficientSources: false,
        sources: []
      };
    }

    const topHit = hits[0];
    let answerText = '';

    if (topHit.type === 'súmula' || topHit.type === 'súmula_vinculante') {
      answerText = `Conforme a **${topHit.title}**, o entendimento fixado pelo ${topHit.court} é no sentido de que: "${topHit.official_thesis}"`;
    } else if (topHit.type === 'recurso_repetitivo' || topHit.type === 'repercussão_geral') {
      answerText = `No julgamento do **${topHit.number}**, o ${topHit.court} fixou a seguinte tese vinculante: "${topHit.official_thesis}"`;
    } else {
      answerText = `Segundo entendimento do ${topHit.court} no julgado **${topHit.number}**: "${topHit.official_thesis}"`;
    }

    return {
      answer: answerText,
      hasSufficientSources: true,
      sources: hits.slice(0, 3)
    };
  }
}

if (typeof window !== 'undefined') {
  window.JurisprudenceQueryParser = JurisprudenceQueryParser;
  window.JurisprudenceSearchEngine = JurisprudenceSearchEngine;
  window.JurisprudenceRAGService = JurisprudenceRAGService;
}

if (typeof module !== 'undefined') {
  module.exports = { JurisprudenceQueryParser, JurisprudenceSearchEngine, JurisprudenceRAGService };
}
