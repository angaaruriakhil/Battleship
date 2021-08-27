let allPlayerButtons = document.querySelectorAll(".battleship-game__Player-grid__buttons");
let allGuessButtons = document.querySelectorAll(".battleship-game__Guess-grid__buttons");
let gameLog = document.querySelector(".battleship-game__info__log-content");
// Function defined separately so I can use removeEventListener later to lock in ship choices (not possible with anonymous functions) 
function chooseShips(event) {
  event.target.classList.toggle("ship-location-choice");
}

allPlayerButtons.forEach(coordinate => {
  coordinate.addEventListener("click", chooseShips)
})

// Lock ship choices in after "Start Game" is pressed. 
const startGameButton = document.querySelector(".battleship-game__info__start-game-button"); 

startGameButton.addEventListener("click", runGame);

function runGame() {
  // Remove ability to add new ships after game is started.
  allPlayerButtons.forEach(coordinate => {
    coordinate.removeEventListener("click", chooseShips);
  })
  let gameLogTitle = document.querySelector(".battleship-game__info__log-title");
  gameLogTitle.classList.toggle("display-log-title");
  startGameButton.classList.add("game-started"); 
  // Store your ship choices.
  let playerShips = document.querySelectorAll(".ship-location-choice"); // Note this returns a node list. We need to use the spread operator to turn this into an array so that we can use the .filter or .map array iteration methods.
  let playerShipsArray = [...playerShips].map(ship => {return ship.id}); // Make new array with all ship choices 
  const numberOfShips = playerShipsArray.length; // Get number of ships (used to make an equal number of ships for opponent) 
  let opponentBoardIdArray = [...allGuessButtons].map(button => {return button.id});
  let opponentShipsIndexArray = []; // Make this equal to an array containing indexes chosen randomly from 0-100. Amount of indexes generated is equal to number of ships chosen by the player. 
  // Use a for loop to generate this. 
  for (i=0; i<numberOfShips; i++) {
    opponentShipsIndexArray.push(Math.floor(Math.random() * 100));
  }
  let opponentShipsIdArray = opponentShipsIndexArray.map(index => {
    return opponentBoardIdArray[index];
  })
  console.log(opponentShipsIdArray);
  allGuessButtons.forEach(coordinate => {
    coordinate.addEventListener("click", (e) => {
      handleGuess(opponentShipsIdArray, e.target.id, e.target.classList);
    });
  })
}

const handleGuess = (shipsArr, id, classList) => {
  // 1. Determine if it's a hit
  const isHit = isValidHit(shipsArr, id);
  console.log(isHit); 
  // 2. For valid hits, remove it from the array and display it on the game log. 
  if (isHit) {
    removeShip(shipsArr, id, classList);
    classList.toggle("ship-guess-choice-success");
    gameLog.innerHTML = "<h3> You got a hit! </h3>";
  } else {
    classList.toggle("ship-guess-choice-fail");
    gameLog.innerHTML = "<h3> You missed! </h3>";
  }
  // 3. If The array length is zero - They have no more ships left - they loose!
  if (shipsArr.length == 0) {
    gameLog.innerHTML = "<h3> Well Done. You have won Battleship! <br> Your grand prize is: Nothing. </h3>";
  }
}

const isValidHit = (shipsArr, id) => {
  if (shipsArr.includes(id)) {
    return true;
  } else {
    return false;
  }
}

const removeShip = (shipsArr, id) => {
  const index = shipsArr.indexOf(id);
  shipsArr.splice(index, 1);
  return index > -1;
}


// When doing machine guesses, if your ships arr = 0 then change inner html of log to this "<h3> Oh no! All your ships are sunk and you have lost Battleship. <br> Better luck next time! </h3>" also whenever they get a hit or miss display that too. 







