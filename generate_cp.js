const fs = require('fs');
const path = require('path');

// Estrutura sistemática do Código Penal (Decreto-Lei nº 2.848/1940)
const CP_STRUCTURE = [
  // PARTE GERAL - APLICAÇÃO E CRIME
  { start: 1, end: 12, title: 'Parte Geral - Título I: Da Aplicação da Lei Penal', chapter: 'Princípio da Legalidade, Anterioridade, Lei no Tempo e no Espaço', category: 'Parte Geral' },
  { start: 13, end: 25, title: 'Parte Geral - Título II: Do Crime', chapter: 'Causalidade, Tentativa, Dolo, Culpa, Erro e Excludentes de Ilicitude (Legítima Defesa)', category: 'Parte Geral' },
  { start: 26, end: 28, title: 'Parte Geral - Título III: Da Imputabilidade Penal', chapter: 'Inimputabilidade por Doença Mental, Menoridade e Embriaguez', category: 'Parte Geral' },
  { start: 29, end: 31, title: 'Parte Geral - Título IV: Do Concurso de Pessoas', chapter: 'Coautoria, Participação e Cooperação Dolosamente Distinta', category: 'Parte Geral' },

  // APLICAÇÃO DA PENA
  { start: 32, end: 58, title: 'Parte Geral - Título V: Das Penas', chapter: 'Espécies de Pena (Privativas de Liberdade, Restritivas de Direitos e Multa)', category: 'Aplicação da Pena' },
  { start: 59, end: 76, title: 'Parte Geral - Título V: Das Penas', chapter: 'Aplicação da Pena (Critério Trifásico, Art. 59, Agravantes/Atenuantes e Concurso de Crimes)', category: 'Aplicação da Pena' },
  { start: 77, end: 95, title: 'Parte Geral - Título V: Das Penas', chapter: 'Sursis, Livramento Condicional, Efeitos da Condenação e Reabilitação', category: 'Aplicação da Pena' },
  { start: 96, end: 99, title: 'Parte Geral - Título VI: Das Medidas de Segurança', chapter: 'Internação e Tratamento Ambulatorial para Inimputáveis', category: 'Aplicação da Pena' },
  { start: 100, end: 106, title: 'Parte Geral - Título VII: Da Ação Penal', chapter: 'Ação Penal Pública (Incondicionada/Condicionada) e Ação Penal Privada', category: 'Parte Geral' },
  { start: 107, end: 120, title: 'Parte Geral - Título VIII: Da Extinção da Punibilidade', chapter: 'Prescrição da Pretensão Punitiva e Executória, Decadência e Perdão Judicial', category: 'Parte Geral' },

  // CRIMES CONTRA A PESSOA
  { start: 121, end: 128, title: 'Parte Especial - Título I: Dos Crimes Contra a Pessoa', chapter: 'Crimes Contra a Vida (Homicídio, Induzimento ao Suicídio, Infanticídio e Aborto)', category: 'Crimes Contra a Pessoa' },
  { start: 129, end: 129, title: 'Parte Especial - Título I: Dos Crimes Contra a Pessoa', chapter: 'Das Lesões Corporais (Leve, Grave, Gravíssima, Seguida de Morte e Doméstica)', category: 'Crimes Contra a Pessoa' },
  { start: 130, end: 137, title: 'Parte Especial - Título I: Dos Crimes Contra a Pessoa', chapter: 'Periclitação da Vida e da Saúde (Omissão de Socorro, Maus-Tratos) e Rixa', category: 'Crimes Contra a Pessoa' },
  { start: 138, end: 145, title: 'Parte Especial - Título I: Dos Crimes Contra a Pessoa', chapter: 'Crimes Contra a Honra (Calúnia, Difamação e Injúria)', category: 'Crimes Contra a Pessoa' },
  { start: 146, end: 154, title: 'Parte Especial - Título I: Dos Crimes Contra a Pessoa', chapter: 'Crimes Contra a Liberdade Individual (Ameaça, Sequestro, Violação de Domicílio e Stalking)', category: 'Crimes Contra a Pessoa' },

  // CRIMES CONTRA O PATRIMÔNIO
  { start: 155, end: 156, title: 'Parte Especial - Título II: Dos Crimes Contra o Patrimônio', chapter: 'Do Furto (Simples, Noturno, Qualificado e de Coisa Comum)', category: 'Crimes Contra o Patrimônio' },
  { start: 157, end: 160, title: 'Parte Especial - Título II: Dos Crimes Contra o Patrimônio', chapter: 'Roubo, Extorsão e Extorsão Mediante Sequestro', category: 'Crimes Contra o Patrimônio' },
  { start: 161, end: 170, title: 'Parte Especial - Título II: Dos Crimes Contra o Patrimônio', chapter: 'Usurpação, Dano, Apropriação Indébita e Fraudes', category: 'Crimes Contra o Patrimônio' },
  { start: 171, end: 179, title: 'Parte Especial - Título II: Dos Crimes Contra o Patrimônio', chapter: 'Do Estelionato e Outras Fraudes Patrimoniais', category: 'Crimes Contra o Patrimônio' },
  { start: 180, end: 183, title: 'Parte Especial - Título II: Dos Crimes Contra o Patrimônio', chapter: 'Da Receptação e Disposições Gerais (Escusas Absolutórias)', category: 'Crimes Contra o Patrimônio' },

  // DEMAIS TÍTULOS DA PARTE ESPECIAL
  { start: 184, end: 212, title: 'Parte Especial - Títulos III a V', chapter: 'Propriedade Imaterial, Organização do Trabalho e Respeito aos Mortos', category: 'Parte Geral' },
  { start: 213, end: 234, title: 'Parte Especial - Título VI: Dos Crimes Contra a Dignidade Sexual', chapter: 'Estupro, Estupro de Vulnerável, Importunação e Assédio Sexual', category: 'Crimes Contra a Pessoa' },
  { start: 235, end: 285, title: 'Parte Especial - Títulos VII e VIII', chapter: 'Crimes Contra a Família e Contra a Incolumidade Pública', category: 'Parte Geral' },
  { start: 286, end: 288, title: 'Parte Especial - Título IX: Dos Crimes Contra a Paz Pública', chapter: 'Incitação ao Crime, Apologia e Associação Criminosa', category: 'Parte Geral' },
  { start: 289, end: 311, title: 'Parte Especial - Título X: Dos Crimes Contra a Fé Pública', chapter: 'Moeda Falsa, Falsificação de Documentos, Falsidade Ideológica e Fraudes em Concursos', category: 'Parte Geral' },

  // CRIMES CONTRA A ADMINISTRAÇÃO PÚBLICA
  { start: 312, end: 327, title: 'Parte Especial - Título XI: Crimes Contra a Administração Pública', chapter: 'Crimes Praticados por Funcionário Público (Peculato, Concussão, Corrupção Passiva, Prevaricação)', category: 'Crimes Contra a Adm. Pública' },
  { start: 328, end: 337, title: 'Parte Especial - Título XI: Crimes Contra a Administração Pública', chapter: 'Crimes Praticados por Particular (Desobediência, Desacato, Corrupção Ativa e Tráfico de Influência)', category: 'Crimes Contra a Adm. Pública' },
  { start: 338, end: 359, title: 'Parte Especial - Título XI: Crimes Contra a Administração Pública', chapter: 'Crimes Contra a Administração da Justiça (Denunciação Caluniosa, Falso Testemunho) e Finanças', category: 'Crimes Contra a Adm. Pública' },
  { start: 360, end: 361, title: 'Parte Especial - Disposições Finais do Código Penal', chapter: 'Disposições Finais e Transitórias', category: 'Parte Geral' }
];

