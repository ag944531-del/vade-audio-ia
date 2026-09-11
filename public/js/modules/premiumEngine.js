/**
 * VadeAudio AI - Motor de Assinaturas, Planos & Painel Administrativo (Etapa 13)
 * Gestão de Planos Free/Pro, Cupons, Barras Visuais de Consumo,
 * Painel Minha Assinatura e Painel Administrativo de Métricas & Cortesias.
 */

class PremiumEngine {
  constructor(audioEngine, playerUI, entitlementService) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.entitlementService = entitlementService;
    this.activeDiscountPercent = 0;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Validação de Cupom de Desconto
    const btnApplyCoupon = document.getElementById('btn-apply-coupon');
    const inputCoupon = document.getElementById('coupon-input');

    if (btnApplyCoupon && inputCoupon) {
      btnApplyCoupon.addEventListener('click', async () => {
        const code = inputCoupon.value.trim();
        if (!code) return;

        try {
          const res = await fetch('/api/billing/coupon/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await res.json();
          if (data.valid) {
            this.activeDiscountPercent = data.discountPercent;
            this.playerUI.showToast(`🎉 Cupom ${data.code} aplicado! ${data.discountPercent}% de desconto.`);
            this.renderPlansView();
          } else {
            this.playerUI.showToast(`❌ ${data.error || 'Cupom inválido.'}`);
          }
        } catch {
          if (code.toUpperCase() === 'VADE20') {
            this.activeDiscountPercent = 20;
            this.playerUI.showToast('🎉 Cupom VADE20 aplicado! 20% de desconto.');
            this.renderPlansView();
          } else {
            this.playerUI.showToast('❌ Cupom inválido ou expirado.');
          }
        }
      });
    }

    // 2. Modais Minha Assinatura & Admin
    const btnOpenSubModal = document.getElementById('btn-open-my-sub');
    const subModal = document.getElementById('my-subscription-modal');
    const btnCloseSubModal = document.getElementById('btn-close-my-sub-modal');

    if (btnOpenSubModal && subModal) {
      btnOpenSubModal.addEventListener('click', () => {
        this.renderMySubscriptionModal();
        subModal.classList.remove('hidden');
      });
    }

    if (btnCloseSubModal && subModal) {
      btnCloseSubModal.addEventListener('click', () => {
        subModal.classList.add('hidden');
      });
    }

    const btnOpenAdminModal = document.getElementById('btn-open-admin-dashboard');
    const adminModal = document.getElementById('admin-dashboard-modal');
    const btnCloseAdminModal = document.getElementById('btn-close-admin-modal');

    if (btnOpenAdminModal && adminModal) {
      btnOpenAdminModal.addEventListener('click', () => {
        this.renderAdminModal();
        adminModal.classList.remove('hidden');
      });
    }

    if (btnCloseAdminModal && adminModal) {
      btnCloseAdminModal.addEventListener('click', () => {
        adminModal.classList.add('hidden');
      });
    }

    // 3. Concessão de Pro Manual pelo Admin
    const btnGrantPro = document.getElementById('btn-admin-grant-pro');
    if (btnGrantPro) {
      btnGrantPro.addEventListener('click', () => {
        const days = parseInt(document.getElementById('admin-grant-days')?.value, 10) || 30;
        StorageModule.saveSubscriptionData({
          planId: 'pro_monthly',
          status: 'active',
          isCourtesy: true,
          courtesyUntil: Date.now() + (days * 86400000)
        });
        StorageModule.saveAdminAuditLog({
          admin: 'Administrador Principal',
          action: `Concessão de Pro Cortesia (${days} dias) para usuário ativo`
        });
        this.playerUI.showToast(`👑 Plano Pro concedido com sucesso por ${days} dias!`);
        this.renderMySubscriptionModal();
        this.renderPlansView();
      });
    }
  }

