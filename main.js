// main.js
document.getElementById("createRoomTab").onclick = () => {
    document.getElementById("createRoom").classList.remove("d-none");
    document.getElementById("joinRoom").classList.add("d-none");
    document.getElementById("createRoomTab").classList.add("active");
    document.getElementById("joinRoomTab").classList.remove("active");
};

document.getElementById("joinRoomTab").onclick = () => {
    document.getElementById("joinRoom").classList.remove("d-none");
    document.getElementById("createRoom").classList.add("d-none");
    document.getElementById("joinRoomTab").classList.add("active");
    document.getElementById("createRoomTab").classList.remove("active");
};

document.getElementById("createRoomSubmit").onclick = async () => {
    const roomName = document.getElementById("roomName").value;
    const userName = document.getElementById("userNameCreate").value;
    const numPlayers = document.getElementById("numPlayers").value;

    const response = await fetch("https://python-backend-cqck.onrender.com/create_room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_name: roomName, user_name: userName, num_players: numPlayers })
    });

    const data = await response.json();
    enterRoom(data.room_code, userName);
};

document.getElementById("joinRoomSubmit").onclick = async () => {
    const roomCode = document.getElementById("roomCode").value;
    const userName = document.getElementById("userNameJoin").value;

    const response = await fetch("https://python-backend-cqck.onrender.com/join_room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode, user_name: userName })
    });

    if (response.ok) {
        enterRoom(roomCode, userName);
    } else {
        alert("Room not found or full");
    }
};

const enterRoom = (roomCode, userName) => {
    document.getElementById("displayRoomCode").innerText = roomCode;
    document.getElementById("createRoom").classList.add("d-none");
    document.getElementById("joinRoom").classList.add("d-none");
    document.getElementById("room").classList.remove("d-none");

    const ws = new WebSocket(`wss://python-backend-cqck.onrender.com/ws/${roomCode}/${userName}`);

    ws.onmessage = (event) => {
        const messagesDiv = document.getElementById("messages");
        const messageData = JSON.parse(event.data);
        const message = document.createElement("div");
        message.classList.add("message");
        if (messageData.user === userName) {
            message.classList.add("my-message");
        } else {
            message.classList.add("other-message");
        }
        message.innerText = `${messageData.user}: ${messageData.text}`;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;  // Auto scroll to the bottom
    };

    document.getElementById("sendMessage").onclick = () => {
        const messageInput = document.getElementById("messageInput");
        const message = {
            user: userName,
            text: messageInput.value
        };

        // Display the message immediately
        const messagesDiv = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "my-message");
        messageElement.innerText = `${message.user}: ${message.text}`;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;  // Auto scroll to the bottom

        // Send the message via WebSocket
        ws.send(JSON.stringify(message));

        messageInput.value = '';
    };
};
