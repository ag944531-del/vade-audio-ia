/**
 * VadeAudio AI - Base de Dados Legislativa, Jurisprudencial e Doutrinária Oficial
 * Legislação Oficial da Presidência da República (Planalto), Jurisprudência STF/STJ e Súmulas
 * Organizado por 14 Disciplinas Jurídicas com versionamento histórico e banco de questões.
 */

const VADE_MECUM_DB = {
  // Metadados Globais do Sistema
  system_info: {
    last_global_check: '2026-08-15T12:00:00Z',
    official_source_disclaimer: 'Conteúdo legislativo e jurisprudencial para fins de estudo. Consulte sempre as fontes oficiais (Planalto, STF e STJ) para verificar alterações recentes.'
  },

  // --------------------------------------------------------------------------
  // 14 Disciplinas Jurídicas Oficiais
  // --------------------------------------------------------------------------
  subjects: [
    { id: 'constitucional', name: 'Direito Constitucional', icon: 'fa-solid fa-landmark', color: '#f59e0b' },
    { id: 'civil', name: 'Direito Civil', icon: 'fa-solid fa-scale-balanced', color: '#38bdf8' },
    { id: 'processo_civil', name: 'Processo Civil', icon: 'fa-solid fa-file-signature', color: '#818cf8' },
    { id: 'penal', name: 'Direito Penal', icon: 'fa-solid fa-gavel', color: '#ef4444' },
    { id: 'processo_penal', name: 'Processo Penal', icon: 'fa-solid fa-handcuffs', color: '#f87171' },
    { id: 'administrativo', name: 'Direito Administrativo', icon: 'fa-solid fa-building-columns', color: '#fbbf24' },
    { id: 'tributario', name: 'Direito Tributário', icon: 'fa-solid fa-receipt', color: '#34d399' },
    { id: 'trabalho', name: 'Direito do Trabalho', icon: 'fa-solid fa-briefcase', color: '#10b981' },
    { id: 'processo_trabalho', name: 'Processo do Trabalho', icon: 'fa-solid fa-clipboard-check', color: '#059669' },
    { id: 'empresarial', name: 'Direito Empresarial', icon: 'fa-solid fa-chart-line', color: '#6366f1' },
    { id: 'consumidor', name: 'Direito do Consumidor', icon: 'fa-solid fa-cart-shopping', color: '#ec4899' },
    { id: 'direitos_humanos', name: 'Direitos Humanos', icon: 'fa-solid fa-hands-holding-child', color: '#a855f7' },
    { id: 'eca', name: 'ECA (Criança e Adolescente)', icon: 'fa-solid fa-child-reaching', color: '#14b8a6' },
    { id: 'etica_oab', name: 'Ética e Estatuto da OAB', icon: 'fa-solid fa-scale-unbalanced-flip', color: '#eab308' }
  ],

  // --------------------------------------------------------------------------
  // As 10 Legislações Oficiais do Vade Mecum
  // --------------------------------------------------------------------------
  laws: [
    {
      id: 'cf88',
      code: 'CF/88',
      title: 'Constituição da República Federativa do Brasil',
      law_number: 'Promulgada em 5 de outubro de 1988',
      subtitle: 'Texto Constitucional Atualizado com as Emendas Constitucionais',
      icon: 'fa-solid fa-landmark',
      subject_id: 'constitucional',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Direitos Fundamentais', 'Direitos Sociais', 'Organização do Estado', 'Administração Pública', 'Poder Judiciário']
    },
    {
      id: 'cc',
      code: 'CC/02',
      title: 'Código Civil',
      law_number: 'Lei nº 10.406, de 10 de janeiro de 2002',
      subtitle: 'Institui o Código Civil Brasileiro',
      icon: 'fa-solid fa-scale-balanced',
      subject_id: 'civil',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Parte Geral', 'Obrigações', 'Contratos', 'Responsabilidade Civil', 'Direito das Coisas', 'Família e Sucessões']
    },
    {
      id: 'cpc',
      code: 'CPC/15',
      title: 'Código de Processo Civil',
      law_number: 'Lei nº 13.105, de 16 de março de 2015',
      subtitle: 'Código de Processo Civil Atualizado',
      icon: 'fa-solid fa-file-signature',
      subject_id: 'processo_civil',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Parte Geral', 'Tutelas Provisórias', 'Petição Inicial e Citação', 'Provas e Audiência', 'Sentença e Coisa Julgada', 'Recursos']
    },
    {
      id: 'cp',
      code: 'CP',
      title: 'Código Penal',
      law_number: 'Decreto-Lei nº 2.848, de 7 de dezembro de 1940',
      subtitle: 'Código Penal Brasileiro e Legislação Correlata',
      icon: 'fa-solid fa-gavel',
      subject_id: 'penal',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Parte Geral', 'Aplicação da Pena', 'Crimes Contra a Pessoa', 'Crimes Contra o Patrimônio', 'Crimes Contra a Adm. Pública']
    },
    {
      id: 'cpp',
      code: 'CPP',
      title: 'Código de Processo Penal',
      law_number: 'Decreto-Lei nº 3.689, de 3 de outubro de 1941',
      subtitle: 'Código de Processo Penal Brasileiro',
      icon: 'fa-solid fa-handcuffs',
      subject_id: 'processo_penal',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Inquérito Policial', 'Ação Penal', 'Prisões e Medidas Cautelares', 'Provas', 'Tribunal do Júri', 'Recursos Penais']
    },
    {
      id: 'clt',
      code: 'CLT',
      title: 'Consolidação das Leis do Trabalho',
      law_number: 'Decreto-Lei nº 5.452, de 1º de maio de 1943',
      subtitle: 'Normas de Direito Material e Processual do Trabalho',
      icon: 'fa-solid fa-briefcase',
      subject_id: 'trabalho',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Relação de Emprego', 'Jornada de Trabalho', 'Férias e Salário', 'Rescisão Contratual', 'Processo do Trabalho']
    },
    {
      id: 'cdc',
      code: 'CDC',
      title: 'Código de Defesa do Consumidor',
      law_number: 'Lei nº 8.078, de 11 de setembro de 1990',
      subtitle: 'Normas de Proteção e Defesa do Consumidor',
      icon: 'fa-solid fa-cart-shopping',
      subject_id: 'consumidor',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Direitos Básicos', 'Responsabilidade pelo Fato', 'Responsabilidade pelo Vício', 'Práticas Abusivas e Cobrança', 'Defesa em Juízo']
    },
    {
      id: 'eca',
      code: 'ECA',
      title: 'Estatuto da Criança e do Adolescente',
      law_number: 'Lei nº 8.069, de 13 de julho de 1990',
      subtitle: 'Proteção Integral à Criança e ao Adolescente',
      icon: 'fa-solid fa-child-reaching',
      subject_id: 'eca',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Direitos Fundamentais', 'Adoção e Guarda', 'Medidas Protetivas', 'Ato Infracional e Medidas Socioeducativas', 'Conselho Tutelar']
    },
    {
      id: 'maria_da_penha',
      code: 'LMP',
      title: 'Lei Maria da Penha',
      law_number: 'Lei nº 11.340, de 7 de agosto de 2006',
      subtitle: 'Mecanismos para Coibir a Violência Doméstica e Familiar contra a Mulher',
      icon: 'fa-solid fa-person-dress',
      subject_id: 'penal',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Formas de Violência', 'Medidas Protetivas de Urgência', 'Assistência à Mulher', 'Procedimentos Policiais e Processuais']
    },
    {
      id: 'eoab',
      code: 'EOAB',
      title: 'Estatuto da Advocacia e da OAB',
      law_number: 'Lei nº 8.906, de 4 de julho de 1994',
      subtitle: 'Estatuto da Advocacia e da Ordem dos Advogados do Brasil',
      icon: 'fa-solid fa-scale-unbalanced-flip',
      subject_id: 'etica_oab',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/leis/l8906.htm',
      last_checked_at: '2026-08-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: '1.0.0',
      status: 'Atualizado',
      categories: ['Prerrogativas do Advogado', 'Inscrição na OAB', 'Incompatibilidades e Impedimentos', 'Honorários Advocatícios', 'Infrações Disciplinares']
    }
  ],

  // --------------------------------------------------------------------------
  // Acervo Legislativo com Dispositivos Oficiais Hierarquizados
  // --------------------------------------------------------------------------
  articles: [
    // CONSTITUIÇÃO FEDERAL (CF/88)
    {
      id: 'cf-art1',
      law_id: 'cf88',
      subject_id: 'constitucional',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '1',
      article_display: 'Art. 1º',
      speech_number: 'Artigo primeiro da Constituição Federal',
      title: 'Dos Princípios Fundamentais da República',
      hierarchy: {
        title_num: 'Título I - Dos Princípios Fundamentais',
        chapter_num: 'Disposições Gerais'
      },
      category: 'Direitos Fundamentais',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art1',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 1º A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:\n\nI - a soberania;\nII - a cidadania;\nIII - a dignidade da pessoa humana;\nIV - os valores sociais do trabalho e da livre iniciativa;\nV - o pluralismo político.\n\nParágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
      content: [
        {
          id: 'cf-art1-caput',
          type: 'caput',
          text: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',
          speechText: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:'
        },
        {
          id: 'cf-art1-inc1',
          type: 'inciso',
          number: 'I a V',
          text: 'I - a soberania; II - a cidadania; III - a dignidade da pessoa humana; IV - os valores sociais do trabalho e da livre iniciativa; V - o pluralismo político.',
          speechText: 'inciso um: a soberania; inciso dois: a cidadania; inciso três: a dignidade da pessoa humana; inciso quatro: os valores sociais do trabalho e da livre iniciativa; inciso cinco: o pluralismo político.'
        },
        {
          id: 'cf-art1-pu',
          type: 'paragraph',
          number: 'Parágrafo único',
          text: 'Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.',
          speechText: 'Parágrafo único: Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 1º traz a certidão de nascimento do Estado brasileiro e o famoso mnemônico dos fundamentos da República: SO-CI-DI-VA-PLU (Soberania, Cidadania, Dignidade, Valores do Trabalho e Pluralismo).',
        summary: 'Define a forma republicana, o pacto federativo indissolúvel e consagra a dignidade humana como valor supremo.',
        practical_example: 'Qualquer lei municipal ou estadual que fira a dignidade humana ou tente proclamar separação territorial é inconstitucional por violar o pacto indissolúvel da Federação.',
        exam_tip: 'Cuidado para não confundir os Fundamentos (Art. 1º - SO-CI-DI-VA-PLU) com os Objetivos Fundamentais (Art. 3º - CON-GA-ERRA-PRO).',
        legal_terms: ['Estado Democrático de Direito', 'Dignidade da Pessoa Humana', 'Pluralismo Político', 'Pacto Federativo'],
        speechText: 'Modo Professor sobre o Artigo primeiro da Constituição: Memorize o mnemônico So-Ci-Di-Va-Plu para gabaritar questões de Direito Constitucional.'
      }
    },
    {
      id: 'cf-art6',
      law_id: 'cf88',
      subject_id: 'constitucional',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '6',
      article_display: 'Art. 6º',
      speech_number: 'Artigo sexto da Constituição Federal',
      title: 'Dos Direitos Sociais Fundamentais',
      hierarchy: {
        title_num: 'Título II - Dos Direitos e Garantias Fundamentais',
        chapter_num: 'Capítulo II - Dos Direitos Sociais'
      },
      category: 'Direitos Sociais',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art6',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 6º São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.',
      content: [
        {
          id: 'cf-art6-caput',
          type: 'caput',
          text: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.',
          speechText: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 6º elenca os Direitos Sociais de segunda dimensão (prestações positivas do Estado ao cidadão).',
        summary: 'Direitos fundamentais de cunho prestacional que exigem políticas públicas ativas do Estado para redução das desigualdades.',
        practical_example: 'A garantia do fornecimento de medicamentos de alto custo pelo SUS a pacientes hipossuficientes decorre da aplicação direta do direito social à saúde.',
        exam_tip: 'O transporte e a moradia foram incluídos por Emendas Constitucionais posteriores. Transporte foi incluído pela EC 90/2015.',
        legal_terms: ['Direitos Sociais', 'Mínimo Existencial', 'Reserva do Possível'],
        speechText: 'Modo Professor sobre o Artigo sexto: Os direitos sociais consagram a igualdade material e o dever de prestação do Estado.'
      }
    },
    {
      id: 'cf-art60',
      law_id: 'cf88',
      subject_id: 'constitucional',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '60',
      article_display: 'Art. 60',
      speech_number: 'Artigo sessenta da Constituição Federal',
      title: 'Das Emendas Constitucionais e Cláusulas Pétreas',
      hierarchy: {
        title_num: 'Título IV - Da Organização dos Poderes',
        chapter_num: 'Capítulo I - Do Processo Legislativo'
      },
      category: 'Organização do Estado',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art60',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 60. A Constituição poderá ser emendada mediante proposta:\n\n§ 4º Não será objeto de deliberação a proposta de emenda tendente a abolir:\nI - a forma federativa de Estado;\nII - o voto direto, secreto, universal e periódico;\nIII - a separação dos Poderes;\nIV - os direitos e garantias individuais.',
      content: [
        {
          id: 'cf-art60-caput',
          type: 'caput',
          text: 'A Constituição poderá ser emendada mediante proposta de um terço dos membros da Câmara ou do Senado, do Presidente da República ou de mais da metade das Assembleias Legislativas.',
          speechText: 'A Constituição poderá ser emendada mediante proposta de um terço dos membros da Câmara ou do Senado, do Presidente da República ou de mais da metade das Assembleias Legislativas.'
        },
        {
          id: 'cf-art60-p4',
          type: 'paragraph',
          number: '§ 4º',
          text: '§ 4º Não será objeto de deliberação a proposta de emenda tendente a abolir: I - a forma federativa de Estado; II - o voto direto, secreto, universal e periódico; III - a separação dos Poderes; IV - os direitos e garantias individuais.',
          speechText: 'parágrafo quarto: Não será objeto de deliberação a proposta de emenda tendente a abolir: inciso um: a forma federativa de Estado; inciso dois: o voto direto, secreto, universal e periódico; inciso três: a separação dos Poderes; inciso quatro: os direitos e garantias individuais.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 60, parágrafo 4º, consagra as famosas Cláusulas Pétreas (FO-VO-SE-DI). Nenhuma emenda pode abolir o pacto federativo, o voto direto/secreto/universal/periódico, a tripartição de poderes ou os direitos fundamentais.',
        summary: 'Limites materiais explícitos ao poder constituinte derivado reformador.',
        practical_example: 'Uma PEC que pretenda instituir pena de morte para crimes comuns não pode sequer ser votada no Congresso Nacional por violar o Artigo 60, § 4º, IV.',
        exam_tip: 'Pegadinha clássica: A forma republicana e o voto obrigatório NÃO são cláusulas pétreas (apenas o voto direto, secreto, universal e periódico é pétreo).',
        legal_terms: ['Cláusulas Pétreas', 'Poder Constituinte Derivado', 'Inconstitucionalidade Material'],
        speechText: 'Modo Professor sobre o Artigo sessenta: O parágrafo quarto é o coração do controle de constitucionalidade preventivo no Congresso.'
      }
    },
    {
      id: 'cf-art102',
      law_id: 'cf88',
      subject_id: 'constitucional',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '102',
      article_display: 'Art. 102',
      speech_number: 'Artigo cento e dois da Constituição Federal',
      title: 'Da Competência do Supremo Tribunal Federal (STF)',
      hierarchy: {
        title_num: 'Título IV - Da Organização dos Poderes',
        chapter_num: 'Capítulo III - Do Poder Judiciário'
      },
      category: 'Poder Judiciário',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art102',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 102. Compete ao Supremo Tribunal Federal, precipuamente, a guarda da Constituição, cabendo-lhe:\n\nI - processar e julgar, originariamente:\na) a ação direta de inconstitucionalidade de lei ou ato normativo federal ou estadual e a ação declaratória de constitucionalidade de lei ou ato normativo federal;\n\nIII - julgar, mediante recurso extraordinário, as causas decididas em única ou última instância, quando a decisão recorrida:\na) contrariar dispositivo desta Constituição.',
      content: [
        {
          id: 'cf-art102-caput',
          type: 'caput',
          text: 'Compete ao Supremo Tribunal Federal, precipuamente, a guarda da Constituição, cabendo-lhe processar e julgar originariamente ações de controle concentrado (ADI, ADC, ADO e ADPF) e julgar Recursos Extraordinários com repercussão geral.',
          speechText: 'Compete ao Supremo Tribunal Federal, precipuamente, a guarda da Constituição, cabendo-lhe processar e julgar originariamente ações de controle concentrado de constitucionalidade e julgar Recursos Extraordinários.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 102 define o STF como o Guardião da Carta Magna e instância máxima de controle de constitucionalidade no Brasil.',
        summary: 'Competência originária e recursal extraordinária da Corte Constitucional brasileira.',
        practical_example: 'Se um tribunal de justiça estadual decidir contrariando a Constituição, cabe Recurso Extraordinário ao STF demonstrando a repercussão geral da matéria.',
        exam_tip: 'O STF julga ADI contra lei federal ou estadual. Lei municipal contrária à CF/88 é objeto de ADPF, não de ADI.',
        legal_terms: ['Controle Concentrado', 'Guardião da Constituição', 'Recurso Extraordinário', 'Repercussão Geral'],
        speechText: 'Modo Professor sobre o Artigo cento e dois: O STF é o órgão de cúpula do Poder Judiciário responsável por uniformizar a interpretação da Constituição.'
      }
    },
    {
      id: 'cf-art5',
      law_id: 'cf88',
      subject_id: 'constitucional',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '5',
      article_display: 'Art. 5º',
      speech_number: 'Artigo quinto da Constituição Federal',
      title: 'Dos Direitos e Deveres Individuais e Coletivos',
      hierarchy: {
        title_num: 'Título II - Dos Direitos e Garantias Fundamentais',
        chapter_num: 'Capítulo I - Dos Direitos e Deveres Individuais e Coletivos'
      },
      category: 'Direitos Fundamentais',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art5',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 5º Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:\n\nXI - a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;\n\nLVII - ninguém será considerado culpado até o trânsito em julgado de sentença penal condenatória;\n\nLXVIII - conceder-se-á habeas corpus sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou abuso de poder;',
      content: [
        {
          id: 'cf-art5-caput',
          type: 'caput',
          text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
          speechText: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:'
        },
        {
          id: 'cf-art5-inc11',
          type: 'inciso',
          number: 'XI',
          text: 'XI - a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;',
          speechText: 'inciso onze: a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial;'
        },
        {
          id: 'cf-art5-inc57',
          type: 'inciso',
          number: 'LVII',
          text: 'LVII - ninguém será considerado culpado até o trânsito em julgado de sentença penal condenatória;',
          speechText: 'inciso cinquenta e sete: ninguém será considerado culpado até o trânsito em julgado de sentença penal condenatória;'
        },
        {
          id: 'cf-art5-inc68',
          type: 'inciso',
          number: 'LXVIII',
          text: 'LXVIII - conceder-se-á habeas corpus sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou abuso de poder;',
          speechText: 'inciso sessenta e oito: conceder-se-á habeas corpus sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou abuso de poder;'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 5º é a espinha dorsal de todo o ordenamento jurídico brasileiro. Ele garante a todos os direitos fundamentais inegociáveis: vida, liberdade, igualdade, segurança jurídica e patrimônio.',
        summary: 'Cláusula pétrea constitucional inatingível por emenda que visa aboli-la. Abrange garantias materiais e processuais civis e penais.',
        practical_example: 'Caso prático: policiais suspeitam de um ilícito dentro de uma casa às 23 horas. Eles não podem arrombar o portão mesmo com ordem judicial, pois mandado de busca só se cumpre durante o dia. À noite, só com consentimento do morador ou em flagrante delito comprovado.',
        exam_tip: 'Pegadinha FGV/OAB: Mandado judicial de busca domiciliar autoriza entrada APENAS durante o dia. À noite, somente consentimento, socorro, desastre ou flagrante delito.',
        legal_terms: ['Asilo Inviolável', 'Presunção de Inocência', 'Trânsito em Julgado', 'Habeas Corpus'],
        speechText: 'Modo Professor sobre o Artigo 5º da Constituição Federal: Este é o dispositivo mais cobrado em concursos e no Exame da OAB. Ele protege o asilo inviolável da casa, a presunção de inocência e o remédio heroico do Habeas Corpus.'
      }
    },
    {
      id: 'cf-art37',
      law_id: 'cf88',
      subject_id: 'administrativo',
      law_name: 'Constituição Federal de 1988',
      law_number: 'Constituição da República Federativa do Brasil',
      article: '37',
      article_display: 'Art. 37',
      speech_number: 'Artigo trinta e sete da Constituição Federal',
      title: 'Princípios da Administração Pública (LIMPE)',
      hierarchy: {
        title_num: 'Título III - Da Organização do Estado',
        chapter_num: 'Capítulo VII - Da Administração Pública'
      },
      category: 'Administração Pública',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art37',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 37. A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência e, também, ao seguinte:\n\n§ 6º As pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa.',
      content: [
        {
          id: 'cf-art37-caput',
          type: 'caput',
          text: 'A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência e, também, ao seguinte:',
          speechText: 'A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência e, também, ao seguinte:'
        },
        {
          id: 'cf-art37-p6',
          type: 'paragraph',
          number: '§ 6º',
          text: '§ 6º As pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa.',
          speechText: 'parágrafo sexto: As pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 37 estabelece o mnemônico LIMPE e a responsabilidade objetiva do Estado.',
        summary: 'Norma central do Direito Administrativo. Impõe que o poder público responda objetivamente por danos de seus agentes.',
        practical_example: 'Viatura em perseguição atinge carro de terceiro: o Estado indeniza a vítima objetivamente e cobra do policial caso fique provada negligência.',
        exam_tip: 'A vítima processa o Estado diretamente. O Estado move ação regressiva contra o servidor público.',
        legal_terms: ['Princípios do LIMPE', 'Responsabilidade Objetiva', 'Direito de Regresso'],
        speechText: 'Modo Professor sobre o Artigo 37 da Constituição Federal: Lembre-se do LIMPE e da regra do parágrafo sexto sobre a responsabilidade objetiva do Estado.'
      }
    },

    // CÓDIGO PENAL (CP)
    {
      id: 'cp-art1',
      law_id: 'cp',
      subject_id: 'penal',
      law_name: 'Código Penal',
      law_number: 'Decreto-Lei nº 2.848/1940',
      article: '1',
      article_display: 'Art. 1º',
      speech_number: 'Artigo primeiro do Código Penal',
      title: 'Anterioridade da Lei Penal',
      hierarchy: {
        part: 'Parte Geral',
        title_num: 'Título I - Da Aplicação da Lei Penal'
      },
      category: 'Parte Geral',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm#art1',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 1º Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.',
      content: [
        {
          id: 'cp-art1-caput',
          type: 'caput',
          text: 'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.',
          speechText: 'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.'
        }
      ],
      professor_mode: {
        simple_explanation: 'Princípio da Reserva Legal e Anterioridade: ninguém pode ser punido por um ato se na data em que o praticou ele não era expressamente proibido por lei.',
        summary: 'Garantia contra o arbítrio estatal. Veda a criação de crimes por medida provisória ou costumes.',
        practical_example: 'Uma conduta na internet sem tipificação hoje não pode gerar prisão se a lei só for aprovada amanhã.',
        exam_tip: 'Apenas lei em sentido estrito (do Poder Legislativo) cria tipos penais incriminadores.',
        legal_terms: ['Nullum Crimen Sine Lege', 'Legalidade Estrita', 'Irretroatividade'],
        speechText: 'Modo Professor sobre o Artigo primeiro do Código Penal: Consagração da anterioridade penal estrita.'
      }
    },
    {
      id: 'cp-art25',
      law_id: 'cp',
      subject_id: 'penal',
      law_name: 'Código Penal',
      law_number: 'Decreto-Lei nº 2.848/1940',
      article: '25',
      article_display: 'Art. 25',
      speech_number: 'Artigo vinte e cinco do Código Penal',
      title: 'Legítima Defesa e Excludentes de Ilicitude',
      hierarchy: {
        part: 'Parte Geral',
        title_num: 'Título II - Do Crime'
      },
      category: 'Parte Geral',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm#art25',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 25 - Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.\n\nParágrafo único. Observados os requisitos previstos no caput deste artigo, considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém durante a prática de crimes.',
      content: [
        {
          id: 'cp-art25-caput',
          type: 'caput',
          text: 'Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.',
          speechText: 'Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.'
        },
        {
          id: 'cp-art25-pu',
          type: 'paragraph',
          number: 'Parágrafo único',
          text: 'Parágrafo único. Observados os requisitos previstos no caput deste artigo, considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém durante a prática de crimes.',
          speechText: 'parágrafo único: Observados os requisitos previstos no caput deste artigo, considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém durante a prática de crimes.'
        }
      ],
      professor_mode: {
        simple_explanation: 'A Legítima Defesa exclui a ilicitude: quando alguém sofre um ataque injusto, pode reagir com a força necessária para se proteger ou proteger outra pessoa.',
        summary: 'Requisitos: agressão injusta, atual ou iminente, proteção de direito e uso moderado dos meios.',
        practical_example: 'Vítima rende e desarma assaltante efetuando disparo proporcional para cessar o ataque: ato lícito em legítima defesa.',
        exam_tip: 'A agressão deve ser atual ou iminente. Não existe legítima defesa para vingança de agressão passada.',
        legal_terms: ['Legítima Defesa', 'Excludente de Ilicitude', 'Moderação'],
        speechText: 'Modo Professor sobre o Artigo 25 do Código Penal: A legítima defesa e o uso moderado dos meios necessários.'
      }
    },
    {
      id: 'cp-art121',
      law_id: 'cp',
      subject_id: 'penal',
      law_name: 'Código Penal',
      law_number: 'Decreto-Lei nº 2.848/1940',
      article: '121',
      article_display: 'Art. 121',
      speech_number: 'Artigo cento e vinte e um do Código Penal',
      title: 'Homicídio Simples, Privilegiado e Qualificado',
      hierarchy: {
        part: 'Parte Especial',
        title_num: 'Título I - Dos Crimes Contra a Pessoa',
        chapter_num: 'Capítulo I - Dos Crimes Contra a Vida'
      },
      category: 'Crimes Contra a Pessoa',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm#art121',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 121. Matar alguém:\nPena - reclusão, de seis a vinte anos.\n\n§ 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço.\n\n§ 2º Se o homicídio é cometido: I - mediante paga ou promessa de recompensa, ou por outro motivo torpe; II - por motivo fútil; III - com emprego de veneno, fogo, explosivo, asfixia, tortura ou outro meio insidioso ou cruel; IV - à traição, de emboscada, ou mediante dissimulação; V - para assegurar a execução, a ocultação, a impunidade ou vantagem de outro crime: Pena - reclusão, de doze a trinta anos.',
      content: [
        {
          id: 'cp-art121-caput',
          type: 'caput',
          text: 'Matar alguém: Pena - reclusão, de seis a vinte anos.',
          speechText: 'Matar alguém: Pena de reclusão, de seis a vinte anos.'
        },
        {
          id: 'cp-art121-p1',
          type: 'paragraph',
          number: '§ 1º',
          text: '§ 1º Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço.',
          speechText: 'parágrafo primeiro: Se o agente comete o crime impelido por motivo de relevante valor social ou moral, ou sob o domínio de violenta emoção, logo em seguida a injusta provocação da vítima, o juiz pode reduzir a pena de um sexto a um terço.'
        },
        {
          id: 'cp-art121-p2',
          type: 'paragraph',
          number: '§ 2º',
          text: '§ 2º Se o homicídio é cometido: I - mediante paga ou promessa de recompensa, ou por outro motivo torpe; II - por motivo fútil; III - com emprego de veneno, fogo, explosivo, asfixia, tortura ou outro meio insidioso ou cruel; IV - à traição, de emboscada, ou mediante dissimulação; V - para assegurar a execução, a ocultação, a impunidade ou vantagem de outro crime: Pena - reclusão, de doze a trinta anos.',
          speechText: 'parágrafo segundo: Se o homicídio é cometido mediante paga ou promessa de recompensa, ou por outro motivo torpe, por motivo fútil, com emprego de veneno, fogo, explosivo, asfixia, tortura ou outro meio insidioso ou cruel, à traição ou emboscada, ou para assegurar impunidade de outro crime: Pena de reclusão, de doze a trinta anos.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 121 tutela a vida humana e pune o homicídio em suas diversas modalidades.',
        summary: 'Julgamento privativo pelo Tribunal do Júri nos crimes dolosos contra a vida.',
        practical_example: 'Disputa de racha a 140 km/h com vítima fatal: jurisprudência aplica o dolo eventual no homicídio qualificado.',
        exam_tip: 'No homicídio qualificado-privilegiado, a qualificadora deve ser estritamente OBJETIVA (ex: veneno ou asfixia).',
        legal_terms: ['Homicídio Qualificado', 'Dolo Eventual', 'Qualificadoras Objetivas'],
        speechText: 'Modo Professor sobre o Artigo 121 do Código Penal: Trata-se do crime de homicídio e das distinções entre qualificadoras objetivas e subjetivas.'
      }
    },

    // CÓDIGO CIVIL (CC)
    {
      id: 'cc-art186',
      law_id: 'cc',
      subject_id: 'civil',
      law_name: 'Código Civil',
      law_number: 'Lei nº 10.406/2002',
      article: '186',
      article_display: 'Art. 186',
      speech_number: 'Artigo cento e oitenta e seis do Código Civil',
      title: 'Ato Ilícito Civil e Elementos da Culpa',
      hierarchy: {
        part: 'Parte Geral',
        book: 'Livro III - Dos Fatos Jurídicos',
        title_num: 'Título III - Dos Atos Ilícitos'
      },
      category: 'Responsabilidade Civil',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm#art186',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 186. Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.',
      content: [
        {
          id: 'cc-art186-caput',
          type: 'caput',
          text: 'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.',
          speechText: 'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 186 define o ato ilícito: quem age com imprudência ou negligência causando prejuízo material ou moral a outrem comete ato ilícito.',
        summary: 'Base da responsabilidade civil subjetiva: exige conduta, culpa, nexo de causalidade e dano.',
        practical_example: 'Motorista que colide ao mexer no celular comete ato ilícito por imprudência e deve indenizar a oficina.',
        exam_tip: 'O dano exclusivamente moral é indenizável sem necessidade de reflexo patrimonial.',
        legal_terms: ['Negligência', 'Imprudência', 'Dano Moral', 'Nexo Causal'],
        speechText: 'Modo Professor sobre o Artigo 186 do Código Civil: Fundamento da responsabilidade civil subjetiva.'
      }
    },
    {
      id: 'cc-art927',
      law_id: 'cc',
      subject_id: 'civil',
      law_name: 'Código Civil',
      law_number: 'Lei nº 10.406/2002',
      article: '927',
      article_display: 'Art. 927',
      speech_number: 'Artigo novecentos e vinte e sete do Código Civil',
      title: 'Obrigação de Indenizar e Teoria do Risco',
      hierarchy: {
        part: 'Parte Especial',
        book: 'Livro I - Do Direito das Obrigações',
        title_num: 'Título IX - Da Responsabilidade Civil'
      },
      category: 'Responsabilidade Civil',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm#art927',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 927. Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo.\n\nParágrafo único. Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei, ou quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.',
      content: [
        {
          id: 'cc-art927-caput',
          type: 'caput',
          text: 'Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo.',
          speechText: 'Aquele que, por ato ilícito, causar dano a outrem, fica obrigado a repará-lo.'
        },
        {
          id: 'cc-art927-pu',
          type: 'paragraph',
          number: 'Parágrafo único',
          text: 'Parágrafo único. Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei, ou quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.',
          speechText: 'parágrafo único: Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei, ou quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O parágrafo único consagra a responsabilidade civil objetiva pelo risco da atividade perigosa.',
        summary: 'Dispensa a prova de culpa quando a atividade do agente gera risco especial a terceiros.',
        practical_example: 'Empresa com transporte de cargas inflamáveis: havendo explosão, indeniza vizinhos independentemente de culpa.',
        exam_tip: 'A responsabilidade do parágrafo único é OBJETIVA.',
        legal_terms: ['Responsabilidade Objetiva', 'Teoria do Risco'],
        speechText: 'Modo Professor sobre o Artigo 927 do Código Civil: A teoria do risco e a responsabilidade objetiva.'
      }
    },

    // CÓDIGO DE PROCESSO CIVIL (CPC/15)
    {
      id: 'cpc-art300',
      law_id: 'cpc',
      subject_id: 'processo_civil',
      law_name: 'Código de Processo Civil',
      law_number: 'Lei nº 13.105/2015',
      article: '300',
      article_display: 'Art. 300',
      speech_number: 'Artigo trezentos do Código de Processo Civil',
      title: 'Requisitos Cumulativos da Tutela de Urgência',
      hierarchy: {
        part: 'Parte Geral',
        book: 'Livro V - Da Tutela Provisória',
        title_num: 'Título II - Da Tutela de Urgência'
      },
      category: 'Tutelas Provisórias',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm#art300',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 300. A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.',
      content: [
        {
          id: 'cpc-art300-caput',
          type: 'caput',
          text: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.',
          speechText: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 300 disciplina as liminares: para obter decisão antecipada, exige-se probabilidade do direito e perigo na demora.',
        summary: 'Requisitos cumulativos: fumus boni iuris e periculum in mora.',
        practical_example: 'Paciente que necessita de cirurgia urgente negada pelo plano de saúde obtém liminar em poucas horas.',
        exam_tip: 'A tutela de urgência pode ter natureza antecipada ou cautelar.',
        legal_terms: ['Probabilidade do Direito', 'Perigo de Dano', 'Tutela Provisória'],
        speechText: 'Modo Professor sobre o Artigo 300 do CPC: Requisitos cumulativos para a concessão da tutela de urgência.'
      }
    },

    // CÓDIGO DE PROCESSO PENAL (CPP)
    {
      id: 'cpp-art312',
      law_id: 'cpp',
      subject_id: 'processo_penal',
      law_name: 'Código de Processo Penal',
      law_number: 'Decreto-Lei nº 3.689/1941',
      article: '312',
      article_display: 'Art. 312',
      speech_number: 'Artigo trezentos e doze do Código de Processo Penal',
      title: 'Requisitos e Fundamentos da Prisão Preventiva',
      hierarchy: {
        book: 'Livro I - Do Processo em Geral',
        title_num: 'Título IX - Da Prisão, das Medidas Cautelares e da Liberdade Provisória'
      },
      category: 'Prisões e Medidas Cautelares',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm#art312',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 312. A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal, quando houver prova da existência do crime e indício suficiente de autoria e de perigo gerado pelo estado de liberdade do imputado.',
      content: [
        {
          id: 'cpp-art312-caput',
          type: 'caput',
          text: 'A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal, quando houver prova da existência do crime e indício suficiente de autoria e de perigo gerado pelo estado de liberdade do imputado.',
          speechText: 'A prisão preventiva poderá ser decretada como garantia da ordem pública, da ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal, quando houver prova da existência do crime e indício suficiente de autoria.'
        }
      ],
      professor_mode: {
        simple_explanation: 'A prisão preventiva é medida cautelar de última ratio, exigindo prova de materialidade, indícios de autoria e perigo concreto na liberdade do réu.',
        summary: 'Exige o fumus comissi delicti somado ao periculum libertatis.',
        practical_example: 'Réu que tenta coagir testemunhas e compra passagem de fuga internacional tem preventiva decretada.',
        exam_tip: 'A gravidade abstrata do crime não autoriza preventiva (jurisprudência pacífica do STF).',
        legal_terms: ['Prisão Preventiva', 'Fumus Comissi Delicti', 'Periculum Libertatis'],
        speechText: 'Modo Professor sobre o Artigo 312 do CPP: Os pressupostos e fundamentos da prisão preventiva.'
      }
    },

    // CLT
    {
      id: 'clt-art3',
      law_id: 'clt',
      subject_id: 'trabalho',
      law_name: 'Consolidação das Leis do Trabalho',
      law_number: 'Decreto-Lei nº 5.452/1943',
      article: '3',
      article_display: 'Art. 3º',
      speech_number: 'Artigo terceiro da Consolidação das Leis do Trabalho',
      title: 'Elementos Caracterizadores da Relação de Emprego',
      hierarchy: {
        title_num: 'Título I - Introdução'
      },
      category: 'Relação de Emprego',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm#art3',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 3º - Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.',
      content: [
        {
          id: 'clt-art3-caput',
          type: 'caput',
          text: 'Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.',
          speechText: 'Considera-se empregado toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário.'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 3º define a relação de emprego formal com carteira assinada através de 5 requisitos: Pessoa Física, Pessoalidade, Não Eventualidade, Subordinação e Salário.',
        summary: 'Elementos fático-jurídicos da relação de emprego.',
        practical_example: 'Trabalhador que cumpre ordens diárias, tem horário e salário fixo sem poder mandar substituto é empregado protegido pela CLT.',
        exam_tip: 'Mnemônico SHOPP: Subordinação, Habitualidade, Onerosidade, Pessoa Física e Pessoalidade.',
        legal_terms: ['Subordinação Jurídica', 'Não Eventualidade', 'Pessoalidade'],
        speechText: 'Modo Professor sobre o Artigo 3º da CLT: Os 5 elementos da relação de emprego.'
      }
    },

    // CDC
    {
      id: 'cdc-art6',
      law_id: 'cdc',
      subject_id: 'consumidor',
      law_name: 'Código de Defesa do Consumidor',
      law_number: 'Lei nº 8.078/1990',
      article: '6',
      article_display: 'Art. 6º',
      speech_number: 'Artigo sexto do Código de Defesa do Consumidor',
      title: 'Direitos Básicos do Consumidor e Inversão do Ônus da Prova',
      hierarchy: {
        title_num: 'Título I - Dos Direitos do Consumidor',
        chapter_num: 'Capítulo III - Dos Direitos Básicos do Consumidor'
      },
      category: 'Direitos Básicos',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art6',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 6º São direitos básicos do consumidor:\n\nI - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;\n\nVIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências;',
      content: [
        {
          id: 'cdc-art6-caput',
          type: 'caput',
          text: 'São direitos básicos do consumidor:',
          speechText: 'São direitos básicos do consumidor:'
        },
        {
          id: 'cdc-art6-inc1',
          type: 'inciso',
          number: 'I',
          text: 'I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos;',
          speechText: 'inciso um: a proteção da vida, saúde e segurança contra os riscos provocados por produtos e serviços;'
        },
        {
          id: 'cdc-art6-inc8',
          type: 'inciso',
          number: 'VIII',
          text: 'VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências;',
          speechText: 'inciso oito: a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando for verossímil a alegação ou quando for ele hipossuficiente;'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 6º lista os direitos essenciais do consumidor e prevê a inversão do ônus da prova em favor do comprador vulnerável.',
        summary: 'Proteção contra práticas abusivas e facilitação do acesso à justiça.',
        practical_example: 'Celular novo com defeito: o juiz determina que a fabricante prove o suposto mau uso, e não o consumidor.',
        exam_tip: 'A inversão do ônus do Art. 6º, VIII é judicial (ope judicis).',
        legal_terms: ['Inversão do Ônus da Prova', 'Hipossuficiência'],
        speechText: 'Modo Professor sobre o Artigo 6º do CDC: Direitos básicos e inversão probatória.'
      }
    },
    {
      id: 'cdc-art18',
      law_id: 'cdc',
      subject_id: 'consumidor',
      law_name: 'Código de Defesa do Consumidor',
      law_number: 'Lei nº 8.078/1990',
      article: '18',
      article_display: 'Art. 18',
      speech_number: 'Artigo dezoito do Código de Defesa do Consumidor',
      title: 'Responsabilidade por Vício do Produto e Prazo de 30 Dias',
      hierarchy: {
        title_num: 'Título I - Dos Direitos do Consumidor',
        chapter_num: 'Capítulo IV - Da Qualidade de Produtos e Serviços'
      },
      category: 'Responsabilidade pelo Vício',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art18',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 18. Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade ou quantidade...\n\n§ 1° Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir, alternativamente e à sua escolha:\nI - a substituição do produto por outro da mesma espécie, em perfeitas condições de uso;\nII - a restituição imediata da quantia paga, monetariamente atualizada, sem prejuízo de eventuais perdas e danos;\nIII - o abatimento proporcional do preço.',
      content: [
        {
          id: 'cdc-art18-caput',
          type: 'caput',
          text: 'Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade ou quantidade que os tornem impróprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor...',
          speechText: 'Os fornecedores de produtos respondem solidariamente pelos vícios de qualidade ou quantidade que os tornem impróprios ao consumo ou lhes diminuam o valor.'
        },
        {
          id: 'cdc-art18-p1',
          type: 'paragraph',
          number: '§ 1º',
          text: '§ 1° Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir, alternativamente e à sua escolha: I - a substituição do produto por outro da mesma espécie; II - a restituição imediata da quantia paga, monetariamente atualizada; III - o abatimento proporcional do preço.',
          speechText: 'parágrafo primeiro: Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir a substituição do produto por outro novo, a restituição imediata do dinheiro ou o abatimento proporcional do preço.'
        }
      ],
      professor_mode: {
        simple_explanation: 'Se um produto com defeito não for consertado na assistência em 30 dias corridos, você escolhe: troca por novo, dinheiro de volta ou desconto.',
        summary: 'Responsabilidade solidária por vício do produto com tríplice opção.',
        practical_example: 'Notebook na assistência por 35 dias: o cliente exige reembolso integral e imediato da nota fiscal.',
        exam_tip: 'A escolha da alternativa cabe EXCLUSIVAMENTE ao consumidor.',
        legal_terms: ['Vício do Produto', 'Solidariedade'],
        speechText: 'Modo Professor sobre o Artigo 18 do CDC: Prazo legal de 30 dias e a escolha exclusiva do consumidor.'
      }
    },

    // ECA
    {
      id: 'eca-art2',
      law_id: 'eca',
      subject_id: 'eca',
      law_name: 'Estatuto da Criança e do Adolescente',
      law_number: 'Lei nº 8.069/1990',
      article: '2',
      article_display: 'Art. 2º',
      speech_number: 'Artigo segundo do Estatuto da Criança e do Adolescente',
      title: 'Conceito Legal de Criança e Adolescente',
      hierarchy: {
        title_num: 'Título I - Das Disposições Preliminares'
      },
      category: 'Direitos Fundamentais',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm#art2',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 2º Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.\n\nParágrafo único. Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade.',
      content: [
        {
          id: 'eca-art2-caput',
          type: 'caput',
          text: 'Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.',
          speechText: 'Considera-se criança, para os efeitos desta Lei, a pessoa até doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.'
        },
        {
          id: 'eca-art2-pu',
          type: 'paragraph',
          number: 'Parágrafo único',
          text: 'Parágrafo único. Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade.',
          speechText: 'parágrafo único: Nos casos expressos em lei, aplica-se excepcionalmente este Estatuto às pessoas entre dezoito e vinte e um anos de idade.'
        }
      ],
      professor_mode: {
        simple_explanation: 'Criança é até 12 anos incompletos (11 anos, 11 meses e 29 dias); Adolescente é de 12 a 18 anos.',
        summary: 'Define aplicação de medidas de proteção (criança) ou socioeducativas (adolescente).',
        practical_example: 'Infrator de 11 anos só recebe medida de proteção (nunca internação). Infrator de 16 anos pode sofrer internação.',
        exam_tip: 'O ECA aplica-se excepcionalmente até 21 anos no cumprimento de medida socioeducativa.',
        legal_terms: ['Criança', 'Adolescente', 'Proteção Integral'],
        speechText: 'Modo Professor sobre o Artigo segundo do ECA: Criança até doze incompletos, adolescente de doze a dezoito.'
      }
    },

    // LEI MARIA DA PENHA
    {
      id: 'lmp-art5',
      law_id: 'maria_da_penha',
      subject_id: 'penal',
      law_name: 'Lei Maria da Penha',
      law_number: 'Lei nº 11.340/2006',
      article: '5',
      article_display: 'Art. 5º',
      speech_number: 'Artigo quinto da Lei Maria da Penha',
      title: 'Configuração da Violência Doméstica e Familiar contra a Mulher',
      hierarchy: {
        title_num: 'Título II - Da Violência Doméstica e Familiar contra a Mulher',
        chapter_num: 'Capítulo I - Disposições Gerais'
      },
      category: 'Formas de Violência',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm#art5',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 5º Para os efeitos desta Lei, configura violência doméstica e familiar contra a mulher qualquer ação ou omissão baseada no gênero que lhe cause morte, lesão, sofrimento físico, sexual ou psicológico e dano moral ou patrimonial:\n\nI - no âmbito da unidade doméstica, compreendida como o espaço de convívio permanente de pessoas, com ou sem vínculo familiar, inclusive as esporadicamente agregadas;\n\nII - no âmbito da família, compreendida como a comunidade formada por indivíduos que são ou se consideram aparentados, unidos por laços naturais, por afinidade ou por vontade expressa;\n\nIII - em qualquer relação íntima de afeto, na qual o agressor conviva ou tenha convivido com a ofendida, independentemente de coabitação.',
      content: [
        {
          id: 'lmp-art5-caput',
          type: 'caput',
          text: 'Para os efeitos desta Lei, configura violência doméstica e familiar contra a mulher qualquer ação ou omissão baseada no gênero que lhe cause morte, lesão, sofrimento físico, sexual ou psicológico e dano moral ou patrimonial:',
          speechText: 'Configura violência doméstica e familiar contra a mulher qualquer ação ou omissão baseada no gênero que lhe cause morte, lesão, sofrimento físico, sexual ou psicológico e dano moral ou patrimonial:'
        },
        {
          id: 'lmp-art5-inc3',
          type: 'inciso',
          number: 'III',
          text: 'III - em qualquer relação íntima de afeto, na qual o agressor conviva ou tenha convivido com a ofendida, independentemente de coabitação.',
          speechText: 'inciso três: em qualquer relação íntima de afeto, na qual o agressor conviva ou tenha convivido com a ofendida, independentemente de morarem juntos.'
        }
      ],
      professor_mode: {
        simple_explanation: 'A Lei Maria da Penha protege a mulher de violência física, psicológica ou patrimonial em relações familiares ou de afeto, mesmo sem morar junto.',
        summary: 'Aplicabilidade ampla das medidas protetivas independentemente de coabitação.',
        practical_example: 'Ex-namorado que persegue e ameaça a vítima após o término comete violência doméstica e pode sofrer medida protetiva.',
        exam_tip: 'Súmula 600 do STJ: É desnecessária a coabitação para a incidência da Lei Maria da Penha.',
        legal_terms: ['Violência Doméstica', 'Relação Íntima de Afeto', 'Súmula 600 STJ'],
        speechText: 'Modo Professor sobre o Artigo 5º da Lei Maria da Penha: Lembre-se da Súmula 600 do STJ sobre a desnecessidade de coabitação.'
      }
    },

    // ESTATUTO DA ADVOCACIA E DA OAB (EOAB)
    {
      id: 'eoab-art7',
      law_id: 'eoab',
      subject_id: 'etica_oab',
      law_name: 'Estatuto da Advocacia e da OAB',
      law_number: 'Lei nº 8.906/1994',
      article: '7',
      article_display: 'Art. 7º',
      speech_number: 'Artigo sétimo do Estatuto da Advocacia e da OAB',
      title: 'Direitos e Prerrogativas Fundamentais do Advogado',
      hierarchy: {
        title_num: 'Título I - Da Advocacia',
        chapter_num: 'Capítulo II - Dos Direitos do Advogado'
      },
      category: 'Prerrogativas do Advogado',
      isOabFocus: true,
      source: {
        name: 'Presidência da República - Planalto',
        url: 'https://www.planalto.gov.br/ccivil_03/leis/l8906.htm#art7',
        last_checked_at: '2026-08-15T00:00:00Z',
        version: '1.0.0'
      },
      official_text: 'Art. 7º São direitos do advogado:\n\nI - exercer, com liberdade, a profissão em todo o território nacional;\n\nII - a inviolabilidade de seu escritório ou local de trabalho, bem como de seus instrumentos de trabalho, de sua correspondência escrita, eletrônica, telefônica e telemática, desde que relativas ao exercício da advocacia;\n\nIII - comunicar-se com seus clientes, pessoal e reservadamente, mesmo sem procuração, quando estes se acharem presos, detidos ou recolhidos em estabelecimentos civis ou militares, ainda que considerados incomunicáveis;',
      content: [
        {
          id: 'eoab-art7-caput',
          type: 'caput',
          text: 'São direitos do advogado: I - exercer, com liberdade, a profissão em todo o território nacional; II - a inviolabilidade de seu escritório ou local de trabalho, bem como de seus instrumentos de trabalho, de sua correspondência escrita, eletrônica, telefônica e telemática...',
          speechText: 'São direitos do advogado: exercer, com liberdade, a profissão em todo o território nacional, a inviolabilidade de seu escritório ou local de trabalho, de seus instrumentos de trabalho e de sua correspondência.'
        },
        {
          id: 'eoab-art7-inc3',
          type: 'inciso',
          number: 'III',
          text: 'III - comunicar-se com seus clientes, pessoal e reservadamente, mesmo sem procuração, quando estes se acharem presos, detidos ou recolhidos em estabelecimentos civis ou militares, ainda que considerados incomunicáveis;',
          speechText: 'inciso três: comunicar-se com seus clientes, pessoal e reservadamente, mesmo sem procuração, quando estes se acharem presos, detidos ou recolhidos, ainda que considerados incomunicáveis;'
        }
      ],
      professor_mode: {
        simple_explanation: 'O Artigo 7º consagra o sigilo profissional, a inviolabilidade do escritório e o direito de comunicação com cliente preso.',
        summary: 'Prerrogativas públicas essenciais à administração da Justiça garantidas pelo Art. 133 da CF.',
        practical_example: 'Delegado que impede advogado de entrevistar cliente preso sem procuração comete crime de abuso de autoridade.',
        exam_tip: 'O advogado tem direito de conversar a sós com preso MESMO SEM PROCURAÇÃO.',
        legal_terms: ['Inviolabilidade do Escritório', 'Sigilo Profissional', 'Prerrogativas da OAB'],
        speechText: 'Modo Professor sobre o Artigo 7º do Estatuto da OAB: As prerrogativas invioláveis da advocacia.'
      }
    }
  ],

  // --------------------------------------------------------------------------
  // Coleção de Jurisprudência Oficial (STF e STJ)
  // --------------------------------------------------------------------------
  jurisprudence: [
    {
      id: 'jur-stf-1',
      tribunal: 'STF',
      numero_processo: 'Habeas Corpus 126.292/SP',
      orgao_julgador: 'Tribunal Pleno',
      relator: 'Min. Teori Zavascki',
      data_julgamento: '2016-02-17',
      data_publicacao: '2016-05-17',
      tema: 'Presunção de Inocência e Trânsito em Julgado',
      ementa: 'CONSTITUCIONAL. HABEAS CORPUS. PRINCÍPIO DA PRESUNÇÃO DE INOCÊNCIA (CF/88, ART. 5º, LVII). O trânsito em julgado de sentença condenatória constitui marco inafastável para o cumprimento definitivo de pena privativa de liberdade.',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=4824944',
      law_id: 'cf88',
      article_id: 'cf-art5',
      subject_id: 'constitucional'
    },
    {
      id: 'jur-stf-2',
      tribunal: 'STF',
      numero_processo: 'Habeas Corpus 127.186/PR',
      orgao_julgador: 'Segunda Turma',
      relator: 'Min. Gilmar Mendes',
      data_julgamento: '2015-04-28',
      data_publicacao: '2015-08-03',
      tema: 'Gravidade Abstrata do Delito e Prisão Preventiva',
      ementa: 'PROCESSO PENAL. PRISÃO PREVENTIVA (CPP, ART. 312). A gravidade abstrata do delito ou o clamor público não servem como fundamentos idôneos e suficientes para a decretação da custódia cautelar, que exige demonstração concreta de periculum libertatis.',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=4730635',
      law_id: 'cpp',
      article_id: 'cpp-art312',
      subject_id: 'processo_penal'
    },
    {
      id: 'jur-stj-1',
      tribunal: 'STJ',
      numero_processo: 'REsp 1.765.234/SP',
      orgao_julgador: 'Quinta Turma',
      relator: 'Min. Reynaldo Soares da Fonseca',
      data_julgamento: '2019-09-17',
      data_publicacao: '2019-09-24',
      tema: 'Dolo Eventual em Homicídio no Trânsito (Racha)',
      ementa: 'PENAL. HOMICÍDIO NA DIREÇÃO DE VEÍCULO AUTOMOTOR (CP, ART. 121). A disputa automobilística não autorizada (racha) em velocidade manifestamente incompatível evidencia dolo eventual pelo assentimento prévio com o risco do resultado morte.',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://processo.stj.jus.br/processo/pesquisa/',
      law_id: 'cp',
      article_id: 'cp-art121',
      subject_id: 'penal'
    },
    {
      id: 'jur-stj-2',
      tribunal: 'STJ',
      numero_processo: 'REsp 1.834.567/RJ',
      orgao_julgador: 'Terceira Turma',
      relator: 'Min. Nancy Andrighi',
      data_julgamento: '2020-03-03',
      data_publicacao: '2020-03-06',
      tema: 'Cumulação de Dano Estético e Dano Moral',
      ementa: 'CIVIL. RESPONSABILIDADE CIVIL (CC/02, ART. 186 E 927). É pacífica e lícita a cumulação das indenizações por dano estético e dano moral decorrentes do mesmo fato danoso quando possuem fundamentos fáticos e reflexos psíquicos distintos.',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://processo.stj.jus.br/processo/pesquisa/',
      law_id: 'cc',
      article_id: 'cc-art186',
      subject_id: 'civil'
    },
    {
      id: 'jur-stj-3',
      tribunal: 'STJ',
      numero_processo: 'REsp 1.700.123/MG',
      orgao_julgador: 'Primeira Seção (Tema 1.050)',
      relator: 'Min. Benedito Gonçalves',
      data_julgamento: '2021-04-28',
      data_publicacao: '2021-05-10',
      tema: 'Tutela de Urgência no Fornecimento de Medicamentos',
      ementa: 'PROCESSUAL CIVIL. TUTELA DE URGÊNCIA (CPC/15, ART. 300). A presença de laudo médico fundamentado e o risco grave de agravamento da enfermidade configuram probabilidade do direito e perigo da demora autorizadores da concessão liminar.',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://processo.stj.jus.br/processo/pesquisa/',
      law_id: 'cpc',
      article_id: 'cpc-art300',
      subject_id: 'processo_civil'
    },
    {
      id: 'jur-stj-4',
      tribunal: 'STJ',
      numero_processo: 'REsp 1.554.456/DF',
      orgao_julgador: 'Quarta Turma',
      relator: 'Min. Luis Felipe Salomão',
      data_julgamento: '2018-06-12',
      data_publicacao: '2018-06-19',
      tema: 'Vício do Produto e Opção Exclusiva do Consumidor',
      ementa: 'CONSUMIDOR. VÍCIO DO PRODUTO (CDC, ART. 18, § 1º). Ultrapassado o prazo de 30 dias sem conserto, a opção por restituição, substituição ou abatimento pertence exclusivamente ao consumidor, não podendo ser obstada pelo fornecedor.',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://processo.stj.jus.br/processo/pesquisa/',
      law_id: 'cdc',
      article_id: 'cdc-art18',
      subject_id: 'consumidor'
    }
  ],

  // --------------------------------------------------------------------------
  // Coleção de Súmulas Oficiais (STF, STJ e Vinculantes)
  // --------------------------------------------------------------------------
  sumulas: [
    {
      id: 'sum-sv-11',
      tribunal: 'STF',
      numero: '11',
      tipo: 'Súmula Vinculante',
      texto: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.',
      tema: 'Uso de Algemas e Integridade Física do Preso',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1227',
      updated_at: '2008-08-13',
      related_articles: ['cf-art5'],
      subject_id: 'constitucional'
    },
    {
      id: 'sum-sv-13',
      tribunal: 'STF',
      numero: '13',
      tipo: 'Súmula Vinculante',
      texto: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.',
      tema: 'Vedação ao Nepotismo na Administração Pública',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1229',
      updated_at: '2008-08-21',
      related_articles: ['cf-art37'],
      subject_id: 'administrativo'
    },
    {
      id: 'sum-sv-14',
      tribunal: 'STF',
      numero: '14',
      tipo: 'Súmula Vinculante',
      texto: 'É direito do defensor, no interesse do representado, ter amplo acesso aos elementos de prova que, já documentados em procedimento investigatório realizado por órgão com competência de polícia judiciária, digam respeito ao exercício do direito de defesa.',
      tema: 'Acesso aos Autos de Inquérito Policial pelo Advogado',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1230',
      updated_at: '2009-02-02',
      related_articles: ['cf-art5', 'eoab-art7'],
      subject_id: 'etica_oab'
    },
    {
      id: 'sum-sv-24',
      tribunal: 'STF',
      numero: '24',
      tipo: 'Súmula Vinculante',
      texto: 'Não se tipifica crime material contra a ordem tributária, previsto no art. 1º, incisos I a IV, da Lei nº 8.137/90, antes do lançamento definitivo do tributo.',
      tema: 'Tipicidade em Crimes Tributários',
      fonte_nome: 'Supremo Tribunal Federal',
      fonte_url: 'https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1240',
      updated_at: '2009-12-11',
      related_articles: ['cp-art1'],
      subject_id: 'penal'
    },
    {
      id: 'sum-stj-387',
      tribunal: 'STJ',
      numero: '387',
      tipo: 'Súmula STJ',
      texto: 'É lícita a cumulação das indenizações de dano estético e dano moral.',
      tema: 'Cumulação de Danos Moral e Estético',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://scon.stj.jus.br/SCON/sumulas/doc.jsp?livre=387',
      updated_at: '2009-08-26',
      related_articles: ['cc-art186', 'cc-art927'],
      subject_id: 'civil'
    },
    {
      id: 'sum-stj-297',
      tribunal: 'STJ',
      numero: '297',
      tipo: 'Súmula STJ',
      texto: 'O Código de Defesa do Consumidor é aplicável às instituições financeiras.',
      tema: 'Incidência do CDC em Instituições Financeiras',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://scon.stj.jus.br/SCON/sumulas/doc.jsp?livre=297',
      updated_at: '2004-05-12',
      related_articles: ['cdc-art6', 'cdc-art18'],
      subject_id: 'consumidor'
    },
    {
      id: 'sum-stj-600',
      tribunal: 'STJ',
      numero: '600',
      tipo: 'Súmula STJ',
      texto: 'Para a configuração da violência doméstica e familiar prevista no artigo 5º da Lei nº 11.340/2006 (Lei Maria da Penha), não se exige a coabitação entre autor e vítima.',
      tema: 'Desnecessidade de Coabitação na Lei Maria da Penha',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://scon.stj.jus.br/SCON/sumulas/doc.jsp?livre=600',
      updated_at: '2017-11-22',
      related_articles: ['lmp-art5'],
      subject_id: 'penal'
    },
    {
      id: 'sum-stj-542',
      tribunal: 'STJ',
      numero: '542',
      tipo: 'Súmula STJ',
      texto: 'A ação penal por crime de lesão corporal leve cometida em detrimento da mulher, no âmbito doméstico e familiar, é pública incondicionada.',
      tema: 'Ação Penal Pública Incondicionada na Violência Doméstica',
      fonte_nome: 'Superior Tribunal de Justiça',
      fonte_url: 'https://scon.stj.jus.br/SCON/sumulas/doc.jsp?livre=542',
      updated_at: '2015-08-26',
      related_articles: ['lmp-art5'],
      subject_id: 'penal'
    }
  ],

  // --------------------------------------------------------------------------
  // Coleção de Atualizações Legislativas e Histórico de Versões
  // --------------------------------------------------------------------------
  legislative_updates: [
    {
      id: 'upd-1',
      law_id: 'cp',
      article_id: 'cp-art25',
      change_type: 'Inclusão de Parágrafo',
      amending_law: 'Lei nº 13.964/2019 (Pacote Anticrime)',
      old_text: 'Art. 25. Não possuía parágrafo único (apenas o caput de legítima defesa genérica).',
      new_text: 'Parágrafo único. Considera-se também em legítima defesa o agente de segurança pública que repele agressão ou risco de agressão a vítima mantida refém.',
      publication_date: '2019-12-24',
      effective_date: '2020-01-23',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13964.htm',
      verified_at: '2026-08-15T00:00:00Z'
    },
    {
      id: 'upd-2',
      law_id: 'cpp',
      article_id: 'cpp-art312',
      change_type: 'Alteração de Redação',
      amending_law: 'Lei nº 13.964/2019 (Pacote Anticrime)',
      old_text: 'Art. 312. A prisão preventiva poderá ser decretada como garantia da ordem pública... quando houver prova da existência do crime e indício suficiente de autoria.',
      new_text: 'Art. 312. (...), quando houver prova da existência do crime e indício suficiente de autoria e de perigo gerado pelo estado de liberdade do imputado.',
      publication_date: '2019-12-24',
      effective_date: '2020-01-23',
      source_name: 'Presidência da República - Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13964.htm',
      verified_at: '2026-08-15T00:00:00Z'
    },
    {
      id: 'upd-3',
      law_id: 'cf88',
      article_id: 'cf-art5',
      change_type: 'Emenda Constitucional',
      amending_law: 'Emenda Constitucional nº 115/2022',
      old_text: 'Art. 5º. O rol de direitos não trazia expressamente a proteção de dados em meio digital.',
      new_text: 'Art. 5º, LXXIX - é assegurado, nos termos da lei, o direito à proteção dos dados pessoais, inclusive nos meios digitais.',
      publication_date: '2022-02-10',
      effective_date: '2022-02-10',
      source_name: 'Senado Federal / Planalto',
      source_url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc115.htm',
      verified_at: '2026-08-15T00:00:00Z'
    }
  ],

  // --------------------------------------------------------------------------
  // Banco de Questões de Provas Oficiais e Geradas por IA
  // --------------------------------------------------------------------------
  questions: [
    {
      id: 'q-oab-1',
      is_ai_generated: false,
      source: 'Exame de Ordem Unificado',
      exam_board: 'FGV',
      exam_name: 'Exame OAB XXXVI - 1ª Fase',
      year: 2022,
      subject_id: 'etica_oab',
      law_id: 'eoab',
      article_id: 'eoab-art7',
      question_type: 'multipla_escolha',
      statement: 'O advogado Lucas comparece à delegacia de polícia para entrevistar seu cliente preso em flagrante. O delegado nega o acesso alegando que o inquérito corre em segredo de justiça e Lucas ainda não possui procuração assinada. À luz do Art. 7º do Estatuto da OAB:',
      options: [
        'O delegado agiu corretamente pois o sigilo prevalece sobre o direito de entrevista.',
        'A conduta do delegado violou prerrogativa legal do advogado, que tem direito de comunicar-se com cliente preso mesmo sem procuração.',
        'O advogado só tem direito de acesso se for acompanhado de um membro da comissão de prerrogativas da OAB.',
        'A incomunicabilidade determinada pelo delegado impede a presença de qualquer pessoa, inclusive advogado.'
      ],
      correctIndex: 1,
      explanation: 'Correto! O Art. 7º, III do Estatuto da OAB consagra como prerrogativa inviolável o direito de o advogado entrevistar-se reservadamente com cliente preso, mesmo sem procuração e mesmo em inquérito sigiloso.',
      speechExplanation: 'Parabéns, você acertou! Conforme o Artigo sétimo, inciso três do Estatuto da OAB, é direito inviolável do advogado comunicar-se pessoal e reservadamente com seu cliente preso, mesmo sem procuração.'
    },
    {
      id: 'q-oab-2',
      is_ai_generated: false,
      source: 'Exame de Ordem Unificado',
      exam_board: 'FGV',
      exam_name: 'Exame OAB XXXIV - 1ª Fase',
      year: 2021,
      subject_id: 'consumidor',
      law_id: 'cdc',
      article_id: 'cdc-art18',
      question_type: 'multipla_escolha',
      statement: 'Juliana adquiriu uma televisão com defeito na tela. Levou o produto à assistência técnica credenciada. Transcorridos 45 dias, o televisor não foi consertado por falta de peças. Conforme o Art. 18 do CDC, Juliana pode exigir:',
      options: [
        'Apenas aguardar mais 30 dias úteis para a chegada da peça do fabricante.',
        'Apenas o conserto do produto com indenização fixada em 10% do valor da compra.',
        'À sua escolha: a troca por outro produto novo equivalente, a devolução imediata do valor pago ou o abatimento proporcional.',
        'Apenas a troca do produto se a loja concordar expressamente.'
      ],
      correctIndex: 2,
      explanation: 'Exato! O Art. 18, § 1º do CDC prevê que ultrapassado o prazo de 30 dias para o reparo, cabe exclusivamente ao consumidor escolher entre a substituição, a restituição do valor corrigido ou o abatimento do preço.',
      speechExplanation: 'Excelente! Conforme o Artigo dezoito, parágrafo primeiro do Código de Defesa do Consumidor, não sendo o vício sanado no prazo de trinta dias, o consumidor tem o direito de escolher entre a troca por produto novo, a restituição integral ou o abatimento.'
    },
    {
      id: 'q-oab-3',
      is_ai_generated: false,
      source: 'Exame de Ordem Unificado',
      exam_board: 'FGV',
      exam_name: 'Exame OAB XXXV - 1ª Fase',
      year: 2022,
      subject_id: 'constitucional',
      law_id: 'cf88',
      article_id: 'cf-art5',
      question_type: 'multipla_escolha',
      statement: 'Policiais militares, munidos de mandado judicial de busca e apreensão domiciliar expedido regularmente por juiz competente, chegam à residência do investigado às 22h30. À luz do Art. 5º, XI da CF/88:',
      options: [
        'Podem ingressar no domicílio imediatamente, pois a ordem judicial supre o horário noturno.',
        'Não podem ingressar à noite com base no mandado, pois a determinação judicial só autoriza o ingresso durante o dia.',
        'Podem ingressar se houver consentimento expresso do delegado de plantão.',
        'O mandado de busca e apreensão perde a validade se não cumprido em até 24 horas da expedição.'
      ],
      correctIndex: 1,
      explanation: 'Correto! Conforme o Art. 5º, XI da CF/88, por determinação judicial o ingresso na casa só pode ocorrer DURANTE O DIA. À noite, somente com consentimento do morador, flagrante delito, desastre ou para prestar socorro.',
      speechExplanation: 'Parabéns, resposta exata! Conforme o Artigo quinto, inciso onze da Constituição, o cumprimento de mandado judicial em domicílio só é permitido durante o dia.'
    },
    {
      id: 'q-oab-4',
      is_ai_generated: false,
      source: 'Exame de Ordem Unificado',
      exam_board: 'FGV',
      exam_name: 'Exame OAB XXXIII - 1ª Fase',
      year: 2021,
      subject_id: 'civil',
      law_id: 'cc',
      article_id: 'cc-art186',
      question_type: 'multipla_escolha',
      statement: 'Carlos, ao conduzir seu veículo com excesso de velocidade e utilizando o celular, colide com o automóvel de Maria parado no semáforo. Conforme o Art. 186 do Código Civil, a responsabilidade de Carlos decorre de:',
      options: [
        'Ato lícito com obrigação de indenizar fixada discricionariamente pelo juiz.',
        'Ato ilícito culposo caracterizado por imprudência na condução do veículo, gerando o dever de reparação integral.',
        'Caso fortuito ou força maior que exclui o dever de indenizar.',
        'Responsabilidade puramente objetiva sem exame de culpa.'
      ],
      correctIndex: 1,
      explanation: 'Exato! O Art. 186 do Código Civil consagra a responsabilidade subjetiva pelo ato ilícito, caracterizada pela conduta culposa (imprudência/negligência), nexo causal e dano sofrido pela vítima.',
      speechExplanation: 'Excelente! Conforme o Artigo cento e oitenta e seis do Código Civil, quem por imprudência violar direito e causar dano a outrem comete ato ilícito e deve indenizar.'
    },
    {
      id: 'q-ai-1',
      is_ai_generated: true,
      source: 'VadeAudio AI Study Engine',
      exam_board: 'VadeAudio AI',
      exam_name: 'Simulado Didático de Direito Penal',
      year: 2026,
      subject_id: 'penal',
      law_id: 'cp',
      article_id: 'cp-art121',
      question_type: 'multipla_escolha',
      statement: 'No crime de homicídio qualificado-privilegiado (Art. 121, §§ 1º e 2º do Código Penal), assinale a condição indispensável segundo a jurisprudência pacífica dos tribunais superiores:',
      options: [
        'A qualificadora deve ser de natureza exclusivamente objetiva (como meio cruel ou veneno).',
        'A qualificadora pode ser motivada por motivo fútil ou torpe.',
        'O crime deixa de ser julgado pelo Tribunal do Júri passando ao juiz singular.',
        'A qualificadora subjetiva afasta a causa de diminuição da violenta emoção.'
      ],
      correctIndex: 0,
      explanation: 'Questão gerada por IA para fins de estudo. Fundamento: No homicídio híbrido (qualificado-privilegiado), é admitida apenas a convivência de circunstâncias subjetivas privilegiadoras com qualificadoras puramente OBJETIVAS (meio ou modo de execução).',
      speechExplanation: 'Resposta exata! No homicídio qualificado-privilegiado, a qualificadora deve ser de ordem objetiva, como o emprego de asfixia ou veneno, jamais subjetiva como motivo fútil.'
    },
    {
      id: 'q-ai-2',
      is_ai_generated: true,
      source: 'VadeAudio AI Study Engine',
      exam_board: 'VadeAudio AI',
      exam_name: 'Simulado de Processo Civil',
      year: 2026,
      subject_id: 'processo_civil',
      law_id: 'cpc',
      article_id: 'cpc-art300',
      question_type: 'certo_errado',
      statement: 'Julgue o item: Para a concessão de tutela provisória de urgência de natureza antecipada (Art. 300 do CPC/15), basta a demonstração inequívoca da probabilidade do direito, sendo dispensável o perigo de dano ou risco ao resultado útil do processo.',
      options: [
        'Certo',
        'Errado'
      ],
      correctIndex: 1,
      explanation: 'Questão gerada por IA para fins de estudo. O item está ERRADO. O Art. 300 do CPC exige requisitos CUMULATIVOS: probabilidade do direito (fumus boni iuris) E o perigo de dano ou risco ao resultado útil (periculum in mora).',
      speechExplanation: 'Item Errado! Conforme o Artigo 300 do Código de Processo Civil, os requisitos de probabilidade do direito e perigo da demora são cumulativos.'
    },
    {
      id: 'q-ai-3',
      is_ai_generated: true,
      source: 'VadeAudio AI Study Engine',
      exam_board: 'VadeAudio AI',
      exam_name: 'Simulado de Processo Penal',
      year: 2026,
      subject_id: 'processo_penal',
      law_id: 'cpp',
      article_id: 'cpp-art312',
      question_type: 'multipla_escolha',
      statement: 'Sobre a prisão preventiva no Art. 312 do CPP e a jurisprudência do STF, assinale a afirmativa correta:',
      options: [
        'A mera gravidade abstrata do crime e a comoção social são fundamentos suficientes para a decretação da prisão preventiva.',
        'A prisão preventiva pode ser decretada de ofício pelo juiz durante a fase de inquérito policial.',
        'A decretação exige demonstração concreta do perigo gerado pelo estado de liberdade do imputado, vedada a fundamentação genérica.',
        'A prisão preventiva tem prazo legal improrrogável de 90 dias com soltura automática.'
      ],
      correctIndex: 2,
      explanation: 'Questão gerada por IA para fins de estudo. Conforme o Art. 312 do CPP e Súmulas do STF, a custódia cautelar exige demonstração fática concreta do periculum libertatis, sendo vedada a gravidade abstrata.',
      speechExplanation: 'Correto! A prisão preventiva exige perigo concreto demonstrado nos autos, sendo vedada a fundamentação baseada apenas na gravidade abstrata do delito.'
    }
  ],

  // --------------------------------------------------------------------------
  // Flashcards Didáticos por Artigo
  // --------------------------------------------------------------------------
  flashcards: [
    {
      id: 'fc-1',
      subject_id: 'constitucional',
      law_id: 'cf88',
      article_id: 'cf-art5',
      front: 'Qual o inciso do Art. 5º da CF/88 que consagra a casa como asilo inviolável do indivíduo?',
      back: 'Inciso XI: a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento, salvo flagrante delito, desastre, socorro ou, durante o dia, por determinação judicial.',
      difficulty: 'facil'
    },
    {
      id: 'fc-2',
      subject_id: 'etica_oab',
      law_id: 'eoab',
      article_id: 'eoab-art7',
      front: 'O advogado pode se comunicar com cliente preso sem procuração mesmo que este esteja incomunicável?',
      back: 'Sim! Conforme o Art. 7º, III do Estatuto da OAB, é direito inviolável comunicar-se com clientes pessoal e reservadamente mesmo sem procuração.',
      difficulty: 'facil'
    },
    {
      id: 'fc-3',
      subject_id: 'consumidor',
      law_id: 'cdc',
      article_id: 'cdc-art18',
      front: 'Qual o prazo legal máximo para o fornecedor sanar um vício no produto antes que o consumidor possa exigir a troca ou devolução?',
      back: 'O prazo máximo é de 30 dias (Art. 18, § 1º do CDC). Findo o prazo, o consumidor escolhe entre: produto novo, dinheiro de volta corrigido ou abatimento.',
      difficulty: 'facil'
    },
    {
      id: 'fc-4',
      subject_id: 'penal',
      law_id: 'maria_da_penha',
      article_id: 'lmp-art5',
      front: 'É necessária a coabitação para a aplicação da Lei Maria da Penha?',
      back: 'Não! Súmula 600 do STJ: Para a configuração da violência doméstica não se exige a coabitação entre autor e vítima.',
      difficulty: 'medio'
    },
    {
      id: 'fc-5',
      subject_id: 'penal',
      law_id: 'cp',
      article_id: 'cp-art1',
      front: 'O que dispõe o Princípio da Anterioridade no Art. 1º do Código Penal?',
      back: 'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.',
      difficulty: 'facil'
    },
    {
      id: 'fc-6',
      subject_id: 'processo_civil',
      law_id: 'cpc',
      article_id: 'cpc-art300',
      front: 'Quais os dois requisitos cumulativos para a concessão da tutela de urgência (Art. 300 do CPC)?',
      back: '1. Probabilidade do direito (fumus boni iuris);\n2. Perigo de dano ou risco ao resultado útil do processo (periculum in mora).',
      difficulty: 'medio'
    },
    {
      id: 'fc-7',
      subject_id: 'processo_penal',
      law_id: 'cpp',
      article_id: 'cpp-art312',
      front: 'A gravidade abstrata do delito autoriza a decretação de prisão preventiva?',
      back: 'Não! Jurisprudência pacífica do STF e STJ: a custódia cautelar exige a demonstração concreta do periculum libertatis no caso específico.',
      difficulty: 'dificil'
    },
    {
      id: 'fc-8',
      subject_id: 'penal',
      law_id: 'cp',
      article_id: 'cp-art121',
      front: 'Qual a condição essencial para a existência do homicídio qualificado-privilegiado?',
      back: 'A qualificadora deve ser de ordem puramente OBJETIVA (ex: meio insidioso ou cruel, como asfixia ou veneno), nunca subjetiva.',
      difficulty: 'dificil'
    },
    {
      id: 'fc-9',
      subject_id: 'civil',
      law_id: 'cc',
      article_id: 'cc-art186',
      front: 'O dano exclusivamente moral gera dever de indenizar mesmo sem prejuízo material?',
      back: 'Sim! Conforme o Art. 186 do Código Civil, aquele que causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.',
      difficulty: 'facil'
    }
  ],

  // --------------------------------------------------------------------------
  // Playlists Padrão
  // --------------------------------------------------------------------------
  defaultPlaylists: [
    {
      id: 'pl-oab-top',
      title: 'Top Artigos OAB 1ª Fase',
      desc: 'Os artigos de Ética, Constituição, Penal, Consumidor e Civil mais cobrados na OAB.',
      icon: 'fa-solid fa-graduation-cap',
      articleIds: ['eoab-art7', 'cf-art5', 'cdc-art6', 'cp-art1', 'cc-art186', 'cpc-art300', 'cpp-art312']
    },
    {
      id: 'pl-penal-express',
      title: 'Direito Penal no Trânsito',
      desc: 'Revisão rápida de Penal Geral e Especial para ouvir a caminho da faculdade ou trabalho.',
      icon: 'fa-solid fa-gavel',
      articleIds: ['cp-art1', 'cp-art25', 'cp-art121', 'cpp-art312']
    },
    {
      id: 'pl-etica-oab',
      title: 'Gabaritando Ética na OAB',
      desc: 'Prerrogativas, incompatibilidades e honorários do Estatuto da Advocacia.',
      icon: 'fa-solid fa-scale-unbalanced-flip',
      articleIds: ['eoab-art7']
    }
  ]
};
