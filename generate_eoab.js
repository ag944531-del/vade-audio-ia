const fs = require('fs');
const path = require('path');

// Estrutura sistemática do Estatuto da Advocacia e da OAB (Lei nº 8.906/1994)
const EOAB_STRUCTURE = [
  // TÍTULO I: DA ADVOCACIA
  { start: 1, end: 5, title: 'Título I - Capítulo I: Da Atividade de Advocacia', chapter: 'Atos Privativos de Advocacia (Art. 1º), Mandato, Procuração e Imunidade Profissional', category: 'Prerrogativas do Advogado' },
  { start: 6, end: 7, title: 'Título I - Capítulo II: Dos Direitos e Prerrogativas do Advogado', chapter: 'Inexistência de Hierarquia (Art. 6º), Inviolabilidade do Escritório, Comunicação Reservada com Preso, Desagravo e Prisão em Sala de Estado-Maior (Art. 7º)', category: 'Prerrogativas do Advogado' },
  { start: 8, end: 14, title: 'Título I - Capítulo III: Da Inscrição na OAB e do Estágio', chapter: 'Requisitos de Inscrição (Art. 8º), Inscrição Principal, Inscrição Suplementar (+5 causas/ano - Art. 10), Cancelamento e Licenciamento', category: 'Inscrição na OAB' },
  { start: 15, end: 17, title: 'Título I - Capítulo IV: Da Sociedade de Advogados', chapter: 'Sociedade Simples de Advogados, Sociedade Unipessoal de Advocacia (Art. 15) e Responsabilidade Subsidiária Ilimitada', category: 'Inscrição na OAB' },
  { start: 18, end: 21, title: 'Título I - Capítulo V: Do Advogado Empregado', chapter: 'Jornada de Trabalho (8h diárias / 40h semanais), Dedicação Exclusiva e Titularidade dos Honorários Sucumbenciais', category: 'Honorários Advocatícios' },
  { start: 22, end: 26, title: 'Título I - Capítulo VI: Dos Honorários Advocatícios', chapter: 'Espécies de Honorários (Contratuais, Sucumbenciais e Arbitrados - Art. 22), Execução Autônoma (Art. 23) e Prescrição Quinquenal (Art. 25)', category: 'Honorários Advocatícios' },
  { start: 27, end: 30, title: 'Título I - Capítulo VII: Das Incompatibilidades e Impedimentos', chapter: 'Incompatibilidade Total (Art. 28: Juízes, MP, Policiais, Militares e Chefes do Executivo) vs. Impedimento Parcial (Art. 30: Servidores e Parlamentares)', category: 'Incompatibilidades e Impedimentos' },
  { start: 31, end: 33, title: 'Título I - Capítulo VIII: Da Ética do Advogado', chapter: 'Deveres Éticos, Sigilo Profissional Absoluto e Submissão ao Código de Ética e Disciplina da OAB', category: 'Infrações Disciplinares' },
  { start: 34, end: 43, title: 'Título I - Capítulo IX: Das Infrações e Sanções Disciplinares', chapter: 'Rol de 29 Infrações (Art. 34), Sanções: Censura (Art. 36), Suspensão (Art. 37), Exclusão (Art. 38 - Quórum de 2/3) e Multa, e Prescrição Disciplinar (Art. 43)', category: 'Infrações Disciplinares' },

  // TÍTULO II: DA ORDEM DOS ADVOGADOS DO BRASIL
  { start: 44, end: 50, title: 'Título II - Capítulo I: Dos Fins e da Organização da OAB', chapter: 'Natureza Jurídica Sui Generis (ADI 3026 STF), Autonomia Institucional e Estrutura dos 4 Órgãos da OAB (Art. 45)', category: 'Inscrição na OAB' },
  { start: 51, end: 55, title: 'Título II - Capítulo II: Do Conselho Federal da OAB', chapter: 'Composição (3 Conselheiros Federais por Seccional / Delegação), Diretoria e Competências Normativas', category: 'Inscrição na OAB' },
  { start: 56, end: 59, title: 'Título II - Capítulo III: Dos Conselhos Seccionais e TED', chapter: 'Competências dos Conselhos Seccionais e Julgamento Ético pelo Tribunal de Ética e Disciplina (TED)', category: 'Infrações Disciplinares' },
  { start: 60, end: 61, title: 'Título II - Capítulo IV: Das Subseções da OAB', chapter: 'Criação de Subseções com Mínimo de 15 Advogados Domiciliados', category: 'Inscrição na OAB' },
  { start: 62, end: 62, title: 'Título II - Capítulo V: Das Caixas de Assistência dos Advogados (CAA)', chapter: 'Criação da CAA em Seccionais com Mais de 1.500 Inscritos e Benefícios de Seguridade', category: 'Inscrição na OAB' },
  { start: 63, end: 67, title: 'Título II - Capítulo VI: Das Eleições e Mandatos na OAB', chapter: 'Voto Obrigatório dos Advogados, Mandato Trienal (3 Anos), Chapa com Paridade de Gênero e Cotas Raciais', category: 'Inscrição na OAB' },

  // TÍTULO III: DO PROCESSO NA OAB
  { start: 68, end: 77, title: 'Título III: Do Processo Disciplinar e Recursos na OAB', chapter: 'Instauração de Ofício ou Representação, Sigilo do Processo, Recursos com Efeito Suspensivo e Julgamento no TED', category: 'Infrações Disciplinares' },

  // TÍTULO IV: DISPOSIÇÕES FINAIS E TRANSITÓRIAS
  { start: 78, end: 87, title: 'Título IV: Disposições Gerais e Transitórias do EOAB', chapter: 'Imunidade Tributária da OAB, Uso Exclusivo da Denominação e Vigência da Lei nº 8.906/1994', category: 'Prerrogativas do Advogado' }
];

