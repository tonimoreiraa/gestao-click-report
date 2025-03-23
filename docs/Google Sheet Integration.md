# Configuração do Google Sheets

Para exportar os dados para o Google Sheets, você precisará configurar uma conta de serviço do Google Cloud e obter as credenciais necessárias.

## Passos para configuração

1. **Crie um projeto no Google Cloud Console**
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou use um existente

2. **Ative a API do Google Sheets**
   - No menu lateral, acesse "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Sheets API" e ative-a para o seu projeto

3. **Crie uma conta de serviço**
   - No menu lateral, acesse "APIs e Serviços" > "Credenciais"
   - Clique em "Criar Credenciais" > "Conta de serviço"
   - Preencha os detalhes da conta de serviço e clique em "Concluir"

4. **Crie uma chave para a conta de serviço**
   - Na lista de contas de serviço, clique na conta que você acabou de criar
   - Vá para a aba "Chaves"
   - Clique em "Adicionar Chave" > "Criar nova chave"
   - Escolha o formato JSON e clique em "Criar"
   - O arquivo JSON será baixado automaticamente - guarde-o com segurança!

5. **Configure as permissões na planilha**
   - Crie ou abra uma planilha existente no Google Sheets
   - Clique em "Compartilhar" no canto superior direito
   - Adicione o e-mail da conta de serviço (encontrado no arquivo JSON) com permissão de "Editor"

6. **Configure as variáveis de ambiente**
   - Abra o arquivo JSON da chave da conta de serviço
   - Copie o "client_email" para a variável `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Copie o "private_key" para a variável `GOOGLE_PRIVATE_KEY`
   - Copie o ID da planilha (a parte da URL entre /d/ e /edit) para a variável `GOOGLE_SPREADSHEET_ID`

## Exemplo de arquivo .env

```
# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## Observações importantes

- Nunca compartilhe ou cometa sua chave privada em repositórios públicos
- Se estiver usando um sistema de CI/CD, configure essas variáveis como segredos
- A chave privada no arquivo JSON tem quebras de linha representadas como "\n". Ao adicionar ao arquivo .env, mantenha essas quebras de linha ou envolva a chave em aspas duplas como mostrado acima