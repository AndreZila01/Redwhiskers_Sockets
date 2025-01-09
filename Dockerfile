FROM node:23-alpine3.19
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["src/package.json", "src/package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "src/index.js"]