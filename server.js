// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Initialize express app
const app = express();
const PORT = 3000;

// To handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "src" folder and root
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "src")));

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});