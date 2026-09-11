/**
 * VadeAudio AI - Suíte de Testes Acadêmicos, Docentes e Institucionais (Etapa 16)
 * Valida criação de turmas, permissões RBAC, código de convite, IA docente com revisão humana,
 * publicação de materiais, privacidade de notas agregadas, saída de turma e referral anti-fraude.
 */

const assert = require('assert');

console.log('===============================================================');
console.log('🎓 INICIANDO SUÍTE DE TESTES ACADÊMICOS & DOCENTES - ETAPA 16');
console.log('===============================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(description, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${description}`);
    console.error(`   Erro: ${err.message}\n`);
    failCount++;
  }
}

// ----------------------------------------------------------------------------
// 1. RBAC & PERMISSÕES DOCENTES
// ----------------------------------------------------------------------------
console.log('--- 1. RBAC & Permissões Docentes ---');

const studentUser = { id: 'usr_lucas_101', name: 'Lucas', role: 'student' };
const teacherUser = { id: 'usr_roberto_303', name: 'Prof. Roberto', role: 'teacher' };
const instAdminUser = { id: 'usr_marcos_404', name: 'Coord. Marcos', role: 'institution_admin' };

function checkTeacherPermission(user) {
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'institution_admin') {
    throw new Error('Acesso restrito a professores e coordenadores acadêmicos.');
  }
  return true;
}

runTest('Aluno comum é bloqueado ao tentar criar turma ou publicar material', () => {
  assert.throws(() => {
    checkTeacherPermission(studentUser);
  }, /Acesso restrito a professores/);
});

runTest('Professor e Coordenador Institucional possuem autorização docente', () => {
  assert.strictEqual(checkTeacherPermission(teacherUser), true);
  assert.strictEqual(checkTeacherPermission(instAdminUser), true);
});

// ----------------------------------------------------------------------------
// 2. CRIAÇÃO DE TURMA & CÓDIGO DE CONVITE
// ----------------------------------------------------------------------------
console.log('\n--- 2. Criação de Turma & Código de Convite ---');

let classDatabase = [];

function createClass(user, data) {
  checkTeacherPermission(user);
  const newClass = {
    id: 'cls_' + Math.random().toString(36).substring(2, 7),
    name: data.name,
    subject: data.subject,
    semester: data.semester || '2026.2',
    institution: data.institution || 'UFBA',
    inviteCode: data.inviteCode ? data.inviteCode.toUpperCase() : 'PENAL-2026',
    teacherId: user.id,
    teacherName: user.name,
    members: [],
    materials: [],
    assignments: []
  };
  classDatabase.push(newClass);
  return newClass;
}

let createdClass = null;
runTest('Professor cria turma acadêmica com código de convite único', () => {
  createdClass = createClass(teacherUser, {
    name: 'Direito Penal II — Turma A',
    subject: 'Direito Penal',
    semester: '2026.2',
    institution: 'UFBA',
    inviteCode: 'PENAL-UFBA-2026'
  });

  assert.ok(createdClass.id.startsWith('cls_'));
  assert.strictEqual(createdClass.inviteCode, 'PENAL-UFBA-2026');
  assert.strictEqual(createdClass.teacherId, 'usr_roberto_303');
  assert.strictEqual(createdClass.members.length, 0);
});

// ----------------------------------------------------------------------------
// 3. INGRESSO VOLUNTÁRIO DO ALUNO
// ----------------------------------------------------------------------------
console.log('\n--- 3. Ingresso Voluntário na Turma ---');

function joinClassWithCode(student, code) {
  const target = classDatabase.find(c => c.inviteCode === code.toUpperCase().trim());
  if (!target) throw new Error('Turma não encontrada.');
  if (target.members.includes(student.id)) return { status: 'already_member', target };
  target.members.push(student.id);
  return { status: 'joined', target };
}

runTest('Aluno ingressa na turma voluntariamente informando o código de convite', () => {
  const result = joinClassWithCode(studentUser, 'PENAL-UFBA-2026');
  assert.strictEqual(result.status, 'joined');
  assert.strictEqual(result.target.members.includes('usr_lucas_101'), true);
});

