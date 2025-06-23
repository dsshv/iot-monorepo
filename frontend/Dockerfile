FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build || echo "Build step skipped for шаблон проекта"

CMD ["npm", "start"]
