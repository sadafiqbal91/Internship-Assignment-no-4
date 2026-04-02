// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Pusher = require("pusher");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const dbStatus = states[mongoose.connection.readyState] || "Unknown";
  
  res.send(`
    <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white;">
      <h1 style="color: #38bdf8;">Backend Status Page</h1>
      <p>Server Status: <b style="color: #4ade80;">Online ✅</b></p>
      <p>MongoDB Status: <b style="color: ${mongoose.connection.readyState === 1 ? '#4ade80' : '#f87171'}">${dbStatus} (Code: ${mongoose.connection.readyState})</b></p>
      <p>Pusher Status: <b style="color: #4ade80;">Configured ✅</b></p>
      <hr style="border: 0.5px solid #334155; margin: 20px 0;" />
      <p><small style="color: #94a3b8;">If MongoDB is stuck on 'Connecting', check your Password and Network Access (Allow 0.0.0.0/0).</small></p>
    </div>
  `);
});

// Pusher Setup (Yeh details aapko Pusher Dashboard se milengi)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables!");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => {
    console.error("CRITICAL: MongoDB connection error details:", err.message);
    console.error("Suggestion: Check your MongoDB Atlas Network Access (IP Whitelist). Must be 0.0.0.0/0 for Vercel.");
  });

// API to Send Message (Replaces socket.on("send_message"))
app.post("/send-message", async (req, res) => {
  try {
    const data = req.body; // { room, author, message, time }
    
    // 1. Save to MongoDB
    const newMessage = new Message(data);
    await newMessage.save();

    // 2. Trigger Pusher Event (Real-time update)
    // "room" will be the channel name, "receive_message" will be the event
    pusher.trigger(data.room, "receive_message", data);

    res.status(200).send("Message Sent");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(err);
  }
});

// API for Chat history (Existing)
app.get("/messages/:room", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected yet" });
    }
    const messages = await Message.find({ room: req.params.room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err.message);
    res.status(500).json({ error: "Error fetching messages: " + err.message });
  }
});

// For Vercel, we don't need a separate http server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
