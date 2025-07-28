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

.warn-text {
    color: #a1a1a1ff;
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
    margin: 1rem;
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
    border-left: 4px solid #00bcd4;
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

.credits {
    text-align: center;
    font-size: 1rem;
    padding: 1rem;
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
pDocument.title = "Edpuzzle Hack";

const container = ElementBuilder.create(pDocument, "div", "container").attachTo(pBody);
const title = ElementBuilder.create(pDocument, "h1", "text").setText("Edpuzzle Hack");
const hr = ElementBuilder.create(pDocument, "hr");
const warning = ElementBuilder.create(pDocument, "p", "warn-text").setText("Answers may not be correct.");

const convertToJsonBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Create Payload.");
const uploadJsonAnswerBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Upload JSON Answers");
const speedUpVideoBtn = ElementBuilder.create(pDocument, "button", "btn").setText("Speed Up Video.");

const footer = ElementBuilder.create(pDocument, "h1", "credits").setText("Created By Notmetnet.");

const questionWrapper = ElementBuilder.create(pDocument, "div", "question-container");

container.append(title);
container.append(hr);
container.append(warning);
container.append(convertToJsonBtn);
container.append(uploadJsonAnswerBtn);
container.append(speedUpVideoBtn);

convertToJsonBtn.onClick(createPayloadFile);
uploadJsonAnswerBtn.onClick(uploadJsonAnswer);
speedUpVideoBtn.onClick(editVideoData);

function uploadJsonAnswer() {
    const input = pDocument.createElement("input");
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

                    if (matched.answer === "No Choices") {
                        answerP.style.color = "red";
                    }

                    questionEl.appendChild(answerP);
                });
            } else {
                console.error("File content is not a string.");
            }
        };

        reader.readAsText(file);
    };

    pDocument.body.appendChild(input);
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

function createHtmlPayload(json_content: object, filename: string) {
    const jsonStr = JSON.stringify(json_content)
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$");

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
                color: #fff;
            }
        </style>
    </head>
    <body>
        <h1 id="status">Fetching Answers...</h1>
        <script>
            const json_data = \`${jsonStr}\`;
            fetch("http://127.0.0.1:5090/upload", {
                method: "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                body: json_data
            })
            .then(response => response.json())
            .then(data => {
                console.log("Server response: ", data);
                
                const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" })
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = '${filename}';
                document.body.append(a);
                document.getElementById("status").textContent = "Fetched Answers!";
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                window.close();
            })
            .catch(error => {
                console.error(error);
            })
        </script>
    </body>
    </html>
    `
    return htmlPayloadContent;
}

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
        downloadHtmlFile(payload);
        console.warn("Created HTML File.")
    } catch (error) {
        console.error(`Error in creating HTML file: ${error}`);
        alert(`File creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function downloadHtmlFile(json_data: object): void {
    try {
        const filename = `${assignment_id}-edpuzzle.html`;
        const htmlContent = createHtmlPayload(json_data, `${assignment_id}-answers.json`);
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);

        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        popup.alert(`Open '${filename}' and wait for the answers. Click 'Upload JSON Answers' and select the '${assignment_id}-answers.json' file.`);
    }
    catch (error) {
        console.error(`Error in Creating HTML PayloadFile: ${error}`)
    }
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

        questions.forEach((questionData: any, index: any) => {
            const blocks = questionData.data?.body?.blocks || [];

            const questionBlock = blocks.find(b => b.type === "text" && b.valueType === "html");
            if (!questionBlock) return;

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
                    if (!choiceTextBlock) return;

                    const choiceText = ElementBuilder.create(pDocument, "p", "question-choice")
                        .setText(sanitizeString(choiceTextBlock.value));
                    choicesContainer.append(choiceText);
                });
                questionContainer.append(choicesContainer);
            }
            questionWrapper.append(questionContainer);
        });
        container.append(questionWrapper);
        footer.attachTo(pBody);
    } catch (error) {
        console.error("Error loading questions:", error);
        ElementBuilder.create(pDocument, "p", "error-message")
            .setText("Failed to load questions. Please try again.")
            .attachTo(questionWrapper.getElement());
    }
}

function sanitizeText(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function sanitizeString(htmlString: string) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
}

const edpuzzle_api = "https://edpuzzle.com/api/v3/learning/assignments/";
const csrfApi = "https://edpuzzle.com/api/v3/csrf";
const assignment_id = window.location.href.split("/")[4];

function extractEdpuzzleIds(url: string): { assignmentId: string | null, attachmentId: string | null } {
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
        const new_url = `${edpuzzle_api}${assignmentId}/attachments/${attachmentId}/content`
        const response = await fetch(new_url);
        const data = await response.json();
        console.warn(data);
        assignmentData = data;
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getQuestions() {
    const assignmentData = await getAssignment();
    const questionData = assignmentData;
    console.warn(questionData);
    return questionData;
}

interface YTNamespace {
    get: (id: string) => any;
}

interface Window {
    YT: YTNamespace;
    onYouTubeIframeAPIReady: () => void;
}

function editVideoData(): void {
    const maxSpeed = 2;
    const iframe = window.document.querySelector("iframe") as HTMLIFrameElement;
    if (!iframe.id) {
        alert("Error: Count not find YouTube Iframe.");
        return;
    }

    const player = window.YT.get(iframe.id)
    let events: any;
    for (let key in player) {
        let item = player[key];
        if (item + "" != "[object Object]") continue;
        for (let key_2 in item) {
            let item_2 = item[key_2];
            if (Array.isArray(item_2) && typeof item_2[1] == "string" && item_2[1].startsWith("on")) {
                events = item[key_2];
                break;
            }
        }
        if (events) break;
    }

    for (let i = 1; i < events.length; i++) {
        let event = events[i];
        if (event == "onPlaybackRateChange") {
            events[i + 1] = function () { };
        }
    }
    player.setPlaybackRate(maxSpeed)

    document.addEventListener("visibilitychange", (e) => {
        if (document.visibilityState) {
            e.stopImmediatePropagation();
        }
    }, true)
}
appendQuestions();