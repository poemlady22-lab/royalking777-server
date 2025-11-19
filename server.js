const express = require("express");
const path = require("path");
const app = express();

// 1) Serve everything in /public (where index.html lives)
app.use(express.static(path.join(__dirname, "public")));

// 2) Root route → send index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 3) Use the PORT Render gives us
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
