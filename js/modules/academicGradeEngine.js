/**
 * VadeAudio AI - Central Inteligente de Notas, Médias e Estratégia Acadêmica (Etapa 30)
 * Motor determinístico de regras de notas, cálculo reverso de 'Quanto preciso tirar?',
 * simulador de cenários, matriz de risco acadêmico, controle de frequência e transparência auditável.
 */

class AcademicGradeRuleEngine {
  static calculateSubjectGrade(subjectRule, grades) {
    if (!subjectRule || !grades) return { currentAverage: null, isPartial: true, steps: 'Regra não configurada.' };

    const type = subjectRule.type || 'weighted'; // 'weighted' | 'arithmetic' | 'points_sum'

    if (type === 'weighted') {
      const p1 = grades.p1 !== undefined ? grades.p1 : null;
      const p2 = grades.p2 !== undefined ? grades.p2 : null;
      const w1 = subjectRule.weights?.p1 || 4;
      const w2 = subjectRule.weights?.p2 || 6;
      const totalWeight = w1 + w2;

      if (p1 !== null && p2 !== null) {
        const totalPoints = (p1 * w1) + (p2 * w2);
        const avg = Math.round((totalPoints / totalWeight) * 100) / 100;
        return {
          currentAverage: avg,
          isPartial: false,
          steps: `(${p1} × peso ${w1} = ${p1 * w1}) + (${p2} × peso ${w2} = ${p2 * w2}) = ${totalPoints} ÷ ${totalWeight} = ${avg}`
        };
      } else if (p1 !== null) {
        return {
          currentAverage: p1,
          isPartial: true,
          steps: `Nota parcial da P1: ${p1} (peso ${w1}). P2 pendente de lançamento (peso ${w2}).`
        };
      }
    } else if (type === 'arithmetic') {
      const validGrades = Object.values(grades).filter(g => g !== null && g !== undefined);
      if (validGrades.length === 0) return { currentAverage: null, isPartial: true, steps: 'Nenhuma nota lançada.' };

      const sum = validGrades.reduce((a, b) => a + b, 0);
      const avg = Math.round((sum / validGrades.length) * 100) / 100;
      return {
        currentAverage: avg,
        isPartial: validGrades.length < (subjectRule.expectedAssessmentsCount || 2),
        steps: `Soma das notas (${validGrades.join(' + ')}) = ${sum} ÷ ${validGrades.length} = ${avg}`
      };
    }

    return { currentAverage: null, isPartial: true, steps: 'Aguardando notas.' };
  }
}

class RequiredGradeCalculator {
  static calculateRequiredGrade(subjectRule, currentGrades, targetAverage = 6.0) {
    const w1 = subjectRule.weights?.p1 || 4;
    const w2 = subjectRule.weights?.p2 || 6;
    const totalWeight = w1 + w2;
    const p1 = currentGrades.p1 !== undefined ? currentGrades.p1 : 0;

    // Fórmula: Target = (P1*w1 + P2*w2) / totalWeight -> P2 = (Target*totalWeight - P1*w1) / w2
    const targetPoints = targetAverage * totalWeight;
    const currentPoints = p1 * w1;
    const neededPoints = targetPoints - currentPoints;
    const requiredP2 = Math.round((neededPoints / w2) * 100) / 100;

    if (requiredP2 > 10.0) {
      return {
        requiredGrade: requiredP2,
        isPossible: false,
        isGuaranteed: false,
        message: `Com as regras cadastradas, você precisaria de ${requiredP2} na P2, o que ultrapassa a nota máxima da prova (10.0). Será necessária prova final/recuperação.`
      };
    } else if (requiredP2 <= 0.0) {
      return {
        requiredGrade: 0.0,
        isPossible: true,
        isGuaranteed: true,
        message: 'Parabéns! Sua aprovação já está garantida com média mínima mesmo se obtiver nota zero na P2.'
      };
    }

    return {
      requiredGrade: requiredP2,
      isPossible: true,
      isGuaranteed: false,
      message: `Você precisa de pelo menos ${requiredP2} na P2 para atingir a média ${targetAverage}.`
    };
  }
}

