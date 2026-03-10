// Simple HTTP server to serve frontend files
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FRONTEND_DIR = __dirname;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Default to index.html
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(FRONTEND_DIR, filePath);

  // Prevent directory traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html for unknown routes (SPA behavior)
      if (err.code === "ENOENT") {
        fs.readFile(path.join(FRONTEND_DIR, "index.html"), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end("Not Found");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      } else {
        res.writeHead(500);
        res.end("Server Error");
      }
      return;
    }

    // Determine content type
    const ext = path.extname(filePath);
    let contentType = "text/plain";
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".js") contentType = "application/javascript";
    else if (ext === ".json") contentType = "application/json";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, "localhost", () => {
  console.log(`✅ Frontend server running on http://localhost:${PORT}`);
  console.log(`🔗 Backend API: http://localhost:5000/api`);
  console.log(`📝 Open http://localhost:${PORT} in your browser`);
});
