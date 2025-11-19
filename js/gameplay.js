// gameplay.js
import { BOARD_SIZE, THINK_DELAY } from "./constants.js";
import {
  playerGridEl,
  opponentGridEl,
  shipCountInput,
  finishShipButton,
  startGameButton,
  quitButton,
} from "./dom.js";
import {
  coordFromId,
  cellIdToRowCol,
  cellIdOpponent,
  createShip,
  findShipByCell,
  areAllShipsSunk,
} from "./helpers.js";
import {
  updateShipCounters,
  setTurn,
  updateSetupTurnIndicator,
  setLogs,
  endGame,
} from "./ui.js";
import { state } from "./state.js";

// --- PLAYER FLEET DEFINITION -------------------------------------------

export function handlePlayerCellClick(e) {
  if (state.phase !== "definingFleet") return;
  const cell = e.target;
  if (!(cell instanceof HTMLButtonElement)) return;

  const id = cell.id;

  // all ships done, ignore
  if (state.currentShipIndex >= state.totalShipsPlanned) return;

  // cannot use cells that belong to a finished ship
  if (state.playerShips.has(id) && !state.currentShipCells.has(id)) {
    setLogs(
      `<h3>That cell is already part of a finished ship.<br/>Choose a different cell.</h3>`
    );
    return;
  }

  // toggle membership in the current ship selection
  if (state.currentShipCells.has(id)) {
    state.currentShipCells.delete(id);
    cell.classList.remove("ship-location-choice");
  } else {
    state.currentShipCells.add(id);
    cell.classList.add("ship-location-choice");
  }

  // finish button enabled only if at least 2 cells selected
  if (finishShipButton) {
    finishShipButton.disabled = state.currentShipCells.size < 2;
  }
}

export function handleFinishShip() {
  if (state.phase !== "definingFleet") return;
  if (state.currentShipIndex >= state.totalShipsPlanned) return;

  if (state.currentShipCells.size < 2) {
    setLogs(
      `<h3>A ship must have at least <span class="status-coordinate">2</span> squares.</h3>`
    );
    return;
  }

  const cellIds = Array.from(state.currentShipCells);
  const coords = cellIds.map((id) => cellIdToRowCol(id));

  const sameRow = coords.every((c) => c.row === coords[0].row);
  const sameCol = coords.every((c) => c.col === coords[0].col);

  if (!sameRow && !sameCol) {
    setLogs(
      `<h3>Ships must be in a straight line (horizontal or vertical).<br/>Adjust your selection and try again.</h3>`
    );
    return;
  }

  if (sameRow) {
    const cols = coords.map((c) => c.col).sort((a, b) => a - b);
    for (let i = 1; i < cols.length; i++) {
      if (cols[i] !== cols[0] + i) {
        setLogs(
          `<h3>Ship cells must be continuous with no gaps.<br/>Adjust your selection and try again.</h3>`
        );
        return;
      }
    }
  } else if (sameCol) {
    const rows = coords.map((c) => c.row).sort((a, b) => a - b);
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] !== rows[0] + i) {
        setLogs(
          `<h3>Ship cells must be continuous with no gaps.<br/>Adjust your selection and try again.</h3>`
        );
        return;
      }
    }
  }

  // valid ship: commit
  const ship = createShip(state.nextPlayerShipId++, cellIds);
  state.playerFleet.push(ship);

  // mark these cells as belonging to final fleet
  cellIds.forEach((id) => {
    state.playerShips.add(id);
  });

  state.currentShipCells.clear();
  if (finishShipButton) {
    finishShipButton.disabled = true;
  }

  state.currentShipIndex += 1;
  updateShipCounters();

  if (state.currentShipIndex >= state.totalShipsPlanned) {
    if (startGameButton) {
      startGameButton.disabled = false;
    }
    updateSetupTurnIndicator();
    setLogs(
      `<h3>All ships defined!<br/>Press <span class="status-coordinate">Start Game</span> to begin.</h3>`
    );
  } else {
    updateSetupTurnIndicator();
    setLogs(
      `<h3>Ship ${state.currentShipIndex} placed.<br/>Now define ship ${
        state.currentShipIndex + 1
      } of ${
        state.totalShipsPlanned
      } by selecting a straight line of squares, then click <span class="status-coordinate">Finish Ship</span>.</h3>`
    );
  }
}

