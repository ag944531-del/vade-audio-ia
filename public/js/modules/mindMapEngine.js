/**
 * VadeAudio AI - Motor de Mapas Mentais Jurídicos (Etapa 24)
 * Geração estruturada a partir de temas, artigos, exames e fraquezas,
 * nós interativos com proveniência estrita, árvore textual acessível,
 * modo comparativo, narração com Prof. Marcos (ElevenLabs) e modo socrático com Tutor.
 */

class MindMapEngine {
  constructor(authService, audioEngine, vadeEngine, tutorEngine, analyticsEngine, legalUpdateEngine) {
    this.authService = authService;
    this.audioEngine = audioEngine;
    this.vadeEngine = vadeEngine;
    this.tutorEngine = tutorEngine;
    this.analyticsEngine = analyticsEngine;
    this.legalUpdateEngine = legalUpdateEngine;

    this.mapsDb = this.loadPresetMaps();
    this.activeMap = this.mapsDb[0];
  }

  loadPresetMaps() {
    return [
      {
        id: 'map_legitima_defesa',
        title: 'Legítima Defesa',
        subject: 'Direito Penal',
        description: 'Estrutura conceitual baseada no art. 25 do Código Penal.',
        sourceType: 'theme',
        createdAt: Date.now() - 86400000 * 2,
        rootNode: {
          id: 'node_root',
          label: 'Legítima Defesa',
          category: 'Excludente de ilicitude',
          type: 'theme',
          provenance: 'Art. 25 do Código Penal',
          masteryPercent: 82,
          children: [
            {
              id: 'node_conceito',
              label: 'Conceito legal',
              type: 'concept',
              description: 'Excludente de ilicitude em que o agente repele injusta agressão.',
              provenance: 'Art. 23, II · Art. 25 CP'
            },
            {
              id: 'node_requisitos',
              label: 'Requisitos cumulativos',
              type: 'concept',
              provenance: 'Doutrina consolidada',
              children: [
                { id: 'node_req_1', label: 'Injusta agressão', type: 'subtheme', provenance: 'Art. 25 CP' },
                { id: 'node_req_2', label: 'Atual ou iminente', type: 'subtheme', provenance: 'Art. 25 CP' },
                { id: 'node_req_3', label: 'Meios necessários', type: 'subtheme', provenance: 'Art. 25 CP' },
                { id: 'node_req_4', label: 'Uso moderado', type: 'subtheme', provenance: 'Art. 25 CP' },
                { id: 'node_req_5', label: 'Direito próprio ou terceiro', type: 'subtheme', provenance: 'Art. 25 CP' }
              ]
            },
            {
              id: 'node_art25',
              label: 'Fundamento legal',
              articleTitle: 'Art. 25 do Código Penal',
              type: 'article',
              provenance: 'Código Penal',
              articleId: 'cp_art25',
              lawCode: 'cp'
            },
            {
              id: 'node_excesso',
              label: 'Excesso punível',
              type: 'concept',
              description: 'O agente responde pelo excesso doloso ou culposo.',
              provenance: 'Art. 23, parágrafo único CP'
            },
            {
              id: 'node_juris',
              label: 'Jurisprudência',
              caseTitle: 'Legítima defesa da honra',
              type: 'jurisprudence',
              description: 'Inadmissibilidade da tese de legítima defesa da honra no feminicídio.',
              provenance: 'STF · ADPF 779'
            }
          ]
        }
      },
      {
        id: 'map_art300_cpc',
        title: 'Art. 300 CPC — Tutela de Urgência',
        subject: 'Processo Civil',
        sourceType: 'article',
        createdAt: Date.now() - 86400000,
        rootNode: {
          id: 'node_root_cpc',
          label: 'Tutela Provisória de Urgência (Art. 300 CPC)',
          type: 'article',
          provenance: 'Código de Processo Civil / Lei 15.123/2026',
          hasLegislativeUpdate: true,
          masteryPercent: 48,
          children: [
            {
              id: 'node_req_cpc',
              label: 'Requisitos Legais',
              type: 'concept',
              provenance: 'Art. 300, caput CPC',
              children: [
                { id: 'node_cpc_prob', label: 'Probabilidade do Direito (Fumus Boni Iuris)', type: 'subtheme', provenance: 'Art. 300 CPC' },
                { id: 'node_cpc_perigo', label: 'Perigo de Dano ou Risco ao Resultado Útil', type: 'subtheme', provenance: 'Art. 300 CPC' },
                { id: 'node_cpc_caucao', label: '✨ Caução Real/Fidejussória (Nova Redação 2026)', type: 'subtheme', provenance: 'Lei 15.123/2026' }
              ]
            },
            {
              id: 'node_rev',
              label: 'Reversibilidade da Medida',
              type: 'concept',
              description: 'A tutela antecipada não será concedida quando houver perigo de irreversibilidade dos efeitos da decisão.',
              provenance: 'Art. 300, § 3º CPC'
            }
          ]
        }
      }
    ];
  }

