class StudyModesManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    
    // Flashcard State
    this.currentFcIndex = 0;
    this.quizScore = 0;
    this.flashcardsList = VADE_MECUM_DB.flashcards;

    // Questões de Prova State
    this.currentQuestionIndex = 0;
    this.questionsList = VADE_MECUM_DB.questions || [];

    this.bindEvents();
  }

  bindEvents() {
    // Commute Mode Open/Close
    const btnCommuteHeader = document.getElementById('btn-commute-mode');
    const commuteOverlay = document.getElementById('commute-overlay');
    const btnCloseCommute = document.getElementById('btn-close-commute');

    if (btnCommuteHeader) {
      btnCommuteHeader.addEventListener('click', () => {
        commuteOverlay.classList.remove('hidden');
      });
    }

    if (btnCloseCommute) {
      btnCloseCommute.addEventListener('click', () => {
        commuteOverlay.classList.add('hidden');
      });
    }

    // Commute Prev / Next Buttons
    const btnCommuteNext = document.getElementById('btn-commute-next');
    const btnCommutePrev = document.getElementById('btn-commute-prev');

    if (btnCommuteNext) {
      btnCommuteNext.addEventListener('click', () => {
        this.playNextArticle();
      });
    }

    if (btnCommutePrev) {
      btnCommutePrev.addEventListener('click', () => {
        this.playPrevArticle();
      });
    }

    // Daily Goal Change Button
    const btnDailyGoal = document.getElementById('btn-daily-goal');
    const btnChangeGoal = document.getElementById('btn-change-goal');

    const handleGoalChange = () => {
      const current = StorageModule.getDailyGoal();
      const val = prompt('Defina sua meta diária de estudo em minutos (ex: 15, 30, 45, 60):', current);
      if (val && !isNaN(val) && parseInt(val) > 0) {
        StorageModule.setDailyGoal(parseInt(val));
        this.updateDailyGoalProgress();
        alert(`Meta diária atualizada para ${val} minutos!`);
      }
    };

    if (btnDailyGoal) btnDailyGoal.addEventListener('click', handleGoalChange);
    if (btnChangeGoal) btnChangeGoal.addEventListener('click', handleGoalChange);

    // Create Playlist Button
    const btnCreatePl = document.getElementById('btn-create-playlist');
    if (btnCreatePl) {
      btnCreatePl.addEventListener('click', () => {
        const name = prompt('Nome da nova Playlist de Áudio (ex: Prova de Processo Penal):');
        if (name && name.trim()) {
          const newPl = {
            id: 'pl-' + Date.now(),
            title: name.trim(),
            desc: 'Playlist personalizada criada por você',
            icon: 'fa-solid fa-list-check',
            articleIds: ['cf-art5', 'cp-art121']
          };
          StorageModule.savePlaylist(newPl);
          this.renderPlaylistsView();
          alert('Playlist criada com sucesso!');
        }
      });
    }

    // Mode Switcher Tabs (Flashcards vs Questões)
    const btnModeFc = document.getElementById('btn-mode-flashcards');
    const btnModeQ = document.getElementById('btn-mode-questions');
    const fcModeContainer = document.getElementById('simulado-flashcard-mode');
    const qModeContainer = document.getElementById('simulado-questions-mode');

    if (btnModeFc && btnModeQ) {
      btnModeFc.addEventListener('click', () => {
        btnModeFc.classList.add('active');
        btnModeQ.classList.remove('active');
        fcModeContainer.classList.remove('hidden');
        qModeContainer.classList.add('hidden');
        this.renderFlashcardsView();
      });

      btnModeQ.addEventListener('click', () => {
        btnModeQ.classList.add('active');
        btnModeFc.classList.remove('active');
        qModeContainer.classList.remove('hidden');
        fcModeContainer.classList.add('hidden');
        this.renderQuestionsView();
      });
    }

    // Flashcard Interactions
    const btnFcSpeakQ = document.getElementById('btn-fc-speak-q');
    const btnFcReveal = document.getElementById('btn-fc-reveal');
    const btnFcNext = document.getElementById('btn-fc-next');
    const fcEvalBtns = document.querySelectorAll('.btn-eval');

    if (btnFcSpeakQ) {
      btnFcSpeakQ.addEventListener('click', () => {
        const fc = this.flashcardsList[this.currentFcIndex];
        if (fc) this.audioEngine.speakText(`Pergunta do Quiz: ${fc.question}`);
      });
    }

    if (btnFcReveal) {
      btnFcReveal.addEventListener('click', () => {
        const fc = this.flashcardsList[this.currentFcIndex];
        const ansWrap = document.getElementById('fc-answer-wrap');
        const evalBtns = document.getElementById('fc-eval-btns');
        
        if (ansWrap) ansWrap.classList.remove('hidden');
        if (evalBtns) evalBtns.classList.remove('hidden');
        
        // Read answer
        if (fc) {
          this.audioEngine.speakText(`Resposta correta: ${fc.answerArticle}. ${fc.answerText}`);
        }
      });
    }

    if (btnFcNext) {
      btnFcNext.addEventListener('click', () => {
        this.nextFlashcard();
      });
    }

    fcEvalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const evalType = btn.dataset.eval;
        if (evalType === 'good') {
          this.quizScore += 10;
        }
        document.getElementById('quiz-score').innerText = this.quizScore;
        this.nextFlashcard();
      });
    });

    // Questões de Prova Interactions
    const btnQSpeakStem = document.getElementById('btn-q-speak-stem');
    const btnQNext = document.getElementById('btn-q-next');

    if (btnQSpeakStem) {
      btnQSpeakStem.addEventListener('click', () => {
        const q = this.questionsList[this.currentQuestionIndex];
        if (q) this.audioEngine.speakText(`Questão de Prova: ${q.questionText}`);
      });
    }

    if (btnQNext) {
      btnQNext.addEventListener('click', () => {
        this.nextQuestion();
      });
    }
  }

  playNextArticle() {
    if (!this.audioEngine.currentArticle) return;
    const currentId = this.audioEngine.currentArticle.id;
    const articles = VADE_MECUM_DB.articles;
    const idx = articles.findIndex(a => a.id === currentId);
    if (idx >= 0 && idx < articles.length - 1) {
      this.audioEngine.speakArticle(articles[idx + 1]);
    }
  }

  playPrevArticle() {
    if (!this.audioEngine.currentArticle) return;
    const currentId = this.audioEngine.currentArticle.id;
    const articles = VADE_MECUM_DB.articles;
    const idx = articles.findIndex(a => a.id === currentId);
    if (idx > 0) {
      this.audioEngine.speakArticle(articles[idx - 1]);
    }
  }

  renderPlaylistsView() {
    const grid = document.getElementById('playlists-grid');
    if (!grid) return;

    const playlists = StorageModule.getPlaylists();
    grid.innerHTML = '';

    playlists.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      card.innerHTML = `
        <div>
          <div class="playlist-icon"><i class="${pl.icon}"></i></div>
          <h3 style="font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; margin-top: 12px; margin-bottom: 6px;">${pl.title}</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${pl.desc}</p>
          <div style="font-size: 0.78rem; color: var(--accent-amber); margin-top: 10px; font-weight: 600;">
            <i class="fa-solid fa-layer-group"></i> ${pl.articleIds.length} artigos inclusos
          </div>
        </div>
        <button class="btn-primary btn-play-pl" data-id="${pl.id}">
          <i class="fa-solid fa-play"></i> Ouvir Playlist
        </button>
      `;

      card.querySelector('.btn-play-pl').addEventListener('click', () => {
        this.playPlaylist(pl);
      });

      grid.appendChild(card);
    });

    document.getElementById('playlist-count').innerText = playlists.length;
  }

  playPlaylist(playlist) {
    const articles = playlist.articleIds
      .map(id => VADE_MECUM_DB.articles.find(a => a.id === id))
      .filter(Boolean);

    if (articles.length > 0) {
      this.audioEngine.speakArticle(articles[0]);
      alert(`Iniciando a reprodução da playlist "${playlist.title}"!`);
    }
  }

  renderFlashcardsView() {
    const fc = this.flashcardsList[this.currentFcIndex];
    if (!fc) return;

    document.getElementById('fc-category').innerText = fc.category;
    document.getElementById('fc-question-text').innerText = fc.question;
    document.getElementById('fc-answer-article').innerText = fc.answerArticle;
    document.getElementById('fc-answer-text').innerText = fc.answerText;

    // Reset visibility
    document.getElementById('fc-answer-wrap').classList.add('hidden');
    document.getElementById('fc-eval-btns').classList.add('hidden');

    // Read question automatically
    this.audioEngine.speakText(`Simulado em Áudio. Matéria: ${fc.category}. Pergunta: ${fc.question}`);
  }

  nextFlashcard() {
    this.currentFcIndex = (this.currentFcIndex + 1) % this.flashcardsList.length;
    this.renderFlashcardsView();
  }

  renderQuestionsView() {
    const q = this.questionsList[this.currentQuestionIndex];
    if (!q) return;

    document.getElementById('q-category').innerText = q.category;
    document.getElementById('q-exam-badge').innerText = q.exam;
    document.getElementById('q-stem-text').innerText = q.questionText;

    const expWrap = document.getElementById('q-explanation-wrap');
    if (expWrap) expWrap.classList.add('hidden');

    const optionsContainer = document.getElementById('q-options-container');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'display:flex; text-align:left; gap:12px; padding:14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:var(--text-main); cursor:pointer; transition:all 0.2s ease; font-size:0.92rem;';
      btn.innerHTML = `<strong style="color:var(--accent-amber);">${letters[index]})</strong> <span>${optText}</span>`;

      btn.addEventListener('click', () => {
        // Disable all options
        optionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);

        if (index === q.correctIndex) {
          btn.style.background = 'rgba(16, 185, 129, 0.2)';
          btn.style.borderColor = '#10b981';
          this.quizScore += 20;
          document.getElementById('quiz-score').innerText = this.quizScore;
          this.audioEngine.speakText(`Opção correta! ${q.speechExplanation}`);
        } else {
          btn.style.background = 'rgba(239, 68, 68, 0.2)';
          btn.style.borderColor = '#ef4444';
          
          // Highlight correct option
          const correctBtn = optionsContainer.children[q.correctIndex];
          if (correctBtn) {
            correctBtn.style.background = 'rgba(16, 185, 129, 0.2)';
            correctBtn.style.borderColor = '#10b981';
          }
          this.audioEngine.speakText(`Opção incorreta. ${q.speechExplanation}`);
        }

        const expText = document.getElementById('q-explanation-text');
        if (expText) expText.innerText = q.explanation;
        if (expWrap) expWrap.classList.remove('hidden');
      });

      optionsContainer.appendChild(btn);
    });

    // Auto speak question stem
    this.audioEngine.speakText(`Questão de Prova de ${q.category}. ${q.questionText}`);
  }

  nextQuestion() {
    this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questionsList.length;
    this.renderQuestionsView();
  }

  updateDailyGoalProgress() {
    const stats = StorageModule.getStats();
    const minutesListened = Math.round(stats.secondsListened / 60);
    const goalMins = StorageModule.getDailyGoal();

    const pct = Math.min(100, Math.round((minutesListened / goalMins) * 100));

    const headerVal = document.getElementById('header-goal-val');
    if (headerVal) headerVal.innerText = `${minutesListened}/${goalMins} min`;

    const goalLabel = document.getElementById('goal-progress-label');
    if (goalLabel) goalLabel.innerText = `Progresso de Hoje: ${minutesListened} de ${goalMins} min (${pct}%)`;

    const goalBar = document.getElementById('goal-bar-fill');
    if (goalBar) goalBar.style.width = `${pct}%`;
  }

  renderAnalyticsView() {
    const stats = StorageModule.getStats();
    
    const minutesListened = Math.round(stats.secondsListened / 60);
    // Saved time calculation (comparing 1.5x average listening vs 1x standard reading)
    const minutesSaved = Math.round(minutesListened * 0.4);

    document.getElementById('stat-total-min').innerText = `${minutesListened} min`;
    document.getElementById('stat-articles-read').innerText = stats.articlesCompleted;
    document.getElementById('stat-time-saved').innerText = `${minutesSaved} min`;
    document.getElementById('stat-streak').innerText = `${stats.streakDays} ${stats.streakDays === 1 ? 'dia' : 'dias'}`;
    
    document.getElementById('header-time-val').innerText = `${minutesListened} min`;

    this.updateDailyGoalProgress();

    // Render Dynamic Subject Breakdown Bars (14 Subjects)
    const subjectBars = document.getElementById('subject-breakdown-bars');
    const subStats = StorageModule.getSubjectStats();
    if (subjectBars) {
      const activeSubjects = VADE_MECUM_DB.subjects.map(s => {
        const d = subStats[s.id] || { correct: 0, total: 0 };
        const rate = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
        return { ...s, ...d, rate };
      }).sort((a, b) => b.total - a.total);

      subjectBars.innerHTML = activeSubjects.map(sub => {
        const barColor = sub.total === 0 ? '#64748b' : sub.rate >= 70 ? '#10b981' : sub.rate >= 50 ? '#f59e0b' : '#ef4444';
        const displayTxt = sub.total > 0 ? `${sub.rate}% (${sub.correct}/${sub.total})` : 'Ainda não praticado';
        return `
          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span><i class="${sub.icon}" style="color:${sub.color};"></i> ${sub.name}</span>
              <span style="color:${barColor}; font-weight:700;">${displayTxt}</span>
            </div>
            <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:100px; overflow:hidden;">
              <div style="width:${sub.total > 0 ? sub.rate : 0}%; height:100%; background:${barColor}; border-radius:100px; transition:width 0.6s ease;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderSrsView() {
    const srsItems = StorageModule.getSrsItems();
    const dueItems = StorageModule.getSrsDueItems();
    const container = document.getElementById('srs-articles-list');
    const srsDueVal = document.getElementById('srs-due-val');
    const srsTotalVal = document.getElementById('srs-total-val');
    const srsBadge = document.getElementById('srs-count');

    // Hook up play all button once
    const btnPlayAllSrs = document.getElementById('btn-play-all-srs');
    if (btnPlayAllSrs && !btnPlayAllSrs.dataset.bound) {
      btnPlayAllSrs.dataset.bound = 'true';
      btnPlayAllSrs.addEventListener('click', () => {
        const due = StorageModule.getSrsDueItems();
        if (due.length === 0) {
          alert('Parabéns! Não há revisões pendentes para hoje.');
          return;
        }
        const articles = due
          .map(item => VADE_MECUM_DB.articles.find(a => a.id === item.articleId))
          .filter(Boolean);

        if (articles.length > 0) {
          this.audioEngine.userQueue = [...articles.slice(1)];
          StorageModule.saveAudioQueue(this.audioEngine.userQueue);
          if (this.audioEngine.onQueueUpdated) this.audioEngine.onQueueUpdated(this.audioEngine.userQueue);
          this.audioEngine.speakArticle(articles[0]);
        }
      });
    }

    if (srsDueVal) srsDueVal.innerText = dueItems.length;
    if (srsTotalVal) srsTotalVal.innerText = srsItems.length;
    if (srsBadge) {
      srsBadge.innerText = dueItems.length;
      srsBadge.classList.toggle('hidden', dueItems.length === 0);
    }

    if (!container) return;
    container.innerHTML = '';

    if (srsItems.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px; color:var(--text-muted);">
          <i class="fa-solid fa-brain" style="font-size:2.5rem; margin-bottom:12px; opacity:0.5;"></i>
          <p>Nenhum artigo adicionado ao ciclo de repetição espaçada ainda.</p>
          <p style="font-size:0.8rem; margin-top:6px;">No Leitor de Leis, clique em <strong>"🧠 Revisar"</strong> em qualquer artigo para incluí-lo no algoritmo de memorização.</p>
        </div>
      `;
      return;
    }

    srsItems.forEach(item => {
      const art = VADE_MECUM_DB.articles.find(a => a.id === item.articleId);
      if (!art) return;

      const isDue = item.nextReviewDate <= Date.now();
      const levelLabels = ['Nível 1 (1 dia)', 'Nível 2 (3 dias)', 'Nível 3 (7 dias)', 'Nível 4 (14 dias)', 'Nível 5 (30 dias)'];
      const levelTxt = levelLabels[item.level] || 'Nível 1';

      const card = document.createElement('div');
      card.className = `article-card ${isDue ? 'reading-active' : ''}`;
      card.innerHTML = `
        <div class="art-header">
          <div class="art-number">
            <i class="fa-solid fa-arrows-spin text-amber"></i>
            <span>${art.number} - ${art.title}</span>
            <span class="tag-oab" style="background:${isDue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)'}; border-color:${isDue ? '#ef4444' : '#38bdf8'}; color:${isDue ? '#f87171' : '#38bdf8'};">
              ${isDue ? '🔥 Revisão Pendente' : `Próxima: ${new Date(item.nextReviewDate).toLocaleDateString('pt-BR')}`}
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${levelTxt}</span>
          </div>
          <div class="art-actions">
            <button class="btn-art-play" data-id="${art.id}" title="Ouvir Artigo"><i class="fa-solid fa-play"></i></button>
            <button class="btn-srs-correct btn-secondary" style="color:#10b981;" title="Acertei / Avançar Nível"><i class="fa-solid fa-check"></i> Fixado</button>
            <button class="btn-srs-wrong btn-secondary" style="color:#f87171;" title="Errei / Reiniciar"><i class="fa-solid fa-rotate-left"></i> Dúvida</button>
          </div>
        </div>
        <div class="art-body">
          <p style="font-size:0.85rem; color:var(--text-muted);">${art.aiSummary || art.content[0]?.text || ''}</p>
        </div>
      `;

      card.querySelector('.btn-art-play').addEventListener('click', () => {
        this.audioEngine.speakArticle(art);
      });

      card.querySelector('.btn-srs-correct').addEventListener('click', () => {
        StorageModule.addOrUpdateSrsItem(art.id, true);
        this.renderSrsView();
      });

      card.querySelector('.btn-srs-wrong').addEventListener('click', () => {
        StorageModule.addOrUpdateSrsItem(art.id, false);
        this.renderSrsView();
      });

      container.appendChild(card);
    });
  }
}
