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
        user.on('message', (name, text) => this.sendMessage(name, text))
        user.on('disconnect', () =>
        {
            this.sendMessage("Server", "Пользователь отключился")
            console.log('A user left');
            this.users = this.users.filter(socket => socket !== user)
        })
    }
    sendMessage(name, text)
    {
        this.users.forEach(user => user.emit('message', name, text))
    }

}
module.exports = Chat