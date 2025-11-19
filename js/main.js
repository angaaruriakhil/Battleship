// main.js
import { buildGrids, setupInstructionsToggle, initUI } from "./setup.js";
import {
  playerGridEl,
  opponentGridEl,
  finishShipButton,
  startGameButton,
  quitButton,
  shipCountInput,
} from "./dom.js";
import {
  handlePlayerCellClick,
  handleGuessClick,
  handleFinishShip,
  startGame,
  handleShipCountChange,
} from "./gameplay.js";

// Build grids
buildGrids();

// Grid clicks
if (playerGridEl) {
  playerGridEl.addEventListener("click", handlePlayerCellClick);
}
if (opponentGridEl) {
  opponentGridEl.addEventListener("click", handleGuessClick);
}

// Controls
if (finishShipButton) {
  finishShipButton.addEventListener("click", handleFinishShip);
}
if (startGameButton) {
  startGameButton.addEventListener("click", startGame);
}
if (quitButton) {
  quitButton.addEventListener("click", () => {
    window.location.reload();
  });
}
if (shipCountInput) {
  shipCountInput.addEventListener("change", handleShipCountChange);
}

setupInstructionsToggle();
initUI();
