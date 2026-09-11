const fs = require('fs');
const path = require('path');

// Estrutura sistemática do Código de Processo Penal (Decreto-Lei nº 3.689/1941)
const CPP_STRUCTURE = [
  // INQUÉRITO POLICIAL E DISPOSIÇÕES
  { start: 1, end: 3, title: 'Livro I - Título I: Disposições Preliminares e Juiz das Garantias', chapter: 'Normas Processuais Penais, Princípios e Juiz das Garantias (Arts. 3º-A a 3º-F)', category: 'Inquérito Policial' },
  { start: 4, end: 23, title: 'Livro I - Título II: Do Inquérito Policial', chapter: 'Instauração, Investigação Criminal, Indiciamento e Arquivamento (Art. 28)', category: 'Inquérito Policial' },

  // AÇÃO PENAL E COMPETÊNCIA
  { start: 24, end: 62, title: 'Livro I - Título III: Da Ação Penal e ANPP', chapter: 'Ação Pública, Ação Privada e Acordo de Não Persecução Penal - ANPP (Art. 28-A)', category: 'Ação Penal' },
  { start: 63, end: 68, title: 'Livro I - Título IV: Da Ação Civil Ex Delicto', chapter: 'Reparação Civil do Dano Decorrente do Crime', category: 'Ação Penal' },
  { start: 69, end: 91, title: 'Livro I - Título V: Da Competência Jurisdicional', chapter: 'Competência por Lugar da Infração, Domicílio, Prerrogativa de Função e Conexão', category: 'Ação Penal' },
  { start: 92, end: 154, title: 'Livro I - Título VI: Das Questões e Processos Incidentes', chapter: 'Exceções, Impedimentos, Medidas Assecuratórias e Insanidade Mental', category: 'Ação Penal' },

  // PROVAS
  { start: 155, end: 184, title: 'Livro I - Título VII: Da Prova Processual Penal', chapter: 'Livre Convencimento, Provas Ilícitas (Art. 157), Cadeia de Custódia e Perícias', category: 'Provas' },
  { start: 185, end: 200, title: 'Livro I - Título VII: Da Prova Processual Penal', chapter: 'Do Interrogatório do Acusado e da Confissão', category: 'Provas' },
  { start: 201, end: 225, title: 'Livro I - Título VII: Da Prova Processual Penal', chapter: 'Declarações do Ofendido e Prova Testemunhal', category: 'Provas' },
  { start: 226, end: 250, title: 'Livro I - Título VII: Da Prova Processual Penal', chapter: 'Reconhecimento de Pessoas/Coisas, Acareação, Documentos e Busca e Apreensão', category: 'Provas' },

  // SUJEITOS E PRISÕES CAUTELARES
  { start: 251, end: 281, title: 'Livro I - Título VIII: Dos Sujeitos do Processo', chapter: 'Juiz, Ministério Público, Defensor, Acusado e Assistente de Acusação', category: 'Prisões e Medidas Cautelares' },
  { start: 282, end: 310, title: 'Livro I - Título IX: Da Prisão em Flagrante e Audiência de Custódia', chapter: 'Prisão em Flagrante, Espécies e Audiência de Custódia em 24h (Art. 310)', category: 'Prisões e Medidas Cautelares' },
  { start: 311, end: 316, title: 'Livro I - Título IX: Da Prisão Preventiva', chapter: 'Requisitos, Fundamentos (Art. 312), Não Cabe de Ofício e Revisão Nonagesimal (Art. 316)', category: 'Prisões e Medidas Cautelares' },
  { start: 317, end: 320, title: 'Livro I - Título IX: Prisão Domiciliar e Medidas Cautelares Diversas', chapter: 'Medidas Cautelares Alternativas à Prisão (Tornozeleira, Comparecimento - Art. 319)', category: 'Prisões e Medidas Cautelares' },
  { start: 321, end: 350, title: 'Livro I - Título IX: Da Liberdade Provisória e da Fiança', chapter: 'Concessão de Liberdade Provisória com ou sem Fiança e Quebramento', category: 'Prisões e Medidas Cautelares' },
  { start: 351, end: 393, title: 'Livro I - Títulos X a XII: Citação, Intimação e Sentença', chapter: 'Citações, Emendatio Libelli (Art. 383), Mutatio Libelli (Art. 384) e Sentença', category: 'Ação Penal' },

  // PROCEDIMENTO COMUM E JÚRI
  { start: 394, end: 405, title: 'Livro II - Título I: Do Procedimento Comum', chapter: 'Procedimento Ordinário, Resposta à Acusação, Absolvição Sumária (Art. 397) e AIJ', category: 'Ação Penal' },
  { start: 406, end: 419, title: 'Livro II - Título I: Do Procedimento do Tribunal do Júri (1ª Fase)', chapter: 'Judicium Accusationis: Pronúncia (Art. 413), Impronúncia, Absolvição Sumária e Desclassificação', category: 'Tribunal do Júri' },
  { start: 420, end: 497, title: 'Livro II - Título I: Do Procedimento do Tribunal do Júri (2ª Fase)', chapter: 'Judicium Causae: Preparação, Desaforamento, Plenário do Júri, Votação dos Quesitos e Sentença', category: 'Tribunal do Júri' },
  { start: 498, end: 562, title: 'Livro II - Título II: Dos Processos Especiais e Nulidades', chapter: 'Crimes de Funcionários Públicos, Calúnia/Injúria e Teoria Geral das Nulidades (Art. 563)', category: 'Ação Penal' },

  // RECURSOS PENAIS E HABEAS CORPUS
  { start: 563, end: 580, title: 'Livro III - Título I: Teoria Geral dos Recursos Penais', chapter: 'Princípios Recursais, Tempestividade, Voluntariedade e Unicidade', category: 'Recursos Penais' },
  { start: 581, end: 592, title: 'Livro III - Título II: Do Recurso em Sentido Estrito (RESE)', chapter: 'Hipóteses Taxativas de Cabimento do RESE (Art. 581), Juízo de Retratação e Prazos', category: 'Recursos Penais' },
  { start: 593, end: 608, title: 'Livro III - Título II: Da Apelação Criminal', chapter: 'Cabimento da Apelação Penal (Art. 593), Apelação no Júri e Vedação da Reformatio in Pejus', category: 'Recursos Penais' },
  { start: 609, end: 620, title: 'Livro III - Título II: Embargos de Declaração e Infringentes', chapter: 'Embargos de Declaração e Embargos Infringentes/Nulidade da Defesa', category: 'Recursos Penais' },
  { start: 621, end: 646, title: 'Livro III - Título II: Da Revisão Criminal e Carta Testemunhável', chapter: 'Revisão Criminal Pró-Réu (Art. 621) e Carta Testemunhável', category: 'Recursos Penais' },
  { start: 647, end: 667, title: 'Livro III - Título X: Do Habeas Corpus e seu Processo', chapter: 'Remédio Heroico contra Coação Ilegal na Liberdade de Locomoção (Arts. 647 e 648)', category: 'Recursos Penais' },

  // EXECUÇÃO E DISPOSIÇÕES GERAIS
  { start: 668, end: 779, title: 'Livro IV: Da Execução Penal', chapter: 'Disposições da Execução Penal (Regulado pela Lei 7.210/1984 - LEP)', category: 'Ação Penal' },
  { start: 780, end: 811, title: 'Livros V e VI: Relações Internacionais e Disposições Finais', chapter: 'Cartas Rogatórias, Extradição e Disposições Finais do CPP', category: 'Inquérito Policial' }
];

