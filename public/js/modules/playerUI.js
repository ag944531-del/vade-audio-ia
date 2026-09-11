/**
 * VadeAudio AI - Módulo de Interface do Player & Visualização
 * Gerencia o Player Inferior, Barra de Progresso, Scrubbing, Vozes e Notificações.
 */

class PlayerUI {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    
    // DOM Elements
    this.playerBar = document.getElementById('audio-player-bar');
    this.playIcon = document.getElementById('play-icon');
    this.btnMainPlay = document.getElementById('btn-main-play');
    this.playerArtTitle = document.getElementById('player-art-title');
    this.playerLawSub = document.getElementById('player-law-sub');
    this.equalizerWaves = document.getElementById('equalizer-waves');

    // Progress Bar Elements
    this.progressContainer = document.getElementById('progress-container');
    this.progressFill = document.getElementById('progress-fill');
    this.playerCurrentTime = document.getElementById('player-current-time');
    this.playerTotalTime = document.getElementById('player-total-time');
    
    // Speed Selector
    this.btnSpeedToggle = document.getElementById('btn-speed-toggle');
    this.speedValDisplay = document.getElementById('speed-val-display');
    this.speedMenu = document.getElementById('speed-menu');
    
    // Voice Selector
    this.voiceSelect = document.getElementById('voice-select');

    // Controls
    this.btnRepeatMode = document.getElementById('btn-repeat-mode');
    this.btnPrevArt = document.getElementById('btn-prev-art');
    this.btnNextArt = document.getElementById('btn-next-art');
    this.btnSkipBack = document.getElementById('btn-skip-back');
    this.btnSkipForward = document.getElementById('btn-skip-forward');
    this.btnOpenQueue = document.getElementById('btn-open-queue');
    this.queueModal = document.getElementById('queue-modal');
    this.btnCloseQueue = document.getElementById('btn-close-queue');
    this.btnClearQueue = document.getElementById('btn-clear-queue');
    this.queueContainer = document.getElementById('queue-items-container');
    this.queueBadgeCount = document.getElementById('queue-badge-count');
    this.btnSleepTimer = document.getElementById('btn-sleep-timer');
    this.sleepBadge = document.getElementById('sleep-badge');

    // Commute Elements
    this.commuteOverlay = document.getElementById('commute-overlay');
    this.commuteArtTitle = document.getElementById('commute-art-title');
    this.commuteArtSubtitle = document.getElementById('commute-art-subtitle');
    this.commuteActiveText = document.getElementById('commute-active-text');
    this.commutePlayBtn = document.getElementById('btn-commute-play');

    this.bindEvents();
    this.setupAudioCallbacks();
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  bindEvents() {
    // Play/Pause Main Button
    this.btnMainPlay.addEventListener('click', () => {
      this.audioEngine.togglePlayPause();
    });

    // Progress Bar Click / Scrubbing
    if (this.progressContainer) {
      this.progressContainer.addEventListener('click', (e) => {
        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(100, (clickX / width) * 100));
        this.audioEngine.seekPercent(percent);
      });
    }

    // Repeat Mode Toggle
    if (this.btnRepeatMode) {
      this.btnRepeatMode.addEventListener('click', () => {
        const mode = this.audioEngine.toggleRepeatMode();
        if (mode === 'off') {
          this.btnRepeatMode.style.color = 'inherit';
          this.btnRepeatMode.title = 'Modo de Repetição (Desativado)';
        } else if (mode === 'one') {
          this.btnRepeatMode.style.color = 'var(--accent-amber)';
          this.btnRepeatMode.title = 'Repetir Artigo Atual';
        } else if (mode === 'all') {
          this.btnRepeatMode.style.color = 'var(--accent-blue)';
          this.btnRepeatMode.title = 'Repetir Lista / Fila';
        }
      });
    }

    // Skip Back / Forward 10s
    if (this.btnSkipBack) {
      this.btnSkipBack.addEventListener('click', () => {
        if (this.audioEngine.audioPlayer) {
          this.audioEngine.seek(this.audioEngine.audioPlayer.currentTime - 10);
        }
      });
    }