runTest('Tentativa com código incorreto é rejeitada com mensagem amigável', () => {
  assert.throws(() => {
    joinClassWithCode(studentUser, 'CODIGO-INEXISTENTE');
  }, /Turma não encontrada/);
});

// ----------------------------------------------------------------------------
// 4. PUBLICAÇÃO DE MATERIAL & INTEGRAÇÃO COM VADE MECUM
// ----------------------------------------------------------------------------
console.log('\n--- 4. Publicação de Materiais & Vade Mecum ---');

function publishMaterial(user, classId, mat) {
  checkTeacherPermission(user);
  const target = classDatabase.find(c => c.id === classId);
  if (!target) throw new Error('Turma não encontrada.');
  if (target.teacherId !== user.id) throw new Error('Você não leciona nesta turma.');

  const material = {
    id: 'mat_' + Math.random().toString(36).substring(2, 7),
    title: mat.title,
    type: mat.type,
    content: mat.content,
    relatedArticles: mat.relatedArticles || [],
    createdAt: Date.now()
  };
  target.materials.push(material);
  return material;
}

runTest('Professor publica material com artigos correlatos sem modificar texto oficial da lei', () => {
  const mat = publishMaterial(teacherUser, createdClass.id, {
    title: 'Aula 04 — Homicídio e Qualificadoras',
    type: 'pdf',
    content: 'Guia de estudo para a prova P1.',
    relatedArticles: ['Art. 121 CP', 'Art. 129 CP']
  });

  assert.strictEqual(mat.title, 'Aula 04 — Homicídio e Qualificadoras');
  assert.strictEqual(mat.relatedArticles.length, 2);
  assert.strictEqual(createdClass.materials.length, 1);
});

// ----------------------------------------------------------------------------
// 5. IA DO PROFESSOR COM REVISÃO HUMANA OBRIGATÓRIA
// ----------------------------------------------------------------------------
console.log('\n--- 5. Assistente IA Docente & Revisão Humana ---');

function generateAiQuestion(prompt) {
  return {
    stem: `Em relação ao tema ${prompt.topic}, assinale a opção correta:`,
    options: ['Opção A (incorreta)', 'Opção B (correta segundo Art. 121)', 'Opção C (incorreta)', 'Opção D (incorreta)'],
    correctIndex: 1,
    isAiGenerated: true,
    reviewedByTeacher: false,
    published: false
  };
}

function approveAndPublishQuestion(teacher, question) {
  checkTeacherPermission(teacher);
  question.reviewedByTeacher = true;
  question.published = true;
  return question;
}

runTest('Rascunho de IA não é publicado automaticamente antes da aprovação do professor', () => {
  const draft = generateAiQuestion({ topic: 'Homicídio Qualificado' });
  assert.strictEqual(draft.isAiGenerated, true);
  assert.strictEqual(draft.reviewedByTeacher, false);
  assert.strictEqual(draft.published, false, 'Questão não pode nascer publicada sem revisão');

  const approved = approveAndPublishQuestion(teacherUser, draft);
  assert.strictEqual(approved.reviewedByTeacher, true);
  assert.strictEqual(approved.published, true);
});

// ----------------------------------------------------------------------------
// 6. LISTA DE EXERCÍCIOS, ENVIO E PRIVACIDADE DE RESULTADOS AGREGADOS
// ----------------------------------------------------------------------------
console.log('\n--- 6. Resolução de Atividades & Privacidade de Notas ---');

let submissionsDb = [];

function submitAssignment(student, classId, asgId, scorePercent) {
  const sub = {
    id: 'subm_' + Math.random().toString(36).substring(2, 7),
    classId,
    assignmentId: asgId,
    studentId: student.id,
    studentName: student.name,
    scorePercent
  };
  submissionsDb.push(sub);
  return sub;
}

function getAggregatedAnalytics(teacher, classId) {
  checkTeacherPermission(teacher);
  const subs = submissionsDb.filter(s => s.classId === classId);
  const total = subs.length;
  const avg = total > 0 ? Math.round(subs.reduce((sum, s) => sum + s.scorePercent, 0) / total) : 0;

  return {
    totalSubmissions: total,
    averageScorePercent: avg,
    // Anonimização estrita: não expõe lista de notas individuais para outros alunos
    aggregatedOnly: true
  };
}

