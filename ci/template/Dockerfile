FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080
ENV DB_NAME="chat_app_production"

EXPOSE 8080

CMD ["npm","start"]