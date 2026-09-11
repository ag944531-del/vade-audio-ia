/**
 * VadeAudio AI - Motor de Narração Neural TTS Direto via ElevenLabs
 * Conexão direta com a API neural ElevenLabs através de backend seguro.
 * Inclui Processador Fonético Jurídico para pronúncia natural em tom de professor de Direito,
 * pré-carregamento de áudio em segundo plano e persistência de voz.
 */

class AudioEngine {
  constructor() {
    // HTML5 Audio Player Element (Motor Neural Exclusivo)
    this.audioPlayer = new Audio();
    
    // Core Audio State
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    this.speed = 1.0; // Velocidade padrão natural (1.00x)
    this.pitch = 1.0;
    this.selectedVoice = {
      voiceURI: 'xHUwLsLfyqiYOIVTzLRW',
      name: 'Marcos (Neural PT-BR)',
      lang: 'pt-BR',
      gender: 'Masculino',
      category: 'Professor de Direito',
      isNeural: true
    };
    this.availableVoices = [];

    // Player Queue State
    this.currentArticle = null;
    this.currentQueue = [];
    this.queueIndex = 0;
    this.repeatMode = 'off'; // 'off' | 'one' | 'all'
    this.userQueue = StorageModule.getAudioQueue() || [];

    // Audio Buffer Cache & Preloading Map (Map<humanizedText, BlobURL>)
    this.preloadAudioMap = new Map();

    // Event Callbacks
    this.onStateChange = null;
    this.onProgress = null;
    this.onArticleEnd = null;
    this.onVoicesLoaded = null;
    this.onQueueUpdated = null;
    this.onError = null;
    this.playbackListeners = [];

    // Timer & Statistics
    this.sleepTimerId = null;
    this.listenStartTimestamp = null;
    this.lastSpokenText = '';

    this.setupAudioListeners();
    this.setupMediaSession();
    this.initVoices();
  }

  onPlaybackChange(callback) {
    if (typeof callback === 'function') {
      if (!this.playbackListeners) this.playbackListeners = [];
      this.playbackListeners.push(callback);
    }
  }

  notifyStateChange(state) {
    if (typeof this.onStateChange === 'function') {
      try {
        this.onStateChange(state);
      } catch (e) {
        console.error('[AudioEngine] Erro em onStateChange:', e);
      }
    }
    if (Array.isArray(this.playbackListeners)) {
      this.playbackListeners.forEach(cb => {
        try {
          cb(state);
        } catch (e) {
          console.error('[AudioEngine] Erro no listener onPlaybackChange:', e);
        }
      });
    }
  }

