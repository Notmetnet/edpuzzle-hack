let iframe = window.document.querySelector("iframe");
let speed = parseFloat(2);

if (iframe.id == null) {
    alert("Error: Could not find the Youtube iframe.");
}

let player = window.YT.get(iframe.id);
let events;
//search for attribute that stores yt event listeners
for (let key in player) {
    let item = player[key];
    if (item +"" != "[object Object]") continue;
    for (let key_2 in item) {
        let item_2 = item[key_2];
        
        if (Array.isArray(item_2) && typeof item_2[1] == "string" && item_2[1].startsWith("on")) {
            events = item[key_2];
            break;
        }
    }
    if (events) break;
}

for (let i=1; i<events.length; i+=3) {
    let event = events[i];
    if (event == "onPlaybackRateChange") {
        //overwrite event listener with a blank function
        events[i+1] = function(){};
    }
}

player.setPlaybackRate(speed)

window.addEventListener("visibilitychange", (e) => {
    if (document.visibilityState) {
        e.stopImmediatePropagation();
    }
}, true)