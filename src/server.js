const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Main test route
app.get("/", (req, res) => {
  res.send("Wauza Utamutz Backend Running 🚀");
});

// API test route
app.get("/api", (req, res) => {
  res.send("API working ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});