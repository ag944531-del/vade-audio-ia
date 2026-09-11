/**
 * VadeAudio AI - Serviço de Reconhecimento de Voz (Speech-to-Text)
 * Camada isolada e desacoplada para conversão de áudio do microfone em texto.
 * Utiliza a Web Speech API com idioma Português do Brasil (pt-BR).
 */

class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onErrorCallback = null;

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = false; // Frase por frase para validação do usuário
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStartCallback) this.onStartCallback();
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (this.onResultCallback && currentText) {
          this.onResultCallback(currentText.trim(), !!finalTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        console.warn('[SpeechRecognitionService] Erro na captura de voz:', event.error);
        if (this.onErrorCallback) this.onErrorCallback(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) this.onEndCallback();
      };
    } else {
      console.warn('[SpeechRecognitionService] Web Speech API não é suportada neste navegador.');
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  start(onResult, onStart, onEnd, onError) {
    if (!this.isSupported()) {
      if (onError) onError('not_supported');
      return false;
    }

    this.onResultCallback = onResult;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('[SpeechRecognitionService] Falha ao iniciar gravação:', err);
      if (onError) onError(err);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[SpeechRecognitionService] Falha ao parar gravação:', err);
      }
    }
    this.isListening = false;
  }

  abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (err) {
        console.warn('[SpeechRecognitionService] Falha ao abortar gravação:', err);
      }
    }
    this.isListening = false;
  }
}