  setupAudioListeners() {
    // Garante que a taxa de velocidade (playbackRate) seja mantida em todos os ciclos de carregamento
    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.audioPlayer.defaultPlaybackRate = this.speed;
      this.audioPlayer.playbackRate = this.speed;
    });

    this.audioPlayer.addEventListener('canplay', () => {
      this.audioPlayer.playbackRate = this.speed;
    });

    this.audioPlayer.addEventListener('play', () => {
      this.audioPlayer.playbackRate = this.speed;
    });

    // 1. Quando o áudio começa a tocar
    this.audioPlayer.addEventListener('playing', () => {
      this.audioPlayer.playbackRate = this.speed;
      this.isPlaying = true;
      this.isPaused = false;
      this.isLoading = false;
      this.listenStartTimestamp = Date.now();
      this.updateMediaSession();
      this.notifyStateChange({
        isPlaying: true,
        isPaused: false,
        isLoading: false,
        article: this.currentArticle,
        voice: this.selectedVoice
      });
    });

    // 2. Quando o áudio é pausado
    this.audioPlayer.addEventListener('pause', () => {
      if (this.audioPlayer.currentTime < this.audioPlayer.duration) {
        this.isPlaying = false;
        this.isPaused = true;
        this.updateMediaSession();
        this.notifyStateChange({
          isPlaying: false,
          isPaused: true,
          isLoading: false,
          article: this.currentArticle,
          voice: this.selectedVoice
        });
      }
    });

    // 3. Atualização de Progresso / Barra de Tempo
    this.audioPlayer.addEventListener('timeupdate', () => {
      if (this.onProgress && this.audioPlayer.duration) {
        this.onProgress({
          currentTime: this.audioPlayer.currentTime,
          duration: this.audioPlayer.duration,
          percent: (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100
        });
      }
    });

    // 4. Conclusão do Trecho / Artigo
    this.audioPlayer.addEventListener('ended', () => {
      if (this.listenStartTimestamp) {
        const elapsedSec = (Date.now() - this.listenStartTimestamp) / 1000;
        StorageModule.addListenTime(elapsedSec, this.speed);
        this.listenStartTimestamp = null;
      }

      this.queueIndex++;
      this.speakCurrentQueueItem();
    });

    // 5. Tratamento de Erros no Player de Áudio
    this.audioPlayer.addEventListener('error', (e) => {
      console.error('[AudioPlayer Error] Falha na reprodução do áudio neural da ElevenLabs.', e);
      this.isLoading = false;
      this.isPlaying = false;
      this.isPaused = false;
      this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
      if (this.onError) {
        this.onError({
          message: 'Erro ao reproduzir o áudio neural retornado pelo servidor.',
          code: 'AUDIO_PLAYBACK_ERROR'
        });
      }
    });
  }

  /**
   * Inicializa as vozes do backend ElevenLabs e restaura a voz preferida
   */
  async initVoices() {
    try {
      const res = await fetch('/api/tts/voices');
      const data = await res.json();
      
      if (data && data.voices && data.voices.length > 0) {
        this.availableVoices = data.voices.map(v => ({
          voiceURI: v.id,
          name: v.name,
          lang: v.lang || 'pt-BR',
          gender: v.gender || 'didática',
          category: v.category || 'Professor de Direito',
          description: v.description || 'Voz neural de alta definição',
          isNeural: true
        }));

        // Restaura a voz salva pelo usuário ou adota a primeira voz padrão (Prof. Carlos)
        const savedSettings = StorageModule.getSettings();
        if (savedSettings.voiceURI) {
          const match = this.availableVoices.find(v => v.voiceURI === savedSettings.voiceURI);
          this.selectedVoice = match || this.availableVoices[0];
        } else {
          this.selectedVoice = this.availableVoices[0];
        }
      }
    } catch (err) {
      console.warn('[Voices API Error] Não foi possível conectar ao backend para listar vozes:', err);
    }

    if (this.onVoicesLoaded) {
      this.onVoicesLoaded(this.availableVoices);
    }
  }

  setVoiceByURI(voiceURI) {
    const voice = this.availableVoices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      this.selectedVoice = voice;
      this.preloadAudioMap.clear(); // Limpa pré-carregamentos de vozes anteriores
      StorageModule.saveSettings({ voiceURI: voice.voiceURI });
    }
  }

  setSpeed(rate) {
    this.speed = parseFloat(rate) || 1.0;
    if (this.audioPlayer) {
      this.audioPlayer.defaultPlaybackRate = this.speed;
      this.audioPlayer.playbackRate = this.speed;
    }
    StorageModule.saveSettings({ speed: this.speed });
  }

  toggleRepeatMode() {
    const modes = ['off', 'one', 'all'];
    const currentIdx = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(currentIdx + 1) % modes.length];
    return this.repeatMode;
  }

  // Fila de Leitura Personalizada
  addToQueue(article) {
    if (!article) return;
    if (!this.userQueue.some(a => a.id === article.id)) {
      this.userQueue.push(article);
      StorageModule.saveAudioQueue(this.userQueue);
      if (this.onQueueUpdated) this.onQueueUpdated(this.userQueue);
    }
  }

  removeFromQueue(index) {
    if (index >= 0 && index < this.userQueue.length) {
      this.userQueue.splice(index, 1);
      StorageModule.saveAudioQueue(this.userQueue);
      if (this.onQueueUpdated) this.onQueueUpdated(this.userQueue);
    }
  }

  clearQueue() {
    this.userQueue = [];
    StorageModule.saveAudioQueue([]);
    if (this.onQueueUpdated) this.onQueueUpdated([]);
  }

  /**
   * Conversor de Algarismos Romanos (I a C) para Palavras em Português
   * Utilizado para a leitura de Incisos da Legislação
   */
  romanToWords(roman) {
    const romanMap = {
      'I': 'um', 'II': 'dois', 'III': 'três', 'IV': 'quatro', 'V': 'cinco',
      'VI': 'seis', 'VII': 'sete', 'VIII': 'oito', 'IX': 'nove', 'X': 'dez',
      'XI': 'onze', 'XII': 'doze', 'XIII': 'treze', 'XIV': 'quatorze', 'XV': 'quinze',
      'XVI': 'dezesseis', 'XVII': 'dezessete', 'XVIII': 'dezoito', 'XIX': 'dezenove', 'XX': 'vinte',
      'XXI': 'vinte e um', 'XXII': 'vinte e dois', 'XXIII': 'vinte e três', 'XXIV': 'vinte e quatro',
      'XXV': 'vinte e cinco', 'XXVI': 'vinte e seis', 'XXVII': 'vinte e sete', 'XXVIII': 'vinte e oito',
      'XXIX': 'vinte e nove', 'XXX': 'trinta', 'XXXI': 'trinta e um', 'XXXII': 'trinta e dois',
      'XXXIII': 'trinta e três', 'XXXIV': 'trinta e quatro', 'XXXV': 'trinta e cinco',
      'XXXVI': 'trinta e seis', 'XXXVII': 'trinta e sete', 'XXXVIII': 'trinta e oito',
      'XXXIX': 'trinta e nove', 'XL': 'quarenta', 'XLI': 'quarenta e um', 'XLII': 'quarenta e dois',
      'XLIII': 'quarenta e três', 'XLIV': 'quarenta e quatro', 'XLV': 'quarenta e cinco',
      'XLVI': 'quarenta e seis', 'XLVII': 'quarenta e sete', 'XLVIII': 'quarenta e oito',
      'XLIX': 'quarenta e nove', 'L': 'cinquenta', 'LI': 'cinquenta e um', 'LII': 'cinquenta e dois',
      'LIII': 'cinquenta e três', 'LIV': 'cinquenta e quatro', 'LV': 'cinquenta e cinco',
      'LVI': 'cinquenta e seis', 'LVII': 'cinquenta e sete', 'LVIII': 'cinquenta e oito',
      'LIX': 'cinquenta e nove', 'LX': 'sessenta', 'LXI': 'sessenta e um', 'LXII': 'sessenta e dois',
      'LXIII': 'sessenta e três', 'LXIV': 'sessenta e quatro', 'LXV': 'sessenta e cinco',
      'LXVI': 'sessenta e seis', 'LXVII': 'sessenta e sete', 'LXVIII': 'sessenta e oito',
      'LXIX': 'sessenta e nove', 'LXX': 'setenta', 'LXXI': 'setenta e um', 'LXXII': 'setenta e dois',
      'LXXIII': 'setenta e três', 'LXXIV': 'setenta e quatro', 'LXXV': 'setenta e cinco',
      'LXXVI': 'setenta e seis', 'LXXVII': 'setenta e sete', 'LXXVIII': 'setenta e oito',
      'LXXIX': 'setenta e nove', 'LXXX': 'oitenta', 'LXXXI': 'oitenta e um', 'LXXXII': 'oitenta e dois',
      'LXXXIII': 'oitenta e três', 'LXXXIV': 'oitenta e quatro', 'LXXXV': 'oitenta e cinco',
      'LXXXVI': 'oitenta e seis', 'LXXXVII': 'oitenta e sete', 'LXXXVIII': 'oitenta e oito',
      'LXXXIX': 'oitenta e nove', 'XC': 'noventa', 'XCI': 'noventa e um', 'XCII': 'noventa e dois',
      'XCIII': 'noventa e três', 'XCIV': 'noventa e quatro', 'XCV': 'noventa e cinco',
      'XCVI': 'noventa e seis', 'XCVII': 'noventa e sete', 'XCVIII': 'noventa e oito',
      'XCIX': 'noventa e nove', 'C': 'cem'
    };

    const cleanRoman = roman.trim().toUpperCase();
    return romanMap[cleanRoman] || cleanRoman;
  }

  /**
   * Processador Fonético Jurídico Avançado (Tom de Professor de Direito)
   * Prepara o texto jurídico com dicção, cadência oral e pausas naturais,
   * preservando fielmente o significado legal.
   */
  humanizeLegalText(text) {
    if (!text || typeof text !== 'string') return '';

    let clean = text.trim();

    // 1. Siglas e Diplomas Jurídicos Fundamentais
    clean = clean.replace(/\bCF\/88\b/gi, 'Constituição Federal de 1988');
    clean = clean.replace(/\bCC\/02\b|\bCC\/2002\b/gi, 'Código Civil de 2002');
    clean = clean.replace(/\bCPC\/15\b|\bCPC\/2015\b/gi, 'Código de Processo Civil de 2015');
    clean = clean.replace(/\bCPP\b/g, 'Código de Processo Penal');
    clean = clean.replace(/\bCP\b/g, 'Código Penal');
    clean = clean.replace(/\bCLT\b/g, 'Consolidação das Leis do Trabalho');
    clean = clean.replace(/\bSTF\b/g, 'Supremo Tribunal Federal');
    clean = clean.replace(/\bSTJ\b/g, 'Superior Tribunal de Justiça');
    clean = clean.replace(/\bOAB\b/g, 'Ordem dos Advogados do Brasil');
    clean = clean.replace(/\bCTN\b/g, 'Código Tributário Nacional');
    clean = clean.replace(/\bCDC\b/g, 'Código de Defesa do Consumidor');
    clean = clean.replace(/\bECA\b/g, 'Estatuto da Criança e do Adolescente');
    clean = clean.replace(/\bLEP\b/g, 'Lei de Execução Penal');

    // 2. Artigos: Ordinais (1º ao 9º) e Cardinais (10 em diante)
    const ordinalsMap = {
      '1': 'primeiro', '2': 'segundo', '3': 'terceiro', '4': 'quarto',
      '5': 'quinto', '6': 'sexto', '7': 'sétimo', '8': 'oitavo', '9': 'nono'
    };

    clean = clean.replace(/Art\.\s*([1-9])º/gi, (match, num) => `Artigo ${ordinalsMap[num]}`);
    clean = clean.replace(/Art\.\s*(\d+)/gi, 'Artigo $1');

    // 3. Parágrafos (§), Parágrafo Único e Caput
    clean = clean.replace(/§\s*([1-9])º/gi, (match, num) => `Parágrafo ${ordinalsMap[num]}: `);
    clean = clean.replace(/§\s*(\d+)º/gi, 'Parágrafo $1: ');
    clean = clean.replace(/§\s*(\d+)/gi, 'Parágrafo $1: ');
    clean = clean.replace(/Parágrafo único[:.]?/gi, 'Parágrafo único:');
    clean = clean.replace(/^Caput[:.]?/gim, 'Caput:');

    // 4. Incisos em Algarismos Romanos (Ex: I -, II -, LVII -, LXVIII -)
    clean = clean.replace(/(?:inciso\s+)?\b([IVXLCDM]+)\s*-\s*/gi, (match, roman) => {
      const words = this.romanToWords(roman);
      return `inciso ${words}: `;
    });

    // 5. Alíneas (Ex: a), b), c))
    clean = clean.replace(/\b([a-z])\)\s*/g, 'alínea $1: ');

    // 6. Cadência Oral e Pausas Rítmicas de Professor
    // Transforma ponto e vírgula em pausas com vírgula para fluidez oral de explicação
    clean = clean.replace(/;\s*/g, ', ');
    
    // Normaliza múltiplos espaços
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
  }

  /**
   * Executa a narração de um artigo completo com fila sequencial de cláusulas
   */
  speakArticle(article) {
    if (!article) return;
    
    this.stop();
    this.currentArticle = article;
    const contents = article.content || [{ text: article.official_text || article.text || '', speechText: article.official_text || article.text || '' }];
    const artDisplay = article.article_display || article.number || (article.article ? `Art. ${article.article}º` : 'Artigo');
    
    this.currentQueue = contents.map(c => ({
      ...c,
      articleId: article.id,
      number: artDisplay
    }));
    this.queueIndex = 0;

    this.speakCurrentQueueItem();
  }

  /**
   * Executa o resumo didático e jurisprudência do artigo
   */
  speakSummary(article) {
    if (!article) return;
    const summaryText = article.aiSummary || (article.professor_mode ? article.professor_mode.summary : '');
    if (!summaryText) return;
    this.stop();
    this.currentArticle = article;
    const artNum = article.speech_number || article.speechNumber || article.article_display || article.number || 'Artigo';
    const jur = typeof article.jurisprudence === 'string' ? article.jurisprudence : (article.professor_mode ? article.professor_mode.practical_example : 'Sem jurisprudência cadastrada.');
    const fullSummaryText = `Resumo Inteligente do ${artNum}. ${summaryText}. Jurisprudência e Súmulas correlatas: ${jur}`;
    this.speakText(fullSummaryText);
  }

  speakCurrentQueueItem() {
    if (this.queueIndex >= this.currentQueue.length) {
      StorageModule.incrementArticlesCompleted();
      if (this.onArticleEnd) this.onArticleEnd(this.currentArticle);

      // Modos de Repetição e Fila Contínua
      if (this.repeatMode === 'one') {
        this.queueIndex = 0;
        this.speakCurrentQueueItem();
        return;
      }

      if (this.userQueue.length > 0) {
        const nextArt = this.userQueue.shift();
        StorageModule.saveAudioQueue(this.userQueue);
        if (this.onQueueUpdated) this.onQueueUpdated(this.userQueue);
        this.speakArticle(nextArt);
        return;
      }

      this.isPlaying = false;
      this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
      return;
    }

    const item = this.currentQueue[this.queueIndex];
    const rawText = (this.queueIndex === 0) 
      ? `${this.currentArticle.speechNumber || this.currentArticle.number}. ${item.speechText}` 
      : item.speechText;

    const humanizedText = this.humanizeLegalText(rawText);

    // Pré-carrega o próximo trecho em segundo plano para transição instantânea
    if (this.queueIndex + 1 < this.currentQueue.length) {
      const nextItem = this.currentQueue[this.queueIndex + 1];
      const nextText = this.humanizeLegalText(nextItem.speechText);
      this.preloadAudio(nextText);
    }

    this.speakText(humanizedText);
  }

  /**
   * Envia o texto ao backend ElevenLabs, obtém o MP3 e reproduz via HTML5 Audio
   */
  async speakText(text) {
    this.stop();
    if (!text) return;

    this.lastSpokenText = text;
    const humanizedText = this.humanizeLegalText(text);

    // Sinaliza Estado "Preparando áudio..."
    this.isLoading = true;
    this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: true, article: this.currentArticle });

    try {
      const voiceId = this.selectedVoice ? this.selectedVoice.voiceURI : '';
      let audioBlobUrl = this.preloadAudioMap.get(humanizedText);

      if (!audioBlobUrl) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: humanizedText,
            voiceId: voiceId,
            speed: this.speed
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erro HTTP ${response.status} ao gerar áudio na ElevenLabs.`);
        }

        const audioBlob = await response.blob();
        audioBlobUrl = URL.createObjectURL(audioBlob);
      }

      this.audioPlayer.src = audioBlobUrl;
      this.audioPlayer.defaultPlaybackRate = this.speed;
      this.audioPlayer.playbackRate = this.speed;
      await this.audioPlayer.play();
      this.audioPlayer.playbackRate = this.speed;

    } catch (err) {
      console.warn('[AudioEngine ElevenLabs Fallback]', err.message);
      // Fallback nativo imediato sem alertar erro vermelho invasivo
      this.speakWebSpeech(humanizedText);
    }
  }

  /**
   * Sintetizador de Voz Nativa Web Speech (Fallback transparente e resiliente)
   */
  speakWebSpeech(text) {
    if (!('speechSynthesis' in window)) {
      this.isLoading = false;
      this.isPlaying = false;
      this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = this.speed || 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang && (v.lang.includes('pt-BR') || v.lang.includes('pt_BR'))) || voices.find(v => v.lang && v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      this.isLoading = false;
      this.isPlaying = true;
      this.isPaused = false;
      this.listenStartTimestamp = Date.now();
      this.notifyStateChange({
        isPlaying: true,
        isPaused: false,
        isLoading: false,
        article: this.currentArticle,
        voice: { name: ptVoice ? ptVoice.name : 'Voz Nativa' }
      });
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
      if (this.currentArticle && this.isRepeatMode) {
        this.playArticle(this.currentArticle);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[WebSpeech Error]', e);
      this.isPlaying = false;
      this.isLoading = false;
      this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Pré-carregador de Áudio Neural em Segundo Plano para eliminação de latência
   */
  async preloadAudio(text) {
    if (!text || this.preloadAudioMap.has(text)) return;
    try {
      const voiceId = this.selectedVoice ? this.selectedVoice.voiceURI : '';
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, speed: this.speed })
      });
      if (response.ok && response.headers.get('Content-Type')?.includes('audio')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        this.preloadAudioMap.set(text, url);
      }
    } catch {
      // Pré-carregamento é silencioso em caso de falha de rede
    }
  }

  pause() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    if (!this.audioPlayer.paused) {
      this.audioPlayer.pause();
    }
  }

  resume() {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this.notifyStateChange({ isPlaying: true, isPaused: false, isLoading: false, article: this.currentArticle });
      return;
    }
    if (this.audioPlayer.paused && this.audioPlayer.src) {
      this.audioPlayer.play();
    } else if (this.currentArticle) {
      this.speakArticle(this.currentArticle);
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.isPaused) {
      this.resume();
    } else if (this.currentArticle) {
      this.speakArticle(this.currentArticle);
    }
  }

  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;

    if (this.listenStartTimestamp) {
      const elapsedSec = (Date.now() - this.listenStartTimestamp) / 1000;
      StorageModule.addListenTime(elapsedSec, this.speed);
      this.listenStartTimestamp = null;
    }
    this.notifyStateChange({ isPlaying: false, isPaused: false, isLoading: false, article: this.currentArticle });
  }

  stopAudioSource() {
    this.stop();
  }

  seek(seconds) {
    if (this.audioPlayer && this.audioPlayer.duration) {
      this.audioPlayer.currentTime = Math.max(0, Math.min(seconds, this.audioPlayer.duration));
    }
  }

  seekPercent(percent) {
    if (this.audioPlayer && this.audioPlayer.duration) {
      const targetTime = (percent / 100) * this.audioPlayer.duration;
      this.seek(targetTime);
    }
  }

  setSleepTimer(minutes) {
    if (this.sleepTimerId) clearTimeout(this.sleepTimerId);
    if (minutes > 0) {
      this.sleepTimerId = setTimeout(() => {
        this.stop();
        alert('VadeAudio AI: Timer de sono finalizado! Pausando reprodução.');
      }, minutes * 60 * 1000);
    }
  }

  /**
   * Integração com MediaSession API (Tela de Bloqueio, Fones Bluetooth e Central Multimídia / CarPlay)
   */
  setupMediaSession() {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.resume());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('stop', () => this.stop());
        navigator.mediaSession.setActionHandler('seekbackward', () => this.seek(this.audioPlayer.currentTime - 10));
        navigator.mediaSession.setActionHandler('seekforward', () => this.seek(this.audioPlayer.currentTime + 10));
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          if (window.VadeAudioApp && window.VadeAudioApp.playPrevArticle) window.VadeAudioApp.playPrevArticle();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (window.VadeAudioApp && window.VadeAudioApp.playNextArticle) window.VadeAudioApp.playNextArticle();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) this.seek(details.seekTime);
        });
      } catch (err) {
        console.warn('[MediaSession Error]', err);
      }
    }
  }

  updateMediaSession() {
    if ('mediaSession' in navigator) {
      try {
        if (this.currentArticle) {
          const lawId = this.currentArticle.law_id || this.currentArticle.lawId;
          const lawObj = VADE_MECUM_DB.laws.find(l => l.id === lawId);
          const artNum = this.currentArticle.article_display || this.currentArticle.number || `Art. ${this.currentArticle.article}`;
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `${artNum} - ${this.currentArticle.title || ''}`,
            artist: `VadeAudio AI • ${this.selectedVoice ? this.selectedVoice.name : 'Professor de Direito'}`,
            album: lawObj ? lawObj.title : 'Vade Mecum em Áudio',
            artwork: [
              { src: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=512&auto=format&fit=crop', sizes: '512x512', type: 'image/jpeg' }
            ]
          });
        }
        navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : (this.isPaused ? 'paused' : 'none');
      } catch (err) {
        console.warn('[MediaSession Update Error]', err);
      }
    }
  }

  /**
   * Recurso "Professor Explica" (Comentário Didático com Exemplo Prático da Vida Real)
   */
  speakExplanation(article) {
    if (!article) return;
    const expText = article.teacherExplanation || (article.professor_mode ? article.professor_mode.simple_explanation : '');
    if (!expText) return;
    this.stop();
    this.currentArticle = article;
    const artNum = article.speech_number || article.speechNumber || article.article_display || article.number || 'Artigo';
    const text = `Explicação Prática do Professor sobre o ${artNum}. ${expText}`;
    this.speakText(text);
  }

  /**
   * Download de Áudio MP3 para Estudo Offline
   */
  async downloadArticleAudio(article) {
    if (!article) return;
    try {
      const artNum = article.speech_number || article.speechNumber || article.article_display || article.number || 'Artigo';
      const contents = article.content || [{ text: article.official_text || article.text || '', speechText: article.official_text || article.text || '' }];
      const fullText = artNum + '. ' + contents.map(c => c.speechText || c.text).join(' ');
      const humanized = this.humanizeLegalText(fullText);
      const voiceId = this.selectedVoice ? this.selectedVoice.voiceURI : 'xHUwLsLfyqiYOIVTzLRW';

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: humanized,
          voiceId: voiceId,
          speed: this.speed
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar arquivo de áudio para download.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanNum = ((article.article_display || article.number || 'Art') + '').replace(/[^a-zA-Z0-9]/g, '_');
      const lawCode = (article.law_id || article.lawId || 'VADE').toUpperCase();
      a.download = `VadeAudio_${lawCode}_${cleanNum}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      StorageModule.recordDownload(article.id);
      return true;
    } catch (err) {
      console.error('[Download Error]', err);
      if (this.onError) this.onError({ message: 'Não foi possível baixar o áudio: ' + err.message });
      return false;
    }
  }
}