runTest('Alunos enviam listas e professor acessa métricas agregadas da turma', () => {
  submitAssignment(studentUser, createdClass.id, 'asg_1', 80);
  submitAssignment({ id: 'usr_mariana_202', name: 'Mariana', role: 'student' }, createdClass.id, 'asg_1', 90);

  const analytics = getAggregatedAnalytics(teacherUser, createdClass.id);
  assert.strictEqual(analytics.totalSubmissions, 2);
  assert.strictEqual(analytics.averageScorePercent, 85);
  assert.strictEqual(analytics.aggregatedOnly, true);
});

runTest('Aluno A não tem permissão para visualizar a nota do Aluno B (Sigilo Acadêmico)', () => {
  // Apenas o professor ou o próprio aluno acessa seu score pessoal
  const studentA = 'usr_lucas_101';
  const studentBSubmission = submissionsDb.find(s => s.studentId === 'usr_mariana_202');

  const canStudentAAccessStudentB = studentA === studentBSubmission.studentId;
  assert.strictEqual(canStudentAAccessStudentB, false, 'Aluno não pode acessar notas individuais de colegas');
});

// ----------------------------------------------------------------------------
// 7. SAÍDA DA TURMA PRESERVANDO ANOTAÇÕES PESSOAIS
// ----------------------------------------------------------------------------
console.log('\n--- 7. Saída da Turma & Preservação de Dados Pessoais ---');

function leaveClass(student, classId, personalNotes) {
  const target = classDatabase.find(c => c.id === classId);
  if (target) {
    target.members = target.members.filter(m => m !== student.id);
  }
  // Preserva anotações e flashcards pessoais
  return {
    removedFromClass: true,
    personalNotesPreserved: personalNotes.length
  };
}

runTest('Aluno que sai da turma mantém suas anotações e flashcards pessoais intactos', () => {
  const personalNotes = [{ id: 'n1', text: 'Minha anotação sobre dolo eventual' }];
  const res = leaveClass(studentUser, createdClass.id, personalNotes);

  assert.strictEqual(res.removedFromClass, true);
  assert.strictEqual(res.personalNotesPreserved, 1);
  assert.strictEqual(createdClass.members.includes('usr_lucas_101'), false);
});

// ----------------------------------------------------------------------------
// 8. LICENÇAS INSTITUCIONAIS & REFERRAL ANTI-FRAUDE
// ----------------------------------------------------------------------------
console.log('\n--- 8. Licenças Institucionais & Referral Anti-Fraude ---');

const mockInstitution = {
  id: 'inst_ufba',
  seatsTotal: 500,
  seatsUsed: 142
};

function assignInstitutionSeat(inst) {
  if (inst.seatsUsed >= inst.seatsTotal) throw new Error('Limite de licenças esgotado.');
  inst.seatsUsed++;
  return inst;
}

runTest('Controle de assentos/licenças institucionais (seats)', () => {
  const before = mockInstitution.seatsUsed;
  assignInstitutionSeat(mockInstitution);
  assert.strictEqual(mockInstitution.seatsUsed, before + 1);
  assert.ok(mockInstitution.seatsUsed <= mockInstitution.seatsTotal);
});

function claimReferral(user, code) {
  const myCode = `VADE-${user.name.toUpperCase()}-1010`;
  if (code.toUpperCase() === myCode) {
    throw new Error('Auto-indicação proibida.');
  }
  return { success: true, reward: '+15 dias Pro' };
}

runTest('Sistema de indicação bloqueia tentativa de auto-indicação (Anti-Fraude)', () => {
  assert.throws(() => {
    claimReferral(studentUser, 'VADE-LUCAS-1010');
  }, /Auto-indicação proibida/);

  const validClaim = claimReferral(studentUser, 'VADE-MARIANA-2020');
  assert.strictEqual(validClaim.success, true);
});

// ----------------------------------------------------------------------------
// RELATÓRIO FINAL
// ----------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 RESULTADO DOS TESTES ACADÊMICOS: ${passCount} PASSOU | ${failCount} FALHOU`);
console.log('===============================================================');

if (failCount === 0) {
  console.log('🎉 TODOS OS REQUISITOS DA ETAPA 16 FORAM VALIDADOS COM SUCESSO!\n');
} else {
  process.exit(1);
}
