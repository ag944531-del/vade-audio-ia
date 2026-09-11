/**
 * VadeAudio AI - JurisprudenceRelationService, StatusService & TimelineBuilder (Etapa 36)
 * Gestão de Status (Vigente, Superado, Cancelado), Linha do Tempo e Comparador STF x STJ.
 */

class JurisprudenceStatusService {
  static getStatusBadge(status) {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'vigente':
        return { label: 'Vigente', color: '#10b981', icon: 'fa-circle-check' };
      case 'superado':
        return { label: 'Superado (Overruling)', color: '#ef4444', icon: 'fa-ban' };
      case 'cancelado':
        return { label: 'Cancelada', color: '#ef4444', icon: 'fa-xmark' };
      case 'alterado':
        return { label: 'Alterado', color: '#f59e0b', icon: 'fa-rotate' };
      case 'pendente':
        return { label: 'Julgamento Pendente', color: '#38bdf8', icon: 'fa-clock' };
      default:
        return { label: 'Status Não Determinado', color: '#94a3b8', icon: 'fa-circle-question' };
    }
  }
}

class JurisprudenceTimelineBuilder {
  /**
   * Constrói linha do tempo cronológica para um tópico ou grupo de julgados
   */
  static buildTimeline(topicOrItems, database = []) {
    let items = [];
    if (Array.isArray(topicOrItems)) {
      items = topicOrItems;
    } else if (typeof topicOrItems === 'string') {
      items = database.filter(j => (j.topic || '').toLowerCase().includes(topicOrItems.toLowerCase()));
    }

    // Ordena cronologicamente por data de julgamento
    const sorted = [...items].sort((a, b) => new Date(a.judgment_date || '1970-01-01') - new Date(b.judgment_date || '1970-01-01'));

    return sorted.map((item, index) => ({
      step: index + 1,
      year: item.judgment_date ? item.judgment_date.substring(0, 4) : 'Data n/d',
      date: item.judgment_date,
      title: item.title,
      court: item.court,
      thesis: item.official_thesis,
      status: item.status,
      type: item.type
    }));
  }
}

class JurisprudenceComparator {
  /**
   * Compara entendimentos entre dois precedentes ou entre STF e STJ
   */
  static compare(itemA, itemB) {
    if (!itemA || !itemB) return null;

    const areSameCourt = itemA.court === itemB.court;
    const isConflict = itemA.official_thesis !== itemB.official_thesis;

    return {
      title: `Comparação: ${itemA.court} (${itemA.number || itemA.title}) × ${itemB.court} (${itemB.number || itemB.title})`,
      courtA: itemA.court,
      courtB: itemB.court,
      thesisA: itemA.official_thesis,
      thesisB: itemB.official_thesis,
      statusA: itemA.status,
      statusB: itemB.status,
      dateA: itemA.judgment_date,
      dateB: itemB.judgment_date,
      relationship: areSameCourt ? (isConflict ? 'Evolução / Possível Superação' : 'Confirmação / Reiteração') : 'Confronto entre Cortes Superiores',
      notes: `Análise comparativa oficial ancorada nos julgados ${itemA.source_id || itemA.id} e ${itemB.source_id || itemB.id}.`
    };
  }
}

if (typeof window !== 'undefined') {
  window.JurisprudenceStatusService = JurisprudenceStatusService;
  window.JurisprudenceTimelineBuilder = JurisprudenceTimelineBuilder;
  window.JurisprudenceComparator = JurisprudenceComparator;
}

if (typeof module !== 'undefined') {
  module.exports = { JurisprudenceStatusService, JurisprudenceTimelineBuilder, JurisprudenceComparator };
}
