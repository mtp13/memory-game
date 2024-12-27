"use strict";

import { faces } from "./faces.js";

const TIMEOUT = 750;
const CHEAT_MODE_STATE = { ENABLED: "enabled", DISABLED: "disabled" };
const DIFFICULTY_LEVEL = { EASY: 4, MEDIUM: 8, HARD: 14 };
let numberOfFacePairs = DIFFICULTY_LEVEL.EASY;
let firstCard = null;
let secondCard = null;
let isClickPrevented = false;
let numberOfTries = 0;
let areNamesShown = false;
const preloadedImages = {};
const IMAGES_TO_LOAD = faces.length;
console.log(IMAGES_TO_LOAD);
let $cards = null;

function preloadImages() {
  let loadedImagesCount = 0;
  faces.forEach((face) => {
    const img = new Image();
    img.src = `Assets/${face.img[getRandomNumber(face.img.length)]}`;

    img.onload = () => {
      loadedImagesCount += 1;
      preloadedImages[face.name] = img;
      console.log(face.name, img);
      if (loadedImagesCount === IMAGES_TO_LOAD) {
        startNewGame();
      }
    };
    img.onerror = () => console.error(`Failed to load image for ${face.name}`);
  });
}

function generateCardGrid(numberOfCards) {
  const $grid = document.getElementById("grid");
  $grid.innerHTML = "";
  for (let i = 1; i <= numberOfCards; i++) {
    let newCard = document.createElement("div");
    newCard.id = `${i}`;
    newCard.classList.add("card");
    $grid.appendChild(newCard);
  }
}

function setupCheatMode(state) {
  if (state === CHEAT_MODE_STATE.DISABLED) {
    document.removeEventListener("keydown", keyDownEventHandler);
    return;
  }
  document.addEventListener("keydown", keyDownEventHandler);

  let touchStartTime;
  document.addEventListener("touchstart", () => {
    touchStartTime = Date.now();
  });

  document.addEventListener("touchend", () => {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration > 1000) {
      // Consider it a long press if over 1000ms
      toggleNamesOnCards();
      areNamesShown = !areNamesShown;
    }
  });
}

function keyDownEventHandler(event) {
  if (event.code === "Backquote") {
    toggleNamesOnCards();
    areNamesShown = !areNamesShown;
  }
}

function toggleNamesOnCards() {
  for (let card of $cards) {
    if (isMatched(card) || isShown(card)) {
      continue;
    }
    if (areNamesShown) {
      card.innerText = card.id;
    } else {
      card.innerText = capitalizeFirstLetter(card.dataset.face);
    }
  }
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function startNewGame() {
  firstCard = secondCard = null;
  numberOfTries = 0;
  isClickPrevented = false;
  areNamesShown = false;
  generateCardGrid(numberOfFacePairs * 2);
  setupCards();
  updateStatus("Good luck!");
}

function setupCards() {
  function getRandomKeys(obj, numKeys) {
    const keys = Object.keys(obj);
    const randomKeys = [];
    while (randomKeys.length < numKeys) {
      const randomIndex = getRandomNumber(keys.length);
      const key = keys[randomIndex];
      if (!randomKeys.includes(key)) {
        randomKeys.push(key);
      }
    }
    return randomKeys;
  }
  const faces = getRandomKeys(preloadedImages, numberOfFacePairs);
  const cardFaces = [...faces, ...faces];

  $cards = document.querySelectorAll(".card");
  $cards.forEach((card) => {
    const face = cardFaces.splice(getRandomNumber(cardFaces.length), 1);
    card.dataset.face = face;
    card.dataset.matched = "false";
    card.dataset.shown = "false";
    card.innerText = card.id;
    card.addEventListener("click", onCardClicked);
  });
}

function nextTurn() {
  numberOfTries += 1;
  updateStatus(`Number of tries: ${numberOfTries}`);
  if (document.querySelectorAll("[data-matched='false']").length > 0) {
    setTimeout(resetShownCards, TIMEOUT);
  } else {
    document.getElementById("status").innerText = "Good game!";
  }
}

function resetShownCards() {
  [firstCard, secondCard].forEach((card) => {
    if (card && !isMatched(card)) {
      flipCard(card);
    }
  });
  firstCard = null;
  secondCard = null;
  isClickPrevented = false;
}

function flipCard(card) {
  if (!card) console.warn("Attempted to reset a null or undefined card.");
  card.innerText = !areNamesShown
    ? card.id
    : capitalizeFirstLetter(card.dataset.face);
  card.dataset.shown = "false";
}

function isMatched(card) {
  return card.dataset.matched === "true";
}

function isShown(card) {
  return card.dataset.shown === "true";
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
  showCard(this);
  if (!firstCard) {
    firstCard = this;
    isClickPrevented = null;
  } else {
    secondCard = this;
    if (secondCard.dataset.face === firstCard.dataset.face) {
      markCardsAsMatched(firstCard, secondCard);
      setTimeout(nextTurn, TIMEOUT);
    } else {
      updateStatus("Match Not Found");
      setTimeout(resetCards, TIMEOUT);
    }
  }
}

function showCard(card) {
  const face = card.dataset.face;
  const img = preloadedImages[face];
  if (img && img.complete) {
    card.innerText = "";
    card.appendChild(img.cloneNode()); // Use a clone of the preloaded image
    card.dataset.shown = "true";
  } else {
    console.error(`Image for ${face} is not preloaded or failed to load.`);
  }
}

function resetCards() {
  flipCard(firstCard);
  flipCard(secondCard);
  nextTurn();
}

function markCardsAsMatched(card1, card2) {
  card1.dataset.matched = card2.dataset.matched = "true";
  updateStatus("Match Found");
}

function updateStatus(message) {
  const $status = document.getElementById("status");
  $status.innerText = message;
}

function capitalizeFirstLetter(word) {
  if (!word) return ""; // Handle empty or undefined input
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function initializeGameModeSelector(formId) {
  const form = document.getElementById(formId);

  if (!form) {
    console.error(`Form with ID "${formId}" not found.`);
    return;
  }

  form.addEventListener("input", (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get the selected game mode
    const gameMode = form.gameMode.value;

    if (!gameMode) {
      alert("Please select a game mode.");
      return;
    }

    console.log(`Selected Game Mode: ${gameMode}`);

    // Perform actions based on the selected game mode
    switch (gameMode) {
      case "easy":
        numberOfFacePairs = DIFFICULTY_LEVEL.EASY;
        startNewGame();
        break;
      case "medium":
        numberOfFacePairs = DIFFICULTY_LEVEL.MEDIUM;
        startNewGame();
        break;
      case "hard":
        numberOfFacePairs = DIFFICULTY_LEVEL.HARD;
        startNewGame();
        break;
      default:
        alert("Invalid game mode selected.");
    }
  });
}

window.startNewGame = startNewGame;
preloadImages();
initializeGameModeSelector("gameModeForm");
setupCheatMode(CHEAT_MODE_STATE.ENABLED);
