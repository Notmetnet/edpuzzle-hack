import ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

edpuzzle_dir = "edpuzzles"
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

    ai_answer_lower = ai_answer.lower()
    for choice in choices:
        if choice.lower() == ai_answer_lower:
            return choice
        if choice.lower() in ai_answer_lower:
            return choice
        
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

def getEdpuzzleFromDb(assignment_id):
    files = sorted(os.listdir(edpuzzle_dir))

    low = 0
    high = len(files) - 1

    while low <= high:
        mid = (low + high) // 2
        mid_element = files[mid]

        if mid_element == assignment_id:
            return files[mid]
        elif assignment_id < mid_element:
            high = mid - 1
        else:
            low = mid + 1

    return None

@app.route("/upload", methods=["POST"])
def handle_upload():
    data = request.get_json()
    assignment_id = data.get("assignmentId", None)

    if assignment_id == None:
        return jsonify({"status": "fail", "message": "No assignment ID Detected."}), 400
    
    edpuzzle = getEdpuzzleFromDb(assignment_id + ".json")
    if edpuzzle:
        with open(f"{edpuzzle_dir}\\{edpuzzle}", 'r', encoding='utf-8') as fh:
            edpuzzle_content = json.load(fh)
            return jsonify({"status": "success", "answers": edpuzzle_content}), 200
    
    answers = parse_questions(data)

    with open(f"{edpuzzle_dir}\\{assignment_id}.json", 'w', encoding='utf-8') as fh:
        json.dump(answers, fh, indent=4, ensure_ascii=False)

    return jsonify({"status": "success", "answers": answers}), 200
    
if __name__ == "__main__":
    app.run("0.0.0.0", port=5090)