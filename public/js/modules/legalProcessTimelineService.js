/**
 * VadeAudio AI - LegalProcessTimelineService (Etapa 39)
 * Construtor e Validador de Linha do Tempo Processual com Vinculação de Prazos.
 */

class LegalProcessTimelineService {
  /**
   * Constrói e ordena cronologicamente a linha do tempo dos atos do processo
   */
  static buildTimeline(events = [], deadlines = []) {
    const combined = [
      ...events.map(e => ({ ...e, isEvent: true, date: e.date })),
      ...deadlines.map(d => ({ ...d, isDeadline: true, date: d.deadlineEndDate || d.date }))
    ];

    // Ordena de forma estritamente cronológica
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Detecta inconsistências lógicas (ex: recurso protocolado antes da decisão)
    const anomalies = [];
    let hasDecision = false;
    let decisionDate = null;

    for (const item of combined) {
      if (item.type === 'decisao' || item.type === 'sentenca') {
        hasDecision = true;
        decisionDate = new Date(item.date);
      }
      if (item.type === 'recurso' && (!hasDecision || new Date(item.date) < decisionDate)) {
        anomalies.push({
          itemId: item.id,
          issue: 'RECURSO_ANTERIOR_A_DECISAO',
          message: 'Recurso registrado em data anterior à prolação/intimação da decisão.'
        });
      }
    }

    return {
      timeline: combined,
      hasAnomalies: anomalies.length > 0,
      anomalies
    };
  }
}

if (typeof window !== 'undefined') {
  window.LegalProcessTimelineService = LegalProcessTimelineService;
}

if (typeof module !== 'undefined') {
  module.exports = { LegalProcessTimelineService };
}
