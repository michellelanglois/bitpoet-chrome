/*
Functions and variables related to the core logic of the extension.
 */

let dictsAreCreated;

// EFFECTS: makes buttons clickable with appropriate event listeners
window.addEventListener('DOMContentLoaded', function () {
    document.getElementById("free").addEventListener("click", startCreating.bind(null, "free"));
    document.getElementById("haiku").addEventListener("click", startCreating.bind(null, "haiku"));
    document.getElementById("limerick").addEventListener("click", startCreating.bind(null, "limerick"));
    document.getElementById("reset").addEventListener("click", swapDivs);
    document.getElementById("clipboard").addEventListener("click", copyToClipboard);
    document.getElementById("again").addEventListener("click", makePoem);
});

// EFFECTS: kicks off poem generation; calls makePoem() if dictionaries already exist, or gets text from active tab
function startCreating(type) {
    // set poemType variable in poem.js
    poemType = type;
    // flip to poem display area of popup
    swapDivs();
    // if we already have a dictionary made, make a poem; otherwise get website text to make dictionary
    if (dictsAreCreated) {
        makePoem();
    } else {
        dictsAreCreated = true;
        getText();
    }
}

// EFFECTS: gets text from current active tab, then processes it into dictionaries when text obtained
function getText() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        const scriptToExec = `(${scrapeThePage})()`;
        const text = chrome.tabs.executeScript(activeTab.id, {code: scriptToExec}, processText);
    });
}

// either copies entire website text or selected text
function scrapeThePage() {
    var text = window.getSelection().toString().trim();
    if (text === "") text = document.body.innerText;
    return text;
}

// EFFECTS: on receipt of text from active tab, creates dictionaries, then makes poem
function processText(text, sender, sendResponse) {
    // response is received as an array, so we need to access first element only
    if (text[0].length === 0) {
        document.getElementById("poem").innerHTML = "Images and pdfs<br>are worth many words<br>but make a lousy poem";
    } else {
        makePOSDictionary(text[0]);
        makePoem();
    }
}

// EFFECTS: updates the poem div with the just-generated poem
function updatePoemDiv() {
    document.getElementById("poem").innerHTML = poem;
}

// EFFECTS: swaps the div being displayed in the popup window
function swapDivs() {
    greet = document.getElementById("popup-default");
    poem = document.getElementById("popup-poem");

    // sets poem display background color based on poem type
    switch (poemType) {
        case "free":
            poem.style.background = "#fb9b08";
            break;
        case "haiku":
            poem.style.background = "#00a0a0";
            break;
        case "limerick":
            poem.style.background = "#007f4f";
            break;
    }

    if (poem.style.display === "none") {
        greet.style.display = "none";
        poem.style.display = "block";
    } else {
        greet.style.display = "block";
        poem.style.display = "none";
    }
}

// EFFECTS: allows user to copy poem text to their clipboard when button clicked
function copyToClipboard() {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy)
    dummy.value = poem.split("<br>").join(" ");
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}