FROM node:22
WORKDIR /app

# Copiar arquivos de dependências primeiro
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Instalar dependências
RUN pnpm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Executar build
RUN pnpm run build

# Configurar cron
RUN apt-get update && apt-get install -y cron
COPY crontab /etc/cron.d/mycron
RUN chmod 0644 /etc/cron.d/mycron
RUN crontab /etc/cron.d/mycron
RUN touch /var/log/cron.log

# Iniciar cron e manter o container rodando
CMD cron && tail -f /var/log/cron.log