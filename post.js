fetch("http://127.0.0.1:5090/edpuzzle", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        "id": "67255ffd08f3511b2a42c403"
    })
})
.then(response => response.json())
.then(data => {
    console.log(data)
})
.catch(error => {
    console.error(error);
})