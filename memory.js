let firstCard = null;
let secondCard = null;
let isClickPrevented = null;
let numberOfTries = 0;
let showCheat = true;

const preloadedImages = {};
const imagesToLoad = 14;
let loadedImagesCount = 0;
const IMAGE_SET = 0;
let faces = [
  { name: "Pops", img: ["pops1.jpg", "pops2.jpg"] },
  { name: "Gigi", img: ["gigi1.jpg", "gigi2.jpg"] },
  { name: "Cole", img: ["cole1.jpg", "cole2.jpg"] },
  { name: "Walker", img: ["walker1.jpg", "walker2.jpg"] },
  { name: "Roman", img: ["roman1.jpg", "roman2.jpg"] },
  { name: "Millie", img: ["millie1.jpg", "millie2.jpg"] },
  { name: "Virginia", img: ["virginia1.jpg", "virginia2.jpg"] },
  { name: "Elyse", img: ["elyse1.jpg", "elyse2.jpg"] },
  { name: "Kristen", img: ["kristen1.jpg", "kristen2.jpg"] },
  { name: "Travis", img: ["travis1.jpg", "travis2.jpg"] },
  { name: "Darby", img: ["darby1.jpg", "darby2.jpg"] },
  { name: "Ryan", img: ["ryan1.jpg", "ryan2.jpg"] },
  { name: "Caroline", img: ["caroline1.jpg", "caroline2.jpg"] },
  { name: "Andrew", img: ["andrew1.jpg", "andrew2.jpg"] },
];

function preloadImages() {
  for (const face of faces) {
    const img = new Image();
    img.src = `Assets/${face.img[IMAGE_SET]}`;

    img.onload = () => {
      loadedImagesCount += 1;
      preloadedImages[face.name] = img;
      if (loadedImagesCount === imagesToLoad) {
        startGame();
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image for ${face.name}`);
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

function startGame() {
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

  const uniqueColors = getRandomKeys(preloadedImages, 8);
  console.log(Object.keys(preloadedImages));
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
  updateStatus("Good luck!");
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
  document.getElementById("tries").innerHTML =
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
  showCard(this);
  if (!firstCard) {
    firstCard = this;
    isClickPrevented = null;
  } else {
    secondCard = this;
    if (secondCard.dataset.color === firstCard.dataset.color) {
      markCardsAsMatched(firstCard, secondCard);
      updateStatus("Match Found");
      setTimeout(nextTurn, 750);
    } else {
      updateStatus("Match Not Found");
      setTimeout(resetCards, 750);
    }
  }
}

function updateStatus(message) {
  const $status = document.getElementById("status");
  $status.innerHTML = message;
  $status.classList.add("flash");
  setTimeout(() => {
    $status.classList.remove("flash");
  }, 1000);
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
