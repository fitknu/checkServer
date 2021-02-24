//@ts-check

// eslint-disable-next-line no-unused-vars
const types = require('./types')

/**
 * @typedef {types.cell} cell
 */

/**
 * @typedef {types.player} player
 */

/**
 * @typedef {types.playerCell} playerCell
 */

/**
 * @typedef {types.regularCell} regularCell
 */

/**
 * @typedef {types.queenCell} queenCell
 */

/**
 * @typedef {types.move} move
*/

/**
 * @typedef {types.attack} attack
 */

/**
 * @typedef {types.player | 3} owner
 * @description A cells' owner
 */

/**
 * @property {player} player1
 * @property {player} player2
 * @property {owner} spectator
 * @property {cell} empty
 * @method is_empty
 * @property {function} is_enemy
 * @property {function} is_queen
 * @property {function} get_owner
 * @property {function} get_enemy
 * @property {function} get_moves_regular
 * @property {function} get_moves_queen
 * @property {function} get_moves
 * @property {function} move
 * @property {function} get_attacks_regular
 * @property {function} get_attacks_queen
 * @property {function} get_attacks
 * @property {function} attack
 * @property {function} match_move
 * @property {function} match_attack
 * @property {function} check_win
 * @property {function} should_be_queen
 * @property {function} make_queen
 * @property {function} make_queen
 * @property {function} is_in_range
 * @property {function} is_in_range_a
 * @property {function} get_other_player
 */

/**
 * @type {owner}
 */
const pl1 = 1, pl2 = 2