class AcademicRiskEngine {
  static evaluateSubjectRisk(subjectData) {
    const p1 = subjectData.grades?.p1;
    const days = subjectData.daysUntilExam !== undefined ? subjectData.daysUntilExam : 30;
    const mastery = subjectData.masteryPercent !== undefined ? subjectData.masteryPercent : 70;

    if (p1 !== null && p1 !== undefined && p1 < 5.0 && days <= 15) {
      return {
        level: 'critical',
        badgeText: 'Situação Crítica',
        badgeColor: '#ef4444',
        explanation: 'Nota da P1 abaixo da média e prova próxima. Alta prioridade de estudo.'
      };
    } else if (p1 !== null && p1 !== undefined && p1 < 6.5) {
      return {
        level: 'attention',
        badgeText: 'Atenção',
        badgeColor: '#f59e0b',
        explanation: 'Exige bom desempenho na P2 para fechamento da média sem recuperação.'
      };
    }

    return {
      level: 'comfortable',
      badgeText: 'Acima da Média',
      badgeColor: '#10b981',
      explanation: 'Desempenho acadêmico confortável e dentro da margem de segurança.'
    };
  }
}

class AttendanceTracker {
  static calculateAttendance(totalClasses = 40, missedClasses = 4, minPercent = 75) {
    const attended = totalClasses - missedClasses;
    const currentPercent = Math.round((attended / totalClasses) * 100);
    const maxAllowedMisses = Math.floor(totalClasses * (1 - (minPercent / 100)));
    const remainingMisses = Math.max(0, maxAllowedMisses - missedClasses);

    return {
      totalClasses,
      missedClasses,
      currentPercent,
      minRequiredPercent: minPercent,
      maxAllowedMisses,
      remainingMisses,
      status: currentPercent >= minPercent ? 'regular' : 'risk'
    };
  }
}

class AcademicGradeService {
  constructor(authService, audioEngine, voiceProfessor) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.voiceProfessor = voiceProfessor;
    this.disciplinesData = [
      {
        id: 'disc_penal',
        name: 'Direito Penal II',
        professor: 'Prof. Dr. Nelson Hungria',
        rule: { type: 'weighted', weights: { p1: 4, p2: 6 }, passingGrade: 6.0 },
        grades: { p1: 5.0, p2: null },
        daysUntilExam: 6,
        masteryPercent: 48,
        attendance: { totalClasses: 40, missedClasses: 4 }
      },
      {
        id: 'disc_proc_civil',
        name: 'Direito Processual Civil',
        professor: 'Profa. Dra. Ada Pellegrini',
        rule: { type: 'weighted', weights: { p1: 5, p2: 5 }, passingGrade: 6.0 },
        grades: { p1: 7.5, p2: null },
        daysUntilExam: 20,
        masteryPercent: 72,
        attendance: { totalClasses: 40, missedClasses: 2 }
      },
      {
        id: 'disc_const',
        name: 'Direito Constitucional',
        professor: 'Prof. Dr. Michel Temer',
        rule: { type: 'weighted', weights: { p1: 4, p2: 6 }, passingGrade: 6.0 },
        grades: { p1: 8.5, p2: 7.5 },
        daysUntilExam: 35,
        masteryPercent: 85,
        attendance: { totalClasses: 40, missedClasses: 1 }
      }
    ];
  }

  getDashboardSummary() {
    const list = this.disciplinesData.map(d => {
      const gradeRes = AcademicGradeRuleEngine.calculateSubjectGrade(d.rule, d.grades);
      const reqRes = RequiredGradeCalculator.calculateRequiredGrade(d.rule, d.grades, d.rule.passingGrade);
      const riskRes = AcademicRiskEngine.evaluateSubjectRisk(d);
      const attRes = AttendanceTracker.calculateAttendance(d.attendance.totalClasses, d.attendance.missedClasses);

      return {
        ...d,
        calculatedGrade: gradeRes,
        requiredGradeInfo: reqRes,
        risk: riskRes,
        attendanceInfo: attRes
      };
    });

    return list;
  }
}

window.AcademicGradeRuleEngine = AcademicGradeRuleEngine;
window.RequiredGradeCalculator = RequiredGradeCalculator;
window.AcademicRiskEngine = AcademicRiskEngine;
window.AttendanceTracker = AttendanceTracker;
window.AcademicGradeService = AcademicGradeService;
