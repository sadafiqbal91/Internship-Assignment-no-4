// components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Send, LogOut, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Chat({ pusher, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef();

  // Fetch history from MongoDB
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/messages/${room}`);
        setMessageList(response.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();
  }, [room]);

  // Real-time Message listener (Pusher)
  useEffect(() => {
    console.log("Subscribing to Pusher channel:", room);
    const channel = pusher.subscribe(room);
    
    channel.bind("receive_message", (data) => {
      console.log("Pusher Event Received:", data);
      if (data.author !== username) {
        setMessageList((list) => [...list, data]);
      }
    });

    return () => {
      console.log("Unsubscribing from channel:", room);
      pusher.unsubscribe(room);
    };
  }, [pusher, room, username]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      try {
        // Send to backend via HTTP POST
        await axios.post(`${BACKEND_URL}/send-message`, messageData);
        setMessageList((list) => [...list, messageData]);
        setCurrentMessage("");
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden border-border/50">
      <div className="p-4 border-b border-border/50 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageSquare className="text-primary w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Room: {room}</h2>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Chat • {username}
            </p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messageList.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex flex-col ${msg.author === username ? "items-end" : "items-start"}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-3 px-4 shadow-sm ${
              msg.author === username 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-surface border border-border/50 text-text-main rounded-tl-none"
            }`}>
              <p className="text-sm font-medium mb-1 opacity-70">{msg.author}</p>
              <p className="text-[15px]">{msg.message}</p>
              <p className="text-[10px] mt-1 opacity-50 text-right">{msg.time}</p>
            </div>
          </motion.div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white/5 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type your message..."
            className="input-field flex-1 h-12"
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="btn-primary w-12 h-12 flex items-center justify-center p-0 rounded-xl">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