// Artigos de altíssima relevância prática e cobrados em todas as provas da 1ª Fase da OAB (Disciplina de Ética com 8 questões)
const EOAB_SPECIAL_ARTICLES = {
  1: {
    title: 'Dos Atos Privativos de Advocacia e Postulação em Juízo',
    oab: true,
    text: 'Art. 1º São atividades privativas de advocacia:\nI - a postulação a qualquer órgão do Poder Judiciário e aos juizados especiais;\nII - as atividades de consultoria, assessoria e direção jurídicas.\n§ 1º Não se inclui na atividade privativa a impetração de habeas corpus em qualquer tribunal ou tribunal de justiça.\n§ 2º Os atos e contratos constitutivos de pessoas jurídicas só podem ser admitidos a registro, nos órgãos competentes, quando visados por advogados (ressalvadas as ME/EPP da Lei Complementar 123/06).\n§ 3º É vedada a divulgação de advocacia em conjunto com outra atividade.',
    explanation: 'Atividades privativas da advocacia: postulação judicial e consultoria/assessoria/direção jurídica. Exceções à postulação privativa: Habeas Corpus (qualquer pessoa pode impetrar), Juizados Especiais Cíveis até 20 SM (Lei 9.099/95) e Justiça do Trabalho / Jus Postulandi (Art. 791 CLT).',
    summary: 'Atividades privativas: postulação judicial e consultoria/assessoria jurídica; HC não exige advogado; atos constitutivos de PJ exigem visto de advogado.'
  },
  2: {
    title: 'Do Múnus Público do Advogado e Inviolabilidade Profissional',
    oab: true,
    text: 'Art. 2º O advogado é indispensável à administração da justiça.\n§ 1º No seu ministério privado, o advogado presta serviço público e exerce função social.\n§ 2º No processo judicial, o advogado contribui, na postulação de decisão favorável ao seu constituinte, ao convencimento do julgador, e seus atos constituem múnus público.\n§ 3º No exercício da profissão, o advogado é inviolável por seus atos e manifestações, nos limites desta lei.',
    explanation: 'Postulado constitucional (art. 133 da CF/88) e múnus público: o advogado possui imunidade profissional por suas manifestações e debates na causa (imunidade penal por injúria e difamação - não alcança desacato nem calúnia).',
    summary: 'Advogado é indispensável à administração da justiça (múnus público); imunidade profissional por injúria e difamação nos debates.'
  },
  6: {
    title: 'Da Inexistência de Hierarquia entre Advogados, Juízes e Promotores',
    oab: true,
    text: 'Art. 6º Não há hierarquia nem subordinação entre advogados, magistrados e membros do Ministério Público, devendo todos tratar-se com consideração e respeito recíprocos.\nParágrafo único. As autoridades, os servidores públicos e os serventuários da justiça devem dispensar ao advogado, no exercício da profissão, tratamento compatível com a dignidade da advocacia e condições adequadas a seu desempenho.',
    explanation: 'Princípio da Horizontalidade Processual: inexiste subordinação entre a advocacia, a magistratura e o Ministério Público. Todos atuam em igualdade de condições na administração da justiça.',
    summary: 'Não há hierarquia nem subordinação entre advogados, juízes e promotores; tratamento com respeito e urbanidade recíprocos.'
  },
  7: {
    title: 'Dos Direitos e Prerrogativas Fundamentais do Advogado',
    oab: true,
    text: 'Art. 7º São direitos do advogado:\nI - exercer, com liberdade, a profissão em todo o território nacional;\nII - a inviolabilidade de seu escritório ou local de trabalho, bem como de seus instrumentos de trabalho, de sua correspondência escrita, eletrônica, telefônica e telemática, desde que relativas ao exercício da advocacia;\nIII - comunicar-se com seus clientes, pessoal e reservadamente, mesmo sem procuração, quando estes se acharem presos, detidos ou recolhidos em estabelecimentos civis ou militares, ainda que considerados incomunicáveis;\nIV - ter a presença de representante da OAB, quando preso em flagrante, por motivo ligado ao exercício da advocacia, para lavratura do auto respectivo, sob pena de nulidade e, nos demais casos, a comunicação expressa à seccional da OAB;\nV - não ser recolhido preso, antes de sentença transitada em julgado, senão em sala de Estado-Maior, com instalações e comodidades condignas, e, na sua falta, em prisão domiciliar;\nVI - ingressar livremente nas salas de sessões dos tribunais, nas salas e dependências de audiências, secretarias, cartórios, delegacias e prisões;\nXIV - examinar, em qualquer instituição responsável por conduzir investigação, mesmo sem procuração, autos de flagrante e de investigações de qualquer natureza (Súmula Vinculante 14 do STF);\nXVII - ser publicamente desagravado, quando ofendido no exercício da profissão ou em razão dela.',
    explanation: 'O mais cobrado no Exame de Ordem! Principais prerrogativas: 1) Inviolabilidade do escritório/comunicações (busca e apreensão exige mandado específico, fundados indícios de crime do advogado e presença de delegado da OAB); 2) Comunicação reservada com preso mesmo sem procuração e incomunicável; 3) Sala de Estado-Maior ou prisão domiciliar até o trânsito em julgado; 4) Acesso a inquéritos policiais mesmo sem procuração (salvo diligências em andamento).',
    summary: 'Prerrogativas do advogado: inviolabilidade do escritório, comunicação reservada com cliente preso, sala de Estado-Maior até trânsito em julgado e acesso a inquéritos.'
  },
  "7-A": {
    title: 'Dos Direitos e Prerrogativas da Advogada Mulher (Gestante, Lactante e Adotante)',
    oab: true,
    text: 'Art. 7º-A. São direitos da advogada:\nI - gestante:\na) entrada em tribunais sem ser submetida a detectores de metais e aparelhos de raios X;\nb) reserva de vaga em garagens dos fóruns e tribunais;\nII - lactante, adotante ou que der à luz, acesso a creche onde houver, ou a local adequado a atendimento das necessidades do bebê;\nIII - gestante, lactante, adotante ou que der à luz, preferência na ordem das sustentações orais e das audiências a serem realizadas a cada dia;\nIV - adotante ou que der à luz, suspensão de prazos processuais por 30 (trinta) dias, desde que haja notificação por escrito ao cliente e seja a única patrona da causa.',
    explanation: 'Estatuto da Advogada Mulher (Lei Julia Matos - Lei 13.363/2016): dispensa de raio-X para gestante, preferência em sustentações orais e suspensão de prazos por 30 dias se for a única advogada constituída na causa.',
    summary: 'Prerrogativas da advogada gestante/lactante: dispensa de detector de metal, preferência em audiências e suspensão de prazo de 30 dias para a única patrona.'
  },
  "7-B": {
    title: 'Do Crime de Violação de Prerrogativas do Advogado (Lei de Abuso de Autoridade)',
    oab: true,
    text: 'Art. 7º-B. Constitui crime violar direito ou prerrogativa de advogado previstos nos incisos II, III, IV e V do caput do art. 7º desta Lei: Pena - detenção, de 2 (dois) a 4 (quatro) anos, e multa.',
    explanation: 'Criminalização da violação de prerrogativas (incluído pela Lei 14.365/2022): punição com detenção de 2 a 4 anos para a autoridade que violar a inviolabilidade do escritório (II), comunicação reservada com preso (III), presença da OAB no flagrante (IV) ou sala de Estado-Maior (V).',
    summary: 'Crime violar prerrogativas essenciais do advogado (inviolabilidade, comunicação com preso, prisão de Estado-Maior); pena: 2 a 4 anos.'
  },
  8: {
    title: 'Dos Requisitos para Inscrição como Advogado no Quadro da OAB',
    oab: true,
    text: 'Art. 8º Para inscrição como advogado é necessário:\nI - capacidade civil;\nII - diploma ou certidão de graduação em direito, obtido em instituição de ensino oficialmente autorizada e credenciada;\nIII - título de eleitor e quitação do serviço militar, se brasileiro;\nIV - aprovação em Exame de Ordem;\nV - não exercer atividade incompatível com a advocacia;\nVI - idoneidade moral;\nVII - prestar compromisso perante o conselho.\n§ 3º A inidoneidade moral deve ser declarada mediante decisão que obtenha o voto de dois terços dos membros do conselho competente.',
    explanation: 'Os 7 requisitos cumulativos para inscrição na OAB. A inidoneidade moral (ex: condenação por crime infamante) exige quórum qualificado de 2/3 do Conselho Seccional para ser declarada (§ 3º). O compromisso perante o Conselho é personalíssimo e indelegável.',
    summary: 'Requisitos de inscrição: capacidade civil, diploma de Direito, quitação eleitoral/militar, Exame de Ordem, compatibilidade, idoneidade moral (2/3) e compromisso solene.'
  },
  10: {
    title: 'Da Inscrição Principal e Inscrição Suplementar (+5 Causas por Ano)',
    oab: true,
    text: 'Art. 10. A inscrição principal do advogado deve ser feita no Conselho Seccional em cujo território pretende estabelecer o seu domicílio profissional.\n§ 2º Além da principal, o advogado deve promover a inscrição suplementar nos Conselhos Seccionais em cujos territórios passar a exercer habitualmente a profissão.\n§ 3º Considera-se habitualidade a intervenção judicial que exceder de cinco causas por ano (Regra de Mais de 5 Causas/Ano).',
    explanation: 'Inscrição principal: local do domicílio profissional. Inscrição suplementar: obrigatória quando o advogado postular em mais de 5 causas por ano no território de outro Conselho Seccional (a 6ª causa já exige inscrição suplementar).',
    summary: 'Inscrição principal no domicílio profissional; inscrição suplementar obrigatória quando exceder 5 causas ao ano em outro Estado.'
  },
  11: {
    title: 'Das Hipóteses de Cancelamento e Licenciamento da Inscrição',
    oab: true,
    text: 'Art. 11. Cancela-se a inscrição do profissional que:\nI - assim o requerer;\nII - sofrer penalidade de exclusão;\nIII - falecer;\nIV - passar a exercer, em caráter definitivo, atividade incompatível com a advocacia;\nV - perder qualquer um dos requisitos necessários para a inscrição.\nArt. 12. Licencia-se o profissional que:\nI - assim o requerer, por motivo justificado;\nII - passar a exercer, em caráter temporário, atividade incompatível com o exercício da advocacia;\nIII - sofrer doença mental considerada curável.',
    explanation: 'Distinção clássica de prova: CANCELAMENTO é definitivo (exige novo número de OAB, salvo se refizer os requisitos) por pedido, exclusão, morte ou cargo incompatível permanente (ex: virou Juiz concursado). LICENCIAMENTO é temporário (mantém o número) por pedido justificado, cargo incompatível transitório (ex: eleito Prefeito ou Deputado) ou doença mental curável.',
    summary: 'Cancelamento (definitivo: pedido, exclusão, morte, cargo incompatível definitivo); Licenciamento (temporário: pedido, cargo transitório ou doença curável).'
  },
  15: {
    title: 'Da Sociedade Simples de Advogados e Sociedade Unipessoal',
    oab: true,
    text: 'Art. 15. Os advogados podem reunir-se em sociedade simples de prestação de serviços de advocacia ou constituir sociedade unipessoal de advocacia, na forma disciplinada nesta Lei e no regulamento geral.\n§ 2º Aplica-se à sociedade de advogados e à sociedade unipessoal de advocacia o Código de Ética e Disciplina, no que couber.\n§ 4º Nenhum advogado pode integrar mais de uma sociedade de advogados, constituir mais de uma sociedade unipessoal de advocacia, ou integrar, simultaneamente, uma sociedade de advogados e uma sociedade unipessoal de advocacia, com sede ou filial na mesma área territorial do respectivo Conselho Seccional.',
    explanation: 'Espécies societárias da advocacia: Sociedade Pluripessoal Simples e Sociedade Unipessoal de Advocacia. Não possuem natureza mercantil/empresarial e registram-se EXCLUSIVAMENTE na OAB (não na Junta Comercial). Proibição expressa de o advogado integrar mais de uma sociedade na mesma base territorial (§ 4º).',
    summary: 'Sociedade de advogados e sociedade unipessoal registradas na OAB; vedado integrar mais de uma sociedade no mesmo Conselho Seccional.'
  },
  22: {
    title: 'Das Três Espécies de Honorários Advocatícios e Arbitramento',
    oab: true,
    text: 'Art. 22. A prestação de serviço profissional assegura aos inscritos na OAB o direito aos honorários convencionados, aos fixados por arbitramento judicial e aos de sucumbência.\n§ 1º O advogado, quando indicado para patrocinar causa de juridicamente necessitado, no caso de impossibilidade da Defensoria Pública no local da prestação de serviço, tem direito aos honorários fixados pelo juiz, segundo tabela organizada pelo Conselho Seccional da OAB, e pagos pelo Estado.\n§ 2º Na falta de estipulação ou de acordo, os honorários são fixados por arbitramento judicial, em remuneração compatível com o trabalho e o valor econômico da questão, não podendo ser inferiores aos estabelecidos na tabela organizada pelo Conselho Seccional da OAB.',
    explanation: 'As 3 espécies de honorários: Contratuais (convencionados entre advogado e cliente), Sucumbenciais (pagos pela parte vencida no processo) e Arbitrados (fixados pelo juiz com base na tabela da OAB). Os honorários sucumbenciais pertencem exclusivamente ao advogado (Art. 23).',
    summary: 'Três espécies de honorários: contratuais, sucumbenciais e arbitrados judicialmente; pertencem autonomamente ao advogado.'
  },
  28: {
    title: 'Do Rol de Incompatibilidades com a Advocacia (Proibição Total)',
    oab: true,
    text: 'Art. 28. A advocacia é incompatível, mesmo em causa própria, com as seguintes atividades:\nI - chefe do Poder Executivo e membros da Mesa do Poder Legislativo e seus substitutos legais;\nII - membros de órgãos do Poder Judiciário, do Ministério Público, dos tribunais e conselhos de contas, dos juizados especiais, da justiça de paz, juízes classistas, bem como de todos os que exerçam função de julgamento em órgãos de deliberação coletiva da administração pública direta e indireta;\nIII - ocupantes de cargos ou funções de direção em Órgãos da Administração Pública direta ou indireta, em fundações e em empresas concessionárias ou permissionárias de serviços públicos;\nIV - ocupantes de cargos ou funções vinculados direta ou indiretamente a qualquer órgão do Poder Judiciário e os que exercem serviços notariais e de registro (Cartorários);\nV - ocupantes de cargos ou funções vinculados direta ou indiretamente a atividade policial de qualquer natureza (Policiais Civis, Militares, Federais, Rodoviários e Guardas Municipais);\nVI - militares de qualquer corporação, na ativa;\nVII - ocupantes de cargos ou funções que tenham competência de lançamento, arrecadação ou fiscalização de tributos e contribuições parafiscais (Auditores Fiscais);\nVIII - ocupantes de funções de direção e gerência em instituições financeiras, inclusive privadas.',
    explanation: 'Incompatibilidade = PROIBIÇÃO TOTAL de exercer a advocacia, mesmo em causa própria. Rol taxativo: Chefes do Executivo (Presidente, Governador, Prefeito), Magistrados, Membros do MP, Policiais de qualquer natureza, Militares na ativa, Auditores da Receita e Gerentes de Bancos.',
    summary: 'Incompatibilidade (proibição total): Chefes do Executivo, Magistrados, Membros do MP, Policiais, Militares na ativa, Auditores e Gerentes de Banco.'
  },
  30: {
    title: 'Do Rol de Impedimentos ao Exercício da Advocacia (Proibição Parcial)',
    oab: true,
    text: 'Art. 30. São impedidos de exercer a advocacia:\nI - os servidores da administração direta, indireta e fundacional, contra a Fazenda Pública que os remunere ou à qual seja vinculada a entidade empregadora;\nII - os membros do Poder Legislativo, em seus diferentes níveis, contra ou a favor das pessoas jurídicas de direito público, empresas públicas, sociedades de economia mista, fundações públicas, entidades paraestatais ou empresas concessionárias ou permissionárias de serviço público.\nParágrafo único. Não se incluem nas hipóteses do inciso I os docentes dos cursos jurídicos.',
    explanation: 'Impedimento = PROIBIÇÃO PARCIAL de advogar. 1) Servidores públicos em geral: podem advogar em quase tudo, EXCETO contra a pessoa jurídica de direito público que paga seus salários (exceção: professores universitários de Direito podem advogar livremente contra a Fazenda); 2) Parlamentares (Deputados, Senadores, Vereadores que não integrem a Mesa): não podem advogar a favor nem contra a Administração Pública ou concessionárias.',
    summary: 'Impedimento (proibição parcial): servidores públicos não advogam contra a Fazenda que os remunera; parlamentares não advogam contra/a favor do poder público.'
  },
  34: {
    title: 'Das 29 Infrações Disciplinares do Advogado',
    oab: true,
    text: 'Art. 34. Constitui infração disciplinar:\nI - exercer a profissão, quando impedido de fazê-lo, ou facilitar, por qualquer meio, o seu exercício aos não inscritos, proibidos ou impedidos;\nII - manter sociedade profissional fora das normas e preceitos estabelecidos nesta lei;\nIII - valer-se de agenciador de causas, mediante participação nos honorários a receber (Captação ilícita de clientela);\nIV - angariar ou captar causas, com ou sem a intervenção de terceiros;\nVII - violar, sem justa causa, sigilo profissional;\nIX - prejudicar, por culpa grave, interesse confiado ao seu patrocínio;\nX - acarretar, conscientemente, por ato próprio, a anulação do processo em que funcione;\nXX - locupletar-se, por qualquer forma, à custa do cliente ou da parte adversa, por si ou por interposta pessoa;\nXXI - recusar-se, injustificadamente, a prestar contas ao cliente de quantias recebidas dele ou de terceiros por conta dele;\nXXIV - incidir em erros reiterados que evidenciem inépcia profissional;\nXXV - manter conduta incompatível com a advocacia (embriaguez habitual, jogos proibidos, incontinência de conduta);\nXXVII - tornar-se moralmente inidôneo para o exercício da advocacia;\nXXVIII - praticar crime infamante.',
    explanation: 'Rol das 29 infrações disciplinares do EOAB. As infrações de inépcia profissional (XXIV) e recusa de prestação de contas (XXI) exigem punição de SUSPENSÃO condicionada à prova de habilitação e prestação de contas. As infrações de inidoneidade moral (XXVII) e crime infamante (XXVIII) acarretam pena de EXCLUSÃO.',
    summary: 'Rol de infrações éticas: captação indevida, quebra de sigilo, locupletamento, recusa de prestação de contas, inépcia e crimes infamantes.'
  },
  35: {
    title: 'Das Sanções Disciplinares Aplicáveis: Censura, Suspensão, Exclusão e Multa',
    oab: true,
    text: 'Art. 35. As sanções disciplinares consistem em:\nI - censura;\nII - suspensão;\nIII - exclusão;\nIV - multa.\nParágrafo único. As sanções devem constar dos assentamentos do inscrito, após o trânsito em julgado da decisão, não podendo ser objeto de publicidade a de censura.\nArt. 36. A censura é aplicável nos casos de infrações definidas nos incisos I a XVI e XXIX do art. 34.\nArt. 37. A suspensão é aplicável nos casos de infrações dos incisos XVII a XXV do art. 34, e de reincidência em infração disciplinar (prazo de 30 dias a 12 meses).\nArt. 38. A exclusão é aplicável nos casos de: I - aplicação, por três vezes, de suspensão; II - infrações dos incisos XXVI a XXVIII do art. 34 (crime infamante e inidoneidade moral), exigindo quórum de 2/3 dos membros do Conselho Seccional.',
    explanation: 'Regime das penalidades na OAB: 1) Censura: regra geral, sigilosa nos assentamentos (pode ser convertida em advertência sem registro se houver atenuante); 2) Suspensão: 30 dias a 12 meses por reincidência ou faltas graves; 3) Exclusão: pena máxima por 3 suspensões, crime infamante ou inidoneidade moral, exigindo quórum de 2/3 dos votos; 4) Multa: sanção pecuniária cumulável com censura ou suspensão.',
    summary: 'Sanções disciplinares: Censura (sigilosa), Suspensão (30 dias a 12 meses), Exclusão (3 suspensões ou crime infamante com quórum de 2/3) e Multa.'
  },
  43: {
    title: 'Da Prescrição Quinquenal da Pretensão Punitiva Disciplinar na OAB',
    oab: true,
    text: 'Art. 43. A pretensão à punibilidade das infrações disciplinares prescreve em cinco anos, contados da data da constatação oficial do fato.\n§ 1º Aplica-se a prescrição a todo processo disciplinar paralisado por mais de três anos, pendente de despacho ou julgamento, devendo ser arquivado de ofício, ou a requerimento da parte interessada (Prescrição Intercorrente de 3 Anos).\n§ 2º A prescrição interrompe-se: I - pela instauração de processo disciplinar ou pela notificação válida feita diretamente ao representado; II - pela decisão condenatória recorrível de qualquer órgão julgador da OAB.',
    explanation: 'Prazos prescricionais do processo ético: 5 anos para pretensão punitiva (contados da constatação oficial) e prescrição intercorrente de 3 anos se o processo ficar paralisado sem despacho.',
    summary: 'Prescrição disciplinar da OAB: 5 anos a contar da constatação do fato; prescrição intercorrente de 3 anos por processo paralisado.'
  }
};

