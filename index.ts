const styleText = `
body {
    background: #3a3596;
    background: linear-gradient(155deg,rgba(58, 53, 150, 1) 0%, rgba(39, 39, 61, 1) 87%);
    color: white;
    font-family: 'Arial', sans-serif;
}

.btn {
    color: white;
    background-color: #242424;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    padding: 15px;
    transition: all .2s ease;
    margin-left: 1rem;
}

.btn:hover {
    background-color: #323232;
    transform: scale(1.08);
}

.question-container {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
}

.inner-question-container {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;

.question-text {
    margin-bottom: 10px;
    color: #fff;
}

.choices-container {
    margin-left: 20px;
}

.question-choice {
    margin: 5px 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
}
`;

const windowFeatures = "left=0,top=0,width=800,height=800";
const popup = window.open("about:blank", "_blank", windowFeatures);
if (!popup) {
    alert("Popup blocked!");
    throw new Error("Failed to open popup");
}

class ElementBuilder {
    element: HTMLElement;
    document: Document;

    constructor(doc: Document, tag: string, className: string = "", idName: string | null = null) {
        this.document = doc;
        this.element = this.document.createElement(tag);
        if (className) this.element.className = className;
        if (idName) this.element.id = idName;
    }

    setText(text: string) {
        this.element.textContent = text;
        return this;

    }

    append(child: ElementBuilder): this {
        this.element.appendChild(child.element);
        return this;
    }

    attachTo(target: HTMLElement): this {
        target.appendChild(this.element);
        return this;
    }

    onClick(callback: (ev: MouseEvent) => void): this {
        this.element.addEventListener("click", callback);
        return this;
    }

    getElement() {
        return this.element;
    }

    static create(doc: Document, tag: string, className: string = "", idName: string | null = null): ElementBuilder {
        return new ElementBuilder(doc, tag, className, idName);
    }
}

let assignmentData: object;

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
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";

    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                const data = JSON.parse(result);
                const answers = data.answers || [];

                // Matching logic remains the same
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
            } else {
                console.error("File content is not a string.");
            }
        };

        reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    input.remove();
}
interface ChoicePayload {
    text: string;
}

interface QuestionPayload {
    text: string;
    choices: string[];
}

interface EdpuzzlePayload {
    assignmentId: string;
    questions: QuestionPayload[];
}

const htmlPayloadContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Generated Page</title>
</head>
<body>
    <h1>This HTML was generated with TypeScript!</h1>
    <p>Hello from a dynamically created file.</p>
</body>
</html>
`

function createPayloadFile(): void {
    try {
        const questionElements = Array.from(pDocument.querySelectorAll(".inner-question-container"));
        const payload: EdpuzzlePayload = {
            assignmentId: assignment_id,
            questions: []
        };

        questionElements.forEach((questionElement: Element) => {
            const questionText = questionElement.querySelector(".question-text")?.textContent?.trim() || "";
            const choiceElements = Array.from(questionElement.querySelectorAll(".question-choice"));

            const choices = choiceElements.map((choiceElement: Element) => {
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
        console.warn("Created HTML Payload File.")

    } catch (error) {
        console.error(`Error in createPayloadFile: ${error}`);
        alert(`Payload creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function downloadHtmlPayload(): void {
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
        console.error(`Error in Creating HTML PayloadFile: ${error}`)
    }
}

function downloadJsonFile(data: unknown, filename: string): void {
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
        const questions = await getQuestions();
        questionWrapper.getElement().innerHTML = '';

        if (!questions || !questions.length) {
            ElementBuilder.create(pDocument, "p", "no-questions")
                .setText("No questions found in this assignment")
                .attachTo(questionWrapper.getElement());
            return;
        }

        questions.forEach((question, index) => {
            if (!question.body?.[0]?.html) return;

            const questionContainer = ElementBuilder.create(pDocument, "div", "inner-question-container");
            const questionText = ElementBuilder.create(pDocument, "h3", "question-text")
                .setText(`${index + 1}. ${sanitizeString(question.body[0].html)}`);
            questionContainer.append(questionText);

            if (question.choices?.length) {
                const choicesContainer = ElementBuilder.create(pDocument, "div", "choices-container");

                question.choices.forEach(choice => {
                    if (!choice.body?.[0]?.html) return;

                    const choiceText = ElementBuilder.create(pDocument, "p", "question-choice")
                        .setText(sanitizeString(choice.body[0].html));

                    choicesContainer.append(choiceText);
                });

                questionContainer.append(choicesContainer);
            }

            questionWrapper.append(questionContainer);
        });

        container.append(questionWrapper);
    } catch (error) {
        console.error("Error loading questions:", error);
        ElementBuilder.create(pDocument, "p", "error-message")
            .setText("Failed to load questions. Please try again.")
            .attachTo(questionWrapper.getElement());
    }
}

function sanitizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, '') // remove punctuation
        .replace(/\s+/g, ' ')        // normalize whitespace
        .trim();
}

function sanitizeString(htmlString: string) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
}

appendQuestions();

const edpuzzle_api = "https://edpuzzle.com/api/v3/assignments/";
const csrfApi = "https://edpuzzle.com/api/v3/csrf";
const assignment_id = window.location.href.split("/")[4];


async function getAssignment() {
    if (!assignment_id) {
        alert("Error: Could not find assignment ID.");
        return null;
    }

    try {

        const response = await fetch(edpuzzle_api + assignment_id);
        const data = await response.json();
        assignmentData = data;
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function skipVideo() {
    try {
        const [csrf, data] = await getCSRF();
        postSkipVideo(csrf, data);
    } catch (error) {
        console.error("Error skipping video:", error);
    }
}

async function getCSRF(): Promise<[string, AssignmentData]> {
    const csrfRes = await fetch(csrfApi);
    const csrfData = await csrfRes.json();
    const csrf = csrfData.CSRFToken;

    const assignment_id = window.location.href.split("/")[4];
    const attemptRes = await fetch(`https://edpuzzle.com/api/v3/assignments/${assignment_id}/attempt`);
    const attemptData = await attemptRes.json();

    return [csrf, attemptData];
}

interface AssignmentData {
    _id: string;
    teacherAssignmentId: string;
}

interface EdpuzzleData {
    version: string
}

interface Window {
    __EDPUZZLE_DATA__: EdpuzzleData;
}

function postSkipVideo(csrf: string, data: AssignmentData) {
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
    const questionData = assignmentData.medias[0].questions;

    return questionData;
}