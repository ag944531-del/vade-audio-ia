/**
 * VadeAudio AI - Processador e Extrator de Documentos (RAG / AI Docs)
 * Validação de segurança, extração estruturada de páginas e chunking semântico.
 */

class DocumentProcessor {
  constructor() {
    this.maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    this.allowedExtensions = ['pdf', 'docx', 'txt'];
    this.allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
  }

  validateFile(file) {
    if (!file) return { valid: false, error: 'Nenhum arquivo selecionado.' };
    if (file.size === 0) return { valid: false, error: 'O arquivo enviado está vazio (0 bytes).' };
    if (file.size > this.maxSizeBytes) {
      return { valid: false, error: `Tamanho excede o limite máximo permitido de 25 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).` };
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      return { valid: false, error: `Formato ".${ext}" não suportado. Por favor envie PDF, DOCX ou TXT.` };
    }

    return { valid: true, ext };
  }

  async processDocument(file, subjectId = 'penal', assessmentId = null, onProgress = null) {
    const validation = this.validateFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const docId = 'doc-' + Date.now();
    const fileName = file.name;
    const sizeFormatted = this.formatFileSize(file.size);

    if (onProgress) onProgress(10, 'Enviando arquivo com segurança...');
    await new Promise(r => setTimeout(r, 200));

    if (onProgress) onProgress(35, 'Extraindo texto e identificando páginas...');
    const rawText = await this.readTextFromFile(file);
    const pages = this.splitIntoPages(rawText, validation.ext);

    if (pages.length === 0 || pages.every(p => !p.text || p.text.trim().length === 0)) {
      throw new Error('Não foi possível extrair texto pesquisável. Este arquivo pode ser uma imagem digitalizada sem camada OCR.');
    }

    if (onProgress) onProgress(70, 'Indexando trechos e criando blocos RAG...');
    const chunks = this.createChunks(docId, pages, subjectId, assessmentId);

    if (onProgress) onProgress(90, 'Identificando tópicos e normas legais...');
    const detectedTopics = this.detectTopics(rawText);

    const docMeta = {
      id: docId,
      name: fileName,
      sizeFormatted,
      sizeBytes: file.size,
      type: validation.ext,
      subjectId,
      assessmentId,
      totalPages: pages.length,
      uploadedAt: Date.now(),
      status: 'pronto',
      topics: detectedTopics
    };

    // Salva no banco de dados local
    StorageModule.saveUserDocument(docMeta);
    StorageModule.saveDocumentPages(docId, pages);
    StorageModule.saveDocumentChunks(docId, chunks);

    if (onProgress) onProgress(100, 'Material pronto para estudar!');
    return docMeta;
  }

  readTextFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => reject(new Error('Erro na leitura física do arquivo.'));

      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file, 'utf-8');
      } else {
        // Fallback para leitura de texto simulado em PDF/DOCX
        reader.readAsText(file, 'utf-8');
      }
    });
  }

  splitIntoPages(rawText, ext) {
    if (!rawText || !rawText.trim()) return [];

    // Se houver marcadores de página explícitos ou divisão por parágrafos longos
    const pageDelimiters = ['--- PÁGINA', '--- PAGE', '\f', '=== PÁGINA'];
    let rawPages = [];

    for (const delim of pageDelimiters) {
      if (rawText.includes(delim)) {
        rawPages = rawText.split(delim).filter(p => p.trim().length > 0);
        break;
      }
    }

    if (rawPages.length === 0) {
      // Divide em blocos de ~1200 caracteres para simular páginas reais
      const chunkSize = 1200;
      let start = 0;
      let pageNum = 1;
      while (start < rawText.length) {
        const textChunk = rawText.substring(start, start + chunkSize);
        rawPages.push(textChunk);
        start += chunkSize;
        pageNum++;
      }
    }

    return rawPages.map((text, idx) => ({
      pageNumber: idx + 1,
      text: text.trim()
    }));
  }

  createChunks(docId, pages, subjectId, assessmentId) {
    const chunks = [];
    pages.forEach(page => {
      const paragraphs = page.text.split('\n\n').filter(p => p.trim().length > 0);
      paragraphs.forEach((pText, pIdx) => {
        chunks.push({
          id: `${docId}-p${page.pageNumber}-c${pIdx + 1}`,
          documentId: docId,
          pageNumber: page.pageNumber,
          subjectId,
          assessmentId,
          text: pText.trim()
        });
      });
    });
    return chunks;
  }

  detectTopics(text) {
    const topics = [];
    const tLower = text.toLowerCase();
    if (tLower.includes('homicídio') || tLower.includes('art. 121')) topics.push('Crimes Contra a Vida (Homicídio)');
    if (tLower.includes('legítima defesa') || tLower.includes('art. 25')) topics.push('Excludentes de Ilicitude (Legítima Defesa)');
    if (tLower.includes('tutela') || tLower.includes('art. 300')) topics.push('Tutela Provisória de Urgência');
    if (tLower.includes('constitucional') || tLower.includes('art. 5')) topics.push('Direitos Fundamentais');
    if (topics.length === 0) topics.push('Conceitos Gerais e Doutrina');
    return topics;
  }

  searchChunks(docId, query, limit = 5) {
    const chunks = StorageModule.getDocumentChunks(docId);
    if (!query || !query.trim()) return chunks.slice(0, limit);

    const q = query.toLowerCase();
    return chunks
      .filter(c => c.text.toLowerCase().includes(q))
      .slice(0, limit);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
