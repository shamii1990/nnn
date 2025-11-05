// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, ".")));

app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 200 * 1024 * 1024 },
    abortOnLimit: true
  })
);

const toolsDir = path.join(__dirname, "tools");

app.get("/api/tools", (req, res) => {
  try {
    if (!fs.existsSync(toolsDir)) return res.json({ ok: true, tools: [] });
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));
    const tools = files.map(f => f.replace(/\\.js$/, ""));
    res.json({ ok: true, tools });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/:tool', async (req, res) => {
  const { tool } = req.params;
  const toolFile = path.join(toolsDir, `${tool}.js`);
  if (!fs.existsSync(toolFile)) {
    return res.status(404).json({ error: `Tool '${tool}' not implemented on server` });
  }

  try {
    delete require.cache[require.resolve(toolFile)];
    const handler = require(toolFile);
    if (typeof handler !== 'function') return res.status(500).json({ error: 'Tool file must export a function(req, res)' });
    await handler(req, res);
  } catch (err) {
    console.error('Tool error:', tool, err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ PDFMaster-Pro running on port ${PORT}`));
