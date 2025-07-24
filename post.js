fetch("https://127.0.0.0:5090/ai", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        "prompt": "why is the sky blue?"
    })
})
.then(response => response.json())
.then(data => {
    console.log(data)
})
.catch(error => {
    console.error(error);
})