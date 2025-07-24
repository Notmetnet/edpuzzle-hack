import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

def generate_prompt(text):
    response = ollama.generate(model="llama3.1:latest", prompt=text)
    return response

@app.route("/ai", methods=["POST"])
def get_user_prompt():
    data = request.get_json()
    prompt = data.get("prompt")
    
    model_response = generate_prompt(prompt)

    return jsonify({"status": "success", "message": model_response.get("response")}), 200

@app.route("/edpuzzle", methods=["POST"])
def get_edpuzzle_data():
    data = request.get_json()

if __name__ == "__main__":
    app.run("0.0.0.0", port=5090)