// OPPONENT FLEET SETUP

function placeRandomOpponentShips(lengths) {
  state.opponentShips.clear();
  state.opponentFleet = [];
  state.nextOpponentShipId = 1;

  for (const length of lengths) {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() < 0.5;

      if (horizontal) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const startCol = Math.floor(Math.random() * (BOARD_SIZE - length + 1));

        const cells = [];
        let overlaps = false;
        for (let offset = 0; offset < length; offset++) {
          const col = startCol + offset;
          const id = cellIdOpponent(row, col);
          if (state.opponentShips.has(id)) {
            overlaps = true;
            break;
          }
          cells.push(id);
        }

        if (!overlaps) {
          cells.forEach((id) => state.opponentShips.add(id));
          const ship = createShip(state.nextOpponentShipId++, cells);
          state.opponentFleet.push(ship);
          placed = true;
        }
      } else {
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const startRow = Math.floor(Math.random() * (BOARD_SIZE - length + 1));

        const cells = [];
        let overlaps = false;
        for (let offset = 0; offset < length; offset++) {
          const row = startRow + offset;
          const id = cellIdOpponent(row, col);
          if (state.opponentShips.has(id)) {
            overlaps = true;
            break;
          }
          cells.push(id);
        }

        if (!overlaps) {
          cells.forEach((id) => state.opponentShips.add(id));
          const ship = createShip(state.nextOpponentShipId++, cells);
          state.opponentFleet.push(ship);
          placed = true;
        }
      }
    }
  }
}

// GAMEPLAY - PLAYER SHOTS

export function handleGuessClick(e) {
  if (state.phase !== "playing") return;
  const cell = e.target;
  if (!(cell instanceof HTMLButtonElement)) return;

  const id = cell.id;
  if (state.playerShots.has(id)) return;

  state.playerShots.add(id);

  if (state.lastPlayerGuessCell) {
    state.lastPlayerGuessCell.classList.remove("cell-last-move");
  }
  cell.classList.add("cell-last-move");
  state.lastPlayerGuessCell = cell;

  const coord = coordFromId(id);
  const isHit = state.opponentShips.has(id);

  if (isHit) {
    state.opponentShips.delete(id);
    cell.classList.add("ship-guess-choice-success");

    const ship = findShipByCell(state.opponentFleet, id);
    let message;

    if (ship) {
      ship.hits.add(id);
      const shipSunk = ship.hits.size === ship.cells.size;
      if (shipSunk) {
        message = `<h3>You <span class="status-coordinate">sunk</span> an enemy ship at ${coord}!</h3>`;
      } else {
        message = `<h3>You hit a ship at <span class="status-coordinate">${coord}</span>!</h3>`;
      }
    } else {
      message = `<h3>You hit a ship at <span class="status-coordinate">${coord}</span>!</h3>`;
    }

    setLogs(message);
  } else {
    cell.classList.add("ship-guess-choice-fail");
    setLogs(
      `<h3>You fired at <span class="status-coordinate">${coord}</span> and missed.</h3>`
    );
  }

  updateShipCounters();

  if (areAllShipsSunk(state.opponentFleet)) {
    endGame(
      "<h3>Well done! You destroyed all enemy ships.<br/>Your prize: eternal glory.</h3>"
    );
    return;
  }

  // opponent's turn after a delay
  setTurn("opponent", { thinking: true });
  setTimeout(() => {
    opponentTurn();
  }, THINK_DELAY);
}

// GAMEPLAY - OPPONENT SHOTS

