// server.js

const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

// Parse JSON body from Facebook
app.use(express.json());

// Serve your static files (public/index.html etc.)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 1️⃣ VERIFY WEBHOOK (Facebook -> GET /webhook)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // must match Facebook dashboard

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    console.log("WEBHOOK VERIFICATION FAILED");
    res.sendStatus(403);
  }
});

// 2️⃣ RECEIVE MESSAGES (Facebook -> POST /webhook)
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("Webhook POST:", JSON.stringify(body, null, 2));

  // Make sure this is a page subscription
  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging && entry.messaging[0];
      if (!event) return;

      const senderPsid = event.sender && event.sender.id;

      // If the user sent a text message
      if (event.message && event.message.text) {
        const text = event.message.text;
        // Echo it back
        sendTextMessage(senderPsid, `You said: ${text}`);
      }
    });

    // Always respond 200 to Facebook quickly
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 3️⃣ SEND MESSAGE BACK TO USER
function sendTextMessage(psid, text) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  if (!PAGE_ACCESS_TOKEN) {
    console.error("PAGE_ACCESS_TOKEN is missing in environment!");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: { id: psid },
    message: { text },
  };

  axios
    .post(url, payload)
    .then(() => console.log("Message sent to", psid))
    .catch(err => {
      console.error(
        "Error sending message:",
        err.response?.data || err.message
      );
    });
}

// 4️⃣ START SERVER (Render sets process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
