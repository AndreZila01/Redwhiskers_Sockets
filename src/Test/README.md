# Como usar o client.js?

## Certificar as coisas: 

1. Instalar o node.js
   Certifique se tem o node.js instalado no computador. Faça num terminal ou command line o comando `node -v` e receber um output como este:
   ```
     v20.17.0
   ```
   se precisar de instalar o node.js, instala o node.js [aqui](https://nodejs.org/en/download/package-manager)

2. Nesta pasta "Test" tem de ter um ficheiro chamado `.env` com os seguintes dados:
  ```
    Port="3000"
    Ipv4="localhost || IP do Servidor"
  ```
  Port é a porta do servidor e Ipv4 a porta do servidor ou 127.0.0.1

3. Na pasta "src" confirma se existe um ficheiro chamado `.env` com os seguintes dados:
  ```
    Port="3000"
    Ipv4="localhost"
  ```

<br>

## Executar codigo

  1. Executar o codigo do servidor, neste caso o `index.js` para começar o servidor, utilizando o comando ` node index.js`.
  2. Executar o codigo do cliente, neste caso o `client.js` para começar o *script* para o cliente `node client.js`.
  3. Depois do codigo executado do `client.js` irá aparecer o seguinte *output*:
  ```
    0-Definir um username(atual: Test1)
    1-Ligar-se ao servidor
    2-Criar lobby
    3-Lista Lobbys
    4-Ligar-se ao Lobby
    5-Dizer que está ready ou unready
    
    Digite o que deseja fazer:
  ```
  4. Digitar `1` e *enter*;
  5. Digitar `2` e *enter* ;
