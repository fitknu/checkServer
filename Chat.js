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
     * @param {Socket & addData} user 
     */
    add(user)
    {
        user.on('debug', () => user.emit('debug', JSON.stringify(this.tostr())))
        user.on('login', name =>
        {
            user.name = name
            this.users.push(user)
            user.emit("login", true)

            this.users.forEach(oldUser => 
            {
                //Send a notification to everyone(inculding the new user) that a new user joined
                oldUser.emit('userJoined', name)
                //Send to current user the old users
                if (oldUser !== user)
                {
                    user.emit('userJoined', oldUser.name)
                }
                //Send to current user the currrent people in voice chat
                if (oldUser.peerId)
                {
                    user.emit('userJoinedVoice', oldUser.name)
                }
            })



            user.on('message', text => this.sendMessage(name, text))
            user.on('disconnect', () =>
            {
                this.users = this.users.filter(oldUser => oldUser != user)
                this.users.forEach(oldUser => oldUser.emit("userLeft", name))
            })

            user.on('peerId', peerId =>
            {
                user.peerId = peerId

                const peerLeft = () =>
                {

                    user.peerId = undefined
                    this.users.forEach(oldUser =>
                    {
                        //Remove the leaving user from everyones list
                        oldUser.emit('userLeftVoice', user.name)
                        //If the user is currently in the voice chat
                        if (oldUser.peerId)
                        {
                            //Send a messaga for the oldUser to close the connection
                            oldUser.emit('peerLeft', peerId)
                        }
                    })
                }
                user.on('myPeerLeft', peerLeft)
                user.on('disconnect', peerLeft)

                //Peer joins voice chat, so 
                user.on('peerCall', otherPeerId =>
                {
                    console.log(otherPeerId);
                    const otherPeer = this.users.find(otherPeer => otherPeer.peerId === otherPeerId)
                    otherPeer.emit('peerCall', peerId, user.name)
                })
                this.users.forEach(oldUser =>
                {
                    oldUser.emit('userJoinedVoice', user.name)
                    if (oldUser !== user && oldUser.peerId)
                    {
                        user.emit('peerId', oldUser.peerId, oldUser.name)
                    }
                })

            })
        })
    }
    sendMessage(name, text)
    {
        this.users.forEach(user => user.emit('message', name, text))
    }

}
module.exports = Chat