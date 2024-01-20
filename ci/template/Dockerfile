FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV PORT=8080
ENV DB_NAME=production
EXPOSE 8080
VOLUME /app/media

CMD ["npm","start"]