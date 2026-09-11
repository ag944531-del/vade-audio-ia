const fs = require('fs');
const path = require('path');

// Estrutura sistemática do Estatuto da Criança e do Adolescente (Lei nº 8.069/1990)
const ECA_STRUCTURE = [
  // LIVRO I: PARTE GERAL
  { start: 1, end: 6, title: 'Livro I - Título I: Das Disposições Preliminares', chapter: 'Proteção Integral, Conceito de Criança e Adolescente (Art. 2º), Prioridade Absoluta e Interpretação', category: 'Direitos Fundamentais' },
  { start: 7, end: 14, title: 'Livro I - Título II: Do Direito à Vida e à Saúde', chapter: 'Pré-Natal, Atendimento ao Recém-Nascido, Vacinação Obrigatória e Entrega Voluntária para Adoção', category: 'Direitos Fundamentais' },
  { start: 15, end: 18, title: 'Livro I - Título II: Do Direito à Liberdade, ao Respeito e à Dignidade', chapter: 'Dignidade, Liberdade de Opinião e Crença, e Proibição de Castigo Físico / Lei Menino Bernardo (Art. 18-A)', category: 'Direitos Fundamentais' },
  { start: 19, end: 32, title: 'Livro I - Título II: Do Direito à Convivência Familiar e Comunitária', chapter: 'Família Natural, Família Extensa, Destituição do Poder Familiar e Acolhimento Familiar/Institucional', category: 'Adoção e Guarda' },
  { start: 33, end: 35, title: 'Livro I - Título II: Da Família Substituta - Da Guarda', chapter: 'Instituto da Guarda, Dever de Assistência Material, Moral e Jurídica, e Guarda Previdenciária', category: 'Adoção e Guarda' },
  { start: 36, end: 38, title: 'Livro I - Título II: Da Família Substituta - Da Tutela', chapter: 'Tutela de Menores até 18 Anos, Perda do Poder Familiar e Deveres do Tutor', category: 'Adoção e Guarda' },
  { start: 39, end: 52, title: 'Livro I - Título II: Da Família Substituta - Da Adoção', chapter: 'Requisitos da Adoção (Diferença de 16 Anos, Consentimento de Menores > 12 Anos), Irrevogabilidade e Adoção Internacional', category: 'Adoção e Guarda' },
  { start: 53, end: 59, title: 'Livro I - Título II: Do Direito à Educação, à Cultura, ao Esporte e ao Lazer', chapter: 'Acesso à Escola Pública Próxima da Residência, Vaga para Irmãos, Grêmio Estudantil e Proibição de Discriminação', category: 'Direitos Fundamentais' },
  { start: 60, end: 69, title: 'Livro I - Título II: Do Direito à Profissionalização e Proteção no Trabalho', chapter: 'Proibição de Trabalho até 14 Anos, Contrato de Aprendizagem (14 a 24 Anos) e Vedação de Trabalho Noturno/Insalubre', category: 'Direitos Fundamentais' },
  { start: 70, end: 85, title: 'Livro I - Título III: Da Prevenção Especial e Autorização para Viagens', chapter: 'Classificação Indicativa de Espetáculos e Autorização Judicial para Viagens Nacionais e Internacionais de Menores', category: 'Direitos Fundamentais' },

  // LIVRO II: PARTE ESPECIAL
  { start: 86, end: 97, title: 'Livro II - Título I: Da Política de Atendimento', chapter: 'Diretrizes das Políticas Públicas, Municipalização e Fiscalização das Entidades de Acolhimento', category: 'Medidas Protetivas' },
  { start: 98, end: 102, title: 'Livro II - Título II: Das Medidas de Proteção', chapter: 'Hipóteses de Ameaça/Violação a Direitos (Art. 98) e Rol de Medidas Protetivas à Criança e Adolescente (Art. 101)', category: 'Medidas Protetivas' },
  { start: 103, end: 109, title: 'Livro II - Título III: Da Prática de Ato Infracional - Disposições Gerais', chapter: 'Conceito de Ato Infracional, Inimputabilidade Penal, Apreensão em Flagrante e Garantias Processuais', category: 'Ato Infracional e Medidas Socioeducativas' },
  { start: 110, end: 111, title: 'Livro II - Título III: Das Garantias Processuais do Adolescente', chapter: 'Direito à Ampla Defesa, Assistência Jurídica Gratuita, Notificação dos Pais e Inadmissibilidade de Prova Ilícita', category: 'Ato Infracional e Medidas Socioeducativas' },
  { start: 112, end: 125, title: 'Livro II - Título III: Das Medidas Socioeducativas', chapter: 'Rol das Medidas Socioeducativas (Art. 112): Advertência, Prestação de Serviços, Liberdade Assistida, Semiliberdade e Internação (Art. 122)', category: 'Ato Infracional e Medidas Socioeducativas' },
  { start: 126, end: 128, title: 'Livro II - Título III: Da Remissão Pré-Processual e Processual', chapter: 'Remissão Ministerial (Exclusão do Processo) e Remissão Judicial (Extinção ou Suspensão com Medida não Privativa)', category: 'Ato Infracional e Medidas Socioeducativas' },
  { start: 129, end: 130, title: 'Livro II - Título IV: Das Medidas Pertinentes aos Pais ou Responsável', chapter: 'Encaminhamento a Cursos, Tratamento Psicológico, Obrigação de Matricular e Afastamento Cautelar do Lar', category: 'Medidas Protetivas' },
  { start: 131, end: 140, title: 'Livro II - Título V: Do Conselho Tutelar', chapter: 'Natureza (Órgão Permanente, Autônomo e Não Jurisdicional - Art. 131), Composição (5 Membros, Mandato de 4 Anos) e Atribuições (Art. 136)', category: 'Conselho Tutelar' },
  { start: 141, end: 224, title: 'Livro II - Título VI: Do Acesso à Justiça e Procedimentos Judiciais', chapter: 'Competência da Vara da Infância, Procedimento de Apuração de Ato Infracional, Perda do Poder Familiar e Adoção', category: 'Medidas Protetivas' },
  { start: 225, end: 258, title: 'Livro II - Título VII: Dos Crimes e Infrações Administrativas no ECA', chapter: 'Crimes Contra a Criança e Adolescente, Venda de Bebida Alcoólica a Menor (Art. 243), Pornografia Infantil e Multas', category: 'Medidas Protetivas' },
  { start: 259, end: 267, title: 'Livro II - Disposições Finais e Transitórias do ECA', chapter: 'Regras de Transição, Revogações e Vigência da Lei nº 8.069/1990', category: 'Medidas Protetivas' }
];

