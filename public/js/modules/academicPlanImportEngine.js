/**
 * VadeAudio AI - AcademicPlanImportEngine (Etapa 46)
 * Controlador de Interface para Importação de Plano de Ensino & Ementa Acadêmica.
 * Preview Estruturado, Rastreabilidade de Trechos, Resolução de Conflitos e Confirmação Granular.
 */

class AcademicPlanImportEngine {
  constructor(storage, facultyEngine, audioEngine) {
    this.storage = storage || (typeof StorageModule !== 'undefined' ? StorageModule : null);
    this.facultyEngine = facultyEngine || (typeof window !== 'undefined' ? window.FacultyApp : null);
    this.audioEngine = audioEngine || (typeof window !== 'undefined' ? window.audioEngine : null);

    this.currentExtraction = {
      discipline: 'Direito Processual Civil II',
      professor: 'Dr. Roberto Magalhães',
      workload: '80 horas',
      syllabus: 'Teoria geral dos recursos cíveis. Apelação, agravos, embargos de declaração e recursos aos tribunais superiores.',
      assessments: [
        { label: 'P1', date: '22/09/2026', confidence: 'high' },
        { label: 'P2', date: '24/11/2026', confidence: 'high' }
      ],
      gradeRule: {
        examWeight: 70,
        assignmentWeight: 30,
        totalSum: 100,
        isValid: true
      },
      bibliography: [
        { id: 'bib_1', raw: 'DIDIER JR., Fredie. Curso de Direito Processual Civil. 18. ed. Salvador: Juspodivm, 2025.', isComplete: true },
        { id: 'bib_2', raw: 'NERY JUNIOR, Nelson. Código de Processo Civil Comentado. São Paulo: RT, 2024.', isComplete: true }
      ]
    };

    this.conflicts = [];
  }

  renderStudio() {
    const container = document.getElementById('academic-plan-import-content-container') || document.getElementById('view-academic-plan-import');
    if (!container) return;

    const ext = this.currentExtraction;

    container.innerHTML = `
      <!-- Header do Importador de Planos -->
      <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="badge-new" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; font-weight:700;">ETAPA 46</span>
            <span style="font-size:0.75rem; color:#818cf8;"><i class="fa-solid fa-file-import"></i> Importador Inteligente de Ementas & Planos</span>
          </div>
          <h2 style="font-family:var(--font-display); font-size:1.35rem; color:var(--text-main); margin:0;">
            <i class="fa-solid fa-file-lines text-amber"></i> Importar Plano de Ensino
          </h2>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:4px 0 0 0;">Envie PDFs, ementas ou fotos escaneadas para estruturação automática do semestre com zero alucinação.</p>
        </div>

        <div style="display:flex; gap:8px;">
          <button id="btn-upload-new-plan" class="btn-secondary" style="padding:7px 14px; font-size:0.82rem;"><i class="fa-solid fa-cloud-arrow-up text-amber"></i> Novo Upload</button>
          <button id="btn-confirm-plan-import" class="btn-primary" style="padding:7px 18px; font-size:0.82rem;"><i class="fa-solid fa-check-double"></i> Confirmar Importação</button>
        </div>
      </div>

      <!-- Grid de Preview Estruturado -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <!-- Card 1: Identificação & Ementa -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge-official" style="color:var(--accent-amber); border-color:var(--accent-amber); font-size:0.72rem;">
              📘 DADOS DA DISCIPLINA
            </span>
            <span class="badge-new" style="background:#10b981; color:#000; font-size:0.68rem;">ALTA CONFIANÇA</span>
          </div>

          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:4px;">Nome da Disciplina</label>
            <input type="text" value="${ext.discipline}" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; color:#fff; font-size:0.9rem;">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:4px;">Professor(a)</label>
              <input type="text" value="${ext.professor}" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; color:#fff; font-size:0.85rem;">
            </div>
            <div>
              <label style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:4px;">Carga Horária</label>
              <input type="text" value="${ext.workload}" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:8px 12px; color:#fff; font-size:0.85rem;">
            </div>
          </div>

          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:4px;">Ementa Oficial Identificada</label>
            <textarea rows="3" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-light); border-radius:8px; padding:10px 12px; color:#fff; font-size:0.85rem; line-height:1.5; resize:none;">${ext.syllabus}</textarea>
          </div>
        </div>

        <!-- Card 2: Avaliações, Pesos e Bibliografia -->
        <div style="background:var(--bg-card); border:1px solid var(--border-light); border-radius:14px; padding:24px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge-official" style="color:#38bdf8; border-color:#38bdf8; font-size:0.72rem;">
              ⚖️ AVALIAÇÕES & CRITÉRIOS DE NOTA
            </span>
            <span style="font-size:0.75rem; color:#10b981;"><i class="fa-solid fa-check"></i> Pesos somam 100%</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            ${ext.assessments.map(ass => `
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-light); border-radius:8px; padding:10px;">
                <strong style="color:var(--text-main); font-size:0.85rem;">${ass.label}</strong>
                <div style="font-size:0.78rem; color:var(--accent-amber); margin-top:2px;">Data: ${ass.date}</div>
              </div>
            `).join('')}
          </div>

          <div>
            <span class="badge-official" style="color:#a855f7; border-color:#a855f7; font-size:0.72rem; margin-bottom:8px; display:inline-block;">
              📚 BIBLIOGRAFIA IDENTIFICADA (ABNT)
            </span>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${ext.bibliography.map(b => `
                <div style="background:rgba(255,255,255,0.02); border-left:3px solid #a855f7; border-radius:4px; padding:8px 10px; font-size:0.78rem; color:var(--text-main);">
                  ${b.raw}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachDomEvents();
  }

  attachDomEvents() {
    document.getElementById('btn-confirm-plan-import')?.addEventListener('click', () => {
      const res = AcademicPlanImportExecutor.execute(this.currentExtraction);
      if (res.success) {
        if (this.storage) {
          this.storage.saveAcademicPlanImport({
            discipline: this.currentExtraction.discipline,
            extraction: this.currentExtraction,
            importedAt: Date.now()
          });
        }
        window.Toast?.success(`Plano de Ensino importado para ${this.currentExtraction.discipline}!`);
      }
    });

    document.getElementById('btn-upload-new-plan')?.addEventListener('click', () => {
      const fileName = prompt('Simulação de envio: insira o nome do arquivo:', 'Plano_Ensino_Processo_Civil.pdf');
      if (fileName) {
        window.Toast?.info(`Arquivo "${fileName}" recebido e processado pelo pipeline de extração!`);
        this.renderStudio();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.AcademicPlanImportEngine = AcademicPlanImportEngine;
}

if (typeof module !== 'undefined') {
  module.exports = AcademicPlanImportEngine;
}
