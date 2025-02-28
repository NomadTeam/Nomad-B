FROM node:22

WORKDIR /Nomad-B

COPY package*.json ./

RUN npm install

ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY . .

RUN npm run build

RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "start", "/Nomad-B/dist/main.js", "--name", "backend-server"];