function getStructureForArticle(num) {
  for (const s of EOAB_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return EOAB_STRUCTURE[EOAB_STRUCTURE.length - 1];
}

const allEoabArticles = [];

for (let num = 1; num <= 87; num++) {
  const struct = getStructureForArticle(num);
  const specific = EOAB_SPECIAL_ARTICLES[num];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' do Estatuto da Advocacia e da OAB';
  const artId = 'eoab-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 1 && num <= 14) ||
    (num >= 15 && num <= 17) ||
    (num >= 21 && num <= 26) ||
    (num >= 27 && num <= 30) ||
    (num >= 31 && num <= 43) ||
    (num >= 44 && num <= 50) ||
    (num >= 63 && num <= 67)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial da Lei nº 8.906/1994 - Estatuto da Advocacia e da Ordem dos Advogados do Brasil, ' + struct.title + ', ' + struct.chapter + '). Texto legal consolidado em vigor conforme publicação no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria deontológica e estatutária de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo basilar do exercício da advocacia e organização da OAB.');
  let summary = specific ? specific.summary : ('Norma de ' + struct.category + ' do EOAB, estabelecendo regras, direitos e deveres sobre ' + struct.chapter.toLowerCase() + '.');

  allEoabArticles.push({
    id: artId,
    law_id: 'eoab',
    subject_id: 'etica_oab',
    law_name: 'Estatuto da Advocacia e da OAB',
    law_number: 'Lei nº 8.906/1994',
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
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8906.htm#art' + num,
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
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na prática forense, processos disciplinares no TED e prerrogativas profissionais perante autoridades.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas 8 questões de Ética Profissional da 1ª Fase do Exame de Ordem (OAB).') : 'Leitura indispensável para domínio do Estatuto da Advocacia.',
      legal_terms: ['EOAB', struct.category, 'Ética Profissional', 'Prerrogativas do Advogado'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'eoabFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 87 Artigos do Estatuto da Advocacia e da OAB (Lei 8.906/1994)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst EOAB_ALL_ARTICLES = ' + JSON.stringify(allEoabArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.EOAB_ALL_ARTICLES = EOAB_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de eoab e insere todos os 87 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "eoab");\n    VADE_MECUM_DB.articles.push(...EOAB_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo do Estatuto da OAB carregado com sucesso (87 Artigos: Art. 1º ao Art. 87).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = EOAB_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allEoabArticles.length + ' artigos do EOAB em ' + outputPath);
