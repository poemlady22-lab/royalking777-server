const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Default homepage (optional)
app.get("/", (req, res) => {
    res.send("RoyalKing777 Bot Server is running");
});

// 1️⃣ Facebook Webhook Verification
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

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

// 2️⃣ Facebook Will Send Messages Here
app.post("/webhook", (req, res) => {
    console.log("Webhook POST:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