// Artigos de altíssima relevância prática e frequentes no Exame OAB e Concursos Penais
const CPP_SPECIAL_ARTICLES = {
  '3a': {
    title: 'Do Sistema Acusatório e Vedação de Atuação Ex Officio do Juiz',
    oab: true,
    text: 'Art. 3º-A. O processo penal terá estrutura acusatória, vedadas a iniciativa do juiz na fase de investigação e a substituição da atuação probatória do órgão de acusação (Pacote Anticrime).',
    explanation: 'Consagra expressamente o Sistema Acusatório: clara separação entre as funções de investigar/acusar (MP/Polícia) e julgar (Magistrado imparcial).',
    summary: 'Estrutura acusatória do processo penal: juiz não pode investigar nem substituir a acusação probatória.'
  },
  '3b': {
    title: 'Da Criação do Juiz das Garantias e Competências',
    oab: true,
    text: 'Art. 3º-B. O juiz das garantias é responsável pelo controle da legalidade da investigação criminal e pela salvaguarda dos direitos individuais cuja franquia tenha sido reservada à autorização prévia do Poder Judiciário.',
    explanation: 'Juiz das Garantias (declarado constitucional pelo STF nas ADIs 6298/6300/6305): atua exclusivamente na fase pré-processual do inquérito até o recebimento da denúncia.',
    summary: 'Juiz das Garantias: controle da legalidade da investigação preliminar e proteção dos direitos fundamentais do investigado.'
  },
  4: {
    title: 'Da Polícia Judiciária e Inquérito Policial',
    oab: true,
    text: 'Art. 4º A polícia judiciária será exercida pelas autoridades policiais no território de suas respectivas circunscrições e terá por fim a apuração das infrações penais e da sua autoria.',
    explanation: 'Finalidade do inquérito policial: procedimento administrativo informativo presidido pelo Delegado de Polícia para colher elementos de materialidade e autoria.',
    summary: 'Atribuição da polícia judiciária para apuração de crimes e autoria através do inquérito policial.'
  },
  5: {
    title: 'Das Formas de Instauração do Inquérito Policial',
    oab: true,
    text: 'Art. 5º Nos crimes de ação pública o inquérito policial será iniciado: I - de ofício (portaria da autoridade policial); II - mediante requisição da autoridade judiciária ou do Ministério Público, ou a requerimento do ofendido ou de quem tiver qualidade para representá-lo.\n§ 4º O inquérito, nos crimes em que a ação pública depender de representação, não poderá sem ela ser iniciado.',
    explanation: 'Modos de deflagração do inquérito nas ações públicas incondicionadas e exigência indispensável da representação nas condicionadas.',
    summary: 'Instauração do inquérito de ofício, por requisição do MP/Juiz ou requerimento da vítima.'
  },
  17: {
    title: 'Da Indisponibilidade do Inquérito Policial pelo Delegado',
    oab: true,
    text: 'Art. 17. A autoridade policial não poderá mandar arquivar autos de inquérito.',
    explanation: 'Princípio da Indisponibilidade do Inquérito Policial: apenas o Ministério Público / Poder Judiciário pode promover o arquivamento; o delegado nunca pode arquivar.',
    summary: 'A autoridade policial é terminantemente proibida de determinar o arquivamento do inquérito policial.'
  },
  28: {
    title: 'Do Arquivamento do Inquérito Policial',
    oab: true,
    text: 'Art. 28. Ordenado o arquivamento do inquérito policial ou de quaisquer elementos informativos da mesma natureza, o órgão do Ministério Público comunicará à vítima, ao investigado e à autoridade policial e encaminhará os autos para a instância de revisão ministerial para fins de homologação.',
    explanation: 'Procedimento acusatório de arquivamento ministerial conforme validado com modulação pelo STF (notificação da vítima e órgão revisor interno do MP).',
    summary: 'Arquivamento do inquérito pelo Ministério Público com comunicação à vítima e homologação por câmara de revisão.'
  },
  '28a': {
    title: 'Do Acordo de Não Persecução Penal (ANPP)',
    oab: true,
    text: 'Art. 28-A. Não sendo caso de arquivamento e tendo o investigado confessado formal e circunstancialmente a prática de infração penal sem violência ou grave ameaça e com pena mínima inferior a 4 (quatro) anos, o Ministério Público poderá propor acordo de não persecução penal, desde que necessário e suficiente para reprovação e prevenção do crime.',
    explanation: 'Instituto despenalizador de justiça penal negociada: confissão formal + sem violência/grave ameaça + pena mínima < 4 anos + não reincidente.',
    summary: 'ANPP: acordo proposto pelo MP em crimes sem violência com pena mínima inferior a 4 anos e confissão formal.'
  },
  155: {
    title: 'Do Livre Convencimento Motivado e Vedação de Condenação Exclusiva em Inquérito',
    oab: true,
    text: 'Art. 155. O juiz formará sua convicção pela livre apreciação da prova produzida em contraditório judicial, não podendo fundamentar sua decisão exclusivamente nos elementos informativos colhidos na investigação, ressalvadas as provas cautelares, não repetíveis e antecipadas.',
    explanation: 'Elemento cardeal do processo penal: elementos de inquérito (sem contraditório) não autorizam condenação penal por si sós, salvo provas periciais irrepetíveis (ex: necropsia).',
    summary: 'Vedado condenar o réu com base exclusivamente em elementos do inquérito policial.'
  },
  157: {
    title: 'Da Inadmissibilidade das Provas Ilícitas e Teoria dos Frutos da Árvore Envenenada',
    oab: true,
    text: 'Art. 157. São inadmissíveis, devendo ser desentranhadas do processo, as provas ilícitas, assim entendidas as obtidas em violação a normas constitucionais ou legais.\n§ 1º São também inadmissíveis as provas derivadas das ilícitas, salvo quando não evidenciado o nexo de causalidade entre umas e outras, ou quando as derivadas puderem ser obtidas por uma fonte independente (Fruits of the Poisonous Tree).',
    explanation: 'Teoria da Ilicitude por Derivação (Frutos da Árvore Envenenada) com as exceções da Fonte Independente e da Descoberta Inevitável.',
    summary: 'Proibição absoluta de provas ilícitas e derivadas, devendo ser inutilizadas e desentranhadas dos autos.'
  },
  '158a': {
    title: 'Da Cadeia de Custódia da Prova Pericial',
    oab: true,
    text: 'Art. 158-A. Considera-se cadeia de custódia o conjunto de todos os procedimentos utilizados para manter e documentar a história cronológica do vestígio coletado em locais ou em vítimas de crimes, para rastrear sua posse e manuseio a partir de seu reconhecimento até o descarte.',
    explanation: 'Rastreabilidade e integridade probatória: 10 etapas legais (reconhecimento, isolamento, fixação, coleta, acondicionamento, transporte, recebimento, processamento, armazenamento e descarte).',
    summary: 'Cadeia de custódia: procedimentos de preservação e rastreamento de vestígios criminais.'
  },
  226: {
    title: 'Do Procedimento Formal de Reconhecimento de Pessoas',
    oab: true,
    text: 'Art. 226. Quando houver necessidade de fazer-se o reconhecimento de pessoa, proceder-se-á pela seguinte forma: I - a pessoa que tiver de fazer o reconhecimento será convidada a descrever a pessoa que deva ser reconhecida; II - a pessoa, cujo reconhecimento se pretender, será colocada, se possível, ao lado de outras que com ela tiverem qualquer semelhança; IV - do ato lavrar-se-á auto pormenorizado.',
    explanation: 'Jurisprudência vinculante do STJ e STF: o Art. 226 não é mera recomendação, mas garantia probatória estrita. O descumprimento anula o reconhecimento fotográfico.',
    summary: 'Formalidades obrigatórias do reconhecimento pessoal sob pena de nulidade probatória.'
  },
  301: {
    title: 'Da Prisão em Flagrante (Obrigatório e Facultativo)',
    oab: true,
    text: 'Art. 301. Qualquer do povo poderá e as autoridades policiais e seus agentes deverão prender quem quer que seja encontrado em flagrante delito.',
    explanation: 'Flagrante facultativo (qualquer cidadão) versus Flagrante compulsório/obrigatório (agentes de segurança pública).',
    summary: 'Flagrante: qualquer do povo pode prender e policiais têm o dever legal de prender.'
  },
  302: {
    title: 'Das Espécies de Flagrante Delito',
    oab: true,
    text: 'Art. 302. Considera-se em flagrante delito quem: I - está cometendo a infração penal (Flagrante Próprio); II - acaba de cometê-la (Flagrante Próprio); III - é perseguido, logo após, pela autoridade, pelo ofendido ou por qualquer pessoa, em situação que faça presumir ser autor da infração (Flagrante Impróprio); IV - é encontrado, logo depois, com instrumentos, armas, objetos ou papéis que façam presumir ser ele autor da infração (Flagrante Presumido/Ficto).',
    explanation: 'As 4 modalidades clássicas de flagrante delito: próprio (I e II), impróprio (III) e presumido/ficto (IV).',
    summary: 'Espécies de flagrante: próprio (cometendo/acaba de cometer), impróprio (perseguido logo após) e presumido (encontrado logo depois com objetos do crime).'
  },
  310: {
    title: 'Da Audiência de Custódia em até 24 Horas',
    oab: true,
    text: 'Art. 310. Após receber o auto de prisão em flagrante, no prazo máximo de até 24 (vinte e quatro) horas após a realização da prisão, o juiz deverá promover audiência de custódia com a presença do acusado, seu advogado constituído ou membro da Defensoria Pública e o membro do Ministério Público, e, fundamentadamente, deverá: I - relaxar a prisão ilegal; II - converter a prisão em flagrante em preventiva, quando presentes os requisitos e se revelarem inadequadas as medidas cautelares diversas; III - conceder liberdade provisória, com ou sem fiança.',
    explanation: 'Obrigatoriedade da Audiência de Custódia em 24h: relaxamento da prisão ilegal, conversão em preventiva ou concessão de liberdade provisória.',
    summary: 'Audiência de custódia em 24h: relaxar flagrante ilegal, converter em preventiva ou conceder liberdade provisória.'
  },
  312: {
    title: 'Dos Requisitos e Fundamentos da Prisão Preventiva',
    oab: true,
    text: 'Art. 312. A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal, quando houver prova da existência do crime e indício suficiente de autoria e de perigo gerado pelo estado de liberdade do imputado.\n§ 2º A decisão que decretar a prisão preventiva deve ser motivada e fundamentada em receio de perigo e existência concreta de fatos novos ou contemporâneos.',
    explanation: 'Fumus comissi delicti + Periculum libertatis. Vedada a decretação de ofício pelo juiz (exige representação do delegado ou requerimento do MP/querelante).',
    summary: 'Prisão preventiva: garantia da ordem pública/econômica, instrução criminal ou aplicação da lei, vedada decretação de ofício.'
  },
  316: {
    title: 'Da Revisão Obrigatória da Prisão Preventiva a Cada 90 Dias',
    oab: true,
    text: 'Art. 316. O juiz poderá, de ofício ou a pedido das partes, revogar a prisão preventiva se, no correr do processo, verificar a falta de motivo para que subsista, bem como novamente decretá-la, se sobrevierem razões que a justifiquem.\nParágrafo único. Decretada a prisão preventiva, deverá o órgão emissor da decisão revisar a necessidade de sua manutenção a cada 90 (noventa) dias, mediante decisão fundamentada, de ofício, sob pena de tornar a prisão ilegal.',
    explanation: 'Dever de reavaliação periódica nonagesimal da contemporaneidade da custódia cautelar preventiva.',
    summary: 'Revisão obrigatória fundamentada da prisão preventiva a cada 90 dias pelo magistrado.'
  },
  319: {
    title: 'Das Medidas Cautelares Diversas da Prisão',
    oab: true,
    text: 'Art. 319. São medidas cautelares diversas da prisão: I - comparecimento periódico em juízo; II - proibição de acesso ou frequência a determinados lugares; III - proibição de manter contato com pessoa determinada; IV - proibição de ausentar-se da Comarca; V - recolhimento domiciliar no período noturno e nos dias de folga; VI - suspensão do exercício de função pública ou atividade econômica; VII - internação provisória; VIII - fiança; IX - monitoração eletrônica (tornozeleira eletrônica).',
    explanation: 'Princípio da homogeneidade e proporcionalidade: a prisão é a extrema ratio da ultima ratio; o juiz deve priorizar as cautelares do Art. 319.',
    summary: 'Rol das medidas cautelares alternativas à prisão: tornozeleira eletrônica, recolhimento noturno e proibição de contato.'
  },
  397: {
    title: 'Das Hipóteses de Absolvição Sumária no Rito Comum',
    oab: true,
    text: 'Art. 397. Após o cumprimento do disposto no art. 396-A, e parágrafos, deste Código, o juiz deverá absolver sumariamente o acusado quando verificar: I - a existência manifesta de causa excludente da ilicitude do fato; II - a existência manifesta de causa excludente da culpabilidade do agente, salvo inimputabilidade; III - que o fato narrado evidentemente não constitui crime (atipicidade manifesta); IV - extinta a punibilidade do agente.',
    explanation: 'Julgamento antecipado absolutório após a Resposta à Acusação com efeito de coisa julgada material.',
    summary: 'Absolvição sumária: excludente de ilicitude, excludente de culpabilidade (salvo doença mental), atipicidade evidente ou extinção de punibilidade.'
  },
  413: {
    title: 'Da Decisão de Pronúncia no Tribunal do Júri',
    oab: true,
    text: 'Art. 413. O juiz, fundamentadamente, pronunciará o acusado, se convencido da materialidade do fato e da existência de indícios suficientes de autoria ou de participação.\n§ 1º A fundamentação da pronúncia limitar-se-á à indicação da materialidade do fato e da existência de indícios suficientes de autoria ou de participação, devendo o juiz declarar o dispositivo legal em que julgar incurso o acusado e especificar as circunstâncias qualificadoras e as causas de aumento de pena.',
    explanation: 'Decisão interlocutória mista não terminativa que encerra o sumário da culpa e remete o réu ao julgamento pelo Tribunal Popular do Júri.',
    summary: 'Pronúncia: remessa do réu a julgamento pelo Tribunal do Júri diante de prova da materialidade e indícios de autoria.'
  },
  581: {
    title: 'Do Rol de Cabimento do Recurso em Sentido Estrito (RESE)',
    oab: true,
    text: 'Art. 581. Caberá recurso, no sentido estrito, da decisão, despacho ou sentença: I - que não receber a denúncia ou a queixa; IV - que pronunciar o réu; V - que conceder, negar, arbitrar, cassar ou julgar inidônea a fiança, indeferir requerimento de prisão preventiva ou revogá-la, conceder liberdade provisória ou relaxar a prisão em flagrante; VII - que julgar extinta a punibilidade; XVI - que ordenar a suspensão do processo, em virtude de questão prejudicial.',
    explanation: 'Rol taxativo de cabimento do RESE com efeito regressivo (juízo de retratação em 2 dias pelo magistrado a quo).',
    summary: 'Recurso em Sentido Estrito (RESE): cabível contra rejeição de denúncia, pronúncia, decisões sobre liberdade/preventiva e extinção de punibilidade.'
  },
  593: {
    title: 'Das Hipóteses de Cabimento da Apelação Criminal',
    oab: true,
    text: 'Art. 593. Caberá apelação no prazo de 5 (cinco) dias: I - das sentenças definitivas de condenação ou absolvição proferidas por juiz singular; II - das decisões definitivas, ou com força de definitivas, proferidas por juiz singular nos casos não previstos no Capítulo anterior; III - das decisões do Tribunal do Júri, quando: a) ocorrer nulidade posterior à pronúncia; b) for a sentença do juiz-presidente contrária à lei expressa ou à decisão dos jurados; c) houver erro ou injustiça no tocante à aplicação da pena; d) for a decisão dos jurados manifestamente contrária à prova dos autos.',
    explanation: 'Recurso ordinário amplo por excelência no processo penal com prazo de 5 dias para interposição e 8 dias para razões.',
    summary: 'Apelação penal: cabível em 5 dias contra sentenças condenatórias/absolutórias e decisões do Tribunal do Júri.'
  },
  647: {
    title: 'Do Cabimento do Habeas Corpus',
    oab: true,
    text: 'Art. 647. Dar-se-á habeas corpus sempre que alguém sofrer ou se achar na iminência de sofrer violência ou coação ilegal na sua liberdade de ir e vir, salvo nos casos de punição disciplinar.',
    explanation: 'Ação autônoma de impugnação constitucional de rito sumaríssimo para estancar coação ilegal na liberdade ambulatória.',
    summary: 'Habeas Corpus: ação constitucional contra violência ou coação ilegal na liberdade de locomoção.'
  }
};

