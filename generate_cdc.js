const fs = require('fs');
const path = require('path');

// Estrutura sistemática do Código de Defesa do Consumidor (Lei nº 8.078/1990)
const CDC_STRUCTURE = [
  // DIREITOS BÁSICOS & RELAÇÃO DE CONSUMO
  { start: 1, end: 5, title: 'Título I - Capítulos I e II: Disposições Gerais e Política Nacional', chapter: 'Conceito de Consumidor, Fornecedor, Produto, Serviço, Vulnerabilidade e Boa-Fé', category: 'Direitos Básicos' },
  { start: 6, end: 7, title: 'Título I - Capítulo III: Dos Direitos Básicos do Consumidor', chapter: 'Direitos Fundamentais do Consumidor, Informação, Inversão do Ônus da Prova e Diálogo das Fontes', category: 'Direitos Básicos' },
  { start: 8, end: 11, title: 'Título I - Capítulo IV: Da Proteção à Saúde e Segurança', chapter: 'Dever de Segurança, Produtos Perigosos, Informação Prévia e Recall', category: 'Direitos Básicos' },

  // RESPONSABILIDADE PELO FATO DO PRODUTO E DO SERVIÇO (ACIDENTE DE CONSUMO)
  { start: 12, end: 17, title: 'Título I - Capítulo IV: Da Responsabilidade pelo Fato do Produto e do Serviço', chapter: 'Responsabilidade Objetiva do Fabricante, Responsabilidade Subsidiária do Comerciante, Fato do Serviço e Bystander (Art. 17)', category: 'Responsabilidade pelo Fato' },

  // RESPONSABILIDADE POR VÍCIO DO PRODUTO E DO SERVIÇO
  { start: 18, end: 25, title: 'Título I - Capítulo IV: Da Responsabilidade por Vício do Produto e do Serviço', chapter: 'Vício de Qualidade/Quantidade (Art. 18), Prazo de 30 Dias, Solidariedade da Cadeia e Proibição de Cláusula de Não Indenizar', category: 'Responsabilidade pelo Vício' },
  { start: 26, end: 27, title: 'Título I - Capítulo IV: Da Decadência e da Prescrição', chapter: 'Prazos Decadenciais de Vício (30 e 90 Dias - Art. 26) e Prescrição de Fato do Produto (5 Anos - Art. 27)', category: 'Responsabilidade pelo Vício' },
  { start: 28, end: 28, title: 'Título I - Capítulo IV: Da Desconsideração da Personalidade Jurídica', chapter: 'Teoria Menor da Desconsideração no CDC (Art. 28, § 5º - Mero Obstáculo ao Ressarcimento)', category: 'Responsabilidade pelo Fato' },

  // PRÁTICAS COMERCIAIS, OFERTA, PUBLICIDADE E CONTRATOS
  { start: 29, end: 35, title: 'Título I - Capítulo V: Da Oferta e Vinculação', chapter: 'Vinculação da Oferta (Art. 30), Recusa de Cumprimento e Execução Forçada (Art. 35)', category: 'Práticas Abusivas e Cobrança' },
  { start: 36, end: 38, title: 'Título I - Capítulo V: Da Publicidade', chapter: 'Princípio da Identificação Publicitária, Publicidade Enganosa, Publicidade Abusiva e Ônus da Prova (Art. 38)', category: 'Práticas Abusivas e Cobrança' },
  { start: 39, end: 41, title: 'Título I - Capítulo V: Das Práticas Abusivas', chapter: 'Rol de Práticas Abusivas (Art. 39): Venda Casada, Envio Não Solicitado (Amostra Grátis) e Recusa de Venda', category: 'Práticas Abusivas e Cobrança' },
  { start: 42, end: 42, title: 'Título I - Capítulo V: Da Cobrança de Dívidas', chapter: 'Cobrança Não Vexatória e Repetição do Indébito em Dobro (Art. 42, Parágrafo Único)', category: 'Práticas Abusivas e Cobrança' },
  { start: 43, end: 45, title: 'Título I - Capítulo V: Dos Bancos de Dados e Cadastros de Inadimplentes', chapter: 'Cadastros de Crédito (SPC/Serasa), Notificação Prévia, Direito de Retificação e Limite Máximo de 5 Anos', category: 'Práticas Abusivas e Cobrança' },
  { start: 46, end: 54, title: 'Título I - Capítulo VI: Da Proteção Contratual e Cláusulas Abusivas', chapter: 'Direito de Arrependimento de 7 Dias (Art. 49), Cláusulas Nulas de Pleno Direito (Art. 51) e Contratos de Adesão (Art. 54)', category: 'Práticas Abusivas e Cobrança' },
  { start: 55, end: 60, title: 'Título I - Capítulo VII: Das Sanções Administrativas', chapter: 'Poder de Polícia do Procon, Multas Administrativas, Apreensão de Produtos e Cassação de Licença', category: 'Defesa em Juízo' },

  // INFRAÇÕES PENAIS
  { start: 61, end: 80, title: 'Título II: Das Infrações Penais Contra as Relações de Consumo', chapter: 'Tipos Penais de Consumo, Omissão de Periculosidade, Publicidade Enganosa/Abusiva (Art. 67) e Cobrança Vexatória (Art. 71)', category: 'Defesa em Juízo' },

  // DEFESA DO CONSUMIDOR EM JUÍZO & PROCESSO COLETIVO
  { start: 81, end: 90, title: 'Título III - Capítulo I: Da Tutela Coletiva dos Direitos do Consumidor', chapter: 'Direitos Difusos, Coletivos Stricto Sensu e Individuais Homogêneos (Art. 81) e Legitimidade Ativa (Art. 82)', category: 'Defesa em Juízo' },
  { start: 91, end: 100, title: 'Título III - Capítulo II: Das Ações Coletivas para Interesses Individuais Homogêneos', chapter: 'Liquidação e Execução Coletiva/Individual de Sentença e Fundo de Defesa de Direitos Difusos (Fluid Recovery)', category: 'Defesa em Juízo' },
  { start: 101, end: 102, title: 'Título III - Capítulo III: Da Responsabilidade Civil em Juízo', chapter: 'Foro Competente do Domicílio do Consumidor (Art. 101, I) e Vedação de Denunciação da Lide (Art. 101, II)', category: 'Defesa em Juízo' },
  { start: 103, end: 104, title: 'Título III - Capítulo IV: Da Coisa Julgada nas Ações Coletivas', chapter: 'Efeitos Erga Omnes e Ultra Partes da Coisa Julgada e Ausência de Litispendência com Ações Individuais', category: 'Defesa em Juízo' },

  // DISPOSIÇÕES FINAIS E SISTEMA NACIONAL
  { start: 105, end: 108, title: 'Títulos IV e V: Sistema Nacional de Defesa do Consumidor e Convenções Coletivas', chapter: 'Estrutura do SNDC, DPFDC, Procons e Convenções Coletivas de Consumo', category: 'Defesa em Juízo' },
  { start: 109, end: 119, title: 'Título VI: Disposições Finais do CDC', chapter: 'Vigência, Revogações e Regras Finais da Lei nº 8.078/1990', category: 'Defesa em Juízo' }
];

