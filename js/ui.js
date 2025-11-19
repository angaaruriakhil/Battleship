import {
  playerShipsCountText,
  opponentShipsCountText,
  logListEl,
  turnIndicatorEl,
  quitButton,
} from "./dom.js";
import { state } from "./state.js";

export function updateShipCounters() {
  if (playerShipsCountText) {
    playerShipsCountText.textContent = String(state.playerShips.size);
  }
  if (opponentShipsCountText) {
    opponentShipsCountText.textContent = String(state.opponentShips.size);
  }
}

// turn indicator
export function setTurn(turn, { thinking = false } = {}) {
  if (!turnIndicatorEl) return;

  turnIndicatorEl.dataset.turn = turn;
  turnIndicatorEl.dataset.thinking = thinking ? "true" : "false";

  if (turn === "player") {
    turnIndicatorEl.textContent = "Your turn";
  } else {
    turnIndicatorEl.textContent = "Opponent's turn";
  }
}

// during fleet definition, hijack the turn pill to show ship progress
export function updateSetupTurnIndicator() {
  if (!turnIndicatorEl) return;
  turnIndicatorEl.dataset.thinking = "false";

  if (state.currentShipIndex < state.totalShipsPlanned) {
    turnIndicatorEl.textContent = `Defining ship ${
      state.currentShipIndex + 1
    } of ${state.totalShipsPlanned}`;
  } else {
    turnIndicatorEl.textContent = "All ships defined · Ready to start";
  }
}

export function addLog(actor, html) {
  if (!logListEl) return;

  const entry = document.createElement("div");
  entry.className = "battleship-game__log-entry";
  entry.dataset.actor = actor; // "player" or "opponent"

  const header = document.createElement("div");
  header.className = "battleship-game__log-entry-header";
  header.textContent = actor === "player" ? "You" : "Opponent";

  const body = document.createElement("div");
  body.className = "battleship-game__log-entry-body";
  body.innerHTML = html;

  const meta = document.createElement("div");
  meta.className = "battleship-game__log-entry-meta";
  meta.textContent = `Turn ${state.turnNumber}`;

  entry.appendChild(header);
  entry.appendChild(body);
  entry.appendChild(meta);

  logListEl.appendChild(entry);
  logListEl.scrollTop = logListEl.scrollHeight;
}

export function setLogs(playerHtml, opponentHtml) {
  if (playerHtml) addLog("player", playerHtml);
  if (opponentHtml) addLog("opponent", opponentHtml);
}

export function endGame(message) {
  state.phase = "over";
  setLogs(message, "");
  if (quitButton) quitButton.style.display = "inline-block";
}
