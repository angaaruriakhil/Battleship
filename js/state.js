// state.js
export const state = {
  // phases: "definingFleet" OR "playing" OR "over"
  phase: "definingFleet",

  totalShipsPlanned: 3,

  playerShips: new Set(),
  opponentShips: new Set(),

  playerShots: new Set(),
  opponentShots: new Set(),

  lastPlayerGuessCell: null,
  lastOpponentGuessCell: null,

  // fleets: arrays of ship objects { id, cells: Set<string>, hits: Set<string> }
  playerFleet: [],
  opponentFleet: [],

  nextPlayerShipId: 1,
  nextOpponentShipId: 1,

  // current ship being defined by the player
  currentShipIndex: 0,
  currentShipCells: new Set(), // temporary selection for this ship

  turnNumber: 1,
};
