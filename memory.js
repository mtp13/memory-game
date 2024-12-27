"use strict";

import { faces } from "./faces.js";

const TIMEOUT = 750;
const CHEAT_MODE = { ENABLED: "enabled", DISABLED: "disabled" };
const GAME_DIFFICULTY = { EASY: 4, MEDIUM: 8, HARD: 14 };
let facePairsCount = GAME_DIFFICULTY.EASY;
let firstSelectedCard = null;
let secondSelectedCard = null;
let isCardClickPrevented = false;
let triesCount = 0;
let isNameVisibleOnCards = false;
const preloadedImageCache = {};
const totalImagesToLoad = faces.length;
console.log(totalImagesToLoad);
let cardElements = null;

function preloadFaceImages() {
  let loadedImagesCount = 0;
  faces.forEach((face) => {
    const img = new Image();
    img.src = `Assets/${face.img[getRandomInteger(face.img.length)]}`;

    img.onload = () => {
      loadedImagesCount += 1;
      preloadedImageCache[face.name] = img;
      goo;
      console.log(face.name, img);
      if (loadedImagesCount === totalImagesToLoad) {
        initializeGame();
      }
    };
    img.onerror = () => console.error(`Failed to load image for ${face.name}`);
  });
}

function createCardGrid(numberOfCards) {
  const $grid = document.getElementById("grid");
  $grid.innerHTML = "";
  for (let i = 1; i <= numberOfCards; i++) {
    let newCard = document.createElement("div");
    newCard.id = `${i}`;
    newCard.classList.add("card");
    $grid.appendChild(newCard);
  }
}

function initializeCheatMode(state) {
  if (state === CHEAT_MODE.DISABLED) {
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
      toggleCardNamesVisibility();
      isNameVisibleOnCards = !isNameVisibleOnCards;
    }
  });
}

function keyDownEventHandler(event) {
  if (event.code === "Backquote") {
    toggleCardNamesVisibility();
    isNameVisibleOnCards = !isNameVisibleOnCards;
  }
}

function toggleCardNamesVisibility() {
  for (let card of cardElements) {
    if (isCardMatched(card) || isCardFaceUp(card)) {
      continue;
    }
    if (isNameVisibleOnCards) {
      card.innerText = card.id;
    } else {
      card.innerText = capitalizeFirstCharacter(card.dataset.face);
    }
  }
}

function getRandomInteger(max) {
  return Math.floor(Math.random() * max);
}

function initializeGame() {
  firstSelectedCard = secondSelectedCard = null;
  triesCount = 0;
  isCardClickPrevented = false;
  isNameVisibleOnCards = false;
  createCardGrid(facePairsCount * 2);
  initializeCards();
  setStatusMessage("Good luck!");
}

function initializeCards() {
  function getRandomKeys(obj, numKeys) {
    const keys = Object.keys(obj);
    const randomKeys = [];
    while (randomKeys.length < numKeys) {
      const randomIndex = getRandomInteger(keys.length);
      const key = keys[randomIndex];
      if (!randomKeys.includes(key)) {
        randomKeys.push(key);
      }
    }
    return randomKeys;
  }
  const faces = getRandomKeys(preloadedImageCache, facePairsCount);
  const cardFaces = [...faces, ...faces];

  cardElements = document.querySelectorAll(".card");
  cardElements.forEach((card) => {
    const face = cardFaces.splice(getRandomInteger(cardFaces.length), 1);
    card.dataset.face = face;
    card.dataset.matched = "false";
    card.dataset.faceUp = "false";
    card.innerText = card.id;
    card.addEventListener("click", handleCardClick);
  });
}

function advanceToNextTurn() {
  triesCount += 1;
  setStatusMessage(`Number of tries: ${triesCount}`);
  if (document.querySelectorAll("[data-matched='false']").length > 0) {
    setTimeout(hideFaceUpCards, TIMEOUT);
  } else {
    setStatusMessage(`Good game. ${triesCount} tries.`);
  }
}

function hideFaceUpCards() {
  [firstSelectedCard, secondSelectedCard].forEach((card) => {
    if (card && !isCardMatched(card)) {
      flipCardFace(card);
    }
  });
  firstSelectedCard = null;
  secondSelectedCard = null;
  isCardClickPrevented = false;
}

function flipCardFace(card) {
  if (!card) console.warn("Attempted to reset a null or undefined card.");
  card.innerText = !isNameVisibleOnCards
    ? card.id
    : capitalizeFirstCharacter(card.dataset.face);
  card.dataset.faceUp = "false";
}

function isCardMatched(card) {
  return card.dataset.matched === "true";
}

function isCardFaceUp(card) {
  return card.dataset.faceUp === "true";
}

function handleCardClick() {
  if (
    this === firstSelectedCard ||
    isCardClickPrevented ||
    this.dataset.matched === "true"
  ) {
    return;
  }

  isCardClickPrevented = true;
  revealCardFace(this);
  if (!firstSelectedCard) {
    firstSelectedCard = this;
    isCardClickPrevented = null;
  } else {
    secondSelectedCard = this;
    if (secondSelectedCard.dataset.face === firstSelectedCard.dataset.face) {
      setCardsAsMatched(firstSelectedCard, secondSelectedCard);
      setTimeout(advanceToNextTurn, TIMEOUT);
    } else {
      setStatusMessage("Match Not Found");
      setTimeout(hideUnmatchedCards, TIMEOUT);
    }
  }
}

function revealCardFace(card) {
  const face = card.dataset.face;
  const img = preloadedImageCache[face];
  if (img && img.complete) {
    card.innerText = "";
    card.appendChild(img.cloneNode()); // Use a clone of the preloaded image
    card.dataset.faceUp = "true";
  } else {
    console.error(`Image for ${face} is not preloaded or failed to load.`);
  }
}

function hideUnmatchedCards() {
  flipCardFace(firstSelectedCard);
  flipCardFace(secondSelectedCard);
  advanceToNextTurn();
}

function setCardsAsMatched(card1, card2) {
  card1.dataset.matched = card2.dataset.matched = "true";
  setStatusMessage("Match Found");
}

function setStatusMessage(message) {
  const $status = document.getElementById("status");
  $status.innerText = message;
}

function capitalizeFirstCharacter(word) {
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
        facePairsCount = GAME_DIFFICULTY.EASY;
        initializeGame();
        break;
      case "medium":
        facePairsCount = GAME_DIFFICULTY.MEDIUM;
        initializeGame();
        break;
      case "hard":
        facePairsCount = GAME_DIFFICULTY.HARD;
        initializeGame();
        break;
      default:
        alert("Invalid game mode selected.");
    }
  });
}

window.startNewGame = initializeGame;
preloadFaceImages();
initializeGameModeSelector("gameModeForm");
initializeCheatMode(CHEAT_MODE.DISABLED);
