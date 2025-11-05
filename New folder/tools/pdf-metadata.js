// tools/pdf-metadata.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function pdfMetadata(req, res) {
  try {
    const input = req.files && (req.files.file || (Array.isArray(req.files.files) && req.files.files[0]));
    if (!input) return res.status(400).json({ error: "Upload a PDF using field 'file'." });

    const pdf = await PDFDocument.load(input.data, { ignoreEncryption: true });
    const info = { pages: pdf.getPageCount() };
    try {
      if (pdf.getTitle) info.title = pdf.getTitle();
      if (pdf.getAuthor) info.author = pdf.getAuthor();
    } catch (e) {}

    res.json({ ok: true, info });
  } catch (err) {
    console.error('pdf-metadata err:', err);
    res.status(500).json({ error: err.message });
  }
};