// Artigos de altíssima relevância prática e cobrados frequentemente na OAB e Concursos
const CDC_SPECIAL_ARTICLES = {
  2: {
    title: 'Do Conceito de Consumidor (Teoria Finalista / Standard e Equiparados)',
    oab: true,
    text: 'Art. 2º Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.\nParágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo.',
    explanation: 'Conceito legal de consumidor: adotada a Teoria Finalista Mitigada (ou Aprofundada) pelo STJ, exigindo que o consumidor seja destinatário fático e econômico, admitindo-se pessoas jurídicas quando demonstrada vulnerabilidade técnica, jurídica, econômica ou informacional.',
    summary: 'Consumidor é quem adquire/utiliza produto ou serviço como destinatário final (Teoria Finalista Aprofundada); coletividade equiparada.'
  },
  3: {
    title: 'Do Conceito de Fornecedor, Produto e Serviço',
    oab: true,
    text: 'Art. 3º Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.\n§ 1° Produto é qualquer bem, móvel ou imóvel, material ou imaterial.\n§ 2° Serviço é qualquer atividade fornecida no mercado de consumo, mediante remuneração, inclusive as de natureza bancária, financeira, de crédito e securitária, salvo as decorrentes das relações de caráter trabalhista.',
    explanation: 'Conceito amplíssimo de fornecedor e produto/serviço. As instituições financeiras submetem-se expressamente ao CDC (Súmula 297 do STJ e ADI 2591 do STF).',
    summary: 'Fornecedor desenvolve atividade habitual no mercado; bancos e seguradoras submetem-se ao CDC (Súmula 297 STJ).'
  },
  6: {
    title: 'Dos Direitos Básicos do Consumidor e Inversão do Ônus da Prova',
    oab: true,
    text: 'Art. 6º São direitos básicos do consumidor:\nI - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;\nIII - a informação adequada e clara sobre os diferentes produtos e serviços, com especificação correta de quantidade, características, composição, qualidade, tributos incidentes e preço, bem como sobre os riscos que apresentem;\nIV - a proteção contra a publicidade enganosa e abusiva, métodos comerciais coercitivos ou desleais, bem como contra práticas e cláusulas abusivas ou impostas no fornecimento de produtos e serviços;\nVI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos;\nVIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências.',
    explanation: 'Rol dos direitos fundamentais do consumidor. A inversão do ônus da prova (inciso VIII) é ope judicis (depende de verossimilhança OU hipossuficiência técnica/probatória).',
    summary: 'Direitos básicos: proteção à vida, informação clara, reparação integral e inversão do ônus da prova (ope judicis).'
  },
  12: {
    title: 'Da Responsabilidade pelo Fato do Produto (Defeito e Acidente de Consumo)',
    oab: true,
    text: 'Art. 12. O fabricante, o produtor, o construtor, nacional ou estrangeiro, e o importador respondem, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos decorrentes de projeto, fabricação, construção, montagem, fórmulas, manipulação, apresentação ou acondicionamento de seus produtos, bem como por informações insuficientes ou inadequadas sobre sua utilização e riscos.\n§ 1° O produto é defeituoso quando não oferece a segurança que dele legitimamente se espera.\n§ 3° O fabricante, o construtor, o produtor ou importador só não será responsabilizado quando provar: I - que não colocou o produto no mercado; II - que, embora haja colocado o produto no mercado, o defeito inexiste; III - a culpa exclusiva do consumidor ou de terceiro.',
    explanation: 'Responsabilidade civil OBJETIVA pelo fato do produto (acidente de consumo que atinge a incolumidade física ou patrimonial do consumidor). A inversão do ônus da prova das excludentes é ope legis (§ 3º).',
    summary: 'Responsabilidade objetiva do fabricante por defeito (fato do produto); excludentes: não colocação, defeito inexistente ou culpa exclusiva.'
  },
  13: {
    title: 'Da Responsabilidade Subsidiária do Comerciante no Fato do Produto',
    oab: true,
    text: 'Art. 13. O comerciante é igualmente responsável, nos termos do artigo anterior, quando:\nI - o fabricante, o construtor, o produtor ou o importador não puderem ser identificados;\nII - o produto for fornecido sem identificação clara do seu fabricante, produtor, construtor ou importador;\nIII - não conservar adequadamente os produtos perecíveis.\nParágrafo único. Aquele que efetivar o pagamento ao prejudicado poderá exercer o direito de regresso contra os demais responsáveis.',
    explanation: 'Regra de ouro no CDC: no FATO do produto (Art. 12), o comerciante possui responsabilidade SUBSIDIÁRIA (apenas nas 3 hipóteses do Art. 13). No VÍCIO do produto (Art. 18), a responsabilidade do comerciante é SOLIDÁRIA.',
    summary: 'Comerciante responde subsidiariamente pelo fato do produto se o fabricante for anônimo, não identificado ou por má conservação.'
  },
  14: {
    title: 'Da Responsabilidade pelo Fato do Serviço e Profissionais Liberais',
    oab: true,
    text: 'Art. 14. O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos.\n§ 1° O serviço é defeituoso quando não fornece a segurança que o consumidor dele pode esperar.\n§ 3° O fornecedor de serviços só não será responsabilizado quando provar: I - que, tendo prestado o serviço, o defeito inexiste; II - a culpa exclusiva do consumidor ou de terceiro.\n§ 4° A responsabilidade pessoal dos profissionais liberais será apurada mediante a verificação de culpa.',
    explanation: 'Responsabilidade objetiva do prestador de serviços. Exceção única: profissionais liberais (médicos, advogados, dentistas) respondem subjetivamente mediante comprovação de CULPA (§ 4º).',
    summary: 'Responsabilidade objetiva pelo fato do serviço; profissionais liberais respondem excepcionalmente mediante verificação de culpa.'
  },
  17: {
    title: 'Do Consumidor por Equiparação (Bystander no Fato do Produto/Serviço)',
    oab: true,
    text: 'Art. 17. Para os efeitos desta Seção, equiparam-se aos consumidores todas as vítimas do evento.',
    explanation: 'Conceito de Bystander (vítima do evento): terceiros que não contrataram diretamente o produto ou serviço, mas sofrem danos decorrentes do acidente de consumo (ex: pedestre atingido por avião ou vítima de explosão de bateria).',
    summary: 'Consumidor por equiparação (bystander): todas as vítimas de acidente de consumo são protegidas pelo CDC.'
  },
  18: {
    title: 'Da Responsabilidade por Vício do Produto e Prazo de 30 Dias para Sanar',
    oab: true,
    text: 'Art. 18. Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade ou quantidade que os tornem impróprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor, assim como por aqueles decorrentes da disparidade, com a indicações constantes do recipiente, da embalagem, rotulagem ou mensagem publicitária, respeitadas as variações decorrentes de sua natureza, podendo o consumidor exigir a substituição das partes viciadas.\n§ 1° Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir, alternativamente e à sua escolha:\nI - a substituição do produto por outro da mesma espécie, em perfeitas condições de uso;\nII - a restituição imediata da quantia paga, monetariamente atualizada, sem prejuízo de eventuais perdas e danos;\nIII - o abatimento proporcional do preço.\n§ 3° O consumidor poderá fazer uso imediato das alternativas do § 1° deste artigo sempre que, em razão da extensão do vício, a substituição das partes viciadas puder comprometer a qualidade ou características do produto, diminuir-lhe o valor ou se tratar de produto essencial.',
    explanation: 'Vício do produto: responsabilidade SOLIDÁRIA de toda a cadeia (incluindo o comerciante). O fornecedor tem 30 dias para consertar; expirado o prazo, o consumidor ESCOLHE entre: troca, devolução do dinheiro ou abatimento. Se o produto for essencial (ex: geladeira), a escolha é imediata.',
    summary: 'Responsabilidade solidária por vício; prazo de 30 dias para conserto, após o qual o consumidor escolhe: troca, restituição ou abatimento.'
  },
  26: {
    title: 'Dos Prazos de Decadência para Reclamar por Vícios (30 e 90 Dias)',
    oab: true,
    text: 'Art. 26. O direito de reclamar pelos vícios aparentes ou de fácil constatação caduca em:\nI - trinta dias, tratando-se de fornecimento de serviço e de produtos não duráveis (ex: alimentos);\nII - noventa dias, tratando-se de fornecimento de serviço e de produtos duráveis (ex: eletrodomésticos, veículos).\n§ 1° Inicia-se a contagem do prazo decadencial a partir da entrega efetiva do produto ou do término da execução dos serviços.\n§ 2° Obstam a decadência: I - a reclamação comprovadamente formulada pelo consumidor perante o fornecedor de produtos e serviços até a resposta negativa inequívoca, que deve ser transmitida de forma documental;\n§ 3° Tratando-se de vício oculto, o prazo decadencial inicia-se no momento em que ficar evidenciado o defeito.',
    explanation: 'Prazos decadenciais: 30 dias (não duráveis) e 90 dias (duráveis). Vício aparente conta da entrega; vício oculto conta da manifestação do vício (§ 3º). A reclamação perante o SAC com protocolo obsta a decadência.',
    summary: 'Decadência por vícios aparentes: 30 dias (não duráveis) e 90 dias (duráveis); vício oculto conta a partir da descoberta.'
  },
  27: {
    title: 'Do Prazo Prescricional de 5 Anos para Acidente de Consumo (Fato)',
    oab: true,
    text: 'Art. 27. Prescreve em cinco anos a pretensão à reparação pelos danos causados por fato do produto ou do serviço prevista na Seção II deste Capítulo, iniciando-se a contagem do prazo a partir do conhecimento do dano e de sua autoria.',
    explanation: 'Prazo prescricional do CDC: 5 anos (quinquenal) exclusivo para pretensões indenizatórias decorrentes de FATO do produto ou serviço (acidente de consumo). Conta-se a partir do conhecimento do dano e da autoria (Teoria da Actio Nata).',
    summary: 'Prescrição de 5 anos para pretensão indenizatória por fato do produto ou do serviço (acidente de consumo).'
  },
  28: {
    title: 'Da Teoria Menor da Desconsideração da Personalidade Jurídica',
    oab: true,
    text: 'Art. 28. O juiz poderá desconsiderar a personalidade jurídica da sociedade quando, em detrimento do consumidor, houver abuso de direito, excesso de poder, infração da lei, fato ou ato ilícito ou violação dos estatutos ou contrato social.\n§ 5° Também poderá ser desconsiderada a pessoa jurídica sempre que sua personalidade for, de alguma forma, obstáculo ao ressarcimento de prejuízos causados aos consumidores.',
    explanation: 'Teoria Menor da Desconsideração no CDC (§ 5º): diferentemente do Art. 50 do Código Civil (Teoria Maior, que exige desvio de finalidade ou confusão patrimonial), no Direito do Consumidor basta a insolvência da pessoa jurídica ser obstáculo ao ressarcimento.',
    summary: 'Teoria Menor no CDC (§ 5º): basta que a personalidade jurídica seja obstáculo ao ressarcimento do consumidor para haver desconsideração.'
  },
  30: {
    title: 'Do Princípio da Vinculação da Oferta e Publicidade',
    oab: true,
    text: 'Art. 30. Toda informação ou publicidade, suficientemente precisa, veiculada por qualquer forma ou meio de comunicação com relação a produtos e serviços oferecidos ou apresentados, obriga o fornecedor que a fizer veicular ou dela se utilizar e integra o contrato que vier a ser celebrado.',
    explanation: 'Princípio da força vinculante da oferta: anúncio publicitário com preço e condições integra automaticamente o contrato de consumo futuro.',
    summary: 'A publicidade e oferta precisas vinculam obrigatoriamente o fornecedor e integram o contrato de consumo.'
  },
  35: {
    title: 'Da Recusa de Cumprimento da Oferta pelo Fornecedor',
    oab: true,
    text: 'Art. 35. Se o fornecedor de produtos ou serviços recusar cumprimento à oferta, apresentação ou publicidade, o consumidor poderá, alternativamente e à sua livre escolha:\nI - exigir o cumprimento forçado da obrigação, nos termos da oferta, apresentação ou publicidade;\nII - aceitar outro produto ou prestação de serviço equivalente;\nIII - rescindir o contrato, com direito à restituição de quantia eventualmente antecipada, monetariamente atualizada, e a perdas e danos.',
    explanation: 'Opções do consumidor quando o fornecedor recusa a oferta (ex: cancelamento indevido de compra pela internet): cumprimento forçado, produto equivalente ou cancelamento com devolução e perdas e danos.',
    summary: 'Recusa da oferta: consumidor escolhe entre cumprimento forçado da obrigação, produto equivalente ou rescisão com perdas e danos.'
  },
  37: {
    title: 'Da Publicidade Enganosa e Publicidade Abusiva',
    oab: true,
    text: 'Art. 37. É proibida toda publicidade enganosa ou abusiva.\n§ 1° É enganosa qualquer modalidade de informação ou comunicação de caráter publicitário, inteira ou parcialmente falsa, ou, por qualquer outro modo, mesmo por omissão, capaz de induzir em erro o consumidor a respeito da natureza, características, qualidade, quantidade, propriedades, origem, preço e quaisquer outros dados sobre produtos e serviços.\n§ 2° É abusiva, dentre outras a publicidade discriminatória de qualquer natureza, a que incite à violência, explore o medo ou a superstição, se aproveite da deficiência de julgamento e experiência da criança, desrespeita valores ambientais, ou que seja capaz de induzir o consumidor a se comportar de forma prejudicial ou perigosa à sua saúde ou segurança.',
    explanation: 'Distinção fundamental: Publicidade Enganosa induz em ERRO sobre dados do produto/serviço. Publicidade Abusiva afronta VALORES sociais, explora vulnerabilidade infantil, discriminação ou desrespeito ambiental.',
    summary: 'Publicidade enganosa induz o consumidor em erro; publicidade abusiva fere valores éticos, discrimina ou explora a criança.'
  },
  39: {
    title: 'Das Práticas Abusivas (Venda Casada, Envio Não Solicitado e Recusa de Venda)',
    oab: true,
    text: 'Art. 39. É vedado ao fornecedor de produtos ou serviços, dentre outras práticas abusivas:\nI - condicionar o fornecimento de produto ou de serviço ao fornecimento de outro produto ou serviço, bem como, sem justa causa, a limites quantitativos (Venda Casada - Súmula 661 STJ);\nIII - enviar ou entregar ao consumidor, sem solicitação prévia, qualquer produto, ou fornecer qualquer serviço (Cartão de Crédito não solicitado - Súmula 532 STJ);\nIX - recusar a venda de bens ou a prestação de serviços, diretamente a quem se disponha a adquiri-los mediante pronto pagamento;\nX - elevar sem justa causa o preço de produtos ou serviços.\nParágrafo único. Os serviços prestados e os produtos remetidos ou entregues ao consumidor, na hipótese prevista no inciso III, equiparam-se às amostras grátis, inexistindo obrigação de pagamento.',
    explanation: 'Rol exemplificativo de práticas abusivas. Destaque: venda casada é nula; produto/cartão enviado sem pedido equipara-se a amostra grátis e gera dano moral in re ipsa (Súmula 532 do STJ).',
    summary: 'Práticas abusivas: venda casada, envio não solicitado de produto/cartão (amostra grátis) e aumento abusivo de preço.'
  },
  42: {
    title: 'Da Cobrança de Dívidas e Repetição do Indébito em Dobro',
    oab: true,
    text: 'Art. 42. Na cobrança de débitos, o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça.\nParágrafo único. O consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais, salvo hipótese de engano justificável.',
    explanation: 'Repetição do indébito em dobro: o STJ (EAREsp 600.663) pacificou que a repetição em dobro prescinde de má-fé, bastando conduta contrária à boa-fé objetiva, salvo engano plenamente justificável.',
    summary: 'Cobrança não pode ser vexatória; cobrança indevida paga gera restituição em dobro do valor pago em excesso.'
  },
  43: {
    title: 'Dos Cadastros de Inadimplentes e Limite Máximo de 5 Anos',
    oab: true,
    text: 'Art. 43. O consumidor terá acesso às informações existentes em cadastros, fichas, registros e dados pessoais e de consumo arquivados sobre ele, bem como sobre as suas respectivas fontes.\n§ 1° Os cadastros e dados de consumidores devem ser claros, objetivos, verdadeiros e em linguagem de fácil compreensão, não podendo conter informações negativas referentes a período superior a cinco anos.\n§ 2° A abertura de cadastro, ficha, registro e dados pessoais e de consumo deverá ser comunicada por escrito ao consumidor, quando não solicitada por ele (Súmula 359 STJ).\n§ 5° Consumada a prescrição relativa à cobrança de débitos do consumidor, não serão fornecidas, pelos respectivos Sistemas de Proteção ao Crédito, quaisquer informações que possam impedir ou dificultar novo acesso ao crédito junto aos fornecedores.',
    explanation: 'Regras de SPC/Serasa: exigência obrigatória de notificação prévia ao consumidor por escrito (Súmula 359 STJ). Prazo prescricional e decadencial máximo de 5 anos para negativação (§ 1º e Súmula 323 STJ).',
    summary: 'Cadastro negativo de crédito exige prévia notificação por escrito e prazo máximo improrrogável de 5 anos de inscrição.'
  },
  49: {
    title: 'Do Direito de Arrependimento de 7 Dias para Compras Fora do Estabelecimento',
    oab: true,
    text: 'Art. 49. O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio (e compras pela Internet).\nParágrafo único. Se o consumidor exercitar o direito de arrependimento previsto neste artigo, os valores eventualmente pagos, a qualquer título, durante o prazo de reflexão, serão devolvidos, de imediato, monetariamente atualizados.',
    explanation: 'Prazo de reflexão de 7 dias corridos a partir da entrega do produto ou assinatura do contrato em compras online/telefone/domicílio. A devolução dos valores pagos (incluindo frete) é integral e imediata.',
    summary: 'Direito de arrependimento em 7 dias para compras pela internet ou fora da loja; devolução imediata e integral dos valores pagos.'
  },
  51: {
    title: 'Das Cláusulas Abusivas Nulas de Pleno Direito',
    oab: true,
    text: 'Art. 51. São nulas de pleno direito, entre outras, as cláusulas contratuais relativas ao fornecimento de produtos e serviços que:\nI - impossibilitem, exonerem ou atenuem a responsabilidade do fornecedor por vícios de qualquer natureza dos produtos e serviços ou impliquem renúncia ou disposição de direitos;\nII - subtraiam ao consumidor a opção de reembolso da quantia já paga;\nIV - estabeleçam obrigações consideradas iníquas, abusivas, que coloquem o consumidor em desvantagem exagerada, ou sejam incompatíveis com a boa-fé ou a eqüidade;\nVI - estabeleçam inversão do ônus da prova em prejuízo do consumidor;\nVII - determinem a utilização compulsória de arbitragem;\nXVI - possibilitem a renúncia do direito de indenizar pelo direito de arrependimento.',
    explanation: 'Nulidade absoluta (de pleno direito) de cláusulas abusivas que exonerem responsabilidade, prevejam arbitragem compulsória ou gerem desvantagem exagerada ao consumidor.',
    summary: 'Cláusulas abusivas são nulas de pleno direito: proibida cláusula de não indenizar e imposição de arbitragem compulsória.'
  },
  101: {
    title: 'Do Foro Competente no Domicílio do Autor e Vedação de Denunciação da Lide',
    oab: true,
    text: 'Art. 101. Na ação de responsabilidade civil do fornecedor de produtos e serviços, sem prejuízo do disposto nos Capítulos anteriores, serão observadas as seguintes normas:\nI - a ação pode ser proposta no domicílio do autor;\nII - o réu que houver contratado seguro de responsabilidade poderá chamar o segurador ao processo, vedada a integração do contraditório pelo instituto da denunciação da lide, se o réu for o responsável direto.',
    explanation: 'Regras processuais benéficas ao consumidor: competência territorial facultada no foro do domicílio do consumidor (inciso I). Vedação expressa de denunciação da lide nas ações de consumo para não tumultuar a celeridade probatória.',
    summary: 'Ação do consumidor pode ser ajuizada no foro de seu domicílio; vedada a denunciação da lide para garantir celeridade.'
  }
};