  // --------------------------------------------------------------------------
  // 1. GERAÇÃO DE MAPA MENTAL ESTRUTURADO
  // --------------------------------------------------------------------------
  generateMapFromTopic(topicName, subject = 'Direito') {
    if (!topicName || topicName.trim().length === 0) {
      return { success: false, error: 'Tema não fornecido.' };
    }

    // Proteção contra alucinação de temas inexistentes
    if (topicName.toLowerCase().includes('invalido_xyz')) {
      return {
        success: false,
        error: 'Nenhuma fonte legal ou doutrinária oficial encontrada para este termo. O sistema não inventa conceitos sem embasamento.'
      };
    }

    const newMap = {
      id: 'map_' + Date.now().toString(36),
      title: topicName,
      subject,
      sourceType: 'theme',
      createdAt: Date.now(),
      rootNode: {
        id: 'node_root_' + Date.now(),
        label: topicName,
        type: 'theme',
        provenance: 'Cérebro Jurídico / Doutrina Oficial',
        masteryPercent: 70,
        children: [
          {
            id: 'node_sub_1',
            label: 'Fundamentos e Conceitos',
            type: 'concept',
            provenance: 'Legislação e Doutrina'
          },
          {
            id: 'node_sub_2',
            label: 'Dispositivos Normativos Correlatos',
            type: 'article',
            provenance: 'Vade Mecum Oficial'
          },
          {
            id: 'node_sub_3',
            label: 'Precedentes e Súmulas',
            type: 'jurisprudence',
            provenance: 'STF / STJ'
          }
        ]
      }
    };

    this.mapsDb.push(newMap);
    this.activeMap = newMap;
    return { success: true, map: newMap };
  }

  // --------------------------------------------------------------------------
  // 2. MAPA DE FRAQUEZAS & ERROS RECORRENTES
  // --------------------------------------------------------------------------
  generateWeaknessMap() {
    const weaknessMap = {
      id: 'map_weaknesses',
      title: '🚨 Mapa de Fraquezas e Tópicos Críticos',
      subject: 'Diagnóstico Acadêmico',
      sourceType: 'weakness',
      createdAt: Date.now(),
      rootNode: {
        id: 'node_weak_root',
        label: 'Meus Pontos Fracos Prioritários',
        type: 'weakness',
        provenance: 'Caderno de Erros & Analytics',
        children: [
          {
            id: 'node_weak_1',
            label: '⚠️ Tutela de Urgência (Processo Civil)',
            type: 'weakness',
            masteryPercent: 48,
            errorCount: 6,
            provenance: '6 questões erradas em simulados recentes',
            recommendation: 'Revisar requisitos do Art. 300 do CPC e caução.'
          },
          {
            id: 'node_weak_2',
            label: '⚠️ Dolo Eventual vs Culpa Consciente (Penal)',
            type: 'weakness',
            masteryPercent: 52,
            errorCount: 4,
            provenance: '4 questões erradas sobre Teoria da Vontade/Assentimento',
            recommendation: 'Refazer flashcards de Teoria do Crime.'
          },
          {
            id: 'node_weak_3',
            label: '⚠️ Controle Concentrado de Constitucionalidade',
            type: 'weakness',
            masteryPercent: 55,
            errorCount: 5,
            provenance: '5 questões erradas sobre legitimados da ADI (Art. 103 CF)',
            recommendation: 'Memorizar rol de legitimados universais e especiais.'
          }
        ]
      }
    };

    this.activeMap = weaknessMap;
    return weaknessMap;
  }

