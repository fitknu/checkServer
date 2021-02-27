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

            if (user.peerId)
            {
                this.users.forEach(oldUser => oldUser.emit('peerGone', user.peerId))
            }
        })
        user.on('peerId', peerId =>
        {
            console.log('Got peerId ' + peerId);
            // @ts-ignore
            user.peerId = peerId
            this.users.forEach(oldUser =>
            {
                if (oldUser !== user && oldUser.peerId)
                {
                    user.emit('peerId', oldUser.peerId)
                }
            })
        })
    }
    sendMessage(name, text)
    {
        this.users.forEach(user => user.emit('message', name, text))
    }

}
module.exports = Chat