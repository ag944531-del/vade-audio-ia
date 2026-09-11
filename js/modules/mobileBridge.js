/**
 * VadeAudio AI - Mobile Bridge para Android & iOS (Etapa 22)
 * Integração com Capacitor, Bottom Navigation responsiva, MediaSession (Lock Screen),
 * Push Notifications, Deep Links, Biometria, In-App Purchases e Haptics.
 */

class MobileBridge {
  constructor(authService, audioEngine, entitlementService) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.entitlementService = entitlementService;

    this.isNative = typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform());
    this.platform = this.detectPlatform();
    this.biometricConfig = this.loadBiometricConfig();
    this.pushTokensDb = [];

    this.initMediaSession();
    this.initDeepLinks();
  }

  detectPlatform() {
    if (typeof navigator === 'undefined') return 'web';
    const userAgent = navigator.userAgent || '';
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'ios';
    return 'web';
  }

  // --------------------------------------------------------------------------
  // 1. MEDIA SESSION API (LOCK SCREEN & BACKGROUND AUDIO)
  // --------------------------------------------------------------------------
  initMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      if (this.audioEngine) this.audioEngine.resume();
      this.updateMediaPlaybackState('playing');
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (this.audioEngine) this.audioEngine.pause();
      this.updateMediaPlaybackState('paused');
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10;
      if (this.audioEngine && this.audioEngine.seekRelative) {
        this.audioEngine.seekRelative(-skipTime);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10;
      if (this.audioEngine && this.audioEngine.seekRelative) {
        this.audioEngine.seekRelative(skipTime);
      }
    });
  }

  updateMediaMetadata(title, lawOrSubject = 'VadeAudio AI', durationSec = 180) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !window.MediaMetadata) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Artigo Jurídico',
      artist: 'Prof. Dr. Marcos (Voz Neural)',
      album: lawOrSubject,
      artwork: [
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    this.updateMediaPlaybackState('playing');
  }

  updateMediaPlaybackState(state) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state; // 'playing' | 'paused' | 'none'
    }
  }

  // --------------------------------------------------------------------------
  // 2. DEEP LINKS & UNIVERSAL LINKS ROUTER
  // --------------------------------------------------------------------------
  initDeepLinks() {
    if (typeof window === 'undefined') return;

    // Parser de URL na inicialização
    this.handleDeepLink(window.location.href);

    // Listener para eventos nativos do Capacitor
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('appUrlOpen', (data) => {
        if (data && data.url) {
          this.handleDeepLink(data.url);
        }
      });
    }
  }

  handleDeepLink(urlStr) {
    if (!urlStr) return;
    try {
      const url = new URL(urlStr, window.location.origin);
      const pathname = url.pathname;
      const hash = url.hash;

      // Exemplo: vadeaudio://artigo/121 ou https://vadeaudio.app/artigo/121
      const articleMatch = pathname.match(/\/artigo\/(\d+)/i) || (hash && hash.match(/#artigo-(\d+)/i));
      if (articleMatch) {
        const artNum = articleMatch[1];
        setTimeout(() => {
          document.querySelector('[data-view="vade-mecum"]')?.click();
          const searchInput = document.getElementById('search-input');
          if (searchInput) {
            searchInput.value = artNum;
            searchInput.dispatchEvent(new Event('input'));
          }
          window.Toast?.info(`Navegando para o Artigo ${artNum} via Deep Link`);
        }, 500);
        return { target: 'article', id: artNum };
      }

      // Exemplo: vadeaudio://flashcards
      if (pathname.includes('/flashcards') || hash.includes('flashcards')) {
        setTimeout(() => document.querySelector('[data-view="flashcards"]')?.click(), 400);
        return { target: 'flashcards' };
      }

      // Exemplo: vadeaudio://tutor
      if (pathname.includes('/tutor') || hash.includes('tutor')) {
        setTimeout(() => document.querySelector('[data-view="tutor"]')?.click(), 400);
        return { target: 'tutor' };
      }
    } catch {}
    return null;
  }

  // --------------------------------------------------------------------------
  // 3. BIOMETRIA & AUTO-LOCK
  // --------------------------------------------------------------------------
  loadBiometricConfig() {
    try {
      return JSON.parse(localStorage.getItem('vadeaudio_biometric_config')) || {
        isEnabled: false,
        lockTimeoutMinutes: 5, // 0 = imediatamente, 1, 5, -1 = nunca
        lastActiveTimestamp: Date.now()
      };
    } catch {
      return { isEnabled: false, lockTimeoutMinutes: 5, lastActiveTimestamp: Date.now() };
    }
  }

  saveBiometricConfig() {
    try {
      localStorage.setItem('vadeaudio_biometric_config', JSON.stringify(this.biometricConfig));
    } catch {}
  }

  checkShouldLockApp() {
    if (!this.biometricConfig.isEnabled || this.biometricConfig.lockTimeoutMinutes < 0) {
      return false;
    }
    const elapsedMinutes = (Date.now() - this.biometricConfig.lastActiveTimestamp) / 60000;
    return elapsedMinutes >= this.biometricConfig.lockTimeoutMinutes;
  }

  async authenticateBiometrics() {
    // Simulação do fluxo nativo Face ID / Touch ID / Android Biometric
    return new Promise((resolve) => {
      setTimeout(() => {
        this.biometricConfig.lastActiveTimestamp = Date.now();
        this.saveBiometricConfig();
        resolve({ success: true });
      }, 400);
    });
  }

  // --------------------------------------------------------------------------
  // 4. NOTIFICAÇÕES PUSH (REGISTRO & CATEGORIAS)
  // --------------------------------------------------------------------------
  async registerPushDeviceToken(token) {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    const deviceRecord = {
      userId: user ? user.id : 'usr_student_lucas_101',
      platform: this.platform,
      token: token || `push_tok_${this.platform}_${Date.now().toString(36)}`,
      categories: ['provas', 'revisoes_srs', 'atualizacoes_leis'],
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
    this.pushTokensDb.push(deviceRecord);
    return deviceRecord;
  }

  // --------------------------------------------------------------------------
  // 5. IN-APP PURCHASES & RESTORE PURCHASES
  // --------------------------------------------------------------------------
  async verifyStorePurchase(productId, transactionReceipt, store = 'apple_app_store') {
    const user = this.authService ? this.authService.getCurrentUser() : null;
    
    // Abstração de validação server-side
    const verificationResult = {
      isValid: true,
      userId: user ? user.id : 'usr_student_lucas_101',
      store,
      productId,
      entitlementStatus: 'pro',
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };

    if (this.entitlementService) {
      this.entitlementService.grantProSubscription('store_iap');
    }

    return verificationResult;
  }

  // --------------------------------------------------------------------------
  // 6. NATIVE SHARE API & HAPTICS
  // --------------------------------------------------------------------------
  async nativeShare(title, text, url) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: url || window.location.href });
        return { success: true };
      } catch (err) {
        return { success: false, dismissed: true };
      }
    }
    // Fallback para Clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${title} - ${text}\n${url || window.location.href}`);
      window.Toast?.success('Link copiado para a área de transferência!');
      return { success: true, fallback: 'clipboard' };
    }
    return { success: false };
  }

  triggerHaptic(type = 'light') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'light') navigator.vibrate(15);
      if (type === 'medium') navigator.vibrate(35);
      if (type === 'success') navigator.vibrate([20, 50, 20]);
      if (type === 'error') navigator.vibrate([50, 50, 50]);
    }
  }

  // --------------------------------------------------------------------------
  // 7. PEDIDO CONTEXTUAL DE MICROFONE
  // --------------------------------------------------------------------------
  async requestMicrophonePermissionContextual() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { granted: false, error: 'unsupported' };
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Fecha a stream inicial após confirmar autorização
      stream.getTracks().forEach(t => t.stop());
      return { granted: true };
    } catch (err) {
      return {
        granted: false,
        error: 'denied',
        userMessage: 'Precisamos do microfone para conversas com o Professor por Voz e Prova Oral. Habilite nas configurações do aparelho.'
      };
    }
  }
}

window.MobileBridge = MobileBridge;
