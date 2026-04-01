import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import JoinChat from "./components/JoinChat";
import Chat from "./components/Chat";
import { AnimatePresence, motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io.connect(BACKEND_URL);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App w-full h-full flex flex-center p-4">
      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="join"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <JoinChat
              username={username}
              setUsername={setUsername}
              room={room}
              setRoom={setRoom}
              joinRoom={joinRoom}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl h-[85vh]"
          >
            <Chat socket={socket} username={username} room={room} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
