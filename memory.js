let firstCard = null;
let secondCard = null;
let isClickPrevented = null;
let numberOfTries = 0;
let showCheat = true;

function enableCheatMode(enable) {
  if (!enable) {
    console.log("cheat mode disabled");
    document.removeEventListener("keydown", keyDownEventHandler);
    return;
  }
  console.log("cheat mode enabled");
  document.addEventListener("keydown", keyDownEventHandler);
}

function keyDownEventHandler(event) {
  if (event.code === "Backquote") {
    showColorCheat();
  }
}

function showColorCheat() {
  const $cards = document.querySelectorAll(".card");
  for (let card of $cards) {
    if (card.dataset.matched === "true" || card.dataset.shown === "true") {
      continue;
    }
    if (showCheat) {
      card.innerHTML = card.dataset.color;
      card.style.color = "white";
    } else {
      card.innerHTML = "";
    }
  }
  showCheat = !showCheat;
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function resetGame() {
  const uniqueColors = [
    "pops2",
    "gigi2",
    "cole2",
    "walker2",
    "roman2",
    "millie2",
    "virginia2",
    "elyse2",
  ];
  const cardColors = [...uniqueColors, ...uniqueColors];
  const $cards = document.querySelectorAll(".card");

  for (const card of $cards) {
    const color = cardColors.splice(getRandomNumber(cardColors.length), 1);
    card.dataset.color = color;
    card.dataset.matched = "false";
    card.innerHTML = "";
    card.addEventListener("click", onCardClicked);
  }
  numberOfTries = 0;
  resetShownCards();
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
  isClickPrevented = null;
}

function onCardClicked() {
  if (
    this === firstCard ||
    isClickPrevented ||
    this.dataset.matched === "true"
  ) {
    return;
  }
  isClickPrevented = true;
  if (!firstCard) {
    firstCard = this;
    showCard(firstCard);
    isClickPrevented = null;
  } else {
    secondCard = this;
    showCard(secondCard);
    if (secondCard.dataset.color === firstCard.dataset.color) {
      markCardsAsMatched(firstCard, secondCard);
      document.getElementById("status").innerHTML = "Match Found";
      setTimeout(nextTurn, 1000);
    } else {
      document.getElementById("status").innerHTML = "Match Not Found";
      setTimeout(resetCards, 1000);
    }
  }
}

function showCard(card) {
  card.innerHTML = `<img src="Assets/${card.dataset.color}.png">`;
  card.dataset.shown = "true";
}

function markCardsAsMatched(card1, card2) {
  card1.dataset.matched = card2.dataset.matched = "true";
}

function resetCards() {
  firstCard.innerHTML = "";
  firstCard.dataset.shown = "false";
  secondCard.innerHTML = "";
  secondCard.dataset.shown = "false";
  nextTurn();
}

resetGame();

enableCheatMode(true);