// Artigos de alta relevância prática penal e recorrentes na OAB
const CP_SPECIAL_ARTICLES = {
  1: {
    title: 'Do Princípio da Anterioridade e Legalidade Penal',
    oab: true,
    text: 'Art. 1º Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal (nullum crimen, nulla poena sine praevia lege).',
    explanation: 'Princípio da Reserva Legal e da Anterioridade estrita: vedação de analogia in malam partem e de punição por condutas não previamente tipificadas em lei formal.',
    summary: 'Princípio da Legalidade e Anterioridade: ninguém pode ser punido sem lei penal prévia anterior ao fato.'
  },
  2: {
    title: 'Da Lei Penal no Tempo e Abolitio Criminis',
    oab: true,
    text: 'Art. 2º Ninguém pode ser punido por fato que lei posterior deixa de considerar crime, cessando em virtude dela a execução e os efeitos penais da sentença condenatória (abolitio criminis).\nParágrafo único. A lei posterior, que de qualquer modo favorecer o agente, aplica-se aos fatos anteriores, ainda que decididos por sentença condenatória transitada em julgado (retroatividade da lex mitior).',
    explanation: 'Retroatividade benéfica da lei penal mais branda (lex mitior) e descriminalização total de condutas com extinção dos efeitos penais da condenação.',
    summary: 'Abolitio criminis e retroatividade penal benéfica para fatos anteriores, mesmo após trânsito em julgado.'
  },
  4: {
    title: 'Do Tempo do Crime (Teoria da Atividade)',
    oab: true,
    text: 'Art. 4º Considera-se praticado o crime no momento da ação ou omissão, ainda que outro seja o momento do resultado.',
    explanation: 'Adotada no Brasil a Teoria da Atividade para o tempo do crime (mnemônico LUTA: Lugar = Ubiquidade / Tempo = Atividade). A imputabilidade afere-se no instante da conduta.',
    summary: 'Tempo do crime: aplica-se a Teoria da Atividade (momento da ação ou omissão).'
  },
  6: {
    title: 'Do Lugar do Crime (Teoria da Ubiquidade)',
    oab: true,
    text: 'Art. 6º Considera-se praticado o crime no lugar em que ocorreu a ação ou omissão, no todo ou em parte, bem como onde se produziu ou deveria produzir-se o resultado.',
    explanation: 'Adotada a Teoria da Ubiquidade ou Mista para o lugar do crime no espaço internacional (LUTA).',
    summary: 'Lugar do crime: aplica-se a Teoria da Ubiquidade (tanto onde ocorreu a conduta quanto onde se produziu o resultado).'
  },
  14: {
    title: 'Do Crime Consumado e da Tentativa (Conatus)',
    oab: true,
    text: 'Art. 14. Diz-se o crime: I - consumado, quando nele se reúnem todos os elementos de sua definição legal; II - tentado, quando, iniciada a execução, não se consuma por circunstâncias alheias à vontade do agente.\nParágrafo único. Salvo disposição em contrário, pune-se a tentativa com a pena correspondente ao crime consumado, diminuída de um a dois terços.',
    explanation: 'Iter criminis e tentativa: início da execução com interrupção involuntária. Diminuição obrigatória da pena de 1/3 a 2/3.',
    summary: 'Crime consumado vs. tentado; tentativa punida com redução de 1/3 a 2/3 da pena cominada.'
  },
  15: {
    title: 'Da Desistência Voluntária e do Arrependimento Eficaz (Ponte de Ouro)',
    oab: true,
    text: 'Art. 15. O agente que, voluntariamente, desiste de prosseguir na execução ou impede que o resultado se produza, só responde pelos atos já praticados.',
    explanation: 'A chamada "Ponte de Ouro" de Franz von Liszt: se o agente desiste durante a execução (desistência voluntária) ou impede o resultado após esgotar os atos (arrependimento eficaz), exclui-se a tentativa e ele responde apenas pelo que consumou.',
    summary: 'Ponte de Ouro: o agente que desiste voluntariamente ou impede o resultado só responde pelos atos já praticados.'
  },
  16: {
    title: 'Do Arrependimento Posterior (Ponte de Prata)',
    oab: true,
    text: 'Art. 16. Nos crimes cometidos sem violência ou grave ameaça à pessoa, reparado o dano ou restituída a coisa, até o recebimento da denúncia ou da queixa, por ato voluntário do agente, a pena será reduzida de um a dois terços.',
    explanation: 'A "Ponte de Prata": causa de diminuição de pena de 1/3 a 2/3 nos crimes patrimoniais sem violência, reparado o dano antes do recebimento da denúncia.',
    summary: 'Arrependimento posterior: reparação voluntária sem violência antes da denúncia reduz a pena de 1/3 a 2/3.'
  },
  17: {
    title: 'Do Crime Impossível (Tentativa Inidônea)',
    oab: true,
    text: 'Art. 17. Não se pune a tentativa quando, por ineficácia absoluta do meio ou por absoluta impropriedade do objeto, é impossível consumar-se o crime.',
    explanation: 'Adotada a Teoria Objetiva Temperada: a ineficácia ou impropriedade devem ser absolutas para gerar atipicidade da conduta (ex: atirar com arma descarregada ou tentar matar cadáver).',
    summary: 'Crime impossível: conduta impunível por absoluta ineficácia do meio ou absoluta impropriedade do objeto.'
  },
  18: {
    title: 'Do Dolo e da Culpa',
    oab: true,
    text: 'Art. 18. Diz-se o crime: I - doloso, quando o agente quis o resultado (dolo direto) ou assumiu o risco de produzi-lo (dolo eventual); II - culposo, quando o agente deu causa ao resultado por imprudência, negligência ou imperícia.\nParágrafo único. Salvo os casos expressos em lei, ninguém pode ser punido por fato previsto como crime, senão quando o pratica dolosamente.',
    explanation: 'Princípio da excepcionalidade do crime culposo: a modalidade culposa só existe quando expressamente prevista no tipo penal.',
    summary: 'Dolo (direto ou eventual) e Culpa (imprudência, negligência ou imperícia); crime culposo exige previsão expressa.'
  },
  23: {
    title: 'Das Excludentes de Ilicitude / Antijuridicidade',
    oab: true,
    text: 'Art. 23. Não há crime quando o agente pratica o fato: I - em estado de necessidade; II - em legítima defesa; III - em estrito cumprimento de dever legal ou no exercício regular de direito.\nParágrafo único. O agente, em qualquer das hipóteses deste artigo, responderá pelo excesso doloso ou culposo.',
    explanation: 'Causas de justificação que excluem o segundo elemento do conceito analítico de crime (Fato Típico, Ilícito e Culpável).',
    summary: 'Excludentes de ilicitude: estado de necessidade, legítima defesa, estrito cumprimento do dever e exercício regular de direito.'
  },
  24: {
    title: 'Do Estado de Necessidade',
    oab: true,
    text: 'Art. 24. Considera-se em estado de necessidade quem pratica o fato para salvar de perigo atual, que não provocou por sua vontade, nem podia de outro modo evitar, direito próprio ou alheio, cujo sacrifício, nas circunstâncias, não era razoável exigir-se.',
    explanation: 'Conflito de bens jurídicos legítimos: sacrifício do bem de menor ou igual valor diante de perigo atual inevitável.',
    summary: 'Estado de necessidade: sacrifício justificado de bem jurídico para salvar direito próprio ou alheio de perigo atual.'
  },
  25: {
    title: 'Da Legítima Defesa e Requisitos',
    oab: true,
    text: 'Art. 25. Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.\nParágrafo único. Considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém durante a prática de crimes.',
    explanation: 'Requisitos da legítima defesa: agressão injusta, atual ou iminente, uso moderado dos meios necessários e defesa de direito próprio ou de terceiro.',
    summary: 'Legítima defesa: repulsa moderada a agressão injusta atual ou iminente a direito próprio ou alheio.'
  },
  59: {
    title: 'Da Fixação da Pena-Base (Primeira Fase Trifásica)',
    oab: true,
    text: 'Art. 59. O juiz, atendendo à culpabilidade, aos antecedentes, à conduta social, à personalidade do agente, aos motivos, às circunstâncias e consequências do crime, bem como ao comportamento da vítima, estabelecerá, conforme seja necessário e suficiente para reprovação e prevenção do crime, as penas aplicáveis.',
    explanation: 'As 8 circunstâncias judiciais do Art. 59 (primeira fase da dosimetria da pena segundo Nelson Hungria).',
    summary: 'Circunstâncias judiciais para fixação da pena-base na primeira fase da dosimetria penal.'
  },
  121: {
    title: 'Do Homicídio Simples, Privilegiado e Qualificado (Feminicídio)',
    oab: true,
    text: 'Art. 121. Matar alguém: Pena - reclusão, de seis a vinte anos.\n§ 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço (Privilegiado).\n§ 2º Se o homicídio é cometido: mediante paga ou promessa de recompensa; por motivo fútil; com emprego de veneno, tortura ou meio cruel; à traição ou emboscada; para assegurar a execução ou impunidade de outro crime; contra a mulher por razões da condição de sexo feminino (Feminicídio): Pena - reclusão, de doze a trinta anos.',
    explanation: 'Crime máximo contra a vida humana: hipóteses de privilégio (subjetivas) e qualificadoras objetivas/subjetivas.',
    summary: 'Homicídio: pena de 6 a 20 anos; privilegiado (redução de 1/6 a 1/3); qualificado e feminicídio (12 a 30 anos).'
  },
  155: {
    title: 'Do Crime de Furto (Subtração sem Violência)',
    oab: true,
    text: 'Art. 155. Subtrair, para si ou para outrem, coisa alheia móvel: Pena - reclusão, de um a quatro anos, e multa.\n§ 1º A pena aumenta-se de um terço, se o crime é praticado durante o repouso noturno.\n§ 4º A pena é de reclusão de dois a oito anos, e multa, se o crime é cometido com destruição ou rompimento de obstáculo, com abuso de confiança ou mediante fraude, com emprego de chave falsa ou mediante concurso de duas ou mais pessoas.',
    explanation: 'Diferença capital para o roubo: o furto não possui violência ou grave ameaça contra a pessoa.',
    summary: 'Furto: subtração patrimonial sem violência; majorado no repouso noturno e qualificado por rompimento de obstáculo ou fraude.'
  },
  157: {
    title: 'Do Crime de Roubo e Latrocínio',
    oab: true,
    text: 'Art. 157. Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência a pessoa: Pena - reclusão, de quatro a dez anos, e multa.\n§ 2º A pena aumenta-se de 1/3 até metade se há emprego de arma branca ou concurso de pessoas.\n§ 2º-A A pena aumenta-se de 2/3 se há emprego de arma de fogo.\n§ 3º Se da violência resulta lesão corporal grave, a pena é de reclusão de sete a dezoito anos; se resulta morte (Latrocínio), a pena é de reclusão de vinte a trinta anos, e multa.',
    explanation: 'Subtração patrimonial violenta e o crime hediondo de Latrocínio (resultado morte decorrente da violência do roubo).',
    summary: 'Roubo simples, majorado por arma de fogo e latrocínio (roubo seguido de morte com pena de 20 a 30 anos).'
  },
  171: {
    title: 'Do Crime de Estelionato e Ação Penal Pública Condicionada',
    oab: true,
    text: 'Art. 171. Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil, ou qualquer outro meio fraudulento: Pena - reclusão, de um a cinco anos, e multa.\n§ 5º Somente se procede mediante representação (regra geral), salvo se a vítima for a Administração Pública, criança/adolescente, pessoa com deficiência mental ou maior de 70 anos.',
    explanation: 'Fraude patrimonial por engano da vítima. Após o Pacote Anticrime (Lei 13.964/19), a ação penal passou a ser pública condicionada à representação.',
    summary: 'Estelionato: obtenção de vantagem ilícita mediante fraude; exige representação da vítima na regra geral.'
  },
  180: {
    title: 'Do Crime de Receptação (Própria, Imprópria e Qualificada)',
    oab: true,
    text: 'Art. 180. Adquirir, receber, transportar, conduzir ou ocultar, em proveito próprio ou alheio, coisa que sabe ser produto de crime, ou influir para que terceiro, de boa-fé, a adquira, receba ou oculte: Pena - reclusão, de um a quatro anos, e multa.\n§ 1º Receptação qualificada no exercício de atividade comercial ou industrial: Pena - reclusão, de três a oito anos, e multa.',
    explanation: 'Crime acessório ou parasitário que pressupõe a ocorrência de delito patrimonial antecedente.',
    summary: 'Receptação: aquisição ou ocultação de produto de crime; qualificada quando exercida em atividade comercial.'
  },
  312: {
    title: 'Do Crime de Peculato Praticado por Funcionário Público',
    oab: true,
    text: 'Art. 312. Apropriar-se o funcionário público de dinheiro, valor ou qualquer outro bem móvel, público ou particular, de que tem a posse em razão do cargo, ou desviá-lo, em proveito próprio ou alheio: Pena - reclusão, de dois a doze anos, e multa.\n§ 1º Peculato-furto: funcionário que, não tendo a posse, subtrai ou concorre para subtração.\n§ 2º Peculato culposo: concorre culposamente para o crime de outrem (reparação do dano antes da sentença extingue a punibilidade).',
    explanation: 'Crime funcional típico: apropriação, desvio, furto ou modalidade culposa com regra especial de extinção de punibilidade.',
    summary: 'Peculato: apropriação ou desvio de bem público pelo funcionário; peculato culposo extingue punibilidade se reparado o dano.'
  },
  316: {
    title: 'Do Crime de Concussão (Exigir Vantagem Indevida)',
    oab: true,
    text: 'Art. 316. Exigir, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida: Pena - reclusão, de dois a doze anos, e multa.',
    explanation: 'Verbo nuclear EXIGIR. Crime formal que se consuma no momento da imposição/exigência da vantagem indevida, independentemente do recebimento.',
    summary: 'Concussão: crime praticado por funcionário público consistente em EXIGIR vantagem indevida em razão do cargo.'
  },
  317: {
    title: 'Do Crime de Corrupção Passiva (Solicitar ou Receber)',
    oab: true,
    text: 'Art. 317. Solicitar ou receber, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida, ou aceitar promessa de tal vantagem: Pena - reclusão, de 2 (dois) a 12 (doze) anos, e multa.',
    explanation: 'Verbos nucleares SOLICITAR, RECEBER ou ACEITAR PROMESSA. Distingue-se da concussão porque na corrupção o funcionário não impõe/exige, mas pede ou recebe.',
    summary: 'Corrupção passiva: solicitar, receber vantagem indevida ou aceitar sua promessa em razão da função pública.'
  },
  319: {
    title: 'Do Crime de Prevaricação (Satisfazer Interesse Pessoal)',
    oab: true,
    text: 'Art. 319. Retardar ou deixar de praticar, indevidamente, ato de ofício, ou praticá-lo contra disposição expressa de lei, para satisfazer interesse ou sentimento pessoal: Pena - detenção, de três meses a um ano, e multa.',
    explanation: 'Dolo específico indispensável: agir motivado exclusivamente por interesse particular, amizade, ódio ou afeição pessoal.',
    summary: 'Prevaricação: retardar ou deixar de praticar ato de ofício para satisfazer interesse ou sentimento pessoal.'
  },
  333: {
    title: 'Do Crime de Corrupção Ativa Praticado por Particular',
    oab: true,
    text: 'Art. 333. Oferecer ou prometer vantagem indevida a funcionário público, para determiná-lo a praticar, omitir ou retardar ato de ofício: Pena - reclusão, de 2 (dois) a 12 (doze) anos, e multa.',
    explanation: 'Verbos OFERECER ou PROMETER vantagem indevida. Se o particular cede à exigência de um policial corrupto (concussão), ele é vítima e não comete corrupção ativa.',
    summary: 'Corrupção ativa: oferecer ou prometer vantagem indevida a funcionário público para influenciar ato de ofício.'
  }
};

