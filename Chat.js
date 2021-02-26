//@ts-check
const { Socket } = require("socket.io")

class Chat
{
    constructor(name)
    {
        this.name = name
        /**
         * @type {Socket[]}
         */
        this.users = []
        this.peerIds = []
    }
    /**
     * 
     * @param {Socket} user 
     */
    add(user)
    {
        console.log('Added user');
        this.sendMessage("Server", "Пользователь подключился")
        this.users.push(user)
        user.emit('sucess')
        user.on('message', (name, text) => this.sendMessage(name, text))
        user.on('disconnect', () =>
        {
            this.sendMessage("Server", "Пользователь отключился")
            console.log('A user left');
            this.users = this.users.filter(socket => socket !== user)
        })
        this.users.forEach(oldUser =>
        {
            const peerId = oldUser.peerId
            if (peerId !== undefined)
            {
                console.log('Emitted ' + peerId);
                user.emit('peerId', peerId)
            }
        })
        user.on('peerId', peerId =>
        {
            console.log('Got a peer id ' + peerId);
            user.peerId = peerId
            console.log(user.peerId);
            const index = this.users.findIndex(Olduser => Olduser === user)
            for (let i = index + 1; i < this.users.length; i++)
            {
                this.users[i].emit('peerId', peerId)
            }
        })
    }
    sendMessage(name, text)
    {
        this.users.forEach(user => user.emit('message', name, text))
    }

}
module.exports = Chat