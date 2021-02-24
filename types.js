/**
 * @typedef {0|1|2|3|4} cell
 * @description Values that a cell can have in the grid
 */

/**
 * @typedef {1|2|3|4} playerCell
 * @description A cell with a player's checker on it
 */

/**
 * @typedef {1|3} regularCell
 * @description A cell with a player's checker on it that is not a queen
 */

/**
 * @typedef {2|4} queenCell
 * @description A cell with a player's checker on it that is a queen
 */

/**
 * @typedef {Object} highlightCell
 * @property {number} row
 * @property {number} col
 * @property {1 | 2} type 1 - means it's a move, 2 - means it's an attack
 */

/**
 * @typedef {1 | 2} player
 */

/**
 * @typedef {Object} move
 * @property {number} start_row
 * @property {number} start_col
 * @property {number} end_row
 * @property {number} end_col
 */

/**
 * @typedef {Object} attack
 * @property {number} start_row
 * @property {number} start_col
 * @property {number} enemy_row
 * @property {number} enemy_col
 * @property {number} end_row
 * @property {number} end_col
 */

/**
 * @typedef {Object} GameStateServer
 * @property {player} current_player
 * @property {null | {row: number, col: number}} check If the game is locked, here must the locked cell's position
 * @property {boolean} locked Shows where the current player is locked, and therefore has to attack using the check
 * @property {cell[][]} grid
 */

/**
 * @typedef {Object} GameStateClient
 * @property {player} current_player Shows who's turn it is now
 * @property {null | {row: number, col: number}} check Shows currently selected checker
 * @property {boolean} locked Shows where the player must attack using currently selected checker
 * @property {move[]} moves Shows currently avalible moves
 * @property {attack[]} attacks Shows currently avalible attacks
 * @property {cell[][]} grid
 * @property {player} me Player
 * @property {highlightCell[]} hls an array of cells to be hightlighted
 */

exports.unused = {}