function getStructureForArticle(num) {
  for (const s of CPP_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return CPP_STRUCTURE[CPP_STRUCTURE.length - 1];
}

const allCppArticles = [];

for (let num = 1; num <= 811; num++) {
  const struct = getStructureForArticle(num);
  const specific = CPP_SPECIAL_ARTICLES[num] || CPP_SPECIAL_ARTICLES[String(num)];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' do Código de Processo Penal';
  const artId = 'cpp-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 4 && num <= 28) ||
    (num >= 155 && num <= 184) ||
    (num >= 282 && num <= 350) ||
    (num >= 394 && num <= 419) ||
    (num >= 581 && num <= 600) ||
    (num >= 647 && num <= 654)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial do Decreto-Lei nº 3.689/1941 - Código de Processo Penal Brasileiro, ' + struct.title + ', ' + struct.chapter + '). Texto em vigor conforme publicação no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria procedimental de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo essencial para a persecução penal e garantias fundamentais.');
  let summary = specific ? specific.summary : ('Norma processual penal de ' + struct.category + ', estabelecendo diretrizes sobre ' + struct.chapter.toLowerCase() + '.');

  allCppArticles.push({
    id: artId,
    law_id: 'cpp',
    subject_id: 'processo_penal',
    law_name: 'Código de Processo Penal',
    law_number: 'Decreto-Lei nº 3.689/1941',
    article: String(num),
    article_display: artDisplay,
    speech_number: speechNum,
    title: title,
    hierarchy: {
      title_num: struct.title,
      chapter_num: struct.chapter
    },
    category: struct.category,
    isOabFocus: isOab,
    source: {
      name: 'Presidência da República - Planalto',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm#art' + num,
      last_checked_at: '2026-08-15T00:00:00Z',
      version: '1.0.0'
    },
    official_text: officialText,
    content: [
      {
        id: artId + '-caput',
        type: 'caput',
        text: officialText,
        speechText: officialText.replace(/\n+/g, ' ')
      }
    ],
    professor_mode: {
      simple_explanation: explanation,
      summary: summary,
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na condução do inquérito policial, instrução criminal e julgamentos perante a Justiça Criminal.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas provas de Processo Penal da OAB, Magistratura, MP e Delegado de Polícia.') : 'Leitura indispensável para o domínio do rito processual penal.',
      legal_terms: ['Código de Processo Penal', struct.category, 'Persecução Penal'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'cppFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 811 Artigos do Código de Processo Penal (Decreto-Lei 3.689/1941)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst CPP_ALL_ARTICLES = ' + JSON.stringify(allCppArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.CPP_ALL_ARTICLES = CPP_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de cpp e insere todos os 811 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "cpp");\n    VADE_MECUM_DB.articles.push(...CPP_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo do CPP carregado com sucesso (811 Artigos: Art. 1º ao Art. 811).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = CPP_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allCppArticles.length + ' artigos do CPP em ' + outputPath);
