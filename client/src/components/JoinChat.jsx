// components/JoinChat.jsx
import React from "react";
import { MessageSquare, DoorOpen, User } from "lucide-react";

function JoinChat({ username, setUsername, room, setRoom, joinRoom }) {
  const handleKey = (e) => {
    if (e.key === "Enter") joinRoom();
  };

  return (
    <div className="glass-card p-6 sm:p-10 w-full max-w-[400px] flex flex-col gap-6 items-center mx-4">
      <div className="bg-primary/20 p-4 rounded-2xl mb-2">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">Connect & Chat</h1>
        <p className="text-text-muted text-sm px-2">Real-time messaging simplified.</p>
      </div>
      
      <div className="w-full flex flex-col gap-5">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Your Name"
            className="input-field w-full pl-12"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKey}
          />
        </div>
        
        <div className="relative">
          <DoorOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Room ID"
            className="input-field w-full pl-12"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onKeyPress={handleKey}
          />
        </div>

        <button 
          onClick={joinRoom}
          className="btn-primary w-full h-14 flex items-center justify-center gap-2 mt-4 text-lg"
        >
          Join Room
        </button>
      </div>

      <p className="text-[10px] text-text-muted mt-4 uppercase tracking-widest opacity-50">
        MERN Stack • Pusher • Real-time
      </p>
    </div>
  );
}

export default JoinChat;
