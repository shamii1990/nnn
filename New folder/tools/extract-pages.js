// tools/extract-pages.js
const { PDFDocument } = require('pdf-lib');

module.exports = async function extractPages(req, res) {
  try {
    const input = req.files && (req.files.file || (Array.isArray(req.files.files) && req.files.files[0]));
    if (!input) return res.status(400).json({ error: "Upload a PDF with field name 'file'." });

    const pagesField = req.body.pages || req.query.pages || '';
    if (!pagesField) return res.status(400).json({ error: "Provide pages as 'pages' form field, e.g. pages=1,3,5" });

    const pages = pagesField.split(',').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
    if (pages.length === 0) return res.status(400).json({ error: 'No valid pages provided.' });

    const pdf = await PDFDocument.load(input.data);
    const total = pdf.getPageCount();
    const zeroBased = pages.map(p => Math.max(0, Math.min(total - 1, p - 1)));

    const outPdf = await PDFDocument.create();
    const copied = await outPdf.copyPages(pdf, zeroBased);
    copied.forEach(p => outPdf.addPage(p));

    const out = await outPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="pages-${pagesField}.pdf"`);
    res.send(Buffer.from(out));
  } catch (err) {
    console.error('extract-pages err:', err);
    res.status(500).json({ error: err.message });
  }
};