// server.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

// Parse JSON body
app.use(bodyParser.json());

// ENV VARIABLES FROM RENDER
// Make sure these two are set in Render:
// VERIFY_TOKEN       = royalking777
// PAGE_ACCESS_TOKEN  = <your long page token>
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// 1) VERIFY WEBHOOK (Facebook GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // This is the call from Facebook to verify your webhook
  if (mode === "subscribe") {
    if (token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      return res.status(200).send(challenge);
    } else {
      console.log("WEBHOOK VERIFICATION FAILED (wrong token)");
      return res.sendStatus(403);
    }
  }

  // Normal browser visit: just show a simple message (no error)
  return res.status(200).send("Facebook webhook endpoint is working.");
});

// 2) RECEIVE MESSAGES (Facebook POST)
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("🔥 Incoming webhook:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging && entry.messaging[0];
      if (!event) return;

      const senderId = event.sender.id;

      // When user sends a text message
      if (event.message && event.message.text) {
        const userText = event.message.text;
        console.log("User said:", userText);

        // Reply to user
        callSendAPI(senderId, "Hello 👋 I received: " + userText);
      }
    });

    // Must respond 200 quickly
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
});

// 3) FUNCTION TO SEND MESSAGE BACK
function callSendAPI(senderPsid, responseText) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ PAGE_ACCESS_TOKEN is not set in environment!");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: senderPsid },
    message: { text: responseText }
  };

  axios
    .post(url, payload)
    .then(() => console.log("✅ Message sent to", senderPsid))
    .catch(err => {
      console.error("❌ Error sending message:", err.response?.data || err.message);
    });
}

// START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
