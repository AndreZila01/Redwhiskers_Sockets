# node requests.js
# docker build -t test . && docker run -p 8000:8000 test 
docker build --progress=plain --no-cache -t sv . && docker run -p 3000:3000 sv