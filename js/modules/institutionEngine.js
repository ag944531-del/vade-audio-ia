/**
 * VadeAudio AI - Motor Institucional & Programa de Indicação (Etapa 16)
 * Gestão de licenças para faculdades e sistema anti-fraude de convites/referral.
 */

class InstitutionEngine {
  constructor(authService) {
    this.authService = authService;
    this.institutionData = {
      id: 'inst_ufba_direito',
      name: 'Faculdade de Direito da UFBA',
      domain: 'ufba.br',
      seatsTotal: 500,
      seatsUsed: 142,
      plan: 'institutional_enterprise',
      partnerInstitution: true,
      licensedDepartments: ['Direito Penal', 'Direito Civil', 'Direito Constitucional', 'Prática Jurídica']
    };
  }

  getInstitution() {
    return this.institutionData;
  }

  getReferralData() {
    const user = this.authService.getCurrentUser();
    const firstName = user ? user.name.split(' ')[0].toUpperCase() : 'ESTUDANTE';
    const uidSuffix = user ? user.id.slice(-4).toUpperCase() : '2026';
    const referralCode = `VADE-${firstName}-${uidSuffix}`;

    let referrals = [];
    try {
      const stored = localStorage.getItem(`vadeaudio_referrals_${user?.id}`);
      if (stored) {
        referrals = JSON.parse(stored);
      } else {
        referrals = [
          {
            id: 'ref_1',
            email: 'amigo.direito@ufba.br',
            status: 'rewarded',
            reward: '+15 dias Pro',
            date: new Date(Date.now() - 86400000 * 6).toLocaleDateString()
          },
          {
            id: 'ref_2',
            email: 'colega.concurso@usp.br',
            status: 'signed_up',
            reward: 'Pendente (primeira aula)',
            date: new Date(Date.now() - 86400000 * 1).toLocaleDateString()
          }
        ];
        localStorage.setItem(`vadeaudio_referrals_${user?.id}`, JSON.stringify(referrals));
      }
    } catch {}

    return {
      referralCode,
      totalInvited: referrals.length,
      daysEarned: 15,
      referrals
    };
  }

  claimInviteCode(code) {
    const user = this.authService.getCurrentUser();
    const myCode = `VADE-${user ? user.name.split(' ')[0].toUpperCase() : 'ESTUDANTE'}-${user ? user.id.slice(-4).toUpperCase() : '2026'}`;

    if (!code || typeof code !== 'string') {
      throw new Error('Código de indicação inválido.');
    }

    const cleanCode = code.trim().toUpperCase();

    // Regra Anti-Fraude: Auto-indicação proibida
    if (cleanCode === myCode) {
      throw new Error('Regra Anti-Fraude: Você não pode utilizar seu próprio código de indicação.');
    }

    return {
      success: true,
      message: 'Código de indicação validado com sucesso! Você ganhou 7 dias de VadeAudio Pro de cortesia.',
      bonusDays: 7
    };
  }
}

window.InstitutionEngine = InstitutionEngine;
