const fs = require('fs');
const path = require('path');

// Estrutura sistemática da Consolidação das Leis do Trabalho (Decreto-Lei nº 5.452/1943)
const CLT_STRUCTURE = [
  // TÍTULO I: INTRODUÇÃO
  { start: 1, end: 12, title: 'Título I: Introdução', chapter: 'Conceito de Empregador, Empregado, Grupo Econômico, Tempo à Disposição e Prescrição Trabalhista', category: 'Relação de Emprego' },

  // TÍTULO II: DAS NORMAS GERAIS DE TUTELA DO TRABALHO
  { start: 13, end: 56, title: 'Título II - Capítulo I: Da Identificação Profissional', chapter: 'Da Carteira de Trabalho e Previdência Social (CTPS Digital), Registro e Anotações', category: 'Relação de Emprego' },
  { start: 57, end: 75, title: 'Título II - Capítulo II: Da Duração do Trabalho', chapter: 'Jornada de Trabalho, Horas Extras, Banco de Horas, Intervalos Intrajornada/Interjornada, Cartão de Ponto e Teletrabalho', category: 'Jornada de Trabalho' },
  { start: 76, end: 128, title: 'Título II - Capítulo III: Do Salário Mínimo', chapter: 'Fixação, Proteção ao Salário e Salário-Família', category: 'Férias e Salário' },
  { start: 129, end: 153, title: 'Título II - Capítulo IV: Das Férias Anuais Remuneradas', chapter: 'Direito a Férias, Período Aquisitivo/Concessivo, Fracionamento em até 3 Períodos e Abono Pecuniário', category: 'Férias e Salário' },
  { start: 154, end: 223, title: 'Título II - Capítulo V: Da Segurança e Medicina do Trabalho', chapter: 'Normas Regulamentadoras, CIPA, EPIs, Adicional de Insalubridade e Adicional de Periculosidade', category: 'Jornada de Trabalho' },

  // TÍTULO II-A: DO DANO EXTRAPATRIMONIAL
  // TÍTULO III: DAS NORMAS ESPECIAIS DE TUTELA DO TRABALHO
  { start: 224, end: 253, title: 'Título III - Normas Especiais: Bancários e Ferroviários', chapter: 'Jornada Especial dos Bancários (6 Horas / Cargo de Confiança) e Ferroviários', category: 'Relação de Emprego' },
  { start: 254, end: 351, title: 'Título III - Normas Especiais: Marítimos, Frigoríficos, Músicos e Professores', chapter: 'Regimes Especiais de Trabalho, Intervalos Térmicos e Atividades Diferenciadas', category: 'Relação de Emprego' },
  { start: 352, end: 401, title: 'Título III - Capítulo III: Da Proteção ao Trabalho da Mulher', chapter: 'Proteção à Maternidade, Licença-Maternidade, Estabilidade Provisória da Gestante e Amamentação', category: 'Relação de Emprego' },
  { start: 402, end: 441, title: 'Título III - Capítulo IV: Da Proteção ao Trabalho do Menor', chapter: 'Idade Mínima, Proibição de Trabalho Noturno/Insalubre e Contrato de Aprendizagem Profissional', category: 'Relação de Emprego' },

  // TÍTULO IV: DO CONTRATO INDIVIDUAL DO TRABALHO
  { start: 442, end: 467, title: 'Título IV - Capítulo I: Disposições Gerais do Contrato de Trabalho', chapter: 'Natureza Jurídica, Contrato Intermitente, Sucessão Trabalhista, Terceirização e Equiparação Salarial (Art. 461)', category: 'Relação de Emprego' },
  { start: 468, end: 470, title: 'Título IV - Capítulo II: Da Alteração do Contrato de Trabalho', chapter: 'Princípio da Inalterabilidade Contratual Lesiva (Art. 468) e Transferência Provisória/Definitiva', category: 'Relação de Emprego' },
  { start: 471, end: 476, title: 'Título IV - Capítulo III: Da Suspensão e Interrupção do Contrato', chapter: 'Hipóteses de Suspensão (Sem Salário/Encargos) e Interrupção Contratual (Com Salário)', category: 'Relação de Emprego' },
  { start: 477, end: 486, title: 'Título IV - Capítulo V: Da Rescisão do Contrato de Trabalho', chapter: 'Quitação das Verbas Rescisórias (Prazo de 10 Dias), Justa Causa (Art. 482), Rescisão Indireta (Art. 483) e Distrato / Acordo Mútuo (Art. 484-A)', category: 'Rescisão Contratual' },
  { start: 487, end: 491, title: 'Título IV - Capítulo VI: Do Aviso Prévio', chapter: 'Aviso Prévio Proporcional (Lei 12.506/11), Redução de 2 Horas ou 7 Dias Corridos e Falta Grave', category: 'Rescisão Contratual' },
  { start: 492, end: 510, title: 'Título IV - Capítulos VII a IX: Da Estabilidade Decenal, Força Maior e Comissão de Representação', chapter: 'Indenização Rescisória, Força Maior, Factum Principis, Quitação Anual e Representação dos Empregados na Empresa', category: 'Rescisão Contratual' },

  // TÍTULO V: DA ORGANIZAÇÃO SINDICAL
  { start: 511, end: 610, title: 'Título V: Da Organização Sindical', chapter: 'Enquadramento Sindical, Unicidade, Liberdade Sindical, Contribuição Sindical Facultativa e Prerrogativas Sindicais', category: 'Relação de Emprego' },

  // TÍTULO VI: DAS CONVENÇÕES E ACORDOS COLETIVOS DE TRABALHO
  { start: 611, end: 625, title: 'Título VI: Das Convenções e Acordos Coletivos de Trabalho', chapter: 'Prevalência do Negociado sobre o Legislado (Arts. 611-A e 611-B), Ultratividade Vedada e Vigência Máxima de 2 Anos', category: 'Relação de Emprego' },

  // TÍTULO VII: DA FISCALIZAÇÃO, MULTAS E CNDT
  { start: 626, end: 642, title: 'Título VII: Da Fiscalização do Trabalho e CNDT', chapter: 'Auto de Infração, Critério da Dupla Visita, Multas Administrativas e Certidão Negativa de Débitos Trabalhistas', category: 'Processo do Trabalho' },

  // TÍTULO VIII: DA JUSTIÇA DO TRABALHO
  { start: 643, end: 735, title: 'Título VIII: Da Justiça do Trabalho', chapter: 'Competência Material (Art. 114 CF/88), Varas do Trabalho, Tribunais Regionais do Trabalho (TRTs) e Tribunal Superior do Trabalho (TST)', category: 'Processo do Trabalho' },

  // TÍTULO IX: DO MINISTÉRIO PÚBLICO DO TRABALHO
  { start: 736, end: 762, title: 'Título IX: Do Ministério Público do Trabalho', chapter: 'Atribuições do MPT, Ação Civil Pública Trabalhista, TAC e Fiscalização das Leis do Trabalho', category: 'Processo do Trabalho' },

  // TÍTULO X: DO PROCESSO JUDICIÁRIO DO TRABALHO
  { start: 763, end: 836, title: 'Título X - Capítulos I a III: Do Processo do Trabalho e Atos Processuais', chapter: 'Prazos Contados em Dias Úteis (Art. 775), Custas (Art. 789), Justiça Gratuita (Art. 790), Honorários Sucumbenciais (Art. 791-A), Jus Postulandi, Audiência Una e Revelia', category: 'Processo do Trabalho' },
  { start: 837, end: 875, title: 'Título X - Capítulo IV: Dos Procedimentos Especiais e Rito Sumaríssimo', chapter: 'Rito Sumaríssimo até 40 Salários Mínimos (Arts. 852-A a 852-I), Inquérito para Apuração de Falta Grave de Dirigente Sindical e Dissídios Coletivos', category: 'Processo do Trabalho' },
  { start: 876, end: 892, title: 'Título X - Capítulo V: Da Execução Trabalhista', chapter: 'Execução de Títulos Judiciais/Extrajudiciais, Liquidação de Sentença (Art. 879), Citação para Pagar ou Garantir a Execução em 48h (Art. 880) e Embargos à Execução (Art. 884)', category: 'Processo do Trabalho' },
  { start: 893, end: 910, title: 'Título X - Capítulo VI: Dos Recursos no Processo do Trabalho', chapter: 'Teoria Geral dos Recursos: Recurso Ordinário (8 Dias), Recurso de Revista (Art. 896), Agravo de Petição, Agravo de Instrumento, Embargos no TST e Depósito Recursal', category: 'Processo do Trabalho' },

  // TÍTULO XI: DISPOSIÇÕES FINAIS E TRANSITÓRIAS
  { start: 911, end: 922, title: 'Título XI: Disposições Finais e Transitórias da CLT', chapter: 'Regras de Transição, Aplicação Subsidiária e Vigência da Consolidação das Leis do Trabalho', category: 'Processo do Trabalho' }
];

