const express = require("express");
const app = express();

app.get("/hello", (req, res) => {
  res.json({ message: "Hello from Node.js frontend!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});

