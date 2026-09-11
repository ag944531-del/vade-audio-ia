/**
 * VadeAudio AI - StudyRoomEngine (Etapa 45)
 * Controlador de Interface da Central de Salas de Estudo Colaborativas em Tempo Real.
 * Quizzes Síncronos, Pomodoro Compartilhado, Chat Acadêmico e Tutoria Vocal com Marcos.
 */

class StudyRoomEngine {
  constructor(storage, realtimeService, activityService, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.realtime = realtimeService || (typeof StudyRoomRealtimeService !== 'undefined' ? new StudyRoomRealtimeService(storage) : null);
    this.activityService = activityService || (typeof StudyRoomActivityService !== 'undefined' ? StudyRoomActivityService : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.currentRoom = null;
    this.currentUser = { id: 'user_me', name: 'Você (Aluno)' };
  }

  renderStudio() {
    const container = document.getElementById('study-rooms-content-container') || document.getElementById('view-study-rooms');
    if (!container) return;

    if (!this.currentRoom) {
      this.renderLobby(container);
    } else {
      this.renderActiveRoom(container);
    }
  }

  renderLobby(container) {
    const rooms = this.storage ? this.storage.getStudyRooms() : [];

    container.innerHTML = `
      <!-- Header do Lobby de Salas -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-weight:700;">ETAPA 45</span>
            <span style="font-size:0.75rem; color:#34d399;"><i class="fa-solid fa-users"></i> Salas de Estudo Colaborativas</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-people-group text-amber"></i> Estude em Grupo em Tempo Real
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Crie salas privadas, resolva quizzes síncronos, compartilhe Pomodoro e debata teses com colegas.</p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" id="input-room-code" placeholder="Código (ex: PENAL-8K4D)" style="background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:7px 12px; color:#fff; font-size:0.82rem; width:180px; text-transform:uppercase;">
          <button id="btn-join-room-code" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;"><i class="fa-solid fa-arrow-right-to-bracket text-amber"></i> Entrar</button>
          <button id="btn-create-room-modal" class="btn-primary" style="padding:7px 16px; font-size:0.82rem;"><i class="fa-solid fa-plus"></i> Criar Sala</button>
        </div>
      </div>

      <!-- Grid de Salas Recentes e Minhas Salas -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <!-- Card Padrão de Demonstração -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.7rem;">CIVIL-9F2A</span>
              <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-circle" style="font-size:0.55rem;"></i> 3 Online</span>
            </div>
            <h3 style="font-size:1.05rem; color:var(--text-main); margin:0 0 6px 0;">Revisão P1: Responsabilidade Civil</h3>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 14px 0;">Foco em Danos Morais, Súmula 479 do STJ e Fortuito Interno.</p>
          </div>
          <button class="btn-secondary btn-join-demo-room" style="width:100%; padding:8px; font-size:0.82rem;"><i class="fa-solid fa-door-open"></i> Entrar na Sala</button>
        </div>

        ${rooms.map(r => `
          <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.7rem;">${r.code}</span>
                <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-circle" style="font-size:0.55rem;"></i> Ativa</span>
              </div>
              <h3 style="font-size:1.05rem; color:var(--text-main); margin:0 0 6px 0;">${r.name}</h3>
              <p style="font-size:0.82rem; color:var(--text-muted); margin:0 0 14px 0;">${r.theme || r.discipline}</p>
            </div>
            <button class="btn-secondary btn-enter-my-room" data-room-id="${r.id}" style="width:100%; padding:8px; font-size:0.82rem;"><i class="fa-solid fa-door-open"></i> Acessar Sala</button>
          </div>
        `).join('')}
      </div>
    `;

    this.attachLobbyEvents();
  }

  renderActiveRoom(container) {
    const room = this.currentRoom;
    const messages = this.storage ? this.storage.getStudyRoomMessages(room.id) : [];

    container.innerHTML = `
      <!-- Header da Sala Ativa -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:16px 20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <button id="btn-leave-room" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;"><i class="fa-solid fa-arrow-left"></i> Sair</button>
          <div>
            <h3 style="font-size:1.15rem; color:var(--text-main); margin:0;">
              ${room.name} <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.68rem; margin-left:6px;">${room.code}</span>
            </h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">${room.discipline} • ${room.participants.length} Participante(s)</span>
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button id="btn-start-room-quiz" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;"><i class="fa-solid fa-circle-question text-amber"></i> Quiz em Grupo</button>
          <button id="btn-start-room-pomodoro" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;"><i class="fa-solid fa-stopwatch text-amber"></i> Pomodoro 25m</button>
          <button id="btn-ask-tutor-in-room" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;"><i class="fa-solid fa-robot text-amber"></i> Chamar Tutor</button>
          <button id="btn-voice-marcos-in-room" class="btn-primary" style="padding:6px 14px; font-size:0.8rem;"><i class="fa-solid fa-headphones"></i> Prof. Marcos Explica</button>
        </div>
      </div>

      <!-- Workspace Duplo: Atividade Central + Chat Lateral -->
      <div style="display:grid; grid-template-columns: 1fr 340px; gap:16px;">
        <!-- Painel de Atividade da Sala -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; min-height:420px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-light); padding-bottom:10px;">
            <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8; font-size:0.72rem;">
              🎯 ATIVIDADE COLABORATIVA: ${room.currentActivity.type.toUpperCase()}
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">Sincronizado em Tempo Real</span>
          </div>

          <div id="room-activity-viewport" style="flex-grow:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:20px;">
            ${this.renderActivityContent(room)}
          </div>
        </div>

        <!-- Chat Acadêmico da Sala -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:16px; display:flex; flex-direction:column; height:500px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
            <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);"><i class="fa-solid fa-comments text-amber"></i> Chat da Sala</span>
            <span style="font-size:0.7rem; color:#10b981;"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Conectado</span>
          </div>

          <div id="room-messages-container" style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:4px; margin-bottom:10px;">
            <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:8px 10px; font-size:0.8rem; color:var(--text-muted);">
              <strong>Prof. Marcos (IA):</strong> Bem-vindos à sala! Estou à disposição para esclarecer dúvidas e explicar julgados.
            </div>
            ${messages.map(m => `
              <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:8px 10px; font-size:0.8rem; color:var(--text-main);">
                <strong style="color:#38bdf8;">${m.senderName}:</strong> ${m.text}
              </div>
            `).join('')}
          </div>

          <div style="display:flex; gap:6px;">
            <input type="text" id="input-room-message" placeholder="Escreva sua mensagem..." style="flex-grow:1; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; color:#fff; font-size:0.82rem; outline:none;">
            <button id="btn-send-room-message" class="btn-primary" style="padding:8px 12px; font-size:0.82rem;"><i class="fa-solid fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;

    this.attachActiveRoomEvents();
  }

  renderActivityContent(room) {
    if (room.currentActivity.type === 'quiz') {
      return `
        <div style="max-width:500px; width:100%; text-align:left;">
          <span class="badge-new" style="background:#f59e0b; color:#000; font-size:0.7rem; margin-bottom:8px; display:inline-block;">QUESTÃO 1 DE 5</span>
          <h4 style="font-size:0.95rem; color:var(--text-main); line-height:1.5; margin:0 0 16px 0;">
            A respeito da responsabilidade civil das instituições financeiras em casos de fraudes eletrônicas praticadas por terceiros, é correto afirmar:
          </h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn-secondary btn-quiz-opt" data-opt="0" style="text-align:left; font-size:0.82rem; padding:10px;">A) A responsabilidade é subjetiva, exigindo prova de dolo do gerente.</button>
            <button class="btn-secondary btn-quiz-opt" data-opt="1" style="text-align:left; font-size:0.82rem; padding:10px;">B) A instituição responde objetivamente pelo risco do empreendimento (Súmula 479 STJ).</button>
            <button class="btn-secondary btn-quiz-opt" data-opt="2" style="text-align:left; font-size:0.82rem; padding:10px;">C) Trata-se de hipótese clássica de fortuito externo não indenizável.</button>
            <button class="btn-secondary btn-quiz-opt" data-opt="3" style="text-align:left; font-size:0.82rem; padding:10px;">D) O consumidor deve arcar integralmente com o prejuízo caso não tenha seguro.</button>
          </div>
        </div>
      `;
    } else if (room.currentActivity.type === 'pomodoro') {
      return `
        <div style="text-align:center;">
          <i class="fa-solid fa-stopwatch text-amber" style="font-size:3rem; margin-bottom:12px;"></i>
          <h3 style="font-size:1.8rem; color:var(--text-main); font-family:var(--font-display); margin:0 0 6px 0;">24:45</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:0 0 16px 0;">Sessão de Foco em Grupo (25 min) • Sem interrupções</p>
          <span class="badge-official" style="color:#10b981; border-color:#10b981; font-size:0.75rem;">🟢 Foco Ativo</span>
        </div>
      `;
    } else {
      return `
        <i class="fa-solid fa-people-arrows text-amber" style="font-size:2.8rem; margin-bottom:12px;"></i>
        <h4 style="font-size:1.05rem; color:var(--text-main); margin:0 0 6px 0;">Sala Pronta para Atividades</h4>
        <p style="font-size:0.85rem; color:var(--text-muted); max-width:400px; margin:0 0 16px 0;">Inicie um Quiz em Grupo, um Pomodoro Sincronizado ou convoque o Tutor de IA para tirar dúvidas com os colegas.</p>
      `;
    }
  }

  attachLobbyEvents() {
    document.getElementById('btn-create-room-modal')?.addEventListener('click', () => {
      const name = prompt('Digite o nome da nova sala de estudo:', 'Revisão OAB — Direito Civil');
      if (!name) return;

      const room = this.realtime.createRoom({
        name,
        discipline: 'Direito Civil',
        theme: 'Revisão Geral e Casos Práticos',
        ownerId: this.currentUser.id,
        ownerName: this.currentUser.name
      });

      this.currentRoom = room;
      window.Toast?.success(`Sala "${name}" criada com código: ${room.code}`);
      this.renderStudio();
    });

    document.getElementById('btn-join-room-code')?.addEventListener('click', () => {
      const code = document.getElementById('input-room-code')?.value || '';
      if (!code.trim()) return;

      const res = this.realtime.joinRoomByCode(code, this.currentUser);
      if (res.success) {
        this.currentRoom = res.room;
        window.Toast?.success('Você entrou na sala com sucesso!');
        this.renderStudio();
      } else {
        alert(res.error);
      }
    });

    document.querySelector('.btn-join-demo-room')?.addEventListener('click', () => {
      const demo = this.realtime.createRoom({
        name: 'Revisão P1: Responsabilidade Civil',
        discipline: 'Direito Civil',
        theme: 'Danos Morais e Súmula 479 STJ',
        ownerId: 'user_prof',
        ownerName: 'Monitor de Civil'
      });
      this.currentRoom = demo;
      this.renderStudio();
    });
  }

  attachActiveRoomEvents() {
    document.getElementById('btn-leave-room')?.addEventListener('click', () => {
      this.currentRoom = null;
      this.renderStudio();
    });

    document.getElementById('btn-start-room-quiz')?.addEventListener('click', () => {
      this.currentRoom.currentActivity = { type: 'quiz', status: 'active' };
      this.renderStudio();
    });

    document.getElementById('btn-start-room-pomodoro')?.addEventListener('click', () => {
      this.currentRoom.currentActivity = { type: 'pomodoro', status: 'active' };
      this.renderStudio();
    });

    document.getElementById('btn-voice-marcos-in-room')?.addEventListener('click', () => {
      if (this.audioEngine) {
        const speech = `Olá pessoal da sala! Vamos revisar responsabilidade civil bancária. Lembrem-se de que a Súmula 479 do STJ define que fraudes praticadas por terceiros no âmbito de operações bancárias configuram fortuito interno, ensejando a responsabilidade objetiva da instituição.`;
        this.audioEngine.speakArticle({
          id: 'room_audio_' + Date.now(),
          article_display: 'Sala de Estudo',
          number: 'Professor Marcos',
          title: this.currentRoom.name,
          content: [{ text: speech, speechText: speech }],
          voice_id: 'xHUwLsLfyqiYOIVTzLRW'
        });
      }
    });

    document.getElementById('btn-send-room-message')?.addEventListener('click', () => {
      const input = document.getElementById('input-room-message');
      const text = input?.value || '';
      if (!text.trim()) return;

      this.realtime.sendMessage(this.currentRoom.id, {
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        text
      });

      if (input) input.value = '';
      this.renderStudio();
    });
  }
}

if (typeof window !== 'undefined') {
  window.StudyRoomEngine = StudyRoomEngine;
}

if (typeof module !== 'undefined') {
  module.exports = StudyRoomEngine;
}
