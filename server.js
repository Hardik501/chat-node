const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatmessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUser} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = 'ChatCord Bot';

app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket =>{
    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //welcome message
        socket.emit('message',formatmessage(botName,'Welcome to ChatCard'));
        
        //broadcast when user connects except to user
        socket.broadcast.to(user.room).emit('message',formatmessage(botName,`A ${user.username} has joined the chat`));
        
        // send users and rom info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUser(user.room)
        });
        
    });

    
    //run when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatmessage(botName,`${user.username} has left the chat`));
        }
        // send users and rom info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUser(user.room)
        });
    });

    //Listen for chatmessage
    socket.on('chatMessage',(msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatmessage(user.username, msg));
    });

});

const PORT = 3000 || process.env.PORT;

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
