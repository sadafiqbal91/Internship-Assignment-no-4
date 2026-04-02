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

let dbError = null;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  dbError = "FATAL: MONGODB_URI is missing in Vercel Environment Variables.";
  console.error(dbError);
} else {
  mongoose.connect(MONGODB_URI, {
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
    dbError = null;
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err.message);
    dbError = err.message;
  });
}

// Health Check Route
app.get("/", (req, res) => {
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const dbStatus = states[mongoose.connection.readyState] || "Unknown";
  
  res.send(`
    <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white; min-height: 100vh;">
      <h1 style="color: #38bdf8;">Backend Status Page</h1>
      <p>Server Status: <b style="color: #4ade80;">Online ✅</b></p>
      <p>MongoDB Status: <b style="color: ${mongoose.connection.readyState === 1 ? '#4ade80' : '#f87171'}">${dbStatus} (Code: ${mongoose.connection.readyState})</b></p>
      <p>Pusher Status: <b style="color: #4ade80;">Configured ✅</b></p>
      
      ${dbError ? `<div style="background: #450a0a; border: 1px solid #f87171; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h3 style="color: #f87171; margin-top: 0;">MongoDB Error Log:</h3>
        <p style="font-family: monospace; word-break: break-all;">${dbError}</p>
        <p><small>Suggestion: Check your Password, Database User Roles (must have read/write access), and IP Access List (0.0.0.0/0).</small></p>
      </div>` : ''}
      
      <hr style="border: 0.5px solid #334155; margin: 30px 0;" />
      <p><small style="color: #94a3b8;">If status is 1 (Connected), your Chat App is 100% Ready.</small></p>
    </div>
  `);
});

// Pusher Setup
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// API to Send Message
app.post("/send-message", async (req, res) => {
  try {
    const data = req.body; 
    const newMessage = new Message(data);
    await newMessage.save();
    pusher.trigger(data.room, "receive_message", data);
    res.status(200).send("Message Sent");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(err.message);
  }
});

// API for Chat history
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

const PORT = process.env.PORT || 5000;
const BACKEND_URL = "https://internship-assignment-no-4.vercel.app";
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
  });
}

module.exports = app;
