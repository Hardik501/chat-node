const socket = io();
const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

//Get username and room from URL
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
});


//join chatroom
socket.emit('joinRoom',{username, room});

// Message from server
socket.on('message', message=>{
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit
chatform.addEventListener('submit',(e)=>{
    e.preventDefault();

    //get message element text
    const msg = e.target.elements.msg.value;
    //emit message to server
    socket.emit('chatMessage',msg);
    //clear input
    e.target.elements.msg.value = ``;
})


//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// get all user and room
socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
})

function outputRoomName(room){
    const RoomName = document.getElementById('room-name');
    RoomName.innerText = room;
}

function outputUsers(users){
    const userid = document.getElementById('users');
    userid.innerHTML =`
    ${users.map(user =>`<li>${user.username}</li>`).join('')}
    `;
}