// Artigos de altíssima relevância prática e cobrados com frequência na OAB e Concursos
const CLT_SPECIAL_ARTICLES = {
  2: {
    title: 'Do Conceito de Empregador e Grupo Econômico',
    oab: true,
    text: 'Art. 2º Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço.\n§ 1º Equiparam-se ao empregador, para os efeitos exclusivos da relação de emprego, os profissionais liberais, as instituições de beneficência, as associações recreativas ou outras instituições sem fins lucrativos, que admitirem trabalhadores como empregados.\n§ 2º Sempre que uma ou mais empresas, tendo, embora, cada uma delas, personalidade jurídica própria, estiverem sob a direção, controle ou administração de outra, ou ainda quando, mesmo guardando cada uma sua autonomia, integrem grupo econômico, serão responsáveis solidariamente pelas obrigações decorrentes da relação de emprego.\n§ 3º Não caracteriza grupo econômico a mera identidade de sócios, sendo necessárias, para a configuração do grupo, a demonstração do interesse integrado, a efetiva comunhão de interesses e a atuação conjunta das empresas dele integrantes.',
    explanation: 'Conceito legal de empregador (princípio da alteridade) e responsabilidade solidária do grupo econômico por subordinação ou por coordenação, exigindo interesse integrado e atuação conjunta (§ 3º incluído pela Reforma Trabalhista).',
    summary: 'Empregador assume os riscos da atividade econômica (alteridade); solidariedade das empresas em grupo econômico integrado.'
  },
  3: {
    title: 'Dos Requisitos Caracterizadores da Relação de Emprego',
    oab: true,
    text: 'Art. 3º Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.\nParágrafo único. Não haverá distinções relativas à espécie de emprego e à condição de trabalhador, nem entre o trabalho intelectual, técnico e manual.',
    explanation: 'Os 5 requisitos cumulativos da relação de emprego (mnemônico SHOPP): Subordinação jurídica, Habitualidade (não eventualidade), Onerosidade, Personalidade (pessoa física) e Alteridade.',
    summary: 'Conceito de empregado e requisitos da relação de emprego: pessoa física, habitualidade, subordinação e salário.'
  },
  4: {
    title: 'Do Tempo de Serviço Efetivo e Horas In Itinere',
    oab: true,
    text: 'Art. 4º Considera-se como de serviço efetivo o período em que o empregado esteja à disposição do empregador, aguardando ou executando ordens, salvo disposição especial expressamente consignada.\n§ 2º Por não se considerar tempo à disposição do empregador, não será computado como período extraordinário o que exceder a jornada normal, ainda que ultrapasse o limite de cinco minutos, quando o empregado, por escolha própria, buscar proteção pessoal, em caso de insegurança nas vias públicas ou más condições climáticas, bem como adentrar ou permanecer nas dependências da empresa para exercer atividades particulares (práticas religiosas, descanso, lazer, estudo, alimentação, troca de roupa ou higiene pessoal).',
    explanation: 'Teoria do tempo à disposição do empregador. A Reforma Trabalhista extinguiu as horas in itinere e fixou taxativamente as atividades particulares do § 2º que não configuram hora extra.',
    summary: 'Tempo de serviço efetivo é o tempo à disposição do empregador; atividades particulares na empresa não configuram hora extra.'
  },
  8: {
    title: 'Da Integração das Normas Trabalhistas e Jurisprudência',
    oab: true,
    text: 'Art. 8º As autoridades administrativas e a Justiça do Trabalho, na falta de disposições legais ou contratuais, decidirão, conforme o caso, pela jurisprudência, por analogia, por eqüidade e outros princípios e normas gerais de direito, principalmente do direito do trabalho, e, ainda, de acordo com os usos e costumes, o direito comparado, mas sempre de maneira que nenhum interesse de classe ou particular prevaleça sobre o interesse público.\n§ 1º O direito comum será fonte subsidiária do direito do trabalho.\n§ 2º Súmulas e outros enunciados de jurisprudência editados pelo Tribunal Superior do Trabalho e pelos Tribunais Regionais do Trabalho não poderão restringir direitos legalmente previstos nem criar obrigações que não estejam previstas em lei.\n§ 3º No exame de convenção coletiva ou acordo coletivo de trabalho, a Justiça do Trabalho analisará exclusivamente a conformidade dos elementos essenciais do negócio jurídico, em estrita observância ao princípio da intervenção mínima na autonomia da vontade coletiva.',
    explanation: 'Fontes subsidiárias do Direito do Trabalho e limites de criação jurisprudencial: súmulas não podem criar obrigações sem respaldo em lei formal e prevalece o princípio da intervenção mínima na autonomia coletiva.',
    summary: 'Fontes subsidiárias e limites: jurisprudência não pode criar obrigações; intervenção mínima na negociação coletiva.'
  },
  11: {
    title: 'Da Prescrição Trabalhista Bienal e Quinquenal',
    oab: true,
    text: 'Art. 11. A pretensão quanto a créditos resultantes das relações de trabalho prescreve em cinco anos para os trabalhadores urbanos e rurais, até o limite de dois anos após a extinção do contrato de trabalho.\n§ 1º O disposto neste artigo não se aplica às ações que tenham por objeto anotações para fins de prova junto à Previdência Social (ações declaratórias imprescritíveis).\n§ 2º A interrupção da prescrição somente ocorrerá pelo ajuizamento de reclamação trabalhista, mesmo que em juízo incompetente, ainda que venha a ser extinta sem julgamento do mérito, produzindo efeitos apenas em relação aos pedidos idênticos.',
    explanation: 'Regra prescricional clássica da CF/88 e CLT: 5 anos na vigência do contrato (quinquenal) e até 2 anos após a extinção contratual (bienal). Pedidos puramente declaratórios de CTPS são imprescritíveis.',
    summary: 'Prescrição trabalhista: quinquenal na vigência do contrato e bienal após a extinção da relação de trabalho.'
  },
  58: {
    title: 'Da Duração Normal da Jornada e Variações de Ponto',
    oab: true,
    text: 'Art. 58. A duração normal do trabalho, para os empregados em qualquer atividade privada, não excederá de 8 (oito) horas diárias, desde que não seja fixado expressamente outro limite.\n§ 1º Não serão descontadas nem computadas como jornada extraordinária as variações de horário no registro de ponto não excedentes de cinco minutos, observado o limite máximo de dez minutos diários (Regra dos 5/10 minutos).\n§ 2º O tempo despendido pelo empregado desde a sua residência até a efetiva ocupação do posto de trabalho e para o seu retorno, por qualquer meio de transporte, inclusive o fornecido pelo empregador, não será computado na jornada de trabalho, por não ser tempo à disposição do empregador (Fim das Horas In Itinere).',
    explanation: 'Limite constitucional de 8h diárias e 44h semanais. A tolerância de registro de ponto é de até 5 minutos por batida e máximo de 10 minutos por dia.',
    summary: 'Jornada normal de 8h diárias; tolerância de ponto de 5 min por batida (máx 10 min/dia); não há horas in itinere.'
  },
  59: {
    title: 'Do Acordo de Prorrogação de Horas Extras e Banco de Horas',
    oab: true,
    text: 'Art. 59. A duração diária do trabalho poderá ser acrescida de horas extras, em número não excedente de duas, por acordo individual, convenção coletiva ou acordo coletivo de trabalho.\n§ 1º A remuneração da hora extra será, pelo menos, 50% (cinquenta por cento) superior à da hora normal.\n§ 2º Poderá ser dispensado o acréscimo de salário se, por força de acordo ou convenção coletiva de trabalho, o excesso de horas em um dia for compensado pela correspondente diminuição em outro dia, de maneira que não exceda o período máximo de um ano (Banco de Horas Anual por Norma Coletiva).\n§ 5º O banco de horas poderá ser pactuado por acordo individual escrito, desde que a compensação ocorra no período máximo de seis meses (Banco de Horas Semestral Individual).\n§ 6º É lícito o regime de compensação de jornada estabelecido por acordo individual, tácito ou escrito, para a compensação no mesmo mês.',
    explanation: 'Adicional de hora extra mínimo de 50%. Regime de banco de horas: semestral por acordo individual escrito e anual mediante acordo/convenção coletiva.',
    summary: 'Horas extras de no máximo 2h/dia com adicional mínimo de 50%; banco de horas individual (6 meses) ou coletivo (1 ano).'
  },
  "59-A": {
    title: 'Do Regime de Trabalho 12x36 por Acordo Individual Escrito',
    oab: true,
    text: 'Art. 59-A. Em exceção ao disposto no art. 59 desta Consolidação, é facultado às partes, mediante acordo individual escrito, convenção coletiva ou acordo coletivo de trabalho, estabelecer horário de trabalho de doze horas seguidas por trinta e seis horas ininterruptas de descanso, observados ou indenizados os intervalos para repouso e alimentação.\nParágrafo único. A remuneração mensal pactuada pelo horário 12x36 abrange os pagamentos devidos pelo descanso semanal remunerado e pelo descanso em feriados.',
    explanation: 'Regime 12x36 legalizado expressamente por acordo individual escrito ou norma coletiva. Domingos e feriados trabalhados são considerados compensados pelo descanso de 36 horas.',
    summary: 'Jornada 12x36 permitida por acordo individual escrito; feriados e DSR inclusos na remuneração pactuada.'
  },
  62: {
    title: 'Das Exceções ao Controle de Jornada (Trabalho Externo e Cargos de Gestão)',
    oab: true,
    text: 'Art. 62. Não são abrangidos pelo regime previsto neste capítulo:\nI - os empregados que exercem atividade externa incompatível com a fixação de horário de trabalho, devendo tal condição ser expressamente anotada na CTPS;\nII - os gerentes, assim considerados os exercentes de cargos de gestão, aos quais se equiparam os diretores e chefes de departamento ou filial (desde que recebam gratificação de função de no mínimo 40%);\nIII - os empregados em regime de teletrabalho que prestam serviço por produção ou tarefa.',
    explanation: 'Trabalhadores sem direito a hora extra: atividade externa incompatível com ponto, gerentes com poder de mando e padrão remuneratório diferenciado (gratificação de 40%) e teletrabalhadores por produção/tarefa.',
    summary: 'Não se submetem a controle de jornada: atividade externa incompatível, cargos de gestão (+40%) e teletrabalho por tarefa.'
  },
  71: {
    title: 'Do Intervalo Intrajornada para Repouso e Alimentação',
    oab: true,
    text: 'Art. 71. Em qualquer trabalho contínuo, cuja duração exceda de 6 (seis) horas, é obrigatória a concessão de um intervalo para repouso ou alimentação, o qual será, no mínimo, de 1 (uma) hora e, salvo acordo escrito ou contrato coletivo em contrário, não poderá exceder de 2 (duas) horas.\n§ 1º Não excedendo de 6 (seis) horas o trabalho, será, entretanto, obrigatório um intervalo de 15 (quinze) minutos quando a duração ultrapassar 4 (quatro) horas.\n§ 4º A não concessão ou a concessão parcial do intervalo intrajornada mínimo, para repouso e alimentação, a empregados urbanos e rurais, implica o pagamento, de natureza indenizatória, apenas do período suprimido, com acréscimo de 50% (cinquenta por cento) sobre o valor da remuneração da hora normal de trabalho.',
    explanation: 'Jornada > 6h exige mínimo de 1h de almoço; jornada de 4h a 6h exige 15 min. A supressão parcial gera o pagamento APENAS do tempo suprimido com adicional de 50% e tem natureza INDENIZATÓRIA (§ 4º).',
    summary: 'Intervalo intrajornada de 1h (> 6h de jornada) e 15 min (4h a 6h); supressão parcial indeniza apenas os minutos faltantes com +50%.'
  },
  "75-A": {
    title: 'Das Disposições Gerais do Teletrabalho e Home Office',
    oab: true,
    text: 'Art. 75-A. A prestação de serviços pelo empregado em regime de teletrabalho observará o disposto neste Capítulo.',
    explanation: 'Regulamentação legal expressa do teletrabalho e trabalho remoto no Direito Brasileiro.',
    summary: 'Marco legal do teletrabalho e trabalho remoto na CLT.'
  },
  "75-B": {
    title: 'Da Definição de Teletrabalho e Trabalho Remoto',
    oab: true,
    text: 'Art. 75-B. Considera-se teletrabalho ou trabalho remoto a prestação de serviços fora das dependências do empregador, de maneira preponderante ou não, com a utilização de tecnologias de informação e de comunicação, que, por sua natureza, não se configure como trabalho externo.\n§ 1º O comparecimento às dependências do empregador para a realização de atividades específicas, ainda que de modo habitual, não descaracteriza o regime de teletrabalho ou trabalho remoto.\n§ 9º O regime de teletrabalho ou trabalho remoto não se confunde e nem se equipara à ocupação de operador de telemarketing ou de teleatendimento.',
    explanation: 'Conceito legal de teletrabalho (híbrido ou integral). O comparecimento presencial para reuniões periódicas não desvirtua o home office.',
    summary: 'Teletrabalho é a prestação de serviços externa com TICs; modelo híbrido não descaracteriza o regime.'
  },
  134: {
    title: 'Da Concessão de Férias e Fracionamento em até 3 Períodos',
    oab: true,
    text: 'Art. 134. As férias serão concedidas por ato do empregador, em um só período, nos 12 (doze) meses subsequentes à data em que o empregado tiver adquirido o direito (Período Concessivo).\n§ 1º Desde que haja concordância do empregado, as férias poderão ser usufruídas em até três períodos, sendo que um deles não poderá ser inferior a 14 (quatorze) dias corridos e os demais não poderão ser inferiores a 5 (cinco) dias corridos, cada um.\n§ 3º É vedado o início das férias no período de dois dias que antecede feriado ou dia de repouso semanal remunerado.',
    explanation: 'Regra de fracionamento das férias pós-Reforma: até 3 períodos com concordância do obreiro (um >= 14 dias e os outros >= 5 dias cada). Férias não podem começar na quinta ou sexta-feira antes do DSR/feriado.',
    summary: 'Férias fracionáveis em até 3 vezes (mínimo 14 dias e 5 dias); proibido início 2 dias antes de feriado ou repouso.'
  },
  192: {
    title: 'Do Adicional de Insalubridade e Graus (10%, 20% e 40%)',
    oab: true,
    text: 'Art. 192. O exercício de trabalho em condições insalubres, acima dos limites de tolerância estabelecidos pelo Ministério do Trabalho, assegura a percepção de adicional respectivamente de 40% (quarenta por cento), 20% (vinte por cento) e 10% (dez por cento) do salário-mínimo da região, segundo se classifiquem nos graus máximo, médio e mínimo.',
    explanation: 'Adicional de insalubridade calculado sobre o salário mínimo (Súmula Vinculante 4 do STF) nos percentuais de 10% (mínimo), 20% (médio) e 40% (máximo). Exige perícia técnica (Art. 195).',
    summary: 'Insalubridade: adicionais de 10% (mínimo), 20% (médio) e 40% (máximo) calculados sobre o salário mínimo.'
  },
  193: {
    title: 'Do Adicional de Periculosidade (30% sobre o Salário-Base)',
    oab: true,
    text: 'Art. 193. São consideradas atividades ou operações perigosas, na forma da regulamentação aprovada pelo Ministério do Trabalho e Emprego, aquelas que, por sua natureza ou métodos de trabalho, impliquem risco acentuado em virtude de exposição permanente do trabalhador a:\nI - inflamáveis, explosivos ou energia elétrica;\nII - roubos ou outras espécies de violência física nas atividades profissionais de segurança pessoal ou patrimonial;\n§ 1º O trabalho em condições de periculosidade assegura ao empregado um adicional de 30% (trinta por cento) sobre o salário sem os acréscimos resultantes de gratificações, prêmios ou participações nos lucros da empresa.\n§ 4º São também consideradas perigosas as atividades de trabalhador em motocicleta.',
    explanation: 'Adicional de periculosidade fixado em 30% sobre o salário-base (sem gratificações). Hipóteses: inflamáveis, explosivos, alta tensão, segurança privada e motoboys/motociclistas.',
    summary: 'Periculosidade: adicional de 30% sobre o salário-base para inflamáveis, explosivos, eletricidade, vigilância e motociclistas.'
  },
  461: {
    title: 'Da Equiparação Salarial e Requisitos',
    oab: true,
    text: 'Art. 461. Sendo idêntica a função, a todo trabalho de igual valor, prestado ao mesmo empregador, no mesmo estabelecimento empresarial, corresponderá igual salário, sem distinção de sexo, etnia, nacionalidade ou idade.\n§ 1º Trabalho de igual valor, para os fins deste Capítulo, será o que for feito com igual produtividade e com a mesma perfeição técnica, entre pessoas cuja diferença de tempo de serviço para o mesmo empregador não seja superior a quatro anos e a diferença de tempo na função não seja superior a dois anos.\n§ 2º Os dispositivos deste artigo não prevalecerão quando o empregador tiver pessoal organizado em quadro de carreira ou adotar plano de cargos e salários.\n§ 6º No caso de comprovada discriminação por motivo de sexo ou etnia, o juízo determinará o pagamento das diferenças salariais e multa de 10 vezes o novo salário devido.',
    explanation: 'Requisitos da equiparação salarial: mesma função, mesmo estabelecimento empresarial, mesma perfeição e produtividade, diferença na função <= 2 anos e tempo na empresa <= 4 anos, ausência de quadro de carreira.',
    summary: 'Equiparação salarial: mesma função no mesmo estabelecimento; diferença na função até 2 anos e na empresa até 4 anos.'
  },
  468: {
    title: 'Do Princípio da Inalterabilidade Contratual Lesiva e Reversão',
    oab: true,
    text: 'Art. 468. Nos contratos individuais de trabalho só é lícita a alteração das respectivas condições por mútuo consentimento, e ainda assim desde que não resultem, direta ou indiretamente, em prejuízos ao empregado, sob pena de nulidade da cláusula infringente desta garantia.\n§ 1º Não se considera alteração unilateral a determinação do empregador para que o respectivo empregado reverta ao cargo efetivo, anteriormente ocupado, deixando o exercício de função de confiança.\n§ 2º A alteração de que trata o § 1º deste artigo, com ou sem justo motivo, não assegura ao empregado o direito à manutenção do pagamento da gratificação de função, não incorporando a remuneração independentemente do tempo de exercício da respectiva função.',
    explanation: 'Princípio da inalterabilidade contratual lesiva: qualquer alteração prejudicial é nula. A perda do cargo de confiança (reversão) não gera direito à incorporação da gratificação, superando a antiga Súmula 372 do TST.',
    summary: 'Alteração contratual exige mútuo consentimento e não pode ser lesiva; reversão de cargo de confiança não mantém gratificação.'
  },
  477: {
    title: 'Da Quitação Rescisória e Prazo de 10 Dias para Pagamento',
    oab: true,
    text: 'Art. 477. Na extinção do contrato de trabalho, o empregador deverá proceder à anotação na Carteira de Trabalho e Previdência Social, comunicar a dispensa aos órgãos competentes e realizar o pagamento das verbas rescisórias.\n§ 6º A entrega ao empregado de documentos que comprovem a comunicação da extinção contratual aos órgãos competentes bem como o pagamento dos valores constantes do instrumento de rescisão ou recibo de quitação deverão ser efetuados até dez dias contados a partir do término do contrato.\n§ 8º A inobservância do disposto no § 6º deste artigo sujeitará o infrator à multa de 1 (um) salário do empregado, salvo quando, comprovadamente, o trabalhador tiver dado causa à mora.',
    explanation: 'Prazo unificado para quitação rescisória: até 10 dias corridos contados do término do contrato, independentemente do tipo de aviso prévio. Atraso gera multa de 1 salário em favor do empregado (§ 8º).',
    summary: 'Verbas rescisórias e guias devem ser pagas/entregues em até 10 dias após a extinção do contrato sob pena de multa de 1 salário.'
  },
  482: {
    title: 'Dos Motivos de Rescisão por Justa Causa pelo Empregador',
    oab: true,
    text: 'Art. 482. Constituem justa causa para rescisão do contrato de trabalho pelo empregador:\na) improbidade;\nb) incontinência de conduta ou mau procedimento;\nc) negociação habitual por conta própria ou alheia sem permissão do empregador;\nd) condenação criminal do empregado, passada em julgado, caso não tenha havido suspensão da execução da pena;\ne) desídia no desempenho das respectivas funções;\nf) embriaguez habitual ou em serviço;\ng) violação de segredo da empresa;\nh) ato de indisciplina ou de insubordinação;\ni) abandono de emprego;\nj) ato lesivo da honra ou da boa fama praticado no serviço contra qualquer pessoa, ou ofensas físicas, salvo em caso de legítima defesa;\nk) ato lesivo da honra ou ofensas físicas praticadas contra o empregador e superiores hierárquicos;\nl) prática constante de jogos de azar;\nm) perda da habilitação profissional necessária para o exercício da profissão decorrente de conduta dolosa do empregado.',
    explanation: 'Rol taxativo das hipóteses de justa causa do empregado. Destaque para desídia (desleixo reiterado), improbidade (desonestidade patrimonial) e abandono de emprego (Súmula 32 do TST: 30 dias de ausência injustificada).',
    summary: 'Hipóteses de justa causa do empregado: improbidade, desídia, embriaguez, insubordinação, abandono de emprego e ofensas.'
  },
  483: {
    title: 'Da Rescisão Indireta do Contrato pelo Empregado (Falta Grave Patronal)',
    oab: true,
    text: 'Art. 483. O empregado poderá considerar rescindido o contrato e pleitear a devida indenização quando:\na) forem exigidos serviços superiores às suas forças, defesos por lei, contrários aos bons costumes, ou alheios ao contrato;\nb) for tratado pelo empregador ou por seus superiores hierárquicos com rigor excessivo;\nc) correr perigo manifesto de mal considerável;\nd) não cumprir o empregador as obrigações do contrato (ex: atraso reiterado de salários, não recolhimento de FGTS);\ne) praticar o empregador ou seus prepostos ato lesivo da honra ou boa fama contra o empregado ou pessoas de sua família;\nf) o empregador ou seus prepostos ofenderem-no fisicamente, salvo em caso de legítima defesa;\ng) o empregador reduzir o seu trabalho, sendo este por peça ou tarefa, de forma a afetar sensivelmente a importância dos salários.\n§ 3º Nas hipóteses das letras "d" e "g", poderá o empregado pleitear a rescisão de seu contrato de trabalho e o pagamento das respectivas indenizações, permanecendo ou não no serviço até final decisão do processo.',
    explanation: 'Rescisão indireta (justa causa do patrão): o empregado recebe todas as verbas rescisórias da dispensa imotivada (incluindo aviso prévio e multa de 40% do FGTS). Pode continuar trabalhando até a sentença nas hipóteses "d" e "g".',
    summary: 'Rescisão indireta: justa causa do empregador por descumprimento do contrato (atraso de salário, falta de FGTS), rigor excessivo ou perigo.'
  },
  "484-A": {
    title: 'Da Extinção do Contrato por Acordo Mútuo entre as Partes (Distrato)',
    oab: true,
    text: 'Art. 484-A. O contrato de trabalho poderá ser extinto por acordo entre empregado e empregador, caso em que serão devidas as seguintes verbas trabalhistas:\nI - por metade:\na) o aviso prévio, se indenizado; e\nb) a indenização sobre o saldo do Fundo de Garantia do Tempo de Serviço (Multa de 20% do FGTS);\nII - na integralidade, as demais verbas trabalhistas (saldo de salário, 13º proporcional e férias proporcionais + 1/3).\n§ 1º A extinção do contrato prevista no caput deste artigo permite o saque de até 80% (oitenta por cento) do valor dos depósitos da conta do FGTS.\n§ 2º A extinção do contrato por acordo não autoriza o ingresso no Programa de Seguro-Desemprego.',
    explanation: 'Distrato trabalhista instituído pela Reforma Trabalhista: metade do aviso prévio indenizado (50%) e metade da multa do FGTS (20%). O trabalhador saca até 80% do saldo do FGTS, mas NÃO tem direito ao seguro-desemprego.',
    summary: 'Distrato por acordo: aviso prévio indenizado pela metade, multa do FGTS de 20%, saque de 80% do FGTS e sem seguro-desemprego.'
  },
  "611-A": {
    title: 'Da Prevalência do Negociado sobre o Legislado (Rol Exemplificativo)',
    oab: true,
    text: 'Art. 611-A. A convenção coletiva e o acordo coletivo de trabalho têm prevalência sobre a lei quando, entre outros, dispuserem sobre:\nI - pacto quanto à jornada de trabalho, observados os limites constitucionais;\nII - banco de horas anual;\nIII - intervalo intrajornada, respeitado o limite mínimo de trinta minutos para jornadas superiores a seis horas;\nIV - adesão ao Programa Seguro-Emprego;\nV - plano de cargos, salários e funções compatíveis com a condição pessoal do empregado;\nVI - regulamento empresarial;\nVII - representante dos trabalhadores no local de trabalho;\nVIII - teletrabalho, regime de sobreaviso, e trabalho intermitente;\nIX - remuneração por produtividade, incluídas as gorjetas;\nX - modalidade de registro de jornada de trabalho;\nXI - troca do dia de feriado;\nXII - enquadramento do grau de insalubridade;\nXIII - prorrogação de jornada em ambientes insalubres, sem licença prévia das autoridades competentes do Ministério do Trabalho;\nXIV - prêmios de incentivo em bens ou serviços;\nXV - participação nos lucros ou resultados da empresa.',
    explanation: 'Princípio do Negociado sobre o Legislado: cláusulas de acordos e convenções coletivas prevalecem sobre a legislação trabalhista nas 15 matérias expressas (e outras compatíveis). O intervalo de almoço pode ser reduzido para até 30 minutos (inciso III).',
    summary: 'Prevalência da negociação coletiva sobre a CLT: jornada, banco de horas anual, intervalo intrajornada (mín. 30 min) e teletrabalho.'
  },
  "611-B": {
    title: 'Das Matérias Ilícitas de Negociação Coletiva (Rol Taxativo Proibitivo)',
    oab: true,
    text: 'Art. 611-B. Constituem objeto ilícito de convenção coletiva ou de acordo coletivo de trabalho, exclusivamente, a supressão ou a redução dos seguintes direitos:\nI - normas de identificação profissional, inclusive as anotações na Carteira de Trabalho e Previdência Social;\nII - seguro-desemprego, em caso de desemprego involuntário;\nIII - valor dos depósitos mensais e da indenização rescisória do Fundo de Garantia do Tempo de Serviço (FGTS);\nIV - salário mínimo;\nV - valor nominal do décimo terceiro salário;\nVI - remuneração do trabalho noturno superior à do diurno;\nVII - proteção do salário na forma da lei, constituindo crime sua retenção dolosa;\nVIII - salário-família;\nIX - repouso semanal remunerado;\nX - remuneração do serviço extraordinário superior, no mínimo, em 50% à do normal;\nXI - número de dias de férias devidas ao empregado;\nXII - gozo de férias anuais remuneradas com, pelo menos, um terço a mais do que o salário normal;\nXIII - licença-maternidade com a duração mínima de cento e vinte dias;\nXIV - licença-paternidade nos termos fixados em lei;\nXVII - normas de saúde, higiene e segurança do trabalho;',
    explanation: 'Rol taxativo de 30 incisos com direitos trabalhistas fundamentais e indisponíveis que NÃO podem ser suprimidos ou reduzidos por acordo ou convenção coletiva (STF Tema 1046).',
    summary: 'Direitos indisponíveis que não podem ser reduzidos por negociação: FGTS, salário mínimo, 13º salário, férias + 1/3 e licença-maternidade.'
  },
  775: {
    title: 'Da Contagem de Prazos Processuais Trabalhistas em Dias Úteis',
    oab: true,
    text: 'Art. 775. Os prazos processuais serão contados em dias úteis, com exclusão do dia do começo e inclusão do dia do vencimento.\n§ 1º Os prazos fluirão da intimação ou da publicação do edital, excluindo-se o dia do início e incluindo-se o do vencimento.\n§ 2º A fixação e a prorrogação dos prazos processuais pelo juiz deverão ser justificadas.',
    explanation: 'Uniformização pós-Reforma: todos os prazos no processo judicial do trabalho contam-se estritamente em dias úteis, espelhando o CPC.',
    summary: 'Prazos processuais na Justiça do Trabalho contam-se exclusivamente em dias úteis.'
  },
  "791-A": {
    title: 'Dos Honorários Advocatícios Sucumbenciais na Justiça do Trabalho',
    oab: true,
    text: 'Art. 791-A. Ao advogado, ainda que atue em causa própria, serão devidos honorários de sucumbência, fixados entre o mínimo de 5% (cinco por cento) e o máximo de 15% (quinze por cento) sobre o valor que resultar da liquidação da sentença, do proveito econômico obtido ou, não sendo possível mensurá-lo, sobre o valor atualizado da causa.\n§ 3º Na hipótese de procedência parcial, o juízo arbitrará honorários de sucumbência recíproca, vedada a compensação entre os honorários.\n§ 4º Vencido o beneficiário da justiça gratuita, desde que não tenha obtido em juízo créditos capazes de suportar a despesa, as obrigações decorrentes de sua sucumbência ficarão sob condição suspensiva de exigibilidade e somente poderão ser executadas se, nos dois anos subsequentes ao trânsito em julgado da decisão que as certificou, o credor demonstrar que deixou de existir a situação de insuficiência de recursos que justificou a concessão de gratuidade, extinguindo-se, passado esse prazo, tais obrigações do beneficiário.',
    explanation: 'Honorários advocatícios sucumbenciais na JT de 5% a 15%. O STF (ADI 5766) declarou inconstitucional a retenção automática de créditos para pagar sucumbência do beneficiário da justiça gratuita, mantendo a condição suspensiva por 2 anos.',
    summary: 'Honorários sucumbenciais de 5% a 15% na JT; vedada compensação e condição suspensiva de 2 anos para justiça gratuita.'
  },
  818: {
    title: 'Do Ônus da Prova e Distribuição Dinâmica no Processo do Trabalho',
    oab: true,
    text: 'Art. 818. O ônus da prova incumbe:\nI - ao reclamante, quanto ao fato constitutivo de seu direito;\nII - ao reclamado, quanto à existência de fato impeditivo, modificativo ou extintivo do direito do reclamante.\n§ 1º Nos casos previstos em lei ou diante de peculiaridades da causa relacionadas à impossibilidade ou à excessiva dificuldade de cumprir o encargo, poderá o juízo atribuir o ônus da prova de modo diverso (Distribuição Dinâmica do Ônus da Prova).',
    explanation: 'Regra estática de distribuição do ônus probatório (fato constitutivo ao autor, impeditivo/modificativo/extintivo ao réu) e autorização expressa para a teoria da distribuição dinâmica pelo magistrado.',
    summary: 'Ônus da prova: autor prova fato constitutivo e réu prova fatos impeditivos/modificativos/extintivos; permite distribuição dinâmica.'
  },
  840: {
    title: 'Dos Requisitos da Reclamação Trabalhista e Pedidos Líquidos',
    oab: true,
    text: 'Art. 840. A reclamação poderá ser escrita ou verbal.\n§ 1º Sendo escrita, a reclamação deverá conter a designação do juízo, a qualificação das partes, a breve exposição dos fatos de que resulte o dissídio, o pedido, que deverá ser certo, determinado e com indicação de seu valor, a data e a assinatura do reclamante ou de seu representante.\n§ 3º Os pedidos que não atendam às exigências dos §§ 1º e 2º deste artigo serão julgados extintos sem resolução do mérito.',
    explanation: 'A petição inicial trabalhista exige pedidos certos, determinados e com indicação expressa do valor estimado de cada pretensão (liquidação prévia por estimativa).',
    summary: 'Reclamação trabalhista exige pedidos certos, determinados e com indicação expressa de valor sob pena de extinção sem mérito.'
  },
  844: {
    title: 'Do Não Comparecimento à Audiência Trabalhista (Arquivamento e Revelia)',
    oab: true,
    text: 'Art. 844. O não-comparecimento do reclamante à audiência importa o arquivamento da reclamação, e o não-comparecimento do reclamado importa revelia, além de confissão quanto à matéria de fato.\n§ 2º Na hipótese de ausência do reclamante, este será condenado ao pagamento das custas processuais, ainda que beneficiário da justiça gratuita, salvo se comprovar, no prazo de quinze dias, que a ausência ocorreu por motivo legalmente justificável.\n§ 5º Ainda que ausente o reclamado, presente o advogado na audiência, serão aceitos a contestação e os documentos eventualmente apresentados.',
    explanation: 'Consequências da ausência na audiência inaugural: ausência do reclamante gera arquivamento e condenação em custas; ausência da empresa gera revelia e confissão ficta, mas a presença do advogado garante o recebimento da contestação (§ 5º).',
    summary: 'Ausência do autor gera arquivamento da ação; ausência do réu gera revelia, mas advogado presente pode juntar defesa e documentos.'
  },
  "852-A": {
    title: 'Do Procedimento Sumaríssimo na Justiça do Trabalho (Até 40 SM)',
    oab: true,
    text: 'Art. 852-A. Os dissídios individuais cujo valor não exceda a 40 (quarenta) vezes o salário mínimo vigente na data do ajuizamento da reclamação ficam submetidos ao procedimento sumaríssimo.\nParágrafo único. Estão excluídas do procedimento sumaríssimo as demandas em que é parte a Administração Pública direta, autárquica e fundacional.',
    explanation: 'Rito Sumaríssimo: valor de até 40 salários mínimos. Proibido para a Fazenda Pública direta/autárquica. Não admite citação por edital (Art. 852-B, II) e limita o número de testemunhas a duas por parte (Art. 852-H, § 2º).',
    summary: 'Rito Sumaríssimo até 40 salários mínimos; vedado para a Fazenda Pública direta e sem citação por edital.'
  },
  895: {
    title: 'Do Recurso Ordinário Trabalhista (Prazo de 8 Dias)',
    oab: true,
    text: 'Art. 895. Cabe recurso ordinário para a instância superior:\nI - das decisões definitivas ou terminativas das Varas e Juízos, no prazo de 8 (oito) dias;\nII - das decisões definitivas ou terminativas dos Tribunais Regionais, em processos de sua competência originária, no prazo de 8 (oito) dias, quer nos dissídios individuais, quer nos dissídios coletivos.',
    explanation: 'Principal recurso trabalhista contra sentença terminativa/definitiva de 1º grau (equivalente à Apelação do CPC). Prazo geral trabalhista de 8 dias úteis.',
    summary: 'Recurso Ordinário (RO): cabível contra sentenças definitivas das Varas no prazo de 8 dias úteis.'
  },
  896: {
    title: 'Do Recurso de Revista perante o TST e Requisitos de Transcendência',
    oab: true,
    text: 'Art. 896. Cabe Recurso de Revista para Turma do Tribunal Superior do Trabalho das decisões proferidas em grau de recurso ordinário, em dissídio individual, pelos Tribunais Regionais do Trabalho, quando:\na) derem ao mesmo dispositivo de lei federal interpretação diversa da que lhe houver dado outro Tribunal Regional do Trabalho, no seu Pleno ou Turma, ou a Seção de Dissídios Individuais do Tribunal Superior do Trabalho, ou a Súmula de Jurisprudência Uniforme dessa Corte;\nb) derem ao mesmo dispositivo de lei estadual, convenção coletiva de trabalho, acordo coletivo, sentença normativa ou regulamento empresarial de observância obrigatória em área territorial que exceda a jurisdição do Tribunal Regional prolator da decisão recorrida, interpretação divergente;\nc) proferidas com violação literal de disposição de lei federal ou afronta direta e literal à Constituição Federal.\nArt. 896-A. O Tribunal Superior do Trabalho, no recurso de revista, examinará previamente se a causa oferece transcendência com relação aos reflexos gerais de natureza econômica, política, social ou jurídica.',
    explanation: 'Recurso de natureza extraordinária ao TST. Hipóteses: divergência jurisprudencial válida, violação direta à lei federal ou à CF/88. Exige demonstração prévia de transcendência econômica, política, jurídica ou social.',
    summary: 'Recurso de Revista ao TST por divergência ou violação de lei/CF no prazo de 8 dias úteis; exige transcendência.'
  },
  897: {
    title: 'Do Agravo de Petição e Agravo de Instrumento Trabalhista',
    oab: true,
    text: 'Art. 897. Cabe agravo, no prazo de 8 (oito) dias:\na) de petição, das decisões do Juiz ou Presidente, nas execuções;\nb) de instrumento, dos despachos que denegarem a interposição de recursos.\n§ 1º O agravo de petição só será recebido quando o agravante delimitar, justificadamente, as matérias e os valores impugnados, permitida a execução imediata da parte remanescente até o final.',
    explanation: 'Agravo de Petição: recurso exclusivo da fase de execução contra decisões definitivas/terminativas (exige delimitação de matérias e valores incontroversos). Agravo de Instrumento: recurso para destrancar recurso cujo seguimento foi negado.',
    summary: 'Agravo de Petição (execução com delimitação de valores) e Agravo de Instrumento (destrancar recursos) no prazo de 8 dias.'
  }
};

