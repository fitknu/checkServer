//@ts-check

// import Logic from '../client/src/Logic/Logic.js'
// import intialState from '../client/src/Logic/Intitial.js'

// eslint-disable-next-line no-unused-vars
const types = require('./types')
const Logic = require('./Logic.js')

const initialState = require('./Initial.js')
// eslint-disable-next-line no-unused-vars
const { Socket } = require('socket.io')

/**
 * 
 * @param {types.GameStateServer} state 
 * @returns {types.GameStateServer}
 */
function copyState(state)
{
    return JSON.parse(JSON.stringify(state))
}
/**
 * 
 * @param {any[]} users 
 * @param {"setGrid" | "setCurrentPlayer" | "end" | "move" | "attack"} event 
 * @param {any[]} args 
 */
function sendToUsers(users, event, args)
{
    for (let i = 0; i < users.length; i++)
    {
        users[i].emit(event, ...args)
    }
}

/**
 * 
 * @param {types.GameStateServer} State 
 * @param {types.player} player 
 * @param {Socket} playerSocket 
 * @param {Socket[]} users 
 * @param {function} restart 
 * @param {number} start_row 
 * @param {number} start_col 
 * @param {number} end_row 
 * @param {number} end_col 
 */
function tryMove(State, player, playerSocket, users, restart,
    start_row, start_col, end_row, end_col)
{
    if (State.current_player !== player || //Not this player's turn
        State.locked || //This player is locked, player cannot move, he must attack
        !Logic.is_in_range_a(0, State.grid.length, //Bounds check
            [start_row, start_col, end_row, end_col]))
    {
        return
    }

    //Get moves for a checker
    const moves = Logic.get_moves(State.grid, start_row, start_col)

    //Check if the data sent by the user
    //and the the data on the server is the same
    //(for anti-cheat reasons)
    if (Logic.match_move(moves, end_row, end_col))
    {
        Logic.move(State.grid, start_row, start_col, end_row, end_col)

        //send move to sockets
        const next_player = Logic.get_other_player(player)
        State.current_player = next_player
        sendToUsers(users, 'move', [start_row, start_col, end_row, end_col])
        sendToUsers(users, 'setCurrentPlayer', [next_player])

        if (Logic.check_win(player, State.grid))
        {
            //Send end to sockets
            sendToUsers(users, 'end', [player])
            setTimeout(restart, 1500)
        }
    }
}

/**
 * 
 * @param {types.GameStateServer} State 
 * @param {types.player} player 
 * @param {Socket} playerSocket 
 * @param {Socket[]} users 
 * @param {function} restart 
 * @param {number} start_row 
 * @param {number} start_col 
 * @param {number} enemy_row 
 * @param {number} enemy_col 
 * @param {number} end_row 
 * @param {number} end_col 
 */
function tryAttack(State, player, playerSocket, users, restart,
    start_row, start_col, enemy_row, enemy_col, end_row, end_col)
{
    if (State.current_player !== player || //Check if it this player's turn
        !Logic.is_in_range_a(0, State.grid.length, //Bounds check
            [start_row, start_col, enemy_row,
                enemy_col, end_row, end_col]))
    {
        return
    }

    //TODO fix a security problem, when someone sends an attack not from the cell he
    //is currently locked in. Problem: a player can attack with any checker when he's
    //only locked in one. UI does not allow it, but you can still send it by hand.
    if (State.locked)
    {
        if (start_row !== State.check.row || start_col !== State.check.col)
        {
            console.log('This bullshit');
            console.log(start_row, State.check.row, start_col, State.check.col)
            return
        }
    }


    const attacks = Logic.get_attacks(State.grid, start_row, start_col)

    const attack = Logic.match_attack(attacks, end_row, end_col)
    if (attack)
    {
        Logic.attack(State.grid, start_row,
            start_col, enemy_row, enemy_col, end_row, end_col)
        //send attack to sockets
        sendToUsers(users, 'attack', [start_row, start_col,
            enemy_row, enemy_col, end_row, end_col])

        if (Logic.check_win(player, State.grid))
        {
            //Send end to sockets
            sendToUsers(users, 'end', [player])
            setTimeout(restart, 1500)

            return
        }

        const next_attacks = Logic.get_attacks(State.grid, end_row, end_col)

        if (next_attacks.length === 0)
        {
            //The player cannot attack further,
            // so we unlock his abilty to move in the next turn
            if (State.locked)
            {
                State.locked = false
                State.check = null
                //send unlocked
                playerSocket.emit("setLocked", false)
            }

            const next_player = Logic.get_other_player(player)
            State.current_player = next_player
            sendToUsers(users, 'setCurrentPlayer', [next_player])

        } else 
        {
            //Player has some attacks and he must choose one of them, so we lock him
            //out of making else other than the attacks currently availible to him
            State.locked = true
            State.check = { row: end_row, col: end_col }
            //send locked
            playerSocket.emit('setLocked', true)
            playerSocket.emit('setCheck', { row: end_row, col: end_col })
        }
    }
}