    if (this.btnSkipForward) {
      this.btnSkipForward.addEventListener('click', () => {
        if (this.audioEngine.audioPlayer) {
          this.audioEngine.seek(this.audioEngine.audioPlayer.currentTime + 10);
        }
      });
    }

    // Previous / Next Article in Reader
    if (this.btnPrevArt) {
      this.btnPrevArt.addEventListener('click', () => {
        if (window.VadeAudioApp && window.VadeAudioApp.playPrevArticle) {
          window.VadeAudioApp.playPrevArticle();
        }
      });
    }

    if (this.btnNextArt) {
      this.btnNextArt.addEventListener('click', () => {
        if (window.VadeAudioApp && window.VadeAudioApp.playNextArticle) {
          window.VadeAudioApp.playNextArticle();
        }
      });
    }

    // Sleep Timer
    if (this.btnSleepTimer) {
      this.btnSleepTimer.addEventListener('click', () => {
        const minutes = prompt('Definir Timer de Sono (desligar áudio em quantos minutos? Digite 0 para cancelar, ou 15, 30, 45, 60):', '30');
        if (minutes !== null && !isNaN(minutes)) {
          const minVal = parseInt(minutes);
          this.audioEngine.setSleepTimer(minVal);
          if (minVal > 0) {
            if (this.sleepBadge) {
              this.sleepBadge.innerText = `${minVal}m`;
              this.sleepBadge.classList.remove('hidden');
            }
            this.showToast(`Timer ativado para desligar em ${minVal} minutos.`);
          } else {
            if (this.sleepBadge) this.sleepBadge.classList.add('hidden');
            this.showToast('Timer de sono cancelado.');
          }
        }
      });
    }

    // Queue Modal Open/Close/Clear
    if (this.btnOpenQueue) {
      this.btnOpenQueue.addEventListener('click', () => {
        this.renderQueueModal();
        this.queueModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseQueue) {
      this.btnCloseQueue.addEventListener('click', () => {
        this.queueModal.classList.add('hidden');
      });
    }

    if (this.btnClearQueue) {
      this.btnClearQueue.addEventListener('click', () => {
        this.audioEngine.clearQueue();
        this.renderQueueModal();
      });
    }

    // Speed Selector Toggle
    if (this.btnSpeedToggle) {
      this.btnSpeedToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.speedMenu.classList.toggle('hidden');
      });
    }

    document.addEventListener('click', (e) => {
      if (this.speedMenu && !this.speedMenu.contains(e.target) && e.target !== this.btnSpeedToggle) {
        this.speedMenu.classList.add('hidden');
      }
    });