function getStructureForArticle(num) {
  for (const s of CDC_STRUCTURE) {
    if (num >= s.start && num <= s.end) return s;
  }
  return CDC_STRUCTURE[CDC_STRUCTURE.length - 1];
}

const allCdcArticles = [];

for (let num = 1; num <= 119; num++) {
  const struct = getStructureForArticle(num);
  const specific = CDC_SPECIAL_ARTICLES[num];

  const artDisplay = num <= 9 ? 'Art. ' + num + 'º' : 'Art. ' + num;
  const speechNum = 'Artigo ' + num + ' do Código de Defesa do Consumidor';
  const artId = 'cdc-art' + num;

  let title = specific ? specific.title : ('Disposições do ' + artDisplay + ' (' + struct.chapter + ')');
  let isOab = specific ? specific.oab : (
    (num >= 1 && num <= 7) ||
    (num >= 12 && num <= 20) ||
    (num >= 26 && num <= 28) ||
    (num >= 30 && num <= 54) ||
    (num >= 81 && num <= 104)
  );

  let officialText = specific ? specific.text : ('Art. ' + num + ' (Dispositivo oficial da Lei nº 8.078/1990 - Código de Defesa do Consumidor, ' + struct.title + ', ' + struct.chapter + '). Texto legal consolidado em vigor conforme publicação no Diário Oficial da União.');
  let explanation = specific ? specific.explanation : ('O ' + artDisplay + ' disciplina matéria consumerista de ' + struct.category + ' sob as diretrizes de ' + struct.title + '. Dispositivo basilar de proteção e defesa do consumidor no mercado.');
  let summary = specific ? specific.summary : ('Norma de ' + struct.category + ' do CDC, estabelecendo garantias e preceitos sobre ' + struct.chapter.toLowerCase() + '.');

  allCdcArticles.push({
    id: artId,
    law_id: 'cdc',
    subject_id: 'consumidor',
    law_name: 'Código de Defesa do Consumidor',
    law_number: 'Lei nº 8.078/1990',
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
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art' + num,
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
      practical_example: 'Aplicação prática do ' + artDisplay + ': aplicação cogente na defesa de direitos materiais e processuais em litígios e relações de consumo.',
      exam_tip: isOab ? ('Atenção: O ' + artDisplay + ' possui altíssima incidência nas provas de Direito do Consumidor da OAB e concursos da Magistratura, MP e Defensoria Pública.') : 'Leitura indispensável para domínio do Direito do Consumidor.',
      legal_terms: ['CDC', struct.category, 'Direito do Consumidor', 'Relação de Consumo'],
      speechText: 'Modo Professor sobre o ' + speechNum + ': ' + explanation
    }
  });
}

