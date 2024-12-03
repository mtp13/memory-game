let firstCard = null;
let secondCard = null;
let isClickPrevented = null;
let numberOfTries = 0;
const ON = "ON";
const OFF = "OFF";
const TOGGLE = "TOGGLE";

/**
 * Enables or disables cheat mode for the memory game.
 * When cheat mode is enabled, it listens for keydown events to trigger cheat functionalities.
 * When cheat mode is disabled, it stops listening for keydown events and hides cheat information.
 *
 * @param {boolean} enable - A boolean value indicating whether to enable (true) or disable (false) cheat mode.
 */
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
    // card.style.backgroundColor = "white";
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
  isClickPrevented = null;
}

/**
 * Handles the logic for when a card is clicked in the memory game.
 */
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

/**
 * Displays the image for the given card.
 *
 * @param {HTMLElement} card - The card element to show.
 */
function showCard(card) {
  card.innerHTML = `<img src="Assets/${card.dataset.color}.png">`;
}

/**
 * Marks the given cards as matched.
 *
 * @param {HTMLElement} card1 - The first card element.
 * @param {HTMLElement} card2 - The second card element.
 */
function markCardsAsMatched(card1, card2) {
  card1.dataset.matched = card2.dataset.matched = "true";
}

/**
 * Resets the displayed cards after a mismatch.
 */
function resetCards() {
  firstCard.innerHTML = "";
  secondCard.innerHTML = "";
  nextTurn();
}

resetGame();

enableCheatMode(true);
