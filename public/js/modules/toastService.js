/**
 * VadeAudio AI - Sistema Centralizado de Notificações Toast (Etapa 15)
 * Substitui os alerts do navegador por notificações modernas, elegantes e não-bloqueantes.
 */

class ToastService {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!this.container) {
      let el = document.getElementById('toast-notification-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-notification-container';
        el.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          max-width: 420px;
          width: 90%;
        `;
        document.body.appendChild(el);
      }
      this.container = el;
    }
  }

  show(message, type = 'info', duration = 3500, actionText = null, actionCallback = null) {
    this.initContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.style.cssText = `
      background: rgba(18, 24, 38, 0.96);
      backdrop-filter: blur(16px);
      border-radius: 10px;
      padding: 12px 16px;
      color: #fff;
      font-size: 0.85rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      pointer-events: auto;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    `;

    // Ícones e Bordas por Tipo
    let iconClass = 'fa-circle-info text-amber';
    let borderColor = 'var(--accent-amber, #f59e0b)';

    if (type === 'success') {
      iconClass = 'fa-circle-check';
      borderColor = '#10b981';
    } else if (type === 'error') {
      iconClass = 'fa-circle-exclamation';
      borderColor = '#ef4444';
    } else if (type === 'warning') {
      iconClass = 'fa-triangle-exclamation';
      borderColor = '#f59e0b';
    }

    toast.style.borderLeft = `4px solid ${borderColor}`;

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex:1;">
        <i class="fa-solid ${iconClass}" style="color:${borderColor}; font-size:1.1rem;"></i>
        <span style="line-height:1.35; color:var(--text-main, #f8fafc);">${message}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        ${actionText ? `<button class="toast-action-btn" style="background:rgba(255,255,255,0.08); border:none; color:${borderColor}; font-weight:700; font-size:0.75rem; padding:4px 8px; border-radius:4px; cursor:pointer;">${actionText}</button>` : ''}
        <button class="toast-close-btn" style="background:transparent; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:0.85rem; padding:2px;"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;

    // Fechar ao clicar no X
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Callback de Ação
    if (actionText && actionCallback) {
      toast.querySelector('.toast-action-btn').addEventListener('click', () => {
        actionCallback();
        this.dismiss(toast);
      });
    }

    this.container.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    // Auto dispensar
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.transform = 'translateY(-10px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }

  success(msg, duration, actionText, actionCallback) {
    return this.show(msg, 'success', duration, actionText, actionCallback);
  }

  error(msg, duration, actionText, actionCallback) {
    return this.show(msg, 'error', duration || 4500, actionText, actionCallback);
  }

  warning(msg, duration, actionText, actionCallback) {
    return this.show(msg, 'warning', duration, actionText, actionCallback);
  }

  info(msg, duration, actionText, actionCallback) {
    return this.show(msg, 'info', duration, actionText, actionCallback);
  }
}

window.Toast = new ToastService();
