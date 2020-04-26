const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room name from URL by QS library
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room })

// Get room & users
socket.on('roomUsers', ( {room, users} ) => {
    outputRoomName(room);
    outputUsers(users);
})

// Listen for message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    // If the total scrollable height is 150px, then scroll 150px from top (scroll to bottom)
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    // Add a class named 'message' to this new 'div' 
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    // Add this new div variable to the class named 'chat-messages'
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to dom
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`
}