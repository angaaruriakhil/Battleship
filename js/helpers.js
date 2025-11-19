import { LETTERS } from "./constants.js";

export function cellIdPlayer(row, col) {
  return `Player-grid_${LETTERS[row]}${col + 1}`;
}

export function cellIdOpponent(row, col) {
  return `Guess-grid_${LETTERS[row]}${col + 1}`;
}

export function coordFromId(id) {
  const coord = id.includes("_") ? id.split("_")[1] : id.replace(/[^\w]/g, "");
  return coord;
}

export function cellIdToRowCol(id) {
  // expects something like "Player-grid_A1" or "Guess-grid_A1"
  const coord = coordFromId(id); // e.g. "A1"
  const rowLetter = coord[0];
  const colStr = coord.slice(1);
  const row = LETTERS.indexOf(rowLetter);
  const col = parseInt(colStr, 10) - 1;
  return { row, col };
}

export function createShip(id, cells) {
  return {
    id,
    cells: new Set(cells),
    hits: new Set(),
  };
}

export function findShipByCell(fleet, cellId) {
  return fleet.find((ship) => ship.cells.has(cellId)) || null;
}

export function areAllShipsSunk(fleet) {
  return (
    fleet.length > 0 &&
    fleet.every((ship) => ship.hits.size === ship.cells.size)
  );
}