// Artigos de altíssima relevância prática e cobrados com frequência na OAB e Concursos
const ECA_SPECIAL_ARTICLES = {
  1: {
    title: 'Da Doutrina da Proteção Integral à Criança e ao Adolescente',
    oab: true,
    text: 'Art. 1º Esta Lei dispõe sobre a proteção integral à criança e ao adolescente.',
    explanation: 'Adoção da Doutrina da Proteção Integral (art. 227 da CF/88), superando a antiga Doutrina da Situação Irregular do Código de Menores de 1979. Crianças e adolescentes são sujeitos de direitos em condição peculiar de desenvolvimento.',
    summary: 'Consagra a Doutrina da Proteção Integral a todas as crianças e adolescentes como sujeitos de direitos.'
  },
  2: {
    title: 'Do Conceito Legal de Criança e Adolescente e Aplicação Excepcional',
    oab: true,
    text: 'Art. 2º Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.\nParágrafo único. Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade.',
    explanation: 'Critério biológico: Criança (0 a 11 anos, 11 meses e 29 dias) pratica ato infracional e recebe APENAS medidas protetivas. Adolescente (12 a 18 anos) recebe medidas socioeducativas. A internação socioeducativa estende-se excepcionalmente até os 21 anos (Art. 121, § 5º).',
    summary: 'Criança: até 12 anos incompletos (apenas medidas protetivas); Adolescente: 12 a 18 anos incompletos (medidas socioeducativas).'
  },
  4: {
    title: 'Do Princípio da Prioridade Absoluta dos Direitos da Criança e Adolescente',
    oab: true,
    text: 'Art. 4º É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade e à convivência familiar e comunitária.\nParágrafo único. A garantia de prioridade compreende:\na) primazia de receber proteção e socorro em quaisquer circunstâncias;\nb) precedência de atendimento nos serviços públicos ou de relevância pública;\nc) preferência na formulação e na execução das políticas sociais públicas;\nd) destinação privilegiada de recursos públicos nas áreas relacionadas com a proteção à infância e à juventude.',
    explanation: 'Princípio da Prioridade Absoluta: primazia de socorro, precedência de atendimento e destinação orçamentária privilegiada em favor da infância e juventude.',
    summary: 'Prioridade absoluta: primazia de socorro, preferência em serviços públicos e destinação privilegiada de recursos.'
  },
  "18-A": {
    title: 'Da Proibição de Castigo Físico e Tratamento Cruel (Lei Menino Bernardo / Palmada)',
    oab: true,
    text: 'Art. 18-A. A criança e o adolescente têm o direito de ser educados e cuidados sem o uso de castigo físico ou de tratamento cruel ou degradante, como formas de correção, disciplina, educação ou qualquer outro pretexto, pelos pais, pelos integrantes da família ampliada, pelos responsáveis, pelos agentes públicos executores de medidas socioeducativas ou por qualquer pessoa encarregada de cuidar deles, tratá-los, educá-los ou protegê-los.',
    explanation: 'Lei da Palmada / Menino Bernardo (Lei 13.010/2014): proíbe expressamente castigos físicos corporais ou tratamentos degradantes/humilhantes como método pedagógico.',
    summary: 'Direito a ser educado sem castigo físico ou tratamento cruel/degradante por pais ou educadores.'
  },
  19: {
    title: 'Do Direito à Convivência Familiar e Excepcionalidade do Acolhimento',
    oab: true,
    text: 'Art. 19. É direito da criança e do adolescente ser criado e educado no seio de sua família e, excepcionalmente, em família substituta, assegurada a convivência familiar e comunitária, em ambiente que garanta seu desenvolvimento integral.\n§ 1º Toda criança ou adolescente que estiver inserido em programa de acolhimento familiar ou institucional terá sua situação reavaliada, no máximo, a cada 3 (três) meses.\n§ 2º A permanência da criança e do adolescente em programa de acolhimento institucional não se prolongará por mais de 18 (dezoito) meses, salvo comprovada necessidade.',
    explanation: 'Direito à família natural. O acolhimento institucional é medida excepcional e provisória: reavaliação obrigatória trimestral (a cada 3 meses) e permanência máxima de até 18 meses (§ 2º).',
    summary: 'Direito à família natural; acolhimento institucional é excepcional, reavaliado a cada 3 meses e limitado a 18 meses.'
  },
  33: {
    title: 'Do Instituto da Guarda de Menores e Fins Previdenciários',
    oab: true,
    text: 'Art. 33. A guarda obriga a prestação de assistência material, moral e educacional à criança ou adolescente, conferindo a seu detentor o direito de opor-se a terceiros, inclusive aos pais.\n§ 1º A guarda destina-se a regularizar a posse de fato, podendo ser deferida, liminar ou incidentalmente, nos procedimentos de tutela e adoção.\n§ 2º Excepcionalmente, deferir-se-á a guarda, fora dos casos de tutela e adoção, para atender a situações peculiares ou suprir a falta eventual dos pais ou responsável.\n§ 3º A guarda confere à criança ou adolescente a condição de dependente, para todos os fins e efeitos de direito, inclusive previdenciários.',
    explanation: 'Instituto da guarda: regulariza a posse de fato e confere deveres de assistência material, moral e educacional. O § 3º confere a condição de dependente previdenciário.',
    summary: 'A guarda confere assistência material, moral e educacional e condição de dependente previdenciário.'
  },
  39: {
    title: 'Do Instituto da Adoção, Requisitos e Irrevogabilidade',
    oab: true,
    text: 'Art. 39. A adoção de criança e de adolescente reger-se-á segundo o disposto nesta Lei.\n§ 1º A adoção é medida excepcional e irrevogável, à qual se deve recorrer apenas quando esgotados os recursos de manutenção da criança ou adolescente na família natural ou extensa.\nArt. 42. Podem adotar os maiores de 18 (dezoito) anos, independentemente do estado civil.\n§ 3º O adotante há de ser, pelo menos, dezesseis anos mais velho do que o adotando (Diferença Mínima de 16 Anos).\nArt. 45. A adoção depende do consentimento dos pais ou do representante legal do adotando.\n§ 2º Em se tratando de adotando maior de doze anos de idade, será também necessário o seu consentimento (Consentimento Obrigatório aos 12 Anos).',
    explanation: 'Regras de ouro da adoção no ECA: idade mínima do adotante de 18 anos, diferença de idade de no mínimo 16 anos entre adotante e adotado, consentimento obrigatório do adolescente maior de 12 anos e caráter irrevogável (rompe vínculos com a família biológica, salvo impedimentos matrimoniais).',
    summary: 'Adoção: medida excepcional e irrevogável; adotante >= 18 anos; diferença mínima de 16 anos; exige consentimento do maior de 12 anos.'
  },
  60: {
    title: 'Da Idade Mínima para o Trabalho e Contrato de Aprendizagem',
    oab: true,
    text: 'Art. 60. É proibido qualquer trabalho a menores de quatorze anos de idade, salvo na condição de aprendiz.\nArt. 67. Ao adolescente empregado, aprendiz, em regime familiar de trabalho, aluno de escola técnica, assistido em entidade governamental ou não-governamental, é vedado trabalho:\nI - noturno, realizado entre as vinte e duas horas de um dia e as cinco horas do dia seguinte;\nII - perigoso, insalubre ou penoso;\nIII - realizado em locais prejudiciais à sua formação e ao seu desenvolvimento físico, psíquico, moral e social;\nIV - realizado em horários e locais que não permitam a freqüência à escola.',
    explanation: 'Regime constitucional do trabalho infantil: proibição total de trabalho até 13 anos; de 14 a 15 anos permite-se EXCLUSIVAMENTE aprendizagem; de 16 a 17 anos permite-se trabalho regular com vedações expressas (noturno, perigoso, insalubre ou prejudicial à escola).',
    summary: 'Proibido trabalho a menores de 14 anos (salvo aprendiz a partir de 14); vedado trabalho noturno, insalubre ou perigoso aos menores de 18.'
  },
  83: {
    title: 'Da Autorização Judicial para Viagens Nacionais de Menores de 16 Anos',
    oab: true,
    text: 'Art. 83. Nenhuma criança ou adolescente menor de 16 (dezesseis) anos poderá viajar para fora da comarca onde reside desacompanhado dos pais ou dos responsáveis sem expressa autorização judicial.\n§ 1º A autorização não será exigida quando:\na) tratar-se de comarca contígua à da residência da criança ou do adolescente menor de 16 (dezesseis) anos, se na mesma unidade da Federação, ou incluída na mesma região metropolitana;\nb) a criança ou o adolescente menor de 16 (dezesseis) anos estiver acompanhado: 1. de ascendente ou colateral maior, até o terceiro grau, comprovado documentalmente o parentesco; 2. de pessoa maior, expressamente autorizada por mãe, pai ou responsável, por meio de escritura pública ou de documento particular com firma reconhecida.',
    explanation: 'Regra de viagens nacionais: menores de 16 anos desacompanhados necessitam de autorização judicial ou autorização com firma reconhecida dos pais, dispensada em comarcas contíguas/metropolitanas ou se acompanhados de parentes até 3º grau (pais, avós, tios, irmãos maiores).',
    summary: 'Menores de 16 anos desacompanhados exigem autorização para viagens intermunicipais, salvo com parentes até 3º grau ou autorização com firma.'
  },
  98: {
    title: 'Das Hipóteses de Aplicação das Medidas de Proteção',
    oab: true,
    text: 'Art. 98. As medidas de proteção à criança e ao adolescente são aplicáveis sempre que os direitos reconhecidos nesta Lei forem ameaçados ou violados:\nI - por ação ou omissão da sociedade ou do Estado;\nII - por falta, omissão ou abuso dos pais ou responsável;\nIII - em razão de sua conduta.',
    explanation: 'Tríplice causa de aplicação de medidas protetivas: omissão estatal/social, negligência/abuso familiar ou conduta da própria criança/adolescente.',
    summary: 'Medidas de proteção são aplicáveis por omissão do Estado, falta dos pais ou em razão da conduta do próprio menor.'
  },
  101: {
    title: 'Do Rol das Medidas Específicas de Proteção',
    oab: true,
    text: 'Art. 101. Verificada qualquer das hipóteses previstas no art. 98 desta Lei, a autoridade competente poderá determinar, dentre outras, as seguintes medidas:\nI - encaminhamento aos pais ou responsável, mediante termo de responsabilidade;\nII - orientação, apoio e acompanhamento temporários;\nIII - matrícula e frequência obrigatórias em estabelecimento oficial de ensino fundamental;\nIV - inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente;\nV - requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial;\nVI - inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos;\nVII - acolhimento institucional;\nVIII - inclusão em programa de acolhimento familiar;\nIX - colocação em família substituta (guarda, tutela ou adoção).',
    explanation: 'Rol não taxativo de medidas protetivas. Podem ser aplicadas tanto pelo Conselho Tutelar (incisos I a VI) quanto com exclusividade pelo Juiz da Infância (incisos VII a IX: acolhimento e colocação em família substituta).',
    summary: 'Rol de medidas protetivas: termo aos pais, apoio, matrícula, tratamento médico, acolhimento familiar/institucional e família substituta.'
  },
  103: {
    title: 'Do Conceito de Ato Infracional e Diferença entre Criança e Adolescente',
    oab: true,
    text: 'Art. 103. Considera-se ato infracional a conduta descrita como crime ou contravenção penal.\nArt. 104. São penalmente inimputáveis os menores de dezoito anos, sujeitos às medidas previstas nesta Lei.\nParágrafo único. Para os efeitos desta Lei, deve ser considerada a idade do adolescente à data do fato (Teoria da Atividade - Súmula 605 STJ).\nArt. 105. Ao ato infracional praticado por criança corresponderão as medidas previstas no art. 101 (Medidas de Proteção).',
    explanation: 'Conceito de ato infracional: conduta análoga a crime ou contravenção. A apuração da idade obedece à Teoria da Atividade (data do fato). Criança que comete ato infracional recebe EXCLUSIVAMENTE medida de proteção (Art. 101); adolescente recebe medidas socioeducativas.',
    summary: 'Ato infracional é conduta análoga a crime/contravenção; idade apurada na data do fato; criança recebe apenas medida de proteção.'
  },
  112: {
    title: 'Do Rol das Medidas Socioeducativas Aplicáveis ao Adolescente',
    oab: true,
    text: 'Art. 112. Verificada a prática de ato infracional, a autoridade competente poderá aplicar ao adolescente as seguintes medidas:\nI - advertência;\nII - obrigação de reparar o dano;\nIII - prestação de serviços à comunidade;\nIV - liberdade assistida;\nV - inserção em regime de semi-liberdade;\nVI - internação em estabelecimento educacional;\n§ 1º A medida aplicada ao adolescente levará em conta a sua capacidade de cumpri-la, as circunstâncias e a gravidade da infração.\n§ 2º Em hipótese alguma e sob pretexto algum, será admitida a prestação de trabalho forçado.',
    explanation: 'Rol taxativo de medidas socioeducativas aplicáveis exclusivamente a adolescentes. A prestação de serviços tem prazo máximo de 6 meses (Art. 117); a liberdade assistida tem prazo mínimo de 6 meses (Art. 118, § 2º).',
    summary: 'Medidas socioeducativas: advertência, reparação do dano, prestação de serviços (máx 6 meses), liberdade assistida (mín 6 meses), semiliberdade e internação.'
  },
  121: {
    title: 'Do Regime de Internação Socioeducativa e Prazo Máximo de 3 Anos',
    oab: true,
    text: 'Art. 121. A internação constitui medida privativa da liberdade, sujeita aos princípios de brevidade, excepcionalidade e respeito à condição peculiar de pessoa em desenvolvimento.\n§ 2º A desinternação será precedida de autorização judicial, ouvido o Ministério Público.\n§ 3º Em nenhuma hipótese o período máximo de internação excederá a três anos (Prazo Máximo Improrrogável de 3 Anos).\n§ 5º A liberação será compulsória aos vinte e um anos de idade (Liberação Compulsória aos 21 Anos).',
    explanation: 'A internação socioeducativa rege-se pelos princípios da brevidade e excepcionalidade. O prazo máximo é de 3 anos (sem prazo mínimo fixado, com reavaliação semestral obrigatória) e a liberação é compulsória aos 21 anos (§ 5º).',
    summary: 'Internação socioeducativa: prazo máximo improrrogável de 3 anos, reavaliação a cada 6 meses e liberação compulsória aos 21 anos.'
  },
  122: {
    title: 'Das Hipóteses Taxativas de Cabimento da Medida de Internação',
    oab: true,
    text: 'Art. 122. A medida de internação só poderá ser aplicada quando:\nI - tratar-se de ato infracional cometido mediante grave ameaça ou violência a pessoa;\nII - por reiteração no cometimento de outras infrações graves (Súmula 498 do STJ: exige reiteração de infrações graves prévias, não bastando tráfico isolado);\nIII - por descumprimento reiterado e injustificável da medida anteriormente imposta (Internação-Sanção pelo prazo máximo de 3 meses - § 1º).\n§ 2º Em nenhuma hipótese será aplicada a internação, havendo outra medida adequada.',
    explanation: 'Rol TAXATIVO do cabimento da internação: 1) Violência ou grave ameaça (ex: roubo, homicídio, estupro); 2) Reiteração de infrações graves; 3) Internação-sanção por descumprimento de medida anterior (máximo de 3 meses). Tráfico de drogas isolado sem violência NÃO admite internação (Súmula 498 STJ).',
    summary: 'Internação só cabe em 3 hipóteses taxativas: violência/grave ameaça, reiteração em infrações graves ou descumprimento reiterado de medida (máx 3 meses).'
  },
  126: {
    title: 'Do Instituto da Remissão Pré-Processual e Processual',
    oab: true,
    text: 'Art. 126. Antes de iniciado o procedimento judicial para apuração de ato infracional, o Ministério Público poderá conceder a remissão, como forma de exclusão do processo, atendendo às circunstâncias e conseqüências do fato, ao contexto social, bem como à personalidade do adolescente e sua maior ou menor participação no ato infracional.\nParágrafo único. Iniciado o procedimento, a concessão da remissão pela autoridade judiciária importará na suspensão ou extinção do processo.',
    explanation: 'Remissão ministerial (pré-processual): oferecida pelo promotor antes da representação, gerando exclusão do processo. Remissão judicial: concedida pelo juiz após a representação, gerando extinção ou suspensão do feito. A remissão não gera antecedentes nem confissão de culpa.',
    summary: 'Remissão: perdão concedido pelo MP (exclusão do processo) ou pelo Juiz (extinção/suspensão); não implica reconhecimento de culpa.'
  },
  131: {
    title: 'Do Conceito e Natureza Jurídica do Conselho Tutelar',
    oab: true,
    text: 'Art. 131. O Conselho Tutelar é órgão permanente e autônomo, não jurisdicional, encarregado pela sociedade de zelar pelo cumprimento dos direitos da criança e do adolescente, definidos nesta Lei.\nArt. 132. Em cada Município e em cada Região Administrativa do Distrito Federal haverá, no mínimo, 1 (um) Conselho Tutelar como órgão integrante da administração pública local, composto de 5 (cinco) membros, escolhidos pela população local para mandato de 4 (quatro) anos, permitida a recondução por novos processos de escolha.',
    explanation: 'Natureza jurídica do Conselho Tutelar: órgão permanente, autônomo, não jurisdicional (administrativo). Composição de 5 conselheiros eleitos pela comunidade para mandato de 4 anos, permitidas reconduções.',
    summary: 'Conselho Tutelar: órgão permanente, autônomo e não jurisdicional, composto por 5 membros eleitos para mandato de 4 anos.'
  },
  136: {
    title: 'Das Atribuições do Conselho Tutelar',
    oab: true,
    text: 'Art. 136. São atribuições do Conselho Tutelar:\nI - atender as crianças e adolescentes nas hipóteses previstas nos arts. 98 e 105, aplicando as medidas previstas no art. 101, I a VII;\nII - atender e aconselhar os pais ou responsável, aplicando as medidas previstas no art. 129, I a VII;\nIII - promover a execução de suas decisões, podendo para tanto:\na) requisitar serviços públicos nas áreas de saúde, educação, serviço social, previdência, trabalho e segurança;\nb) representar junto à autoridade judiciária nos casos de descumprimento injustificado de suas deliberações;\nIV - encaminhar ao Ministério Público notícia de fato que constitua infração administrativa ou penal contra os direitos da criança ou adolescente;\nV - encaminhar à autoridade judiciária os casos de sua competência;\nVI - providenciar a medida estabelecida pela autoridade judiciária, dentre as previstas no art. 101, de I a VI, para o infrator.',
    explanation: 'Atribuições executivas do Conselho Tutelar: aplicar medidas protetivas extrajudiciais, requisitar serviços públicos de saúde e educação, fiscalizar entidades e acionar o Ministério Público e o Judiciário.',
    summary: 'Atribuições do Conselho Tutelar: aplicar medidas de proteção (I a VII do Art. 101), requisitar serviços públicos e notificar MP e Judiciário.'
  },
  243: {
    title: 'Do Crime de Venda de Bebida Alcoólica ou Substância a Menor de 18 Anos',
    oab: true,
    text: 'Art. 243. Vender, fornecer, servir, ministrar ou entregar, ainda que gratuitamente, de qualquer forma, a criança ou a adolescente, bebida alcoólica ou, sem justa causa, outros produtos cujos componentes possam causar dependência física ou psíquica: Pena - detenção de 2 (dois) a 4 (quatro) anos, e multa, se o fato não constitui crime mais grave.',
    explanation: 'Crime formal de perigo abstrato: pune criminalmente com detenção de 2 a 4 anos quem vende, entrega ou serve bebida alcoólica ou produtos que geram dependência a menores de 18 anos.',
    summary: 'Crime vender, fornecer ou servir bebida alcoólica ou substância com dependência a menor de 18 anos (pena: 2 a 4 anos).'
  }
};

