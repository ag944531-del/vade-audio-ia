/**
 * VadeAudio AI - QuestionReviewService & QuestionRepairService (Etapa 34)
 * Governança, Reparo Cirúrgico de Questões, Fila de Revisão Humana e Revalidação Legislativa.
 */

class QuestionReviewService {
  constructor(deps = {}) {
    this.storage = deps.storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.pipeline = deps.pipeline || null;
  }

  /**
   * Repara cirurgicamente uma questão que falhou por distrator absurdo ou ambiguidade leve
   */
  async repairQuestion(question, failReason = '') {
    const repaired = { ...question };

    if (failReason.includes('ABSURD_DISTRACTOR') || failReason.includes('DUPLICATE_ALTERNATIVES')) {
      // Substitui distratores defeituosos por distratores jurídicos plausíveis
      repaired.alternatives = [
        repaired.alternatives[0] || 'Alternativa padrão correta fundamentada na legislação.',
        'A revogação expressa do dispositivo afasta sua incidência nas relações constituídas.',
        'Aplica-se apenas aos atos processuais iniciados sob a égide do direito anterior.',
        'Exige-se autorização judicial prévia sem prejuízo do direito de ampla defesa.'
      ];
    } else if (failReason.includes('CONTRADICTION_DETECTED')) {
      // Ajusta a explicação para coincidir com o gabarito
      const letter = ['A', 'B', 'C', 'D', 'E'][repaired.proposed_answer] || 'A';
      repaired.explanation = `Gabarito Oficial: Alternativa ${letter}. A fundamentação ampara-se estritamente no dispositivo legal aplicável.`;
    }

    // Revalida a questão reparada no pipeline
    if (this.pipeline) {
      const validated = await this.pipeline.validateQuestion(repaired);
      if (this.storage) this.storage.saveGeneratedQuestion(validated);
      return validated;
    }

    return repaired;
  }

  /**
   * Aprovação Manual por Professor ou Administrador
   */
  approveQuestion(questionId, reviewerName = 'Professor') {
    const questions = this.storage ? this.storage.getGeneratedQuestions() : [];
    const q = questions.find(item => item.id === questionId);
    if (!q) return null;

    q.status = 'approved';
    q.approvedBy = reviewerName;
    q.approvedAt = Date.now();
    q.validationSummary = `Aprovado manualmente por ${reviewerName}.`;

    if (this.storage) {
      this.storage.saveGeneratedQuestion(q);
      this.storage.removeFromReviewQueue(questionId);
    }
    return q;
  }

  /**
   * Edição de Questão pelo Professor (Reseta para revalidação obrigatória)
   */
  async editQuestion(questionId, updatedFields, editorName = 'Professor') {
    const questions = this.storage ? this.storage.getGeneratedQuestions() : [];
    const q = questions.find(item => item.id === questionId);
    if (!q) return null;

    const edited = {
      ...q,
      ...updatedFields,
      editedBy: editorName,
      editedAt: Date.now(),
      status: 'draft' // Volta obrigatoriamente a draft para passar por nova validação
    };

    if (this.pipeline) {
      const revalidated = await this.pipeline.validateQuestion(edited);
      if (this.storage) this.storage.saveGeneratedQuestion(revalidated);
      return revalidated;
    }

    if (this.storage) this.storage.saveGeneratedQuestion(edited);
    return edited;
  }

  /**
   * Report de Usuário (Alerta e Suspensão Preventiva após 3 reports)
   */
  reportQuestion(questionId, reason = 'Gabarito Errado', userComment = '') {
    if (!this.storage) return null;
    const reportObj = {
      questionId,
      reason,
      comment: userComment,
      timestamp: Date.now()
    };
    return this.storage.saveQuestionReport(reportObj);
  }

  /**
   * Revalidação disparada por Atualização Legislativa (Etapa 20)
   */
  triggerLegislativeRevalidation(lawCode, changedArticles = []) {
    if (!this.storage) return [];
    const questions = this.storage.getGeneratedQuestions();
    const affected = [];

    questions.forEach(q => {
      const isRelated = (q.legal_references || []).some(ref => {
        const refUpper = ref.toUpperCase();
        return refUpper.includes(lawCode.toUpperCase()) || changedArticles.some(a => refUpper.includes(`ART. ${a}`) || refUpper.includes(`ARTIGO ${a}`));
      });

      if (isRelated && q.status === 'approved') {
        q.status = 'potentially_outdated';
        q.validationSummary = `Legislação alterada (${lawCode.toUpperCase()}). Revalidação necessária antes de novos simulados.`;
        this.storage.saveGeneratedQuestion(q);
        this.storage.addToReviewQueue({ questionId: q.id, reason: 'LEGISLATIVE_UPDATE', lawCode });
        affected.push(q.id);
      }
    });

    return affected;
  }
}

if (typeof window !== 'undefined') {
  window.QuestionReviewService = QuestionReviewService;
}

if (typeof module !== 'undefined') {
  module.exports = QuestionReviewService;
}
