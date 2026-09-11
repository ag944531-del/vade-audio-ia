/**
 * VadeAudio AI - Serviço Central de Entitlements & Contabilidade de Uso (Etapa 13)
 * Catálogo de Planos (Free, Pro Mensal, Pro Anual), Controle de Cotas,
 * Reserva Prévia de Uso e Validação de Feature Flags.
 */

const PLANS_CATALOG = {
  free: {
    planId: 'free',
    name: 'VadeAudio Gratuito',
    price: 0,
    currency: 'BRL',
    billingInterval: 'month',
    features: {
      ai_tutor: { allowed: true, limit: 15, unit: 'mensagens/mês' },
      neural_audio: { allowed: true, limit: 10000, unit: 'caracteres/mês' },
      class_transcription: { allowed: true, limit: 15, unit: 'minutos/mês' },
      document_analysis: { allowed: true, limit: 5, unit: 'páginas/mês' },
      smart_research: { allowed: true, limit: 3, unit: 'projetos' },
      practice_lab: { allowed: true, limit: 2, unit: 'casos' }
    }
  },
  pro_monthly: {
    planId: 'pro_monthly',
    name: 'VadeAudio Pro Mensal',
    price: 49.90,
    currency: 'BRL',
    billingInterval: 'month',
    features: {
      ai_tutor: { allowed: true, limit: 500, unit: 'mensagens/mês' },
      neural_audio: { allowed: true, limit: 200000, unit: 'caracteres/mês' },
      class_transcription: { allowed: true, limit: 300, unit: 'minutos/mês' },
      document_analysis: { allowed: true, limit: 100, unit: 'páginas/mês' },
      smart_research: { allowed: true, limit: 9999, unit: 'ilimitado' },
      practice_lab: { allowed: true, limit: 9999, unit: 'ilimitado' }
    }
  },
  pro_yearly: {
    planId: 'pro_yearly',
    name: 'VadeAudio Pro Anual',
    price: 399.90,
    currency: 'BRL',
    discountPercent: 33,
    billingInterval: 'year',
    features: {
      ai_tutor: { allowed: true, limit: 500, unit: 'mensagens/mês' },
      neural_audio: { allowed: true, limit: 200000, unit: 'caracteres/mês' },
      class_transcription: { allowed: true, limit: 300, unit: 'minutos/mês' },
      document_analysis: { allowed: true, limit: 100, unit: 'páginas/mês' },
      smart_research: { allowed: true, limit: 9999, unit: 'ilimitado' },
      practice_lab: { allowed: true, limit: 9999, unit: 'ilimitado' }
    }
  }
};

class EntitlementService {
  constructor() {
    this.activeReservations = new Map(); // Controle em memória de reservas ativas
  }

  // --------------------------------------------------------------------------
  // Consulta de Permissão & Limites
  // --------------------------------------------------------------------------
  getUserPlan() {
    const sub = StorageModule.getSubscriptionData();
    const planKey = sub.planId.startsWith('pro') ? sub.planId : 'free';
    return PLANS_CATALOG[planKey] || PLANS_CATALOG.free;
  }

  isProUser() {
    const sub = StorageModule.getSubscriptionData();
    return sub.status === 'active' && sub.planId.startsWith('pro');
  }

  canUseFeature(featureId) {
    const plan = this.getUserPlan();
    const feat = plan.features[featureId];
    if (!feat || !feat.allowed) return false;

    const remaining = this.getRemainingUsage(featureId);
    return remaining > 0;
  }

  getFeatureLimit(featureId) {
    const plan = this.getUserPlan();
    return plan.features[featureId]?.limit || 0;
  }

  getRemainingUsage(featureId) {
    const limit = this.getFeatureLimit(featureId);
    const usage = StorageModule.getUsageRecords();

    let used = 0;
    if (featureId === 'ai_tutor') used = usage.tutorMessagesUsed;
    if (featureId === 'neural_audio') used = usage.audioCharsUsed;
    if (featureId === 'class_transcription') used = usage.transcriptionMinutesUsed;
    if (featureId === 'document_analysis') used = usage.documentsPagesUsed;

    return Math.max(0, limit - used);
  }

  // --------------------------------------------------------------------------
  // Gestão de Reserva e Commit de Uso
  // --------------------------------------------------------------------------
  reserveUsage(featureId, estimatedAmount = 1) {
    const remaining = this.getRemainingUsage(featureId);
    if (remaining < estimatedAmount) {
      return {
        allowed: false,
        reason: `Limite de ${featureId} atingido (${remaining} restantes, estimado ${estimatedAmount}).`
      };
    }
    const reservationKey = `${featureId}-${Date.now()}`;
    this.activeReservations.set(reservationKey, { featureId, amount: estimatedAmount });
    return { allowed: true, reservationKey };
  }

  commitUsage(featureId, actualAmount = 1, reservationKey = null) {
    if (reservationKey) this.activeReservations.delete(reservationKey);

    const usage = StorageModule.getUsageRecords();
    if (featureId === 'ai_tutor') usage.tutorMessagesUsed += actualAmount;
    if (featureId === 'neural_audio') usage.audioCharsUsed += actualAmount;
    if (featureId === 'class_transcription') usage.transcriptionMinutesUsed += actualAmount;
    if (featureId === 'document_analysis') usage.documentsPagesUsed += actualAmount;

    StorageModule.saveUsageRecords(usage);
    return usage;
  }

  releaseReservation(reservationKey) {
    if (reservationKey) this.activeReservations.delete(reservationKey);
  }

  isFeatureFlagEnabled(flagKey) {
    const flags = StorageModule.getFeatureFlags();
    return flags[flagKey] !== false;
  }
}
