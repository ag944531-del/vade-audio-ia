# VadeAudio AI - Manual de Backups & Procedimento de Restauração (Etapa 14)

Este runbook define a política de cópias de segurança, armazenamento, retenção e o passo a passo para execução e validação de testes de restore do banco de dados e arquivos do **VadeAudio AI**.

---

## 1. Política de Backup

| Item | Frequência | Retenção | Destino | Criptografia |
| :--- | :--- | :--- | :--- | :--- |
| **Banco de Dados (Snapshots JSON / DB)** | A cada 6 horas | 30 dias | `storage/backups/` + Storage Cloud Seguro | AES-256 |
| **Documentos & Uploads de Alunos** | Diário (Madrugada) | 60 dias | Bucket Privado Isolado | Criptografia em Repouso |
| **Áudios & Cache Neural** | Semanal | 90 dias | Storage Tier Frio (Archive) | SSE-S3 |

---

## 2. Geração Manual de Snapshot de Backup

1. Acessar o **Painel Admin** com credenciais de administrador (`admin@vadeaudio.com.br`).
2. Clicar no botão **"Gerar & Baixar Snapshot"** na seção de Banco de Dados.
3. Ou executar via endpoint seguro autenticado com token de administrador:
   ```bash
   curl -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" http://localhost:8080/api/admin/backup -o backup_snapshot.json
   ```
4. O arquivo gerado conterá a estrutura íntegra dos usuários, status, métricas e catálogos.

---

## 3. Procedimento de Teste de Restauração (Restore Runbook)

Para validar a integridade dos backups sem afetar o ambiente de produção:

1. **Provisionar Ambiente Isolado (Staging/Sandbox)**:
   - Iniciar uma instância de teste com porta isolada (ex: `PORT=8085`).
2. **Carregar o Snapshot de Backup**:
   - Injetar o arquivo `backup_snapshot.json` no diretório `storage/backups/`.
3. **Executar Verificação de Integridade das Tabelas & Entidades**:
   ```bash
   node -e "
     const fs = require('fs');
     const data = JSON.parse(fs.readFileSync('storage/backups/backup_snapshot.json'));
     console.log('Validando usuários restaurados:', data.usersCount);
     console.assert(data.usersCount > 0, 'Erro: Nenhum usuário encontrado no backup');
     console.log('Backup íntegro e validado com sucesso!');
   "
   ```
4. **Validar Arquivos e Permissões**:
   - Confirmar que as pastas `storage/uploads/` e `cache/audio/` possuem permissões restritas (apenas leitura e escrita pelo processo do Node).
5. **Executar Testes Automatizados no Ambiente de Teste**:
   ```bash
   node tests/security_tests.js
   ```
6. **Aprovação**: Se todos os 10 pilares passarem sem erro, a restauração é considerada homologada.
