const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// VERIFY WEBHOOK (Facebook)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// RECEIVE FACEBOOK MESSAGES
app.post("/webhook", (req, res) => {
  console.log("Facebook webhook event:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// ROOT PAGE
app.get("/", (req, res) => {
  res.send("RoyalKing777 Bot Server is running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
