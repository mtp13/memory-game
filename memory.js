let firstCard = null;
let secondCard = null;
let isClickPrevented = null;
let numberOfTries = 0;
let showCheat = true;

const preloadedImages = {};
const imagesToLoad = 8; // Number of unique colors/images to preload
let loadedImagesCount = 0;

let cards2 = [{ name: "pops", img: ["pops1.jpg", "pops2.jpg"] },
  {name: "gigi", img: ["gigi1.jpg", "gigi2.jpg"],},
  {name: "cole", img: ["cole1.jpg", "cole2.jpg"],},
  {name: "walker", img: ["walker1.jpg", "walker2.jpg"],},
  {name: "roman", img: ['roman1.jpg', 'roman2.jpg'],},
  {name: "millie", img: ['millie1.jpg', 'millie2.jpg'],},
  {name: "virginia", img: ['virginia1.jpg', 'virginia2.jpg'],},
  {name: "elyse", img: ['elyse1.jpg', 'elyse2.jpg'],},
];
function preloadImages() {
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

  for (const color of uniqueColors) {
    const img = new Image(); // Create a new Image object
    img.src = `Assets/${color}.jpg`; // Set the image source

    // Increment the counter once the image has loaded
    img.onload = () => {
      loadedImagesCount += 1;
      preloadedImages[color] = img; // Store the image in the preloadedImages object
      if (loadedImagesCount === imagesToLoad) {
        console.log("All images preloaded!");
        resetGame(); // Start the game once all images are preloaded
      }
    };

    // If the image fails to load, log an error
    img.onerror = () => {
      console.error(`Failed to load image for ${color}`);
    };
  }
}

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
      card.innerHTML = card.dataset.color.toUpperCase();
      card.style.color = "#023047";
      card.style.fontWeight = "bold";
    } else {
      card.innerHTML = card.id;
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
  numberOfTries = 0;

  for (const card of $cards) {
    const color = cardColors.splice(getRandomNumber(cardColors.length), 1);
    card.dataset.color = color;
    card.dataset.matched = "false";
    card.innerHTML = card.id;
    card.addEventListener("click", onCardClicked);
  }
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
  if (firstCard) {
    if (!isMatched(firstCard)) {
      firstCard.innerHTML = firstCard.id;
    }
    firstCard = null;
  }
  if (secondCard) {
    if (!isMatched(secondCard)) {
      secondCard.innerHTML = secondCard.id;
    }
    secondCard = null;
  }
  document.getElementById("status").innerHTML =
    "Number of Tries: " + numberOfTries;
  isClickPrevented = null;
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
  const color = card.dataset.color;
  const img = preloadedImages[color]; // Use the preloaded image
  if (img && img.complete) {
    card.innerHTML = ""; // Clear any existing content
    card.appendChild(img.cloneNode()); // Use a clone of the preloaded image
    card.dataset.shown = "true";
  } else {
    console.error(`Image for ${color} is not preloaded or failed to load.`);
  }
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

preloadImages();
enableCheatMode(true);