    // Speed Options Click in Dropdown
    if (this.speedMenu) {
      this.speedMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const speed = btn.dataset.speed;
          this.updateSpeed(speed);
          this.speedMenu.classList.add('hidden');
          this.showToast(`Velocidade de leitura ajustada para ${speed}x`);
        });
      });
    }

    // Commute Mode Speed Cycle Button
    const btnCommuteSpeed = document.getElementById('btn-commute-speed');
    if (btnCommuteSpeed) {
      btnCommuteSpeed.addEventListener('click', () => {
        const speeds = ['0.75', '0.90', '1.00', '1.05', '1.25', '1.50', '1.75', '2.00'];
        const currentSpeedStr = this.audioEngine.speed.toString();
        let idx = speeds.indexOf(currentSpeedStr);
        if (idx === -1) {
          idx = speeds.findIndex(s => parseFloat(s) === this.audioEngine.speed);
        }
        const nextSpeed = speeds[(idx + 1) % speeds.length];
        this.updateSpeed(nextSpeed);
        this.showToast(`Modo Trânsito: Velocidade ${nextSpeed}x`);
      });
    }

    // Voice selector
    this.voiceSelect.addEventListener('change', () => {
      this.audioEngine.setVoiceByURI(this.voiceSelect.value);
      this.showToast(`Voz alterada para: ${this.voiceSelect.options[this.voiceSelect.selectedIndex].text}`);
    });

    // Commute Play button
    if (this.commutePlayBtn) {
      this.commutePlayBtn.addEventListener('click', () => {
        this.audioEngine.togglePlayPause();
      });
    }

    // Commute Explain Button
    const btnCommuteExplain = document.getElementById('btn-commute-explain');
    if (btnCommuteExplain) {
      btnCommuteExplain.addEventListener('click', () => {
        if (this.audioEngine.currentArticle) {
          this.audioEngine.speakExplanation(this.audioEngine.currentArticle);
          this.showToast(`Professor explicando o ${this.audioEngine.currentArticle.number}`);
        } else {
          this.showToast('Selecione um artigo para ouvir a explicação.');
        }
      });
    }

    // Commute Download Button
    const btnCommuteDl = document.getElementById('btn-commute-download');
    if (btnCommuteDl) {
      btnCommuteDl.addEventListener('click', async () => {
        if (this.audioEngine.currentArticle) {
          this.showToast(`Baixando áudio do ${this.audioEngine.currentArticle.number}...`);
          const ok = await this.audioEngine.downloadArticleAudio(this.audioEngine.currentArticle);
          if (ok) this.showToast(`Download de ${this.audioEngine.currentArticle.number}.mp3 concluído!`);
        } else {
          this.showToast('Nenhum artigo ativo para download.');
        }
      });
    }
  }

  updateSpeed(speed) {
    const spdNum = parseFloat(speed) || 1.0;
    this.audioEngine.setSpeed(spdNum);

    if (this.speedValDisplay) {
      this.speedValDisplay.innerText = `${spdNum.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1')}x`;
    }

    const commuteSpeedTxt = document.getElementById('commute-speed-txt');
    if (commuteSpeedTxt) {
      commuteSpeedTxt.innerText = `${spdNum.toFixed(2).replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1')}x`;
    }

    if (this.speedMenu) {
      this.speedMenu.querySelectorAll('button').forEach(b => {
        const bSpeed = parseFloat(b.dataset.speed);
        b.classList.toggle('active', bSpeed === spdNum);
      });
    }
  }

  showToast(message, isError = false) {
    let toast = document.getElementById('vade-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'vade-toast-notification';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        padding: 14px 24px;
        border-radius: 12px;
        font-family: var(--font-main, sans-serif);
        font-size: 0.95rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 90%;
      `;
      document.body.appendChild(toast);
    }

    if (isError) {
      toast.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
      toast.style.color = '#fff';
      toast.style.border = '1px solid rgba(255,255,255,0.2)';
      toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>${message}</span>`;
    } else {
      toast.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
      toast.style.color = '#38bdf8';
      toast.style.border = '1px solid rgba(56,189,248,0.3)';
      toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 4500);
  }

  renderQueueModal() {
    if (!this.queueContainer) return;
    const queue = this.audioEngine.userQueue || [];

    if (this.queueBadgeCount) {
      this.queueBadgeCount.innerText = queue.length;
      this.queueBadgeCount.classList.toggle('hidden', queue.length === 0);
    }

    this.queueContainer.innerHTML = '';
    if (queue.length === 0) {
      this.queueContainer.innerHTML = `
        <div style="text-align:center; padding:24px; color:var(--text-muted);">
          <i class="fa-solid fa-layer-group" style="font-size:2rem; margin-bottom:8px; opacity:0.5;"></i>
          <p>Nenhum artigo na fila de reprodução no momento.</p>
        </div>
      `;
      return;
    }

    queue.forEach((art, index) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);';
      item.innerHTML = `
        <div>
          <div style="font-weight:700; font-size:0.9rem;">${art.number} - ${art.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${art.category}</div>
        </div>
        <button class="btn-remove-q" data-idx="${index}" style="background:none; border:none; color:#f87171; cursor:pointer; padding:6px;"><i class="fa-solid fa-xmark"></i></button>
      `;

      item.querySelector('.btn-remove-q').addEventListener('click', (e) => {
        e.stopPropagation();
        this.audioEngine.removeFromQueue(index);
        this.renderQueueModal();
      });

      this.queueContainer.appendChild(item);
    });
  }

  setupAudioCallbacks() {
    // Engine State Change Callback
    this.audioEngine.onStateChange = ({ isPlaying, isPaused, isLoading, article, voice }) => {
      // Update Play Icons and Loading Spinner
      if (isLoading) {
        this.playIcon.className = 'fa-solid fa-circle-notch fa-spin';
        if (this.commutePlayBtn) this.commutePlayBtn.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
        this.playerArtTitle.innerText = 'Preparando áudio neural ElevenLabs...';
      } else if (isPlaying) {
        this.playIcon.className = 'fa-solid fa-pause';
        if (this.commutePlayBtn) this.commutePlayBtn.querySelector('i').className = 'fa-solid fa-pause';
        this.equalizerWaves.classList.add('playing');
      } else {
        this.playIcon.className = 'fa-solid fa-play';
        if (this.commutePlayBtn) this.commutePlayBtn.querySelector('i').className = 'fa-solid fa-play';
        this.equalizerWaves.classList.remove('playing');
      }

      // Update Player Track Meta
      if (article && !isLoading) {
        const artNumber = article.article_display || (article.number ? `Art. ${article.number}` : (article.id ? `Art. ${article.id}` : 'Artigo'));
        const artTitle = article.title || article.topic || article.law_name || 'Legislação';
        this.playerArtTitle.innerText = `${artNumber} - ${artTitle}`;
        const lawObj = VADE_MECUM_DB?.laws?.find(l => l.id === article.lawId);
        const voiceName = voice ? ` • Voz: ${voice.name}` : ' • Áudio Narração';
        this.playerLawSub.innerText = lawObj ? `${lawObj.code} • ${article.category || ''}${voiceName}` : `${article.category || 'Direito'}${voiceName}`;
        
        // Commute Overlay Meta
        if (this.commuteArtTitle) this.commuteArtTitle.innerText = `${artNumber} - ${artTitle}`;
        if (this.commuteArtSubtitle) this.commuteArtSubtitle.innerText = lawObj ? lawObj.title : '';

        // Highlight Active Article Card in UI
        this.highlightActiveArticleCard(article.id);
      }
    };

    // Progress Bar and Time Update
    this.audioEngine.onProgress = ({ currentTime, duration, percent }) => {
      if (this.progressFill) {
        this.progressFill.style.width = `${percent}%`;
      }
      if (this.playerCurrentTime) {
        this.playerCurrentTime.innerText = this.formatTime(currentTime);
      }
      if (this.playerTotalTime) {
        this.playerTotalTime.innerText = this.formatTime(duration);
      }
    };

    // Error Callback
    this.audioEngine.onError = ({ message }) => {
      this.showToast(message, true);
    };

    // Queue update callback
    this.audioEngine.onQueueUpdated = (queue) => {
      if (this.queueBadgeCount) {
        this.queueBadgeCount.innerText = queue.length;
        this.queueBadgeCount.classList.toggle('hidden', queue.length === 0);
      }
    };

    this.audioEngine.onVoicesLoaded = (voices) => {
      this.populateVoiceSelect(voices);
    };

    // Populate Initial Voice Select Options
    setTimeout(() => {
      this.populateVoiceSelect(this.audioEngine.availableVoices);
      this.renderQueueModal();
    }, 300);
  }

  populateVoiceSelect(voices = []) {
    this.voiceSelect.innerHTML = '';
    
    if (!voices || voices.length === 0) {
      this.voiceSelect.innerHTML = '<option value="xHUwLsLfyqiYOIVTzLRW">🧠 Marcos (Neural PT-BR)</option>';
      return;
    }

    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `🧠 ${voice.name} (${voice.category || 'Professor'})`;
        
      if (this.audioEngine.selectedVoice && voice.voiceURI === this.audioEngine.selectedVoice.voiceURI) {
        option.selected = true;
      }
      this.voiceSelect.appendChild(option);
    });
  }

  highlightActiveArticleCard(articleId) {
    document.querySelectorAll('.article-card').forEach(card => {
      card.classList.remove('reading-active');
    });

    const activeCard = document.getElementById(`art-card-${articleId}`);
    if (activeCard) {
      activeCard.classList.add('reading-active');
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