class Room
{
    constructor(name)
    {
        this.name = name
        this.id = Math.floor(Math.random() * 1000000)
        this.status = 0
        this.pl1 = null
        this.pl2 = null
        this.users = []
        this.state = copyState(initialState)
    }

    add(player, socket)
    {
        console.log(`Player ${player} joined to room: `, this.id)
        const pl = (player === Logic.player1) ? 'pl1' : 'pl2'
        this[pl] = socket
        socket.on('tryMove', (start_row, start_col, end_row, end_col) =>
        {
            console.log('trymove')
            tryMove(this.state, player, socket, this.users, this.restart.bind(this),
                start_row, start_col, end_row, end_col)
        })
        socket.on('tryAttack', (start_row, start_col,
            enemy_row, enemy_col, end_row, end_col) =>
        {
            tryAttack(this.state, player, socket, this.users, this.restart.bind(this),
                start_row, start_col, enemy_row, enemy_col, end_row, end_col)
        })
        if (player === Logic.player1)
        {
            this.status = (this.pl2 === null) ? 2 : 3
        } else 
        {
            this.status = (this.pl1 === null) ? 1 : 3
        }
        socket.on('disconnect', () =>
        {
            console.log(`Player ${player} left`)
            if (player === Logic.player1)
            {
                this.pl1 = null
                this.status = (this.pl2 === null) ? 0 : 1
            } else 
            {
                this.pl2 = null
                this.status = (this.pl1 === null) ? 0 : 2
            }
        })
        socket.emit('accepted')
        socket.emit('setGrid', this.state.grid)
        socket.emit('setPlayer', player)
        socket.emit('setCurrentPlayer', this.state.current_player)


        if (this.state.current_player === player && this.state.locked)
        {
            socket.emit('setLocked', true)
            socket.emit('setCheck', this.state.check)
        }

    }

    add_spectator(socket)
    {
        socket.emit('accepted')
        console.log('Spectator joined')
        socket.emit('setGrid', this.state.grid)
        socket.emit('setPlayer', Logic.spectator)
        socket.emit('setCurrentPlayer', this.state.current_player)
    }
    add_socket(socket, type)
    {
        switch (type)
        {
            case 'auto':
                if (this.pl1 === null)
                {
                    this.add(Logic.player1, socket)

                } else if (this.pl2 === null)
                {
                    this.add(Logic.player2, socket)
                } else 
                {
                    this.add_spectator(socket)
                }
                break
            case 'player1':
                if (this.pl1 === null)
                {
                    this.add(Logic.player1, socket)
                } else 
                {
                    this.add_spectator(socket)
                }
                break
            case 'player2':
                if (this.pl2 === null)
                {
                    this.add(Logic.player2, socket)
                } else 
                {
                    this.add_spectator(socket)
                }
                break
            case 'spectator':
                this.add_spectator(socket)
                break
            default:
                console.log('Type: ' + type)
                throw Error("add socket unkown type")
        }
        this.users.push(socket)
        console.log('A user joined')


        socket.on('debug', () => socket.emit('debug', this.state))
        socket.on('restart', () => this.restart())
        socket.on('disconnect', () =>
        {
            console.log('A user left')
            //remove socket from users
            this.users = this.users.filter(user => user.id !== socket.id)
        })
    }

    restart()
    {
        console.log('Restart')

        this.state = copyState(initialState)

        if (this.pl1 !== null)
        {
            this.pl1.emit("setLocked", false)
        }
        if (this.pl2 !== null)
        {
            this.pl2.emit('setLocked', false)
        }

        sendToUsers(this.users, 'setGrid', [this.state.grid])
        sendToUsers(this.users, 'setCurrentPlayer', [this.state.current_player])
    }


}
module.exports = Room
