import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
EDPUZZLE_API = "https://edpuzzle.com/api/v3/assignments/"

def generate_prompt(text):
    response = ollama.generate(model="llama3.1:latest", prompt=text)
    return response

@app.route("/ai", methods=["POST"])
def get_user_prompt():
    data = request.get_json()
    prompt = data.get("prompt")
    
    model_response = generate_prompt(prompt)

    return jsonify({"status": "success", "message": model_response.get("response")}), 200

def answer_question(question_text, choices):
    if not choices:
        return "No Choices"

    formatted_prompt = (
        f"Choose the correct answer ONLY from the given choices. "
        f"Return exactly one choice as-is, without any explanation.\n"
        f"Question: {question_text}\n"
        f"Choices: {', '.join(choices)}\n"
        f"Answer:"
    )
    response = generate_prompt(formatted_prompt)
    ai_answer = response.get("response", "").strip()

    # Try to find the closest matching choice ignoring case and whitespace
    ai_answer_lower = ai_answer.lower()
    for choice in choices:
        if choice.lower() == ai_answer_lower:
            return choice  # exact match
        # Also consider partial match if AI returns a phrase containing a choice
        if choice.lower() in ai_answer_lower:
            return choice

    # fallback: return AI answer if no match
    return ai_answer

def parse_questions(data):
    questions = data.get("questions", [])
    answers = []

    for question in questions:
        q_text = question.get("text", "")
        choices = question.get("choices", [])
        if not choices:
            answer = "No Choices"
        else:
            answer = answer_question(q_text, choices)
        answers.append({"question": q_text, "answer": answer})
        print(f"{q_text} --> {answer}")

    return answers
        

@app.route("/upload", methods=["POST"])
def handle_upload():
    data = request.get_json()
    answers = parse_questions(data)
    return jsonify({"status": "success", "answers": answers}), 200
    

if __name__ == "__main__":
    app.run("0.0.0.0", port=5090)