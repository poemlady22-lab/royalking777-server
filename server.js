// server.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

// parse JSON body
app.use(bodyParser.json());

// ENV VARIABLES FROM RENDER
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;        // royalking777
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// 1) VERIFY WEBHOOK (FACEBOOK CALLS THIS WITH GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("WEBHOOK VERIFICATION FAILED");
  return res.sendStatus(403);
});

// 2) RECEIVE MESSAGES (FACEBOOK CALLS THIS WITH POST)
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("🔥 Incoming webhook:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging && entry.messaging[0];
      if (!event) return;

      const senderId = event.sender.id;

      // when user sends a text message
      if (event.message && event.message.text) {
        const userText = event.message.text;
        console.log("User said:", userText);

        // reply to user
        callSendAPI(senderId, "Hello 👋 I received: " + userText);
      }
    });

    // must respond 200 quickly
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// 3) FUNCTION TO SEND MESSAGE BACK
function callSendAPI(senderPsid, responseText) {
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
