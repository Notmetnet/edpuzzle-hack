"use strict";
function extractEdpuzzleIds(url) {
    const assignmentMatch = url.match(/assignments\/([a-f0-9]{24})/);
    const assignmentId = assignmentMatch ? assignmentMatch[1] : null;
    const urlObj = new URL(url);
    const attachmentId = urlObj.searchParams.get("attachmentId");
    return { assignmentId, attachmentId };
}
const api_url = "https://edpuzzle.com/api/v3/learning/assignments/";
const { assignmentId, attachmentId } = extractEdpuzzleIds(window.location.href);
const new_url = `${api_url}${assignmentId}/attachments/${attachmentId}/content`;
alert(new_url);
async function getContent() {
    try {
        const response = await fetch(new_url);
        const data = await response.json();
        console.warn(data);
    }
    catch (error) {
        console.error(error);
    }
}
getContent().then(() => {
    console.log("Content fetched");
}).catch(console.error);
