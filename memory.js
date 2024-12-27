"use strict";

import { faces } from "./faces.js";

const TIMEOUT = 750;
const CHEAT_MODE_STATE = { ENABLED: "enabled", DISABLED: "disabled" };
const NUMBER_OF_FACE_PAIRS = 8;
let firstCard = null;
let secondCard = null;
let isClickPrevented = false;
let numberOfTries = 0;
let areNamesShown = false;
const preloadedImages = {};
const IMAGES_TO_LOAD = 14;
const $cards = document.querySelectorAll(".card");

function preloadImages() {
  let loadedImagesCount = 0;
  faces.forEach((face) => {
    const img = new Image();
    img.src = `Assets/${face.img[getRandomNumber(face.img.length)]}`;

    img.onload = () => {
      loadedImagesCount += 1;
      preloadedImages[face.name] = img;
      if (loadedImagesCount === IMAGES_TO_LOAD) {
        startNewGame();
      }
    };
    img.onerror = () => console.error(`Failed to load image for ${face.name}`);
  });
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
      card.innerText = card.dataset.face.toUpperCase();
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
  setupCards();
  updateTries(numberOfTries);
  updateStatus("Ready to play. Good luck!");
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
  const faces = getRandomKeys(preloadedImages, NUMBER_OF_FACE_PAIRS);
  const cardFaces = [...faces, ...faces];

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
  updateTries(numberOfTries);
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
  card.innerText = !areNamesShown ? card.id : card.dataset.face.toUpperCase();
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
      nextTurn();
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

function updateTries(number) {
  const $tries = document.getElementById("tries");
  $tries.innerText = `Number of tries: ${number}`;
}

function updateStatus(message) {
  const $status = document.getElementById("status");
  $status.innerText = message;
  setTimeout(() => {
    $status.innerText = "";
  }, 1500);
}

window.startNewGame = startNewGame;
preloadImages();
setupCheatMode(CHEAT_MODE_STATE.ENABLED);
