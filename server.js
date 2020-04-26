const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatterbox Bot';

// Run when client connects
io.on('connection', socket => {

    // Listen for username & room name from current user
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin( socket.id, username, room )

        socket.join( user.room );

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to Chatterbox!'));

        // Broadcast everyone (except current user) when current user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`));

        // Send user & room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chatMessage from current user
    // If current user emits a chatMessage to server, server emits this chatMessage as a message to everyone
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })


    // Runs when current user disconnects
    socket.on('disconnect', () => {
        const user = userLeave( socket.id );

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`));

            // Send user & room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

        
    });
});

const PORT = process.env.PORT || 3000;

server.listen( PORT, () => console.log(`Server running on port ${PORT}`)); 