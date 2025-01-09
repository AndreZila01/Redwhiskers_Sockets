# Como usar o client.js


***Certificar as coisas:***

### Instalar o node.js
   Certifique se tem o node.js instalado no computador. Faça num terminal ou command line o comando `node -v` e receber um output como este:
   ```
     v20.17.0
   ```
   se precisar de instalar o node.js, instala o node.js [aqui](https://nodejs.org/en/download/package-manager)

### Ter o env nos ficheiros

1. Na pasta "src" confirma se existe um ficheiro chamado `.env` com os seguintes dados:
  ```
    Port="3000"
    Ipv4="localhost"
  ```

2. Nesta pasta "Test (`cd .\Test `)" tem de ter um ficheiro chamado `.env` com os seguintes dados:
  ```
    Port="3000"
    Ipv4="localhost || IP do Servidor"
  ```
  Port é a porta do servidor e Ipv4 a porta do servidor ou 127.0.0.1

### Docker

Arracar o projeto `Dockerfile`, caso o mesmo não esteja no projeto crie um ficheiro com o seguinte codigo:
```
FROM node:23-alpine3.19
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
```

<br>

No terminal do ubuntu fazer o seguinte comando: `bash execute.bash` no caso do windows, execute o seguinte comando no terminal: `docker build --progress=plain --no-cache -t socket . && docker run -p 3000:3000 socket `  


## Executar codigo

É necessário ter dois jogadores no *lobby*, não conta bots:
### Cliente 1 
  1. Executar o codigo do servidor, neste caso o `index.js` para começar o servidor, utilizando o comando ` node index.js`.
  2. Executar o codigo do cliente (`cd .\Test `), neste caso o `client.js` para começar o *script* para o cliente `node client.js`.
  3. Depois do codigo executado do `client.js` irá aparecer o seguinte *output*:
  ```
    0-Definir um username(atual: Test1)
    1-Ligar-se ao servidor
    2-Criar *lobby*
    3-Lista *Lobbys*
    4-Ligar-se ao *Lobby*
    5-Dizer que está ready ou unready
    
    Digite o que deseja fazer:
  ```
  4. Digitar o numero `1` e *enter* para o cliente se ligar ao server socket;
  5. Digitar o numero `2` e *enter* para criar um *lobby*;
  6. Digitar o numero `3` e *enter* para ver todos os *lobbys* disponiveis de momento;
  7. Caso o jogador estiver preparado, para jogar contra outros jogadores digite o numero `5` e caso não esteja preparado, pode digite outra vez o numero `5`
  8. Quando todos os jogadores no *lobby* tiverem, digitado `5` o jogo começa

### Client 2
  1. Executar o codigo do cliente (`cd .\Test `), neste caso o `client.js` para começar o *script* para o cliente `node client.js`.
  2. Depois do codigo executado do `client.js` irá aparecer o seguinte *output*:
  ```
    0-Definir um username(atual: Test1)
    1-Ligar-se ao servidor
    2-Criar *lobby*
    3-Lista *Lobbys*
    4-Ligar-se ao *Lobby*
    5-Dizer que está ready ou unready
    
    Digite o que deseja fazer:
  ```
  3. Digitar o numero `0` e *enter*. Devido a já existir um nome `Test1` no servidor não é permitido ter dois utilizadores com o mesmo nome, por tanto, aperte *Enter* e escreva um nome diferente de `Test1`, como por exemplo `SouLindo`;
  4. Digitar o numero `1` e *enter* para o cliente se ligar ao server socket;
  5. Digitar o numero `3` e *enter* para ver todos os *lobbys* disponiveis de momento;
  6. Para entrar no *lobby* o cliente deve ter de digitar o numero `4` e *enter*. Depois irá perguntar que *Lobby* o jogador quer entrar e irá ter de digitar o `idLobby` que quer entrar. 
  7. Caso o jogador estiver preparado, para jogar contra outros jogadores digite o numero `5` e caso não esteja preparado, pode digite outra vez o numero `5`
  8. Quando todos os jogadores no *lobby* tiverem, digitado `5` o jogo começa
  9. Começa a comunicar com todos os jogadores no mesmo *lobby*

## Coisas a fazer
...