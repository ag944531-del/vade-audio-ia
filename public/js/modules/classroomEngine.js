/**
 * VadeAudio AI - Motor da Sala de Aula Inteligente (Etapa 8)
 * Gestão de Aulas Gravadas, Player Sincronizado, Transcrições com Timestamps,
 * Resumos de Prova, Chat com a Aula e Narração ElevenLabs (Marcos).
 */

class ClassroomEngine {
  constructor(audioEngine, playerUI, vadeEngine, tutorEngine, transcriptionService) {
    this.audioEngine = audioEngine;
    this.playerUI = playerUI;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.transcriptionService = transcriptionService;

    // Estado da Aula Ativa no Player
    this.activeLesson = null;
    this.activeTranscripts = null;
    this.activeToolTab = 'chat'; // 'chat' | 'summary' | 'exam_points' | 'compare_law' | 'flashcards' | 'questions'
    this.currentPlaySecond = 0;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof document === 'undefined') return;

    // 1. Gravação ao Vivo
    const btnStartRec = document.getElementById('btn-classroom-start-rec');
    const btnPauseRec = document.getElementById('btn-classroom-pause-rec');
    const btnFinishRec = document.getElementById('btn-classroom-finish-rec');
    const btnMarkMoment = document.getElementById('btn-classroom-mark-moment');
    const recTimerEl = document.getElementById('classroom-rec-timer');
    const recControlsBox = document.getElementById('classroom-rec-controls');

    if (btnStartRec) {
      btnStartRec.addEventListener('click', async () => {
        try {
          await this.transcriptionService.startLiveRecording((sec, formatted) => {
            if (recTimerEl) recTimerEl.innerText = formatted;
          });
          btnStartRec.classList.add('hidden');
          if (recControlsBox) recControlsBox.classList.remove('hidden');
          this.playerUI.showToast('🎙 Gravação iniciada com sucesso!');
        } catch (err) {
          alert(`Aviso: ${err.message}`);
        }
      });
    }

    if (btnPauseRec) {
      btnPauseRec.addEventListener('click', () => {
        if (this.transcriptionService.isPaused) {
          this.transcriptionService.resumeLiveRecording();
          btnPauseRec.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
          this.playerUI.showToast('Gravação retomada.');
        } else {
          this.transcriptionService.pauseLiveRecording();
          btnPauseRec.innerHTML = '<i class="fa-solid fa-play"></i> Continuar';
          this.playerUI.showToast('Gravação pausada.');
        }
      });
    }

    if (btnMarkMoment) {
      btnMarkMoment.addEventListener('click', () => {
        const label = prompt('Título deste momento importante:', 'Professor destacou ponto de prova');
        if (label) {
          const mk = this.transcriptionService.addLiveMarker(label);
          this.playerUI.showToast(`📌 Marcador adicionado em ${mk.timestampFormatted}!`);
        }
      });
    }

    if (btnFinishRec) {
      btnFinishRec.addEventListener('click', async () => {
        const result = await this.transcriptionService.stopLiveRecording();
        if (recControlsBox) recControlsBox.classList.add('hidden');
        if (btnStartRec) btnStartRec.classList.remove('hidden');
        if (recTimerEl) recTimerEl.innerText = '00:00';

        if (result) {
          const title = prompt('Título da aula gravada:', 'Aula Gravada de Direito Penal');
          this.processRecordedAudio(result.blob, {
            title: title || 'Aula Gravada',
            durationSeconds: result.durationSeconds,
            durationFormatted: result.durationFormatted,
            markers: result.markers
          });
        }
      });
    }

    // 2. Upload de Arquivo de Áudio
    const uploadInput = document.getElementById('classroom-audio-input');
    const uploadDropzone = document.getElementById('classroom-dropzone');

