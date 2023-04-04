let firstCard = null;
let secondCard = null;
let preventClick = null;
let numberOfTries = 0;
const ON = "ON";
const OFF = "OFF";
const TOGGLE = "TOGGLE";

let pictures = {
    elsyse: "elyse.png",
    cole: "cole.png",
    walker: "walker.png",
    roman: "roman.png",
    millie: "millie.png",
    virginia: "virginia.png",
    pops: "pops.png",
    gigi: "gigi.png",
};

function enableCheatMode(enable) {
    if (!enable) {
        console.log("cheat mode disabled");
        showColorCheat(OFF);
        document.removeEventListener("keydown", keyDownEventHandler);
        return;
    }
    console.log("cheat mode enabled");
    document.addEventListener("keydown", keyDownEventHandler);
}

function keyDownEventHandler(event) {
    // console.log(event.code);
    if (event.code === "Backquote") {
        showColorCheat(TOGGLE);
    }
}

function showColorCheat(mode) {
    if (!mode) mode = TOGGLE;
    let cards = document.querySelectorAll(".card");
    for (let card of cards) {
        if (mode === ON) card.innerHTML = card.dataset.color;
        if (mode === OFF) card.innerHTML = "";
        if (mode === TOGGLE) {
            if (card.innerHTML === "") {
                card.innerHTML = card.dataset.color;
            } else {
                card.innerHTML = "";
            }
        }
    }
}

function getRandomNumber(max) {
    return Math.floor(Math.random() * max);
}

function resetGame() {
    const uniqueColors = [
        "pops",
        "gigi",
        "cole",
        "walker",
        "roman",
        "millie",
        "virginia",
        "elyse",
    ];
    let cardColors = [...uniqueColors, ...uniqueColors];
    let cards = document.querySelectorAll(".card");

    for (let card of cards) {
        let color = cardColors.splice(getRandomNumber(cardColors.length), 1);
        card.dataset.color = color;
        console.log(color);
        card.dataset.matched = "false";
        card.style.backgroundColor = "white";
        card.innerHTML = "";
        card.addEventListener("click", onCardClicked);
        numberOfTries = 0;
        resetShownCards();
    }
}

function nextTurn() {
    numberOfTries += 1;
    if (document.querySelectorAll("[data-matched='false']").length > 0) {
        resetShownCards();
    } else {
        document.getElementById("status").innerHTML =
            "Good game! Tries: " + numberOfTries;
    }
}

function resetShownCards() {
    firstCard = null;
    secondCard = null;
    document.getElementById("status").innerHTML =
        "Click two squares to play. Tries: " + numberOfTries;
    preventClick = null;
}

function onCardClicked() {
    if (this === firstCard || preventClick || this.dataset.matched === "true") {
        return;
    }
    preventClick = true;
    if (!firstCard) {
        firstCard = this;
        firstCard.innerHTML =
            "<img src=Assets/" + firstCard.dataset.color + ".png" + ">";
        preventClick = null;
    } else {
        secondCard = this;
        secondCard.innerHTML =
            "<img src=Assets/" + secondCard.dataset.color + ".png" + ">";
        if (secondCard.dataset.color === firstCard.dataset.color) {
            firstCard.dataset.matched = secondCard.dataset.matched = "true";
            document.getElementById("status").innerHTML = "Match Found";
            setTimeout(nextTurn, 1000);
        } else {
            document.getElementById("status").innerHTML = "Match Not Found";
            setTimeout(function () {
                firstCard.innerHTML = "";
                secondCard.innerHTML = "";
                nextTurn();
            }, 1000);
        }
    }
}

resetGame();

enableCheatMode(false);