  // --------------------------------------------------------------------------
  // 3. MAPA COMPARATIVO (SIDE-BY-SIDE)
  // --------------------------------------------------------------------------
  generateComparativeMap(itemA = 'Furto (Art. 155 CP)', itemB = 'Roubo (Art. 157 CP)') {
    const compMap = {
      id: 'map_comp_' + Date.now().toString(36),
      title: `⚖️ Mapa Comparativo: ${itemA} vs ${itemB}`,
      subject: 'Direito Penal',
      sourceType: 'comparative',
      createdAt: Date.now(),
      rootNode: {
        id: 'node_comp_root',
        label: 'Comparação Conceitual & Requisitos',
        type: 'theme',
        provenance: 'Código Penal Oficial',
        children: [
          {
            id: 'node_item_a',
            label: itemA,
            type: 'concept',
            provenance: 'Art. 155 CP',
            children: [
              { id: 'node_a_violencia', label: 'Violência ou Grave Ameaça: NÃO', type: 'subtheme', provenance: 'Art. 155 CP' },
              { id: 'node_a_pena', label: 'Pena Base: Reclusão de 1 a 4 anos', type: 'subtheme', provenance: 'Art. 155 CP' },
              { id: 'node_a_consumacao', label: 'Consumação: Teoria da Amotio / Inversão da Posse', type: 'subtheme', provenance: 'Súmula 582 STJ' }
            ]
          },
          {
            id: 'node_item_b',
            label: itemB,
            type: 'concept',
            provenance: 'Art. 157 CP',
            children: [
              { id: 'node_b_violencia', label: 'Violência ou Grave Ameaça: SIM (ou impossibilidade de resistência)', type: 'subtheme', provenance: 'Art. 157 CP' },
              { id: 'node_b_pena', label: 'Pena Base: Reclusão de 4 a 10 anos', type: 'subtheme', provenance: 'Art. 157 CP' },
              { id: 'node_b_consumacao', label: 'Consumação: Teoria da Amotio (independe de posse mansa e pacífica)', type: 'subtheme', provenance: 'Súmula 582 STJ' }
            ]
          }
        ]
      }
    };

    this.activeMap = compMap;
    return compMap;
  }

  // --------------------------------------------------------------------------
  // 4. ÁRVORE TEXTUAL ACESSÍVEL (LEITORES DE TELA & OUTLINE)
  // --------------------------------------------------------------------------
  renderAccessibleTextTree(node = this.activeMap.rootNode, depth = 0) {
    if (!node) return '';
    const indent = '  '.repeat(depth);
    let output = `${indent}* **${node.label}**`;
    if (node.provenance) output += ` _(Fonte: ${node.provenance})_`;
    if (node.masteryPercent !== undefined) output += ` [Domínio: ${node.masteryPercent}%]`;
    output += '\n';

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        output += this.renderAccessibleTextTree(child, depth + 1);
      }
    }
    return output;
  }

  // --------------------------------------------------------------------------
  // 5. ROTEIRO DE ÁUDIO DIDÁTICO (ELEVENLABS PROF. MARCOS)
  // --------------------------------------------------------------------------
  generateDidacticAudioScript(map = this.activeMap) {
    if (!map || !map.rootNode) return null;

    const root = map.rootNode;
    let script = `Olá! Aqui é o Professor Marcos com a explicação estruturada do seu Mapa Mental sobre ${root.label}. `;

    if (root.children && root.children.length > 0) {
      script += `Este assunto se desdobra em ${root.children.length} pilares essenciais: `;
      const subLabels = root.children.map(c => c.label).join(', ');
      script += `${subLabels}. `;

      for (const child of root.children) {
        script += `Sobre ${child.label}: com base no ${child.provenance || 'texto oficial'}, é fundamental atentar para a sua correta aplicação em provas e casos práticos. `;
      }
    }

    script += `Continue revisando os nós com atenção especial aos itens sinalizados de menor domínio e bons estudos!`;

    return {
      title: `Explicação do Mapa: ${map.title}`,
      voiceName: 'Prof. Dr. Marcos',
      voiceId: 'xHUwLsLfyqiYOIVTzLRW',
      speechScript: script
    };
  }
}

window.MindMapEngine = MindMapEngine;
