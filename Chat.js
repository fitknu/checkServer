//@ts-check
const { Socket } = require("socket.io")

/**
 * @typedef {Object} addData
 * @property {String | undefined} name
 * @property {String | undefined} peerId
 */



class Chat
{
    constructor(name)
    {
        this.name = name
        /**
         * @type {Array<Socket & addData>}
         */
        this.users = []
    }
    tostr()
    {
        return this.users.map(user =>
        {
            const { name, peerId } = user
            return { name, peerId }
        })
    }
    /**
     * 
     * @param {Socket & addData} newUser 
     */
    add(newUser)
    {
        newUser.on('debug', () => newUser.emit('debug', JSON.stringify(this.tostr())))
        newUser.on('login', name =>
        {
            newUser.name = name
            this.users.push(newUser)

            // this.usersEmit('newUser', name)

            //Say to everyone that a newUser has joined, exept the newUser
            this.users.filter(user => user !== newUser).forEach(user => user.emit('newUser', name))
            newUser.on('message', text => this.usersEmit('message', name, text))
            newUser.on('disconnect', () =>
            {
                this.users = this.users.filter(user => user !== newUser)
                this.usersEmit('userLeft', name)
            })

            newUser.emit("login", true)
            //Give newUser a list of everyone who joined before, including newUser
            this.users.forEach(user => newUser.emit('newUser', user.name))

            this.users.filter(user => user.peerId)
                .forEach(user => newUser.emit('voiceJoined', user.name))


            //peer stuff
            newUser.on('peerId', newUserPeerId =>
            {
                newUser.peerId = newUserPeerId

                //Send peerIds of old users to the new user
                this.users.filter(user => user.peerId && user !== newUser)
                    .forEach(user => newUser.emit('peerId', user.peerId))

                //let it show in users tab
                this.usersEmit('voiceJoined', newUser.name)

                newUser.on('peerLeft', () =>
                {
                    //Delte from users tab
                    this.usersEmit('voiceLeft', newUser.name)

                    //Delte audios from other peers
                    this.users.filter(user => user.peerId && user !== newUser)
                        .forEach(user => user.emit('peerLeft', newUser.peerId))

                    newUser.peerId = undefined
                })
                newUser.on('disconnect', () =>
                {
                    //Delte from users tab
                    // this.usersEmit('voiceLeft', newUser.name)

                    //Delte audios from other peers
                    this.users.filter(user => user.peerId && user !== newUser)
                        .forEach(user => user.emit('peerLeft', newUser.peerId))

                    newUser.peerId = undefined
                })
            })


        })
    }
    usersEmit(command, ...args)
    {
        this.users.forEach(user => user.emit(command, ...args))
    }
    sendMessage(name, text)
    {
        this.users.forEach(user => user.emit('message', name, text))
    }

}
module.exports = Chat