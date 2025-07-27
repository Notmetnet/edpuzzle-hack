const assignment_id = window.location.href.split("/")[4];
const edpuzzle_api = "https://edpuzzle.com/api/v3/learning/assignments/";

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

        console.log(data);
        
        const mainId = data.content.data.sections[0]._id;
        console.log(mainId);
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

function extractEdpuzzleIds(url) {
    const assignmentMatch = url.match(/assignments\/([a-f0-9]{24})/);
    const assignmentId = assignmentMatch ? assignmentMatch[1] : null;
    const urlObj = new URL(url);
    const attachmentId = urlObj.searchParams.get("attachmentId");
    return { assignmentId, attachmentId };
}

getAssignment();