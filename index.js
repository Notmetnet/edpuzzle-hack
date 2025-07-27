"use strict";
const styleText = `
body {
    background: linear-gradient(160deg, #2c3e50, #1a1a2e);
    color: #f0f0f0;
    font-family: 'Segoe UI', 'Arial', sans-serif;
    margin: 0;
    padding: 2rem;
    line-height: 1.6;
}

.text {
    margin-top: 1.5rem;
    font-size: 1.1rem;
    color: #e0e0e0;
}

.btn {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    cursor: pointer;
    padding: 14px 24px;
    transition: all 0.3s ease;
    margin-left: 1rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    font-size: 1rem;
    letter-spacing: 0.5px;
}

.btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.06);
    border-color: rgba(255, 255, 255, 0.3);
}

.question-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.inner-question-container {
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
}

.inner-question-container:hover {
    transform: scale(1.01);
}

.question-text {
    margin-bottom: 14px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffffff;
}

.choices-container {
    margin-left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.question-choice {
    padding: 10px 15px;
    background: rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    transition: background 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;
}

.question-choice:hover {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
}
`;
const windowFeatures = "left=0,top=0,width=800,height=800";
const popup = window.open("about:blank", "_blank", windowFeatures);
if (!popup) {
    alert("Popup blocked!");
    throw new Error("Failed to open popup");
}
class ElementBuilder {
    element;
    document;
    constructor(doc, tag, className = "", idName = null) {
        this.document = doc;
        this.element = this.document.createElement(tag);
        if (className)
            this.element.className = className;
        if (idName)
            this.element.id = idName;
    }
    setText(text) {
        this.element.textContent = text;
        return this;
    }
    append(child) {
        this.element.appendChild(child.element);
        return this;
    }
    attachTo(target) {
        target.appendChild(this.element);
        return this;
    }
    onClick(callback) {
        this.element.addEventListener("click", callback);
        return this;
    }
    getElement() {
        return this.element;
    }
    static create(doc, tag, className = "", idName = null) {
        return new ElementBuilder(doc, tag, className, idName);
    }
}
let assignmentData;
const pDocument = popup.document;
const pBody = popup.document.body;
pDocument.head.appendChild(Object.assign(pDocument.createElement("style"), { textContent: styleText }));
pDocument.title = "EdPuzzle Hack";
const container = ElementBuilder.create(pDocument, "div", "container").attachTo(pBody);
const title = ElementBuilder.create(pDocument, "h1", "text").setText("EdPuzzle Hack");
const skipVideoBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Skip Video.");
const convertToJsonBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Create Payload.");
const uploadJsonAnswerBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Upload JSON Answers");
const questionWrapper = ElementBuilder.create(pDocument, "div", "question-container");
container.append(title);
container.append(skipVideoBtn);
container.append(convertToJsonBtn);
container.append(uploadJsonAnswerBtn);
convertToJsonBtn.onClick(createPayloadFile);
skipVideoBtn.onClick(skipVideo);
uploadJsonAnswerBtn.onClick(uploadJsonAnswer);
function uploadJsonAnswer() {
    const input = pDocument.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    input.onchange = () => {
        const file = input.files[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                const data = JSON.parse(result);
                const answers = data.answers || [];
                const questionElements = pDocument.querySelectorAll(".inner-question-container");
                questionElements.forEach((questionEl) => {
                    const questionTextRaw = questionEl.querySelector(".question-text")?.textContent || "";
                    const questionText = sanitizeText(questionTextRaw.replace(/^\d+\.\s*/, ""));
                    const matched = answers.find(q => {
                        const answerText = sanitizeText(q.question);
                        return questionText.includes(answerText) || answerText.includes(questionText);
                    });
                    const answerP = document.createElement("p");
                    answerP.style.color = "lime";
                    answerP.style.fontWeight = "bold";
                    answerP.textContent = matched ? `Answer: ${matched.answer}` : "Answer: No Match";
                    questionEl.appendChild(answerP);
                });
            }
            else {
                console.error("File content is not a string.");
            }
        };
        reader.readAsText(file);
    };
    pDocument.body.appendChild(input);
    input.click();
    input.remove();
}
const htmlPayloadContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png" type="image/png" />
    <title>Upload JSON</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            height: 100vh;
            background: linear-gradient(155deg, #54546e 0%, #17173b 87%);
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            width: 400px;
            height: 200px;
            border: 2px dashed #888;
            border-radius: 16px;
            background-color: rgba(255, 255, 255, 0.03);
            text-align: center;
            padding: 20px;
            color: #ccc;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            position: relative;
            cursor: pointer;
        }

        .container.dragover {
            background-color: rgba(0, 170, 255, 0.1);
            border-color: #00aaff;
            color: #00aaff;
        }

        .container p {
            font-size: 1.2rem;
            margin-bottom: 10px;
        }

        #fileInput {
            display: none;
        }

        .upload-icon {
            font-size: 48px;
            margin-bottom: 10px;
            color: #aaa;
        }
    </style>