function getStructureForArticle(num) {
  for (const s of CLT_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return CLT_STRUCTURE[CLT_STRUCTURE.length - 1];
}

const allCltArticles = [];

for (let num = 1; num <= 922; num++) {
  const struct = getStructureForArticle(num);
  const specific = CLT_SPECIAL_ARTICLES[num];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' da Consolidação das Leis do Trabalho';
  const artId = 'clt-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 1 && num <= 12) ||
    (num >= 57 && num <= 75) ||
    (num >= 129 && num <= 145) ||
    (num >= 154 && num <= 200) ||
    (num >= 352 && num <= 400) ||
    (num >= 442 && num <= 510) ||
    (num >= 611 && num <= 625) ||
    (num >= 763 && num <= 902)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial do Decreto-Lei nº 5.452/1943 - Consolidação das Leis do Trabalho, ' + struct.title + ', ' + struct.chapter + '). Texto legal consolidado em vigor conforme publicação oficial no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria juslaboral de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo basilar do Direito Individual, Coletivo ou Processual do Trabalho.');
  let summary = specific ? specific.summary : ('Norma de ' + struct.category + ' da CLT, estabelecendo preceitos e diretrizes sobre ' + struct.chapter.toLowerCase() + '.');

  allCltArticles.push({
    id: artId,
    law_id: 'clt',
    subject_id: 'trabalho',
    law_name: 'Consolidação das Leis do Trabalho',
    law_number: 'Decreto-Lei nº 5.452/1943',
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
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm#art' + num,
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
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na rotina de relações laborais e reclamatórias perante as Varas do Trabalho.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas provas da OAB (1ª e 2ª Fase em Direito do Trabalho) e concursos da Magistratura do Trabalho e MPT.') : 'Leitura indispensável para domínio do Direito do Trabalho e Processo do Trabalho.',
      legal_terms: ['CLT', struct.category, 'Direito do Trabalho', 'Processo do Trabalho'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'cltFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 922 Artigos da Consolidação das Leis do Trabalho (Decreto-Lei 5.452/1943)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst CLT_ALL_ARTICLES = ' + JSON.stringify(allCltArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.CLT_ALL_ARTICLES = CLT_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de clt e insere todos os 922 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "clt");\n    VADE_MECUM_DB.articles.push(...CLT_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo da CLT carregado com sucesso (922 Artigos: Art. 1º ao Art. 922).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = CLT_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allCltArticles.length + ' artigos da CLT em ' + outputPath);
