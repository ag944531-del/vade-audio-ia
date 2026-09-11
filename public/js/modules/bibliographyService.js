/**
 * VadeAudio AI - BibliographyService & AcademicReferenceValidator (Etapa 37)
 * Formatação e Normalização de Referências Acadêmicas nas Normas ABNT (NBR 6023).
 * Validação Estrita de Campos Faltantes e Preservação Literal de Citações Diretas.
 */

class AcademicReferenceValidator {
  /**
   * Valida se uma obra ou citação possui os campos necessários para citação acadêmica
   */
  static validate(work, quote = null) {
    const missing = [];

    if (!work.author || work.author.trim() === '') missing.push('autor');
    if (!work.title || work.title.trim() === '') missing.push('título');
    if (!work.year || work.year.trim() === '') missing.push('ano');
    if (!work.publisher || work.publisher.trim() === '') missing.push('editora');
    if (!work.city || work.city.trim() === '') missing.push('cidade');

    // Se for citação direta, a norma ABNT exige indicação da página
    if (quote && quote.isDirectQuote && (!quote.printedPage && quote.printedPage !== 0)) {
      missing.push('página_impressa');
    }

    const isComplete = missing.length === 0;

    return {
      isComplete,
      missingFields: missing,
      statusBadge: isComplete 
        ? { label: 'ABNT Completa', color: '#10b981', icon: 'fa-check' }
        : { label: `Faltam: ${missing.join(', ')}`, color: '#f59e0b', icon: 'fa-triangle-exclamation' }
    };
  }
}

class BibliographyService {
  /**
   * Formata uma referência completa nas normas ABNT NBR 6023
   * Exemplo: DINIZ, Maria Helena. Curso de Direito Civil Brasileiro. 39. ed. São Paulo: Saraiva, 2023.
   */
  static formatABNT(work, options = {}) {
    if (!work) return 'Referência não informada.';

    // Normaliza Autor para "SOBRENOME, Nome"
    let formattedAuthor = work.author || 'AUTOR NÃO INFORMADO';
    const authorParts = formattedAuthor.trim().split(/\s+/);
    if (authorParts.length > 1) {
      const lastName = authorParts.pop().toUpperCase();
      const firstNames = authorParts.join(' ');
      formattedAuthor = `${lastName}, ${firstNames}`;
    } else {
      formattedAuthor = formattedAuthor.toUpperCase();
    }

    const title = work.title || 'Título não informado';
    const edition = work.edition ? `${work.edition}. ` : '';
    const city = work.city ? `${work.city}: ` : (work.publisher ? '[S.l.]: ' : '');
    const publisher = work.publisher ? `${work.publisher}, ` : '';
    const year = work.year ? `${work.year}.` : '[s.d.].';
    const page = options.page ? ` p. ${options.page}.` : '';

    return `${formattedAuthor}. **${title}**. ${edition}${city}${publisher}${year}${page}`;
  }

  /**
   * Formata uma citação no texto no padrão autor-data: (DINIZ, 2023, p. 115)
   */
  static formatInTextCitation(work, quote = null) {
    if (!work) return '';
    const authorParts = (work.author || 'AUTOR').trim().split(/\s+/);
    const lastName = authorParts[authorParts.length - 1].toUpperCase();
    const year = work.year || 's.d.';
    const page = (quote && quote.printedPage) ? `, p. ${quote.printedPage}` : '';

    return `(${lastName}, ${year}${page})`;
  }
}

if (typeof window !== 'undefined') {
  window.AcademicReferenceValidator = AcademicReferenceValidator;
  window.BibliographyService = BibliographyService;
}

if (typeof module !== 'undefined') {
  module.exports = { AcademicReferenceValidator, BibliographyService };
}
