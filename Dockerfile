# Imagem base Node.js
FROM node:20-alpine

# Instalação do pnpm
RUN npm install -g pnpm

# Instalação do cron
RUN apk add --no-cache dcron

# Criação de diretório para a aplicação
WORKDIR /app

# Copiar package.json e pnpm-lock.yaml (se existir)
COPY package*.json pnpm-lock.yaml* ./

# Instalação de dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN pnpm build

# Configurar o cron job
RUN echo "0 * * * * cd /app && node dist/index.js >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Arquivo para logs
RUN touch /var/log/cron.log

# Criar script de inicialização
RUN echo "#!/bin/sh" > /start.sh && \
    echo "crond -b -l 8" >> /start.sh && \
    echo "tail -f /var/log/cron.log" >> /start.sh && \
    chmod +x /start.sh

# Comando para iniciar o cron e manter o container rodando
CMD ["/start.sh"]