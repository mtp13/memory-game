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
}

function keyDownEventHandler(event) {
  if (event.code === "Backquote") {
    toggleNamesOnCards();
  }
}
function toggleNamesOnCards() {
  for (let card of $cards) {
    if (card.dataset.matched === "true" || card.dataset.shown === "true") {
      continue;
    }
    if (areNamesShown) {
      card.innerHTML = card.id;
    } else {
      card.innerHTML = card.dataset.face.toUpperCase();
    }
  }
  areNamesShown = !areNamesShown;
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function startNewGame() {
  firstCard = secondCard = null;
  numberOfTries = 0;
  isClickPrevented = false;
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

  for (const card of $cards) {
    const face = cardFaces.splice(getRandomNumber(cardFaces.length), 1);
    card.dataset.face = face;
    card.dataset.matched = "false";
    card.innerHTML = card.id;
    card.addEventListener("click", onCardClicked);
  }
  updateTries(numberOfTries);
  updateStatus("Good luck!");
  resetShownCards();
}

function nextTurn() {
  numberOfTries += 1;
  updateTries(numberOfTries);
  if (document.querySelectorAll("[data-matched='false']").length > 0) {
    setTimeout(resetShownCards, TIMEOUT);
  } else {
    document.getElementById("status").innerHTML = "Good game!";
  }
}

function resetShownCards() {
  if (firstCard) {
    if (!isMatched(firstCard)) {
      flipCard(firstCard);
    }
    firstCard = null;
  }
  if (secondCard) {
    if (!isMatched(secondCard)) {
      flipCard(secondCard);
    }
    secondCard = null;
  }
  updateTries(numberOfTries);
  isClickPrevented = null;
}

function flipCard(card) {
  card.innerHTML = card.id;
}

function isMatched(card) {
  return card.dataset.matched === "true";
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
      updateStatus("Match Found");
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
    card.innerHTML = "";
    card.appendChild(img.cloneNode()); // Use a clone of the preloaded image
    card.dataset.shown = "true";
  } else {
    console.error(`Image for ${face} is not preloaded or failed to load.`);
  }
}

function resetCards() {
  firstCard.innerHTML = "";
  firstCard.dataset.shown = "false";
  secondCard.innerHTML = "";
  secondCard.dataset.shown = "false";
  nextTurn();
}

function markCardsAsMatched(card1, card2) {
  card1.dataset.matched = card2.dataset.matched = "true";
}

function updateTries(number) {
  const $tries = document.getElementById("tries");
  $tries.innerHTML = `Number of tries: ${number}`;
}

function updateStatus(message) {
  const $status = document.getElementById("status");
  $status.innerHTML = message;
  $status.classList.add("flash");
  setTimeout(() => {
    $status.classList.remove("flash");
  }, 1000);
}

window.startGame = startNewGame;
preloadImages();
setupCheatMode(CHEAT_MODE_STATE.ENABLED);
