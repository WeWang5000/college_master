// openai-proxy/index.js
const express = require("express");
const WebSocket = require("ws");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/connect", (req, res) => {
  const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  ws.on("open", () => {
    console.log("Proxy WebSocket connected to OpenAI");
    req.on("data", (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  });

  ws.on("message", (message) => {
    res.write(message); // Send the message to the client
  });

  ws.on("close", () => {
    res.end(); // Close the response when the WebSocket closes
    console.log("Proxy WebSocket closed");
  });

  ws.on("error", (error) => console.error("WebSocket error:", error));
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