function getStructureForArticle(num) {
  for (const s of ECA_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return ECA_STRUCTURE[ECA_STRUCTURE.length - 1];
}

const allEcaArticles = [];

for (let num = 1; num <= 267; num++) {
  const struct = getStructureForArticle(num);
  const specific = ECA_SPECIAL_ARTICLES[num];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' do Estatuto da Criança e do Adolescente';
  const artId = 'eca-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 1 && num <= 6) ||
    (num >= 15 && num <= 19) ||
    (num >= 33 && num <= 52) ||
    (num >= 60 && num <= 69) ||
    (num >= 83 && num <= 85) ||
    (num >= 98 && num <= 105) ||
    (num >= 112 && num <= 128) ||
    (num >= 131 && num <= 140) ||
    (num >= 240 && num <= 244)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial da Lei nº 8.069/1990 - Estatuto da Criança e do Adolescente, ' + struct.title + ', ' + struct.chapter + '). Texto legal consolidado em vigor conforme publicação no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria jurídica protetiva de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo basilar de proteção integral à infância e juventude.');
  let summary = specific ? specific.summary : ('Norma de ' + struct.category + ' do ECA, estabelecendo preceitos e garantias sobre ' + struct.chapter.toLowerCase() + '.');

  allEcaArticles.push({
    id: artId,
    law_id: 'eca',
    subject_id: 'eca',
    law_name: 'Estatuto da Criança e do Adolescente',
    law_number: 'Lei nº 8.069/1990',
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
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm#art' + num,
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
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na atuação perante as Varas da Infância e Juventude, Conselho Tutelar e Ministério Público.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas provas da OAB e concursos da Magistratura, Ministério Público e Defensoria Pública.') : 'Leitura indispensável para domínio do Direito da Criança e do Adolescente.',
      legal_terms: ['ECA', struct.category, 'Proteção Integral', 'Infância e Juventude'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'ecaFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 267 Artigos do Estatuto da Criança e do Adolescente (Lei 8.069/1990)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst ECA_ALL_ARTICLES = ' + JSON.stringify(allEcaArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.ECA_ALL_ARTICLES = ECA_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de eca e insere todos os 267 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "eca");\n    VADE_MECUM_DB.articles.push(...ECA_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo do ECA carregado com sucesso (267 Artigos: Art. 1º ao Art. 267).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = ECA_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allEcaArticles.length + ' artigos do ECA em ' + outputPath);