function opponentTurn() {
  if (state.phase !== "playing") return;

  setTurn("opponent", { thinking: false });

  const allCells = Array.from(playerGridEl.querySelectorAll(".grid-cell"));
  let targetCell;
  let id;

  do {
    targetCell = allCells[Math.floor(Math.random() * allCells.length)] || null;
    if (!targetCell) return;
    id = targetCell.id;
  } while (state.opponentShots.has(id));

  state.opponentShots.add(id);

  if (state.lastOpponentGuessCell) {
    state.lastOpponentGuessCell.classList.remove("cell-last-move");
  }
  targetCell.classList.add("cell-last-move");
  state.lastOpponentGuessCell = targetCell;

  const coord = coordFromId(id);
  const isHit = state.playerShips.has(id);

  if (isHit) {
    state.playerShips.delete(id);
    targetCell.classList.add("ship-guess-choice-success");

    const ship = findShipByCell(state.playerFleet, id);
    let message;

    if (ship) {
      ship.hits.add(id);
      const shipSunk = ship.hits.size === ship.cells.size;
      if (shipSunk) {
        message = `<h3>Your opponent <span class="status-coordinate">sunk</span> one of your ships at ${coord}!</h3>`;
      } else {
        message = `<h3>Your opponent hit a ship at <span class="status-coordinate">${coord}</span>!</h3>`;
      }
    } else {
      message = `<h3>Your opponent hit a ship at <span class="status-coordinate">${coord}</span>!</h3>`;
    }

    setLogs(undefined, message);
  } else {
    targetCell.classList.add("ship-guess-choice-fail");
    setLogs(
      undefined,
      `<h3>Your opponent fired at <span class="status-coordinate">${coord}</span> and missed.</h3>`
    );
  }

  updateShipCounters();

  if (areAllShipsSunk(state.playerFleet)) {
    endGame(
      "<h3>All of your ships have been sunk.<br/>You lose this battle.</h3>"
    );
    return;
  }

  // round complete, back to player
  state.turnNumber += 1;
  setTurn("player", { thinking: false });
}

// --- START / QUIT / SHIP COUNT -----------------------------------------

export function startGame() {
  if (state.phase !== "definingFleet") return;
  if (state.currentShipIndex < state.totalShipsPlanned) return;
  if (state.playerFleet.length !== state.totalShipsPlanned) return;

  state.phase = "playing";
  state.turnNumber = 1;

  // lock ship count & finish button
  if (shipCountInput) shipCountInput.disabled = true;
  if (finishShipButton) {
    finishShipButton.disabled = true;
    finishShipButton.style.display = "none";
  }

  // Hide Start Game button once the game starts
  if (startGameButton) {
    startGameButton.disabled = true;
    startGameButton.style.display = "none";
  }

  // Opponent gets same ship lengths as player for simplicity
  const lengths = state.playerFleet.map((ship) => ship.cells.size);
  placeRandomOpponentShips(lengths);
  updateShipCounters();

  setLogs(
    `<h3>Game started.</h3>`,
    `<h3>The enemy is waiting for you to take the first shot!</h3>`
  );
  setTurn("player", { thinking: false });

  if (quitButton) quitButton.style.display = "inline-block";
}

export function handleShipCountChange() {
  if (!shipCountInput) return;
  const requested = parseInt(shipCountInput.value, 10);
  if (Number.isNaN(requested) || requested < 1) {
    shipCountInput.value = String(state.totalShipsPlanned);
    return;
  }
  const clamped = Math.max(1, Math.min(8, requested));

  // Don't allow changing fleet size after you've started placing ships
  if (state.playerFleet.length > 0 || state.currentShipCells.size > 0) {
    shipCountInput.value = String(state.totalShipsPlanned);
    setLogs(
      `<h3>You can't change the number of ships after placement has begun.<br/>Reload the game to start over.</h3>`
    );
    return;
  }

  state.totalShipsPlanned = clamped;
  shipCountInput.value = String(clamped);
  state.currentShipIndex = 0;
  updateSetupTurnIndicator();
  setLogs(
    `<h3>Define ship 1 of ${state.totalShipsPlanned}.<br/>Click squares on your board to build a straight ship, then press <span class="status-coordinate">Finish Ship</span>.</h3>`
  );
}
