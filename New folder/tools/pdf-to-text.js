// tools/pdf-to-text.js
const pdfParse = require('pdf-parse');

module.exports = async function pdfToText(req, res) {
  try {
    const files = [];
    if (req.files) {
      if (req.files.file) files.push(req.files.file);
      if (req.files.files) {
        if (Array.isArray(req.files.files)) files.push(...req.files.files);
        else files.push(req.files.files);
      }
    }
    if (files.length === 0) return res.status(400).json({ error: "Upload PDF(s) using 'file' or 'files' field." });

    const results = [];
    for (const f of files) {
      try {
        const data = await pdfParse(f.data);
        results.push({ name: f.name || f.md5 || 'file', text: data.text || '' });
      } catch (inner) {
        results.push({ name: f.name || 'file', error: inner.message });
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    console.error('pdf-to-text error:', err);
    res.status(500).json({ error: err.message });
  }
};