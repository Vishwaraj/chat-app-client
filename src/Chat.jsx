import React, { useEffect, useState, useRef } from "react";

// ChatMessage component to render individual chat messages
// ChatMessage component to render individual chat messages
const ChatMessage = ({ message, clientId }) => {
  const receivedMessage = message.sentByClient && message.clientId !== clientId;
  console.log("messages", message); // Check if message was received by the client

  return (
    <div style={{ textAlign: receivedMessage ? "right" : "left" }}>
      <div
        style={{
          display: "inline-block",
          padding: "8px 12px",
          margin: "4px",
          borderRadius: "8px",
          backgroundColor: !receivedMessage ? "#f8f9fa" : "#007bff",
          color: !receivedMessage ? "black" : "white",
        }}
      >
        {message.content}
      </div>
    </div>
  );
};

// ChatInput component to handle message input and sending
const ChatInput = ({ sendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim() !== "") {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
};

// ChatApp component to manage WebSocket connection and chat state
const ChatApp = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clientId, setClientId] = useState(null); // State to store the client ID
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Establish WebSocket connection
    const newSocket = new WebSocket("ws://localhost:8080");

    // Set up event listeners
    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
    };

    newSocket.onmessage = (event) => {
      console.log("Received message:", event.data);
      // Parse message data as JSON
      const message = JSON.parse(event.data);
      // If a unique client ID is received, store it in state
      if (message.clientId) {
        setClientId(message.clientId);
      }
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Store the socket in state
    setSocket(newSocket);

    // Clean up function to close the socket when the component unmounts
    return () => {
      newSocket.close();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  // Function to send message to server
  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Send message as JSON string
      socket.send(
        JSON.stringify({
          content: message,
          sentByClient: true,
          clientId: clientId, // Include client's unique identifier
        })
      );
      // Add sent message to chat UI
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message, sentByClient: true },
      ]);

      // No need to add sent message to chat UI here
      scrollToBottom();
    }
  };

  // Scroll to bottom of chat messages container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render chat UI
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh", // Set the height of the container to full viewport height
      }}
    >
      <h1>Chat App</h1>
      <div style={{ overflowY: "auto", maxHeight: "300px" }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} clientId={clientId} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput sendMessage={sendMessage} />
    </div>
  );
};

export default ChatApp;
