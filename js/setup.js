import { BOARD_SIZE } from "./constants.js";
import {
  playerGridEl,
  opponentGridEl,
  instructionsToggle,
  gameInfoPanel,
  shipCountInput,
} from "./dom.js";
import { cellIdPlayer, cellIdOpponent, coordFromId } from "./helpers.js";
import { updateShipCounters, updateSetupTurnIndicator, setLogs } from "./ui.js";
import { state } from "./state.js";

export function buildGrids() {
  if (playerGridEl) {
    playerGridEl.innerHTML = "";
  }
  if (opponentGridEl) {
    opponentGridEl.innerHTML = "";
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const playerCell = document.createElement("button");
      playerCell.type = "button";
      playerCell.className = "grid-cell";
      playerCell.id = cellIdPlayer(r, c);
      playerCell.setAttribute("data-coord", coordFromId(playerCell.id));

      const opponentCell = document.createElement("button");
      opponentCell.type = "button";
      opponentCell.className = "grid-cell";
      opponentCell.id = cellIdOpponent(r, c);
      opponentCell.setAttribute("data-coord", coordFromId(opponentCell.id));

      playerGridEl.appendChild(playerCell);
      opponentGridEl.appendChild(opponentCell);
    }
  }
}

export function setupInstructionsToggle() {
  if (!instructionsToggle || !gameInfoPanel) return;
  instructionsToggle.addEventListener("click", () => {
    const open = gameInfoPanel.classList.toggle("battleship-game__info--open");
    instructionsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

export function initUI() {
  if (shipCountInput) {
    const parsed = parseInt(shipCountInput.value, 10);
    state.totalShipsPlanned = Number.isNaN(parsed) ? 3 : parsed;
    shipCountInput.value = String(state.totalShipsPlanned);
  }

  state.currentShipIndex = 0;

  updateSetupTurnIndicator();
  setLogs(
    `<h3>Define ship 1 of ${state.totalShipsPlanned}.<br/>Click squares on your board to build a straight ship, then press <span class="status-coordinate">Finish Ship</span>.</h3>`,
    ""
  );
  updateShipCounters();
}
