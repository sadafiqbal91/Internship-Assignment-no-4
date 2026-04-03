// App.jsx
import React, { useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import JoinChat from "./components/JoinChat";
import Chat from "./components/Chat";
import { AnimatePresence, motion } from "framer-motion";

// Pusher Initialization - Done once outside the component
const PUSHER_KEY = "cceca38da89af62b447c";
const PUSHER_CLUSTER = "ap2";
const BACKEND_URL = "https://internship-assignment-no-4.vercel.app";

const pusherClient = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
});

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
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
            <Chat pusher={pusherClient} username={username} room={room} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