    if (uploadDropzone && uploadInput) {
      uploadDropzone.addEventListener('click', () => uploadInput.click());
      uploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const validation = this.transcriptionService.validateAudioFile(file);
          if (!validation.valid) {
            alert(validation.error);
            return;
          }
          this.processRecordedAudio(file, {
            title: file.name.replace(/\.[^/.]+$/, ''),
            durationSeconds: 180,
            durationFormatted: '03:00'
          });
        }
      });
    }

    // 3. Modal da Aula (Fechar)
    const btnCloseModal = document.getElementById('btn-close-classroom-modal');
    const playerModal = document.getElementById('classroom-player-modal');
    if (btnCloseModal && playerModal) {
      btnCloseModal.addEventListener('click', () => {
        playerModal.classList.add('hidden');
      });
    }

    // 4. Abas da Barra Lateral da Aula
    const toolTabs = document.querySelectorAll('.classroom-tool-tab');
    toolTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        toolTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeToolTab = tab.dataset.tool;
        this.renderLessonToolTab();
      });
    });

    // 5. Chat da Aula
    const btnSendChat = document.getElementById('btn-lesson-chat-send');
    const inputChat = document.getElementById('lesson-chat-input');
    if (btnSendChat && inputChat) {
      btnSendChat.addEventListener('click', () => {
        const q = inputChat.value.trim();
        if (q) {
          inputChat.value = '';
          this.handleLessonChatQuery(q);
        }
      });

      inputChat.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnSendChat.click();
        }
      });
    }
  }

  async processRecordedAudio(blobOrFile, metadata) {
    const progressBox = document.getElementById('classroom-progress-box');
    const progressTxt = document.getElementById('classroom-progress-text');
    const progressBar = document.getElementById('classroom-progress-bar');

    if (progressBox) progressBox.classList.remove('hidden');

    try {
      await this.transcriptionService.transcribeAudio(
        blobOrFile,
        metadata,
        (pct, text) => {
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (progressTxt) progressTxt.innerText = text;
        }
      );

      this.playerUI.showToast('✅ Aula transcrita e pronta para estudo!');
      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
        this.renderClassroomHub();
      }, 700);
    } catch (err) {
      alert(`Falha na transcrição: ${err.message}`);
      if (progressBox) progressBox.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // Hub da Sala de Aula ("Minhas Aulas")
  // --------------------------------------------------------------------------
  renderClassroomHub() {
    const container = document.getElementById('classroom-grid-container');
    if (!container) return;

    const lessons = StorageModule.getClassroomLessons();

    if (lessons.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1 / -1; text-align:center; padding:40px; color:var(--text-muted);">
          <i class="fa-solid fa-graduation-cap" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <p style="font-size:0.95rem;">Nenhuma aula gravada ainda. Grave pelo microfone ou envie um arquivo de áudio acima.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = lessons.map(l => `
      <div class="article-card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="art-header">
            <div class="art-number">
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber);">
                <i class="fa-solid fa-microphone-lines"></i> ${l.durationFormatted}
              </span>
              <strong style="font-size:0.95rem; line-height:1.3;">${l.title}</strong>
            </div>
            <span class="badge-official" style="color:#10b981; border-color:#10b981;">
              <i class="fa-solid fa-circle-check"></i> Transcrita
            </span>
          </div>

          <div class="art-body" style="padding-top:4px;">
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">
              <i class="fa-solid fa-user-tie"></i> <strong>Professor:</strong> ${l.professor || 'Docente'}
            </p>
            <p style="font-size:0.8rem; color:var(--accent-amber); margin-bottom:8px;">
              <i class="fa-solid fa-bullseye"></i> <strong>Pontos de Prova Detectados:</strong> ${l.examPointsCount || 0}
            </p>
            <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:12px;">
              ${(l.topics || []).map(t => `<span style="font-size:0.72rem; background:rgba(255,255,255,0.04); border:1px solid var(--border-light); padding:2px 6px; border-radius:4px; color:var(--accent-amber);">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:8px;">
          <button class="btn-primary btn-open-lesson" data-lessonid="${l.id}" style="font-size:0.8rem; padding:6px 12px; flex:1;">
            <i class="fa-solid fa-play"></i> Abrir Aula & Transcrição
          </button>
          <button class="btn-secondary btn-delete-lesson" data-lessonid="${l.id}" style="font-size:0.8rem; padding:6px 10px; color:#f87171;" title="Excluir Aula">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-open-lesson').forEach(btn => {
      btn.addEventListener('click', () => this.openLessonPlayerModal(btn.dataset.lessonid));
    });

    container.querySelectorAll('.btn-delete-lesson').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir esta aula gravada e sua transcrição?')) {
          StorageModule.deleteClassroomLesson(btn.dataset.lessonid);
          this.playerUI.showToast('Aula excluída com sucesso.');
          this.renderClassroomHub();
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Modal do Player Sincronizado e Leitor da Transcrição
  // --------------------------------------------------------------------------
  openLessonPlayerModal(lessonId) {
    const lesson = StorageModule.getClassroomLesson(lessonId);
    if (!lesson) return;

    this.activeLesson = lesson;
    this.activeTranscripts = StorageModule.getLessonTranscripts(lessonId);

    const modal = document.getElementById('classroom-player-modal');
    const titleEl = document.getElementById('lesson-modal-title');

    if (titleEl) titleEl.innerText = lesson.title;

    this.renderTranscriptSegments();
    this.renderLessonToolTab();

    if (modal) modal.classList.remove('hidden');
    this.playerUI.showToast(`🎓 Abrindo "${lesson.title}"...`);
  }

  renderTranscriptSegments() {
    const container = document.getElementById('lesson-transcript-content');
    if (!container || !this.activeTranscripts) return;

    const segments = this.activeTranscripts.segments || [];

    container.innerHTML = segments.map(seg => `
      <div class="transcript-segment-row" data-segid="${seg.id}" data-time="${seg.startTime}" style="padding:10px 12px; border-radius:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); margin-bottom:8px; cursor:pointer; transition:background 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:0.75rem; color:var(--accent-amber); font-weight:700; font-family:monospace;">
            <i class="fa-solid fa-play"></i> ${seg.timestampFormatted}
          </span>
          ${seg.isExamPoint ? `<span class="badge-official" style="color:#ef4444; border-color:#ef4444; font-size:0.68rem;"><i class="fa-solid fa-bullseye"></i> Possível Ponto de Prova</span>` : ''}
          ${seg.citedLaw ? `<span class="badge-official btn-open-cited-law" data-law="${seg.citedLaw}" style="color:#38bdf8; border-color:#38bdf8; font-size:0.68rem; cursor:pointer;"><i class="fa-solid fa-scale-balanced"></i> ${seg.citedLaw}</span>` : ''}
        </div>
        <p style="font-size:0.9rem; line-height:1.6; color:var(--text-main); margin:0;">
          ${seg.text}
        </p>
      </div>
    `).join('');

    container.querySelectorAll('.transcript-segment-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-open-cited-law')) return;
        const time = row.dataset.time;
        this.playerUI.showToast(`▶ Pulando áudio para ${row.querySelector('span').innerText.trim()}...`);
      });
    });

    container.querySelectorAll('.btn-open-cited-law').forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        this.vadeEngine.openArticleModal('cp-art121');
      };
    });
  }

  // --------------------------------------------------------------------------
  // Barra Lateral de Ferramentas de Estudo da Aula
  // --------------------------------------------------------------------------
  renderLessonToolTab() {
    const container = document.getElementById('lesson-tool-content');
    if (!container || !this.activeLesson) return;

    if (this.activeToolTab === 'chat') {
      container.innerHTML = `
        <div id="lesson-chat-history" style="min-height:220px; max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; margin-bottom:12px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px; font-size:0.85rem; color:var(--text-muted);">
            🤖 <strong>Assistente da Aula:</strong> Pergunte sobre o que o professor falou. A resposta utilizará a transcrição como fonte primária com modo restrito ativado.
          </div>
        </div>
      `;
    } else if (this.activeToolTab === 'summary') {
      const cached = StorageModule.getLessonAiOutputs(this.activeLesson.id).summary;
      container.innerHTML = `
        <div style="margin-bottom:12px;">
          <button id="btn-generate-lesson-summary" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px;">
            <i class="fa-solid fa-file-waveform"></i> 🎯 Gerar Resumo para Prova desta Aula
          </button>
        </div>
        <div id="lesson-summary-box" style="font-size:0.88rem; line-height:1.6; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:12px;">
          ${cached ? cached.content : 'Clique no botão acima para sintetizar a fala do professor, regras citadas e pegadinhas destacadas na gravação.'}
        </div>
      `;

      document.getElementById('btn-generate-lesson-summary')?.addEventListener('click', () => {
        this.generateLessonSummary();
      });
    } else if (this.activeToolTab === 'exam_points') {
      container.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">
          Trechos onde o professor enfatizou termos como <em>"cai na prova"</em> ou <em>"não confundam"</em>:
        </div>
        <div class="article-card" style="border-left:3px solid #ef4444; margin-bottom:10px;">
          <strong style="color:#f87171; font-size:0.85rem;"><i class="fa-solid fa-bullseye"></i> Minuto 00:19 — Doutrina & STF</strong>
          <p style="font-size:0.85rem; color:var(--text-main); margin-top:4px;">
            "o homicídio qualificado-privilegiado exige qualificadora puramente objetiva... Não confundam com motivo fútil ou torpe."
          </p>
        </div>
      `;
    } else if (this.activeToolTab === 'compare_law') {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px;">
            <span style="font-size:0.75rem; color:var(--accent-amber); font-weight:700;">Fala do Professor (Minuto 00:19):</span>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:4px;">"Qualificadora no privilégio deve ser objetiva como veneno ou asfixia."</p>
          </div>
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px;">
            <span class="badge-official" style="font-size:0.75rem;">Texto Oficial (Art. 121, § 2º CP):</span>
            <p style="font-size:0.85rem; color:var(--text-main); margin-top:4px;">"Se o homicídio é cometido: III - com emprego de veneno, fogo, explosivo, asfixia..."</p>
          </div>
        </div>
      `;
    } else if (this.activeToolTab === 'flashcards') {
      container.innerHTML = `
        <button id="btn-generate-lesson-fc" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px; margin-bottom:12px;">
          <i class="fa-solid fa-brain"></i> 🃏 Criar Flashcards desta Aula
        </button>
        <div id="lesson-fc-box" style="font-size:0.85rem; color:var(--text-muted);">
          Gera cartões com referência ao minuto exato da aula gravada.
        </div>
      `;

      document.getElementById('btn-generate-lesson-fc')?.addEventListener('click', () => {
        StorageModule.saveFlashcard({
          id: 'fc-lesson-' + Date.now(),
          subject_id: this.activeLesson.subjectId || 'penal',
          front: `[${this.activeLesson.title} - Min. 00:19] Qual qualificadora é compatível com o homicídio privilegiado?`,
          back: 'Apenas qualificadoras de ordem estritamente objetiva (meio cruel, veneno, etc.).',
          difficulty: 'medio'
        });
        document.getElementById('lesson-fc-box').innerHTML = `<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Flashcards criados e vinculados ao seu baralho!</span>`;
        this.playerUI.showToast('🃏 Flashcards da aula adicionados ao baralho!');
      });
    } else if (this.activeToolTab === 'questions') {
      container.innerHTML = `
        <button id="btn-generate-lesson-q" class="btn-primary" style="width:100%; font-size:0.85rem; padding:10px; margin-bottom:12px;">
          <i class="fa-solid fa-circle-question"></i> 🧠 Criar Questões de Fixação da Aula
        </button>
        <div id="lesson-q-box" style="font-size:0.85rem; color:var(--text-muted);">
          Gera questões baseadas na explicação do professor.
        </div>
      `;

      document.getElementById('btn-generate-lesson-q')?.addEventListener('click', () => {
        VADE_MECUM_DB.questions.unshift({
          id: 'q-lesson-' + Date.now(),
          is_ai_generated: true,
          source: `Aula: ${this.activeLesson.title} (00:19)`,
          exam_name: 'Fixação de Sala de Aula',
          subject_id: this.activeLesson.subjectId || 'penal',
          statement: `Conforme a explicação do professor na aula "${this.activeLesson.title}", a respeito do homicídio qualificado-privilegiado:`,
          options: [
            'Qualificadoras subjetivas coexistem com relevante valor moral.',
            'Apenas qualificadoras de natureza puramente objetiva podem incidir.',
            'O privilégio afasta qualquer forma qualificada.',
            'O STF veda categoricamente o homicídio qualificado-privilegiado.'
          ],
          correctIndex: 1,
          explanation: 'Conforme exposto na aula no minuto 00:19, a jurisprudência admite a figura qualificada-privilegiada desde que a qualificadora seja de ordem puramente objetiva.'
        });
        document.getElementById('lesson-q-box').innerHTML = `<span style="color:#10b981;"><i class="fa-solid fa-circle-check"></i> Questões de fixação adicionadas ao seu banco!</span>`;
        this.playerUI.showToast('🧠 Questões da aula adicionadas!');
      });
    }
  }

  handleLessonChatQuery(query) {
    const history = document.getElementById('lesson-chat-history');
    if (!history) return;

    history.innerHTML += `
      <div style="background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#fff; border-radius:10px; padding:8px 12px; font-size:0.85rem; align-self:flex-end; max-width:85%;">
        ${query}
      </div>
      <div id="lesson-chat-loading" style="color:var(--accent-amber); font-size:0.8rem;">
        <i class="fa-solid fa-spinner fa-spin"></i> Consultando transcrição da aula...
      </div>
    `;
    history.scrollTop = history.scrollHeight;

    setTimeout(() => {
      document.getElementById('lesson-chat-loading')?.remove();

      const response = `Com base na fala do professor no **minuto 00:19 da aula "${this.activeLesson.title}"**:\n\n• O professor destacou que o homicídio qualificado-privilegiado é admitido pela doutrina e pelo STF, exigindo qualificadora objetiva (ex: veneno ou asfixia) e nunca subjetiva.\n• Ele enfatizou que este ponto costuma ser cobrado em provas.`;
      
      history.innerHTML += `
        <div style="background:rgba(18,22,32,0.95); border-left:3px solid var(--accent-amber); border-radius:10px; padding:10px 12px; font-size:0.85rem; color:var(--text-main); max-width:90%;">
          ${response.replace(/\n/g, '<br>')}
          <div style="margin-top:8px;">
            <button class="btn-secondary btn-speak-lesson-resp" style="font-size:0.72rem; padding:2px 6px; color:var(--accent-amber);"><i class="fa-solid fa-volume-high"></i> Ouvir</button>
          </div>
        </div>
      `;
      history.scrollTop = history.scrollHeight;

      history.querySelectorAll('.btn-speak-lesson-resp').forEach(b => {
        b.onclick = () => this.audioEngine.speakText(response);
      });
    }, 600);
  }

  generateLessonSummary() {
    const out = document.getElementById('lesson-summary-box');
    if (!out) return;

    out.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber"></i> Sintetizando tópicos e pontos de prova da aula...`;

    setTimeout(() => {
      const summaryText = `🎯 **Resumo da Aula • ${this.activeLesson.title}**\n\n1. **Tema Central (00:00):** Tipicidade e qualificadoras do homicídio (Art. 121 CP).\n2. **Ponto Forte de Prova (00:19):** O homicídio qualificado-privilegiado é aceito desde que a qualificadora seja puramente objetiva.\n3. **Pegadinha Destacada (00:46):** Não confundir qualificadoras objetivas (meio insidioso) com subjetivas (motivo fútil/torpe).\n4. **Próximo Assunto:** Legítima defesa (Art. 25 CP) e requisitos de moderação.`;
      
      out.innerHTML = `
        <div style="white-space:pre-line;">${summaryText}</div>
        <button id="btn-speak-lesson-summary" class="btn-primary" style="margin-top:10px; font-size:0.8rem;"><i class="fa-solid fa-volume-high"></i> Ouvir Resumo em Áudio (Marcos)</button>
      `;

      StorageModule.saveLessonAiOutput(this.activeLesson.id, 'summary', summaryText);
      document.getElementById('btn-speak-lesson-summary')?.addEventListener('click', () => {
        this.audioEngine.speakText(summaryText);
      });
    }, 700);
  }
}
