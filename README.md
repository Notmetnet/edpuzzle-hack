# Edpuzzle Hack

This Edpuzzle hack uses an Ollama LLM `llama3.1:latest`

## Features
- Auto answer questions by posting to local server.
- Stores answered questions by by it's id.
- Runs locally.

## How to use
Copy the `index.js` file and go to edpuzzle and paste the code into the console or create a bookmark end edit the url to the code below.
```js
javascript:fetch("https://raw.githubusercontent.com/Notmetnet/edpuzzle-hack/refs/heads/master/index.js").then(r => r.text()).then(r => eval(r))
```


## Installation
```bash
pip install -r requirements.txt
python server.py
```