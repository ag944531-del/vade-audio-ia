/**
 * VadeAudio AI - ProceduralDeadlineEngine & Deterministic Analyzers (Etapa 39)
 * Motor Puro e Determinístico de Prazos Processuais Brasileiros (CPC, CLT, CPP).
 * A IA NUNCA CALCULA O PRAZO SOZINHA: O motor determinístico é a fonte de verdade absoluta.
 */

class ProceduralDeadlineRuleCatalog {
  static getRules() {
    return [
      {
        id: 'cpc_recurso_geral',
        name: 'Recurso em Geral / Apelação / Agravo Cível',
        area: 'civil',
        deadlineLength: 15,
        unit: 'dias_úteis',
        isBusinessDays: true,
        legalBasis: 'Art. 219 e Art. 1.003, § 5º do CPC/2015',
        startRule: 'Exclui o dia do começo e inclui o do vencimento (Art. 224 CPC)'
      },
      {
        id: 'cpc_embargos_declaracao',
        name: 'Embargos de Declaração Cível',
        area: 'civil',
        deadlineLength: 5,
        unit: 'dias_úteis',
        isBusinessDays: true,
        legalBasis: 'Art. 1.023 do CPC/2015',
        startRule: 'Exclui o dia do começo e inclui o do vencimento (Art. 224 CPC)'
      },
      {
        id: 'cpc_contestacao',
        name: 'Contestação Cível',
        area: 'civil',
        deadlineLength: 15,
        unit: 'dias_úteis',
        isBusinessDays: true,
        legalBasis: 'Art. 219 e Art. 335 do CPC/2015',
        startRule: 'Contagem da juntada do mandado/AR ou da audiência de conciliação'
      },
      {
        id: 'clt_recurso_ordinario',
        name: 'Recurso Ordinário Trabalhista',
        area: 'trabalhista',
        deadlineLength: 8,
        unit: 'dias_úteis',
        isBusinessDays: true,
        legalBasis: 'Art. 775 e Art. 895 da CLT',
        startRule: 'Contagem em dias úteis a partir da notificação/publicação'
      },
      {
        id: 'cpp_apelacao_penal',
        name: 'Apelação Criminal',
        area: 'penal',
        deadlineLength: 5,
        unit: 'dias_corridos',
        isBusinessDays: false,
        legalBasis: 'Art. 593 e Art. 798 do CPP',
        startRule: 'Contagem contínua e peremptória em dias corridos'
      },
      {
        id: 'cpp_resposta_acusacao',
        name: 'Resposta à Acusação Criminal',
        area: 'penal',
        deadlineLength: 10,
        unit: 'dias_corridos',
        isBusinessDays: false,
        legalBasis: 'Art. 396 do CPP',
        startRule: 'Contagem contínua a partir da citação pessoal'
      }
    ];
  }

  static findRule(ruleId) {
    return this.getRules().find(r => r.id === ruleId) || this.getRules()[0];
  }
}

class LegalBusinessDayService {
  /**
   * Feriados Nacionais Fixos e Recessos Oficiais Brasileiros
   */
  static getNationalHolidays(year = 2026) {
    return [
      `${year}-01-01`, // Confraternização Universal
      `${year}-04-21`, // Tiradentes
      `${year}-05-01`, // Dia do Trabalho
      `${year}-09-07`, // Independência do Brasil
      `${year}-10-12`, // Nossa Senhora Aparecida
      `${year}-11-02`, // Finados
      `${year}-11-15`, // Proclamação da República
      `${year}-11-20`, // Dia da Consciência Negra
      `${year}-12-25`  // Natal
    ];
  }

  /**
   * Recesso Forense Nacional do Art. 220 do CPC (20 de dezembro a 20 de janeiro)
   */
  static isRecessoForense(dateObj) {
    const month = dateObj.getMonth(); // 0-indexed: 11 = dez, 0 = jan
    const day = dateObj.getDate();
    if (month === 11 && day >= 20) return true;
    if (month === 0 && day <= 20) return true;
    return false;
  }

