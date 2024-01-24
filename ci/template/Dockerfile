FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV PORT=8080
ENV DB_NAME=production
EXPOSE 8080
# VOLUME /app/media No need to mount this anymore because I migrated the media storage to S3

CMD ["npm","start"]