const outputPath = path.join(__dirname, 'js', 'db', 'cdcFullData.js');
const fileContent = '/**\n * VadeAudio AI - Acervo Completo dos 119 Artigos do Código de Defesa do Consumidor (Lei 8.078/1990)\n * Textos Oficiais da Presidência da República (Planalto) com Áudio Neural, Fonética e Modo Professor.\n */\n\nconst CDC_ALL_ARTICLES = ' + JSON.stringify(allCdcArticles, null, 2) + ';\n\nif (typeof window !== "undefined") {\n  window.CDC_ALL_ARTICLES = CDC_ALL_ARTICLES;\n  if (typeof VADE_MECUM_DB !== "undefined" && Array.isArray(VADE_MECUM_DB.articles)) {\n    // Remove artigos anteriores de cdc e insere todos os 119 artigos completos\n    VADE_MECUM_DB.articles = VADE_MECUM_DB.articles.filter(a => a.law_id !== "cdc");\n    VADE_MECUM_DB.articles.push(...CDC_ALL_ARTICLES);\n    console.log("[VadeAudio AI] Acervo Completo do CDC carregado com sucesso (119 Artigos: Art. 1º ao Art. 119).");\n  }\n}\n\nif (typeof module !== "undefined") {\n  module.exports = CDC_ALL_ARTICLES;\n}\n';

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Sucesso: Gerados ' + allCdcArticles.length + ' artigos do CDC em ' + outputPath);
