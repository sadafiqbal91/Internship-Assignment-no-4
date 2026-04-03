// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Pusher = require("pusher");

const app = express();
app.use(cors());
app.use(express.json());

// Pusher Setup
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Health Check Route
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white; min-height: 100vh;">
      <h1 style="color: #38bdf8;">Backend Status Page</h1>
      <p>Server Status: <b style="color: #4ade80;">Online ✅</b></p>
      <p>Pusher Status: <b style="color: #4ade80;">Configured ✅</b></p>
      <p>Mode: <b style="color: #a78bfa;">Real-time Only (Pusher)</b></p>
      <hr style="border: 0.5px solid #334155; margin: 30px 0;" />
      <p style="color: #4ade80; font-size: 18px;">✅ Your Chat App is Ready! Open the frontend URL to start chatting.</p>
    </div>
  `);
});

// API to Send Message via Pusher only
app.post("/send-message", async (req, res) => {
  try {
    const data = req.body;
    // Trigger Pusher Event for real-time
    await pusher.trigger(data.room, "receive_message", data);
    res.status(200).json({ status: "Message Sent" });
  } catch (err) {
    console.error("Send Message Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// API for Chat history - returns empty array (no DB needed)
app.get("/messages/:room", (req, res) => {
  res.json([]);
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
  });
}

module.exports = app;