</head>

<body>
    <div class="container" id="dropZone">
        <div class="upload-icon">woah..</div>
        <p>Drag & Drop JSON Payload</p>
        <p>or click to select a file</p>
        <input type="file" id="fileInput" accept=".json" />
    </div>

    <script>
        const dropZone = document.getElementById("dropZone");
        const fileInput = document.getElementById("fileInput");

        dropZone.addEventListener("click", () => fileInput.click());

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");

            const files = e.dataTransfer.files;
            if (files.length) {
                handleFiles(files);
            }
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files.length) {
                handleFiles(fileInput.files);
            }
        });

        function handleFiles(files) {
            const file = files[0]
            const reader = new FileReader();

            reader.onload = () => {
                const fileContent = reader.result

                fetch("http://127.0.0.1:5090/upload", {
                    method: "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    body: fileContent
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Server response: ", data);

                        const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" })
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "answers.json";
                        document.body.append(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    })
                    .catch(error => {
                        console.error(error);
                    })
            }
            reader.readAsText(file);
        }
    </script>
</body>

</html>
`;
function createPayloadFile() {
    try {
        const questionElements = Array.from(pDocument.querySelectorAll(".inner-question-container"));
        const payload = {
            assignmentId: assignment_id,
            questions: []
        };
        questionElements.forEach((questionElement) => {
            const questionText = questionElement.querySelector(".question-text")?.textContent?.trim() || "";
            const choiceElements = Array.from(questionElement.querySelectorAll(".question-choice"));
            const choices = choiceElements.map((choiceElement) => {
                return choiceElement.textContent?.trim() || "";
            });
            if (questionText) {
                payload.questions.push({
                    text: questionText,
                    choices
                });
            }
        });
        downloadJsonFile(payload, `edpuzzle-payload-${assignment_id}.json`);
        console.warn(`Payload created successfully`);
        console.warn("Creating HTML file.");
        downloadHtmlPayload();
        console.warn("Created HTML Payload File.");
    }
    catch (error) {
        console.error(`Error in createPayloadFile: ${error}`);
        alert(`Payload creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function downloadHtmlPayload() {
    try {
        const blob = new Blob([htmlPayloadContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "htmlPayload.html";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        popup.alert("Open 'htmlPayload.html' and upload the 'payload.json'");
    }
    catch (error) {
        console.error(`Error in Creating HTML PayloadFile: ${error}`);
    }
}
function downloadJsonFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
async function appendQuestions() {
    try {
        const assignment = await getQuestions();
        const questions = assignment?.questions || [];
        questionWrapper.getElement().innerHTML = '';
        if (!questions.length) {
            ElementBuilder.create(pDocument, "p", "no-questions")
                .setText("No questions found in this assignment")
                .attachTo(questionWrapper.getElement());
            return;
        }
        questions.forEach((questionData, index) => {
            const blocks = questionData.data?.body?.blocks || [];
            const questionBlock = blocks.find(b => b.type === "text" && b.valueType === "html");
            if (!questionBlock)
                return;
            const questionContainer = ElementBuilder.create(pDocument, "div", "inner-question-container");
            const questionText = ElementBuilder.create(pDocument, "h3", "question-text")
                .setText(`${index + 1}. ${sanitizeString(questionBlock.value)}`);
            questionContainer.append(questionText);
            const choices = questionData.data?.choices || [];
            if (choices.length) {
                const choicesContainer = ElementBuilder.create(pDocument, "div", "choices-container");
                choices.forEach(choice => {
                    const choiceBlocks = choice.content?.blocks || [];
                    const choiceTextBlock = choiceBlocks.find(b => b.type === "text" && b.valueType === "html");
                    if (!choiceTextBlock)
                        return;
                    const choiceText = ElementBuilder.create(pDocument, "p", "question-choice")
                        .setText(sanitizeString(choiceTextBlock.value));
                    choicesContainer.append(choiceText);
                });
                questionContainer.append(choicesContainer);
            }
            questionWrapper.append(questionContainer);
        });
        container.append(questionWrapper);
    }
    catch (error) {
        console.error("Error loading questions:", error);
        ElementBuilder.create(pDocument, "p", "error-message")
            .setText("Failed to load questions. Please try again.")
            .attachTo(questionWrapper.getElement());
    }
}
function sanitizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function sanitizeString(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
}
const edpuzzle_api = "https://edpuzzle.com/api/v3/learning/assignments/";
const csrfApi = "https://edpuzzle.com/api/v3/csrf";
const assignment_id = window.location.href.split("/")[4];
function extractEdpuzzleIds(url) {
    const assignmentMatch = url.match(/assignments\/([a-f0-9]{24})/);
    const assignmentId = assignmentMatch ? assignmentMatch[1] : null;
    const urlObj = new URL(url);
    const attachmentId = urlObj.searchParams.get("attachmentId");
    return { assignmentId, attachmentId };
}
async function getAssignment() {
    if (!assignment_id) {
        alert("Error: Could not find assignment ID.");
        return null;
    }
    try {
        const { assignmentId, attachmentId } = extractEdpuzzleIds(window.location.href);
        const new_url = `${edpuzzle_api}${assignmentId}/attachments/${attachmentId}/content`;
        const response = await fetch(new_url);
        const data = await response.json();
        console.warn(data);
        assignmentData = data;
        return data;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
async function skipVideo() {
    try {
        const [csrf, data] = await getCSRF();
        console.warn(csrf);
        console.warn(data);
    }
    catch (error) {
        console.error("Error skipping video:", error);
    }
}
async function getCSRF() {
    const csrfRes = await fetch(csrfApi);
    const csrfData = await csrfRes.json();
    const csrf = csrfData.CSRFToken;
    const assignment_id = window.location.href.split("/")[4];
    const { assignmentId, attachmentId } = extractEdpuzzleIds(window.location.href);
    console.warn(assignment_id);
    const attemptRes = await fetch(`https://edpuzzle.com/api/v3/learning/assignments/${assignmentId}/attachments/${attachmentId}/${assignmentId}/attempt`);
    const attemptData = await attemptRes.json();
    return [csrf, attemptData];
}
function postSkipVideo(csrf, data) {
    console.warn(csrf);
    const id = data._id;
    const teacher_assignment_id = data.teacherAssignmentId;
    const referrer = `https://edpuzzle.com/assignments/${teacher_assignment_id}/watch`;
    const url = `https://edpuzzle.com/api/v4/media_attempts/${id}/watch`;
    fetch(url, {
        method: "POST",
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept_language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "x-csrf-token": csrf,
            "x-edpuzzle-referrer": referrer,
            "x-edpuzzle-web-version": window.__EDPUZZLE_DATA__.version
        },
        body: JSON.stringify({ timeIntervalNumber: 10 })
    })
        .then(() => {
        window.location.reload();
    })
        .catch(console.error);
}
async function getQuestions() {
    const assignmentData = await getAssignment();
    const questionData = assignmentData;
    console.warn(questionData);
    return questionData;
}
appendQuestions();