const Logic = {
    /**
     * @property {owner}
     */
    player1: pl1,
    player2: pl2,
    spectator: 3,
    empty: 3,
    /**
     * 
     * @param {cell} cell
     * @returns {boolean}
     * Check if the cell is empty. 
     */
    is_empty: (cell) => cell === 0,
    /**
     * 
     * @param {cell} cell1 
     * @param {cell} cell2
     * @returns {boolean} 
     */
    is_enemy: function (cell1, cell2)
    {
        if (this.is_empty(cell1) || this.is_empty(cell2))
        {
            return false
        }
        if (this.get_owner(cell1) === this.get_owner(cell2))
        {
            return false
        }
        return true
    },
    /**
     * 
     * @param {types.cell} cell
     * @returns {boolean}
     * Check if the cell is a queen 
     */
    is_queen: function (cell)
    {
        if (cell === 2 || cell === 4)
        {
            return true
        }
        return false
    },
    /**
     * 
     * @param {cell} cell
     * @returns {owner | any} 
     */
    get_owner: function (cell)
    {
        if (cell === 1 || cell === 2)
        {
            return this.player1
        }
        if (cell === 3 || cell === 4)
        {
            return this.player2
        }
        return this.spectator
    },
    /**
     * 
     * @param {playerCell} cell
     * @returns {owner | any} 
     */
    get_enemy: function (cell)
    {
        if (this.get_owner(cell) === this.player1)
        {
            return this.player2;
        }
        return this.player1;
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {move[]} 
     */
    get_moves_regular: function (grid, row, col)
    {
        const moves = []
        const cell = grid[row][col]
        const owner = this.get_owner(cell)

        //Get the vertical direction depending on the owner of the cell
        const next_row = (owner === this.player1) ? row - 1 : row + 1

        //Top and bottom bounds check
        if (next_row < 0 || next_row > grid.length - 1)
        {
            return []
        }

        const left_move_col = col - 1
        //Left bound check
        if (left_move_col >= 0)
        {
            if (this.is_empty(grid[next_row][left_move_col]))
            {
                moves.push({
                    start_row: row, start_col: col,
                    end_row: next_row, end_col: left_move_col
                })
            }
        }

        const right_move_col = col + 1
        //Right bound check
        if (right_move_col <= grid.length - 1)
        {
            if (this.is_empty(grid[next_row][right_move_col]))
            {
                moves.push({
                    start_row: row, start_col: col,
                    end_row: next_row, end_col: right_move_col
                })
            }
        }
        return moves
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {move[]} 
     */
    get_moves_queen: function (grid, row, col)
    {
        const moves = []

        //top left
        for (let top_row = row - 1, left_col = col - 1;
            top_row >= 0 && left_col >= 0 &&
            this.is_empty(grid[top_row][left_col]);
            top_row--, left_col--)
        {
            moves.push({
                start_row: row, start_col: col,
                end_row: top_row, end_col: left_col
            })
        }

        //Top right
        for (let top_row = row - 1, right_col = col + 1;
            top_row >= 0 && right_col <= grid.length - 1 &&
            this.is_empty(grid[top_row][right_col]);
            top_row--, right_col++)
        {
            moves.push({
                start_row: row, start_col: col,
                end_row: top_row, end_col: right_col
            })
        }

        //Bottom left
        for (let bot_row = row + 1, left_col = col - 1;
            bot_row <= grid.length - 1 && left_col >= 0 &&
            this.is_empty(grid[bot_row][left_col]);
            bot_row++, left_col--)
        {
            moves.push({
                start_row: row, start_col: col,
                end_row: bot_row, end_col: left_col
            })
        }

        //Bottom right
        for (let bot_row = row + 1, right_col = col + 1;
            bot_row <= grid.length - 1 && right_col <= grid.length - 1 &&
            this.is_empty(grid[bot_row][right_col]);
            bot_row++, right_col++)
        {
            moves.push({
                start_row: row, start_col: col,
                end_row: bot_row, end_col: right_col
            })
        }

        return moves
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {move[]}
     */
    get_moves: function (grid, row, col)
    {
        const cell = grid[row][col]
        const moves = (this.is_queen(cell)) ?
            this.get_moves_queen(grid, row, col) :
            this.get_moves_regular(grid, row, col)
        return moves
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} start_row 
     * @param {number} start_col 
     * @param {number} end_row 
     * @param {number} end_col
     * @returns {void} nothing, it modifies the grid.
     * @description Moves cell from start position to end position in the grid,
     * also makes sure the cell becomes a queen, if it need to.
     */
    move: function (grid, start_row, start_col, end_row, end_col)
    {
        const cell = grid[start_row][start_col]
        grid[start_row][start_col] = 0
        grid[end_row][end_col] = cell

        if (this.should_be_queen(grid, end_row, end_col))
        {
            // @ts-ignore
            grid[end_row][end_col] = this.make_queen(cell)
        }
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {attack[]} 
     */
    get_attacks_regular: function (grid, row, col)
    {
        function go1(cell, grid, row, col, next_row, next_col)
        {
            //Bounds checking
            if (next_row >= 0 && next_row <= grid.length - 1 &&
                next_col >= 0 && next_col <= grid.length - 1)
            {
                const dir_cell = grid[row][col]
                const next_dir_cell = grid[next_row][next_col]
                //next cell in direction is an enemy cell
                //and the cell after it is empty
                if (this.is_enemy(cell, dir_cell) && this.is_empty(next_dir_cell))
                {
                    return true
                }
            }
            return false
        }
        const go = go1.bind(this)
        const attacks = []
        const cell = grid[row][col]

        const top_row = row - 1
        const next_top_row = row - 2
        const bot_row = row + 1
        const next_bot_row = row + 2
        const left_col = col - 1
        const next_left_col = col - 2
        const right_col = col + 1
        const next_right_col = col + 2

        //Top left
        if (go(cell, grid, top_row, left_col, next_top_row, next_left_col))
        {
            attacks.push({
                start_row: row, start_col: col,
                enemy_row: top_row, enemy_col: left_col,
                end_row: next_top_row, end_col: next_left_col
            })
        }
        //Top right
        if (go(cell, grid, top_row, right_col, next_top_row, next_right_col))
        {
            attacks.push({
                start_row: row, start_col: col,
                enemy_row: top_row, enemy_col: right_col,
                end_row: next_top_row, end_col: next_right_col
            })
        }
        //Bottom right
        if (go(cell, grid, bot_row, right_col, next_bot_row, next_right_col))
        {
            attacks.push({
                start_row: row, start_col: col,
                enemy_row: bot_row, enemy_col: right_col,
                end_row: next_bot_row, end_col: next_right_col
            })
        }
        //Bottom left
        if (go(cell, grid, bot_row, left_col, next_bot_row, next_left_col))
        {
            attacks.push({
                start_row: row, start_col: col,
                enemy_row: bot_row, enemy_col: left_col,
                end_row: next_bot_row, end_col: next_left_col
            })
        }
        return attacks
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {attack[]} 
     */
    get_attacks_queen: function (grid, row, col)
    {
        function go1(grid, row, col, dir_x, dir_y)
        {
            const cell = grid[row][col]
            let dir_row
            let dir_col
            //Go in the given direction until
            //we go out of bounds or stumble onto a cell that is not empty
            for (dir_row = row + dir_x, dir_col = col + dir_y;
                dir_row >= 0 && dir_row <= grid.length - 1 &&
                dir_col >= 0 && dir_col <= grid.length - 1 &&
                this.is_empty(grid[dir_row][dir_col]);
                dir_row += dir_x, dir_col += dir_y
            )
            {
                //dont really need to write anythin here
            }
            const next_dir_row = dir_row + dir_x
            const next_dir_col = dir_col + dir_y
            //After the loop, check if we are still within bounds
            //and the cell the loop ended on is an empty one,
            //and the cell after it an empty one, then
            //return the found move
            if (dir_row >= 0 && dir_row <= grid.length - 1 &&
                dir_col >= 0 && dir_col <= grid.length - 1 &&
                next_dir_row >= 0 && next_dir_row <= grid.length - 1 &&
                next_dir_col >= 0 && next_dir_col <= grid.length - 1 &&
                this.is_enemy(cell, grid[dir_row][dir_col]) &&
                this.is_empty(grid[next_dir_row][next_dir_col]))
            {
                return {
                    start_row: row, start_col: col,
                    enemy_row: dir_row, enemy_col: dir_col,
                    end_row: next_dir_row, end_col: next_dir_col
                }
            }
            return false
        }
        const go = go1.bind(this)
        const attacks = []

        const top_left = go(grid, row, col, -1, -1)
        if (top_left !== false)
        {
            attacks.push(top_left)
        }
        const top_right = go(grid, row, col, -1, 1)
        if (top_right !== false)
        {
            attacks.push(top_right)
        }
        const bot_left = go(grid, row, col, 1, -1)
        if (bot_left !== false)
        {
            attacks.push(bot_left)
        }
        const bot_right = go(grid, row, col, 1, 1)
        if (bot_right !== false)
        {
            attacks.push(bot_right)
        }

        return attacks
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col
     * @returns {attack[]}
     */
    get_attacks: function (grid, row, col)
    {
        const cell = grid[row][col]
        const attacks = (this.is_queen(cell)) ?
            this.get_attacks_queen(grid, row, col) :
            this.get_attacks_regular(grid, row, col)
        return attacks
    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} start_row 
     * @param {number} start_col 
     * @param {number} enemy_row 
     * @param {number} enemy_col 
     * @param {number} end_row 
     * @param {number} end_col
     * @returns {void}
     * @description Move the cell from start position to the end position,
     * and remove enemy cell, also make sure the cell 
     * becomes a queen if it need to
     */
    attack: function (grid, start_row, start_col,
        enemy_row, enemy_col, end_row, end_col)
    {
        const cell = grid[start_row][start_col]
        grid[start_row][start_col] = 0
        grid[enemy_row][enemy_col] = 0
        grid[end_row][end_col] = cell

        if (this.should_be_queen(grid, end_row, end_col))
        {
            // @ts-ignore
            grid[end_row][end_col] = this.make_queen(cell)
        }
    },
    /**
     * 
     * @param {move[]} moves 
     * @param {number} end_row 
     * @param {number} end_col 
     */
    match_move: function (moves, end_row, end_col)
    {
        for (let i = 0; i < moves.length; i++)
        {
            if (moves[i].end_row === end_row && moves[i].end_col === end_col)
            {
                return true
            }
        }
        return false
    },
    /**
     * 
     * @param {attack[]} attacks 
     * @param {number} end_row 
     * @param {number} end_col 
     */
    match_attack: function (attacks, end_row, end_col)
    {
        for (let i = 0; i < attacks.length; i++)
        {
            if (attacks[i].end_row === end_row &&
                attacks[i].end_col === end_col)
            {
                return attacks[i]
            }
        }
        return false
    },
    /**
     * 
     * @param {player} player 
     * @param {cell[][]} grid
     * @returns {boolean} If the player won
     * @description Check for win, first count the enemy cells, 
     * and then, if needed, check if the enemy can move
     */
    check_win: function (player, grid)
    {
        let has_enemies = false
        const size = grid.length
        //Check if the enemy has cells
        for (let row = 0; row < size; row++)
        {
            if (has_enemies)
            {
                break
            }
            for (let col = 0; col < size; col++)
            {
                const cell = grid[row][col]
                if (this.is_empty(cell))
                {
                    continue
                }
                if (this.get_owner(cell) !== player)
                {
                    has_enemies = true
                    break
                }
            }
        }

        //Player's enemy has no cells, so the game nds
        if (!has_enemies)
        {
            return true
        }

        let enemy_has_moves = false
        //Check if enemy has moves
        for (let row = 0; row < size; row++)
        {
            for (let col = 0; col < size; col++)
            {
                const cell = grid[row][col]
                if (this.is_empty(cell))
                {
                    continue
                }
                if (this.get_owner(cell) !== player)
                {
                    if (this.get_moves(grid, row, col).length > 0)
                    {
                        return false
                    }
                    if (this.get_attacks(grid, row, col).length > 0)
                    {
                        return false
                    }
                }
            }
        }
        //If enemy has moves, then return false, since he can move,
        //else return true
        return !enemy_has_moves

    },
    /**
     * 
     * @param {cell[][]} grid 
     * @param {number} row 
     * @param {number} col 
     */
    should_be_queen: function (grid, row, col)
    {
        if (grid[row][col] === 1 && row === 0)
        {
            return true
        }
        if (grid[row][col] === 3 && row === grid.length - 1)
        {
            return true
        }
        return false
    },
    /**
     * 
     * @param {regularCell} cell
     * @returns {queenCell}
     */
    make_queen: function (cell)
    {
        if (cell === 1)
        {
            return 2
        }
        return 4
    },
    /**
     * check if value in range[start, end]
     * @param {number} start 
     * @param {number} end 
     * @param {number} value
     * @returns {boolean} 
     */
    is_in_range(start, end, value)
    {
        if (start <= value && value <= end)
        {
            return true
        }
        return false
    },
    /**
     * 
     * @param {number} start
     * @param {number} end 
     * @param {number[]} values 
     */
    is_in_range_a(start, end, values)
    {
        for (let i = 0; i < values.length; i++)
        {
            if (!this.is_in_range(start, end, values[i]))
            {
                return false
            }
        }
        return true
    },
    /**
     * 
     * @param {player} player
     * @returns {player | any} 
     */
    get_other_player(player)
    {
        if (player === Logic.player1)
        {
            return Logic.player2
        }
        return Logic.player1
    }
}

module.exports = Logic