  /**
   * Verifica se uma data é dia útil forense
   */
  static isBusinessDay(dateObj, customHolidays = []) {
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 6 = Sábado
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    if (this.isRecessoForense(dateObj)) return false;

    const isoDate = dateObj.toISOString().split('T')[0];
    const national = this.getNationalHolidays(dateObj.getFullYear());

    if (national.includes(isoDate)) return false;
    if (customHolidays.includes(isoDate)) return false;

    return true;
  }

  /**
   * Encontra o próximo dia útil a partir de uma data de referência
   */
  static getNextBusinessDay(dateObj, customHolidays = []) {
    const next = new Date(dateObj.getTime());
    next.setDate(next.getDate() + 1);
    while (!this.isBusinessDay(next, customHolidays)) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
}

class DeadlineTriggerResolver {
  /**
   * Resolve o termo inicial (dies a quo) aplicando o Art. 224 do CPC
   */
  static resolveStartTerm(triggerDateStr, isDjePublication = false, customHolidays = []) {
    const triggerDate = new Date(triggerDateStr + 'T12:00:00');
    let effectivePublicationDate = triggerDate;

    // Se for disponibilização no DJe, considera-se publicado no primeiro dia útil seguinte
    if (isDjePublication) {
      effectivePublicationDate = LegalBusinessDayService.getNextBusinessDay(triggerDate, customHolidays);
    }

    // O termo inicial (começo da contagem) é o primeiro dia útil após a publicação
    const countStartDate = LegalBusinessDayService.getNextBusinessDay(effectivePublicationDate, customHolidays);

    return {
      triggerDate,
      effectivePublicationDate,
      countStartDate
    };
  }
}

class DeadlineCountingEngine {
  /**
   * Executa a contagem pura e determinística dia a dia
   */
  static calculate(params) {
    const {
      ruleId = 'cpc_recurso_geral',
      triggerDateStr = '2026-08-10',
      isDjePublication = false,
      customHolidays = [],
      suspensions = []
    } = params;

    const rule = ProceduralDeadlineRuleCatalog.findRule(ruleId);
    const triggerResolved = DeadlineTriggerResolver.resolveStartTerm(triggerDateStr, isDjePublication, customHolidays);

    const steps = [];
    let currentDate = new Date(triggerResolved.countStartDate.getTime());
    let daysCounted = 0;
    const targetDays = rule.deadlineLength;
    const isBusiness = rule.isBusinessDays;

    steps.push({
      date: triggerResolved.triggerDate.toISOString().split('T')[0],
      type: 'trigger',
      label: 'Evento / Intimação (Dia do Começo - Excluído conforme Art. 224 CPC)'
    });

    if (isDjePublication) {
      steps.push({
        date: triggerResolved.effectivePublicationDate.toISOString().split('T')[0],
        type: 'dje_publication',
        label: 'Publicação Efetiva no DJe (1º dia útil após disponibilização)'
      });
    }

    while (daysCounted < targetDays) {
      const isoStr = currentDate.toISOString().split('T')[0];
      const isBiz = LegalBusinessDayService.isBusinessDay(currentDate, customHolidays);
      const isSuspended = suspensions.includes(isoStr);

      if (isBusiness) {
        if (isBiz && !isSuspended) {
          daysCounted++;
          steps.push({
            date: isoStr,
            dayNumber: daysCounted,
            type: 'counted_day',
            label: `${daysCounted}º dia útil contado`
          });
        } else {
          steps.push({
            date: isoStr,
            type: isSuspended ? 'suspension' : 'non_business_day',
            label: isSuspended ? 'Dia Suspenso' : (currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'Fim de Semana' : 'Feriado / Recesso')
          });
        }
      } else {
        // Prazo em dias corridos (Penal - Art. 798 CPP)
        daysCounted++;
        steps.push({
          date: isoStr,
          dayNumber: daysCounted,
          type: 'counted_day',
          label: `${daysCounted}º dia corrido contado`
        });
      }

      if (daysCounted < targetDays) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Se no prazo penal (dias corridos) o vencimento cair em dia não útil, prorroga-se (Art. 798, § 3º CPP)
    let finalExpirationDate = new Date(currentDate.getTime());
    if (!LegalBusinessDayService.isBusinessDay(finalExpirationDate, customHolidays)) {
      const origIso = finalExpirationDate.toISOString().split('T')[0];
      finalExpirationDate = LegalBusinessDayService.getNextBusinessDay(finalExpirationDate, customHolidays);
      steps.push({
        date: finalExpirationDate.toISOString().split('T')[0],
        type: 'prorogation',
        label: `Vencimento original (${origIso}) caiu em dia não útil. Prorrogado para o 1º dia útil subsequente (Art. 224, § 1º CPC / Art. 798, § 3º CPP)`
      });
    }

    const expirationIso = finalExpirationDate.toISOString().split('T')[0];

    return {
      ruleUsed: rule,
      triggerDate: triggerDateStr,
      countStartDate: triggerResolved.countStartDate.toISOString().split('T')[0],
      deadlineEndDate: expirationIso,
      daysCounted,
      calculationSteps: steps,
      summary: `Prazo de ${rule.deadlineLength} ${rule.unit} (${rule.legalBasis}). Marco inicial: ${triggerDateStr}. Início da contagem: ${triggerResolved.countStartDate.toISOString().split('T')[0]}. Vencimento final: ${expirationIso}.`
    };
  }
}

class DeadlineErrorAnalyzer {
  /**
   * Compara a resposta do aluno com a resposta calculada pelo motor determinístico
   */
  static analyzeError(studentDateStr, correctCalculation) {
    if (studentDateStr === correctCalculation.deadlineEndDate) {
      return { isCorrect: true, message: 'Parabéns! Sua contagem de prazo está perfeita e em total conformidade com a legislação processual.' };
    }

    const studentDate = new Date(studentDateStr + 'T12:00:00');
    const correctDate = new Date(correctCalculation.deadlineEndDate + 'T12:00:00');
    const diffDays = Math.round((studentDate - correctDate) / (1000 * 60 * 60 * 24));

    let errorCategory = 'ERRO_GENERICO';
    let explanation = '';

    if (diffDays < 0) {
      if (studentDateStr === correctCalculation.countStartDate) {
        errorCategory = 'CONTOU_APENAS_INICIO';
        explanation = 'Você indicou a data de início da contagem como se fosse o dia do vencimento.';
      } else {
        errorCategory = 'CONTAGEM_ANTECIPADA_OU_FIM_DE_SEMANA';
        explanation = 'Seu prazo venceu antes da data legal. Provavelmente você incluiu o dia da intimação na contagem ou contou fins de semana em prazo civil.';
      }
    } else {
      errorCategory = 'CONTAGEM_TARDIA';
      explanation = 'Seu prazo venceu após a data legal. Verifique se você adicionou dias de suspensão inexistentes.';
    }

    return {
      isCorrect: false,
      studentDate: studentDateStr,
      correctDate: correctCalculation.deadlineEndDate,
      errorCategory,
      explanation,
      legalRule: correctCalculation.ruleUsed.legalBasis
    };
  }
}

if (typeof window !== 'undefined') {
  window.ProceduralDeadlineRuleCatalog = ProceduralDeadlineRuleCatalog;
  window.LegalBusinessDayService = LegalBusinessDayService;
  window.DeadlineTriggerResolver = DeadlineTriggerResolver;
  window.DeadlineCountingEngine = DeadlineCountingEngine;
  window.DeadlineErrorAnalyzer = DeadlineErrorAnalyzer;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ProceduralDeadlineRuleCatalog,
    LegalBusinessDayService,
    DeadlineTriggerResolver,
    DeadlineCountingEngine,
    DeadlineErrorAnalyzer
  };
}
