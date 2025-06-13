window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const usernameInput = document.getElementById("usernameInput");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const chatMessages = document.getElementById("chatMessages");
  const typingIndicator = document.getElementById("typingIndicator");
  const onlineUsers = document.getElementById("onlineUsers");

  // Connect to Socket.io server
  const socket = io();

  let typingTimeout;
  const TYPING_TIMEOUT = 2000; // 2 seconds

  // Enable message input when username is set
  usernameInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && usernameInput.value.trim()) {
      setUsername();
    }
  });

  function setUsername() {
    const username = usernameInput.value.trim();
    if (username) {
      socket.emit("new-user", username);
      usernameInput.disabled = true;
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
    }
  }

  // Send message when button is clicked or Enter is pressed
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Handle typing indicator
  messageInput.addEventListener("input", () => {
    socket.emit("typing");

    // Clear previous timeout
    clearTimeout(typingTimeout);

    // Set a new timeout
    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing");
    }, TYPING_TIMEOUT);
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      // Emit the message to the server
      socket.emit("send-chat-message", message);

      // Create and display the message locally
      addMessage("You", message, true);

      // Clear the input
      messageInput.value = "";
      messageInput.focus();

      // Notify server that user stopped typing
      socket.emit("stop-typing");
    }
  }

  // Add a message to the chat UI
  function addMessage(username, message, isSender = false) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    if (isSender) {
      messageElement.classList.add("sent");
    } else {
      messageElement.classList.add("received");
    }

    messageElement.innerHTML = `
      <div class="username">${username}</div>
      <div class="text">${message}</div>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Socket.io event listeners

  // When receiving a chat message
  socket.on("chat-message", (data) => {
    addMessage(data.username, data.message);
  });

  // When a user connects
  socket.on("user-connected", (username) => {
    addSystemMessage(`${username} connected`);
  });

  // When a user disconnects
  socket.on("user-disconnected", (username) => {
    addSystemMessage(`${username} disconnected`);
  });

  // When a user is typing
  socket.on("user-typing", (username) => {
    typingIndicator.textContent = `${username} is typing...`;
  });

  // When a user stops typing
  socket.on("user-stopped-typing", () => {
    typingIndicator.textContent = "";
  });

  // When the online users list updates
  socket.on("update-users", (users) => {
    const count = Object.keys(users).length;
    onlineUsers.innerHTML = `<span>Online: ${count}</span>`;
  });

  // Helper function for system messages
  function addSystemMessage(text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "system");
    messageElement.innerHTML = `<div class="text">${text}</div>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
