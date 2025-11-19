const express = require("express");
const path = require("path");
const app = express();

// Parse incoming JSON (needed for webhook POST)
app.use(express.json());

// 1) Serve everything in /public
app.use(express.static(path.join(__dirname, "public")));

// 2) Root route → send index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==== FACEBOOK WEBHOOK VERIFY ====
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;  // From Render

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully!");
        return res.status(200).send(challenge);
    }

    console.log("Webhook verification failed!");
    res.sendStatus(403);
});

// ==== FACEBOOK WEBHOOK EVENTS ====
app.post("/webhook", (req, res) => {
    console.log("Webhook event received:", req.body);
    res.status(200).send("EVENT_RECEIVED");
});

// 3) Use the PORT Render gives us
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