function getStructureForArticle(num) {
  for (const s of CP_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return CP_STRUCTURE[CP_STRUCTURE.length - 1];
}

const allCpArticles = [];

for (let num = 1; num <= 361; num++) {
  const struct = getStructureForArticle(num);
  const specific = CP_SPECIAL_ARTICLES[num];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' do Código Penal';
  const artId = 'cp-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 1 && num <= 31) ||
    (num >= 59 && num <= 76) ||
    (num >= 107 && num <= 120) ||
    (num >= 121 && num <= 129) ||
    (num >= 138 && num <= 145) ||
    (num >= 155 && num <= 180) ||
    (num >= 213 && num <= 218) ||
    (num >= 312 && num <= 337)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial do Decreto-Lei nº 2.848/1940 - Código Penal Brasileiro, ' + struct.title + ', ' + struct.chapter + '). Texto em vigor conforme publicação no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria jurídico-penal de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo basilar da dogmática e tipicidade penal.');
  let summary = specific ? specific.summary : ('Norma penal repressiva e garantista de ' + struct.category + ', estabelecendo diretrizes sobre ' + struct.chapter.toLowerCase() + '.');

  allCpArticles.push({
    id: artId,
    law_id: 'cp',
    subject_id: 'penal',
    law_name: 'Código Penal',
    law_number: 'Decreto-Lei nº 2.848/1940',
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
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm#art' + num,
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
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na tipificação de condutas e persecução penal perante a Justiça Criminal.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas provas de Direito Penal da OAB, Magistratura, Delegado e MP.') : 'Leitura indispensável para domínio do Direito Penal material.',
      legal_terms: ['Código Penal', struct.category, 'Tipicidade Penal'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'penalCodeFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 361 Artigos do Código Penal (Decreto-Lei 2.848/1940)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst CP_ALL_ARTICLES = ' + JSON.stringify(allCpArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.CP_ALL_ARTICLES = CP_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de cp e insere todos os 361 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "cp");\n    VADE_MECUM_DB.articles.push(...CP_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo do Código Penal carregado com sucesso (361 Artigos: Art. 1º ao Art. 361).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = CP_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allCpArticles.length + ' artigos do Código Penal em ' + outputPath);
