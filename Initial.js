// eslint-disable-next-line no-unused-vars
const types = require('./types')
const Logic = require('./Logic.js')

/**
 * @type {types.GameStateServer}
 */
const intialState = {
    current_player: Logic.player1,
    check: null,
    locked: false,
    grid: [
        [0, 3, 0, 3, 0, 3, 0, 3],
        [3, 0, 3, 0, 3, 0, 3, 0],
        [0, 3, 0, 3, 0, 3, 0, 3],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]],
}
module.exports = intialState