  // --------------------------------------------------------------------------
  // Renderização da Página de Planos
  // --------------------------------------------------------------------------
  renderPlansView() {
    const isPro = this.entitlementService.isProUser();
    const sub = StorageModule.getSubscriptionData();
    const discount = this.activeDiscountPercent;

    const monthlyPrice = discount > 0 ? (49.90 * (1 - discount / 100)).toFixed(2) : '49,90';
    const yearlyPrice = discount > 0 ? (399.90 * (1 - discount / 100)).toFixed(2) : '399,90';

    const container = document.getElementById('plans-cards-container');
    if (!container) return;

    container.innerHTML = `
      <!-- Card Free -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="badge-official" style="font-size:0.75rem; color:var(--text-muted);">ESSENCIAL</span>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.4rem; margin:8px 0 4px 0;">VadeAudio Gratuito</h3>
          <div style="font-size:1.8rem; font-weight:700; color:var(--text-main); margin-bottom:14px;">
            R$ 0 <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400;">/ sempre</span>
          </div>
          <ul style="list-style:none; padding:0; margin:0 0 20px 0; font-size:0.85rem; line-height:1.8; color:var(--text-muted);">
            <li><i class="fa-solid fa-check text-amber"></i> Vade Mecum Digital Completo</li>
            <li><i class="fa-solid fa-check text-amber"></i> Questões & Flashcards SRS</li>
            <li><i class="fa-solid fa-check text-amber"></i> 15 mensagens no Tutor IA / mês</li>
            <li><i class="fa-solid fa-check text-amber"></i> 10.000 caracteres ElevenLabs / mês</li>
            <li><i class="fa-solid fa-check text-amber"></i> 15 min de Transcrição / mês</li>
          </ul>
        </div>
        <button class="btn-secondary" style="width:100%; padding:10px;" ${!isPro ? 'disabled' : ''}>
          ${!isPro ? '✓ Plano Atual' : 'Voltar para Gratuito'}
        </button>
      </div>

      <!-- Card Pro Mensal -->
      <div style="background:var(--bg-card); border:2px solid var(--border-amber); border-radius:14px; padding:22px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
        <span class="badge-official" style="position:absolute; top:-10px; right:20px; background:var(--accent-amber); color:#000; font-weight:700; font-size:0.75rem;">MAIS POPULAR</span>
        <div>
          <span class="badge-official" style="font-size:0.75rem; color:var(--accent-amber); border-color:var(--accent-amber);">PRO MENSAL</span>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.4rem; margin:8px 0 4px 0;">VadeAudio Pro</h3>
          <div style="font-size:1.8rem; font-weight:700; color:var(--accent-amber); margin-bottom:14px;">
            R$ ${monthlyPrice} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400;">/ mês</span>
          </div>
          <ul style="list-style:none; padding:0; margin:0 0 20px 0; font-size:0.85rem; line-height:1.8; color:var(--text-main);">
            <li><i class="fa-solid fa-circle-check text-amber"></i> <strong>500 mensagens</strong> no Tutor IA / mês</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> <strong>200.000 caracteres</strong> ElevenLabs (Marcos)</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> <strong>300 minutos</strong> de Transcrição de Aulas</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> Pesquisa Acadêmica & TCC Ilimitados</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> Laboratório Jurídico & Simulador Ilimitados</li>
          </ul>
        </div>
        <button class="btn-primary btn-checkout-plan" data-plan="pro_monthly" style="width:100%; padding:12px; font-size:0.92rem;">
          ${isPro && sub.planId === 'pro_monthly' ? '✓ Assinatura Ativa' : 'Assinar Pro Mensal'}
        </button>
      </div>

      <!-- Card Pro Anual -->
      <div style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(13,16,24,0.98)); border:1px solid var(--border-amber); border-radius:14px; padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="badge-official" style="font-size:0.75rem; color:#10b981; border-color:#10b981;">ECONOMIZE 33%</span>
          <h3 style="font-family:var(--font-display); color:var(--text-main); font-size:1.4rem; margin:8px 0 4px 0;">VadeAudio Pro Anual</h3>
          <div style="font-size:1.8rem; font-weight:700; color:var(--text-main); margin-bottom:14px;">
            R$ ${yearlyPrice} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400;">/ ano</span>
          </div>
          <p style="font-size:0.8rem; color:var(--accent-amber); margin-bottom:12px;">Equivalente a R$ 33,32/mês faturado anualmente.</p>
          <ul style="list-style:none; padding:0; margin:0 0 20px 0; font-size:0.85rem; line-height:1.8; color:var(--text-main);">
            <li><i class="fa-solid fa-circle-check text-amber"></i> Todos os benefícios do Pro Mensal</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> Acesso antecipado a novos recursos IA</li>
            <li><i class="fa-solid fa-circle-check text-amber"></i> Suporte prioritário por WhatsApp/Email</li>
          </ul>
        </div>
        <button class="btn-primary btn-checkout-plan" data-plan="pro_yearly" style="width:100%; padding:12px; font-size:0.92rem; background:linear-gradient(135deg, #10b981, #059669);">
          ${isPro && sub.planId === 'pro_yearly' ? '✓ Assinatura Ativa' : 'Assinar Pro Anual'}
        </button>
      </div>
    `;

    container.querySelectorAll('.btn-checkout-plan').forEach(b => {
      b.addEventListener('click', () => {
        const plan = b.dataset.plan;
        this.triggerCheckout(plan);
      });
    });
  }

