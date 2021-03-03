//@ts-check
/*eslint-env node*/

//------------------------------------------------------------------------------
// hello world app is based on node.js starter application for Bluemix
//------------------------------------------------------------------------------
// process.env.PORT = 6001
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const message = require('./utils');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
// app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {

// 	// print a message when the server starts listening
//   console.log(message.getWelcomeMessage() + appEnv.url);
// });


const Room = require('./Room')
const Chat = require('./Chat')

const cors = require('cors')
// @ts-ignore
const http = require('http').Server(app)
// @ts-ignore
const io = require('socket.io')(http, { cors: { origin: "*" } })

/**
 * @type {Array<Room>}
 */
const rooms = []
rooms.push(new Room("Европа 1"))
rooms.push(new Room("Украина 1"))

app.get('/', (req, res) =>
{
  res.send("Hello")
})

// @ts-ignore
app.get('/rooms', cors(), (req, res) =>
{
  const roomData = rooms.map(room =>
  {
    const { name, id, status } = room
    return new Object({ name, id, status })
  })
  res.json(roomData)
})

app.get('/create_room/:name', (req, res) =>
{
  const { name } = req.params
  const prev = rooms.find(item => item.name === name)
  if (prev === undefined)
  {
    console.log(`Created room ${name}`);
    res.send("You created " + name)
    rooms.push(new Room(name))
  } else 
  {
    res.send(`${name} is already in the list`)
  }
})
app.get('/del_room/:name', (req, res) =>
{
  const { name } = req.params
  const index = rooms.findIndex(item => item.name === name)
  if (index !== -1)
  {
    console.log(`Deleted room: ${rooms[index].name}`);
    rooms.splice(index, 1)
    res.send("You deleted " + name)
  } else
  {
    res.send(`${name} was not found`)
  }
})

const myChat = new Chat("Main")
io.on('connection', socket =>
{
  socket.on('joinGame', (id, mode) =>
  {
    const room = rooms.find(item => item.id === id)
    if (room !== undefined)
    {
      console.log('Found room')
      room.add_socket(socket, mode)
    } else 
    {
      console.log(`Search ${id}, ${rooms.map(i => i.id).join(", ")}`);
    }
  })
  socket.on('joinChat', () => myChat.add(socket))
})


//listening
http.listen(appEnv.port, '0.0.0.0', () =>
{
  console.log(message.getWelcomeMessage() + appEnv.url)
})