  triggerCheckout(planId) {
    StorageModule.saveSubscriptionData({
      planId,
      status: 'active',
      currentPeriodEnd: Date.now() + (planId === 'pro_yearly' ? 365 : 30) * 86400000
    });
    this.playerUI.showToast(`🎉 Assinatura ${planId === 'pro_yearly' ? 'Pro Anual' : 'Pro Mensal'} ativada com sucesso!`);
    this.renderPlansView();
    this.renderMySubscriptionModal();
  }

  // --------------------------------------------------------------------------
  // Modal Minha Assinatura com Barras Visuais de Consumo
  // --------------------------------------------------------------------------
  renderMySubscriptionModal() {
    const sub = StorageModule.getSubscriptionData();
    const usage = StorageModule.getUsageRecords();
    const plan = this.entitlementService.getUserPlan();

    const planNameEl = document.getElementById('my-sub-plan-name');
    const statusEl = document.getElementById('my-sub-status');
    const renewalEl = document.getElementById('my-sub-renewal-date');

    if (planNameEl) planNameEl.innerText = plan.name;
    if (statusEl) statusEl.innerText = sub.isCourtesy ? 'Cortesia Pro Ativa' : sub.status.toUpperCase();
    if (renewalEl) renewalEl.innerText = new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR');

    // Barras de Consumo
    const tutorLimit = plan.features.ai_tutor.limit;
    const tutorUsed = usage.tutorMessagesUsed;
    const tutorPercent = Math.min(100, Math.round((tutorUsed / tutorLimit) * 100));

    const audioLimit = plan.features.neural_audio.limit;
    const audioUsed = usage.audioCharsUsed;
    const audioPercent = Math.min(100, Math.round((audioUsed / audioLimit) * 100));

    const transLimit = plan.features.class_transcription.limit;
    const transUsed = usage.transcriptionMinutesUsed;
    const transPercent = Math.min(100, Math.round((transUsed / transLimit) * 100));

    const usageBox = document.getElementById('my-sub-usage-bars');
    if (usageBox) {
      usageBox.innerHTML = `
        <!-- Tutor IA -->
        <div style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span><i class="fa-solid fa-robot text-amber"></i> Mensagens no Tutor IA</span>
            <strong>${tutorUsed} / ${tutorLimit} msgs (${tutorPercent}%)</strong>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
            <div style="width:${tutorPercent}%; height:100%; background:${tutorPercent > 85 ? '#ef4444' : 'var(--accent-amber)'};"></div>
          </div>
        </div>

        <!-- ElevenLabs -->
        <div style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span><i class="fa-solid fa-volume-high text-amber"></i> Caracteres ElevenLabs (Marcos)</span>
            <strong>${audioUsed.toLocaleString('pt-BR')} / ${audioLimit.toLocaleString('pt-BR')} chars (${audioPercent}%)</strong>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
            <div style="width:${audioPercent}%; height:100%; background:${audioPercent > 85 ? '#ef4444' : '#38bdf8'};"></div>
          </div>
        </div>

        <!-- Transcrição -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span><i class="fa-solid fa-microphone-lines text-amber"></i> Transcrição de Aulas</span>
            <strong>${transUsed} / ${transLimit} min (${transPercent}%)</strong>
          </div>
          <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
            <div style="width:${transPercent}%; height:100%; background:${transPercent > 85 ? '#ef4444' : '#10b981'};"></div>
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // Painel Administrativo de Métricas & Cortesias
  // --------------------------------------------------------------------------
  renderAdminModal() {
    const auditLogs = StorageModule.getAdminAuditLogs();
    const logsContainer = document.getElementById('admin-audit-logs-container');

    if (logsContainer) {
      logsContainer.innerHTML = auditLogs.map(l => `
        <div style="font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.06); padding:6px 0; color:var(--text-main);">
          • <strong>${l.admin}:</strong> ${l.action} <span style="color:var(--text-muted); font-size:0.72rem;">(${new Date(l.date).toLocaleDateString('pt-BR')})</span>
        </div>
      `).join('');
    }
  }
}
